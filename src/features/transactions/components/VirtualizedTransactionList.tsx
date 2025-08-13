import React, { useState, useCallback, useMemo, useEffect } from 'react';

import styled from 'styled-components';

import VirtualizedList from '@components/common/VirtualizedList';

import { responsiveSpacing, responsiveFontSizes } from '@styles/responsive-overhaul';
import { tokens } from '@styles/tokens';

// 거래내역 타입 정의
export interface Transaction {
  id: string;
  date: string;
  time: string;
  description: string;
  amount: number;
  balance: number;
  type: 'deposit' | 'withdrawal';
  category?: string;
  memo?: string;
}

// 월별 그룹 타입
export interface MonthGroup {
  month: string;
  transactions: Transaction[];
  totalDeposit: number;
  totalWithdrawal: number;
}

// 리스트 아이템 타입 (월 헤더 + 거래내역)
export type ListItem =
  | {
      type: 'month-header';
      data: { month: string; summary: { deposits: number; withdrawals: number } };
    }
  | { type: 'transaction'; data: Transaction };

const TransactionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: ${responsiveSpacing.md} ${responsiveSpacing.lg};
  background-color: ${tokens.colors.background.primary};
  border-bottom: 1px solid ${tokens.colors.border.light};
  min-height: 72px;
  box-sizing: border-box;
`;

const TransactionLeft = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TransactionTitle = styled.div`
  font-size: ${responsiveFontSizes.bodyMedium};
  font-weight: 500;
  color: ${tokens.colors.text.primary};
  line-height: 1.4;
`;

const TransactionMeta = styled.div`
  display: flex;
  gap: ${responsiveSpacing.sm};
  font-size: ${responsiveFontSizes.bodySmall};
  color: ${tokens.colors.text.secondary};
`;

const TransactionRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  min-width: 120px;
`;

const TransactionAmount = styled.div<{ isDeposit: boolean }>`
  font-size: ${responsiveFontSizes.bodyMedium};
  font-weight: 600;
  color: ${props =>
    props.isDeposit ? tokens.colors.semantic.success : tokens.colors.text.primary};
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
`;

const TransactionBalance = styled.div`
  font-size: ${responsiveFontSizes.bodySmall};
  color: ${tokens.colors.text.tertiary};
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
`;

const MonthHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${responsiveSpacing.md} ${responsiveSpacing.lg};
  background-color: ${tokens.colors.background.secondary};
  border-bottom: 1px solid ${tokens.colors.border.light};
  min-height: 56px;
  box-sizing: border-box;
`;

const MonthTitle = styled.div`
  font-size: ${responsiveFontSizes.titleSmall};
  font-weight: 600;
  color: ${tokens.colors.text.primary};
`;

const MonthSummary = styled.div`
  display: flex;
  gap: ${responsiveSpacing.md};
  font-size: ${responsiveFontSizes.bodySmall};
`;

const SummaryItem = styled.div<{ isDeposit?: boolean }>`
  color: ${props =>
    props.isDeposit ? tokens.colors.semantic.success : tokens.colors.text.secondary};
  font-weight: 500;
`;

const LoadingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 72px;
  background-color: ${tokens.colors.background.primary};
  color: ${tokens.colors.text.secondary};
  font-size: ${responsiveFontSizes.bodySmall};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${responsiveSpacing.xl} ${responsiveSpacing.lg};
  color: ${tokens.colors.text.secondary};
  gap: ${responsiveSpacing.md};

  .icon {
    font-size: 48px;
    opacity: 0.5;
  }

  .message {
    font-size: ${responsiveFontSizes.bodyMedium};
    text-align: center;
  }
`;

export interface VirtualizedTransactionListProps {
  /** 거래내역 데이터 */
  transactions: Transaction[];
  /** 컨테이너 높이 */
  height: number;
  /** 로딩 상태 */
  loading?: boolean;
  /** 무한 스크롤 콜백 */
  onLoadMore?: () => void;
  /** 거래 항목 클릭 핸들러 */
  onTransactionClick?: (transaction: Transaction) => void;
  /** 스크롤 위치 변경 콜백 */
  onScroll?: (scrollTop: number) => void;
}

// 금액 포맷팅 유틸리티
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR').format(Math.abs(amount));
};

// 월별 그룹핑 유틸리티
const groupTransactionsByMonth = (transactions: Transaction[]): MonthGroup[] => {
  const groups = new Map<string, Transaction[]>();

  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;

    if (!groups.has(monthKey)) {
      groups.set(monthKey, []);
    }
    groups.get(monthKey)!.push(transaction);
  });

  return Array.from(groups.entries())
    .map(([month, transactions]) => {
      const totalDeposit = transactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalWithdrawal = transactions
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month,
        transactions: transactions.sort(
          (a, b) =>
            new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
        ),
        totalDeposit,
        totalWithdrawal,
      };
    })
    .sort((a, b) => b.month.localeCompare(a.month));
};

// 리스트 아이템 생성
const createListItems = (monthGroups: MonthGroup[]): ListItem[] => {
  const items: ListItem[] = [];

  monthGroups.forEach(group => {
    // 월 헤더 추가
    items.push({
      type: 'month-header',
      data: {
        month: group.month,
        summary: {
          deposits: group.totalDeposit,
          withdrawals: group.totalWithdrawal,
        },
      },
    });

    // 거래내역 추가
    group.transactions.forEach(transaction => {
      items.push({
        type: 'transaction',
        data: transaction,
      });
    });
  });

  return items;
};

const VirtualizedTransactionList: React.FC<VirtualizedTransactionListProps> = ({
  transactions,
  height,
  loading = false,
  onLoadMore,
  onTransactionClick,
  onScroll,
}) => {
  // 월별 그룹핑된 데이터 생성
  const monthGroups = useMemo(() => {
    return groupTransactionsByMonth(transactions);
  }, [transactions]);

  // 가상화를 위한 리스트 아이템 생성
  const listItems = useMemo(() => {
    return createListItems(monthGroups);
  }, [monthGroups]);

  // 아이템 높이 계산 (동적)
  const getItemHeight = useCallback((item: ListItem): number => {
    return item.type === 'month-header' ? 56 : 72;
  }, []);

  // 고정 높이로 단순화 (성능 최적화)
  const averageItemHeight = 70;

  // 아이템 렌더링
  const renderItem = useCallback(
    (item: ListItem, index: number) => {
      if (item.type === 'month-header') {
        const { month, summary } = item.data;
        return (
          <MonthHeader>
            <MonthTitle>{month}</MonthTitle>
            <MonthSummary>
              {summary.deposits > 0 && (
                <SummaryItem isDeposit>입금 {formatAmount(summary.deposits)}원</SummaryItem>
              )}
              {summary.withdrawals > 0 && (
                <SummaryItem>출금 {formatAmount(summary.withdrawals)}원</SummaryItem>
              )}
            </MonthSummary>
          </MonthHeader>
        );
      }

      const transaction = item.data;
      const isDeposit = transaction.type === 'deposit';

      return (
        <TransactionItem
          onClick={() => onTransactionClick?.(transaction)}
          style={{ cursor: onTransactionClick ? 'pointer' : 'default' }}
        >
          <TransactionLeft>
            <TransactionTitle>{transaction.description}</TransactionTitle>
            <TransactionMeta>
              <span>{new Date(transaction.date).toLocaleDateString('ko-KR')}</span>
              <span>{transaction.time}</span>
              {transaction.category && <span>{transaction.category}</span>}
            </TransactionMeta>
          </TransactionLeft>

          <TransactionRight>
            <TransactionAmount isDeposit={isDeposit}>
              {isDeposit ? '+' : '-'}
              {formatAmount(transaction.amount)}원
            </TransactionAmount>
            <TransactionBalance>잔액 {formatAmount(transaction.balance)}원</TransactionBalance>
          </TransactionRight>
        </TransactionItem>
      );
    },
    [onTransactionClick]
  );

  // 키 생성
  const getItemKey = useCallback((item: ListItem, index: number): string => {
    if (item.type === 'month-header') {
      return `month-${item.data.month}`;
    }
    return `transaction-${item.data.id}`;
  }, []);

  // 로딩 컴포넌트
  const loadingComponent = useMemo(() => <LoadingItem>거래내역을 불러오는 중...</LoadingItem>, []);

  // 빈 상태 컴포넌트
  const emptyComponent = useMemo(
    () => (
      <EmptyState>
        <div className='icon'>📋</div>
        <div className='message'>
          거래내역이 없습니다.
          <br />
          거래가 발생하면 이곳에 표시됩니다.
        </div>
      </EmptyState>
    ),
    []
  );

  // 무한 스크롤 처리
  const handleEndReached = useCallback(() => {
    if (!loading && onLoadMore) {
      onLoadMore();
    }
  }, [loading, onLoadMore]);

  return (
    <VirtualizedList
      items={listItems}
      itemHeight={averageItemHeight}
      containerHeight={height}
      renderItem={renderItem}
      getItemKey={getItemKey}
      isLoading={loading}
      loadingComponent={loadingComponent}
      emptyComponent={emptyComponent}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.8}
      onScroll={onScroll}
      overscan={3}
      scrollThrottleMs={16}
    />
  );
};

export default React.memo(VirtualizedTransactionList);

// 훅 - 가상화된 거래내역 관리
export const useVirtualizedTransactions = (initialTransactions: Transaction[] = []) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      // API 호출 시뮬레이션 (실제 구현에서는 실제 API 호출)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 더미 데이터 생성 (실제로는 API에서 받은 데이터)
      const newTransactions: Transaction[] = Array.from({ length: 20 }, (_, i) => ({
        id: `${page}-${i}`,
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        time: `${Math.floor(Math.random() * 24)
          .toString()
          .padStart(2, '0')}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, '0')}`,
        description: `거래내역 ${page * 20 + i + 1}`,
        amount: Math.floor(Math.random() * 1000000),
        balance: Math.floor(Math.random() * 10000000),
        type: Math.random() > 0.5 ? 'deposit' : 'withdrawal',
        category: ['식료품', '교통', '쇼핑', '의료', '엔터테인먼트'][Math.floor(Math.random() * 5)],
      }));

      setTransactions(prev => [...prev, ...newTransactions]);
      setPage(prev => prev + 1);

      // 페이지 5까지만 로드
      if (page >= 5) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('거래내역 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  const refresh = useCallback(async () => {
    setPage(1);
    setHasMore(true);
    setTransactions([]);
    await loadMore();
  }, [loadMore]);

  return {
    transactions,
    loading,
    hasMore,
    loadMore,
    refresh,
    setTransactions,
  };
};
