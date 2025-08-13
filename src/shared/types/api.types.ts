/**
 * API 관련 공통 타입 정의
 */
import { ApiError, PaginationResponse } from './common.types';
// HTTP 메서드
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
// API 요청 설정
export interface ApiRequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  timeout?: number;
  withCredentials?: boolean;
}
// API 응답 기본 구조
export interface ApiBaseResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
}
// 페이지네이션 응답
export interface PaginatedResponse<T> extends ApiBaseResponse<T[]> {
  pagination: PaginationResponse;
}
// API 엔드포인트 정의
export interface ApiEndpoint {
  path: string;
  method: HttpMethod;
  requiresAuth: boolean;
}
// API 클라이언트 인터페이스
export interface ApiClient {
  get<T>(url: string, config?: ApiRequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T>;
  delete<T>(url: string, config?: ApiRequestConfig): Promise<T>;
  patch<T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<T>;
}
// 에러 응답 타입
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    field?: string;
    details?: Record<string, unknown>;
  };
  status: number;
  timestamp: string;
}
// 토큰 관련 타입
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}
// 파일 업로드 타입
export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}
// API 호출 통계
export interface ApiCallStats {
  endpoint: string;
  method: HttpMethod;
  averageResponseTime: number;
  successRate: number;
  totalCalls: number;
  lastCallAt: string;
}
// 요청 인터셉터 타입
export type RequestInterceptor = (
  config: ApiRequestConfig
) => ApiRequestConfig | Promise<ApiRequestConfig>;
// 응답 인터셉터 타입
export type ResponseInterceptor<T = unknown> = (
  response: ApiBaseResponse<T>
) => ApiBaseResponse<T> | Promise<ApiBaseResponse<T>>;
// 에러 인터셉터 타입
export type ErrorInterceptor = (
  error: ErrorResponse
) => ErrorResponse | Promise<ErrorResponse>;
// 재시도 설정
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryCondition?: (error: ErrorResponse) => boolean;
  onRetry?: (retryCount: number, error: ErrorResponse) => void;
}
// 캐시 설정
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  key?: string;
  invalidateOn?: string[]; // API endpoints that invalidate this cache
}
// API 설정
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  withCredentials: boolean;
  retry?: RetryConfig;
  cache?: CacheConfig;
}
// 헬퍼 타입: API 엔드포인트에서 응답 타입 추출
export type ExtractApiResponse<T> = T extends (...args: any) => Promise<infer R> ? R : never;
// 헬퍼 타입: API 엔드포인트에서 요청 파라미터 타입 추출
export type ExtractApiParams<T> = T extends (params: infer P, ...args: any) => any ? P : never;