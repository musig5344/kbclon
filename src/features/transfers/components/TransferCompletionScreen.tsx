import React from 'react';

import {
  CompletionContainer,
  CompletionIcon,
  CompletionTitle,
  CompletionMessage,
} from '../TransferPage.styles';

interface TransferCompletionScreenProps {
  recipientName: string;
  amount: string;
  formatAmount: (value: string) => string;
}

/**
 * 이체 완료 화면 컴포넌트
 * - 이체 성공 후 표시되는 완료 화면
 * - 수취인 정보와 이체 금액을 표시
 */
const TransferCompletionScreen: React.FC<TransferCompletionScreenProps> = ({
  recipientName,
  amount,
  formatAmount,
}) => {
  return (
    <CompletionContainer>
      <CompletionIcon>✓</CompletionIcon>
      <CompletionTitle>이체 완료</CompletionTitle>
      <CompletionMessage>
        {recipientName}님에게 {formatAmount(amount)}을<br />
        성공적으로 이체했습니다.
      </CompletionMessage>
    </CompletionContainer>
  );
};

export default TransferCompletionScreen;
