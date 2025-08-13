import React from 'react';

import {
  ConfirmSection,
  SectionTitle,
  ConfirmRow,
  ConfirmLabel,
  ConfirmValue,
  TotalAmountDisplay
} from '../TransferPage.styles';

interface TransferConfirmSectionProps {
  selectedAccount: any;
  recipientBank: string;
  recipientAccount: string;
  recipientName: string;
  amount: string;
  memo: string;
  formatAmount: (value: string) => string;
}

const TransferConfirmSection: React.FC<TransferConfirmSectionProps> = ({
  selectedAccount,
  recipientBank,
  recipientAccount,
  recipientName,
  amount,
  memo,
  formatAmount
}) => {
  return (
    <ConfirmSection>
      <SectionTitle>이체 정보 확인</SectionTitle>
      <ConfirmRow>
        <ConfirmLabel>보내는 계좌</ConfirmLabel>
        <ConfirmValue>{selectedAccount?.account_name || 'KB국민ONE통장'}</ConfirmValue>
      </ConfirmRow>
      <ConfirmRow>
        <ConfirmLabel>받는 은행</ConfirmLabel>
        <ConfirmValue>{recipientBank}</ConfirmValue>
      </ConfirmRow>
      <ConfirmRow>
        <ConfirmLabel>받는 계좌</ConfirmLabel>
        <ConfirmValue>{recipientAccount}</ConfirmValue>
      </ConfirmRow>
      <ConfirmRow>
        <ConfirmLabel>받는 분</ConfirmLabel>
        <ConfirmValue>{recipientName}</ConfirmValue>
      </ConfirmRow>
      <ConfirmRow>
        <ConfirmLabel>이체 금액</ConfirmLabel>
        <ConfirmValue>{formatAmount(amount)}</ConfirmValue>
      </ConfirmRow>
      <ConfirmRow>
        <ConfirmLabel>이체 수수료</ConfirmLabel>
        <ConfirmValue>0원</ConfirmValue>
      </ConfirmRow>
      {memo && (
        <ConfirmRow>
          <ConfirmLabel>메모</ConfirmLabel>
          <ConfirmValue>{memo}</ConfirmValue>
        </ConfirmRow>
      )}
      <TotalAmountDisplay>
        총 {formatAmount(amount)}
      </TotalAmountDisplay>
    </ConfirmSection>
  );
};

export default TransferConfirmSection;