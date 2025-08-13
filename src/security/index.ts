/**
 * Security Module Index
 *
 * KB StarBanking 통합 보안 시스템
 * - CSP (Content Security Policy) 보호
 * - XSS (Cross-Site Scripting) 방어
 * - CSRF (Cross-Site Request Forgery) 방어
 * - React 통합 보안 Hook
 */

// CSP Protection
// Quick Setup Functions
import { setupKBStarBankingCSP, autoConfigureCSP, setupCSPViolationMonitoring } from './csp';
import { csrfProtection } from './csrf/CSRFProtection';
import { xssProtection } from './xss/XSSProtection';

export * from './csp';
export { default as CSPSystem } from './csp';

// XSS Protection
export {
  default as XSSProtection,
  xssProtection,
  sanitizeInput,
  escapeHtml,
  validateBankingInput,
} from './xss/XSSProtection';
export type { XSSValidationOptions, XSSValidationResult } from './xss/XSSProtection';

// CSRF Protection
export {
  default as CSRFProtection,
  csrfProtection,
  generateCSRFToken,
  validateCSRFToken,
  createCSRFMiddleware,
} from './csrf/CSRFProtection';
export type { CSRFTokenOptions, CSRFValidationResult, CSRFConfig } from './csrf/CSRFProtection';

// Data Masking
export * from './masking';
export { default as DataMaskingSystem } from './masking';

// Session Management
export * from './session';
export { default as SessionSystem } from './session';

// React Integration
export {
  SecurityProvider,
  useSecurity,
  useXSSProtection,
  useCSRFProtection,
  useSecureForm,
  useBankingSecurity,
  SecurityStatus,
} from './hooks/useSecurityProtection';

/**
 * KB StarBanking 통합 보안 설정
 * 모든 보안 기능을 한 번에 활성화
 */
export const setupKBStarBankingSecurity = (
  environment: 'development' | 'testing' | 'production' = 'production',
  options: {
    enableCSP?: boolean;
    enableXSS?: boolean;
    enableCSRF?: boolean;
    enableMasking?: boolean;
    enableSessionManagement?: boolean;
    sessionId?: string;
    onSecurityViolation?: (violation: any) => void;
  } = {}
) => {
  const {
    enableCSP = true,
    enableXSS = true,
    enableCSRF = true,
    enableMasking = true,
    enableSessionManagement = true,
    sessionId = `session_${Date.now()}`,
    onSecurityViolation,
  } = options;

  const securityConfig = {
    csp: null as any,
    xss: null as any,
    csrf: null as any,
    masking: null as any,
    session: null as any,
  };

  // CSP 설정
  if (enableCSP) {
    securityConfig.csp = setupKBStarBankingCSP(environment);

    // CSP 위반 모니터링 설정
    setupCSPViolationMonitoring(violation => {
      console.warn('[Security] CSP Violation:', violation);
      if (onSecurityViolation) {
        onSecurityViolation({
          type: 'csp',
          details: violation,
          timestamp: Date.now(),
        });
      }
    });
  }

  // XSS 보호 설정
  if (enableXSS) {
    securityConfig.xss = xssProtection;
  }

  // CSRF 보호 설정
  if (enableCSRF) {
    securityConfig.csrf = csrfProtection;

    // 초기 CSRF 토큰 생성
    const { token } = csrfProtection.generateToken(sessionId);
  }

  // 데이터 마스킹 설정
  if (enableMasking) {
    const { setupBankingMasking } = require('./masking');
    securityConfig.masking = setupBankingMasking({
      defaultAccessLevel: environment === 'production' ? 'user' : 'admin',
      enableAutoDetection: true,
      strictMode: environment === 'production',
    });
  }

  // 세션 관리 설정
  if (enableSessionManagement) {
    const { setupBankingSessionManagement } = require('./session');
    securityConfig.session = setupBankingSessionManagement({
      securityLevel: environment === 'production' ? 'maximum' : 'enhanced',
      enableSecurityMonitoring: true,
      enablePerformanceLogging: environment === 'development',
    });
  }

  return {
    ...securityConfig,
    sessionId,
    isSecure: enableCSP || enableXSS || enableCSRF || enableMasking || enableSessionManagement,
    environment,
    features: {
      csp: enableCSP,
      xss: enableXSS,
      csrf: enableCSRF,
      masking: enableMasking,
      sessionManagement: enableSessionManagement,
    },
  };
};

/**
 * 개발자 친화적 보안 설정 (느슨한 보안)
 */
export const setupDevelopmentSecurity = (sessionId?: string) => {
  return setupKBStarBankingSecurity('development', {
    enableCSP: true, // Report-only 모드
    enableXSS: true,
    enableCSRF: true,
    sessionId,
    onSecurityViolation: violation => {
      console.warn('[Dev Security]', violation);
    },
  });
};

/**
 * 프로덕션 고보안 설정
 */
export const setupProductionSecurity = (sessionId?: string) => {
  return setupKBStarBankingSecurity('production', {
    enableCSP: true,
    enableXSS: true,
    enableCSRF: true,
    sessionId,
    onSecurityViolation: violation => {
      // 프로덕션에서는 모니터링 서비스로 전송
      console.error('[Security Violation]', violation);
      // sendToMonitoring(violation);
    },
  });
};

/**
 * 보안 상태 확인
 */
export const getSecurityStatus = () => {
  return {
    csp: {
      enabled: typeof window !== 'undefined' && 'SecurityPolicyViolationEvent' in window,
      violations:
        document?.querySelectorAll('meta[http-equiv*="Content-Security-Policy"]').length || 0,
    },
    xss: {
      enabled: true,
      protectionActive: xssProtection !== null,
    },
    csrf: {
      enabled: true,
      protectionActive: csrfProtection !== null,
      tokensActive: csrfProtection.getProtectionStatus().activeTokens,
    },
    browser: {
      supportsTrustedTypes: typeof window !== 'undefined' && 'trustedTypes' in window,
      supportsCSP: typeof window !== 'undefined' && 'SecurityPolicyViolationEvent' in window,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    },
    timestamp: Date.now(),
  };
};

/**
 * 보안 테스트 실행
 */
export const runSecurityTests = async () => {
  const results = {
    csp: null as any,
    xss: null as any,
    csrf: null as any,
    overall: {
      passed: 0,
      failed: 0,
      warnings: 0,
    },
  };

  try {
    // CSP 테스트
    const { validateCSPConfig } = await import('./csp');
    const cspConfig = autoConfigureCSP().getConfig();
    results.csp = await validateCSPConfig(cspConfig);

    // XSS 테스트
    const xssTests = [
      '<script>alert("test")</script>',
      '<img src=x onerror="alert(1)">',
      'javascript:alert("xss")',
    ];

    results.xss = xssTests.map(test => xssProtection.validate(test));

    // CSRF 테스트
    const { token } = csrfProtection.generateToken('test_session');
    results.csrf = csrfProtection.validateToken(token, 'test_session');

    // 전체 결과 계산
    const allResults = [...(results.csp || []), ...(results.xss || []), results.csrf].filter(
      Boolean
    );

    results.overall.passed = allResults.filter((r: any) => r.isValid || r.passed).length;
    results.overall.failed = allResults.filter((r: any) => !(r.isValid || r.passed)).length;
    results.overall.warnings = allResults.reduce(
      (acc: number, r: any) => acc + (r.warnings?.length || 0),
      0
    );
  } catch (error) {
    console.error('[Security Tests] Error running tests:', error);
  }

  return results;
};

/**
 * 보안 설정 내보내기
 */
export const exportSecurityConfig = () => {
  return {
    csp: autoConfigureCSP().getConfig(),
    csrf: csrfProtection.getProtectionStatus(),
    xss: {
      enabled: true,
      strictMode: true,
      bankingMode: true,
    },
    timestamp: Date.now(),
    version: '1.0.0',
  };
};

/**
 * 보안 설정 가져오기
 */
export const importSecurityConfig = (config: any) => {
  try {
    // 실제 구현에서는 설정을 적용하는 로직 추가
    return true;
  } catch (error) {
    console.error('[Security] Failed to import configuration:', error);
    return false;
  }
};

/**
 * 응급 보안 모드 (모든 보안 기능 최대 강도로 활성화)
 */
export const enableEmergencySecurityMode = (sessionId?: string) => {
  console.warn('[Security] Emergency security mode activated!');

  const config = setupKBStarBankingSecurity('production', {
    enableCSP: true,
    enableXSS: true,
    enableCSRF: true,
    sessionId: sessionId || `emergency_${Date.now()}`,
    onSecurityViolation: violation => {
      console.error('[EMERGENCY SECURITY]', violation);
      // 긴급 상황에서는 즉시 알림
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('securityEmergency', {
            detail: violation,
          })
        );
      }
    },
  });

  // 추가 보안 설정
  if (typeof document !== 'undefined') {
    // 우클릭 비활성화
    document.addEventListener('contextmenu', e => e.preventDefault());

    // 개발자 도구 감지 시도
    let devtools = { open: false };
    setInterval(() => {
      if (
        window.outerHeight - window.innerHeight > 200 ||
        window.outerWidth - window.innerWidth > 200
      ) {
        if (!devtools.open) {
          devtools.open = true;
          console.warn('[Emergency Security] Development tools may be open');
        }
      } else {
        devtools.open = false;
      }
    }, 1000);
  }

  return config;
};

// 기본 내보내기
export default {
  // Quick Setup
  setupKBStarBankingSecurity,
  setupDevelopmentSecurity,
  setupProductionSecurity,

  // Status & Testing
  getSecurityStatus,
  runSecurityTests,

  // Configuration
  exportSecurityConfig,
  importSecurityConfig,

  // Emergency
  enableEmergencySecurityMode,

  // Core Services
  xssProtection,
  csrfProtection,
};
