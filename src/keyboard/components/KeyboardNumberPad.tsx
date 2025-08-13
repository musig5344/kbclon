/**
 * KB StarBanking 키보드 최적화 숫자 패드
 * 뱅킹 보안을 위한 안전한 숫자 입력 지원
 */

import React, { 
  useState, 
  useRef, 
  useEffect, 
  useCallback,
  KeyboardEvent,
  useMemo
} from 'react';

import styled from 'styled-components';

import { globalKeyboardTrapManager } from '../core/KeyboardTrapManager';

interface KeyboardNumberPadProps {
  value?: string;
  maxLength?: number;
  minLength?: number;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  scramble?: boolean;
  showValue?: boolean;
  allowDecimal?: boolean;
  currency?: boolean;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
  'aria-describedby'?: string;
}

const Container = styled.div`
  width: 100%;
  max-width: 400px;
`;

const Label = styled.label<{ required?: boolean }>`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  
  ${props => props.required && `
    &::after {
      content: ' *';
      color: #e74c3c;
    }
  `}
`;

const Display = styled.div<{ hasError?: boolean; disabled?: boolean; focused?: boolean }>`
  width: 100%;
  padding: 16px;
  border: 2px solid ${props => props.hasError ? '#e74c3c' : props.focused ? '#007bff' : '#ddd'};
  border-radius: 8px;
  background: ${props => props.disabled ? '#f5f5f5' : 'white'};
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.disabled ? '#999' : '#333'};
  letter-spacing: 2px;
  font-family: 'Courier New', monospace;
  margin-bottom: 16px;
  position: relative;
  
  ${props => props.focused && `
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  `}
  
  &:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }
`;

const HiddenValue = styled.span`
  font-size: 32px;
  letter-spacing: 8px;
`;

const CurrencySymbol = styled.span`
  font-size: 20px;
  color: #666;
  margin-right: 8px;
`;

const NumberPadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const NumberButton = styled.button<{ 
  isHighlighted?: boolean; 
  variant?: 'primary' | 'secondary' | 'danger' 
}>`
  height: 60px;
  border: 2px solid #ddd;
  border-radius: 12px;
  background: white;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #007bff;
    transform: translateY(-2px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:focus {
    outline: 3px solid #007bff;
    outline-offset: 2px;
    border-color: #007bff;
  }
  
  &:disabled {
    background: #f5f5f5;
    color: #ccc;
    cursor: not-allowed;
    border-color: #eee;
  }
  
  ${props => props.isHighlighted && `
    background: #e3f2fd;
    border-color: #1976d2;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.2);
  `}
  
  ${props => props.variant === 'primary' && `
    background: #007bff;
    color: white;
    border-color: #0056b3;
    
    &:hover:not(:disabled) {
      background: #0056b3;
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: #6c757d;
    color: white;
    border-color: #545b62;
    
    &:hover:not(:disabled) {
      background: #545b62;
    }
  `}
  
  ${props => props.variant === 'danger' && `
    background: #dc3545;
    color: white;
    border-color: #c82333;
    
    &:hover:not(:disabled) {
      background: #c82333;
    }
  `}
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
`;

const ScreenReaderText = styled.span`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

const KeyboardHint = styled.div`
  font-size: 12px;
  color: #666;
  text-align: center;
  margin-top: 8px;
`;

export const KeyboardNumberPad: React.FC<KeyboardNumberPadProps> = ({
  value = '',
  maxLength = 10,
  minLength = 0,
  label,
  placeholder = '숫자를 입력하세요',
  required = false,
  disabled = false,
  error,
  scramble = false,
  showValue = true,
  allowDecimal = false,
  currency = false,
  onChange,
  onComplete,
  onFocus,
  onBlur,
  className,
  'aria-describedby': ariaDescribedBy
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [focused, setFocused] = useState(false);
  const [highlightedButton, setHighlightedButton] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const padId = useRef(`numberpad-${Math.random().toString(36).substr(2, 9)}`);

  // 스크램블된 숫자 레이아웃
  const numberLayout = useMemo(() => {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    
    if (scramble) {
      // 피셔-예이츠 셔플 알고리즘
      const shuffled = [...numbers];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      // 3x4 레이아웃으로 재배열 (0은 마지막 행 가운데)
      const layout = [];
      for (let i = 0; i < 9; i++) {
        layout.push(shuffled[i]);
      }
      layout.push('');  // 빈 칸
      layout.push(shuffled[9]); // 0
      layout.push(''); // 빈 칸
      
      return layout;
    }
    
    // 표준 레이아웃
    return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''];
  }, [scramble]);

  // 값 포맷팅
  const formatValue = useCallback((val: string): string => {
    if (!val) return '';
    
    if (currency) {
      const numericValue = val.replace(/[^\d.]/g, '');
      const number = parseFloat(numericValue);
      if (isNaN(number)) return '';
      
      return new Intl.NumberFormat('ko-KR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: allowDecimal ? 2 : 0
      }).format(number);
    }
    
    return val;
  }, [currency, allowDecimal]);

  // 값 표시 (마스킹 처리)
  const displayValue = useMemo(() => {
    if (!internalValue) return placeholder;
    
    if (showValue) {
      return currency ? `₩ ${formatValue(internalValue)}` : formatValue(internalValue);
    }
    
    // 마스킹 처리
    return '●'.repeat(internalValue.length);
  }, [internalValue, showValue, currency, formatValue, placeholder]);

  // 숫자 입력 처리
  const handleNumberInput = useCallback((digit: string) => {
    if (disabled || internalValue.length >= maxLength) return;
    
    const newValue = internalValue + digit;
    
    // 소수점 처리
    if (digit === '.' && !allowDecimal) return;
    if (digit === '.' && internalValue.includes('.')) return;
    
    setInternalValue(newValue);
    onChange(newValue);
    
    // 완료 체크
    if (newValue.length >= minLength && onComplete) {
      onComplete(newValue);
    }
    
    // 시각적 피드백
    setHighlightedButton(digit);
    setTimeout(() => setHighlightedButton(null), 150);
  }, [disabled, internalValue, maxLength, allowDecimal, onChange, onComplete, minLength]);

  // 백스페이스 처리
  const handleBackspace = useCallback(() => {
    if (disabled || !internalValue) return;
    
    const newValue = internalValue.slice(0, -1);
    setInternalValue(newValue);
    onChange(newValue);
    
    setHighlightedButton('backspace');
    setTimeout(() => setHighlightedButton(null), 150);
  }, [disabled, internalValue, onChange]);

  // 전체 삭제
  const handleClear = useCallback(() => {
    if (disabled) return;
    
    setInternalValue('');
    onChange('');
    
    setHighlightedButton('clear');
    setTimeout(() => setHighlightedButton(null), 150);
  }, [disabled, onChange]);

  // 키보드 이벤트 처리
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key } = event;
    
    if (key >= '0' && key <= '9') {
      event.preventDefault();
      handleNumberInput(key);
    } else if (key === '.' && allowDecimal) {
      event.preventDefault();
      handleNumberInput('.');
    } else if (key === 'Backspace') {
      event.preventDefault();
      handleBackspace();
    } else if (key === 'Delete' || (event.ctrlKey && key === 'a')) {
      event.preventDefault();
      handleClear();
    } else if (key === 'Enter') {
      event.preventDefault();
      if (internalValue.length >= minLength && onComplete) {
        onComplete(internalValue);
      }
    }
  }, [handleNumberInput, handleBackspace, handleClear, allowDecimal, internalValue, minLength, onComplete]);

  // 포커스 관리
  const handleFocus = useCallback(() => {
    setFocused(true);
    onFocus?.();
    
    if (containerRef.current) {
      globalKeyboardTrapManager.addTrap(containerRef.current, {
        autoFocus: false,
        escapeDeactivates: true,
        returnFocusOnDeactivate: true
      });
    }
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    onBlur?.();
    
    if (containerRef.current) {
      globalKeyboardTrapManager.removeTrap(containerRef.current);
    }
  }, [onBlur]);

  // 값 동기화
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  return (
    <Container ref={containerRef} className={className}>
      {label && (
        <Label htmlFor={padId.current} required={required}>
          {label}
        </Label>
      )}
      
      <Display
        ref={displayRef}
        id={padId.current}
        hasError={!!error}
        disabled={disabled}
        focused={focused}
        tabIndex={disabled ? -1 : 0}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        role="textbox"
        aria-label={label || '숫자 입력'}
        aria-describedby={ariaDescribedBy}
        aria-invalid={!!error}
        aria-required={required}
        aria-readonly={disabled}
      >
        {currency && <CurrencySymbol>₩</CurrencySymbol>}
        {showValue ? (
          <span>{formatValue(internalValue) || placeholder}</span>
        ) : (
          <HiddenValue>{internalValue ? '●'.repeat(internalValue.length) : placeholder}</HiddenValue>
        )}
        
        <ScreenReaderText aria-live="polite">
          {internalValue ? `${internalValue.length}자리 입력됨` : ''}
        </ScreenReaderText>
      </Display>

      <NumberPadGrid>
        {numberLayout.map((digit, index) => (
          digit ? (
            <NumberButton
              key={`${digit}-${index}`}
              type="button"
              disabled={disabled}
              isHighlighted={highlightedButton === digit}
              onClick={() => handleNumberInput(digit)}
              aria-label={`숫자 ${digit}`}
            >
              {digit}
            </NumberButton>
          ) : (
            <div key={`empty-${index}`} />
          )
        ))}
        
        {allowDecimal && (
          <NumberButton
            type="button"
            disabled={disabled || internalValue.includes('.')}
            isHighlighted={highlightedButton === '.'}
            onClick={() => handleNumberInput('.')}
            aria-label="소수점"
          >
            .
          </NumberButton>
        )}
      </NumberPadGrid>

      <ActionButtons>
        <NumberButton
          type="button"
          variant="secondary"
          disabled={disabled || !internalValue}
          isHighlighted={highlightedButton === 'backspace'}
          onClick={handleBackspace}
          aria-label="한 글자 지우기"
        >
          ⌫
        </NumberButton>
        
        <NumberButton
          type="button"
          variant="danger"
          disabled={disabled || !internalValue}
          isHighlighted={highlightedButton === 'clear'}
          onClick={handleClear}
          aria-label="전체 지우기"
        >
          전체삭제
        </NumberButton>
      </ActionButtons>

      {error && (
        <ErrorMessage role="alert" aria-live="polite">
          {error}
        </ErrorMessage>
      )}

      <KeyboardHint>
        키보드 숫자키 또는 버튼을 클릭하여 입력하세요
      </KeyboardHint>
    </Container>
  );
};

export default KeyboardNumberPad;