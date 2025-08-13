import React, { forwardRef } from 'react';

import styled, { css } from 'styled-components';

import { MEDIA_QUERIES } from '../../styles/breakpoints';
import { createResponsiveInput, KB_DESIGN_TOKENS } from '../../styles/responsive-system';
import { tokens } from '../../styles/tokens';
// Input 컴포넌트 Props 타입
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'basic' | 'search' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
// Input 변형별 스타일
const inputVariants = {
  basic: css`
    background: ${tokens.colors.background.primary};
    border: none;
    border-bottom: 2px solid ${tokens.colors.border.primary};
    border-radius: 0;
    &:focus {
      border-bottom-color: ${tokens.colors.border.focused};
      outline: none;
    }
    &:disabled {
      background: ${tokens.colors.background.surfaceDark};
      color: ${tokens.colors.text.disabled};
      cursor: not-allowed;
    }
  `,
  outlined: css`
    background: ${tokens.colors.background.primary};
    border: 1px solid ${tokens.colors.border.primary};
    border-radius: ${tokens.borderRadius.large};
    &:focus {
      border-color: ${tokens.colors.border.focused};
      outline: none;
    }
    &:disabled {
      background: ${tokens.colors.background.surfaceDark};
      border-color: ${tokens.colors.border.disabled};
      color: ${tokens.colors.text.disabled};
    }
  `,
  search: css`
    background: ${tokens.colors.background.primary};
    border: 1px solid ${tokens.colors.border.primary};
    border-radius: ${tokens.borderRadius.large};
    padding-right: 40px; /* 검색 아이콘 공간 */
    &:focus {
      border-color: ${tokens.colors.border.focused};
      outline: none;
    }
  `,
};
// Input 크기별 스타일
const inputSizes = {
  small: css`
    height: ${tokens.sizes.input.heightSmall};
    padding: ${tokens.spacing[2]} ${tokens.sizes.input.paddingHorizontal};
    font-size: ${tokens.typography.fontSize.bodySmall};
  `,
  medium: css`
    height: ${tokens.sizes.input.heightMedium};
    padding: ${tokens.sizes.input.paddingVertical} ${tokens.sizes.input.paddingHorizontal};
    font-size: ${tokens.typography.fontSize.bodyMedium};
  `,
  large: css`
    height: ${tokens.sizes.input.heightLarge};
    padding: ${tokens.spacing[3]} ${tokens.sizes.input.paddingHorizontal};
    font-size: ${tokens.typography.fontSize.bodyLarge};
  `,
};
// 컨테이너 스타일
const InputContainer = styled.div<{ fullWidth?: boolean }>`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  gap: ${tokens.sizes.input.labelSpacing};
  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}
`;
// 라벨 스타일
const InputLabel = styled.label`
  font-size: ${tokens.typography.fontSize.labelLarge};
  font-weight: ${tokens.typography.fontWeight.medium};
  color: ${tokens.colors.text.secondary};
  line-height: ${tokens.typography.lineHeight.label};
`;
// 입력 필드 래퍼
const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;
// KB 앱 완전 반응형 스타일드 입력 필드
const StyledInput = styled.input<InputProps>`
  /* KB 앱 반응형 입력 필드 기본 스타일 */
  ${createResponsiveInput()}
  font-family: ${tokens.typography.fontFamily.base};
  font-weight: ${tokens.typography.fontWeight.regular};

  /* 크기 스타일 적용 */
  ${({ size = 'medium' }) => inputSizes[size]}
  /* 변형 스타일 적용 */
  ${({ variant = 'basic' }) => inputVariants[variant]}
  
  /* 에러 상태 */
  ${({ error }) =>
    error &&
    css`
      border-color: ${KB_DESIGN_TOKENS.colors.error} !important;
      &:focus {
        border-color: ${KB_DESIGN_TOKENS.colors.error} !important;
      }
    `}
  
  /* 플레이스홀더 스타일 */
  &::placeholder {
    color: ${KB_DESIGN_TOKENS.colors.onSurfaceVariant};
    font-weight: ${tokens.typography.fontWeight.regular};
  }

  /* 반응형 아이콘 패딩 조정 */
  ${(props: any) =>
    props.leftIcon &&
    css`
      padding-left: 40px;

      ${MEDIA_QUERIES.phoneSmall} {
        padding-left: 36px;
      }

      ${MEDIA_QUERIES.tablet} {
        padding-left: 44px;
      }
    `}

  ${(props: any) =>
    props.rightIcon &&
    props.variant !== 'search' &&
    css`
      padding-right: 40px;

      ${MEDIA_QUERIES.phoneSmall} {
        padding-right: 36px;
      }

      ${MEDIA_QUERIES.tablet} {
        padding-right: 44px;
      }
    `}
  
  /* 터치 최적화 */
  ${MEDIA_QUERIES.touch} {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  /* 폴더블 기기 최적화 */
  ${MEDIA_QUERIES.foldableClosed} {
    min-height: 42px;
    font-size: 13px;
  }
`;
// 아이콘 스타일
const IconWrapper = styled.span<{ position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: ${tokens.colors.text.tertiary};
  pointer-events: none;
  ${({ position }) =>
    position === 'left'
      ? css`
          left: ${tokens.spacing[3]};
        `
      : css`
          right: ${tokens.spacing[3]};
        `}
`;
// 도움말 텍스트 스타일
const HelperText = styled.div<{ error?: boolean }>`
  font-size: ${tokens.typography.fontSize.labelMedium};
  font-weight: ${tokens.typography.fontWeight.regular};
  color: ${({ error }) => (error ? tokens.colors.text.error : tokens.colors.text.tertiary)};
  margin-top: ${tokens.sizes.input.helperSpacing};
  line-height: ${tokens.typography.lineHeight.label};
`;
/**
 * KB StarBanking Input 컴포넌트
 * 원본 XML 명세를 정확히 구현한 입력 필드 시스템
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'basic',
      size = 'medium',
      fullWidth = false,
      error = false,
      helperText,
      label,
      leftIcon,
      rightIcon,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <InputContainer fullWidth={fullWidth} className={className}>
        {label && <InputLabel>{label}</InputLabel>}
        <InputWrapper>
          {leftIcon && <IconWrapper position='left'>{leftIcon}</IconWrapper>}
          <StyledInput
            ref={ref}
            variant={variant}
            size={size}
            error={error}
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            {...props}
          />
          {rightIcon && <IconWrapper position='right'>{rightIcon}</IconWrapper>}
        </InputWrapper>
        {helperText && <HelperText error={error}>{helperText}</HelperText>}
      </InputContainer>
    );
  }
);
Input.displayName = 'Input';
// 미리 정의된 입력 필드 변형들
export const BasicInput: React.FC<Omit<InputProps, 'variant'>> = props => (
  <Input variant='basic' {...props} />
);
export const OutlinedInput: React.FC<Omit<InputProps, 'variant'>> = props => (
  <Input variant='outlined' {...props} />
);
export const SearchInput: React.FC<Omit<InputProps, 'variant'>> = props => (
  <Input
    variant='search'
    rightIcon={
      <svg width='20' height='20' viewBox='0 0 24 24' fill='none'>
        <circle cx='11' cy='11' r='8' stroke='currentColor' strokeWidth='2' />
        <path d='m21 21-4.35-4.35' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
      </svg>
    }
    {...props}
  />
);
export default Input;
