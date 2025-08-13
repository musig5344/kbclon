/**
 * 보안 강화를 위한 에러 처리 유틸리티
 * - 개발 환경에서는 상세한 에러 정보 제공
 * - 프로덕션 환경에서는 일반적인 에러 메시지로 마스킹
 */

export enum ErrorType {
  AUTH_ERROR = 'AUTH_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

interface ErrorConfig {
  type: ErrorType;
  userMessage: string;
  logMessage?: string;
}

type LogLevel = 'info' | 'warn' | 'error';

interface ApiErrorResponse {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
  code?: string;
  message?: string;
  name?: string;
}
// 프로덕션 환경용 일반적인 에러 메시지
const PRODUCTION_ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.AUTH_ERROR]: '인증에 실패했습니다. 다시 로그인해주세요.',
  [ErrorType.NETWORK_ERROR]: '네트워크 연결을 확인해주세요.',
  [ErrorType.VALIDATION_ERROR]: '입력하신 정보를 확인해주세요.',
  [ErrorType.SERVER_ERROR]: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  [ErrorType.UNKNOWN_ERROR]: '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};
class ErrorHandler {
  private static instance: ErrorHandler;
  private readonly isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }
  /**
   * 에러를 처리하고 사용자에게 표시할 메시지를 반환
   */
  handleError(error: unknown, config: ErrorConfig): string {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const logMessage = config.logMessage || errorMessage;
    // 개발 환경에서는 콘솔에 상세 에러 정보 출력
    if (this.isDevelopment) {
    }
    // 프로덕션 환경에서는 일반적인 메시지 반환
    if (!this.isDevelopment) {
      return PRODUCTION_ERROR_MESSAGES[config.type];
    }
    // 개발 환경에서는 사용자 메시지 또는 실제 에러 메시지 반환
    return config.userMessage || errorMessage;
  }
  /**
   * 인증 관련 에러 처리
   */
  handleAuthError(error: unknown, userMessage?: string): string {
    return this.handleError(error, {
      type: ErrorType.AUTH_ERROR,
      userMessage: userMessage || '인증에 실패했습니다.',
      logMessage: `Auth error: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
  /**
   * 네트워크 관련 에러 처리
   */
  handleNetworkError(error: unknown, userMessage?: string): string {
    return this.handleError(error, {
      type: ErrorType.NETWORK_ERROR,
      userMessage: userMessage || '네트워크 오류가 발생했습니다.',
      logMessage: `Network error: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
  /**
   * 유효성 검사 에러 처리
   */
  handleValidationError(error: unknown, userMessage?: string): string {
    return this.handleError(error, {
      type: ErrorType.VALIDATION_ERROR,
      userMessage: userMessage || '입력값이 올바르지 않습니다.',
      logMessage: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
  /**
   * 서버 에러 처리
   */
  handleServerError(error: unknown, userMessage?: string): string {
    return this.handleError(error, {
      type: ErrorType.SERVER_ERROR,
      userMessage: userMessage || '서버 오류가 발생했습니다.',
      logMessage: `Server error: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
  /**
   * 알 수 없는 에러 처리
   */
  handleUnknownError(error: unknown, userMessage?: string): string {
    return this.handleError(error, {
      type: ErrorType.UNKNOWN_ERROR,
      userMessage: userMessage || '알 수 없는 오류가 발생했습니다.',
      logMessage: `Unknown error: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
  /**
   * 안전한 로깅 - 민감한 정보 제거
   */
  safeLog(level: LogLevel, message: string, data?: unknown): void {
    if (!this.isDevelopment) return;
    const sanitizedData = data ? this.sanitizeLogData(data) : undefined;
    switch (level) {
      case 'info':
        console.info(`[INFO] ${message}`, sanitizedData);
        break;
      case 'warn':
        console.warn(`[WARN] ${message}`, sanitizedData);
        break;
      case 'error':
        console.error(`[ERROR] ${message}`, sanitizedData);
        break;
    }
  }
  /**
   * 로그 데이터에서 민감한 정보 제거
   */
  private sanitizeLogData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    const sensitiveKeys = [
      'password',
      'token',
      'access_token',
      'refresh_token',
      'secret',
      'key',
      'email',
      'phone',
      'ssn',
      'card_number',
      'account_number',
      'pin',
      'otp',
    ];
    const sanitized = { ...data };
    for (const key in sanitized) {
      if (
        sensitiveKeys.some(sensitiveKey => key.toLowerCase().includes(sensitiveKey.toLowerCase()))
      ) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeLogData(sanitized[key]);
      }
    }
    return sanitized;
  }
  /**
   * API 응답 에러 처리
   */
  handleApiError(error: ApiErrorResponse, context?: string): string {
    const contextMessage = context ? `${context}: ` : '';
    // HTTP 상태 코드별 처리
    if (error.response) {
      const status = error.response.status;
      const logMessage = `${contextMessage}API Error ${status}: ${error.response.data?.message || error.message}`;
      switch (status) {
        case 401:
          return this.handleAuthError(error, '로그인이 필요합니다.');
        case 403:
          return this.handleAuthError(error, '접근 권한이 없습니다.');
        case 404:
          return this.handleError(error, {
            type: ErrorType.SERVER_ERROR,
            userMessage: '요청한 정보를 찾을 수 없습니다.',
            logMessage,
          });
        case 429:
          return this.handleError(error, {
            type: ErrorType.SERVER_ERROR,
            userMessage: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
            logMessage,
          });
        case 500:
        case 502:
        case 503:
        case 504:
          return this.handleServerError(error, '서버에 일시적인 문제가 발생했습니다.');
        default:
          return this.handleServerError(error, logMessage);
      }
    }
    // 네트워크 에러
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return this.handleNetworkError(error);
    }
    // Supabase 에러
    if (error.name === 'AuthError') {
      return this.handleAuthError(error);
    }
    // 기타 에러
    return this.handleUnknownError(error, contextMessage + error.message);
  }
}
// 싱글톤 인스턴스 내보내기
export const errorHandler = ErrorHandler.getInstance();
// 편의 함수们
export const handleAuthError = (error: unknown, userMessage?: string) =>
  errorHandler.handleAuthError(error, userMessage);
export const handleNetworkError = (error: unknown, userMessage?: string) =>
  errorHandler.handleNetworkError(error, userMessage);
export const handleValidationError = (error: unknown, userMessage?: string) =>
  errorHandler.handleValidationError(error, userMessage);
export const handleServerError = (error: unknown, userMessage?: string) =>
  errorHandler.handleServerError(error, userMessage);
export const handleUnknownError = (error: unknown, userMessage?: string) =>
  errorHandler.handleUnknownError(error, userMessage);
export const handleApiError = (error: ApiErrorResponse, context?: string) =>
  errorHandler.handleApiError(error, context);
export const safeLog = (level: LogLevel, message: string, data?: unknown) =>
  errorHandler.safeLog(level, message, data);
