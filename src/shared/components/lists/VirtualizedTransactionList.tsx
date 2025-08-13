import React, { useRef, useEffect, useState, useCallback } from 'react';

import styled from 'styled-components';

import { tokens } from '../../../styles/tokens';

/**
 * 가상화된 거래내역 리스트 컴포넌트
 * - 대량의 거래내역을 효율적으로 렌더링
 * - 보이는 영역만 렌더링하여 성능 최적화
 * - 스크롤 성능 향상
 */

const VirtualListContainer = styled.div`
  position: relative;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const VirtualListContent = styled.div`
  position: relative;
`;

const TransactionItem = styled.div<{ $offset: number }>`
  position: absolute;
  top: ${props => props.$offset}px;
  left: 0;
  right: 0;
  padding: 16px 24px;
  border-bottom: 1px solid ${tokens.colors.background.secondary};
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${tokens.colors.background.secondary};
  }
  
  &:active {
    background-color: ${tokens.colors.background.secondary};
  }
`;

const TransactionInfo = styled.div`
  flex: 1;
`;

const TransactionDesc = styled.div`
  font-size: 14px;
  color: ${tokens.colors.textPrimary};
  margin-bottom: 4px;
`;

const TransactionDate = styled.div`
  font-size: 12px;
  color: ${tokens.colors.textSecondary};
`;

const TransactionAmount = styled.div<{ $isIncome: boolean }>`
  text-align: right;
  
  .amount {
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.$isIncome ? tokens.colors.success : tokens.colors.textPrimary};
  }
  
  .balance {
    font-size: 12px;
    color: ${tokens.colors.textSecondary};
    margin-top: 4px;
  }
`;

interface Transaction {
  id: string;
  date: string;
  time: string;
  desc: string;
  amount: number;
  balance: number;
  type: 'income' | 'expense';
}

interface VirtualizedTransactionListProps {
  transactions: Transaction[];
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
  onItemClick?: (transaction: Transaction) => void;
}

export const VirtualizedTransactionList: React.FC<VirtualizedTransactionListProps> = ({
  transactions,
  itemHeight = 80,
  containerHeight = 600,
  overscan = 3,
  onItemClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // 가시 영역 계산
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    transactions.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = transactions.slice(startIndex, endIndex + 1);
  const totalHeight = transactions.length * itemHeight;

  // 스크롤 핸들러
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    // 스크롤 종료 감지
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  // 클린업
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // 포맷 함수들
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR').format(Math.abs(amount));
  };

  const formatBalance = (balance: number): string => {
    return new Intl.NumberFormat('ko-KR').format(balance);
  };

  return (
    <VirtualListContainer
      ref={containerRef}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <VirtualListContent style={{ height: totalHeight }}>
        {visibleItems.map((transaction, index) => {
          const actualIndex = startIndex + index;
          const offset = actualIndex * itemHeight;
          
          return (
            <TransactionItem
              key={transaction.id}
              $offset={offset}
              onClick={() => onItemClick?.(transaction)}
              style={{
                // 스크롤 중에는 포인터 이벤트 비활성화로 성능 향상
                pointerEvents: isScrolling ? 'none' : 'auto',
              }}
            >
              <TransactionInfo>
                <TransactionDesc>{transaction.desc}</TransactionDesc>
                <TransactionDate>
                  {transaction.date} {transaction.time}
                </TransactionDate>
              </TransactionInfo>
              <TransactionAmount $isIncome={transaction.type === 'income'}>
                <div className="amount">
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatAmount(transaction.amount)}원
                </div>
                <div className="balance">
                  잔액 {formatBalance(transaction.balance)}원
                </div>
              </TransactionAmount>
            </TransactionItem>
          );
        })}
      </VirtualListContent>
    </VirtualListContainer>
  );
};

// 날짜별 그룹화된 거래내역 리스트
export const GroupedVirtualizedTransactionList: React.FC<{
  groupedTransactions: { date: string; transactions: Transaction[] }[];
  containerHeight?: number;
  onItemClick?: (transaction: Transaction) => void;
}> = ({ groupedTransactions, containerHeight = 600, onItemClick }) => {
  // 모든 거래를 플랫하게 만들어서 가상화
  const flatTransactions = groupedTransactions.flatMap(group => [
    { id: `header-${group.date}`, type: 'header' as const, date: group.date },
    ...group.transactions.map(t => ({ ...t, type: 'transaction' as const }))
  ]);

  const HEADER_HEIGHT = 40;
  const ITEM_HEIGHT = 80;

  // 아이템별 높이 계산
  const getItemHeight = (item: any) => {
    return item.type === 'header' ? HEADER_HEIGHT : ITEM_HEIGHT;
  };

  // 총 높이 계산
  const totalHeight = flatTransactions.reduce((sum, item) => {
    return sum + getItemHeight(item);
  }, 0);

  // 렌더링은 기본 VirtualizedTransactionList와 유사하게 구현
  // ... (구현 생략 - 실제로는 더 복잡한 로직 필요)

  return (
    <VirtualListContainer style={{ height: containerHeight }}>
      {/* 실제 구현은 더 복잡하지만, 기본 개념은 동일 */}
      <div>Grouped Virtualized List - Implementation needed</div>
    </VirtualListContainer>
  );
};

export default VirtualizedTransactionList;