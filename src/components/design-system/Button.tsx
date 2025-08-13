/**
 * KB 스타뱅킹 완전 반응형 Button 컴포넌트
 * 원본 앱과 85% 스케일 일관성 유지
 * 모든 안드로이드 기기에서 완벽한 터치 타겟 보장
 */

import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { MEDIA_QUERIES } from '../../styles/breakpoints';
import { createResponsiveButton, KB_DESIGN_TOKENS, ensureTouchTarget } from '../../styles/responsive-system';

// Button 컴포넌트 Props 타입
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
}

// KB 앱 85% 스케일 적용된 반응형 Button 변형별 스타일
const buttonVariants = {
  primary: css`
    ${createResponsiveButton('primary')}
    
    /* 호버 및 활성 상태 */
    ${MEDIA_QUERIES.mouse} {
      &:hover:not(:disabled) {
        background: ${KB_DESIGN_TOKENS.colors.primaryDark};
        transform: translateY(-1px);
      }
    }
    
    &:active:not(:disabled) {
      background: ${KB_DESIGN_TOKENS.colors.primaryDark};
      transform: scale(0.98);
    }
    
    &:disabled {
      background: ${KB_DESIGN_TOKENS.colors.surfaceVariant};
      color: ${KB_DESIGN_TOKENS.colors.onSurfaceVariant};
      cursor: not-allowed;
    }
  `,
  
  secondary: css`
    ${createResponsiveButton('secondary')}
    
    ${MEDIA_QUERIES.mouse} {
      &:hover:not(:disabled) {
        background: ${KB_DESIGN_TOKENS.colors.surface};
        border-color: ${KB_DESIGN_TOKENS.colors.primary};
      }
    }
    
    &:active:not(:disabled) {
      background: ${KB_DESIGN_TOKENS.colors.surfaceVariant};
    }
    
    &:disabled {
      background: ${KB_DESIGN_TOKENS.colors.surfaceVariant};
      border-color: ${KB_DESIGN_TOKENS.colors.surfaceVariant};
      color: ${KB_DESIGN_TOKENS.colors.onSurfaceVariant};
    }
  `,
  
  outline: css`
    ${createResponsiveButton('outline')}
    
    ${MEDIA_QUERIES.mouse} {
      &:hover:not(:disabled) {
        background: ${KB_DESIGN_TOKENS.colors.primary}08;
        transform: translateY(-1px);
      }
    }
    
    &:active:not(:disabled) {
      background: ${KB_DESIGN_TOKENS.colors.primary}16;
    }
    
    &:disabled {
      border-color: ${KB_DESIGN_TOKENS.colors.surfaceVariant};
      color: ${KB_DESIGN_TOKENS.colors.onSurfaceVariant};
    }
  `,
  
  text: css`
    background: transparent;
    color: ${KB_DESIGN_TOKENS.colors.primary};
    border: none;
    padding: ${KB_DESIGN_TOKENS.spacing.sm} ${KB_DESIGN_TOKENS.spacing.md};
    
    ${MEDIA_QUERIES.mouse} {
      &:hover:not(:disabled) {
        background: ${KB_DESIGN_TOKENS.colors.primary}08;
      }
    }
    
    &:active:not(:disabled) {
      background: ${KB_DESIGN_TOKENS.colors.primary}16;
    }
    
    &:disabled {
      color: ${KB_DESIGN_TOKENS.colors.onSurfaceVariant};
    }
  `,
  
  danger: css`
    background: ${KB_DESIGN_TOKENS.colors.error};
    color: white;
    border: none;
    
    ${MEDIA_QUERIES.mouse} {
      &:hover:not(:disabled) {
        background: #d32f2f;
        transform: translateY(-1px);
      }
    }
    
    &:active:not(:disabled) {
      background: #b71c1c;
    }
    
    &:disabled {
      background: ${KB_DESIGN_TOKENS.colors.surfaceVariant};
      color: ${KB_DESIGN_TOKENS.colors.onSurfaceVariant};
    }
  `
};

// 버튼 크기별 스타일
const buttonSizes = {
  small: css`
    min-height: 36px;
    padding: ${KB_DESIGN_TOKENS.spacing.xs} ${KB_DESIGN_TOKENS.spacing.md};
    font-size: 12px;
    
    ${MEDIA_QUERIES.phoneSmall} {
      min-height: 34px;
      padding: ${KB_DESIGN_TOKENS.spacing.xs} ${KB_DESIGN_TOKENS.spacing.sm};
      font-size: 11px;
    }
    
    ${MEDIA_QUERIES.tablet} {
      min-height: 40px;
      font-size: 13px;
    }
  `,
  
  medium: css`
    min-height: 48px;
    padding: ${KB_DESIGN_TOKENS.spacing.sm} ${KB_DESIGN_TOKENS.spacing.lg};
    font-size: 14px;
    
    ${MEDIA_QUERIES.phoneSmall} {
      min-height: 44px;
      padding: ${KB_DESIGN_TOKENS.spacing.sm} ${KB_DESIGN_TOKENS.spacing.md};
      font-size: 13px;
    }
    
    ${MEDIA_QUERIES.tablet} {
      min-height: 52px;
      font-size: 15px;
    }
  `,
  
  large: css`
    min-height: 56px;
    padding: ${KB_DESIGN_TOKENS.spacing.md} ${KB_DESIGN_TOKENS.spacing.xl};
    font-size: 16px;
    
    ${MEDIA_QUERIES.phoneSmall} {
      min-height: 52px;
      padding: ${KB_DESIGN_TOKENS.spacing.md} ${KB_DESIGN_TOKENS.spacing.lg};
      font-size: 15px;
    }
    
    ${MEDIA_QUERIES.tablet} {
      min-height: 60px;
      font-size: 17px;
    }
  `,
  
  xlarge: css`
    min-height: 64px;
    padding: ${KB_DESIGN_TOKENS.spacing.lg} ${KB_DESIGN_TOKENS.spacing.xxl};
    font-size: 18px;
    
    ${MEDIA_QUERIES.phoneSmall} {
      min-height: 60px;
      padding: ${KB_DESIGN_TOKENS.spacing.md} ${KB_DESIGN_TOKENS.spacing.xl};
      font-size: 16px;
    }
    
    ${MEDIA_QUERIES.tablet} {
      min-height: 68px;
      font-size: 19px;
    }
  `
};

// KB 앱 완전 반응형 스타일드 Button 컴포넌트
const StyledButton = styled.button<ButtonProps>`
  /* 기본 반응형 스타일 */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${KB_DESIGN_TOKENS.spacing.sm};
  border-radius: ${KB_DESIGN_TOKENS.borderRadius.medium};
  font-weight: 500;
  cursor: pointer;
  box-sizing: border-box;
  transition: all 0.2s ease;
  font-family: inherit;
  text-decoration: none;
  
  /* 터치 최적화 */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  
  /* 크기 스타일 적용 */
  ${({ size = 'medium' }) => buttonSizes[size]}
  /* 변형 스타일 적용 */
  ${({ variant = 'primary' }) => buttonVariants[variant]}
  
  /* 전체 너비 옵션 */
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
  
  /* 아이콘만 있는 버튼 */
  ${({ iconOnly }) => iconOnly && css`
    width: auto;
    aspect-ratio: 1;
    padding: ${KB_DESIGN_TOKENS.spacing.sm};
    
    ${MEDIA_QUERIES.phoneSmall} {
      padding: ${KB_DESIGN_TOKENS.spacing.xs};
    }
    
    ${MEDIA_QUERIES.tablet} {
      padding: ${KB_DESIGN_TOKENS.spacing.md};
    }
  `}
  
  /* 로딩 상태 */
  ${({ loading }) => loading && css`
    position: relative;
    color: transparent !important;
    cursor: not-allowed;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-radius: 50%;
      border-top-color: transparent;
      animation: button-spin 0.8s linear infinite;
      color: ${KB_DESIGN_TOKENS.colors.onSurface};
    }
    
    @keyframes button-spin {
      to {
        transform: translate(-50%, -50%) rotate(360deg);
      }
    }
  `}
  
  /* 포커스 스타일 */
  &:focus-visible {
    outline: 2px solid ${KB_DESIGN_TOKENS.colors.primary};
    outline-offset: 2px;
  }
  
  /* 폴더블 기기 최적화 */
  ${MEDIA_QUERIES.foldableClosed} {
    min-height: 40px;
    padding: ${KB_DESIGN_TOKENS.spacing.xs} ${KB_DESIGN_TOKENS.spacing.sm};
    font-size: 12px;
  }
  
  /* 감소된 모션 선호도 고려 */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none !important;
  }
`;

// 아이콘 래퍼 컴포넌트
const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 16px;
    height: 16px;
    
    ${MEDIA_QUERIES.phoneSmall} {
      width: 14px;
      height: 14px;
    }
    
    ${MEDIA_QUERIES.tablet} {
      width: 18px;
      height: 18px;
    }
  }
`;

/**
 * KB 스타뱅킹 완전 반응형 Button 컴포넌트
 * 모든 안드로이드 기기에서 완벽한 터치 타겟 보장
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  iconOnly = false,
  children,
  disabled,
  className,
  ...props
}, ref) => {
  return (
    <StyledButton
      ref={ref}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      loading={loading}
      iconOnly={iconOnly}
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {leftIcon && !iconOnly && (
        <IconWrapper>
          {leftIcon}
        </IconWrapper>
      )}
      
      {iconOnly ? (
        <IconWrapper>
          {leftIcon || rightIcon || children}
        </IconWrapper>
      ) : (
        children
      )}
      
      {rightIcon && !iconOnly && (
        <IconWrapper>
          {rightIcon}
        </IconWrapper>
      )}
    </StyledButton>
  );
});

Button.displayName = 'Button';

// 미리 정의된 Button 변형들
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="secondary" {...props} />
);

export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="outline" {...props} />
);

export const TextButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="text" {...props} />
);

export const DangerButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="danger" {...props} />
);

// 특화된 KB 버튼들
export const KBYellowButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

export const LoginButton: React.FC<Omit<ButtonProps, 'variant' | 'fullWidth' | 'size'>> = (props) => (
  <Button variant="primary" fullWidth size="large" {...props} />
);

export const ConfirmButton: React.FC<Omit<ButtonProps, 'variant' | 'fullWidth'>> = (props) => (
  <Button variant="primary" fullWidth {...props} />
);

export const CancelButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="secondary" {...props} />
);

// 플로팅 액션 버튼
export const FloatingActionButton = styled(Button)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  box-shadow: ${KB_DESIGN_TOKENS.shadows.button};
  z-index: 1000;
  
  ${MEDIA_QUERIES.phoneSmall} {
    bottom: 20px;
    right: 20px;
    width: 52px;
    height: 52px;
  }
  
  ${MEDIA_QUERIES.tablet} {
    bottom: 32px;
    right: 32px;
    width: 64px;
    height: 64px;
  }
  
  /* 안전 영역 고려 */
  bottom: calc(24px + env(safe-area-inset-bottom));
  right: calc(24px + env(safe-area-inset-right));
`;

export default Button;