/**
 * Error Message Mapper
 * 에러 코드를 사용자 친화적인 메시지로 매핑
 */

// 에러 코드 타입
export type ErrorCode = 
  | 'AUTH_FAILED'
  | 'AUTH_EXPIRED'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_ACCOUNT_LOCKED'
  | 'AUTH_PASSWORD_EXPIRED'
  | 'NETWORK_ERROR'
  | 'NETWORK_TIMEOUT'
  | 'NETWORK_OFFLINE'
  | 'SERVER_ERROR'
  | 'SERVER_MAINTENANCE'
  | 'SERVER_OVERLOAD'
  | 'TRANSACTION_FAILED'
  | 'TRANSACTION_DUPLICATE'
  | 'TRANSACTION_LIMIT_EXCEEDED'
  | 'INSUFFICIENT_BALANCE'
  | 'INVALID_ACCOUNT'
  | 'INVALID_AMOUNT'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

// 에러 메시지 매핑
export const errorMessages: Record<ErrorCode, {
  title: string;
  message: string;
  suggestion?: string;
  action?: string;
}> = {
  // 인증 관련
  AUTH_FAILED: {
    title: '로그인 실패',
    message: '아이디 또는 비밀번호가 올바르지 않습니다.',
    suggestion: '입력한 정보를 다시 확인해 주세요.',
    action: '비밀번호 찾기'
  },
  AUTH_EXPIRED: {
    title: '인증 만료',
    message: '보안을 위해 자동으로 로그아웃되었습니다.',
    suggestion: '다시 로그인해 주세요.',
    action: '로그인'
  },
  AUTH_INVALID_CREDENTIALS: {
    title: '잘못된 인증 정보',
    message: '입력하신 인증 정보가 올바르지 않습니다.',
    suggestion: '아이디와 비밀번호를 확인해 주세요.'
  },
  AUTH_ACCOUNT_LOCKED: {
    title: '계정 잠김',
    message: '비밀번호 5회 오류로 계정이 잠겼습니다.',
    suggestion: '고객센터(1588-9999)로 문의해 주세요.',
    action: '고객센터 연결'
  },
  AUTH_PASSWORD_EXPIRED: {
    title: '비밀번호 만료',
    message: '비밀번호 변경 주기가 도래했습니다.',
    suggestion: '새로운 비밀번호로 변경해 주세요.',
    action: '비밀번호 변경'
  },

  // 네트워크 관련
  NETWORK_ERROR: {
    title: '네트워크 오류',
    message: '네트워크 연결에 문제가 발생했습니다.',
    suggestion: '인터넷 연결을 확인하고 다시 시도해 주세요.'
  },
  NETWORK_TIMEOUT: {
    title: '요청 시간 초과',
    message: '서버 응답 시간이 초과되었습니다.',
    suggestion: '잠시 후 다시 시도해 주세요.'
  },
  NETWORK_OFFLINE: {
    title: '오프라인 상태',
    message: '인터넷에 연결되어 있지 않습니다.',
    suggestion: 'Wi-Fi 또는 모바일 데이터를 확인해 주세요.'
  },

  // 서버 관련
  SERVER_ERROR: {
    title: '서버 오류',
    message: '일시적인 서버 오류가 발생했습니다.',
    suggestion: '잠시 후 다시 시도해 주세요.'
  },
  SERVER_MAINTENANCE: {
    title: '시스템 점검',
    message: '현재 시스템 점검 중입니다.',
    suggestion: '점검 시간: 매일 00:00 ~ 00:30'
  },
  SERVER_OVERLOAD: {
    title: '서버 과부하',
    message: '현재 많은 사용자가 접속 중입니다.',
    suggestion: '잠시 후 다시 시도해 주세요.'
  },

  // 거래 관련
  TRANSACTION_FAILED: {
    title: '거래 실패',
    message: '거래 처리 중 오류가 발생했습니다.',
    suggestion: '잔액과 계좌번호를 확인해 주세요.'
  },
  TRANSACTION_DUPLICATE: {
    title: '중복 거래',
    message: '동일한 거래가 이미 처리되었습니다.',
    suggestion: '거래 내역을 확인해 주세요.',
    action: '거래 내역 조회'
  },
  TRANSACTION_LIMIT_EXCEEDED: {
    title: '이체 한도 초과',
    message: '일일 이체 한도를 초과했습니다.',
    suggestion: '내일 다시 시도하거나 한도를 증액해 주세요.',
    action: '한도 증액 신청'
  },
  INSUFFICIENT_BALANCE: {
    title: '잔액 부족',
    message: '계좌 잔액이 부족합니다.',
    suggestion: '잔액을 확인하고 다시 시도해 주세요.',
    action: '잔액 조회'
  },

  // 계좌 관련
  INVALID_ACCOUNT: {
    title: '잘못된 계좌번호',
    message: '입력하신 계좌번호가 올바르지 않습니다.',
    suggestion: '계좌번호를 다시 확인해 주세요.'
  },
  INVALID_AMOUNT: {
    title: '잘못된 금액',
    message: '입력하신 금액이 올바르지 않습니다.',
    suggestion: '0원 이상의 금액을 입력해 주세요.'
  },

  // 유효성 검사
  VALIDATION_ERROR: {
    title: '입력 오류',
    message: '입력하신 정보가 올바르지 않습니다.',
    suggestion: '빨간색으로 표시된 항목을 확인해 주세요.'
  },

  // 기타
  UNKNOWN_ERROR: {
    title: '알 수 없는 오류',
    message: '예상치 못한 오류가 발생했습니다.',
    suggestion: '문제가 지속되면 고객센터로 문의해 주세요.',
    action: '고객센터'
  }
};

// HTTP 상태 코드를 에러 코드로 매핑
export const httpStatusToErrorCode = (status: number): ErrorCode => {
  switch (status) {
    case 400:
      return 'VALIDATION_ERROR';
    case 401:
      return 'AUTH_FAILED';
    case 403:
      return 'AUTH_EXPIRED';
    case 404:
      return 'INVALID_ACCOUNT';
    case 408:
      return 'NETWORK_TIMEOUT';
    case 429:
      return 'SERVER_OVERLOAD';
    case 500:
    case 502:
    case 503:
      return 'SERVER_ERROR';
    case 504:
      return 'NETWORK_TIMEOUT';
    default:
      return 'UNKNOWN_ERROR';
  }
};

// API 에러 코드를 내부 에러 코드로 매핑
export const apiErrorToErrorCode = (apiError: string): ErrorCode => {
  const errorMap: Record<string, ErrorCode> = {
    'INVALID_CREDENTIALS': 'AUTH_INVALID_CREDENTIALS',
    'TOKEN_EXPIRED': 'AUTH_EXPIRED',
    'ACCOUNT_LOCKED': 'AUTH_ACCOUNT_LOCKED',
    'PASSWORD_EXPIRED': 'AUTH_PASSWORD_EXPIRED',
    'INSUFFICIENT_FUNDS': 'INSUFFICIENT_BALANCE',
    'INVALID_ACCOUNT_NUMBER': 'INVALID_ACCOUNT',
    'DUPLICATE_TRANSACTION': 'TRANSACTION_DUPLICATE',
    'DAILY_LIMIT_EXCEEDED': 'TRANSACTION_LIMIT_EXCEEDED',
    'NETWORK_ERROR': 'NETWORK_ERROR',
    'TIMEOUT': 'NETWORK_TIMEOUT',
    'MAINTENANCE': 'SERVER_MAINTENANCE'
  };

  return errorMap[apiError] || 'UNKNOWN_ERROR';
};

// 에러 메시지 포맷터
export class ErrorMessageFormatter {
  static format(
    errorCode: ErrorCode,
    customMessage?: string,
    details?: Record<string, any>
  ): {
    title: string;
    message: string;
    suggestion?: string;
    action?: string;
    details?: Record<string, any>;
  } {
    const errorInfo = errorMessages[errorCode] || errorMessages.UNKNOWN_ERROR;
    
    return {
      ...errorInfo,
      message: customMessage || errorInfo.message,
      details
    };
  }

  static formatWithContext(
    errorCode: ErrorCode,
    context: 'login' | 'transfer' | 'inquiry' | 'general'
  ): {
    title: string;
    message: string;
    suggestion?: string;
    action?: string;
  } {
    const baseError = errorMessages[errorCode];
    
    // 컨텍스트별 커스터마이징
    switch (context) {
      case 'login':
        if (errorCode === 'NETWORK_ERROR') {
          return {
            ...baseError,
            suggestion: '네트워크를 확인하거나 앱을 재시작해 주세요.'
          };
        }
        break;
      
      case 'transfer':
        if (errorCode === 'SERVER_ERROR') {
          return {
            ...baseError,
            message: '이체 처리 중 오류가 발생했습니다.',
            suggestion: '거래가 완료되었는지 확인 후 다시 시도해 주세요.',
            action: '거래 내역 확인'
          };
        }
        break;
      
      case 'inquiry':
        if (errorCode === 'NETWORK_TIMEOUT') {
          return {
            ...baseError,
            message: '조회 시간이 초과되었습니다.',
            suggestion: '조회 조건을 줄여서 다시 시도해 주세요.'
          };
        }
        break;
    }
    
    return baseError;
  }

  static getErrorCodeFromError(error: any): ErrorCode {
    // Error 객체에서 에러 코드 추출
    if (error.code) {
      return apiErrorToErrorCode(error.code);
    }
    
    // HTTP 상태 코드에서 에러 코드 추출
    if (error.response?.status) {
      return httpStatusToErrorCode(error.response.status);
    }
    
    // 네트워크 에러 체크
    if (error.message?.includes('Network Error') || !navigator.onLine) {
      return 'NETWORK_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  }
}

// 에러 메시지 헬퍼 함수들
export const getErrorMessage = (errorCode: ErrorCode): string => {
  return errorMessages[errorCode]?.message || errorMessages.UNKNOWN_ERROR.message;
};

export const getErrorTitle = (errorCode: ErrorCode): string => {
  return errorMessages[errorCode]?.title || errorMessages.UNKNOWN_ERROR.title;
};

export const getErrorSuggestion = (errorCode: ErrorCode): string | undefined => {
  return errorMessages[errorCode]?.suggestion;
};

export const getErrorAction = (errorCode: ErrorCode): string | undefined => {
  return errorMessages[errorCode]?.action;
};