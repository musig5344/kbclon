/**
 * 거래내역 관련 커스텀 훅
 * 백엔드 연동 및 상태 관리를 담당
 */
import { useState, useEffect, useCallback, useMemo } from 'react';

import { apiService, Transaction, TransactionFilter, TransactionResponse, TransactionStatistics } from '../../../services/api';
import { safeLog } from '../../../utils/errorHandler';
interface UseTransactionsResult {
  // 데이터
  transactions: Transaction[];
  statistics: TransactionStatistics | null;
  pagination: TransactionResponse['pagination'] | null;
  // 상태
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  // 필터
  filters: TransactionFilter;
  // 액션
  setFilters: (filters: Partial<TransactionFilter>) => void;
  loadTransactions: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  loadStatistics: (period?: 'today' | 'week' | 'month' | '3months' | '6months') => Promise<void>;
  // 추가 유틸리티
  groupedTransactions: { [date: string]: Transaction[] };
  summary: {
    totalIncome: number;
    totalExpense: number;
    totalTransfer: number;
    totalCount: number;
    netAmount: number;
  };
}
interface UseTransactionsOptions {
  accountId?: string;
  initialFilters?: Partial<TransactionFilter>;
  autoLoad?: boolean;
  pageSize?: number;
}
export const useTransactions = (options: UseTransactionsOptions = {}): UseTransactionsResult => {
  const {
    accountId,
    initialFilters = {},
    autoLoad = true,
    pageSize = 50
  } = options;
  // 상태 관리
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statistics, setStatistics] = useState<TransactionStatistics | null>(null);
  const [pagination, setPagination] = useState<TransactionResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 필터 상태
  const [filters, setFiltersState] = useState<TransactionFilter>({
    account_id: accountId,
    page: 1,
    limit: pageSize,
    sort_by: 'date_desc',
    ...initialFilters
  });
  // 필터 업데이트 함수
  const setFilters = useCallback((newFilters: Partial<TransactionFilter>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1 // 필터 변경시 첫 페이지로
    }));
  }, []);
  // 거래내역 로드 - 항상 최신 데이터 가져오기 (캐시 사용 안함)
  const loadTransactions = useCallback(async (append: boolean = false, currentFilters?: TransactionFilter, _forceRefresh: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);
      // 전달받은 필터 또는 현재 필터 사용
      const filtersToUse = currentFilters || filters;
      // forceRefresh가 true면 캐시 무시하고 항상 새로운 데이터 가져오기
      const response = await apiService.getTransactions(filtersToUse);
      if (append) {
        setTransactions(prev => [...prev, ...response.transactions]);
      } else {
        setTransactions(response.transactions);
      }
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '거래내역을 불러오는데 실패했습니다.';
      setError(errorMessage);
      safeLog('error', '거래내역 로드 실패', err);
    } finally {
      setLoading(false);
    }
  }, [filters]); // filters 의존성 유지
  // 더 많은 거래내역 로드 (무한 스크롤용)
  const loadMore = useCallback(async () => {
    if (!pagination?.has_next) {
      return;
    }
    if (loading) {
      return;
    }
    try {
      setLoading(true);
      const nextPage = (filters.page || 1) + 1;
      const nextFilters = {
        ...filters,
        page: nextPage
      };
      const response = await apiService.getTransactions(nextFilters);
      setTransactions(prev => [...prev, ...response.transactions]);
      setPagination(response.pagination);
      setFiltersState(prev => ({ ...prev, page: nextFilters.page }));
    } catch (err) {
      safeLog('error', '추가 거래내역 로드 실패', err);
    } finally {
      setLoading(false);
    }
  }, [pagination, loading, filters]); // filters 의존성 추가
  // 새로고침
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const refreshFilters = { ...filters, page: 1 };
      setFiltersState(prev => ({ ...prev, page: 1 }));
      const response = await apiService.getTransactions(refreshFilters);
      setTransactions(response.transactions);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '새로고침에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setRefreshing(false);
    }
  }, [filters]); // filters 의존성 추가
  // 통계 정보 로드
  const loadStatistics = useCallback(async (period?: 'today' | 'week' | 'month' | '3months' | '6months') => {
    try {
      const stats = await apiService.getTransactionStatistics(accountId, period);
      setStatistics(stats);
    } catch (err) {
      safeLog('error', '통계 정보 로드 실패', err);
    }
  }, [accountId]);
  // 초기 로드 - 페이지 진입시 항상 최신 데이터로 새로고침
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    if (autoLoad && accountId) {
      loadTransactions(false, filters, true); // forceRefresh = true
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, accountId]); // accountId 변경시마다 새로 로드
  // 필터 변경 감지 (페이지 제외)
  const filterKey = JSON.stringify({
    start_date: filters.start_date,
    end_date: filters.end_date,
    transaction_type: filters.transaction_type,
    sort_by: filters.sort_by,
    min_amount: filters.min_amount,
    max_amount: filters.max_amount
  });
  useEffect(() => {
    if (isInitialized && filters.page === 1) {
      loadTransactions(false, filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, isInitialized]); // 필터 키 변경 감지
  // 계좌 ID가 변경되면 필터 업데이트 (무한루프 방지)
  useEffect(() => {
    if (accountId && accountId !== filters.account_id) {
      setFiltersState(prev => ({ ...prev, account_id: accountId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]); // filters 의존성 제거
  // 메모이제이션된 필터된 거래내역 (클라이언트사이드 추가 필터링용)
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];
    // 클라이언트사이드에서 추가 필터링이 필요한 경우
    // 예: 실시간 검색 등
    return filtered;
  }, [transactions]);
  // 메모이제이션된 그룹화된 거래내역 (날짜별)
  const groupedTransactions = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });
    return groups;
  }, [filteredTransactions]);
  // 메모이제이션된 요약 정보
  const summary = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.transaction_type === '입금')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions
      .filter(t => t.transaction_type === '출금')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalTransfer = filteredTransactions
      .filter(t => t.transaction_type === '이체')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome,
      totalExpense,
      totalTransfer,
      totalCount: filteredTransactions.length,
      netAmount: totalIncome - totalExpense - totalTransfer
    };
  }, [filteredTransactions]);
  return {
    // 데이터
    transactions: filteredTransactions,
    statistics,
    pagination,
    // 상태
    loading,
    error,
    refreshing,
    // 필터
    filters,
    // 액션
    setFilters,
    loadTransactions: () => loadTransactions(false, filters, true), // 항상 최신 데이터
    loadMore,
    refresh,
    loadStatistics,
    // 추가 유틸리티 (필요시 사용)
    groupedTransactions,
    summary
  };
};
// 특정 계좌의 거래내역을 위한 편의 훅
export const useAccountTransactions = (accountId: string, initialFilters?: Partial<TransactionFilter>) => {
  return useTransactions({
    accountId,
    initialFilters,
    autoLoad: true
  });
};
// 통계 정보만 필요한 경우를 위한 훅
export const useTransactionStatistics = (accountId?: string) => {
  const [statistics, setStatistics] = useState<TransactionStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadStatistics = useCallback(async (period?: 'today' | 'week' | 'month' | '3months' | '6months') => {
    setLoading(true);
    setError(null);
    try {
      const stats = await apiService.getTransactionStatistics(accountId, period);
      setStatistics(stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '통계 정보를 불러오는데 실패했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [accountId]);
  useEffect(() => {
    loadStatistics('month');
  }, [loadStatistics]);
  return {
    statistics,
    loading,
    error,
    loadStatistics
  };
};