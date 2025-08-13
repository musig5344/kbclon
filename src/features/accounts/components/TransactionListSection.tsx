import React, { useMemo, useCallback, memo } from 'react';

import {
  TransactionSection,
  DateHeader,
  TransactionList,
  TransactionItem,
  TransactionLeft,
  TransactionTime,
  TransactionDesc,
  TransactionRight,
  TransactionAmount,
  TransactionBalance,
} from '../styles/AccountPage.styles';
import { Transaction, FilterPeriod, FilterType, FilterSort } from '../types';
import { getFilteredTransactions } from '../utils/transactionFilters';

// Props 인터페이스 정의
interface TransactionListSectionProps {
  transactions: Transaction[];
  filterPeriod: FilterPeriod;
  filterType: FilterType;
  filterSort: FilterSort;
  startDate: string;
  endDate: string;
  onTransactionClick: (transaction: Transaction) => void;
}

// 한글과 영문/숫자를 구분하여 포맷팅하는 함수
const formatTransactionText = (text: string): string => {
  const regex = /([\uac00-\ud7a3]+|[^\uac00-\ud7a3]+)/g;
  const parts = text.match(regex) || [];
  return parts
    .map(part => {
      if (/^[\uac00-\ud7a3]+$/.test(part)) {
        return part;
      }
      if (/^\s+$/.test(part)) {
        return part;
      }
      return part
        .split('')
        .filter(char => char !== ' ')
        .join(' ');
    })
    .join('');
};

// 개별 거래 아이템 컴포넌트 - React.memo로 최적화
const TransactionItemMemo = memo<{
  transaction: Transaction;
  onClick: (transaction: Transaction) => void;
}>(({ transaction, onClick }) => {
  // 금액 포맷팅을 메모이제이션
  const formattedAmount = useMemo(
    () => Math.abs(transaction.amount).toLocaleString(),
    [transaction.amount]
  );

  const formattedBalance = useMemo(
    () => transaction.balance.toLocaleString(),
    [transaction.balance]
  );

  // 텍스트 포맷팅을 메모이제이션
  const formattedDesc = useMemo(() => formatTransactionText(transaction.desc), [transaction.desc]);

  return (
    <TransactionItem onClick={() => onClick(transaction)} style={{ cursor: 'pointer' }}>
      <TransactionLeft>
        <TransactionTime>
          {transaction.date} {transaction.time}
        </TransactionTime>
        <TransactionDesc>{formattedDesc}</TransactionDesc>
      </TransactionLeft>
      <TransactionRight>
        <TransactionAmount amount={transaction.amount} type={transaction.type} showSign={false}>
          {transaction.type === 'income' ? '입금' : '출금'} {formattedAmount}원
        </TransactionAmount>
        <TransactionBalance>잔액 {formattedBalance}원</TransactionBalance>
      </TransactionRight>
    </TransactionItem>
  );
});

TransactionItemMemo.displayName = 'TransactionItemMemo';

const TransactionListSection: React.FC<TransactionListSectionProps> = ({
  transactions,
  filterPeriod,
  filterType,
  filterSort,
  startDate,
  endDate,
  onTransactionClick,
}) => {
  // 필터링된 거래내역을 메모이제이션
  const filteredTransactions = useMemo(
    () =>
      getFilteredTransactions(transactions, {
        period: filterPeriod,
        type: filterType,
        sort: filterSort,
        startDate,
        endDate,
      }),
    [transactions, filterPeriod, filterType, filterSort, startDate, endDate]
  );

  // 클릭 핸들러를 메모이제이션
  const handleTransactionClick = useCallback(
    (transaction: Transaction) => {
      onTransactionClick(transaction);
    },
    [onTransactionClick]
  );

  return (
    <TransactionSection>
      <DateHeader>2025.07</DateHeader>
      <TransactionList>
        {filteredTransactions.map(tx => (
          <TransactionItemMemo key={tx.id} transaction={tx} onClick={handleTransactionClick} />
        ))}
      </TransactionList>
    </TransactionSection>
  );
};

// React.memo로 전체 컴포넌트 최적화
export default memo(TransactionListSection);
