import React, { useState, useEffect } from 'react';

import styled from 'styled-components';

import BottomSheet from '../../shared/components/ui/BottomSheet';
import { colors } from '../../styles/colors';
import { dimensions } from '../../styles/dimensions';
import { tokens } from '../../styles/tokens';
import { typography } from '../../styles/typography';
// import KBKeypad from './KBKeypad';
interface AmountInputBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: string) => void;
  title?: string;
  maxAmount?: number;
}
// KB스타뱅킹 금액 입력 바텀시트 정확한 구조
const AmountInputContainer = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
`;
// 금액 표시 영역
const AmountDisplaySection = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;
const AmountLabel = styled.div`
  font-size: 16px;
  font-family: ${typography.fontFamily.kbfgTextMedium};
  color: ${tokens.colors.text.secondary};
  margin-bottom: 8px;
`;
const AmountInput = styled.div`
  font-size: ${typography.styles.bottomSheetAmount.fontSize.replace('dp', 'px')};
  font-family: ${typography.fontFamily.robotoMedium};
  color: ${tokens.colors.text.primary};
  font-weight: 700;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 2px solid ${tokens.colors.brand.primary};
  padding: 8px 16px;
  position: relative;
  /* 자동 크기 조정 */
  font-size: clamp(24px, 6vw, 30px);
  &::after {
    content: '원';
    margin-left: 8px;
    font-size: 20px;
    color: ${tokens.colors.text.secondary};
  }
`;
const AmountPlaceholder = styled.div`
  color: ${tokens.colors.text.quaternary};
  font-size: 24px;
`;
// 금액 단축 버튼들
const ShortcutSection = styled.div`
  margin-bottom: 24px;
`;
const ShortcutButtonsGrid = styled.div`
  display: flex;
  gap: ${dimensions.amountBottomSheet.shortcutButtonGap}px;
  flex-wrap: wrap;
  justify-content: center;
`;
const ShortcutButton = styled.button<{ $active?: boolean }>`
  height: ${dimensions.amountBottomSheet.shortcutButton}px;
  padding: 0 16px;
  border: 1px solid ${tokens.colors.border.light};
  border-radius: ${dimensions.borderRadius.round}px;
  background-color: ${props => props.$active ? tokens.colors.brand.primary : colors.backgroundGray2};
  color: ${props => props.$active ? colors.textPrimary : colors.textSecondary};
  font-size: 14px;
  font-family: ${typography.fontFamily.kbfgTextMedium};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  &:hover {
    background-color: ${tokens.colors.brand.primary};
    color: ${tokens.colors.text.primary};
    border-color: ${tokens.colors.brand.primary};
  }
`;
// 키패드 섹션
const KeypadSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;
const KeypadContainer = styled.div`
  background-color: ${tokens.colors.backgroundGray1};
  border-radius: ${dimensions.borderRadius.large}px;
  padding: 16px;
  margin-bottom: 16px;
`;
const KeypadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;
const KeypadButton = styled.button<{ $wide?: boolean }>`
  height: ${dimensions.height.keypadButton}px;
  border: none;
  border-radius: ${props => props.$wide ? `${dimensions.height.keypadButton / 2}px` : '50%'};
  background-color: ${tokens.colors.background.primary};
  color: ${tokens.colors.text.primary};
  font-size: ${typography.styles.keypadButton.fontSize.replace('dp', 'px')};
  font-family: ${typography.fontFamily.robotoMedium};
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  ${props => props.$wide && `
    grid-column: span 2;
  `}
  &:hover {
    background-color: ${tokens.colors.backgroundGray1};
    transform: scale(0.95);
  }
  &:active {
    transform: scale(0.9);
  }
`;
const DeleteIcon = styled.div`
  width: 24px;
  height: 24px;
  background-color: ${tokens.colors.text.tertiary};
  border-radius: 4px;
`;
const ConfirmButton = styled.button<{ $disabled?: boolean }>`
  width: 100%;
  height: ${dimensions.height.bottomSheetButton}px;
  background-color: ${props => props.$disabled ? colors.backgroundGray2 : tokens.colors.brand.primary};
  border: none;
  border-radius: ${dimensions.borderRadius.medium}px;
  color: ${props => props.$disabled ? colors.textHint : colors.textPrimary};
  font-size: 18px;
  font-family: ${typography.fontFamily.kbfgTextBold};
  font-weight: 700;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  margin-top: ${dimensions.amountBottomSheet.confirmButtonTop}px;
  &:hover {
    background-color: ${props => props.$disabled ? colors.backgroundGray2 : tokens.colors.brand.primaryDark};
  }
  &:active {
    transform: ${props => props.$disabled ? 'none' : 'scale(0.98)'};
  }
`;
const AmountInputBottomSheet: React.FC<AmountInputBottomSheetProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = '이체금액',
  maxAmount = 10000000,
}) => {
  const [amount, setAmount] = useState('');
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null);
  // 금액 단축 버튼 목록
  const shortcutAmounts = [
    { label: '1만', value: '10000' },
    { label: '5만', value: '50000' },
    { label: '10만', value: '100000' },
    { label: '50만', value: '500000' },
    { label: '100만', value: '1000000' },
    { label: '전액', value: 'all' },
  ];
  // 금액 포맷팅 함수
  const formatAmount = (value: string) => {
    if (!value) return '';
    const number = parseInt(value.replace(/,/g, ''));
    return number.toLocaleString();
  };
  // 숫자 입력 처리
  const handleNumberInput = (value: string) => {
    const newAmount = amount + value;
    const numericAmount = parseInt(newAmount.replace(/,/g, ''));
    if (numericAmount <= maxAmount) {
      setAmount(newAmount);
      setActiveShortcut(null);
    }
  };
  // 삭제 처리
  const handleDelete = () => {
    setAmount(prev => prev.slice(0, -1));
    setActiveShortcut(null);
  };
  // 단축 버튼 클릭 처리
  const handleShortcutClick = (shortcut: typeof shortcutAmounts[0]) => {
    if (shortcut.value === 'all') {
      // 전액의 경우 계좌 잔액을 가져와야 함 (임시로 100만원)
      setAmount('1000000');
    } else {
      setAmount(shortcut.value);
    }
    setActiveShortcut(shortcut.label);
  };
  // 확인 처리
  const handleConfirm = () => {
    if (amount && parseInt(amount.replace(/,/g, '')) > 0) {
      onConfirm(amount);
      onClose();
    }
  };
  // 초기화
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setActiveShortcut(null);
    }
  }, [isOpen]);
  const isConfirmDisabled = !amount || parseInt(amount.replace(/,/g, '')) <= 0;
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      height="70vh"
      title={title}
      showSlideBar={true}
    >
      <AmountInputContainer>
        {/* 금액 표시 영역 */}
        <AmountDisplaySection>
          <AmountLabel>이체할 금액을 입력해주세요</AmountLabel>
          <AmountInput>
            {amount ? formatAmount(amount) : <AmountPlaceholder>0</AmountPlaceholder>}
          </AmountInput>
        </AmountDisplaySection>
        {/* 금액 단축 버튼들 */}
        <ShortcutSection>
          <ShortcutButtonsGrid>
            {shortcutAmounts.map((shortcut) => (
              <ShortcutButton
                key={shortcut.label}
                $active={activeShortcut === shortcut.label}
                onClick={() => handleShortcutClick(shortcut)}
              >
                {shortcut.label}
              </ShortcutButton>
            ))}
          </ShortcutButtonsGrid>
        </ShortcutSection>
        {/* 숫자 키패드 */}
        <KeypadSection>
          <KeypadContainer>
            <KeypadGrid>
              {/* 1행: 1, 2, 3 */}
              <KeypadButton onClick={() => handleNumberInput('1')}>1</KeypadButton>
              <KeypadButton onClick={() => handleNumberInput('2')}>2</KeypadButton>
              <KeypadButton onClick={() => handleNumberInput('3')}>3</KeypadButton>
              {/* 2행: 4, 5, 6 */}
              <KeypadButton onClick={() => handleNumberInput('4')}>4</KeypadButton>
              <KeypadButton onClick={() => handleNumberInput('5')}>5</KeypadButton>
              <KeypadButton onClick={() => handleNumberInput('6')}>6</KeypadButton>
              {/* 3행: 7, 8, 9 */}
              <KeypadButton onClick={() => handleNumberInput('7')}>7</KeypadButton>
              <KeypadButton onClick={() => handleNumberInput('8')}>8</KeypadButton>
              <KeypadButton onClick={() => handleNumberInput('9')}>9</KeypadButton>
              {/* 4행: 00, 0, 삭제 */}
              <KeypadButton onClick={() => handleNumberInput('00')}>00</KeypadButton>
              <KeypadButton onClick={() => handleNumberInput('0')}>0</KeypadButton>
              <KeypadButton onClick={handleDelete}>
                <DeleteIcon />
              </KeypadButton>
            </KeypadGrid>
          </KeypadContainer>
          {/* 확인 버튼 */}
          <ConfirmButton
            $disabled={isConfirmDisabled}
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            확인
          </ConfirmButton>
        </KeypadSection>
      </AmountInputContainer>
    </BottomSheet>
  );
};
export default AmountInputBottomSheet;