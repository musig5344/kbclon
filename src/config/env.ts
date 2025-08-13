/**
 * Environment Configuration and Validation
 * 환경변수 설정 및 검증
 */

interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  api: {
    baseUrl: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    useMockData: boolean;
    enableDevTools: boolean;
  };
  performance: {
    enableMonitoring: boolean;
    enableErrorTracking: boolean;
  };
}

// 필수 환경변수 목록
const REQUIRED_ENV_VARS = [
  'REACT_APP_SUPABASE_URL',
  'REACT_APP_SUPABASE_ANON_KEY',
] as const;

// 환경변수 검증
function validateEnvironment(): void {
  const missingVars: string[] = [];

  REQUIRED_ENV_VARS.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }

  // 보안 검증: 민감한 정보가 하드코딩되지 않았는지 확인
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseUrl.includes('ggwqifsdqqotvoioytvb')) {
    console.warn('Warning: Using default Supabase URL. Please update your environment variables.');
  }

  if (supabaseKey && supabaseKey.length < 100) {
    console.warn('Warning: Supabase anon key seems invalid.');
  }
}

// 환경변수 값 가져오기 (기본값 포함)
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value || defaultValue || '';
}

// 환경 설정 객체 생성
function createConfig(): EnvironmentConfig {
  validateEnvironment();

  return {
    supabase: {
      url: getEnvVar('REACT_APP_SUPABASE_URL', ''),
      anonKey: getEnvVar('REACT_APP_SUPABASE_ANON_KEY', ''),
    },
    api: {
      baseUrl: getEnvVar('REACT_APP_API_BASE_URL', 'http://localhost:3001/api'),
    },
    app: {
      name: getEnvVar('REACT_APP_APP_NAME', 'KB StarBanking Clone'),
      version: getEnvVar('REACT_APP_VERSION', '1.0.0'),
      environment: getEnvVar('REACT_APP_ENVIRONMENT', 'development') as any,
      useMockData: getEnvVar('REACT_APP_USE_MOCK_DATA', 'false') === 'true',
      enableDevTools: getEnvVar('REACT_APP_ENABLE_DEVTOOLS', 'true') === 'true',
    },
    performance: {
      enableMonitoring: getEnvVar('REACT_APP_ENABLE_PERFORMANCE_MONITORING', 'false') === 'true',
      enableErrorTracking: getEnvVar('REACT_APP_ENABLE_ERROR_TRACKING', 'false') === 'true',
    },
  };
}

// 환경 설정 export
export const env = createConfig();

// 개발 환경에서만 환경 설정 로그
if (process.env.NODE_ENV === 'development') {
  console.log('Environment Configuration:', {
    environment: env.app.environment,
    useMockData: env.app.useMockData,
    apiBaseUrl: env.api.baseUrl,
    supabaseConfigured: !!env.supabase.url && !!env.supabase.anonKey,
  });
}

// 타입 export
export type { EnvironmentConfig };