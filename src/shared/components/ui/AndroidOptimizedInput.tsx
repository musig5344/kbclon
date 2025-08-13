import React from 'react';

import styled from 'styled-components';

import { androidOptimizedInput } from '../../../styles/android-webview-optimizations';
import { tokens } from '../../../styles/tokens';

/**
 * Android WebView 전용 최적화 입력 필드
 * - Android 키보드 호환성 완벽 지원
 * - WebView 성능 최적화
 * - 터치 이벤트 완벽 대응
 * - APK 환경에서 네이티브 수준의 UX 제공
 */

interface AndroidOptimizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled';
}

const InputContainer = styled.div<{ $fullWidth?: boolean }>`
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};
  display: flex;
  flex-direction: column;
  gap: 6px;
  
  /* Android WebView 컨테이너 최적화 */
  box-sizing: border-box;
  position: relative;
`;

const InputLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${tokens.colors.text.secondary};
  margin-bottom: 4px;
  
  /* Android WebView 라벨 최적화 */
  -webkit-user-select: none;
  user-select: none;
  touch-action: manipulation;
`;

const StyledInput = styled.input<{ $hasError?: boolean; $variant?: 'outlined' | 'filled' }>`
  ${androidOptimizedInput}
  
  border: 1px solid ${({ $hasError }) => 
    $hasError ? '#FF3B30' : tokens.colors.border.primary};
  border-radius: 8px;
  background-color: ${({ $variant }) => 
    $variant === 'filled' ? tokens.colors.background.secondary : '#FFFFFF'};
  color: ${tokens.colors.text.primary};
  
  /* Android WebView 특화 입력 최적화 */
  font-size: 16px; /* Android 확대 방지를 위한 최소 크기 */
  line-height: 1.5;
  
  /* Android 키보드 최적화 */
  input-mode: text;
  autocomplete: off;
  autocorrect: off;
  autocapitalize: off;
  spellcheck: false;
  
  /* Android WebView 포커스 상태 */
  &:focus {
    border-color: ${({ $hasError }) => 
      $hasError ? '#FF3B30' : '#FFD338'};
    box-shadow: 0 0 0 2px ${({ $hasError }) => 
      $hasError ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 211, 56, 0.2)'};
  }
  
  /* Android WebView 비활성화 상태 */
  &:disabled {
    background-color: ${tokens.colors.background.tertiary};
    color: ${tokens.colors.text.disabled};
    cursor: not-allowed;
    -webkit-text-fill-color: ${tokens.colors.text.disabled};
    opacity: 1; /* Android WebView에서 opacity 이슈 방지 */
  }
  
  /* Android WebView 플레이스홀더 */
  &::placeholder {
    color: ${tokens.colors.text.tertiary};
    opacity: 1;
    -webkit-text-fill-color: ${tokens.colors.text.tertiary};
  }
  
  /* Android 자동완성 스타일 재설정 */
  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px #ffffff inset;
    -webkit-text-fill-color: ${tokens.colors.text.primary};
    transition: background-color 5000s ease-in-out 0s;
  }
`;

const HelperText = styled.div<{ $isError?: boolean }>`
  font-size: 12px;
  color: ${({ $isError }) => 
    $isError ? '#FF3B30' : tokens.colors.text.tertiary};
  margin-top: 4px;
  
  /* Android WebView 헬퍼 텍스트 최적화 */
  -webkit-user-select: none;
  user-select: none;
  line-height: 1.3;
`;

export const AndroidOptimizedInput: React.FC<AndroidOptimizedInputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  variant = 'outlined',
  ...props
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  // Android WebView 키보드 최적화
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    // Android WebView에서 키보드가 나타날 때 스크롤 조정
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 300); // Android 키보드 애니메이션 시간 고려
    
    props.onFocus?.(event);
  };
  
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    // Android WebView 키보드 숨김 최적화
    props.onBlur?.(event);
  };
  
  return (
    <InputContainer $fullWidth={fullWidth}>
      {label && (
        <InputLabel htmlFor={props.id}>
          {label}
        </InputLabel>
      )}
      
      <StyledInput
        ref={inputRef}
        $hasError={!!error}
        $variant={variant}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      
      {(error || helperText) && (
        <HelperText $isError={!!error}>
          {error || helperText}
        </HelperText>
      )}
    </InputContainer>
  );
};

// 특수 Android 입력 타입들
export const AndroidNumberInput: React.FC<AndroidOptimizedInputProps> = (props) => (
  <AndroidOptimizedInput
    type="tel" // Android에서 숫자 키보드 최적화
    inputMode="numeric"
    pattern="[0-9]*"
    {...props}
  />
);

export const AndroidEmailInput: React.FC<AndroidOptimizedInputProps> = (props) => (
  <AndroidOptimizedInput
    type="email"
    inputMode="email"
    autoComplete="email"
    {...props}
  />
);

export const AndroidPasswordInput: React.FC<AndroidOptimizedInputProps> = (props) => (
  <AndroidOptimizedInput
    type="password"
    autoComplete="current-password"
    {...props}
  />
);

export default AndroidOptimizedInput;