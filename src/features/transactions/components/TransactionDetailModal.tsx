import React from 'react';

import { Transaction } from '../../../services/api';
import { formatCurrency } from '../../../utils/textFormatter';
import {
  TransactionDetailModal as ModalContainer,
  DetailHeader,
  DetailTitle,
  DetailCloseButton,
  DetailBody,
  DetailMerchantName,
  DetailMemoSection,
  DetailSectionLabel,
  DetailMemoDropdown,
  DetailMemoDropdownText,
  DetailMemoInput,
  DetailInfoSection,
  DetailDateTime,
  DetailInfoRow,
  DetailInfoLabel,
  DetailInfoValue,
  DetailConfirmButton,
} from '../AccountTransactionPage.styles';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  return (
    <ModalContainer>
      <DetailHeader>
        <DetailTitle>거래내역상세</DetailTitle>
        <DetailCloseButton onClick={onClose}>×</DetailCloseButton>
      </DetailHeader>
      <DetailBody>
        <DetailMerchantName>{transaction.description}</DetailMerchantName>
        <DetailMemoSection>
          <DetailSectionLabel>메모</DetailSectionLabel>
          <DetailMemoDropdown>
            <DetailMemoDropdownText>직접작성</DetailMemoDropdownText>
          </DetailMemoDropdown>
          <DetailMemoInput placeholder='메모 입력(최대 20자)' maxLength={20} />
        </DetailMemoSection>
        <DetailInfoSection>
          <DetailDateTime>
            {new Date(transaction.transaction_date)
              .toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              })
              .replace(/\. /g, '.')
              .replace(/, /g, ' ')}
          </DetailDateTime>
          <DetailInfoRow>
            <DetailInfoLabel>거래금액</DetailInfoLabel>
            <DetailInfoValue $isAmount={true} $isPositive={transaction.transaction_type === '입금'}>
              {transaction.transaction_type === '이체' ? '출금' : transaction.transaction_type}{' '}
              {formatCurrency(Math.abs(transaction.amount))}원
            </DetailInfoValue>
          </DetailInfoRow>
          <DetailInfoRow>
            <DetailInfoLabel>거래후 잔액</DetailInfoLabel>
            <DetailInfoValue>{formatCurrency(transaction.balance_after)}원</DetailInfoValue>
          </DetailInfoRow>
          <DetailInfoRow>
            <DetailInfoLabel>거래유형</DetailInfoLabel>
            <DetailInfoValue>
              {transaction.transaction_type === '이체'
                ? 'CMS 공동'
                : transaction.transaction_type === '입금'
                  ? '타행이체'
                  : transaction.transaction_type === '출금'
                    ? '전자금융'
                    : '기타'}
            </DetailInfoValue>
          </DetailInfoRow>
        </DetailInfoSection>
      </DetailBody>
      <DetailConfirmButton onClick={onClose}>확인</DetailConfirmButton>
    </ModalContainer>
  );
};

export default TransactionDetailModal;
