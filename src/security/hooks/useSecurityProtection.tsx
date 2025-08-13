/**
 * Security Protection React Hooks
 *
 * XSS와 CSRF 보호를 위한 React Hook 컬렉션
 * - 입력값 자동 검증 및 살균화
 * - CSRF 토큰 자동 관리
 * - 보안 이벤트 모니터링
 * - 뱅킹 특화 보안 검증
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  createContext,
  ReactNode,
} from 'react';

import { csrfProtection, CSRFValidationResult } from '../csrf/CSRFProtection';
import { xssProtection, XSSValidationResult, XSSValidationOptions } from '../xss/XSSProtection';

// Security Context 인터페이스
interface SecurityContextValue {
  csrfToken: string | null;
  sessionId: string;
  isSecurityActive: boolean;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  violations: SecurityViolation[];
  refreshCSRFToken: () => void;
  validateInput: (input: string, options?: XSSValidationOptions) => XSSValidationResult;
  reportViolation: (violation: SecurityViolation) => void;
}

interface SecurityViolation {
  id: string;
  type: 'xss' | 'csrf' | 'general';
  timestamp: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source?: string;
  userAgent?: string;
}

// Security Context
const SecurityContext = createContext<SecurityContextValue | null>(null);

// Security Provider Props
interface SecurityProviderProps {
  children: ReactNode;
  sessionId?: string;
  enableXSSProtection?: boolean;
  enableCSRFProtection?: boolean;
  securityLevel?: 'low' | 'medium' | 'high' | 'critical';
  onViolation?: (violation: SecurityViolation) => void;
}

// Security Provider Component
export const SecurityProvider: React.FC<SecurityProviderProps> = ({
  children,
  sessionId: propSessionId,
  enableXSSProtection = true,
  enableCSRFProtection = true,
  securityLevel = 'high',
  onViolation,
}) => {
  const [sessionId] = useState(() => propSessionId || generateSessionId());
  const [csrfToken, setCSRFToken] = useState<string | null>(null);
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const [isSecurityActive, setIsSecurityActive] = useState(false);

  // CSRF 토큰 생성 및 갱신
  const refreshCSRFToken = useCallback(() => {
    if (enableCSRFProtection) {
      try {
        const { token } = csrfProtection.generateToken(sessionId);
        setCSRFToken(token);
      } catch (error) {
        console.error('[Security] Failed to generate CSRF token:', error);
      }
    }
  }, [sessionId, enableCSRFProtection]);

  // 초기화
  useEffect(() => {
    refreshCSRFToken();
    setIsSecurityActive(enableXSSProtection || enableCSRFProtection);
  }, [refreshCSRFToken, enableXSSProtection, enableCSRFProtection]);

  // 입력값 검증
  const validateInput = useCallback(
    (input: string, options?: XSSValidationOptions) => {
      if (!enableXSSProtection) {
        return {
          isValid: true,
          sanitized: input,
          originalLength: input.length,
          sanitizedLength: input.length,
          threats: [],
          warnings: [],
          riskLevel: 'low' as const,
        };
      }

      const result = xssProtection.validate(input, {
        strictMode: securityLevel === 'high' || securityLevel === 'critical',
        bankingMode: true,
        ...options,
      });

      // 위반 사항 리포트
      if (!result.isValid) {
        reportViolation({
          id: generateViolationId(),
          type: 'xss',
          timestamp: Date.now(),
          description: `XSS threat detected: ${result.threats.join(', ')}`,
          severity: result.riskLevel,
          source: 'input_validation',
        });
      }

      return result;
    },
    [enableXSSProtection, securityLevel]
  );

  // 보안 위반 리포트
  const reportViolation = useCallback(
    (violation: SecurityViolation) => {
      setViolations(prev => [...prev.slice(-99), violation]); // 최근 100개 유지

      if (onViolation) {
        onViolation(violation);
      }

      // 콘솔 로깅
      console.warn('[Security Violation]', violation);
    },
    [onViolation]
  );

  const contextValue: SecurityContextValue = {
    csrfToken,
    sessionId,
    isSecurityActive,
    securityLevel,
    violations,
    refreshCSRFToken,
    validateInput,
    reportViolation,
  };

  return <SecurityContext.Provider value={contextValue}>{children}</SecurityContext.Provider>;
};

// Security Hook
export const useSecurity = (): SecurityContextValue => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

// XSS Protection Hook
export const useXSSProtection = () => {
  const { validateInput, reportViolation } = useSecurity();

  // 안전한 입력 처리
  const safeguardInput = useCallback(
    (
      input: string,
      options?: XSSValidationOptions
    ): { value: string; isValid: boolean; warnings: string[] } => {
      const result = validateInput(input, options);
      return {
        value: result.sanitized,
        isValid: result.isValid,
        warnings: [...result.threats, ...result.warnings],
      };
    },
    [validateInput]
  );

  // 뱅킹 입력 검증
  const validateBankingInput = useCallback(
    (input: string, inputType: 'account' | 'amount' | 'memo' | 'name' | 'general') => {
      return xssProtection.validateBankingInput(input, inputType);
    },
    []
  );

  // 실시간 입력 모니터링
  const createInputMonitor = useCallback(
    (inputRef: React.RefObject<HTMLInputElement>, options?: XSSValidationOptions) => {
      useEffect(() => {
        const element = inputRef.current;
        if (!element) return;

        const cleanup = xssProtection.createInputMonitor(element, options, result => {
          if (!result.isValid) {
            reportViolation({
              id: generateViolationId(),
              type: 'xss',
              timestamp: Date.now(),
              description: `Real-time XSS threat detected`,
              severity: result.riskLevel,
              source: 'input_monitor',
            });
          }
        });

        return cleanup;
      }, [inputRef, options, reportViolation]);
    },
    [reportViolation]
  );

  return {
    safeguardInput,
    validateBankingInput,
    createInputMonitor,
    validateInput,
  };
};

// CSRF Protection Hook
export const useCSRFProtection = () => {
  const { csrfToken, sessionId, refreshCSRFToken, reportViolation } = useSecurity();

  // CSRF 헤더 생성
  const getCSRFHeaders = useCallback(() => {
    if (!csrfToken) {
      return {};
    }

    return {
      'X-CSRF-Token': csrfToken,
      'X-Requested-With': 'XMLHttpRequest',
    };
  }, [csrfToken]);

  // 안전한 fetch 요청
  const safeFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const headers = {
        ...getCSRFHeaders(),
        'Content-Type': 'application/json',
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // CSRF 토큰 오류 확인
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error?.includes('CSRF')) {
          reportViolation({
            id: generateViolationId(),
            type: 'csrf',
            timestamp: Date.now(),
            description: 'CSRF token validation failed',
            severity: 'high',
            source: 'fetch_request',
          });

          // 토큰 갱신 후 재시도
          refreshCSRFToken();
        }
      }

      return response;
    },
    [getCSRFHeaders, reportViolation, refreshCSRFToken]
  );

  // 폼 데이터에 CSRF 토큰 추가
  const addCSRFToFormData = useCallback(
    (formData: FormData): FormData => {
      if (csrfToken) {
        formData.append('csrf_token', csrfToken);
      }
      return formData;
    },
    [csrfToken]
  );

  return {
    csrfToken,
    getCSRFHeaders,
    safeFetch,
    addCSRFToFormData,
    refreshCSRFToken,
  };
};

// Secure Form Hook
export const useSecureForm = (initialValues: Record<string, any> = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { safeguardInput } = useXSSProtection();
  const { addCSRFToFormData } = useCSRFProtection();

  // 필드 값 업데이트 (XSS 보호 적용)
  const updateField = useCallback(
    (name: string, value: string, options?: XSSValidationOptions) => {
      const { value: safeValue, warnings } = safeguardInput(value, options);

      setValues(prev => ({ ...prev, [name]: safeValue }));

      if (warnings.length > 0) {
        setErrors(prev => ({ ...prev, [name]: warnings }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [safeguardInput]
  );

  // 안전한 폼 제출 데이터 생성
  const getSecureFormData = useCallback((): FormData => {
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    return addCSRFToFormData(formData);
  }, [values, addCSRFToFormData]);

  // 폼 초기화
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    updateField,
    getSecureFormData,
    resetForm,
    hasErrors: Object.keys(errors).length > 0,
  };
};

// Banking Security Hook (뱅킹 특화)
export const useBankingSecurity = () => {
  const { validateInput, reportViolation, securityLevel } = useSecurity();
  const { safeFetch } = useCSRFProtection();

  // 뱅킹 거래 검증
  const validateBankingTransaction = useCallback(
    (transaction: { amount: string; accountFrom: string; accountTo: string; memo?: string }) => {
      const results = {
        amount: validateInput(transaction.amount, { maxLength: 20, strictMode: true }),
        accountFrom: validateInput(transaction.accountFrom, { maxLength: 50, strictMode: true }),
        accountTo: validateInput(transaction.accountTo, { maxLength: 50, strictMode: true }),
        memo: transaction.memo
          ? validateInput(transaction.memo, { maxLength: 200, strictMode: true })
          : null,
      };

      const isValid = Object.values(results).every(result => result === null || result.isValid);
      const threats = Object.values(results).flatMap(result => result?.threats || []);

      if (!isValid) {
        reportViolation({
          id: generateViolationId(),
          type: 'xss',
          timestamp: Date.now(),
          description: `Banking transaction validation failed: ${threats.join(', ')}`,
          severity: 'critical',
          source: 'banking_transaction',
        });
      }

      return { isValid, results, threats };
    },
    [validateInput, reportViolation]
  );

  // 안전한 뱅킹 API 호출
  const secureBankingAPI = useCallback(
    async (endpoint: string, data: any, options: RequestInit = {}) => {
      try {
        const response = await safeFetch(`/api/banking${endpoint}`, {
          method: 'POST',
          body: JSON.stringify(data),
          ...options,
        });

        if (!response.ok) {
          throw new Error(`Banking API error: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        reportViolation({
          id: generateViolationId(),
          type: 'general',
          timestamp: Date.now(),
          description: `Banking API call failed: ${error}`,
          severity: 'high',
          source: 'banking_api',
        });
        throw error;
      }
    },
    [safeFetch, reportViolation]
  );

  return {
    validateBankingTransaction,
    secureBankingAPI,
    securityLevel,
  };
};

// 유틸리티 함수들
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const generateViolationId = (): string => {
  return `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Security Status Component
export const SecurityStatus: React.FC<{ showDetails?: boolean }> = ({ showDetails = false }) => {
  const { isSecurityActive, securityLevel, violations, csrfToken } = useSecurity();

  if (!showDetails) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: isSecurityActive ? '#4CAF50' : '#FF5722',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999,
          display: process.env.NODE_ENV === 'development' ? 'block' : 'none',
        }}
      >
        Security: {isSecurityActive ? 'Active' : 'Inactive'} ({securityLevel})
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxWidth: '400px',
        zIndex: 9999,
        display: process.env.NODE_ENV === 'development' ? 'block' : 'none',
      }}
    >
      <h4>Security Status</h4>
      <p>Status: {isSecurityActive ? '✅ Active' : '❌ Inactive'}</p>
      <p>Level: {securityLevel.toUpperCase()}</p>
      <p>CSRF Token: {csrfToken ? '✅ Present' : '❌ Missing'}</p>
      <p>Violations: {violations.length}</p>

      {violations.length > 0 && (
        <details>
          <summary>Recent Violations ({violations.length})</summary>
          <div style={{ maxHeight: '200px', overflow: 'auto', marginTop: '8px' }}>
            {violations.slice(-5).map(violation => (
              <div
                key={violation.id}
                style={{
                  borderBottom: '1px solid #333',
                  padding: '4px 0',
                  fontSize: '10px',
                }}
              >
                <strong>{violation.type.toUpperCase()}</strong> - {violation.severity}
                <br />
                {violation.description}
                <br />
                <small>{new Date(violation.timestamp).toLocaleTimeString()}</small>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

export default {
  SecurityProvider,
  useSecurity,
  useXSSProtection,
  useCSRFProtection,
  useSecureForm,
  useBankingSecurity,
  SecurityStatus,
};
