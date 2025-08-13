/**
 * KB 스타뱅킹 강화된 계좌 데이터 Hook
 * - 기존 useAccountData의 향상된 버전
 * - 강화된 API 서비스 통합
 * - Android WebView 최적화
 * - 백엔드 연동 자동화
 */

import { useState, useEffect, useCallback, useRef } from 'react';

import { useAuth } from '@core/auth/AuthContext';

import { safeLog } from '@utils/errorHandler';

import type { Account } from '@services/api';

import { useEnhancedApi, useAccountsApi } from './useEnhancedApi';

interface NetworkStatus {
  isOnline: boolean;
  connectionType?: string;
  rtt?: number;
}

interface PerformanceStats {
  lastRequestTime?: number;
  cacheHitRate?: number;
  errorCount?: number;
}

interface UseEnhancedAccountDataResult {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  invalidateCache: () => void;
  networkStatus: NetworkStatus | null;
  performanceStats: PerformanceStats | null;
  isOptimizedForAndroid: boolean;
}

export const useEnhancedAccountData = (): UseEnhancedAccountDataResult => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // 강화된 API 서비스 사용
  const { networkStatus, getPerformanceStats, clearCache } = useEnhancedApi();
  const accountsApi = useAccountsApi({
    showErrorNotification: true,
    retryConfig: {
      maxRetries: 2,
      baseDelay: 1500,
      maxDelay: 8000,
      backoffMultiplier: 2,
    },
  });

  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

  // 캐시 무효화 함수 (강화된 API 서비스와 통합)
  const invalidateCache = useCallback(() => {
    if (user?.id) {
      const cacheKey = `accounts_${user.id}`;
      localStorage.removeItem(cacheKey);
      clearCache(); // 강화된 API 서비스 캐시도 클리어
      safeLog('info', '계좌 캐시 무효화됨 (강화된 버전)');
    }
  }, [user?.id, clearCache]);

  // 계좌 데이터 가져오기 (강화된 API 서비스 사용)
  const fetchAccounts = useCallback(
    async (isRetry = false, abortController?: AbortController) => {
      if (!user?.id || !isMountedRef.current) return;

      const controller = abortController || new AbortController();

      try {
        setIsLoading(true);
        setError(null);

        // 로컬 캐시 확인 (백엔드 캐시와 별도)
        const cacheKey = `accounts_${user.id}`;
        const cachedData = localStorage.getItem(cacheKey);

        // Android에서는 더 짧은 캐시 시간 사용
        const cacheExpiry = isAndroid ? 90 * 1000 : 2 * 60 * 1000; // Android: 1.5분, 기타: 2분

        if (cachedData && !isRetry) {
          const { data, timestamp } = JSON.parse(cachedData);
          const now = Date.now();
          const cacheAge = now - timestamp;

          if (cacheAge < cacheExpiry) {
            if (controller.signal.aborted) return;
            setAccounts(data);
            setIsLoading(false);
            safeLog('info', `로컬 캐시된 계좌 데이터 사용 (${isAndroid ? 'Android' : 'Web'} 모드)`);
            return;
          }
        }

        // 강화된 API 서비스로 데이터 가져오기
        if (controller.signal.aborted) return;

        const response = await accountsApi.getAccounts({
          silentMode: isRetry, // 재시도 시엔 알림 없이
          cacheStrategy: isRetry ? 'network-only' : 'cache-first',
          loadingKey: isRetry ? undefined : 'accounts', // 재시도시 로딩 표시 안함
        });

        if (isMountedRef.current && !controller.signal.aborted) {
          if (response.success && response.data) {
            setAccounts(response.data);

            // 로컬 캐시도 업데이트
            localStorage.setItem(
              cacheKey,
              JSON.stringify({
                data: response.data,
                timestamp: Date.now(),
              })
            );

            safeLog('info', `계좌 ${response.data.length}개 로드됨 (강화된 API 사용)`);

            // Android WebView에서 추가 로깅
            if (isAndroid && response.networkStatus) {
              const { isOnline, connectionType, rtt } = response.networkStatus;
              safeLog(
                'info',
                `Android WebView - 네트워크: ${isOnline ? '온라인' : '오프라인'} (${connectionType}, RTT: ${rtt}ms)`
              );
            }

            if (response.fromCache) {
              safeLog('info', '백엔드 캐시에서 데이터 반환됨');
            }

            if (response.retryCount && response.retryCount > 0) {
              safeLog('info', `${response.retryCount}회 재시도 후 성공`);
            }
          } else {
            throw new Error(response.error || '계좌 정보를 불러올 수 없습니다.');
          }
        }
      } catch (err) {
        if (!isMountedRef.current || controller.signal.aborted) return;

        const errorMessage = err instanceof Error ? err.message : '계좌 정보를 불러올 수 없습니다.';

        // Android WebView에서 특별 처리
        if (isAndroid) {
          safeLog('error', `Android WebView 계좌 로딩 실패: ${errorMessage}`, err);
        }

        setError(errorMessage);

        // 최후 수단으로 로컬 캐시 사용
        const cacheKey = `accounts_${user.id}`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          try {
            const { data } = JSON.parse(cachedData);
            setAccounts(data);
            setError('오프라인 모드 - 로컬 캐시 데이터 표시 중');
            safeLog('warn', '모든 재시도 실패, 로컬 캐시 데이터 사용');
          } catch (cacheErr) {
            safeLog('error', '캐시 데이터 파싱 실패', cacheErr);
          }
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [user?.id, accountsApi, isAndroid]
  );

  // 수동 새로고침 (강화된 API 서비스와 통합)
  const refetch = useCallback(async () => {
    invalidateCache();
    await fetchAccounts(true);
  }, [fetchAccounts, invalidateCache]);

  // 초기 로드 및 의존성 변경 시 로드
  useEffect(() => {
    isMountedRef.current = true;
    const controller = new AbortController();

    if (user?.id) {
      fetchAccounts(false, controller);
    } else {
      setAccounts([]);
      setIsLoading(false);
      setError(null);
    }

    return () => {
      isMountedRef.current = false;
      controller.abort();
    };
  }, [user?.id]); // fetchAccounts를 의존성에서 제외하여 무한 루프 방지

  // Android WebView에서 포커스/가시성 변경 시 데이터 새로고침
  useEffect(() => {
    if (!isAndroid || !user?.id) return;

    let focusController: AbortController | null = null;

    const handleFocus = () => {
      if (!isLoading && isMountedRef.current) {
        safeLog('info', 'Android WebView 포커스 - 계좌 데이터 새로고침');
        if (focusController) focusController.abort();
        focusController = new AbortController();
        fetchAccounts(false, focusController);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && !isLoading && isMountedRef.current) {
        safeLog('info', 'Android WebView 활성화 - 계좌 데이터 새로고침');
        if (focusController) focusController.abort();
        focusController = new AbortController();
        fetchAccounts(false, focusController);
      }
    };

    // Android WebView 특화 이벤트 리스너
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Android WebView에서 앱 재개 감지
    document.addEventListener('resume', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('resume', handleFocus);
      if (focusController) focusController.abort();
    };
  }, [user?.id, isLoading, fetchAccounts, isAndroid]);

  // 네트워크 상태 변화 감지
  useEffect(() => {
    if (networkStatus?.isOnline === false && accounts.length === 0) {
      // 오프라인이고 데이터가 없으면 캐시 시도
      const cacheKey = `accounts_${user?.id}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const { data } = JSON.parse(cachedData);
          setAccounts(data);
          setError('오프라인 모드 - 캐시된 데이터 표시 중');
          setIsLoading(false);
          safeLog('info', '네트워크 오프라인 - 캐시 데이터로 복구');
        } catch (err) {
          safeLog('error', '오프라인 캐시 복구 실패', err);
        }
      }
    } else if (networkStatus?.isOnline === true && error?.includes('오프라인')) {
      // 온라인 복구 시 데이터 새로고침
      safeLog('info', '네트워크 온라인 복구 - 계좌 데이터 새로고침');
      fetchAccounts(false);
    }
  }, [networkStatus?.isOnline, accounts.length, user?.id, error, fetchAccounts]);

  return {
    accounts,
    isLoading,
    error,
    refetch,
    invalidateCache,
    networkStatus,
    performanceStats: getPerformanceStats(),
    isOptimizedForAndroid: isAndroid,
  };
};

// 기존 hook과의 호환성을 위한 별칭
export const useAccountData = useEnhancedAccountData;
