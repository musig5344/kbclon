import React, { memo } from 'react';

import styled from 'styled-components';

import { Transaction } from '../../../services/api';

import TransactionItem from './TransactionItem';
const GroupContainer = styled.div`
  margin-bottom: 0;
  background: #ffffff;
`;
const DateHeader = styled.div<{ $variant?: 'primary' | 'secondary' }>`
  font-size: ${props => (props.$variant === 'secondary' ? '15px' : '15px')};
  font-weight: 600;
  color: ${props => (props.$variant === 'secondary' ? '#666666' : '#333333')};
  margin-bottom: 0;
  padding: ${props => (props.$variant === 'secondary' ? '16px 24px' : '16px 24px')};
  border-bottom: ${props => (props.$variant === 'secondary' ? 'none' : '1px solid #ebeef0')};
  background-color: ${props => (props.$variant === 'secondary' ? '#f8f9fa' : '#f8f9fa')};
  margin-left: 0;
  margin-right: 0;
  position: ${props => (props.$variant === 'secondary' ? 'sticky' : 'static')};
  top: ${props => (props.$variant === 'secondary' ? '0' : 'auto')};
  z-index: ${props => (props.$variant === 'secondary' ? '1' : 'auto')};
  letter-spacing: -0.3px;
`;
const MonthHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e5e8eb;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  cursor: pointer;
  letter-spacing: -0.3px;
  &:hover {
    background-color: #f0f1f3;
  }
`;
interface TransactionGroupProps {
  title: string;
  transactions: Transaction[];
  showBalance?: boolean;
  onTransactionClick?: (transaction: Transaction) => void;
  headerVariant?: 'primary' | 'secondary' | 'month';
  showCount?: boolean;
}
export const TransactionGroup: React.FC<TransactionGroupProps> = memo(
  ({
    title,
    transactions,
    showBalance = true,
    onTransactionClick,
    headerVariant = 'primary',
    showCount = false,
  }) => {
    return (
      <GroupContainer>
        {headerVariant === 'month' ? (
          <MonthHeader>
            <span>{title}</span>
            <span>▲</span>
          </MonthHeader>
        ) : (
          <DateHeader $variant={headerVariant}>
            {title}
            {showCount && ` (${transactions.length}건)`}
          </DateHeader>
        )}
        {transactions.map(transaction => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            showBalance={showBalance}
            onClick={onTransactionClick}
            dateFormat={headerVariant === 'secondary' ? 'time' : 'full'}
          />
        ))}
      </GroupContainer>
    );
  }
);
export default TransactionGroup;
