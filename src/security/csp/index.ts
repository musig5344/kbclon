/**
 * CSP Security Module Index
 * 
 * KB StarBanking CSP 보안 시스템의 통합 진입점
 * - 모든 CSP 관련 기능 통합
 * - 간편한 설정 및 사용 API 제공
 * - 환경별 자동 설정
 */

// Core CSP classes
// Quick setup functions
import { CSPManager, CSPConfig } from './CSPManager';
import { getCSPPreset } from './CSPPresets';
import { validateCSPConfig } from './CSPTestUtils';

export { CSPManager } from './CSPManager';
export type { CSPConfig, CSPDirective } from './CSPManager';

// React integration
export { CSPProvider, useCSP, useSecureScript, useSecureStyle, CSPStatus, withCSPProtection } from './CSPProvider';

// Express middleware
export { default as CSPMiddleware, createBankingCSPMiddleware, createDevelopmentCSPMiddleware, createProductionCSPMiddleware } from './CSPMiddleware';
export type { CSPMiddlewareOptions, CSPRequest } from './CSPMiddleware';

// Configuration presets
export { default as CSPPresets, getCSPPreset, createDynamicCSP } from './CSPPresets';
export {
  BANKING_BASE_CSP,
  DEVELOPMENT_CSP,
  TESTING_CSP,
  HIGH_SECURITY_CSP,
  PAYMENT_CSP,
  AUTHENTICATION_CSP,
  ANALYTICS_CSP,
  PWA_CSP,
  MOBILE_APP_CSP
} from './CSPPresets';

// Testing utilities
export { default as CSPTestUtils, validateCSPConfig, generateCSPTestReport } from './CSPTestUtils';
export type { CSPTestResult, SecurityTestCase } from './CSPTestUtils';

/**
 * 환경에 맞는 CSP 빠른 설정
 */
export const setupCSPForEnvironment = (
  environment: 'development' | 'testing' | 'production' = 'production',
  features: {
    payment?: boolean;
    authentication?: boolean;
    analytics?: boolean;
    pwa?: boolean;
    mobile?: boolean;
    highSecurity?: boolean;
  } = {}
): CSPManager => {
  const config = getCSPPreset(environment, features);
  return new CSPManager(config);
};

/**
 * KB StarBanking 기본 CSP 설정
 */
export const setupKBStarBankingCSP = (
  environment: 'development' | 'testing' | 'production' = 'production'
): CSPManager => {
  return setupCSPForEnvironment(environment, {
    payment: true,
    authentication: true,
    analytics: environment === 'production',
    pwa: true,
    highSecurity: environment === 'production'
  });
};

/**
 * 개발자 친화적 CSP 설정 (느슨한 보안)
 */
export const setupDeveloperFriendlyCSP = (): CSPManager => {
  return setupCSPForEnvironment('development', {
    analytics: true,
    pwa: true
  });
};

/**
 * 최고 보안 CSP 설정
 */
export const setupHighSecurityCSP = (): CSPManager => {
  return setupCSPForEnvironment('production', {
    payment: true,
    authentication: true,
    highSecurity: true
  });
};

/**
 * CSP 설정 유효성 검사 및 보고서 생성
 */
export const validateAndReportCSP = async (
  config: CSPConfig
): Promise<{
  isValid: boolean;
  report: string;
  criticalIssues: number;
}> => {
  const results = await validateCSPConfig(config);
  const criticalIssues = results.reduce((count, result) => count + result.errors.length, 0);
  
  const testUtils = new (await import('./CSPTestUtils')).default(config);
  const report = testUtils.generateTestReport(results);
  
  return {
    isValid: criticalIssues === 0,
    report,
    criticalIssues
  };
};

/**
 * 런타임 CSP 위반 모니터링 설정
 */
export const setupCSPViolationMonitoring = (
  onViolation?: (violation: SecurityPolicyViolationEvent) => void
): void => {
  document.addEventListener('securitypolicyviolation', (event) => {
    // 기본 위반 로깅
    console.warn('CSP Violation:', {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber,
      columnNumber: event.columnNumber
    });

    // 커스텀 핸들러 호출
    if (onViolation) {
      onViolation(event);
    }

    // 개발 환경에서 디버깅 정보 표시
    if (process.env.NODE_ENV === 'development') {
      console.group('CSP Violation Details');
      console.groupEnd();
    }
  });
};

/**
 * 자동 CSP 설정 - 환경 감지
 */
export const autoConfigureCSP = (): CSPManager => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isTesting = process.env.NODE_ENV === 'test';
  const isElectron = typeof window !== 'undefined' && window.process?.type;
  const isMobile = typeof window !== 'undefined' && /Mobile|Android|iOS/.test(navigator.userAgent);

  let environment: 'development' | 'testing' | 'production';
  if (isProduction) {
    environment = 'production';
  } else if (isTesting) {
    environment = 'testing';
  } else {
    environment = 'development';
  }

  const features = {
    payment: isProduction,
    authentication: true,
    analytics: isProduction,
    pwa: true,
    mobile: isMobile || isElectron,
    highSecurity: isProduction
  };


  return setupCSPForEnvironment(environment, features);
};

/**
 * CSP 설정 비교 도구
 */
export const compareCSPConfigs = (
  config1: CSPConfig,
  config2: CSPConfig
): {
  differences: string[];
  added: string[];
  removed: string[];
  modified: string[];
} => {
  const differences: string[] = [];
  const added: string[] = [];
  const removed: string[] = [];
  const modified: string[] = [];

  const directives1 = config1.customDirectives || {};
  const directives2 = config2.customDirectives || {};

  const allDirectives = new Set([
    ...Object.keys(directives1),
    ...Object.keys(directives2)
  ]);

  allDirectives.forEach(directive => {
    const sources1 = directives1[directive] || [];
    const sources2 = directives2[directive] || [];

    if (sources1.length === 0 && sources2.length > 0) {
      added.push(`${directive}: ${sources2.join(' ')}`);
    } else if (sources1.length > 0 && sources2.length === 0) {
      removed.push(`${directive}: ${sources1.join(' ')}`);
    } else if (JSON.stringify(sources1) !== JSON.stringify(sources2)) {
      modified.push(`${directive}: ${sources1.join(' ')} → ${sources2.join(' ')}`);
    }
  });

  differences.push(...added.map(d => `+ ${d}`));
  differences.push(...removed.map(d => `- ${d}`));
  differences.push(...modified.map(d => `~ ${d}`));

  return { differences, added, removed, modified };
};

/**
 * 브라우저별 CSP 호환성 체크
 */
export const checkBrowserCSPSupport = (): {
  csp: boolean;
  csp2: boolean;
  trustedTypes: boolean;
  violations: boolean;
} => {
  if (typeof window === 'undefined') {
    return { csp: false, csp2: false, trustedTypes: false, violations: false };
  }

  return {
    csp: 'SecurityPolicyViolationEvent' in window,
    csp2: 'reportingObserver' in window,
    trustedTypes: 'trustedTypes' in window,
    violations: typeof document.addEventListener === 'function'
  };
};

// 기본 익스포트
export default {
  // Classes
  CSPManager,
  CSPMiddleware,
  CSPTestUtils,
  
  // Quick setup
  setupCSPForEnvironment,
  setupKBStarBankingCSP,
  setupDeveloperFriendlyCSP,
  setupHighSecurityCSP,
  autoConfigureCSP,
  
  // Utilities
  validateAndReportCSP,
  setupCSPViolationMonitoring,
  compareCSPConfigs,
  checkBrowserCSPSupport,
  
  // Presets
  presets: {
    BANKING_BASE_CSP,
    DEVELOPMENT_CSP,
    TESTING_CSP,
    HIGH_SECURITY_CSP,
    PAYMENT_CSP,
    AUTHENTICATION_CSP,
    ANALYTICS_CSP,
    PWA_CSP,
    MOBILE_APP_CSP
  }
};