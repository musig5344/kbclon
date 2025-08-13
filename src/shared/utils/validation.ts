/**
 * 입력 검증 유틸리티
 * - 보안 강화를 위한 사용자 입력 검증
 * - XSS, SQL 인젝션, 데이터 무결성 보호
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
export interface ValidationRule {
  message: string;
  validator: (value: string) => boolean;
}
// 공통 정규식 패턴
const PATTERNS = {
  EMAIL: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  PHONE: /^01[0-9]-?\d{3,4}-?\d{4}$/,
  ACCOUNT_NUMBER: /^\d{10,16}$/,
  KOREAN_NAME: /^[가-힣]{2,10}$/,
  PASSWORD: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/,
  NUMERIC: /^\d+$/,
  AMOUNT: /^\d{1,12}$/,
  SAFE_TEXT: /^[a-zA-Z0-9가-힣\s\-_.()]{1,100}$/
};
// 위험한 문자/패턴 (XSS 방지)
const DANGEROUS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /onclick/i,
  /onload/i,
  /onerror/i,
  /<iframe/i,
  /<object/i,
  /<embed/i,
  /data:text\/html/i,
  /vbscript:/i
];
// SQL 인젝션 패턴
const SQL_INJECTION_PATTERNS = [
  /['";]|--|\/\*|\*\/|#/i,
  /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b/i,
  /\b(OR|AND|WHERE|TABLE|FROM)\b/i
];
class ValidationService {
  private static instance: ValidationService;
  static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }
  /**
   * 이메일 주소 검증
   */
  validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    if (!email) {
      errors.push('이메일을 입력해주세요.');
    } else {
      if (email.length > 100) {
        errors.push('이메일이 너무 깁니다.');
      }
      if (!PATTERNS.EMAIL.test(email)) {
        errors.push('올바른 이메일 형식이 아닙니다.');
      }
      if (this.hasDangerousContent(email)) {
        errors.push('허용되지 않는 문자가 포함되어 있습니다.');
      }
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  /**
   * 비밀번호 검증 (보안 강화)
   */
  validatePassword(password: string): ValidationResult {
    const errors: string[] = [];
    if (!password) {
      errors.push('비밀번호를 입력해주세요.');
    } else {
      if (password.length < 8) {
        errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
      }
      if (password.length > 20) {
        errors.push('비밀번호는 최대 20자까지 가능합니다.');
      }
      if (!/[a-zA-Z]/.test(password)) {
        errors.push('영문자를 포함해야 합니다.');
      }
      if (!/\d/.test(password)) {
        errors.push('숫자를 포함해야 합니다.');
      }
      if (!/[!@#$%^&*]/.test(password)) {
        errors.push('특수문자(!@#$%^&*)를 포함해야 합니다.');
      }
      if (this.hasCommonWeakPatterns(password)) {
        errors.push('보안이 약한 패턴입니다. 다른 비밀번호를 사용해주세요.');
      }
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  /**
   * 이름 검증 (한글만 허용)
   */
  validateName(name: string): ValidationResult {
    const errors: string[] = [];
    if (!name) {
      errors.push('이름을 입력해주세요.');
    } else {
      if (!PATTERNS.KOREAN_NAME.test(name)) {
        errors.push('이름은 한글 2-10자로 입력해주세요.');
      }
      if (this.hasDangerousContent(name)) {
        errors.push('허용되지 않는 문자가 포함되어 있습니다.');
      }
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  /**
   * 전화번호 검증
   */
  validatePhone(phone: string): ValidationResult {
    const errors: string[] = [];
    if (!phone) {
      errors.push('전화번호를 입력해주세요.');
    } else {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      if (!PATTERNS.PHONE.test(cleanPhone)) {
        errors.push('올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)');
      }
      if (this.hasDangerousContent(phone)) {
        errors.push('허용되지 않는 문자가 포함되어 있습니다.');
      }
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  /**
   * 계좌번호 검증
   */
  validateAccountNumber(accountNumber: string): ValidationResult {
    const errors: string[] = [];
    if (!accountNumber) {
      errors.push('계좌번호를 입력해주세요.');
    } else {
      const cleanAccountNumber = accountNumber.replace(/[^0-9]/g, '');
      if (!PATTERNS.ACCOUNT_NUMBER.test(cleanAccountNumber)) {
        errors.push('계좌번호는 10-16자리 숫자여야 합니다.');
      }
      if (this.hasDangerousContent(accountNumber)) {
        errors.push('허용되지 않는 문자가 포함되어 있습니다.');
      }
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  /**
   * 거래 금액 검증
   */
  validateAmount(amount: string | number): ValidationResult {
    const errors: string[] = [];
    const amountStr = typeof amount === 'number' ? amount.toString() : amount;
    if (!amountStr) {
      errors.push('금액을 입력해주세요.');
    } else {
      const cleanAmount = amountStr.replace(/[^0-9]/g, '');
      if (!PATTERNS.AMOUNT.test(cleanAmount)) {
        errors.push('올바른 금액을 입력해주세요.');
      }
      const numericAmount = parseInt(cleanAmount, 10);
      if (numericAmount <= 0) {
        errors.push('금액은 0보다 커야 합니다.');
      }
      if (numericAmount > 999999999999) { // 1조원 한도
        errors.push('입력 가능한 금액을 초과했습니다.');
      }
      if (this.hasDangerousContent(amountStr)) {
        errors.push('허용되지 않는 문자가 포함되어 있습니다.');
      }
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  /**
   * 거래 설명/메모 검증
   */
  validateTransactionDescription(description: string): ValidationResult {
    const errors: string[] = [];
    if (description && description.length > 100) {
      errors.push('거래 설명은 100자 이하로 입력해주세요.');
    }
    if (description && !PATTERNS.SAFE_TEXT.test(description)) {
      errors.push('허용되지 않는 문자가 포함되어 있습니다.');
    }
    if (this.hasDangerousContent(description)) {
      errors.push('보안상 허용되지 않는 내용입니다.');
    }
    if (this.hasSqlInjection(description)) {
      errors.push('허용되지 않는 내용이 포함되어 있습니다.');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  /**
   * 일반 텍스트 입력 검증 (XSS 방지)
   */
  validateSafeText(text: string, maxLength: number = 100): ValidationResult {
    const errors: string[] = [];
    if (text && text.length > maxLength) {
      errors.push(`입력 가능한 글자 수(${maxLength}자)를 초과했습니다.`);
    }
    if (this.hasDangerousContent(text)) {
      errors.push('보안상 허용되지 않는 내용입니다.');
    }
    if (this.hasSqlInjection(text)) {
      errors.push('허용되지 않는 내용이 포함되어 있습니다.');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  /**
   * 위험한 컨텐츠 검사 (XSS 방지)
   */
  private hasDangerousContent(input: string): boolean {
    if (!input) return false;
    return DANGEROUS_PATTERNS.some(pattern => pattern.test(input));
  }
  /**
   * SQL 인젝션 패턴 검사
   */
  private hasSqlInjection(input: string): boolean {
    if (!input) return false;
    return SQL_INJECTION_PATTERNS.some((pattern: RegExp) => pattern.test(input));
  }
  /**
   * 약한 비밀번호 패턴 검사
   */
  private hasCommonWeakPatterns(password: string): boolean {
    const weakPatterns = [
      /12345678/,
      /password/i,
      /qwerty/i,
      /asdfgh/i,
      /abc123/i,
      /admin/i,
      /test123/i,
      /user123/i,
      // 연속된 문자
      /(.)\1{3,}/,
      // 키보드 패턴
      /qwertyui/i,
      /asdfghjk/i,
      /zxcvbnm/i,
      // 생년월일 패턴 (예: 19901234, 20001234)
      /(19|20)\d{6}/
    ];
    return weakPatterns.some(pattern => pattern.test(password));
  }
  /**
   * 입력값 정화 (sanitization)
   */
  sanitizeInput(input: string): string {
    if (!input) return '';
    return input
      .replace(/[<>]/g, '') // HTML 태그 제거
      .replace(/['";]/g, '') // 따옴표, 세미콜론 제거
      .replace(/--/g, '') // SQL 주석 제거
      .trim();
  }
  /**
   * 숫자만 추출
   */
  extractNumbers(input: string): string {
    return input.replace(/[^0-9]/g, '');
  }
  /**
   * 금액 포맷팅 (콤마 추가)
   */
  formatAmount(amount: string | number): string {
    const numericAmount = typeof amount === 'string' 
      ? parseInt(this.extractNumbers(amount), 10)
      : amount;
    if (isNaN(numericAmount)) return '0';
    return numericAmount.toLocaleString('ko-KR');
  }
  /**
   * 배치 검증 (여러 필드 동시 검증)
   */
  validateFields(fields: { [key: string]: { value: string; rules: ValidationRule[] } }): {
    isValid: boolean;
    errors: { [key: string]: string[] };
    firstError?: string;
  } {
    const errors: { [key: string]: string[] } = {};
    let firstError: string | undefined;
    for (const [fieldName, fieldConfig] of Object.entries(fields)) {
      const fieldErrors: string[] = [];
      for (const rule of fieldConfig.rules) {
        if (!rule.validator(fieldConfig.value)) {
          fieldErrors.push(rule.message);
          if (!firstError) {
            firstError = rule.message;
          }
        }
      }
      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors;
      }
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      firstError
    };
  }
}
// 싱글톤 인스턴스 및 편의 함수들
export const validationService = ValidationService.getInstance();
// 편의 함수들
export const validateEmail = (email: string) => validationService.validateEmail(email);
export const validatePassword = (password: string) => validationService.validatePassword(password);
export const validateName = (name: string) => validationService.validateName(name);
export const validatePhone = (phone: string) => validationService.validatePhone(phone);
export const validateAccountNumber = (accountNumber: string) => validationService.validateAccountNumber(accountNumber);
export const validateAmount = (amount: string | number) => validationService.validateAmount(amount);
export const validateTransactionDescription = (description: string) => validationService.validateTransactionDescription(description);
export const validateSafeText = (text: string, maxLength?: number) => validationService.validateSafeText(text, maxLength);
export const sanitizeInput = (input: string) => validationService.sanitizeInput(input);
export const extractNumbers = (input: string) => validationService.extractNumbers(input);
export const formatAmount = (amount: string | number) => validationService.formatAmount(amount);
// 공통 검증 규칙들
export const commonValidationRules = {
  required: (message: string = '필수 입력 항목입니다.'): ValidationRule => ({
    message,
    validator: (value: string) => value.trim().length > 0
  }),
  minLength: (length: number, message?: string): ValidationRule => ({
    message: message || `최소 ${length}자 이상 입력해주세요.`,
    validator: (value: string) => value.length >= length
  }),
  maxLength: (length: number, message?: string): ValidationRule => ({
    message: message || `최대 ${length}자까지 입력 가능합니다.`,
    validator: (value: string) => value.length <= length
  }),
  pattern: (pattern: RegExp, message: string): ValidationRule => ({
    message,
    validator: (value: string) => pattern.test(value)
  }),
  noXSS: (message: string = '허용되지 않는 문자가 포함되어 있습니다.'): ValidationRule => ({
    message,
    validator: (value: string) => !validationService['hasDangerousContent'](value)
  }),
  noSQLInjection: (message: string = '허용되지 않는 내용이 포함되어 있습니다.'): ValidationRule => ({
    message,
    validator: (value: string) => !validationService['hasSqlInjection'](value)
  })
};