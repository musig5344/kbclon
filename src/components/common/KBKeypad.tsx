import React, { useState } from 'react';

import styled from 'styled-components';

import { dimensions } from '../../styles/dimensions';
import { tokens } from '../../styles/tokens';
// import { colors } from '../../styles/colors'; // 사용되지 않음
import { typography } from '../../styles/typography';
interface KBKeypadProps {
  onInput: (value: string) => void;
  onDelete: () => void;
  onConfirm: () => void;
  showConfirmButton?: boolean;
  type?: 'number' | 'secure';
}
// KB스타뱅킹 키패드 정확한 구조 (4행 × 3열)
const KeypadContainer = styled.div`
  width: 100%;
  background-color: ${tokens.colors.background.primary};
  padding: 16px;
`;
const KeypadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;
const KeypadButton = styled.button<{ $type?: 'number' | 'function' }>`
  height: ${dimensions.height.keypadButton}px;
  border: none;
  border-radius: 50%;
  background-color: ${props => props.$type === 'function' ? tokens.colors.backgroundGray2 : tokens.colors.background.primary};
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
  &:hover {
    background-color: ${props => props.$type === 'function' ? tokens.colors.backgroundGray1 : tokens.colors.backgroundGray1};
    transform: scale(0.95);
  }
  &:active {
    transform: scale(0.9);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  }
  /* 숫자 0, 00 버튼 (넓은 버튼) */
  &.wide {
    grid-column: span 2;
    border-radius: ${dimensions.height.keypadButton / 2}px;
  }
`;
const FunctionIcon = styled.div`
  width: 24px;
  height: 24px;
  background-color: ${tokens.colors.text.tertiary};
  border-radius: 4px;
`;
const ConfirmButton = styled.button`
  width: 100%;
  height: ${dimensions.height.bottomSheetButton}px;
  background-color: ${tokens.colors.brand.primary};
  border: none;
  border-radius: ${dimensions.borderRadius.medium}px;
  color: ${tokens.colors.text.primary};
  font-size: 18px;
  font-family: ${typography.fontFamily.kbfgTextBold};
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: ${dimensions.bottomSheet.slideBarTopMargin}px;
  &:hover {
    background-color: ${tokens.colors.brand.dark};
  }
  &:active {
    transform: scale(0.98);
  }
  &:disabled {
    background-color: ${tokens.colors.backgroundGray2};
    color: ${tokens.colors.text.quaternary};
    cursor: not-allowed;
  }
`;
// 보안 키패드용 스타일
const SecureKeypadContainer = styled(KeypadContainer)`
  background-color: ${tokens.colors.backgroundGray1};
  border-radius: ${dimensions.borderRadius.large}px ${dimensions.borderRadius.large}px 0 0;
`;
const SecureKeypadButton = styled(KeypadButton)`
  background-color: ${tokens.colors.background.primary};
  border: 1px solid ${tokens.colors.border.light};
  &:hover {
    border-color: ${tokens.colors.brand.primary};
    background-color: ${tokens.colors.backgroundGray1};
  }
`;
const KBKeypad: React.FC<KBKeypadProps> = ({
  onInput,
  onDelete,
  onConfirm,
  showConfirmButton = true,
  type = 'number',
}) => {
  const [shuffledNumbers, setShuffledNumbers] = useState(() => {
    // 보안 키패드의 경우 숫자 배열을 섞음
    if (type === 'secure') {
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
      return numbers.sort(() => Math.random() - 0.5);
    }
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  });
  const handleRearrange = () => {
    if (type === 'secure') {
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
      setShuffledNumbers(numbers.sort(() => Math.random() - 0.5));
    }
  };
  const Container = type === 'secure' ? SecureKeypadContainer : KeypadContainer;
  const Button = type === 'secure' ? SecureKeypadButton : KeypadButton;
  // 일반 숫자 키패드 레이아웃
  if (type === 'number') {
    return (
      <Container>
        <KeypadGrid>
          {/* 1행: 1, 2, 3 */}
          <Button onClick={() => onInput('1')}>1</Button>
          <Button onClick={() => onInput('2')}>2</Button>
          <Button onClick={() => onInput('3')}>3</Button>
          {/* 2행: 4, 5, 6 */}
          <Button onClick={() => onInput('4')}>4</Button>
          <Button onClick={() => onInput('5')}>5</Button>
          <Button onClick={() => onInput('6')}>6</Button>
          {/* 3행: 7, 8, 9 */}
          <Button onClick={() => onInput('7')}>7</Button>
          <Button onClick={() => onInput('8')}>8</Button>
          <Button onClick={() => onInput('9')}>9</Button>
          {/* 4행: 00, 0, 삭제 */}
          <Button onClick={() => onInput('00')}>00</Button>
          <Button onClick={() => onInput('0')}>0</Button>
          <Button $type="function" onClick={onDelete}>
            <FunctionIcon />
          </Button>
        </KeypadGrid>
        {showConfirmButton && (
          <ConfirmButton onClick={onConfirm}>
            확인
          </ConfirmButton>
        )}
      </Container>
    );
  }
  // 보안 키패드 레이아웃 (NFilter 스타일)
  return (
    <Container>
      <KeypadGrid>
        {/* 3×3 그리드로 섞인 숫자 배치 */}
        {shuffledNumbers.slice(0, 9).map((number, index) => (
          <Button key={`${number}-${index}`} onClick={() => onInput(number.toString())}>
            {number}
          </Button>
        ))}
        {/* 4행: 재배열, 0, 삭제 */}
        <Button $type="function" onClick={handleRearrange}>
          <FunctionIcon />
        </Button>
        <Button onClick={() => onInput(shuffledNumbers[9].toString())}>
          {shuffledNumbers[9]}
        </Button>
        <Button $type="function" onClick={onDelete}>
          <FunctionIcon />
        </Button>
      </KeypadGrid>
      {showConfirmButton && (
        <ConfirmButton onClick={onConfirm}>
          확인
        </ConfirmButton>
      )}
    </Container>
  );
};
export default KBKeypad;