/**
 * KB스타뱅킹 네이티브 느낌 입력 필드 컴포넌트
 * 원본 앱과 100% 동일한 입력 경험
 */

import React, { useState, useRef, useCallback } from 'react';

import styled, { css } from 'styled-components';

import { KBDesignSystem } from '../../styles/tokens/kb-design-system';

// 입력 필드 타입
type InputVariant = 'default' | 'password' | 'number' | 'account';
type InputSize = 'small' | 'medium' | 'large';

interface KBInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  error?: string;
  helper?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  clearable?: boolean;
  secure?: boolean; // 비밀번호 보기/숨기기
  onClear?: () => void;
}

// 입력 필드 컨테이너
const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

// 라벨
const Label = styled.label<{ $focused: boolean; $hasValue: boolean }>`
  position: absolute;
  left: ${KBDesignSystem.spacing.base};
  background-color: ${KBDesignSystem.colors.background.white};
  padding: 0 ${KBDesignSystem.spacing.xs};
  color: ${KBDesignSystem.colors.text.secondary};
  font-size: ${KBDesignSystem.typography.fontSize.base};
  font-weight: ${KBDesignSystem.typography.fontWeight.regular};
  pointer-events: none;
  transition: all ${KBDesignSystem.animation.duration.fast} ${KBDesignSystem.animation.easing.easeOut};
  
  /* 플로팅 라벨 효과 */
  ${({ $focused, $hasValue }) => ($focused || $hasValue) && css`
    top: -8px;
    font-size: ${KBDesignSystem.typography.fontSize.xs};
    color: ${$focused ? KBDesignSystem.colors.primary.yellow : KBDesignSystem.colors.text.tertiary};
  `}
  
  ${({ $focused, $hasValue }) => !($focused || $hasValue) && css`
    top: 50%;
    transform: translateY(-50%);
  `}
`;

// 입력 필드 래퍼
const InputWrapper = styled.div<{ $focused: boolean; $error: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  background-color: ${KBDesignSystem.colors.background.white};
  border: 1px solid ${({ $error, $focused }) => 
    $error ? KBDesignSystem.colors.status.error :
    $focused ? KBDesignSystem.colors.primary.yellow :
    KBDesignSystem.colors.border.medium
  };
  border-radius: ${KBDesignSystem.borderRadius.input};
  overflow: hidden;
  transition: all ${KBDesignSystem.animation.duration.fast} ${KBDesignSystem.animation.easing.easeOut};
  
  /* 포커스 시 그림자 */
  ${({ $focused }) => $focused && css`
    box-shadow: 0 0 0 3px ${KBDesignSystem.colors.primary.yellowAlpha20};
  `}
`;

// 입력 필드
const InputField = styled.input<{ $size: InputSize; $hasPrefix: boolean; $hasSuffix: boolean }>`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-weight: ${KBDesignSystem.typography.fontWeight.regular};
  color: ${KBDesignSystem.colors.text.primary};
  -webkit-appearance: none;
  
  /* 사이즈별 스타일 */
  ${({ $size }) => {
    const sizeStyles = {
      small: css`
        height: 40px;
        font-size: ${KBDesignSystem.typography.fontSize.sm};
        padding: ${KBDesignSystem.spacing.sm} ${KBDesignSystem.spacing.md};
      `,
      medium: css`
        height: 48px;
        font-size: ${KBDesignSystem.typography.fontSize.base};
        padding: ${KBDesignSystem.spacing.md} ${KBDesignSystem.spacing.base};
      `,
      large: css`
        height: 56px;
        font-size: ${KBDesignSystem.typography.fontSize.md};
        padding: ${KBDesignSystem.spacing.base} ${KBDesignSystem.spacing.lg};
      `,
    };
    return sizeStyles[$size];
  }}
  
  /* Prefix/Suffix 패딩 조정 */
  ${({ $hasPrefix }) => $hasPrefix && css`
    padding-left: 0;
  `}
  
  ${({ $hasSuffix }) => $hasSuffix && css`
    padding-right: 0;
  `}
  
  /* Placeholder 스타일 */
  &::placeholder {
    color: ${KBDesignSystem.colors.text.tertiary};
  }
  
  /* 자동완성 배경색 제거 */
  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px ${KBDesignSystem.colors.background.white} inset;
    -webkit-text-fill-color: ${KBDesignSystem.colors.text.primary};
  }
  
  /* 숫자 입력 스피너 제거 */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

// Prefix/Suffix 스타일
const InputAddon = styled.span`
  display: flex;
  align-items: center;
  padding: 0 ${KBDesignSystem.spacing.md};
  color: ${KBDesignSystem.colors.text.secondary};
  font-size: ${KBDesignSystem.typography.fontSize.base};
`;

// 액션 버튼
const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${KBDesignSystem.spacing.sm};
  margin-right: ${KBDesignSystem.spacing.xs};
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  color: ${KBDesignSystem.colors.text.secondary};
  transition: all ${KBDesignSystem.animation.duration.fast} ${KBDesignSystem.animation.easing.easeOut};
  
  &:hover {
    color: ${KBDesignSystem.colors.text.primary};
  }
  
  &:active {
    transform: scale(0.9);
  }
`;

// 헬퍼 텍스트
const HelperText = styled.div<{ $error?: boolean }>`
  margin-top: ${KBDesignSystem.spacing.xs};
  padding: 0 ${KBDesignSystem.spacing.base};
  font-size: ${KBDesignSystem.typography.fontSize.xs};
  color: ${({ $error }) => $error ? KBDesignSystem.colors.status.error : KBDesignSystem.colors.text.tertiary};
`;

// 아이콘 컴포넌트
const ClearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 0C4.47 0 0 4.47 0 10s4.47 10 10 10 10-4.47 10-10S15.53 0 10 0zm5 13.59L13.59 15 10 11.41 6.41 15 5 13.59 8.59 10 5 6.41 6.41 5 10 8.59 13.59 5 15 6.41 11.41 10 15 13.59z"/>
  </svg>
);

const EyeIcon = ({ visible }: { visible: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    {visible ? (
      <path d="M10 4C4.5 4 0 10 0 10s4.5 6 10 6 10-6 10-6-4.5-6-10-6zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
    ) : (
      <path d="M17.1 15.3L4.7 2.9c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l2.1 2.1C2.2 7.8 0 10 0 10s4.5 6 10 6c1.3 0 2.5-.3 3.6-.8l2.1 2.1c.2.2.5.3.7.3s.5-.1.7-.3c.4-.4.4-1 0-1.4zM10 14c-2.2 0-4-1.8-4-4 0-.8.2-1.5.6-2.1l5.5 5.5c-.6.4-1.3.6-2.1.6zm4-4c0 .3 0 .6-.1.9l2.5 2.5C18.5 11.9 20 10 20 10s-2.2-3.5-5.1-5.1l-2.5 2.5c.3.5.6 1.5.6 2.6z"/>
    )}
  </svg>
);

export const KBInput: React.FC<KBInputProps> = ({
  variant = 'default',
  size = 'medium',
  label,
  error,
  helper,
  prefix,
  suffix,
  clearable,
  secure,
  onClear,
  value,
  onChange,
  type,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const hasValue = Boolean(value && String(value).length > 0);
  
  // 입력 타입 결정
  const inputType = () => {
    if (variant === 'password' && !showPassword) return 'password';
    if (variant === 'number') return 'tel'; // 모바일 숫자 키패드
    if (variant === 'account') return 'tel';
    return type || 'text';
  };
  
  // 계좌번호 포맷팅
  const formatAccountNumber = (val: string) => {
    const numbers = val.replace(/[^0-9]/g, '');
    const parts = [];
    
    if (numbers.length <= 3) return numbers;
    parts.push(numbers.slice(0, 3));
    
    if (numbers.length <= 5) {
      parts.push(numbers.slice(3));
    } else if (numbers.length <= 11) {
      parts.push(numbers.slice(3, 5));
      parts.push(numbers.slice(5));
    } else {
      parts.push(numbers.slice(3, 5));
      parts.push(numbers.slice(5, 11));
      parts.push(numbers.slice(11, 14));
    }
    
    return parts.join('-');
  };
  
  // 입력 핸들러
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    if (variant === 'account') {
      newValue = formatAccountNumber(newValue);
    }
    
    if (onChange) {
      const event = { ...e, target: { ...e.target, value: newValue } };
      onChange(event as React.ChangeEvent<HTMLInputElement>);
    }
  }, [variant, onChange]);
  
  // 클리어 핸들러
  const handleClear = useCallback(() => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      const event = {
        target: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
    inputRef.current?.focus();
  }, [onClear, onChange]);
  
  return (
    <InputContainer>
      <InputWrapper $focused={focused} $error={Boolean(error)}>
        {label && (
          <Label $focused={focused} $hasValue={hasValue}>
            {label}
          </Label>
        )}
        
        {prefix && <InputAddon>{prefix}</InputAddon>}
        
        <InputField
          ref={inputRef}
          $size={size}
          $hasPrefix={Boolean(prefix)}
          $hasSuffix={Boolean(suffix || clearable || secure)}
          type={inputType()}
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        
        {/* 액션 버튼들 */}
        {clearable && hasValue && (
          <ActionButton type="button" onClick={handleClear}>
            <ClearIcon />
          </ActionButton>
        )}
        
        {secure && variant === 'password' && (
          <ActionButton 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
          >
            <EyeIcon visible={showPassword} />
          </ActionButton>
        )}
        
        {suffix && <InputAddon>{suffix}</InputAddon>}
      </InputWrapper>
      
      {(error || helper) && (
        <HelperText $error={Boolean(error)}>
          {error || helper}
        </HelperText>
      )}
    </InputContainer>
  );
};

// 입력 그룹 컴포넌트
export const KBInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${KBDesignSystem.spacing.base};
`;

export default KBInput;