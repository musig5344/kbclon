/**
 * KB 스타뱅킹 공통 상수 정의
 * - 중복된 설정값 통합 관리
 * - 타임아웃, 재시도, API 관련 상수
 */

// API 관련 상수
export const API_CONFIG = {
  BASE_TIMEOUT: 30000, // 30초 - 기본 API 타임아웃
  QUICK_TIMEOUT: 10000, // 10초 - 빠른 응답이 필요한 API
  LONG_TIMEOUT: 60000, // 60초 - 파일 업로드 등
  MAX_RETRIES: 3, // 최대 재시도 횟수
  RETRY_DELAY: 1000, // 1초 - 기본 재시도 지연
  RETRY_MULTIPLIER: 2, // 재시도 지연 배수
  MAX_RETRY_DELAY: 30000, // 30초 - 최대 재시도 지연
} as const;

// 세션 관련 상수
export const SESSION_CONFIG = {
  DEFAULT_TIMEOUT: 10 * 60 * 1000, // 10분 - 기본 세션 타임아웃
  EXTENDED_TIMEOUT: 30 * 60 * 1000, // 30분 - 연장된 세션 타임아웃
  WARNING_BEFORE: 60 * 1000, // 1분 - 세션 만료 경고 시간
  REFRESH_INTERVAL: 5 * 60 * 1000, // 5분 - 세션 갱신 간격
} as const;

// 캐시 관련 상수
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5분 - 기본 캐시 유효 시간
  ACCOUNT_TTL: 10 * 60 * 1000, // 10분 - 계좌 정보 캐시
  TRANSACTION_TTL: 2 * 60 * 1000, // 2분 - 거래 내역 캐시
  EXCHANGE_RATE_TTL: 30 * 60 * 1000, // 30분 - 환율 정보 캐시
  MAX_CACHE_SIZE: 100, // 최대 캐시 아이템 수
} as const;

// 애니메이션 관련 상수
export const ANIMATION_CONFIG = {
  DURATION_FAST: 150, // 150ms - 빠른 애니메이션
  DURATION_NORMAL: 300, // 300ms - 일반 애니메이션
  DURATION_SLOW: 500, // 500ms - 느린 애니메이션
  DURATION_PAGE: 400, // 400ms - 페이지 전환
  FRAME_RATE: 60, // 60fps - 애니메이션 프레임레이트
} as const;

// 동기화 관련 상수
export const SYNC_CONFIG = {
  OFFLINE_RETRY_DELAY: 5000, // 5초 - 오프라인 재시도 지연
  SYNC_INTERVAL: 30 * 1000, // 30초 - 동기화 간격
  MAX_OFFLINE_ACTIONS: 100, // 최대 오프라인 액션 수
  CONFLICT_RESOLUTION_TIMEOUT: 10000, // 10초 - 충돌 해결 타임아웃
} as const;

// 입력 검증 관련 상수
export const VALIDATION_CONFIG = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 20,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 11,
  ACCOUNT_NUMBER_LENGTH: 14,
  MAX_AMOUNT: 100000000, // 1억원
  MIN_AMOUNT: 1000, // 1천원
  MAX_MEMO_LENGTH: 50,
} as const;

// 성능 관련 상수
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 300, // 300ms - 디바운스 지연
  THROTTLE_DELAY: 100, // 100ms - 스로틀 지연
  LAZY_LOAD_OFFSET: 100, // 100px - 지연 로딩 오프셋
  INFINITE_SCROLL_THRESHOLD: 0.8, // 80% - 무한 스크롤 임계값
  MAX_CONCURRENT_REQUESTS: 6, // 최대 동시 요청 수
} as const;

// 보안 관련 상수
export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5, // 최대 로그인 시도 횟수
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30분 - 계정 잠금 시간
  OTP_VALIDITY: 5 * 60 * 1000, // 5분 - OTP 유효 시간
  CSRF_TOKEN_LENGTH: 32, // CSRF 토큰 길이
  SESSION_TOKEN_LENGTH: 64, // 세션 토큰 길이
} as const;

// UI 관련 상수
export const UI_CONFIG = {
  TOAST_DURATION: 3000, // 3초 - 토스트 메시지 표시 시간
  MODAL_BACKDROP_OPACITY: 0.5, // 모달 배경 투명도
  HEADER_HEIGHT: 56, // 헤더 높이
  TAB_BAR_HEIGHT: 60, // 탭바 높이
  SAFE_AREA_PADDING: 20, // 안전 영역 패딩
} as const;

// 네트워크 상태 관련 상수
export const NETWORK_CONFIG = {
  ONLINE_CHECK_INTERVAL: 5000, // 5초 - 온라인 상태 확인 간격
  NETWORK_TIMEOUT_ERROR: 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE_ERROR: 'NETWORK_OFFLINE',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

// 전체 설정 export
export const APP_CONSTANTS = {
  API: API_CONFIG,
  SESSION: SESSION_CONFIG,
  CACHE: CACHE_CONFIG,
  ANIMATION: ANIMATION_CONFIG,
  SYNC: SYNC_CONFIG,
  VALIDATION: VALIDATION_CONFIG,
  PERFORMANCE: PERFORMANCE_CONFIG,
  SECURITY: SECURITY_CONFIG,
  UI: UI_CONFIG,
  NETWORK: NETWORK_CONFIG,
} as const;

// 타입 정의
export type ApiConfig = typeof API_CONFIG;
export type SessionConfig = typeof SESSION_CONFIG;
export type CacheConfig = typeof CACHE_CONFIG;
export type AnimationConfig = typeof ANIMATION_CONFIG;
export type SyncConfig = typeof SYNC_CONFIG;
export type ValidationConfig = typeof VALIDATION_CONFIG;
export type PerformanceConfig = typeof PERFORMANCE_CONFIG;
export type SecurityConfig = typeof SECURITY_CONFIG;
export type UiConfig = typeof UI_CONFIG;
export type NetworkConfig = typeof NETWORK_CONFIG;
export type AppConstants = typeof APP_CONSTANTS;