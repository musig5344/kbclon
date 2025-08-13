/**
 * Secure Session Manager
 * 
 * 뱅킹 애플리케이션을 위한 안전한 세션 관리
 * - 세션 생성, 검증, 무효화
 * - 다중 디바이스 세션 관리
 * - 자동 만료 및 갱신
 * - 보안 이벤트 감지
 * - 동시 세션 제한
 */

import CryptoJS from 'crypto-js';

// 세션 상태
export type SessionStatus = 'active' | 'expired' | 'invalidated' | 'suspended' | 'terminated';

// 세션 데이터 인터페이스
export interface SessionData {
  sessionId: string;
  userId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: number;
  lastAccessedAt: number;
  expiresAt: number;
  status: SessionStatus;
  permissions: string[];
  loginMethod: 'password' | 'biometric' | 'otp' | 'certificate';
  riskScore: number;
  metadata?: {
    location?: string;
    timezone?: string;
    language?: string;
    screenResolution?: string;
    [key: string]: any;
  };
}

// 세션 설정
export interface SessionConfig {
  maxAge: number; // 세션 최대 유지 시간 (밀리초)
  idleTimeout: number; // 비활성 시간 초과 (밀리초)
  maxConcurrentSessions: number; // 사용자당 최대 동시 세션
  refreshThreshold: number; // 자동 갱신 임계값 (밀리초)
  securityLevel: 'basic' | 'enhanced' | 'maximum';
  enableDeviceTracking: boolean;
  enableLocationTracking: boolean;
  requireSecureTransport: boolean;
  ipBindingEnabled: boolean;
  enableSessionFixationProtection: boolean;
}

// 세션 이벤트
export interface SessionEvent {
  type: 'created' | 'accessed' | 'refreshed' | 'expired' | 'invalidated' | 'suspicious';
  sessionId: string;
  userId: string;
  timestamp: number;
  details: Record<string, any>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// 의심스러운 활동 감지 결과
export interface SuspiciousActivity {
  detected: boolean;
  reasons: string[];
  riskScore: number;
  recommendedActions: string[];
}

class SessionManager {
  private sessions: Map<string, SessionData> = new Map();
  private userSessions: Map<string, Set<string>> = new Map();
  private sessionEvents: SessionEvent[] = [];
  private config: SessionConfig;
  private readonly SECRET_KEY: string;

  constructor(config?: Partial<SessionConfig>) {
    this.config = {
      maxAge: 8 * 60 * 60 * 1000, // 8시간
      idleTimeout: 30 * 60 * 1000, // 30분
      maxConcurrentSessions: 3,
      refreshThreshold: 15 * 60 * 1000, // 15분
      securityLevel: 'enhanced',
      enableDeviceTracking: true,
      enableLocationTracking: true,
      requireSecureTransport: true,
      ipBindingEnabled: true,
      enableSessionFixationProtection: true,
      ...config
    };

    this.SECRET_KEY = this.generateSecretKey();
    this.startCleanupTimer();
  }

  /**
   * 새 세션 생성
   */
  async createSession(
    userId: string,
    loginData: {
      ipAddress: string;
      userAgent: string;
      deviceId?: string;
      loginMethod: SessionData['loginMethod'];
      permissions?: string[];
      metadata?: SessionData['metadata'];
    }
  ): Promise<{ session: SessionData; warnings: string[] }> {
    const warnings: string[] = [];
    const now = Date.now();

    // 디바이스 ID 생성 또는 검증
    const deviceId = loginData.deviceId || this.generateDeviceId(loginData.userAgent, loginData.ipAddress);

    // 기존 세션 정리
    const existingSessions = this.getUserSessions(userId);
    if (existingSessions.length >= this.config.maxConcurrentSessions) {
      warnings.push('Maximum concurrent sessions reached - oldest session will be terminated');
      await this.terminateOldestSession(userId);
    }

    // 의심스러운 활동 감지
    const suspiciousActivity = await this.detectSuspiciousActivity(userId, loginData);
    if (suspiciousActivity.detected) {
      warnings.push(...suspiciousActivity.reasons);
    }

    // 세션 ID 생성
    const sessionId = this.generateSecureSessionId();

    // 세션 데이터 생성
    const session: SessionData = {
      sessionId,
      userId,
      deviceId,
      ipAddress: loginData.ipAddress,
      userAgent: loginData.userAgent,
      createdAt: now,
      lastAccessedAt: now,
      expiresAt: now + this.config.maxAge,
      status: 'active',
      permissions: loginData.permissions || [],
      loginMethod: loginData.loginMethod,
      riskScore: suspiciousActivity.riskScore,
      metadata: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator?.language || 'ko-KR',
        ...loginData.metadata
      }
    };

    // 세션 저장
    this.sessions.set(sessionId, session);
    
    // 사용자별 세션 추가
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    this.userSessions.get(userId)!.add(sessionId);

    // 이벤트 기록
    this.recordEvent({
      type: 'created',
      sessionId,
      userId,
      timestamp: now,
      details: {
        deviceId,
        ipAddress: loginData.ipAddress,
        loginMethod: loginData.loginMethod
      },
      riskLevel: this.calculateRiskLevel(suspiciousActivity.riskScore)
    });

    return { session, warnings };
  }

  /**
   * 세션 검증
   */
  async validateSession(
    sessionId: string,
    currentRequest: {
      ipAddress: string;
      userAgent: string;
      timestamp?: number;
    }
  ): Promise<{ isValid: boolean; session?: SessionData; reason?: string }> {
    const session = this.sessions.get(sessionId);
    const now = currentRequest.timestamp || Date.now();

    if (!session) {
      return { isValid: false, reason: 'Session not found' };
    }

    // 세션 상태 확인
    if (session.status !== 'active') {
      return { isValid: false, reason: `Session status: ${session.status}` };
    }

    // 만료 시간 확인
    if (now > session.expiresAt) {
      session.status = 'expired';
      this.recordEvent({
        type: 'expired',
        sessionId,
        userId: session.userId,
        timestamp: now,
        details: { reason: 'Session expired' },
        riskLevel: 'low'
      });
      return { isValid: false, reason: 'Session expired' };
    }

    // 비활성 시간 초과 확인
    if (now - session.lastAccessedAt > this.config.idleTimeout) {
      session.status = 'expired';
      this.recordEvent({
        type: 'expired',
        sessionId,
        userId: session.userId,
        timestamp: now,
        details: { reason: 'Idle timeout' },
        riskLevel: 'low'
      });
      return { isValid: false, reason: 'Idle timeout' };
    }

    // IP 바인딩 확인
    if (this.config.ipBindingEnabled && session.ipAddress !== currentRequest.ipAddress) {
      this.recordEvent({
        type: 'suspicious',
        sessionId,
        userId: session.userId,
        timestamp: now,
        details: { 
          reason: 'IP address mismatch',
          originalIP: session.ipAddress,
          currentIP: currentRequest.ipAddress
        },
        riskLevel: 'high'
      });
      
      if (this.config.securityLevel === 'maximum') {
        session.status = 'suspended';
        return { isValid: false, reason: 'IP address mismatch' };
      }
    }

    // User-Agent 변경 확인
    if (session.userAgent !== currentRequest.userAgent) {
      this.recordEvent({
        type: 'suspicious',
        sessionId,
        userId: session.userId,
        timestamp: now,
        details: { 
          reason: 'User agent mismatch',
          originalUA: session.userAgent,
          currentUA: currentRequest.userAgent
        },
        riskLevel: 'medium'
      });
    }

    // 세션 갱신
    await this.refreshSession(sessionId, now);

    return { isValid: true, session };
  }

  /**
   * 세션 갱신
   */
  async refreshSession(sessionId: string, timestamp?: number): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    const now = timestamp || Date.now();

    if (!session || session.status !== 'active') {
      return false;
    }

    // 갱신 임계값 확인
    if (session.expiresAt - now < this.config.refreshThreshold) {
      session.expiresAt = now + this.config.maxAge;
      
      this.recordEvent({
        type: 'refreshed',
        sessionId,
        userId: session.userId,
        timestamp: now,
        details: { newExpiresAt: session.expiresAt },
        riskLevel: 'low'
      });
    }

    session.lastAccessedAt = now;
    
    this.recordEvent({
      type: 'accessed',
      sessionId,
      userId: session.userId,
      timestamp: now,
      details: {},
      riskLevel: 'low'
    });

    return true;
  }

  /**
   * 세션 무효화
   */
  async invalidateSession(sessionId: string, reason: string = 'Manual invalidation'): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return false;
    }

    session.status = 'invalidated';
    
    // 사용자별 세션에서 제거
    const userSessions = this.userSessions.get(session.userId);
    if (userSessions) {
      userSessions.delete(sessionId);
    }

    this.recordEvent({
      type: 'invalidated',
      sessionId,
      userId: session.userId,
      timestamp: Date.now(),
      details: { reason },
      riskLevel: 'low'
    });

    return true;
  }

  /**
   * 사용자의 모든 세션 무효화
   */
  async invalidateAllUserSessions(userId: string, excludeSessionId?: string): Promise<number> {
    const userSessions = this.userSessions.get(userId);
    if (!userSessions) {
      return 0;
    }

    let invalidatedCount = 0;
    for (const sessionId of Array.from(userSessions)) {
      if (sessionId !== excludeSessionId) {
        const success = await this.invalidateSession(sessionId, 'All sessions invalidated');
        if (success) {
          invalidatedCount++;
        }
      }
    }

    return invalidatedCount;
  }

  /**
   * 의심스러운 활동 감지
   */
  private async detectSuspiciousActivity(
    userId: string,
    loginData: {
      ipAddress: string;
      userAgent: string;
      deviceId?: string;
      metadata?: any;
    }
  ): Promise<SuspiciousActivity> {
    const reasons: string[] = [];
    const recommendedActions: string[] = [];
    let riskScore = 0;

    // 기존 세션들과 비교
    const existingSessions = this.getUserSessions(userId);
    
    // 새로운 디바이스 감지
    const knownDevices = existingSessions.map(s => s.deviceId);
    if (loginData.deviceId && !knownDevices.includes(loginData.deviceId)) {
      reasons.push('Login from new device');
      riskScore += 30;
      recommendedActions.push('Send device verification notification');
    }

    // 새로운 IP 주소 감지
    const knownIPs = existingSessions.map(s => s.ipAddress);
    if (!knownIPs.includes(loginData.ipAddress)) {
      reasons.push('Login from new IP address');
      riskScore += 20;
      recommendedActions.push('Verify location');
    }

    // 짧은 시간 내 다중 로그인 시도
    const recentLogins = this.sessionEvents.filter(event => 
      event.userId === userId && 
      event.type === 'created' && 
      Date.now() - event.timestamp < 5 * 60 * 1000 // 5분
    );
    
    if (recentLogins.length > 3) {
      reasons.push('Multiple login attempts in short time');
      riskScore += 40;
      recommendedActions.push('Require additional authentication');
    }

    // 비정상적인 User-Agent
    if (loginData.userAgent.includes('bot') || loginData.userAgent.includes('crawler')) {
      reasons.push('Suspicious user agent detected');
      riskScore += 50;
      recommendedActions.push('Block automated access');
    }

    // 지역 기반 위험도 (IP 기반 간단한 예시)
    if (this.isHighRiskLocation(loginData.ipAddress)) {
      reasons.push('Login from high-risk location');
      riskScore += 35;
      recommendedActions.push('Require step-up authentication');
    }

    return {
      detected: reasons.length > 0,
      reasons,
      riskScore: Math.min(riskScore, 100),
      recommendedActions
    };
  }

  /**
   * 고위험 지역 확인 (간단한 예시)
   */
  private isHighRiskLocation(ipAddress: string): boolean {
    // 실제 구현에서는 IP 지역 정보 서비스 사용
    // 여기서는 간단한 예시로 특정 패턴 확인
    const highRiskPatterns = [
      /^10\./, // 내부 네트워크
      /^192\.168\./, // 사설 네트워크
      /^172\./ // 사설 네트워크
    ];
    
    // 실제로는 지역 기반 위험도 데이터베이스 사용
    return false;
  }

  /**
   * 위험도 레벨 계산
   */
  private calculateRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 30) return 'medium';
    return 'low';
  }

  /**
   * 보안 세션 ID 생성
   */
  private generateSecureSessionId(): string {
    const timestamp = Date.now().toString();
    const randomBytes = CryptoJS.lib.WordArray.random(32).toString();
    const data = `${timestamp}-${randomBytes}`;
    
    return CryptoJS.SHA256(data + this.SECRET_KEY).toString();
  }

  /**
   * 디바이스 ID 생성
   */
  private generateDeviceId(userAgent: string, ipAddress: string): string {
    const deviceData = `${userAgent}-${ipAddress}`;
    return CryptoJS.SHA256(deviceData).toString().substring(0, 16);
  }

  /**
   * 시크릿 키 생성
   */
  private generateSecretKey(): string {
    if (process.env.SESSION_SECRET) {
      return process.env.SESSION_SECRET;
    }

    // 런타임 키 생성 (실제 환경에서는 고정된 키 사용 권장)
    const randomData = [
      Date.now().toString(),
      Math.random().toString(),
      typeof window !== 'undefined' ? window.location.hostname : 'server'
    ].join('|');

    return CryptoJS.SHA256(randomData).toString();
  }

  /**
   * 사용자 세션 목록 조회
   */
  getUserSessions(userId: string): SessionData[] {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) {
      return [];
    }

    return Array.from(sessionIds)
      .map(id => this.sessions.get(id))
      .filter((session): session is SessionData => session !== undefined)
      .sort((a, b) => b.lastAccessedAt - a.lastAccessedAt);
  }

  /**
   * 세션 통계 조회
   */
  getSessionStatistics(): {
    total: number;
    active: number;
    expired: number;
    byStatus: Record<SessionStatus, number>;
    averageSessionDuration: number;
    highRiskSessions: number;
  } {
    const stats = {
      total: this.sessions.size,
      active: 0,
      expired: 0,
      byStatus: {} as Record<SessionStatus, number>,
      averageSessionDuration: 0,
      highRiskSessions: 0
    };

    let totalDuration = 0;
    const now = Date.now();

    for (const session of this.sessions.values()) {
      stats.byStatus[session.status] = (stats.byStatus[session.status] || 0) + 1;
      
      if (session.status === 'active') {
        stats.active++;
      } else if (session.status === 'expired') {
        stats.expired++;
      }

      if (session.riskScore >= 60) {
        stats.highRiskSessions++;
      }

      totalDuration += Math.min(now, session.expiresAt) - session.createdAt;
    }

    stats.averageSessionDuration = stats.total > 0 ? totalDuration / stats.total : 0;

    return stats;
  }

  /**
   * 이벤트 기록
   */
  private recordEvent(event: SessionEvent): void {
    this.sessionEvents.push(event);
    
    // 이벤트 로그 크기 제한
    if (this.sessionEvents.length > 10000) {
      this.sessionEvents = this.sessionEvents.slice(-5000);
    }

    // 중요한 보안 이벤트 로깅
    if (event.riskLevel === 'high' || event.riskLevel === 'critical') {
      console.warn('[Session Security Event]', event);
    }
  }

  /**
   * 가장 오래된 세션 종료
   */
  private async terminateOldestSession(userId: string): Promise<void> {
    const sessions = this.getUserSessions(userId);
    if (sessions.length === 0) return;

    const oldestSession = sessions[sessions.length - 1];
    await this.invalidateSession(oldestSession.sessionId, 'Terminated due to session limit');
  }

  /**
   * 만료된 세션 정리
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt || 
          (session.status !== 'active' && now - session.lastAccessedAt > 24 * 60 * 60 * 1000)) {
        
        // 세션 제거
        this.sessions.delete(sessionId);
        
        // 사용자별 세션에서도 제거
        const userSessions = this.userSessions.get(session.userId);
        if (userSessions) {
          userSessions.delete(sessionId);
          if (userSessions.size === 0) {
            this.userSessions.delete(session.userId);
          }
        }
        
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
    }
  }

  /**
   * 정리 타이머 시작
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000); // 5분마다 정리
  }

  /**
   * 세션 복호화 (토큰에서 세션 ID 추출)
   */
  decryptSessionToken(token: string): string | null {
    try {
      const decrypted = CryptoJS.AES.decrypt(token, this.SECRET_KEY).toString(CryptoJS.enc.Utf8);
      return decrypted || null;
    } catch (error) {
      console.error('[Session] Failed to decrypt session token:', error);
      return null;
    }
  }

  /**
   * 세션 암호화 (세션 ID를 토큰으로 변환)
   */
  encryptSessionToken(sessionId: string): string {
    return CryptoJS.AES.encrypt(sessionId, this.SECRET_KEY).toString();
  }

  /**
   * 세션 백업 및 복원 (클러스터 환경용)
   */
  exportSessions(): string {
    const data = {
      sessions: Array.from(this.sessions.entries()),
      userSessions: Array.from(this.userSessions.entries()).map(([userId, sessions]) => [
        userId,
        Array.from(sessions)
      ]),
      timestamp: Date.now()
    };
    
    return JSON.stringify(data);
  }

  importSessions(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      this.sessions = new Map(parsed.sessions);
      this.userSessions = new Map(
        parsed.userSessions.map(([userId, sessions]: [string, string[]]) => [
          userId,
          new Set(sessions)
        ])
      );
      
      return true;
    } catch (error) {
      console.error('[Session] Failed to import sessions:', error);
      return false;
    }
  }
}

// 싱글톤 인스턴스
export const sessionManager = new SessionManager();

export default SessionManager;
export type { SessionConfig, SessionData, SessionEvent, SuspiciousActivity };