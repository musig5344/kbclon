import React, { useState, useCallback } from 'react';

import { KBDesignSystem } from '../../../../styles/tokens/kb-design-system';
import { useTouchFeedback, hapticFeedback } from '../../../utils/touchFeedback';

import { StyledButton, LoadingSpinner, IconWrapper, ButtonContent, RippleEffect } from './Button.styles';
import { ButtonProps, TouchFeedbackOptions } from './Button.types';
/**
 * KB StarBanking 통합 Button 컴포넌트
 * 
 * @example
 * ```tsx
 * // 기본 사용
 * <Button>확인</Button>
 * 
 * // 변형 및 크기
 * <Button variant="secondary" size="large">취소</Button>
 * 
 * // 아이콘과 함께
 * <Button leftIcon={<Icon />}>저장</Button>
 * 
 * // 로딩 상태
 * <Button loading>처리중...</Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  pressed = false,
  leftIcon,
  rightIcon,
  icon, // KBButton 호환성
  ripple = true,
  touchFeedback, // KBButton 터치 피드백 옵션
  disableTouchFeedback = false, // KBButton 터치 피드백 비활성화
  disabled,
  className,
  onClick,
  ...props
}, ref) => {
  const isDisabled = disabled || loading;
  const [pressedState, setPressedState] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  // Enhanced touch feedback configuration (KBButton 통합)
  const defaultTouchFeedback: TouchFeedbackOptions = {
    type: variant === 'primary' || variant === 'native-primary' ? 'ripple' 
        : variant === 'secondary' || variant === 'native-secondary' ? 'scale' 
        : 'press',
    intensity: size === 'small' ? 'light' : size === 'large' || size === 'full' ? 'strong' : 'medium',
    haptic: true,
    androidOptimized: true,
    color: variant?.includes('native') || variant === 'ghost'
      ? KBDesignSystem.colors.primary.yellowAlpha20 
      : 'rgba(255, 255, 255, 0.3)'
  };

  const finalTouchFeedback = { ...defaultTouchFeedback, ...touchFeedback };

  // Enhanced touch feedback hook (KBButton 통합)
  const touchFeedbackProps = useTouchFeedback(disableTouchFeedback ? undefined : finalTouchFeedback);

  // Legacy ripple effect for backward compatibility
  const handlePointerDown = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setPressedState(true);
    
    // Only use legacy ripple if new touch feedback is disabled and ripple is enabled
    if (disableTouchFeedback && ripple) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      
      setRipples(prev => [...prev, { x, y, id }]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 600);
    }
  }, [disableTouchFeedback, ripple]);

  // 터치/마우스 업 핸들러
  const handlePointerUp = useCallback(() => {
    setTimeout(() => setPressedState(false), 100);
  }, []);

  // Enhanced click handler with advanced haptic feedback
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!loading && onClick) {
      // Enhanced haptic feedback based on button variant
      if (!disableTouchFeedback) {
        if (variant === 'primary' || variant === 'native-primary') {
          hapticFeedback.touchFeedback('medium');
        } else if (variant === 'secondary' || variant === 'native-secondary') {
          hapticFeedback.touchFeedback('light');
        } else {
          hapticFeedback.touchFeedback('light');
        }
      } else {
        // Fallback to basic vibration for backward compatibility
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
      }
      onClick(e);
    }
  }, [loading, onClick, variant, disableTouchFeedback]);

  return (
    <StyledButton
      ref={ref}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      loading={loading}
      pressed={pressed || pressedState}
      disabled={isDisabled}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      icon={icon}
      ripple={ripple}
      touchFeedback={touchFeedback}
      disableTouchFeedback={disableTouchFeedback}
      className={className}
      aria-busy={loading}
      aria-pressed={pressed || pressedState}
      // Merge enhanced touch feedback handlers with existing ones
      onMouseDown={disableTouchFeedback ? handlePointerDown : (e) => {
        handlePointerDown(e);
        touchFeedbackProps.onMouseDown?.(e);
      }}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={disableTouchFeedback ? (e) => handlePointerDown(e as any) : (e) => {
        handlePointerDown(e as any);
        touchFeedbackProps.onTouchStart?.(e);
      }}
      onTouchEnd={handlePointerUp}
      onClick={handleClick}
      style={{
        ...touchFeedbackProps.style,
        ...(props.style || {})
      }}
      {...props}
    >
      {/* Legacy ripple effects (KBButton 호환성) */}
      {ripples.map(ripple => (
        <RippleEffect key={ripple.id} $x={ripple.x} $y={ripple.y} />
      ))}
      
      {/* 로딩 스피너 */}
      {loading && <LoadingSpinner aria-label="로딩 중" />}
      
      {/* 아이콘들 (KBButton icon prop 호환성) */}
      {!loading && (leftIcon || icon) && <IconWrapper>{leftIcon || icon}</IconWrapper>}
      
      {/* 텍스트 */}
      {children && <ButtonContent>{children}</ButtonContent>}
      
      {!loading && rightIcon && <IconWrapper>{rightIcon}</IconWrapper>}
    </StyledButton>
  );
});
Button.displayName = 'Button';
/**
 * 미리 정의된 버튼 변형들
 */
export const PrimaryButton = React.forwardRef<
  HTMLButtonElement, 
  Omit<ButtonProps, 'variant'>
>((props, ref) => (
  <Button ref={ref} variant="primary" {...props} />
));
PrimaryButton.displayName = 'PrimaryButton';
export const SecondaryButton = React.forwardRef<
  HTMLButtonElement, 
  Omit<ButtonProps, 'variant'>
>((props, ref) => (
  <Button ref={ref} variant="secondary" {...props} />
));
SecondaryButton.displayName = 'SecondaryButton';
export const TextButton = React.forwardRef<
  HTMLButtonElement, 
  Omit<ButtonProps, 'variant'>
>((props, ref) => (
  <Button ref={ref} variant="text" {...props} />
));
TextButton.displayName = 'TextButton';
export const OutlineButton = React.forwardRef<
  HTMLButtonElement, 
  Omit<ButtonProps, 'variant'>
>((props, ref) => (
  <Button ref={ref} variant="outline" {...props} />
));
OutlineButton.displayName = 'OutlineButton';

// KBButton 네이티브 스타일 변형들 추가
export const GhostButton = React.forwardRef<
  HTMLButtonElement, 
  Omit<ButtonProps, 'variant'>
>((props, ref) => (
  <Button ref={ref} variant="ghost" {...props} />
));
GhostButton.displayName = 'GhostButton';

export const NativePrimaryButton = React.forwardRef<
  HTMLButtonElement, 
  Omit<ButtonProps, 'variant'>
>((props, ref) => (
  <Button ref={ref} variant="native-primary" {...props} />
));
NativePrimaryButton.displayName = 'NativePrimaryButton';

export const NativeSecondaryButton = React.forwardRef<
  HTMLButtonElement, 
  Omit<ButtonProps, 'variant'>
>((props, ref) => (
  <Button ref={ref} variant="native-secondary" {...props} />
));
NativeSecondaryButton.displayName = 'NativeSecondaryButton';

export const NativeGhostButton = React.forwardRef<
  HTMLButtonElement, 
  Omit<ButtonProps, 'variant'>
>((props, ref) => (
  <Button ref={ref} variant="native-ghost" {...props} />
));
NativeGhostButton.displayName = 'NativeGhostButton';

// KBButton 호환성을 위한 별칭
export const KBButton = Button;

export default Button;