/// <reference types="react-scripts" />
/**
 * 환경 변수 타입 정의
 */
declare namespace NodeJS {
  interface ProcessEnv {
    // 앱 설정
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PUBLIC_URL: string;
    // API 설정
    readonly REACT_APP_API_BASE_URL: string;
    readonly REACT_APP_API_TIMEOUT?: string;
    // Supabase 설정
    readonly REACT_APP_SUPABASE_URL: string;
    readonly REACT_APP_SUPABASE_ANON_KEY: string;
    // 기능 플래그
    readonly REACT_APP_ENABLE_PWA?: string;
    readonly REACT_APP_ENABLE_ANALYTICS?: string;
    readonly REACT_APP_ENABLE_SENTRY?: string;
    readonly REACT_APP_ENABLE_DEVTOOLS?: string;
    // 외부 서비스
    readonly REACT_APP_SENTRY_DSN?: string;
    readonly REACT_APP_GA_TRACKING_ID?: string;
    // 앱 정보
    readonly REACT_APP_VERSION?: string;
    readonly REACT_APP_BUILD_DATE?: string;
    readonly REACT_APP_COMMIT_HASH?: string;
    // 보안
    readonly REACT_APP_ENCRYPTION_KEY?: string;
    readonly REACT_APP_JWT_SECRET?: string;
    // 개발 도구
    readonly REACT_APP_DEBUG_MODE?: string;
    readonly REACT_APP_LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
    // PWA 설정
    readonly REACT_APP_PWA_CACHE_NAME?: string;
    readonly REACT_APP_PWA_SKIP_WAITING?: string;
    // 네트워크 설정
    readonly REACT_APP_USE_MOCK_API?: string;
    readonly REACT_APP_MOCK_API_DELAY?: string;
    // 기타
    readonly REACT_APP_DEFAULT_LANGUAGE?: string;
    readonly REACT_APP_SUPPORT_EMAIL?: string;
  }
}
// 환경 변수 헬퍼 타입
export type Environment = NodeJS.ProcessEnv['NODE_ENV'];
// 환경별 설정 타입
export interface EnvironmentConfig {
  apiUrl: string;
  enablePWA: boolean;
  enableAnalytics: boolean;
  enableSentry: boolean;
  enableDevtools: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}
// 환경 변수 파싱 헬퍼
export const parseBoolean = (value?: string): boolean => {
  return value === 'true';
};
export const parseNumber = (value?: string, defaultValue: number = 0): number => {
  const parsed = parseInt(value || '', 10);
  return isNaN(parsed) ? defaultValue : parsed;
};
// 현재 환경 확인 헬퍼
export const isDevelopment = (): boolean => process.env.NODE_ENV === 'development';
export const isProduction = (): boolean => process.env.NODE_ENV === 'production';
export const isTest = (): boolean => process.env.NODE_ENV === 'test';
// 환경 설정 가져오기
export const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    apiUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
    enablePWA: parseBoolean(process.env.REACT_APP_ENABLE_PWA),
    enableAnalytics: parseBoolean(process.env.REACT_APP_ENABLE_ANALYTICS),
    enableSentry: parseBoolean(process.env.REACT_APP_ENABLE_SENTRY),
    enableDevtools: parseBoolean(process.env.REACT_APP_ENABLE_DEVTOOLS),
    logLevel: (process.env.REACT_APP_LOG_LEVEL as EnvironmentConfig['logLevel']) || 'info',
  };
};