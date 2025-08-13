import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import arrowLeftIcon from '../../assets/images/icons/icon_arrow_left_white.png';
import { useAuth } from '../../core/auth/AuthContext';
import { accountService, DatabaseAccount } from '../../lib/supabase';
import { TransactionFilter, Transaction } from '../../services/api';
import { TransactionPageSkeleton } from '../../shared/components/ui/TransactionSkeleton';
import { safeLog } from '../../utils/errorHandler';
import { formatCurrency } from '../../utils/textFormatter';
import { KBMenuPage } from '../menu/components/KBMenuPage';

import {
  Container,
  Header,
  BackButton,
  HeaderTitle,
  HeaderRight,
  HomeButton,
  MenuButton,
  TransactionList,
} from './AccountTransactionPage.styles';
import AccountInfoSection from './components/AccountInfoSection';
import SearchFilterSection from './components/SearchFilterSection';
import TransactionDetailModal from './components/TransactionDetailModal';
import TransactionFilterModal, {
  FilterState as FilterModalState,
} from './components/TransactionFilterModal';
import TransactionGroup from './components/TransactionGroup';
import { useTransactions } from './hooks/useTransactions';
import {
  calculateDateRange,
  getSearchPlaceholder as createSearchPlaceholder,
  groupTransactionsByMonth,
  isFilterModified,
  getDefaultFilters,
  parseAmountString,
} from './utils/transactionUtils';
/**
 * KB 스타뱅킹 계좌별 거래내역조회 페이지
 * - 원본 앱과 100% 동일한 UI/UX
 * - 날짜, 거래내역, 금액 표시 방식 완벽 재현
 */
const AccountTransactionPage: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  const [account, setAccount] = useState<DatabaseAccount | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [dateRange, setDateRange] = useState('2025.04.22 - 2025.07.21');
  const [, setIsFiltered] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  // 기본 필터 설정
  const defaultFilters = getDefaultFilters();
  const [appliedFilters, setAppliedFilters] = useState<FilterModalState>(defaultFilters);
  const [tempFilters, setTempFilters] = useState<FilterModalState>(defaultFilters);
  // 무한 스크롤을 위한 ref
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  // useTransactions 훅 사용
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    pagination,
    filters: currentFilters,
    setFilters,
    loadMore,
  } = useTransactions({
    accountId: accountId || '',
    initialFilters: {
      limit: 50,
      sort_by: 'date_desc',
    },
    autoLoad: !!accountId,
  });
  // 날짜별 그룹핑 - 메모이제이션으로 성능 최적화
  const groupedTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {};
    }
    return groupTransactionsByMonth(transactions);
  }, [transactions]);
  const loading = accountLoading || transactionsLoading;
  const error = transactionsError;
  // 직접 API 호출로 거래내역 로드
  // 무한 스크롤을 위한 Intersection Observer 설정
  useEffect(() => {
    if (!pagination?.has_next) {
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          if (!transactionsLoading) {
            loadMore();
          }
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0,
      }
    );
    observerRef.current = observer;
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [pagination?.has_next, transactionsLoading, loadMore]);
  // 필터 초기화 함수 (향후 사용을 위해 보관)
  // const resetFilters = useCallback(() => {
  //   setTempFilters(defaultFilters);
  //   setAppliedFilters(defaultFilters);
  //   setIsFiltered(false);
  //
  //   // 기본 날짜 범위 설정
  //   const dateRange = calculateDateRange('3개월');
  //   setDateRange(`${dateRange.start} - ${dateRange.end}`);
  //
  //   // 기본 거래내역 다시 로드
  //   if (accountId) {
  //     refresh();
  //   }
  // }, [accountId, calculateDateRange, defaultFilters, refresh]);
  // 필터와 함께 거래내역 로드
  const loadTransactionsWithFilters = useCallback(
    (filterParams: Partial<TransactionFilter>) => {
      if (!accountId) return;
      safeLog('info', '필터 적용으로 거래내역 조회', filterParams);
      setFilters(filterParams);
    },
    [accountId, setFilters]
  );
  useEffect(() => {
    // 페이지 진입시 항상 최신 계좌 정보 로드
    loadAccount(true);
    // 초기 날짜 범위 설정
    const initialDateRange = calculateDateRange('3개월');
    setDateRange(`${initialDateRange.start} - ${initialDateRange.end}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, userId]);
  // 한 번만 실행되도록 ref 사용
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (accountId && userId && !hasLoadedRef.current) {
      safeLog('info', '거래내역 로드 시작', { accountId, userId });
      hasLoadedRef.current = true;
      // 거래내역은 useTransactions 훅에서 자동으로 로드됨
    }
  }, [accountId, userId]);
  const loadAccount = async (forceRefresh: boolean = false) => {
    if (!accountId || !userId) return;
    try {
      setAccountLoading(true);
      // 캐시 무시하고 항상 최신 데이터 가져오기
      const accounts = await accountService.getUserAccounts(userId, {
        bypassCache: true,
        _timestamp: forceRefresh ? Date.now() : undefined,
      });
      const foundAccount = accounts.find(acc => acc.id === accountId);
      setAccount(foundAccount || null);
    } catch (error) {
      safeLog('error', '계좌 조회 실패', error);
    } finally {
      setAccountLoading(false);
    }
  };
  // const handleSearchChange = (query: string) => {
  //   setSearchQuery(query);
  //   // 실시간 검색은 성능상 debounce 적용 권장
  //   // 여기서는 단순 필터링으로 구현
  //   if (query.trim()) {
  //     // 검색어가 있으면 로컬 필터링
  //     // 실제로는 백엔드에서 검색하는 것이 좋음
  //   }
  // };
  // 필터 적용 함수
  const handleFilterApply = useCallback(
    (filters: FilterModalState) => {
      safeLog('info', '필터 적용', filters);
      // 적용된 필터 상태 업데이트
      setAppliedFilters(filters);
      setIsFiltered(isFilterModified(filters));
      // 날짜 범위 계산 및 업데이트
      let dateInfo;
      if (filters.period === '직접입력' && filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        dateInfo = {
          start: start.toISOString().split('T')[0].replace(/-/g, '.'),
          end: end.toISOString().split('T')[0].replace(/-/g, '.'),
          startISO: filters.startDate,
          endISO: filters.endDate,
        };
      } else {
        dateInfo = calculateDateRange(filters.period);
      }
      setDateRange(`${dateInfo.start} - ${dateInfo.end}`);
      // API 파라미터 구성
      const apiFilters: TransactionFilter = {
        account_id: accountId,
        page: 1,
        limit: 50,
      };
      // 거래 유형 필터
      if (filters.type !== '전체') {
        apiFilters.transaction_type = filters.type as 'all' | '이체' | '입금' | '출금';
      }
      // 정렬 순서
      apiFilters.sort_by = filters.sort === '최신순' ? 'date_desc' : 'date_asc';
      // 금액 범위
      if (filters.amount.min) {
        apiFilters.min_amount = parseAmountString(filters.amount.min);
      }
      if (filters.amount.max) {
        apiFilters.max_amount = parseAmountString(filters.amount.max);
      }
      // 기간 필터
      apiFilters.start_date = dateInfo.startISO;
      apiFilters.end_date = dateInfo.endISO;
      // 필터 적용하여 거래내역 다시 로드
      loadTransactionsWithFilters(apiFilters);
      setTempFilters(filters);
    },
    [accountId, calculateDateRange, loadTransactionsWithFilters]
  );
  // 검색바 placeholder 동적 생성
  const getSearchPlaceholder = useCallback(() => {
    return createSearchPlaceholder(appliedFilters);
  }, [appliedFilters]);
  // const handleDateRangeChange = (start: string, end: string) => {
  //   setDateRange(`${start} - ${end}`);
  // };
  if (loading) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <img src={arrowLeftIcon} alt='뒤로가기' />
          </BackButton>
          <HeaderTitle>거래내역조회</HeaderTitle>
          <HeaderRight>
            <HomeButton to='/dashboard'>
              <img src='/assets/images/icons/icon_home.png' alt='' />
            </HomeButton>
            <MenuButton onClick={() => setShowMenu(true)}>
              <img src='/assets/images/icons/icon_appbar_menu.png' alt='메뉴' />
            </MenuButton>
          </HeaderRight>
        </Header>
        <TransactionPageSkeleton />
      </Container>
    );
  }
  if (!account) {
    return (
      <Container>
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div>계좌를 찾을 수 없습니다.</div>
        </div>
      </Container>
    );
  }
  if (showMenu) {
    return <KBMenuPage onClose={() => setShowMenu(false)} />;
  }
  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <img src={arrowLeftIcon} alt='뒤로가기' />
        </BackButton>
        <HeaderTitle>거래내역조회</HeaderTitle>
        <HeaderRight>
          <HomeButton to='/dashboard'>
            <img src='/assets/images/icons/icon_home.png' alt='' />
          </HomeButton>
          <MenuButton onClick={() => setShowMenu(true)}>
            <img src='/assets/images/icons/icon_appbar_menu.png' alt='메뉴' />
          </MenuButton>
        </HeaderRight>
      </Header>
      <AccountInfoSection
        account={account}
        showBalance={showBalance}
        onToggleBalance={() => setShowBalance(!showBalance)}
      />
      <SearchFilterSection
        dateRange={dateRange}
        showBalance={showBalance}
        appliedFilters={appliedFilters}
        onToggleBalance={() => setShowBalance(!showBalance)}
        onFilterClick={() => {
          // 모달 열 때 현재 적용된 필터를 tempFilters에 설정
          setTempFilters(appliedFilters);
          setShowFilterModal(true);
        }}
        getSearchPlaceholder={getSearchPlaceholder}
      />
      <TransactionList>
        {error ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#d32f2f' }}>
            거래내역 조회 실패: {error}
          </div>
        ) : Object.keys(groupedTransactions).length === 0 && !loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666666' }}>
            거래내역이 없습니다.
          </div>
        ) : (
          Object.entries(groupedTransactions).map(([month, monthTransactions]) => (
            <TransactionGroup
              key={month}
              title={month}
              transactions={monthTransactions}
              showBalance={showBalance}
              onTransactionClick={setSelectedTransaction}
              headerVariant='month'
            />
          ))
        )}
        {/* 무한 스크롤 트리거 (숨김 처리) */}
        {pagination?.has_next && (
          <div
            ref={loadMoreRef}
            style={{
              height: '1px',
              opacity: 0,
              pointerEvents: 'none',
            }}
          />
        )}
      </TransactionList>
      {/* 필터 모달 */}
      <TransactionFilterModal
        show={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={tempFilters}
        onApply={handleFilterApply}
        showDateInputs={true}
      />
      {/* 거래내역 상세 모달 */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </Container>
  );
};
export default AccountTransactionPage;
