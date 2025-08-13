import { useState, useCallback } from 'react';

/**
 * KB 스타뱅킹 공통 로딩/에러 상태 관리 훅
 * - 로딩 상태와 에러 상태를 통합 관리
 * - 중복 코드 제거
 */

interface UseLoadingStateOptions {
  initialLoading?: boolean;
  initialError?: string | null;
}

interface UseLoadingStateReturn {
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  startLoading: () => void;
  stopLoading: () => void;
  clearError: () => void;
  execute: <T>(asyncFunction: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
}

export function useLoadingState(
  options: UseLoadingStateOptions = {}
): UseLoadingStateReturn {
  const { initialLoading = false, initialError = null } = options;
  
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(initialError);

  const startLoading = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const execute = useCallback(async <T,>(
    asyncFunction: () => Promise<T>
  ): Promise<T | null> => {
    try {
      startLoading();
      const result = await asyncFunction();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '오류가 발생했습니다.';
      setError(errorMessage);
      return null;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    setLoading,
    setError,
    startLoading,
    stopLoading,
    clearError,
    execute,
    reset
  };
}

/**
 * 여러 로딩 상태를 관리하는 훅
 */
export function useMultipleLoadingStates<T extends Record<string, boolean>>(
  initialStates: T
): {
  states: T;
  setLoading: (key: keyof T, loading: boolean) => void;
  isAnyLoading: boolean;
  areAllLoading: boolean;
  reset: () => void;
} {
  const [states, setStates] = useState<T>(initialStates);

  const setLoading = useCallback((key: keyof T, loading: boolean) => {
    setStates(prev => ({
      ...prev,
      [key]: loading
    }));
  }, []);

  const isAnyLoading = Object.values(states).some(loading => loading);
  const areAllLoading = Object.values(states).every(loading => loading);

  const reset = useCallback(() => {
    setStates(initialStates);
  }, [initialStates]);

  return {
    states,
    setLoading,
    isAnyLoading,
    areAllLoading,
    reset
  };
}