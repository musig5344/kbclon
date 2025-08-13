/**
 * React Query Provider
 * 애플리케이션 전체에 React Query 기능을 제공
 */
import React, { useEffect } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient, warmupCache, restoreCache } from '../../core/cache/queryClient';
import { safeLog } from '../../utils/errorHandler';

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  useEffect(() => {
    // 애플리케이션 시작 시 캐시 워밍
    warmupCache().catch(error => {
      safeLog('error', '캐시 워밍 실패', error);
    });

    // 영속화된 캐시 복원
    restoreCache().catch(error => {
      safeLog('error', '캐시 복원 실패', error);
    });

    // 온라인/오프라인 상태 변경 감지
    const handleOnline = () => {
      safeLog('info', '🌐 온라인 상태로 전환');
      // 온라인 전환 시 백그라운드에서 데이터 새로고침
      queryClient.refetchQueries();
    };

    const handleOffline = () => {
      safeLog('warn', '📵 오프라인 상태로 전환');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 페이지 가시성 변경 감지 (보안 강화)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 페이지가 숨겨질 때 민감한 데이터 캐시 무효화 고려
        safeLog('info', '👁️ 페이지 숨김 상태');
      } else {
        // 페이지가 다시 보일 때
        safeLog('info', '👁️ 페이지 활성화');
        // 금융 앱은 보안상 자동 새로고침을 하지 않음
        // 사용자가 명시적으로 새로고침하도록 유도
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
};