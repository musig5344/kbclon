import { useState, useCallback } from 'react';

/**
 * KB 스타뱅킹 공통 API 호출 훅
 * - 로딩 상태 자동 관리
 * - 에러 처리 통합
 * - 타입 안전성 보장
 */

interface UseApiCallOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  initialLoading?: boolean;
}

interface UseApiCallResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApiCall<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiCallOptions = {}
): UseApiCallResult<T> {
  const { onSuccess, onError, initialLoading = false } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '오류가 발생했습니다.';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
}

/**
 * 여러 API 호출을 병렬로 처리하는 훅
 */
export function useParallelApiCalls<T extends readonly unknown[]>(
  apiFunctions: { [K in keyof T]: () => Promise<T[K]> },
  options: UseApiCallOptions = {}
): {
  data: { [K in keyof T]: T[K] | null };
  loading: boolean;
  error: string | null;
  execute: () => Promise<void>;
  reset: () => void;
} {
  const { onSuccess, onError, initialLoading = false } = options;
  
  const [data, setData] = useState<{ [K in keyof T]: T[K] | null }>(
    {} as { [K in keyof T]: T[K] | null }
  );
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await Promise.all(
        apiFunctions.map(fn => fn())
      );
      
      const dataObj = results.reduce((acc, result, index) => {
        acc[index as keyof T] = result;
        return acc;
      }, {} as { [K in keyof T]: T[K] });
      
      setData(dataObj);
      
      if (onSuccess) {
        onSuccess(dataObj);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '오류가 발생했습니다.';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [apiFunctions, onSuccess, onError]);

  const reset = useCallback(() => {
    setData({} as { [K in keyof T]: T[K] | null });
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
}

/**
 * 자동 재시도 기능이 있는 API 호출 훅
 */
export function useApiCallWithRetry<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000,
  options: UseApiCallOptions = {}
): UseApiCallResult<T> {
  const wrappedApiFunction = useCallback(async (...args: any[]): Promise<T> => {
    let lastError: any;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await apiFunction(...args);
      } catch (error) {
        lastError = error;
        
        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
        }
      }
    }
    
    throw lastError;
  }, [apiFunction, maxRetries, retryDelay]);

  return useApiCall(wrappedApiFunction, options);
}