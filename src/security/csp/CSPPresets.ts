/**
 * CSP Configuration Presets
 * 
 * 뱅킹 애플리케이션을 위한 사전 정의된 CSP 설정들
 * - 환경별 설정 (개발/테스트/프로덕션)
 * - 기능별 설정 (결제/인증/분석)
 * - 보안 레벨별 설정
 */

import { CSPConfig } from './CSPManager';

// 기본 뱅킹 CSP 설정
export const BANKING_BASE_CSP: CSPConfig = {
  environment: 'production',
  enableReporting: true,
  reportUri: '/api/security/csp-violations',
  enableTrustedTypes: true,
  customDirectives: {
    'default-src': ["'none'"],
    'script-src': [
      "'self'",
      "'nonce-{nonce}'",
      "'strict-dynamic'"
    ],
    'style-src': [
      "'self'",
      "'nonce-{nonce}'"
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:'
    ],
    'font-src': [
      "'self'"
    ],
    'connect-src': [
      "'self'"
    ],
    'media-src': [
      "'none'"
    ],
    'object-src': [
      "'none'"
    ],
    'child-src': [
      "'none'"
    ],
    'frame-src': [
      "'none'"
    ],
    'worker-src': [
      "'self'"
    ],
    'manifest-src': [
      "'self'"
    ],
    'base-uri': [
      "'self'"
    ],
    'form-action': [
      "'self'"
    ]
  }
};

// 개발 환경 CSP 설정
export const DEVELOPMENT_CSP: CSPConfig = {
  ...BANKING_BASE_CSP,
  environment: 'development',
  enableTrustedTypes: false,
  customDirectives: {
    'default-src': ["'none'"],
    'script-src': [
      "'self'",
      "'unsafe-eval'", // HMR 지원
      "'unsafe-inline'", // 개발 편의성
      'localhost:*',
      '127.0.0.1:*',
      'ws://localhost:*', // WebSocket for HMR
      'ws://127.0.0.1:*'
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // styled-components 지원
      'localhost:*',
      '127.0.0.1:*'
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'localhost:*',
      '127.0.0.1:*'
    ],
    'font-src': [
      "'self'",
      'data:'
    ],
    'connect-src': [
      "'self'",
      'ws://localhost:*',
      'ws://127.0.0.1:*',
      'http://localhost:*',
      'https://localhost:*'
    ],
    'worker-src': [
      "'self'",
      'blob:'
    ],
    'base-uri': [
      "'self'"
    ],
    'form-action': [
      "'self'"
    ]
  }
};

// 테스트 환경 CSP 설정
export const TESTING_CSP: CSPConfig = {
  ...BANKING_BASE_CSP,
  environment: 'testing',
  enableTrustedTypes: false,
  customDirectives: {
    ...BANKING_BASE_CSP.customDirectives,
    'script-src': [
      "'self'",
      "'nonce-{nonce}'",
      "'strict-dynamic'",
      'https://testing-api.kbstar.com'
    ],
    'connect-src': [
      "'self'",
      'https://testing-api.kbstar.com',
      'https://staging-analytics.example.com'
    ]
  }
};

// 프로덕션 고보안 CSP 설정
export const HIGH_SECURITY_CSP: CSPConfig = {
  ...BANKING_BASE_CSP,
  environment: 'production',
  enableTrustedTypes: true,
  customDirectives: {
    'default-src': ["'none'"],
    'script-src': [
      "'self'",
      "'nonce-{nonce}'"
    ],
    'style-src': [
      "'self'",
      "'nonce-{nonce}'"
    ],
    'img-src': [
      "'self'",
      'data:'
    ],
    'font-src': [
      "'self'"
    ],
    'connect-src': [
      "'self'",
      'https://api.kbstar.com'
    ],
    'base-uri': [
      "'self'"
    ],
    'form-action': [
      "'self'"
    ],
    'frame-ancestors': [
      "'none'"
    ],
    'require-trusted-types-for': [
      "'script'"
    ],
    'trusted-types': [
      'banking-policy',
      'default'
    ]
  }
};

// 결제 페이지 CSP 설정
export const PAYMENT_CSP: CSPConfig = {
  ...BANKING_BASE_CSP,
  customDirectives: {
    ...BANKING_BASE_CSP.customDirectives,
    'script-src': [
      "'self'",
      "'nonce-{nonce}'",
      "'strict-dynamic'",
      'https://pay.kbstar.com',
      'https://js.tosspayments.com',
      'https://service.iamport.kr'
    ],
    'connect-src': [
      "'self'",
      'https://api.kbstar.com',
      'https://api.tosspayments.com',
      'https://api.iamport.kr'
    ],
    'frame-src': [
      'https://pay.kbstar.com',
      'https://js.tosspayments.com',
      'https://service.iamport.kr'
    ],
    'child-src': [
      'https://pay.kbstar.com'
    ]
  }
};

// 인증 페이지 CSP 설정
export const AUTHENTICATION_CSP: CSPConfig = {
  ...BANKING_BASE_CSP,
  customDirectives: {
    ...BANKING_BASE_CSP.customDirectives,
    'script-src': [
      "'self'",
      "'nonce-{nonce}'",
      "'strict-dynamic'",
      'https://auth.kbstar.com',
      'https://nice.checkplus.co.kr',
      'https://samsungpass.com'
    ],
    'connect-src': [
      "'self'",
      'https://auth.kbstar.com',
      'https://nice.checkplus.co.kr'
    ],
    'frame-src': [
      'https://auth.kbstar.com',
      'https://nice.checkplus.co.kr'
    ]
  }
};

// 분석/마케팅 CSP 설정
export const ANALYTICS_CSP: CSPConfig = {
  ...BANKING_BASE_CSP,
  customDirectives: {
    ...BANKING_BASE_CSP.customDirectives,
    'script-src': [
      "'self'",
      "'nonce-{nonce}'",
      "'strict-dynamic'",
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://connect.facebook.net',
      'https://analytics.tiktok.com'
    ],
    'img-src': [
      "'self'",
      'data:',
      'https://www.google-analytics.com',
      'https://www.facebook.com',
      'https://analytics.tiktok.com',
      'https://t.co'
    ],
    'connect-src': [
      "'self'",
      'https://api.kbstar.com',
      'https://www.google-analytics.com',
      'https://analytics.google.com',
      'https://graph.facebook.com',
      'https://analytics.tiktok.com'
    ]
  }
};

// PWA 지원 CSP 설정
export const PWA_CSP: CSPConfig = {
  ...BANKING_BASE_CSP,
  customDirectives: {
    ...BANKING_BASE_CSP.customDirectives,
    'worker-src': [
      "'self'",
      'blob:'
    ],
    'manifest-src': [
      "'self'"
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https://kbstar.com'
    ]
  }
};

// 모바일 앱 CSP 설정 (Capacitor/Cordova)
export const MOBILE_APP_CSP: CSPConfig = {
  ...BANKING_BASE_CSP,
  customDirectives: {
    'default-src': [
      "'self'",
      'capacitor://localhost',
      'ionic://localhost',
      'http://localhost',
      'https://localhost',
      'capacitor-electron://-'
    ],
    'script-src': [
      "'self'",
      "'nonce-{nonce}'",
      "'unsafe-eval'", // Capacitor 런타임 요구사항
      'capacitor://localhost',
      'ionic://localhost'
    ],
    'style-src': [
      "'self'",
      "'nonce-{nonce}'",
      "'unsafe-inline'", // 네이티브 스타일링 지원
      'capacitor://localhost'
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'capacitor://localhost',
      'ionic://localhost',
      'https://kbstar.com'
    ],
    'connect-src': [
      "'self'",
      'https://api.kbstar.com',
      'capacitor://localhost',
      'ionic://localhost'
    ]
  }
};

// CSP 프리셋 선택 헬퍼
export const getCSPPreset = (
  environment: 'development' | 'testing' | 'production',
  features: {
    payment?: boolean;
    authentication?: boolean;
    analytics?: boolean;
    pwa?: boolean;
    mobile?: boolean;
    highSecurity?: boolean;
  } = {}
): CSPConfig => {
  let baseConfig: CSPConfig;

  // 환경별 기본 설정
  switch (environment) {
    case 'development':
      baseConfig = DEVELOPMENT_CSP;
      break;
    case 'testing':
      baseConfig = TESTING_CSP;
      break;
    case 'production':
      baseConfig = features.highSecurity ? HIGH_SECURITY_CSP : BANKING_BASE_CSP;
      break;
    default:
      baseConfig = BANKING_BASE_CSP;
  }

  // 기능별 설정 병합
  const mergedConfig = { ...baseConfig };

  if (features.payment) {
    mergedConfig.customDirectives = {
      ...mergedConfig.customDirectives,
      ...mergeDirectives(mergedConfig.customDirectives, PAYMENT_CSP.customDirectives)
    };
  }

  if (features.authentication) {
    mergedConfig.customDirectives = {
      ...mergedConfig.customDirectives,
      ...mergeDirectives(mergedConfig.customDirectives, AUTHENTICATION_CSP.customDirectives)
    };
  }

  if (features.analytics) {
    mergedConfig.customDirectives = {
      ...mergedConfig.customDirectives,
      ...mergeDirectives(mergedConfig.customDirectives, ANALYTICS_CSP.customDirectives)
    };
  }

  if (features.pwa) {
    mergedConfig.customDirectives = {
      ...mergedConfig.customDirectives,
      ...mergeDirectives(mergedConfig.customDirectives, PWA_CSP.customDirectives)
    };
  }

  if (features.mobile) {
    mergedConfig.customDirectives = {
      ...mergedConfig.customDirectives,
      ...mergeDirectives(mergedConfig.customDirectives, MOBILE_APP_CSP.customDirectives)
    };
  }

  return mergedConfig;
};

// 지시어 병합 헬퍼
const mergeDirectives = (
  base: Record<string, string[]> = {},
  additional: Record<string, string[]> = {}
): Record<string, string[]> => {
  const merged = { ...base };

  Object.entries(additional).forEach(([directive, sources]) => {
    if (merged[directive]) {
      // 중복 제거하면서 병합
      merged[directive] = [...new Set([...merged[directive], ...sources])];
    } else {
      merged[directive] = [...sources];
    }
  });

  return merged;
};

// 동적 CSP 생성 헬퍼
export const createDynamicCSP = (
  baseConfig: CSPConfig,
  additions: {
    allowedDomains?: string[];
    trustedScripts?: string[];
    trustedStyles?: string[];
    additionalDirectives?: Record<string, string[]>;
  }
): CSPConfig => {
  const config = { ...baseConfig };
  const directives = { ...config.customDirectives };

  if (additions.allowedDomains) {
    // 허용된 도메인을 모든 관련 지시어에 추가
    const domainDirectives = ['script-src', 'style-src', 'img-src', 'connect-src', 'font-src'];
    domainDirectives.forEach(directive => {
      if (directives[directive]) {
        directives[directive] = [
          ...directives[directive],
          ...additions.allowedDomains!.map(domain => `https://${domain}`)
        ];
      }
    });
  }

  if (additions.trustedScripts) {
    directives['script-src'] = [
      ...(directives['script-src'] || []),
      ...additions.trustedScripts
    ];
  }

  if (additions.trustedStyles) {
    directives['style-src'] = [
      ...(directives['style-src'] || []),
      ...additions.trustedStyles
    ];
  }

  if (additions.additionalDirectives) {
    Object.entries(additions.additionalDirectives).forEach(([directive, sources]) => {
      directives[directive] = [
        ...(directives[directive] || []),
        ...sources
      ];
    });
  }

  config.customDirectives = directives;
  return config;
};

export default {
  BANKING_BASE_CSP,
  DEVELOPMENT_CSP,
  TESTING_CSP,
  HIGH_SECURITY_CSP,
  PAYMENT_CSP,
  AUTHENTICATION_CSP,
  ANALYTICS_CSP,
  PWA_CSP,
  MOBILE_APP_CSP,
  getCSPPreset,
  createDynamicCSP
};