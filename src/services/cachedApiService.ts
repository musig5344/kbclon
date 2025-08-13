/**
 * 캐시 관리를 위한 서비스와 훅
 */
import { useCallback } from 'react';

import { queryClient, clearCache } from '../core/cache/queryClient';

export const useCacheManagement = () => {
  const clearAllCache = useCallback(async () => {
    // React Query 캐시 클리어
    clearCache();
    
    // LocalStorage 클리어 (필요한 것만)
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.startsWith('kb-cache-') || 
      key.startsWith('account-') || 
      key.startsWith('transaction-')
    );
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('모든 캐시가 삭제되었습니다.');
  }, []);

  const refreshAccount = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['accounts'] });
  }, []);

  const refreshTransactions = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['transactions'] });
  }, []);

  const getCacheStatus = useCallback(() => {
    const queryCache = queryClient.getQueryCache();
    return {
      queryCount: queryCache.getAll().length,
      status: 'active'
    };
  }, []);

  return {
    clearAllCache,
    refreshAccount,
    refreshTransactions,
    getCacheStatus
  };
};