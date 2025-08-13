/**
 * 접근 가능한 금액 입력 컴포넌트
 * WCAG 2.1 금액 입력 및 한국어 숫자 읽기 지원
 */

import React, { useState, useRef, useEffect } from 'react';

import styled from 'styled-components';

import { AccessibleAmountInputProps } from '../types';
import { announce, formatAmountForScreenReader } from '../utils/screenReader';

interface Props extends AccessibleAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  className?: string;
}

const Container = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  height: 56px;
  padding: 0 48px 0 16px;
  border: 1px solid ${({ theme, hasError }) => 
    hasError ? theme.colors.error : theme.colors.border};
  border-radius: 4px;
  font-size: 20px;
  font-weight: 500;
  text-align: right;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: all 0.2s ease;

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accentBlue};
    outline-offset: 2px;
    border-color: ${({ theme }) => theme.colors.accentBlue};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.backgroundGray1};
    color: ${({ theme }) => theme.colors.textTertiary};
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const CurrencyLabel = styled.span`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  pointer-events: none;
`;

const ShortcutButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

const ShortcutButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundGray1};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accentBlue};
    outline-offset: 2px;
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.backgroundGray2};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const HelperText = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ErrorMessage = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.error};
  font-weight: 500;
`;

const AmountReader = styled.div`
  margin-top: 8px;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.backgroundGray1};
  border-radius: 4px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: center;
`;

const ScreenReaderOnly = styled.span`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

const shortcuts = [
  { label: '+1만', value: 10000 },
  { label: '+5만', value: 50000 },
  { label: '+10만', value: 100000 },
  { label: '+50만', value: 500000 },
  { label: '+100만', value: 1000000 }
];

export const AccessibleAmountInput: React.FC<Props> = ({
  label,
  value,
  onChange,
  currency = '원',
  min = 0,
  max,
  error,
  helperText,
  koreanNumberAnnouncement = true,
  className
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [lastAnnouncedValue, setLastAnnouncedValue] = useState('');
  const inputId = `amount-input-${Date.now()}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const readerId = `${inputId}-reader`;

  // 숫자만 허용하고 천단위 구분자 추가
  const formatValue = (rawValue: string): string => {
    const numbers = rawValue.replace(/[^\d]/g, '');
    if (numbers === '') return '';
    
    const numberValue = parseInt(numbers);
    if (max && numberValue > max) return value; // 최대값 초과 방지
    if (numberValue < min) return value; // 최소값 미만 방지
    
    return numberValue.toLocaleString();
  };

  // 포맷된 값에서 실제 숫자 추출
  const getNumericValue = (formattedValue: string): number => {
    return parseInt(formattedValue.replace(/[^\d]/g, '') || '0');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatValue(e.target.value);
    onChange(formatted);
  };

  const handleShortcut = (amount: number) => {
    const currentValue = getNumericValue(value);
    const newValue = currentValue + amount;
    
    if (max && newValue > max) {
      announce(`최대 금액은 ${formatAmountForScreenReader(max)}입니다.`);
      return;
    }
    
    onChange(newValue.toLocaleString());
    inputRef.current?.focus();
    
    announce(`${formatAmountForScreenReader(amount)}이 추가되었습니다. 현재 금액: ${formatAmountForScreenReader(newValue)}`);
  };

  // 금액 변경 시 스크린 리더 공지
  useEffect(() => {
    if (isFocused && value !== lastAnnouncedValue && koreanNumberAnnouncement) {
      const numericValue = getNumericValue(value);
      const amountText = formatAmountForScreenReader(numericValue);
      
      // 짧은 지연 후 공지 (타이핑 중 과도한 공지 방지)
      const timer = setTimeout(() => {
        announce(amountText, { priority: 'polite' });
        setLastAnnouncedValue(value);
      }, 500);
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [value, isFocused, lastAnnouncedValue, koreanNumberAnnouncement]);

  const numericValue = getNumericValue(value);
  const koreanAmount = koreanNumberAnnouncement ? formatAmountForScreenReader(numericValue) : '';
  
  const describedBy = [
    error && errorId,
    helperText && helperId,
    koreanNumberAnnouncement && readerId
  ].filter(Boolean).join(' ');

  return (
    <Container className={className}>
      <Label htmlFor={inputId}>
        {label}
      </Label>

      <InputWrapper>
        <Input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          hasError={!!error}
          aria-invalid={!!error}
          aria-errormessage={error ? errorId : undefined}
          aria-describedby={describedBy || undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={numericValue}
        />
        <CurrencyLabel aria-hidden="true">{currency}</CurrencyLabel>
        <ScreenReaderOnly aria-live="polite" aria-atomic="true">
          {koreanAmount}
        </ScreenReaderOnly>
      </InputWrapper>

      <ShortcutButtons>
        {shortcuts.map((shortcut) => (
          <ShortcutButton
            key={shortcut.value}
            type="button"
            onClick={() => handleShortcut(shortcut.value)}
            aria-label={`${formatAmountForScreenReader(shortcut.value)} 추가`}
          >
            {shortcut.label}
          </ShortcutButton>
        ))}
      </ShortcutButtons>

      {koreanNumberAnnouncement && numericValue > 0 && (
        <AmountReader id={readerId} aria-hidden="true">
          {koreanAmount}
        </AmountReader>
      )}

      {error && (
        <ErrorMessage id={errorId} role="alert">
          {error}
        </ErrorMessage>
      )}

      {helperText && !error && (
        <HelperText id={helperId}>
          {helperText}
        </HelperText>
      )}
    </Container>
  );
};