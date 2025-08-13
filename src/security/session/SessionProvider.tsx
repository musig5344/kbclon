/**
 * Session Management React Provider
 *
 * React 애플리케이션을 위한 세션 관리 컨텍스트 및 Hook
 * - 자동 세션 검증 및 갱신
 * - 세션 상태 관리
 * - 보안 이벤트 모니터링
 * - 다중 탭 세션 동기화
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

import { sessionManager, SessionData, SessionEvent, SessionConfig } from './SessionManager';

// 세션 컨텍스트 인터페이스
interface SessionContextValue {
  session: SessionData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionEvents: SessionEvent[];
  lastActivity: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';

  // 액션들
  login: (loginData: LoginData) => Promise<LoginResult>;
  logout: (reason?: string) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  checkSessionStatus: () => Promise<boolean>;

  // 보안 관련
  getUserSessions: () => SessionData[];
  terminateSession: (sessionId: string) => Promise<boolean>;
  terminateAllOtherSessions: () => Promise<number>;

  // 설정
  updateSessionConfig: (config: Partial<SessionConfig>) => void;
}

// 로그인 데이터
interface LoginData {
  userId: string;
  loginMethod: 'password' | 'biometric' | 'otp' | 'certificate';
  permissions?: string[];
  deviceId?: string;
  metadata?: Record<string, any>;
}

// 로그인 결과
interface LoginResult {
  success: boolean;
  session?: SessionData;
  token?: string;
  warnings: string[];
  error?: string;
}

// Provider Props
interface SessionProviderProps {
  children: ReactNode;
  config?: Partial<SessionConfig>;
  onSessionExpired?: () => void;
  onSecurityEvent?: (event: SessionEvent) => void;
  onRiskLevelChange?: (level: 'low' | 'medium' | 'high' | 'critical') => void;
  enableActivityTracking?: boolean;
  enableMultiTabSync?: boolean;
}

// 세션 컨텍스트
const SessionContext = createContext<SessionContextValue | null>(null);

// 세션 Provider 컴포넌트
export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
  config = {},
  onSessionExpired,
  onSecurityEvent,
  onRiskLevelChange,
  enableActivityTracking = true,
  enableMultiTabSync = true,
}) => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionEvents, setSessionEvents] = useState<SessionEvent[]>([]);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');

  // 세션 토큰 관리
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sessionToken');
    }
    return null;
  });

  // 초기화
  useEffect(() => {
    initializeSession();
  }, []);

  // 활동 추적
  useEffect(() => {
    if (!enableActivityTracking) return;

    const updateActivity = () => {
      setLastActivity(Date.now());
      if (session) {
        sessionManager.refreshSession(session.sessionId);
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [session, enableActivityTracking]);

  // 다중 탭 동기화
  useEffect(() => {
    if (!enableMultiTabSync) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'sessionToken') {
        if (event.newValue !== sessionToken) {
          setSessionToken(event.newValue);
          if (event.newValue) {
            loadSessionFromToken(event.newValue);
          } else {
            handleSessionExpired('Session terminated in another tab');
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [sessionToken, enableMultiTabSync]);

  // 자동 세션 검증 타이머
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(async () => {
      const isValid = await checkSessionStatus();
      if (!isValid) {
        handleSessionExpired('Session validation failed');
      }
    }, 30000); // 30초마다 검증

    return () => clearInterval(interval);
  }, [session]);

  // 세션 초기화
  const initializeSession = async () => {
    setIsLoading(true);

    try {
      if (sessionToken) {
        await loadSessionFromToken(sessionToken);
      }
    } catch (error) {
      console.error('[Session] Failed to initialize session:', error);
      clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  // 토큰에서 세션 로드
  const loadSessionFromToken = async (token: string) => {
    try {
      const sessionId = sessionManager.decryptSessionToken(token);
      if (!sessionId) {
        throw new Error('Invalid session token');
      }

      const validation = await sessionManager.validateSession(sessionId, {
        ipAddress: await getCurrentIP(),
        userAgent: navigator.userAgent,
      });

      if (validation.isValid && validation.session) {
        setSession(validation.session);
        updateRiskLevel(validation.session.riskScore);
      } else {
        throw new Error(validation.reason || 'Session validation failed');
      }
    } catch (error) {
      console.error('[Session] Failed to load session from token:', error);
      clearSession();
    }
  };

  // 현재 IP 주소 가져오기 (간단한 예시)
  const getCurrentIP = async (): Promise<string> => {
    try {
      // 실제 구현에서는 IP 감지 서비스 사용
      return '127.0.0.1'; // 기본값
    } catch {
      return '127.0.0.1';
    }
  };

  // 위험 레벨 업데이트
  const updateRiskLevel = (riskScore: number) => {
    const newRiskLevel =
      riskScore >= 80 ? 'critical' : riskScore >= 60 ? 'high' : riskScore >= 30 ? 'medium' : 'low';

    if (newRiskLevel !== riskLevel) {
      setRiskLevel(newRiskLevel);
      if (onRiskLevelChange) {
        onRiskLevelChange(newRiskLevel);
      }
    }
  };

  // 로그인
  const login = useCallback(async (loginData: LoginData): Promise<LoginResult> => {
    setIsLoading(true);

    try {
      const currentIP = await getCurrentIP();
      const result = await sessionManager.createSession(loginData.userId, {
        ipAddress: currentIP,
        userAgent: navigator.userAgent,
        deviceId: loginData.deviceId,
        loginMethod: loginData.loginMethod,
        permissions: loginData.permissions,
        metadata: {
          ...loginData.metadata,
          loginTimestamp: Date.now(),
        },
      });

      const token = sessionManager.encryptSessionToken(result.session.sessionId);

      setSession(result.session);
      setSessionToken(token);
      updateRiskLevel(result.session.riskScore);

      // 토큰 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('sessionToken', token);
      }

      return {
        success: true,
        session: result.session,
        token,
        warnings: result.warnings,
      };
    } catch (error) {
      console.error('[Session] Login failed:', error);
      return {
        success: false,
        warnings: [],
        error: error instanceof Error ? error.message : 'Login failed',
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 로그아웃
  const logout = useCallback(
    async (reason: string = 'User logout') => {
      if (session) {
        await sessionManager.invalidateSession(session.sessionId, reason);
      }

      clearSession();
    },
    [session]
  );

  // 세션 정리
  const clearSession = () => {
    setSession(null);
    setSessionToken(null);
    setRiskLevel('low');

    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionToken');
    }
  };

  // 세션 갱신
  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!session) return false;

    try {
      const success = await sessionManager.refreshSession(session.sessionId);
      if (success) {
        // 갱신된 세션 데이터 다시 로드
        const validation = await sessionManager.validateSession(session.sessionId, {
          ipAddress: await getCurrentIP(),
          userAgent: navigator.userAgent,
        });

        if (validation.isValid && validation.session) {
          setSession(validation.session);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('[Session] Failed to refresh session:', error);
      return false;
    }
  }, [session]);

  // 세션 상태 확인
  const checkSessionStatus = useCallback(async (): Promise<boolean> => {
    if (!session) return false;

    try {
      const validation = await sessionManager.validateSession(session.sessionId, {
        ipAddress: await getCurrentIP(),
        userAgent: navigator.userAgent,
      });

      if (validation.isValid && validation.session) {
        setSession(validation.session);
        return true;
      } else {
        handleSessionExpired(validation.reason || 'Session validation failed');
        return false;
      }
    } catch (error) {
      console.error('[Session] Session status check failed:', error);
      return false;
    }
  }, [session]);

  // 세션 만료 처리
  const handleSessionExpired = (reason: string) => {
    console.warn('[Session] Session expired:', reason);
    clearSession();
    if (onSessionExpired) {
      onSessionExpired();
    }
  };

  // 사용자 세션 목록 조회
  const getUserSessions = useCallback((): SessionData[] => {
    if (!session) return [];
    return sessionManager.getUserSessions(session.userId);
  }, [session]);

  // 특정 세션 종료
  const terminateSession = useCallback(async (sessionId: string): Promise<boolean> => {
    return await sessionManager.invalidateSession(sessionId, 'Terminated by user');
  }, []);

  // 다른 모든 세션 종료
  const terminateAllOtherSessions = useCallback(async (): Promise<number> => {
    if (!session) return 0;
    return await sessionManager.invalidateAllUserSessions(session.userId, session.sessionId);
  }, [session]);

  // 세션 설정 업데이트
  const updateSessionConfig = useCallback((newConfig: Partial<SessionConfig>) => {
    // SessionManager의 설정을 업데이트하는 로직
    // 실제 구현에서는 SessionManager에 설정 업데이트 메서드 추가 필요
  }, []);

  const contextValue: SessionContextValue = {
    session,
    isAuthenticated: !!session && session.status === 'active',
    isLoading,
    sessionEvents,
    lastActivity,
    riskLevel,
    login,
    logout,
    refreshSession,
    checkSessionStatus,
    getUserSessions,
    terminateSession,
    terminateAllOtherSessions,
    updateSessionConfig,
  };

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
};

// 세션 Hook
export const useSession = (): SessionContextValue => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

// 인증 가드 Hook
export const useAuthGuard = (
  redirectTo?: string,
  requiredPermissions?: string[]
): {
  isAuthorized: boolean;
  isLoading: boolean;
  missingPermissions: string[];
} => {
  const { session, isAuthenticated, isLoading } = useSession();

  const missingPermissions = requiredPermissions
    ? requiredPermissions.filter(perm => !session?.permissions.includes(perm))
    : [];

  const isAuthorized = isAuthenticated && missingPermissions.length === 0;

  useEffect(() => {
    if (!isLoading && !isAuthorized && redirectTo) {
      window.location.href = redirectTo;
    }
  }, [isLoading, isAuthorized, redirectTo]);

  return {
    isAuthorized,
    isLoading,
    missingPermissions,
  };
};

// 세션 모니터링 Hook
export const useSessionMonitoring = () => {
  const { session, sessionEvents, riskLevel } = useSession();
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (!session) return;

    // 고위험 세션 알림
    if (riskLevel === 'high' || riskLevel === 'critical') {
      setAlerts(prev => [...prev, `High risk session detected (${riskLevel})`]);
    }

    // 의심스러운 이벤트 알림
    const suspiciousEvents = sessionEvents.filter(
      event => event.type === 'suspicious' && Date.now() - event.timestamp < 5 * 60 * 1000 // 5분 이내
    );

    if (suspiciousEvents.length > 0) {
      setAlerts(prev => [...prev, `${suspiciousEvents.length} suspicious activities detected`]);
    }
  }, [session, sessionEvents, riskLevel]);

  const clearAlerts = () => setAlerts([]);

  return {
    alerts,
    clearAlerts,
    riskLevel,
    sessionEvents: sessionEvents.slice(-10), // 최근 10개 이벤트
  };
};

// 자동 로그아웃 Hook
export const useAutoLogout = (
  idleTimeout: number = 30 * 60 * 1000, // 30분
  warningTimeout: number = 5 * 60 * 1000 // 5분 전 경고
) => {
  const { logout, lastActivity } = useSession();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivity;
      const remaining = idleTimeout - timeSinceActivity;

      if (remaining <= 0) {
        logout('Automatic logout due to inactivity');
      } else if (remaining <= warningTimeout) {
        setShowWarning(true);
        setTimeRemaining(remaining);
      } else {
        setShowWarning(false);
        setTimeRemaining(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastActivity, idleTimeout, warningTimeout, logout]);

  const extendSession = () => {
    setShowWarning(false);
    setTimeRemaining(0);
  };

  return {
    showWarning,
    timeRemaining: Math.ceil(timeRemaining / 1000), // 초 단위
    extendSession,
  };
};

export default {
  SessionProvider,
  useSession,
  useAuthGuard,
  useSessionMonitoring,
  useAutoLogout,
};
