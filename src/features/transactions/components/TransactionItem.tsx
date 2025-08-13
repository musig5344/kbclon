import React, { memo, useMemo } from 'react';

import styled from 'styled-components';

import { Transaction } from '../../../services/api';
import { listItemFadeIn, staggerDelay, respectMotionPreference } from '../../../styles/animations';
import { formatCurrency } from '../../../utils/textFormatter';
const ItemContainer = styled.div<{ $animationIndex?: number }>`
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s ease;
  animation: ${listItemFadeIn} 0.4s ease-out forwards;
  ${props => props.$animationIndex && staggerDelay(props.$animationIndex, 0.05)}
  opacity: 0;
  transform: translate3d(0, 20px, 0);
  ${respectMotionPreference}
  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
  &:last-child {
    border-bottom: none;
  }
`;
const ItemContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;
const ItemInfo = styled.div`
  flex: 1;
`;
const Description = styled.div`
  font-size: 17px;
  font-weight: 500;
  color: #000000;
  margin-bottom: 8px;
  line-height: 1.4;
  letter-spacing: -0.3px;
`;
const DateTime = styled.div`
  font-size: 14px;
  color: #666666;
  line-height: 1.3;
  letter-spacing: -0.2px;
`;
const AmountSection = styled.div`
  text-align: right;
  flex-shrink: 0;
  margin-left: 16px;
`;
const Amount = styled.div<{ $isPositive: boolean }>`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.$isPositive ? '#1976d2' : '#e53935'};
  margin-bottom: 6px;
  white-space: nowrap;
  letter-spacing: -0.5px;
`;
const Balance = styled.div`
  font-size: 13px;
  color: #666666;
  white-space: nowrap;
  letter-spacing: -0.2px;
`;
interface TransactionItemProps {
  transaction: Transaction;
  showBalance?: boolean;
  onClick?: (transaction: Transaction) => void;
  dateFormat?: 'full' | 'time' | 'date';
  animationIndex?: number;
}
export const TransactionItem: React.FC<TransactionItemProps> = memo(({
  transaction,
  showBalance = true,
  onClick,
  dateFormat = 'full',
  animationIndex = 0
}) => {
  const formattedDate = useMemo(() => {
    const date = new Date(transaction.transaction_date);
    switch (dateFormat) {
      case 'time':
        return date.toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          hour12: false
        });
      case 'date':
        return date.toLocaleDateString('ko-KR', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        });
      case 'full':
      default:
        return date.toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).replace(/\. /g, '.').replace(/, /g, ' ');
    }
  }, [transaction.transaction_date, dateFormat]);
  const isPositive = transaction.transaction_type === '입금';
  // const displayType = transaction.transaction_type === '이체' ? '출금' : transaction.transaction_type;
  return (
    <ItemContainer $animationIndex={animationIndex} onClick={() => onClick?.(transaction)}>
      <ItemContent>
        <ItemInfo>
          <Description>{transaction.description}</Description>
          <DateTime>{formattedDate}</DateTime>
        </ItemInfo>
        <AmountSection>
          <Amount $isPositive={isPositive}>
            {isPositive ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}원
          </Amount>
          {showBalance && (
            <Balance>잔액 {formatCurrency(transaction.balance_after)}원</Balance>
          )}
        </AmountSection>
      </ItemContent>
    </ItemContainer>
  );
});
export default TransactionItem;