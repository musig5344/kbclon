import React, { memo, useCallback, useMemo } from 'react';

import { FormRow, FormLabel } from '../../../shared/components';
import { AmountInput, QuickAmountSection, QuickButton } from '../TransferPage.styles';

interface AmountInputSectionProps {
  amount: string;
  setAmount: (amount: string) => void;
  quickAmounts?: number[];
  formatAmount: (value: string) => string;
}

// 빠른 금액 버튼 컴포넌트 - React.memo로 최적화
const QuickAmountButton = memo<{
  amount: number;
  onClick: (amount: number) => void;
}>(({ amount, onClick }) => {
  // 라벨 포맷팅을 메모이제이션
  const label = useMemo(() => {
    if (amount >= 10000) {
      return `${amount / 10000}만원`;
    }
    return `${amount}원`;
  }, [amount]);

  const handleClick = useCallback(() => {
    onClick(amount);
  }, [amount, onClick]);

  return <QuickButton onClick={handleClick}>{label}</QuickButton>;
});

QuickAmountButton.displayName = 'QuickAmountButton';

/**
 * 이체 금액 입력 섹션 컴포넌트
 * - 금액 입력 필드
 * - 빠른 금액 선택 버튼
 */
const AmountInputSection: React.FC<AmountInputSectionProps> = memo(
  ({ amount, setAmount, quickAmounts = [10000, 50000, 100000, 1000000], formatAmount }) => {
    // 금액 입력 핸들러를 메모이제이션
    const handleAmountChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setAmount(value);
      },
      [setAmount]
    );

    // 빠른 금액 클릭 핸들러를 메모이제이션
    const handleQuickAmountClick = useCallback(
      (quickAmount: number) => {
        setAmount(quickAmount.toString());
      },
      [setAmount]
    );

    // 포맷된 금액 값을 메모이제이션
    const formattedValue = useMemo(
      () => (amount ? formatAmount(amount) : ''),
      [amount, formatAmount]
    );

    return (
      <FormRow>
        <FormLabel>이체 금액</FormLabel>
        <AmountInput
          type='text'
          placeholder='0원'
          value={formattedValue}
          onChange={handleAmountChange}
        />
        <QuickAmountSection>
          {quickAmounts.map(quickAmount => (
            <QuickAmountButton
              key={quickAmount}
              amount={quickAmount}
              onClick={handleQuickAmountClick}
            />
          ))}
        </QuickAmountSection>
      </FormRow>
    );
  }
);

AmountInputSection.displayName = 'AmountInputSection';

export default AmountInputSection;
