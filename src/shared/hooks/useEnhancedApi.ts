/**
 * KB 스타뱅킹 통합 API Hook
 * - 강화된 API 서비스 통합
 * - 로딩 상태 자동 관리
 * - 에러 처리 및 알림 자동화
 * - Android WebView 최적화
 * - 백엔드 연동 완전 자동화
 */

import React, { useEffect, useCallback, useRef } from 'react';

import { Account, Transaction, TransactionFilter, TransactionResponse, TransferRequest } from '../../services/api';
import { useLoading } from '../contexts/LoadingContext';
import { useNotification } from '../contexts/NotificationContext';
import { enhancedApiService, configureEnhancedApiService, ApiCallOptions, ApiResponse } from '../services/EnhancedApiService';
import { addNetworkListener, NetworkStatus } from '../services/NetworkService';

// React.useState 타입 임포트

// Hook 옵션
export interface UseEnhancedApiOptions {
  autoConfigureCallbacks?: boolean;
  enableNetworkStatusTracking?: boolean;
  enablePerformanceLogging?: boolean;
}

// 네트워크 상태 훅
export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = React.useState<NetworkStatus | null>(null);

  useEffect(() => {
    const removeListener = addNetworkListener((status) => {
      setNetworkStatus(status);
    });

    return removeListener;
  }, []);

  return networkStatus;
};

// 메인 Hook
export const useEnhancedApi = (options: UseEnhancedApiOptions = {}) => {
  const {
    autoConfigureCallbacks = true,
    enableNetworkStatusTracking = true,
    enablePerformanceLogging = false
  } = options;

  const { startLoading, stopLoading, updateLoadingMessage } = useLoading();
  const { showSuccess, showError, showApiError, showNetworkError } = useNotification();
  const networkStatus = enableNetworkStatusTracking ? useNetworkStatus() : null;
  const isConfiguredRef = useRef(false);

  // API 서비스와 컨텍스트 연동
  useEffect(() => {
    if (autoConfigureCallbacks && !isConfiguredRef.current) {
      configureEnhancedApiService(
        { start: startLoading, stop: stopLoading, update: updateLoadingMessage },
        { showSuccess, showError, showApiError, showNetworkError }
      );
      isConfiguredRef.current = true;
    }
  }, [autoConfigureCallbacks, startLoading, stopLoading, updateLoadingMessage, showSuccess, showError, showApiError, showNetworkError]);

  // 성능 로깅
  useEffect(() => {
    if (enablePerformanceLogging) {
      const interval = setInterval(() => {
        const stats = enhancedApiService.getPerformanceStats();
        console.log('[useEnhancedApi] Performance Stats:', stats);
      }, 30000); // 30초마다 로깅

      return () => clearInterval(interval);
    }
  }, [enablePerformanceLogging]);

  // API 호출 메서드들
  const getAccounts = useCallback((options?: ApiCallOptions) => {
    return enhancedApiService.getAccounts(options);
  }, []);

  const getAccountById = useCallback((accountId: string, options?: ApiCallOptions) => {
    return enhancedApiService.getAccountById(accountId, options);
  }, []);

  const getAccountBalance = useCallback((accountId: string, options?: ApiCallOptions) => {
    return enhancedApiService.getAccountBalance(accountId, options);
  }, []);

  const getTransactions = useCallback((filter?: TransactionFilter, options?: ApiCallOptions) => {
    return enhancedApiService.getTransactions(filter, options);
  }, []);

  const getTransactionStatistics = useCallback((
    accountId?: string,
    period?: 'today' | 'week' | 'month' | '3months' | '6months',
    options?: ApiCallOptions
  ) => {
    return enhancedApiService.getTransactionStatistics(accountId, period, options);
  }, []);

  const executeTransfer = useCallback((transferRequest: TransferRequest, options?: ApiCallOptions) => {
    return enhancedApiService.executeTransfer(transferRequest, options);
  }, []);

  const getTransferHistory = useCallback((
    accountId?: string,
    page = 1,
    limit = 20,
    options?: ApiCallOptions
  ) => {
    return enhancedApiService.getTransferHistory(accountId, page, limit, options);
  }, []);

  const batchApiCalls = useCallback(<T extends Record<string, any>>(
    calls: { [K in keyof T]: () => Promise<T[K]> },
    options?: ApiCallOptions
  ) => {
    return enhancedApiService.batchApiCalls(calls, options);
  }, []);

  // 성능 및 상태 조회 메서드들
  const getPerformanceStats = useCallback(() => {
    return enhancedApiService.getPerformanceStats();
  }, []);

  const getOptimizationStatus = useCallback(() => {
    return enhancedApiService.getOptimizationStatus();
  }, []);

  const clearCache = useCallback(() => {
    enhancedApiService.clearCache();
  }, []);

  return {
    // API 호출 메서드들
    getAccounts,
    getAccountById,
    getAccountBalance,
    getTransactions,
    getTransactionStatistics,
    executeTransfer,
    getTransferHistory,
    batchApiCalls,

    // 상태 및 성능 조회
    networkStatus,
    getPerformanceStats,
    getOptimizationStatus,
    clearCache,

    // 직접 API 서비스 접근 (고급 사용자용)
    apiService: enhancedApiService
  };
};

// 특정 API 전용 훅들
export const useAccountsApi = (options?: ApiCallOptions) => {
  const { getAccounts, getAccountById, getAccountBalance } = useEnhancedApi();

  return {
    getAccounts: useCallback((overrideOptions?: ApiCallOptions) => 
      getAccounts({ ...options, ...overrideOptions }), [getAccounts, options]
    ),
    getAccountById: useCallback((accountId: string, overrideOptions?: ApiCallOptions) => 
      getAccountById(accountId, { ...options, ...overrideOptions }), [getAccountById, options]
    ),
    getAccountBalance: useCallback((accountId: string, overrideOptions?: ApiCallOptions) => 
      getAccountBalance(accountId, { ...options, ...overrideOptions }), [getAccountBalance, options]
    )
  };
};

export const useTransactionsApi = (options?: ApiCallOptions) => {
  const { getTransactions, getTransactionStatistics } = useEnhancedApi();

  return {
    getTransactions: useCallback((filter?: TransactionFilter, overrideOptions?: ApiCallOptions) => 
      getTransactions(filter, { ...options, ...overrideOptions }), [getTransactions, options]
    ),
    getTransactionStatistics: useCallback((
      accountId?: string,
      period?: 'today' | 'week' | 'month' | '3months' | '6months',
      overrideOptions?: ApiCallOptions
    ) => 
      getTransactionStatistics(accountId, period, { ...options, ...overrideOptions }), 
      [getTransactionStatistics, options]
    )
  };
};

export const useTransferApi = (options?: ApiCallOptions) => {
  const { executeTransfer, getTransferHistory } = useEnhancedApi();

  return {
    executeTransfer: useCallback((transferRequest: TransferRequest, overrideOptions?: ApiCallOptions) => 
      executeTransfer(transferRequest, { ...options, ...overrideOptions }), [executeTransfer, options]
    ),
    getTransferHistory: useCallback((
      accountId?: string,
      page = 1,
      limit = 20,
      overrideOptions?: ApiCallOptions
    ) => 
      getTransferHistory(accountId, page, limit, { ...options, ...overrideOptions }), 
      [getTransferHistory, options]
    )
  };
};

// Android WebView 최적화 전용 훅
export const useAndroidOptimizedApi = () => {
  const api = useEnhancedApi({
    enableNetworkStatusTracking: true,
    enablePerformanceLogging: true
  });

  // Android WebView 전용 최적화된 API 옵션
  const androidOptions: ApiCallOptions = {
    retryConfig: {
      maxRetries: 2,
      baseDelay: 1500,
      maxDelay: 8000,
      backoffMultiplier: 2
    },
    showErrorNotification: true,
    cacheStrategy: 'network-first'
  };

  return {
    ...api,
    
    // Android 최적화된 메서드들
    getAccountsAndroid: useCallback(() => 
      api.getAccounts(androidOptions), [api.getAccounts]
    ),
    
    getTransactionsAndroid: useCallback((filter?: TransactionFilter) => 
      api.getTransactions(filter, androidOptions), [api.getTransactions]
    ),
    
    executeTransferAndroid: useCallback((transferRequest: TransferRequest) => 
      api.executeTransfer(transferRequest, {
        ...androidOptions,
        showSuccessMessage: true,
        successMessage: '이체가 성공적으로 완료되었습니다.'
      }), [api.executeTransfer]
    ),

    // 배치 로딩 (Android에서 효율적)
    loadDashboardData: useCallback(async () => {
      return api.batchApiCalls({
        accounts: () => api.apiService.getAccounts(),
        recentTransactions: () => api.apiService.getTransactions({ limit: 10 })
      }, {
        loadingKey: 'dashboard-data',
        loadingMessage: '대시보드 정보를 불러오고 있습니다...',
        ...androidOptions
      });
    }, [api.batchApiCalls, api.apiService])
  };
};

// 실시간 상태 감시 훅
export const useApiStatusMonitor = () => {
  const [isOnline, setIsOnline] = React.useState(true);
  const [performanceStats, setPerformanceStats] = React.useState<any>(null);
  const { getPerformanceStats, getOptimizationStatus, networkStatus } = useEnhancedApi();

  // 네트워크 상태 감시
  useEffect(() => {
    setIsOnline(networkStatus?.isOnline ?? true);
  }, [networkStatus]);

  // 성능 통계 주기적 업데이트
  useEffect(() => {
    const updateStats = () => {
      setPerformanceStats(getPerformanceStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 10000); // 10초마다

    return () => clearInterval(interval);
  }, [getPerformanceStats]);

  return {
    isOnline,
    networkStatus,
    performanceStats,
    optimizationStatus: getOptimizationStatus()
  };
};