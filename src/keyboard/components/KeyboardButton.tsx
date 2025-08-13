/**
 * KB StarBanking 키보드 최적화 버튼 컴포넌트
 * 접근성과 키보드 네비게이션이 강화된 버튼
 */

import React, {
  forwardRef,
  useCallback,
  useRef,
  useImperativeHandle,
  KeyboardEvent,
  MouseEvent,
  FocusEvent,
} from 'react';

import styled from 'styled-components';

import { useKeyboard } from '../contexts/KeyboardProvider';
import { announceToScreenReader } from '../utils/keyboardUtils';

interface KeyboardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  shortcut?: string[];
  announceAction?: boolean;
  enableKeyboardActivation?: boolean;
  rippleEffect?: boolean;
  focusRing?: boolean;
  href?: string; // 링크 버튼용
  target?: string;
  rel?: string;
}

const StyledButton = styled.button<{
  variant: string;
  size: string;
  fullWidth: boolean;
  loading: boolean;
  focusRing: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 2px solid transparent;
  border-radius: 8px;
  font-family: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  white-space: nowrap;

  /* 크기별 스타일 */
  ${props => {
    switch (props.size) {
      case 'small':
        return `
          padding: 8px 16px;
          font-size: 14px;
          min-height: 36px;
        `;
      case 'large':
        return `
          padding: 16px 24px;
          font-size: 18px;
          min-height: 56px;
        `;
      default:
        return `
          padding: 12px 20px;
          font-size: 16px;
          min-height: 44px;
        `;
    }
  }}

  /* 전체 너비 */
  ${props =>
    props.fullWidth &&
    `
    width: 100%;
  `}
  
  /* 변형별 스타일 */
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #007bff;
          color: white;
          border-color: #0056b3;
          
          &:hover:not(:disabled) {
            background: #0056b3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      case 'secondary':
        return `
          background: white;
          color: #007bff;
          border-color: #007bff;
          
          &:hover:not(:disabled) {
            background: #f8f9fa;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: #333;
          border-color: #ddd;
          
          &:hover:not(:disabled) {
            background: #f8f9fa;
            border-color: #007bff;
            color: #007bff;
          }
        `;
      case 'text':
        return `
          background: transparent;
          color: #007bff;
          border-color: transparent;
          
          &:hover:not(:disabled) {
            background: rgba(0, 123, 255, 0.1);
          }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          border-color: #c82333;
          
          &:hover:not(:disabled) {
            background: #c82333;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
          }
        `;
      case 'success':
        return `
          background: #28a745;
          color: white;
          border-color: #1e7e34;
          
          &:hover:not(:disabled) {
            background: #1e7e34;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
          }
        `;
      default:
        return '';
    }
  }}
  
  /* 포커스 스타일 */
  ${props =>
    props.focusRing &&
    `
    &:focus {
      outline: 3px solid #007bff;
      outline-offset: 2px;
    }
    
    &.kb-focus-visible {
      outline: 3px solid #007bff;
      outline-offset: 2px;
    }
  `}
  
  /* 로딩 상태 */
  ${props =>
    props.loading &&
    `
    pointer-events: none;
    opacity: 0.7;
  `}
  
  /* 비활성화 상태 */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  /* 키보드 활성화 애니메이션 */
  &.keyboard-activated {
    animation: keyboardPress 0.15s ease;
  }

  @keyframes keyboardPress {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(0.95);
    }
    100% {
      transform: scale(1);
    }
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const ShortcutHint = styled.span`
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 1000;

  &.visible {
    opacity: 1;
  }
`;

const RippleEffect = styled.span`
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;

  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;

export const KeyboardButton = forwardRef<HTMLButtonElement, KeyboardButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      shortcut,
      announceAction = true,
      enableKeyboardActivation = true,
      rippleEffect = true,
      focusRing = true,
      href,
      target,
      rel,
      onClick,
      onKeyDown,
      onFocus,
      onBlur,
      onMouseDown,
      className,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { settings, focusElement } = useKeyboard();

    useImperativeHandle(ref, () => buttonRef.current!);

    // 리플 효과 생성
    const createRipple = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        if (!rippleEffect || !buttonRef.current) return;

        const button = buttonRef.current;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
    `;

        button.appendChild(ripple);

        setTimeout(() => {
          if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
          }
        }, 600);
      },
      [rippleEffect]
    );

    // 클릭 핸들러
    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        if (loading || props.disabled) return;

        createRipple(event);

        if (announceAction) {
          const actionText = ariaLabel || (typeof children === 'string' ? children : '버튼 클릭됨');
          announceToScreenReader(`${actionText} 실행됨`);
        }

        onClick?.(event);
      },
      [loading, props.disabled, createRipple, announceAction, ariaLabel, children, onClick]
    );

    // 키보드 핸들러
    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLButtonElement>) => {
        if (!enableKeyboardActivation) {
          onKeyDown?.(event);
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();

          if (!loading && !props.disabled) {
            // 키보드 활성화 애니메이션
            if (buttonRef.current) {
              buttonRef.current.classList.add('keyboard-activated');
              setTimeout(() => {
                buttonRef.current?.classList.remove('keyboard-activated');
              }, 150);
            }

            // 클릭 이벤트 시뮬레이션
            const syntheticEvent = {
              ...event,
              type: 'click',
              clientX: 0,
              clientY: 0,
              currentTarget: event.currentTarget,
              target: event.target,
            } as any;

            handleClick(syntheticEvent);
          }
        }

        onKeyDown?.(event);
      },
      [enableKeyboardActivation, loading, props.disabled, handleClick, onKeyDown]
    );

    // 포커스 핸들러
    const handleFocus = useCallback(
      (event: FocusEvent<HTMLButtonElement>) => {
        if (settings.announceChanges) {
          const focusText = ariaLabel || (typeof children === 'string' ? children : '버튼');
          announceToScreenReader(`${focusText} 포커스됨`);
        }

        onFocus?.(event);
      },
      [settings.announceChanges, ariaLabel, children, onFocus]
    );

    // 마우스 다운 핸들러 (리플 효과용)
    const handleMouseDown = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        createRipple(event);
        onMouseDown?.(event);
      },
      [createRipple, onMouseDown]
    );

    // 단축키 표시 텍스트
    const shortcutText = shortcut ? shortcut.join(' + ') : '';

    // 접근성 속성
    const accessibilityProps = {
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      'aria-disabled': loading || props.disabled,
      'aria-busy': loading,
      'aria-keyshortcuts': shortcutText || undefined,
      role: href ? 'link' : 'button',
    };

    // 링크 버튼인 경우
    if (href) {
      return (
        <StyledButton
          as='a'
          ref={buttonRef as any}
          href={href}
          target={target}
          rel={rel}
          variant={variant}
          size={size}
          fullWidth={fullWidth}
          loading={loading}
          focusRing={focusRing}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onMouseDown={handleMouseDown}
          className={className}
          {...accessibilityProps}
          {...(props as any)}
        >
          {loading && <LoadingSpinner />}
          {!loading && leftIcon && <IconWrapper>{leftIcon}</IconWrapper>}
          {children}
          {!loading && rightIcon && <IconWrapper>{rightIcon}</IconWrapper>}

          {shortcut && <ShortcutHint>{shortcutText}</ShortcutHint>}
        </StyledButton>
      );
    }

    return (
      <StyledButton
        ref={buttonRef}
        type='button'
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        loading={loading}
        focusRing={focusRing}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={onBlur}
        onMouseDown={handleMouseDown}
        className={className}
        {...accessibilityProps}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {!loading && leftIcon && <IconWrapper>{leftIcon}</IconWrapper>}
        {children}
        {!loading && rightIcon && <IconWrapper>{rightIcon}</IconWrapper>}

        {shortcut && <ShortcutHint>{shortcutText}</ShortcutHint>}
      </StyledButton>
    );
  }
);

KeyboardButton.displayName = 'KeyboardButton';

// 미리 정의된 변형들
export const KeyboardPrimaryButton = forwardRef<
  HTMLButtonElement,
  Omit<KeyboardButtonProps, 'variant'>
>((props, ref) => <KeyboardButton ref={ref} variant='primary' {...props} />);

export const KeyboardSecondaryButton = forwardRef<
  HTMLButtonElement,
  Omit<KeyboardButtonProps, 'variant'>
>((props, ref) => <KeyboardButton ref={ref} variant='secondary' {...props} />);

export const KeyboardDangerButton = forwardRef<
  HTMLButtonElement,
  Omit<KeyboardButtonProps, 'variant'>
>((props, ref) => <KeyboardButton ref={ref} variant='danger' {...props} />);

export const KeyboardTextButton = forwardRef<
  HTMLButtonElement,
  Omit<KeyboardButtonProps, 'variant'>
>((props, ref) => <KeyboardButton ref={ref} variant='text' {...props} />);

export default KeyboardButton;
