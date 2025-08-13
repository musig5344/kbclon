import { useState, useCallback, useEffect } from 'react';

import { safeLog, ErrorType } from '../../utils/errorHandler';
export interface ErrorState {
  error: Error | null;
  errorType: ErrorType | null;
  isVisible: boolean;
  retryCount: number;
}
export interface ErrorHandlerOptions {
  maxRetries?: number;
  autoHide?: boolean;
  autoHideDelay?: number;
  onError?: (error: Error, type: ErrorType) => void;
  onRetry?: () => void;
  onMaxRetriesReached?: () => void;
}
const getErrorCategory = (error: Error): ErrorType => {
  const message = error.message.toLowerCase();
  if (message.includes('network') || message.includes('fetch')) {
    return ErrorType.NETWORK_ERROR;
  }
  if (message.includes('unauthorized') || message.includes('auth')) {
    return ErrorType.AUTH_ERROR;
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return ErrorType.VALIDATION_ERROR;
  }
  if (message.includes('server') || message.includes('500')) {
    return ErrorType.SERVER_ERROR;
  }
  return ErrorType.UNKNOWN_ERROR;
};
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    maxRetries = 3,
    autoHide = false,
    autoHideDelay = 5000,
    onError,
    onRetry,
    onMaxRetriesReached,
  } = options;
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    errorType: null,
    isVisible: false,
    retryCount: 0,
  });
  const [hideTimeoutId, setHideTimeoutId] = useState<NodeJS.Timeout | null>(null);
  // Auto-hide error after delay
  useEffect(() => {
    if (errorState.isVisible && autoHide) {
      const timeoutId = setTimeout(() => {
        hideError();
      }, autoHideDelay);
      setHideTimeoutId(timeoutId);
      return () => {
        clearTimeout(timeoutId);
      };
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorState.isVisible, autoHide, autoHideDelay]);
  const showError = useCallback(
    (error: Error, incrementRetry = false) => {
      const errorType = getErrorCategory(error);
      // Log error using centralized error handler
      safeLog('error', 'Error handled by useErrorHandler', {
        error: error.message,
        type: errorType,
        retryCount: errorState.retryCount + (incrementRetry ? 1 : 0),
      });
      setErrorState(prev => ({
        error,
        errorType,
        isVisible: true,
        retryCount: incrementRetry ? prev.retryCount + 1 : prev.retryCount,
      }));
      // Clear any existing hide timeout
      if (hideTimeoutId) {
        clearTimeout(hideTimeoutId);
        setHideTimeoutId(null);
      }
      onError?.(error, errorType);
    },
    [errorState.retryCount, hideTimeoutId, onError]
  );
  const hideError = useCallback(() => {
    setErrorState(prev => ({
      ...prev,
      isVisible: false,
    }));
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId);
      setHideTimeoutId(null);
    }
  }, [hideTimeoutId]);
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      errorType: null,
      isVisible: false,
      retryCount: 0,
    });
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId);
      setHideTimeoutId(null);
    }
  }, [hideTimeoutId]);
  const retry = useCallback(() => {
    if (errorState.retryCount >= maxRetries) {
      onMaxRetriesReached?.();
      return false;
    }
    setErrorState(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      isVisible: false,
    }));
    onRetry?.();
    return true;
  }, [errorState.retryCount, maxRetries, onRetry, onMaxRetriesReached]);
  const canRetry = errorState.retryCount < maxRetries;
  return {
    ...errorState,
    showError,
    hideError,
    clearError,
    retry,
    canRetry,
    hasMaxRetries: errorState.retryCount >= maxRetries,
  };
}
// Specialized error handlers for common scenarios
export function useApiErrorHandler(options?: Omit<ErrorHandlerOptions, 'maxRetries'>) {
  return useErrorHandler({
    maxRetries: 3,
    autoHide: false,
    ...options,
  });
}
export function useFormErrorHandler(options?: Omit<ErrorHandlerOptions, 'autoHide'>) {
  return useErrorHandler({
    autoHide: true,
    autoHideDelay: 3000,
    maxRetries: 0,
    ...options,
  });
}
export function useNetworkErrorHandler(options?: ErrorHandlerOptions) {
  return useErrorHandler({
    maxRetries: 5,
    autoHide: false,
    ...options,
  });
}
export default useErrorHandler;
