/**
 * XSS Protection Utilities
 * 
 * Cross-Site Scripting (XSS) 공격 방어를 위한 유틸리티
 * - 입력값 검증 및 살균화
 * - HTML/JavaScript 이스케이프
 * - 안전한 DOM 조작
 * - 뱅킹 특화 보안 검증
 */

import DOMPurify from 'isomorphic-dompurify';

// XSS 위험 패턴 정의
const XSS_PATTERNS = {
  SCRIPT_TAGS: /<script[^>]*>[\s\S]*?<\/script>/gi,
  JAVASCRIPT_PROTOCOL: /javascript:/gi,
  EVENT_HANDLERS: /on\w+\s*=/gi,
  STYLE_EXPRESSIONS: /expression\s*\(/gi,
  VBSCRIPT_PROTOCOL: /vbscript:/gi,
  DATA_URLS: /data:\s*text\/html/gi,
  OBJECT_EMBED: /<(object|embed|applet)[^>]*>/gi,
  IFRAME: /<iframe[^>]*>/gi,
  FORM_ACTION: /<form[^>]*action\s*=/gi,
  META_REFRESH: /<meta[^>]*http-equiv\s*=\s*["']?refresh/gi
};

// 뱅킹 특화 위험 패턴
const BANKING_RISK_PATTERNS = {
  ACCOUNT_NUMBERS: /\b\d{3,4}-\d{2,6}-\d{6,8}\b/g,
  CARD_NUMBERS: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  PASSWORDS: /password|비밀번호|pass|pwd/gi,
  FINANCIAL_KEYWORDS: /계좌|잔액|이체|송금|입금|출금|대출|카드/g,
  PHISHING_DOMAINS: /(?:fake|phish|scam|steal).*\.com/gi
};

interface XSSValidationOptions {
  allowHtml?: boolean;
  stripScripts?: boolean;
  maxLength?: number;
  allowedTags?: string[];
  allowedAttributes?: string[];
  strictMode?: boolean;
  bankingMode?: boolean;
}

interface XSSValidationResult {
  isValid: boolean;
  sanitized: string;
  originalLength: number;
  sanitizedLength: number;
  threats: string[];
  warnings: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

class XSSProtection {
  private defaultOptions: XSSValidationOptions = {
    allowHtml: false,
    stripScripts: true,
    maxLength: 10000,
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
    allowedAttributes: ['class', 'id'],
    strictMode: true,
    bankingMode: true
  };

  /**
   * 입력값 XSS 검증 및 살균화
   */
  validate(input: string, options?: XSSValidationOptions): XSSValidationResult {
    const opts = { ...this.defaultOptions, ...options };
    const threats: string[] = [];
    const warnings: string[] = [];

    // 기본 검증
    if (!input || typeof input !== 'string') {
      return {
        isValid: false,
        sanitized: '',
        originalLength: 0,
        sanitizedLength: 0,
        threats: ['Invalid input type'],
        warnings: [],
        riskLevel: 'medium'
      };
    }

    const originalLength = input.length;

    // 길이 검증
    if (opts.maxLength && originalLength > opts.maxLength) {
      threats.push(`Input exceeds maximum length (${opts.maxLength})`);
    }

    // XSS 패턴 검사
    Object.entries(XSS_PATTERNS).forEach(([pattern, regex]) => {
      if (regex.test(input)) {
        threats.push(`Detected ${pattern.toLowerCase().replace(/_/g, ' ')}`);
      }
    });

    // 뱅킹 특화 검증
    if (opts.bankingMode) {
      Object.entries(BANKING_RISK_PATTERNS).forEach(([pattern, regex]) => {
        if (regex.test(input)) {
          warnings.push(`Potential sensitive data: ${pattern.toLowerCase().replace(/_/g, ' ')}`);
        }
      });
    }

    // HTML 살균화
    let sanitized = this.sanitizeHtml(input, opts);

    // 추가 보안 처리
    if (opts.strictMode) {
      sanitized = this.strictSanitize(sanitized);
    }

    const sanitizedLength = sanitized.length;
    const riskLevel = this.calculateRiskLevel(threats, warnings, originalLength, sanitizedLength);

    return {
      isValid: threats.length === 0,
      sanitized,
      originalLength,
      sanitizedLength,
      threats,
      warnings,
      riskLevel
    };
  }

  /**
   * HTML 살균화
   */
  private sanitizeHtml(input: string, options: XSSValidationOptions): string {
    if (!options.allowHtml) {
      return this.escapeHtml(input);
    }

    // DOMPurify 설정
    const config = {
      ALLOWED_TAGS: options.allowedTags || [],
      ALLOWED_ATTR: options.allowedAttributes || [],
      REMOVE_SCRIPTS: options.stripScripts !== false,
      REMOVE_CONTENTS: ['script', 'style'],
      FORBID_TAGS: ['object', 'embed', 'applet', 'iframe'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
      SANITIZE_DOM: true
    };

    return DOMPurify.sanitize(input, config);
  }

  /**
   * 엄격한 살균화
   */
  private strictSanitize(input: string): string {
    return input
      .replace(/[<>]/g, '') // 모든 괄호 제거
      .replace(/javascript:/gi, '') // JavaScript 프로토콜 제거
      .replace(/vbscript:/gi, '') // VBScript 프로토콜 제거
      .replace(/on\w+\s*=/gi, '') // 이벤트 핸들러 제거
      .replace(/expression\s*\(/gi, '') // CSS expression 제거
      .trim();
  }

  /**
   * HTML 이스케이프
   */
  private escapeHtml(input: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };

    return input.replace(/[&<>"'`=\/]/g, (match) => htmlEscapes[match] || match);
  }

  /**
   * 위험도 계산
   */
  private calculateRiskLevel(
    threats: string[], 
    warnings: string[], 
    originalLength: number, 
    sanitizedLength: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (threats.length >= 3) return 'critical';
    if (threats.length >= 1) return 'high';
    if (warnings.length >= 3) return 'medium';
    if ((originalLength - sanitizedLength) / originalLength > 0.3) return 'medium';
    return 'low';
  }

  /**
   * 안전한 URL 검증
   */
  validateUrl(url: string): { isValid: boolean; sanitized: string; warnings: string[] } {
    const warnings: string[] = [];
    
    if (!url || typeof url !== 'string') {
      return { isValid: false, sanitized: '', warnings: ['Invalid URL'] };
    }

    // 위험한 프로토콜 검사
    const dangerousProtocols = ['javascript:', 'vbscript:', 'data:', 'file:'];
    const lowerUrl = url.toLowerCase();
    
    for (const protocol of dangerousProtocols) {
      if (lowerUrl.startsWith(protocol)) {
        return { isValid: false, sanitized: '', warnings: [`Dangerous protocol: ${protocol}`] };
      }
    }

    // 피싱 도메인 검사
    if (BANKING_RISK_PATTERNS.PHISHING_DOMAINS.test(url)) {
      warnings.push('Potential phishing domain detected');
    }

    // URL 살균화
    const sanitized = encodeURI(url.trim());

    return {
      isValid: true,
      sanitized,
      warnings
    };
  }

  /**
   * 폼 데이터 일괄 검증
   */
  validateFormData(
    formData: Record<string, any>, 
    fieldOptions?: Record<string, XSSValidationOptions>
  ): {
    isValid: boolean;
    sanitizedData: Record<string, any>;
    fieldResults: Record<string, XSSValidationResult>;
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
  } {
    const sanitizedData: Record<string, any> = {};
    const fieldResults: Record<string, XSSValidationResult> = {};
    const risks: string[] = [];

    Object.entries(formData).forEach(([field, value]) => {
      if (typeof value === 'string') {
        const options = fieldOptions?.[field] || {};
        const result = this.validate(value, options);
        
        fieldResults[field] = result;
        sanitizedData[field] = result.sanitized;
        
        if (result.riskLevel === 'critical' || result.riskLevel === 'high') {
          risks.push(result.riskLevel);
        }
      } else {
        sanitizedData[field] = value;
      }
    });

    const overallRisk = risks.includes('critical') ? 'critical' : 
                       risks.includes('high') ? 'high' : 
                       risks.length > 0 ? 'medium' : 'low';

    return {
      isValid: Object.values(fieldResults).every(result => result.isValid),
      sanitizedData,
      fieldResults,
      overallRisk
    };
  }

  /**
   * 뱅킹 특화 입력값 검증
   */
  validateBankingInput(
    input: string, 
    inputType: 'account' | 'amount' | 'memo' | 'name' | 'general'
  ): XSSValidationResult {
    const bankingOptions: Record<string, XSSValidationOptions> = {
      account: {
        allowHtml: false,
        maxLength: 50,
        strictMode: true,
        bankingMode: true
      },
      amount: {
        allowHtml: false,
        maxLength: 20,
        strictMode: true,
        bankingMode: true
      },
      memo: {
        allowHtml: false,
        maxLength: 200,
        strictMode: true,
        bankingMode: true
      },
      name: {
        allowHtml: false,
        maxLength: 100,
        strictMode: true,
        bankingMode: true
      },
      general: {
        allowHtml: false,
        maxLength: 1000,
        strictMode: true,
        bankingMode: true
      }
    };

    return this.validate(input, bankingOptions[inputType]);
  }

  /**
   * 실시간 입력 모니터링
   */
  createInputMonitor(
    element: HTMLElement, 
    options?: XSSValidationOptions,
    onThreat?: (result: XSSValidationResult) => void
  ): () => void {
    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const result = this.validate(target.value, options);

      if (!result.isValid && onThreat) {
        onThreat(result);
      }

      // 위험한 입력 시 자동 정리
      if (result.riskLevel === 'critical' || result.riskLevel === 'high') {
        target.value = result.sanitized;
      }
    };

    element.addEventListener('input', handleInput);
    element.addEventListener('paste', handleInput);

    // 정리 함수 반환
    return () => {
      element.removeEventListener('input', handleInput);
      element.removeEventListener('paste', handleInput);
    };
  }

  /**
   * 보안 리포트 생성
   */
  generateSecurityReport(results: XSSValidationResult[]): {
    summary: {
      total: number;
      valid: number;
      threats: number;
      highRisk: number;
    };
    recommendations: string[];
    topThreats: string[];
  } {
    const summary = {
      total: results.length,
      valid: results.filter(r => r.isValid).length,
      threats: results.filter(r => r.threats.length > 0).length,
      highRisk: results.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length
    };

    const allThreats = results.flatMap(r => r.threats);
    const threatCounts = allThreats.reduce((acc, threat) => {
      acc[threat] = (acc[threat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topThreats = Object.entries(threatCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([threat]) => threat);

    const recommendations = [
      'Implement Content Security Policy (CSP)',
      'Use HTTPS for all communications',
      'Validate and sanitize all user inputs',
      'Implement proper authentication and authorization',
      'Regular security audits and penetration testing'
    ];

    return { summary, recommendations, topThreats };
  }
}

// 싱글톤 인스턴스
export const xssProtection = new XSSProtection();

// 유틸리티 함수들
export const sanitizeInput = (input: string, options?: XSSValidationOptions): string => {
  return xssProtection.validate(input, options).sanitized;
};

export const escapeHtml = (input: string): string => {
  return xssProtection['escapeHtml'](input);
};

export const validateBankingInput = (
  input: string, 
  type: 'account' | 'amount' | 'memo' | 'name' | 'general'
): XSSValidationResult => {
  return xssProtection.validateBankingInput(input, type);
};

export default XSSProtection;
export type { XSSValidationOptions, XSSValidationResult };