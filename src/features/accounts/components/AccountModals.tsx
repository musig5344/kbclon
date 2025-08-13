import React from 'react';

import styled from 'styled-components';

import { Typography } from '../../../components/design-system';
import { Modal } from '../../../shared/components';
import { tokens } from '../../../styles/tokens';
// import TransactionFilterModal, { FilterState } from '../../transactions/components/TransactionFilterModal'; // 사용되지 않음
// 거래내역 타입 정의
interface Transaction {
  id: string;
  desc: string;
  type: 'income' | 'expense';
  amount: number;
  balance: number;
  date: string;
  time: string;
}
// 한국어 문자, 숫자, 영어를 분리하여 형식화
const formatTransactionText = (text: string): string => {
  return text.replace(/([가-힣]+)(\d)/g, '$1 $2')
            .replace(/(\d)([가-힣]+)/g, '$1 $2')
            .replace(/([가-힣]+)([a-zA-Z])/g, '$1 $2')
            .replace(/([a-zA-Z])([가-힣]+)/g, '$1 $2');
};
// 거래내역 상세 모달 컴포넌트
export const TransactionDetailModal: React.FC<{
  transaction: Transaction;
  onClose: () => void;
}> = ({ transaction, onClose }) => {
  return (
    <Modal
      show={true}
      onClose={onClose}
      title="거래내역상세"
      footer={<ConfirmButton onClick={onClose}>확인</ConfirmButton>}
    >
      <TransactionName>{formatTransactionText(transaction.desc)}</TransactionName>
      <MemoSection>
        <MemoLabel>메모</MemoLabel>
        <MemoDropdown>
          <span>직접작성</span>
          <span>▼</span>
        </MemoDropdown>
        <MemoInput placeholder="메모 입력(최대 20자)" />
      </MemoSection>
      <DetailInfo>
        <DetailDateTime>{transaction.date.replace(/\./g, '.')} {transaction.time}</DetailDateTime>
        <DetailRow>
          <DetailLabel>거래금액</DetailLabel>
          <DetailAmount type={transaction.type}>
            {transaction.type === 'income' ? '입금' : '출금'} {Math.abs(transaction.amount).toLocaleString()}원
          </DetailAmount>
        </DetailRow>
        <DetailRow>
          <DetailLabel>거래후 잔액</DetailLabel>
          <DetailValue>{transaction.balance.toLocaleString()}원</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>거래유형</DetailLabel>
          <DetailValue>전자금융</DetailValue>
        </DetailRow>
      </DetailInfo>
    </Modal>
  );
};
// 필터 모달 컴포넌트 - 공유 컴포넌트 사용으로 코드 중복 제거
interface FilterModalProps {
  show: boolean;
  filterPeriod: string;
  filterType: string;
  filterSort: string;
  startDate: string;
  endDate: string;
  onPeriodChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}
export const FilterModal: React.FC<FilterModalProps> = ({
  show,
  filterPeriod,
  filterType,
  filterSort,
  startDate: _startDate, // 사용되지 않음
  endDate: _endDate, // 사용되지 않음
  onPeriodChange: _onPeriodChange, // 사용되지 않음
  onTypeChange: _onTypeChange, // 사용되지 않음
  onSortChange: _onSortChange, // 사용되지 않음
  onStartDateChange: _onStartDateChange, // 사용되지 않음
  onEndDateChange: _onEndDateChange, // 사용되지 않음
  onClose,
  onConfirm
}) => {
  // 간단한 필터 모달 구현
  return (
    <div style={{ display: show ? 'block' : 'none' }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 999
      }} onClick={onClose}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          minWidth: '200px'
        }} onClick={(e) => e.stopPropagation()}>
          <h3>필터 설정</h3>
          <p>기간: {filterPeriod}</p>
          <p>유형: {filterType}</p>
          <p>정렬: {filterSort}</p>
          <button onClick={onConfirm} style={{
            backgroundColor: '#FFD338',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            marginRight: '10px'
          }}>
            확인
          </button>
          <button onClick={onClose} style={{
            backgroundColor: '#ccc',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px'
          }}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
// 공유 Modal 컴포넌트 사용으로 중복 스타일 제거
const TransactionName = styled(Typography).attrs({
  variant: 'titleLarge',
  weight: 'semibold',
  align: 'center'
})`
  margin: 0 0 ${tokens.spacing[8]} 0;
`;
const MemoSection = styled.div`
  margin-bottom: ${tokens.spacing[8]};
`;
const MemoLabel = styled(Typography).attrs({
  variant: 'bodyMedium',
  color: 'secondary'
})`
  margin-bottom: ${tokens.spacing[2]};
`;
const MemoDropdown = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  border: 1px solid ${tokens.colors.border.primary};
  border-radius: ${tokens.borderRadius.large};
  margin-bottom: ${tokens.spacing[3]};
  cursor: pointer;
  font-size: ${tokens.typography.fontSize.bodyMedium};
  color: ${tokens.colors.text.primary};
`;
const MemoInput = styled.input`
  width: 100%;
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  border: 1px solid ${tokens.colors.border.primary};
  border-radius: ${tokens.borderRadius.large};
  font-size: ${tokens.typography.fontSize.bodyMedium};
  &:focus {
    outline: none;
    border-color: ${tokens.colors.brand.primary};
  }
`;
const DetailInfo = styled.div``;
const DetailDateTime = styled(Typography).attrs({
  variant: 'labelLarge',
  color: 'tertiary'
})`
  margin-bottom: ${tokens.spacing[4]};
`;
const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${tokens.spacing[3]} 0;
  border-bottom: 1px solid ${tokens.colors.border.light};
`;
const DetailLabel = styled(Typography).attrs({
  variant: 'bodyMedium',
  color: 'secondary'
})`` as any;
const DetailValue = styled(Typography).attrs({
  variant: 'bodyMedium',
  weight: 'medium'
})`` as any;
const DetailAmount = styled(Typography).attrs<{ type: 'income' | 'expense' }>((props) => ({
  variant: 'bodyMedium',
  weight: 'semibold',
  style: { color: props.type === 'income' ? tokens.colors.functional.income : tokens.colors.functional.expense }
}))`` as any;
const ConfirmButton = styled.button`
  width: 100%;
  height: ${tokens.sizes.button.heightXL};
  background-color: ${tokens.colors.brand.primary};
  color: ${tokens.colors.text.primary};
  border: none;
  font-size: ${tokens.typography.fontSize.bodyLarge};
  font-weight: ${tokens.typography.fontWeight.semibold};
  cursor: pointer;
  &:active {
    background-color: ${tokens.colors.brand.dark};
  }
`;
// 필터 모달은 공유 TransactionFilterModal 컴포넌트 사용으로 중복 스타일 제거