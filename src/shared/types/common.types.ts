/**
 * 공통 타입 정의
 * 프로젝트 전반에서 사용되는 기본 타입들
 */
// 기본 유틸리티 타입
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;
// 비동기 함수의 반환 타입 추출
export type AsyncReturnType<T extends (...args: any) => Promise<any>> = 
  T extends (...args: any) => Promise<infer R> ? R : never;
// 객체의 값 타입 추출
export type ValueOf<T> = T[keyof T];
// 읽기 전용 깊은 복사
export type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};
// 부분적 깊은 복사
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
// Branded Types (타입 안정성 강화)
export type Brand<K, T> = K & { __brand: T };
export type AccountId = Brand<string, 'AccountId'>;
export type UserId = Brand<string, 'UserId'>;
export type TransactionId = Brand<string, 'TransactionId'>;
// 페이지네이션 타입
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: 'asc' | 'desc';
  sortBy?: string;
}
export interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
  meta?: {
    timestamp: string;
    version: string;
  };
}
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
// 폼 관련 타입
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
export type FieldError = {
  field: string;
  message: string;
};
// 날짜/시간 타입
export type ISODateString = string;
export type Timestamp = number;
// 상태 관련 타입
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}
// 이벤트 타입
export type EventHandler<E extends React.SyntheticEvent> = (event: E) => void;
export type ClickHandler = EventHandler<React.MouseEvent>;
export type ChangeHandler = EventHandler<React.ChangeEvent>;
export type SubmitHandler = EventHandler<React.FormEvent>;
// 컴포넌트 Props 기본 타입
export interface BaseProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  'data-testid'?: string;
}
// 테마 관련 타입
export type ThemeMode = 'light' | 'dark' | 'system';
// 금액 관련 타입
export type CurrencyCode = 'KRW' | 'USD' | 'EUR';
export interface Money {
  amount: number;
  currency: CurrencyCode;
}
// 전화번호 타입
export type PhoneNumber = Brand<string, 'PhoneNumber'>;
// 이메일 타입  
export type Email = Brand<string, 'Email'>;
// 계좌번호 타입
export type AccountNumber = Brand<string, 'AccountNumber'>;
// 타입 가드 헬퍼
export const isNonNullable = <T>(value: T): value is NonNullable<T> => {
  return value !== null && value !== undefined;
};
export const hasProperty = <T extends object, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> => {
  return prop in obj;
};
// 배열 타입 가드
export const isArray = <T>(value: unknown): value is T[] => {
  return Array.isArray(value);
};
// 문자열 타입 가드
export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};
// 숫자 타입 가드
export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};
// 객체 타입 가드
export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};