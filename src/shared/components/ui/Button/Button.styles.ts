import styled, { css, keyframes } from 'styled-components';

import { tokens } from '../../../../styles/tokens';
import { KBDesignSystem } from '../../../../styles/tokens/kb-design-system';

import { ButtonProps, ButtonVariant, ButtonSize } from './Button.types';
/**
 * 로딩 스피너 애니메이션
 */
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;
/**
 * Ripple 효과 애니메이션 (KBButton 통합)
 */
export const rippleAnimation = keyframes`
  to {
    width: 200px;
    height: 200px;
    opacity: 0;
  }
`;
/**
 * 버튼 변형별 스타일
 */
export const buttonVariants: Record<ButtonVariant, ReturnType<typeof css>> = {
  primary: css`
    background-color: ${tokens.colors.brand.primary};
    color: ${tokens.colors.text.primary};
    border: none;
    box-shadow: ${tokens.shadows.elevation1};
    &:hover:not(:disabled) {
      background-color: ${tokens.colors.brand.dark};
      box-shadow: ${tokens.shadows.elevation2};
    }
    &:active:not(:disabled) {
      background-color: ${tokens.colors.brand.variant};
      box-shadow: ${tokens.shadows.elevation1};
    }
  `,
  secondary: css`
    background-color: ${tokens.colors.background.primary};
    color: ${tokens.colors.text.primary};
    border: 1px solid ${tokens.colors.border.primary};
    &:hover:not(:disabled) {
      background-color: ${tokens.colors.background.secondary};
      border-color: ${tokens.colors.border.secondary};
    }
    &:active:not(:disabled) {
      background-color: ${tokens.colors.background.surfaceDark};
    }
  `,
  outline: css`
    background-color: transparent;
    color: ${tokens.colors.brand.primary};
    border: 1px solid ${tokens.colors.brand.primary};
    &:hover:not(:disabled) {
      background-color: ${tokens.colors.brand.light};
    }
    &:active:not(:disabled) {
      background-color: ${tokens.colors.brand.light};
      opacity: 0.8;
    }
  `,
  text: css`
    background-color: transparent;
    color: ${tokens.colors.text.link};
    border: none;
    text-decoration: underline;
    &:hover:not(:disabled) {
      background-color: rgba(40, 126, 255, 0.05);
      text-decoration: none;
    }
    &:active:not(:disabled) {
      background-color: rgba(40, 126, 255, 0.1);
    }
  `,
  'dialog-left': css`
    background-color: ${tokens.colors.background.secondary};
    color: ${tokens.colors.text.primary};
    border: none;
    &:hover:not(:disabled) {
      background-color: ${tokens.colors.background.tertiary};
    }
    &:active:not(:disabled) {
      background-color: ${tokens.colors.background.tertiary};
      opacity: 0.9;
    }
  `,
  'dialog-right': css`
    background-color: ${tokens.colors.brand.primary};
    color: ${tokens.colors.text.primary};
    border: none;
    &:hover:not(:disabled) {
      background-color: ${tokens.colors.brand.dark};
    }
    &:active:not(:disabled) {
      background-color: ${tokens.colors.brand.dark};
      opacity: 0.9;
    }
  `,
  // KBButton 네이티브 스타일 variants 추가
  ghost: css`
    background-color: ${KBDesignSystem.colors.primary.yellowAlpha10};
    color: ${KBDesignSystem.colors.text.primary};
    border: none;
    
    &:hover:not(:disabled) {
      background-color: ${KBDesignSystem.colors.primary.yellowAlpha20};
    }
    
    &:active:not(:disabled) {
      background-color: ${KBDesignSystem.colors.primary.yellowAlpha20};
      transform: scale(0.96);
    }
  `,
  'native-primary': css`
    background-color: ${KBDesignSystem.colors.primary.yellow};
    color: ${KBDesignSystem.colors.text.primary};
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    &:hover:not(:disabled) {
      background-color: ${KBDesignSystem.colors.primary.yellowDark};
    }
    
    &:active:not(:disabled) {
      background-color: ${KBDesignSystem.colors.primary.yellowDark};
      transform: scale(0.96);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }
  `,
  'native-secondary': css`
    background-color: ${KBDesignSystem.colors.background.white};
    color: ${KBDesignSystem.colors.text.primary};
    border: 1px solid ${KBDesignSystem.colors.border.medium};
    
    &:hover:not(:disabled) {
      background-color: ${KBDesignSystem.colors.background.gray200};
    }
    
    &:active:not(:disabled) {
      background-color: ${KBDesignSystem.colors.background.gray300};
      transform: scale(0.96);
    }
  `,
  'native-ghost': css`
    background-color: ${KBDesignSystem.colors.primary.yellowAlpha10};
    color: ${KBDesignSystem.colors.text.primary};
    border: none;
    
    &:hover:not(:disabled) {
      background-color: ${KBDesignSystem.colors.primary.yellowAlpha20};
    }
    
    &:active:not(:disabled) {
      background-color: ${KBDesignSystem.colors.primary.yellowAlpha20};
      transform: scale(0.96);
    }
  `,
};
/**
 * 버튼 크기별 스타일
 */
export const buttonSizes: Record<ButtonSize, ReturnType<typeof css>> = {
  small: css`
    height: ${tokens.sizes.button.heightSmall};
    padding: 0 ${tokens.spacing[4]};
    font-size: ${tokens.typography.fontSize.bodySmall};
    font-weight: ${tokens.typography.fontWeight.regular};
    min-width: 80px;
  `,
  medium: css`
    height: ${tokens.sizes.button.heightMedium};
    padding: 0 ${tokens.spacing[5]};
    font-size: ${tokens.typography.fontSize.bodyMedium};
    font-weight: ${tokens.typography.fontWeight.medium};
    min-width: 100px;
  `,
  large: css`
    height: ${tokens.sizes.button.heightLarge};
    padding: 0 ${tokens.spacing[6]};
    font-size: ${tokens.typography.fontSize.bodyLarge};
    font-weight: ${tokens.typography.fontWeight.bold};
    min-width: ${tokens.sizes.button.minWidth};
  `,
  xl: css`
    height: ${tokens.sizes.button.heightXL};
    padding: 0 ${tokens.spacing[8]};
    font-size: ${tokens.typography.fontSize.bodyLarge};
    font-weight: ${tokens.typography.fontWeight.bold};
    min-width: 140px;
  `,
  dialog: css`
    height: 52px;
    padding: 0 ${tokens.spacing[6]};
    font-size: 17px;
    font-weight: ${tokens.typography.fontWeight.bold};
    min-width: 100px;
  `,
  bottomsheet: css`
    height: 64px;
    padding: 0 ${tokens.spacing[6]};
    font-size: 18px;
    font-weight: ${tokens.typography.fontWeight.bold};
    min-width: 120px;
  `,
  keypad: css`
    height: 72px;
    width: 72px;
    padding: 0;
    font-size: 24px;
    font-weight: ${tokens.typography.fontWeight.medium};
    min-width: auto;
    border-radius: 50%;
  `,
  // KBButton 'full' 크기 추가
  full: css`
    height: 56px;
    padding: 0 ${tokens.spacing[6]};
    font-size: 18px;
    font-weight: ${tokens.typography.fontWeight.bold};
    min-width: 120px;
    border-radius: 12px;
  `,
};
/**
 * KB 네이티브 터치 피드백 믹스인
 */
export const nativeTouchFeedback = css`
  /* 네이티브 터치 최적화 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
  -webkit-user-select: none;
  
  /* Android WebView 성능 최적화 */
  transform: translateZ(0);
  will-change: transform, opacity;
`;
/**
 * Ripple 효과 컴포넌트 (KBButton 통합)
 */
export const RippleEffect = styled.span<{ $x: number; $y: number }>`
  position: absolute;
  top: ${({ $y }) => $y}px;
  left: ${({ $x }) => $x}px;
  width: 0;
  height: 0;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  animation: ${rippleAnimation} 0.6s ease-out;
  pointer-events: none;
`;
/**
 * 스타일드 버튼 컴포넌트
 */
export const StyledButton = styled.button<ButtonProps>`
  /* 기본 스타일 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${tokens.spacing[2]};
  position: relative;
  overflow: hidden;
  font-family: ${tokens.typography.fontFamily.base};
  letter-spacing: ${tokens.typography.letterSpacing.bodyTight};
  line-height: ${tokens.typography.lineHeight.body};
  border-radius: ${tokens.borderRadius.medium};
  cursor: pointer;
  user-select: none;
  transition: all ${tokens.animation.duration.normal} ${tokens.animation.easing.easeInOut};
  /* 크기 스타일 적용 */
  ${({ size = 'medium' }) => buttonSizes[size]}
  /* 변형 스타일 적용 */
  ${({ variant = 'primary' }) => buttonVariants[variant]}
  /* 전체 너비 옵션 */
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
    min-width: auto;
  `}
  /* 눌린 상태 */
  ${({ pressed }) => pressed && css`
    opacity: 0.9;
    transform: scale(0.98);
  `}
  /* 로딩 상태 */
  ${({ loading }) => loading && css`
    pointer-events: none;
    opacity: 0.7;
  `}
  /* 비활성화 상태 */
  &:disabled {
    background-color: ${tokens.colors.background.surfaceDark};
    color: ${tokens.colors.text.disabled};
    border-color: ${tokens.colors.border.disabled};
    cursor: not-allowed;
    opacity: 0.6;
    &:hover {
      transform: none;
    }
  }
  /* 포커스 스타일 */
  &:focus-visible {
    outline: ${tokens.app.focusOutlineWidth} solid ${tokens.colors.brand.primary};
    outline-offset: ${tokens.app.focusOutlineOffset};
  }
  /* 액티브 스타일 */
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  /* 아이콘만 있는 경우 */
  ${({ leftIcon, rightIcon, children }) => {
    if (!children && (leftIcon || rightIcon)) {
      return css`
        min-width: auto;
        padding: ${tokens.spacing[2]};
        aspect-ratio: 1;
      `;
    }
    return '';
  }}
  /* Ripple 효과 */
  ${({ ripple }) => ripple && css`
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
    /* Ripple effect disabled for now */
  `}
`;
/**
 * 로딩 스피너 컴포넌트
 */
export const LoadingSpinner = styled.span`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  flex-shrink: 0;
`;
/**
 * 아이콘 래퍼
 */
export const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  svg {
    width: 1em;
    height: 1em;
  }
`;
/**
 * 버튼 콘텐츠 래퍼
 */
export const ButtonContent = styled.span`
  display: inline-flex;
  align-items: center;
`;
/**
 * 버튼 그룹 스타일
 */
export const ButtonGroup = styled.div<{
  direction?: 'horizontal' | 'vertical';
  gap?: number;
  fullWidth?: boolean;
}>`
  display: flex;
  flex-direction: ${({ direction = 'horizontal' }) => 
    direction === 'horizontal' ? 'row' : 'column'};
  gap: ${({ gap = 8 }) => gap}px;
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
    > * {
      flex: 1;
    }
  `}
`;