import { useState, useCallback, useRef, useEffect } from 'react';

import { safeLog } from '../../utils/errorHandler';
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  success: boolean;
}
export interface AsyncStateOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
}
export function useAsyncState<T>(initialData: T | null = null, options: AsyncStateOptions = {}) {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
    success: false,
  });
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { onSuccess, onError, retryCount = 0, retryDelay = 1000, timeout } = options;
  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  const execute = useCallback(
    async <TResult = T>(
      asyncFunction: (signal?: AbortSignal) => Promise<TResult>
    ): Promise<TResult | null> => {
      cleanup();
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        success: false,
      }));
      try {
        let result: TResult;
        if (timeout) {
          // Implement timeout
          const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutRef.current = setTimeout(() => {
              reject(new Error(`Operation timed out after ${timeout}ms`));
            }, timeout);
          });
          result = await Promise.race([asyncFunction(signal), timeoutPromise]);
        } else {
          result = await asyncFunction(signal);
        }
        // Check if operation was aborted
        if (signal.aborted) {
          return null;
        }
        setState({
          data: result as unknown as T,
          loading: false,
          error: null,
          success: true,
        });
        retryCountRef.current = 0;
        onSuccess?.(result);
        return result;
      } catch (error) {
        // Check if operation was aborted
        if (signal.aborted) {
          return null;
        }
        const errorObj = error instanceof Error ? error : new Error(String(error));
        // Log error
        safeLog('error', 'Async operation failed', {
          error: errorObj.message,
          retryAttempt: retryCountRef.current,
        });
        // Handle retry logic
        if (retryCountRef.current < retryCount) {
          retryCountRef.current++;
          // Wait for retry delay
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          // Retry the operation
          return execute(asyncFunction);
        }
        setState({
          data: null,
          loading: false,
          error: errorObj,
          success: false,
        });
        onError?.(errorObj);
        return null;
      } finally {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    },
    [cleanup, timeout, retryCount, retryDelay, onSuccess, onError]
  );
  const reset = useCallback(() => {
    cleanup();
    retryCountRef.current = 0;
    setState({
      data: initialData,
      loading: false,
      error: null,
      success: false,
    });
  }, [cleanup, initialData]);
  const setData = useCallback((data: T | null) => {
    setState(prev => ({
      ...prev,
      data,
      success: data !== null,
    }));
  }, []);
  const setError = useCallback((error: Error | null) => {
    setState(prev => ({
      ...prev,
      error,
      loading: false,
      success: false,
    }));
  }, []);
  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
    retry: () => (retryCountRef.current > 0 ? execute : undefined),
    cancel: cleanup,
    isRetrying: retryCountRef.current > 0,
  };
}
// Specialized hooks for common patterns
export function useAsyncOperation<T>(options?: AsyncStateOptions) {
  return useAsyncState<T>(null, options);
}
export function useAsyncData<T>(initialData: T, options?: AsyncStateOptions) {
  return useAsyncState<T>(initialData, options);
}
// Hook for handling form submissions
export function useAsyncSubmit<TData = any>(
  options?: AsyncStateOptions & {
    resetOnSuccess?: boolean;
  }
) {
  const asyncState = useAsyncState<TData>(null, options);
  const { resetOnSuccess = true } = options || {};
  const submit = useCallback(
    async <TResult = TData>(submitFunction: () => Promise<TResult>) => {
      const result = await asyncState.execute(submitFunction);
      if (result && resetOnSuccess) {
        // Reset after a short delay to show success state
        setTimeout(() => {
          asyncState.reset();
        }, 1000);
      }
      return result;
    },
    [asyncState, resetOnSuccess]
  );
  return {
    ...asyncState,
    submit,
    isSubmitting: asyncState.loading,
  };
}
export default useAsyncState;
