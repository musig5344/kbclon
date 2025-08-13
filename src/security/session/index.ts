/**
 * Session Management Module Index
 *
 * 안전한 세션 관리 시스템
 * - 세션 생성, 검증, 무효화
 * - React 컨텍스트 통합
 * - 보안 이벤트 모니터링
 * - 다중 디바이스 세션 관리
 */

// Core session management
// Quick setup functions
import { sessionManager, SessionConfig } from './SessionManager';

export { default as SessionManager, sessionManager } from './SessionManager';
export type {
  SessionData,
  SessionConfig,
  SessionEvent,
  SuspiciousActivity,
  SessionStatus,
} from './SessionManager';

// React integration
export {
  SessionProvider,
  useSession,
  useAuthGuard,
  useSessionMonitoring,
  useAutoLogout,
} from './SessionProvider';

/**
 * KB StarBanking 세션 관리 시스템 초기화
 */
export const setupBankingSessionManagement = (
  config?: Partial<
    SessionConfig & {
      enableAutoCleanup?: boolean;
      enableSecurityMonitoring?: boolean;
      enablePerformanceLogging?: boolean;
    }
  >
) => {
  const {
    enableAutoCleanup = true,
    enableSecurityMonitoring = true,
    enablePerformanceLogging = false,
    ...sessionConfig
  } = config || {};

  // 기본 뱅킹 세션 설정
  const bankingConfig: Partial<SessionConfig> = {
    maxAge: 4 * 60 * 60 * 1000, // 4시간 (뱅킹 보안 기준)
    idleTimeout: 15 * 60 * 1000, // 15분 (뱅킹 보안 기준)
    maxConcurrentSessions: 2, // 보안을 위해 제한
    refreshThreshold: 10 * 60 * 1000, // 10분
    securityLevel: 'maximum',
    enableDeviceTracking: true,
    enableLocationTracking: true,
    requireSecureTransport: true,
    ipBindingEnabled: true,
    enableSessionFixationProtection: true,
    ...sessionConfig,
  };

  // SessionManager 재구성 (실제 구현에서는 생성자 매개변수로 전달)

  // 보안 모니터링 설정
  if (enableSecurityMonitoring) {
    setupSecurityEventMonitoring();
  }

  // 성능 로깅 설정
  if (enablePerformanceLogging) {
    setupPerformanceMonitoring();
  }

  return {
    sessionManager,
    config: bankingConfig,
    initialized: true,
    timestamp: Date.now(),
  };
};

/**
 * 보안 이벤트 모니터링 설정
 */
const setupSecurityEventMonitoring = () => {
  // 실제 구현에서는 SessionManager에 이벤트 리스너 추가

  // 예시: 주기적으로 보안 통계 확인
  setInterval(() => {
    const stats = sessionManager.getSessionStatistics();

    if (stats.highRiskSessions > 0) {
      console.warn(`[Session Security] ${stats.highRiskSessions} high-risk sessions detected`);
    }

    // 비정상적인 세션 패턴 감지
    if (stats.active > 1000) {
      console.warn('[Session Security] Unusually high number of active sessions');
    }
  }, 60000); // 1분마다 확인
};

/**
 * 성능 모니터링 설정
 */
const setupPerformanceMonitoring = () => {
  setInterval(
    () => {
      const stats = sessionManager.getSessionStatistics();
      console.log('[Session] Performance monitoring:', {
        totalSessions: stats.total,
        activeSessions: stats.active,
        averageDuration: Math.round(stats.averageSessionDuration / 1000 / 60), // 분 단위
        timestamp: new Date().toISOString(),
      });
    },
    5 * 60 * 1000
  ); // 5분마다 로깅
};

/**
 * Express 세션 미들웨어 생성
 */
export const createSessionMiddleware = (
  options: {
    cookieName?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    domain?: string;
    path?: string;
  } = {}
) => {
  const {
    cookieName = 'kb_session',
    secure = true,
    httpOnly = true,
    sameSite = 'strict',
    domain,
    path = '/',
  } = options;

  return (req: any, res: any, next: any) => {
    const sessionToken = req.cookies?.[cookieName] || req.headers['x-session-token'];

    if (sessionToken) {
      const sessionId = sessionManager.decryptSessionToken(sessionToken);

      if (sessionId) {
        sessionManager
          .validateSession(sessionId, {
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'] || '',
            timestamp: Date.now(),
          })
          .then(validation => {
            if (validation.isValid && validation.session) {
              req.session = validation.session;
              req.sessionId = sessionId;
            }
            next();
          })
          .catch(() => {
            next();
          });
      } else {
        next();
      }
    } else {
      next();
    }
  };
};

/**
 * 세션 기반 인증 미들웨어
 */
export const requireAuthentication = (requiredPermissions: string[] = []) => {
  return (req: any, res: any, next: any) => {
    if (!req.session || req.session.status !== 'active') {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'NO_VALID_SESSION',
      });
    }

    // 권한 확인
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(perm =>
        req.session.permissions.includes(perm)
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: requiredPermissions,
          current: req.session.permissions,
        });
      }
    }

    next();
  };
};

/**
 * 안전한 로그인 헬퍼
 */
export const performSecureLogin = async (
  userId: string,
  loginMethod: 'password' | 'biometric' | 'otp' | 'certificate',
  request: {
    ipAddress: string;
    userAgent: string;
    deviceId?: string;
    metadata?: any;
  },
  permissions: string[] = []
) => {
  try {
    const result = await sessionManager.createSession(userId, {
      ...request,
      loginMethod,
      permissions,
    });

    const token = sessionManager.encryptSessionToken(result.session.sessionId);

    return {
      success: true,
      session: result.session,
      token,
      warnings: result.warnings,
      expiresAt: result.session.expiresAt,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
      warnings: [],
    };
  }
};

/**
 * 세션 통계 대시보드 데이터
 */
export const getSessionDashboardData = () => {
  const stats = sessionManager.getSessionStatistics();
  const now = Date.now();

  return {
    overview: {
      totalSessions: stats.total,
      activeSessions: stats.active,
      expiredSessions: stats.expired,
      highRiskSessions: stats.highRiskSessions,
      averageSessionDuration: Math.round(stats.averageSessionDuration / 1000 / 60), // 분
    },
    status: stats.byStatus,
    healthScore: calculateHealthScore(stats),
    recommendations: generateRecommendations(stats),
    lastUpdated: now,
  };
};

/**
 * 세션 건강도 점수 계산
 */
const calculateHealthScore = (
  stats: ReturnType<typeof sessionManager.getSessionStatistics>
): number => {
  let score = 100;

  // 고위험 세션 비율
  const riskRatio = stats.total > 0 ? stats.highRiskSessions / stats.total : 0;
  score -= riskRatio * 50;

  // 만료된 세션 비율
  const expiredRatio = stats.total > 0 ? stats.expired / stats.total : 0;
  score -= expiredRatio * 20;

  // 비정상적으로 긴 세션
  const avgHours = stats.averageSessionDuration / (1000 * 60 * 60);
  if (avgHours > 8) {
    score -= 15;
  }

  return Math.max(0, Math.min(100, score));
};

/**
 * 권장사항 생성
 */
const generateRecommendations = (
  stats: ReturnType<typeof sessionManager.getSessionStatistics>
): string[] => {
  const recommendations: string[] = [];

  if (stats.highRiskSessions > 0) {
    recommendations.push('Review and investigate high-risk sessions');
  }

  if (stats.total > 10000) {
    recommendations.push('Consider implementing session cleanup policies');
  }

  if (stats.averageSessionDuration > 8 * 60 * 60 * 1000) {
    recommendations.push('Consider reducing maximum session duration');
  }

  const expiredRatio = stats.total > 0 ? stats.expired / stats.total : 0;
  if (expiredRatio > 0.3) {
    recommendations.push('High number of expired sessions - review session timeout settings');
  }

  return recommendations;
};

/**
 * 세션 보안 감사 수행
 */
export const performSecurityAudit = async (): Promise<{
  passed: boolean;
  findings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }>;
  score: number;
}> => {
  const findings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }> = [];

  const stats = sessionManager.getSessionStatistics();

  // 고위험 세션 확인
  if (stats.highRiskSessions > 0) {
    findings.push({
      severity: 'high',
      description: `${stats.highRiskSessions} high-risk sessions detected`,
      recommendation: 'Investigate suspicious activities and consider terminating risky sessions',
    });
  }

  // 오래된 세션 확인
  const avgDurationHours = stats.averageSessionDuration / (1000 * 60 * 60);
  if (avgDurationHours > 12) {
    findings.push({
      severity: 'medium',
      description: `Average session duration is ${avgDurationHours.toFixed(1)} hours`,
      recommendation: 'Consider implementing shorter session timeouts for better security',
    });
  }

  // 동시 세션 수 확인
  if (stats.active > 5000) {
    findings.push({
      severity: 'medium',
      description: `High number of concurrent sessions: ${stats.active}`,
      recommendation: 'Monitor for potential DDoS or automated attacks',
    });
  }

  const score = Math.max(0, 100 - findings.length * 20);

  return {
    passed: findings.filter(f => f.severity === 'high' || f.severity === 'critical').length === 0,
    findings,
    score,
  };
};

/**
 * 세션 데이터 익스포트 (GDPR 준수)
 */
export const exportUserSessionData = (userId: string) => {
  const sessions = sessionManager.getUserSessions(userId);

  return {
    userId,
    sessions: sessions.map(session => ({
      sessionId: session.sessionId,
      createdAt: new Date(session.createdAt).toISOString(),
      lastAccessedAt: new Date(session.lastAccessedAt).toISOString(),
      expiresAt: new Date(session.expiresAt).toISOString(),
      status: session.status,
      deviceId: session.deviceId,
      ipAddress: session.ipAddress, // 필요에 따라 마스킹
      loginMethod: session.loginMethod,
      permissions: session.permissions,
    })),
    exportedAt: new Date().toISOString(),
  };
};

/**
 * 세션 데이터 삭제 (GDPR 준수)
 */
export const deleteUserSessionData = async (userId: string): Promise<number> => {
  return await sessionManager.invalidateAllUserSessions(userId);
};

// 기본 내보내기
export default {
  // Core
  SessionManager,
  sessionManager,

  // Setup
  setupBankingSessionManagement,

  // Middleware
  createSessionMiddleware,
  requireAuthentication,

  // Utilities
  performSecureLogin,
  getSessionDashboardData,
  performSecurityAudit,

  // GDPR
  exportUserSessionData,
  deleteUserSessionData,
};
