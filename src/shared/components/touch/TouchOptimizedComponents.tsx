/**
 * Touch-Optimized Mobile Components
 * WCAG 2.1 Level AAA compliant components with 44x44px minimum touch targets
 * Designed for financial applications with security considerations
 */

import React, { useState, useRef, useCallback, useEffect, forwardRef } from 'react';

import styled, { css, keyframes } from 'styled-components';

import { useTouchOptimized } from '../../shared/hooks/useTouchOptimized';
import { hapticFeedback, useFastClick, useScrollLock } from '../../shared/utils/touchOptimization';
import {
  WCAG_TOUCH_CONSTANTS,
  TouchDensity,
  touchTargetUtils,
} from '../../shared/utils/touchTargetOptimizer';
import { tokens } from '../../styles/tokens';

// Common touch styles
const touchOptimizedStyles = css<{
  $size?: 'small' | 'medium' | 'large';
  $density?: TouchDensity;
}>`
  min-width: ${props => {
    const baseSize = WCAG_TOUCH_CONSTANTS.MIN_TARGET_SIZE;
    const multiplier = WCAG_TOUCH_CONSTANTS.DENSITY_ADJUSTMENTS[props.$density || 'comfortable'];
    const sizeMultiplier = {
      small: 1,
      medium: 1.125,
      large: 1.25,
    }[props.$size || 'medium'];
    return Math.ceil(baseSize * multiplier * sizeMultiplier);
  }}px;

  min-height: ${props => {
    const baseSize = WCAG_TOUCH_CONSTANTS.MIN_TARGET_SIZE;
    const multiplier = WCAG_TOUCH_CONSTANTS.DENSITY_ADJUSTMENTS[props.$density || 'comfortable'];
    const sizeMultiplier = {
      small: 1,
      medium: 1.125,
      large: 1.25,
    }[props.$size || 'medium'];
    return Math.ceil(baseSize * multiplier * sizeMultiplier);
  }}px;

  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;

  /* Ensure adequate spacing */
  &:not(:last-child) {
    margin-right: ${WCAG_TOUCH_CONSTANTS.MIN_SPACING}px;
    margin-bottom: ${WCAG_TOUCH_CONSTANTS.MIN_SPACING}px;
  }
`;

// Ripple animation
const rippleAnimation = keyframes`
  0% {
    transform: scale(0);
    opacity: 0.6;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
`;

const RippleOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
`;

const RippleEffect = styled.div<{ $x: number; $y: number; $size: number }>`
  position: absolute;
  left: ${props => props.$x - props.$size / 2}px;
  top: ${props => props.$y - props.$size / 2}px;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  animation: ${rippleAnimation} 600ms ease-out;
  transform-origin: center;
`;

// Touch-Optimized Button
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  density?: TouchDensity;
  haptic?: boolean;
  ripple?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const ButtonBase = styled.button<{
  $variant: TouchButtonProps['variant'];
  $size: TouchButtonProps['size'];
  $density: TouchDensity;
  $fullWidth?: boolean;
  $loading?: boolean;
}>`
  ${touchOptimizedStyles}

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  overflow: hidden;
  transition: all 200ms ease-out;

  ${props =>
    props.$fullWidth &&
    css`
      width: 100%;
    `}

  ${props =>
    props.$loading &&
    css`
      pointer-events: none;
      opacity: 0.7;
    `}
  
  /* Variant styles */
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return css`
          background-color: ${tokens.colors.primary};
          color: white;

          &:hover:not(:disabled) {
            background-color: ${tokens.colors.primaryDark};
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          &:active {
            transform: translateY(0);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }
        `;
      case 'secondary':
        return css`
          background-color: ${tokens.colors.background.secondary};
          color: ${tokens.colors.text.primary};
          border: 1px solid ${tokens.colors.border.secondary};

          &:hover:not(:disabled) {
            background-color: ${tokens.colors.border.primary};
            border-color: ${tokens.colors.text.tertiary};
          }

          &:active {
            background-color: ${tokens.colors.border.secondary};
          }
        `;
      case 'tertiary':
        return css`
          background-color: transparent;
          color: ${tokens.colors.primary};

          &:hover:not(:disabled) {
            background-color: rgba(0, 0, 0, 0.04);
          }

          &:active {
            background-color: rgba(0, 0, 0, 0.08);
          }
        `;
      case 'danger':
        return css`
          background-color: ${tokens.colors.error};
          color: white;

          &:hover:not(:disabled) {
            background-color: ${tokens.colors.errorDark};
          }

          &:active {
            background-color: ${tokens.colors.errorDark};
          }
        `;
      default:
        return css`
          background-color: ${tokens.colors.primary};
          color: white;
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  &:focus-visible {
    outline: 2px solid ${tokens.colors.primary};
    outline-offset: 2px;
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      density = 'comfortable',
      haptic = true,
      ripple = true,
      loading = false,
      fullWidth = false,
      children,
      onClick,
      onTouchStart,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<
      Array<{ id: number; x: number; y: number; size: number }>
    >([]);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const rippleIdRef = useRef(0);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || props.disabled) return;

        if (haptic) {
          hapticFeedback.light();
        }

        onClick?.(e);
      },
      [loading, props.disabled, haptic, onClick]
    );

    const handleTouchStart = useCallback(
      (e: React.TouchEvent<HTMLButtonElement>) => {
        if (loading || props.disabled) return;

        if (ripple && buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          const touch = e.touches[0];
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;
          const size = Math.max(rect.width, rect.height) * 2;

          const newRipple = {
            id: rippleIdRef.current++,
            x,
            y,
            size,
          };

          setRipples(prev => [...prev, newRipple]);

          // Remove ripple after animation
          setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== newRipple.id));
          }, 600);
        }

        onTouchStart?.(e);
      },
      [loading, props.disabled, ripple, onTouchStart]
    );

    // Merge refs
    const mergedRef = useCallback(
      (node: HTMLButtonElement) => {
        buttonRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    return (
      <ButtonBase
        ref={mergedRef}
        $variant={variant}
        $size={size}
        $density={density}
        $fullWidth={fullWidth}
        $loading={loading}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        {...props}
      >
        {ripple && (
          <RippleOverlay>
            {ripples.map(ripple => (
              <RippleEffect key={ripple.id} $x={ripple.x} $y={ripple.y} $size={ripple.size} />
            ))}
          </RippleOverlay>
        )}

        {loading && <LoadingSpinner />}
        {children}
      </ButtonBase>
    );
  }
);

TouchButton.displayName = 'TouchButton';

// Touch-Optimized Input
interface TouchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  size?: 'small' | 'medium' | 'large';
  density?: TouchDensity;
  haptic?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const InputContainer = styled.div<{ $fullWidth?: boolean; $hasError?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
`;

const InputLabel = styled.label`
  font-size: 16px;
  font-weight: 500;
  color: ${tokens.colors.text.primary};
`;

const InputWrapper = styled.div<{
  $size: TouchInputProps['size'];
  $density: TouchDensity;
  $hasError?: boolean;
  $focused?: boolean;
}>`
  ${touchOptimizedStyles}

  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  background-color: ${tokens.colors.background.secondary};
  border: 2px solid
    ${props => (props.$hasError ? tokens.colors.error : tokens.colors.border.primary)};
  border-radius: 8px;
  transition: all 200ms ease-out;

  ${props =>
    props.$focused &&
    css`
      border-color: ${tokens.colors.primary};
      background-color: white;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
    `}

  &:hover {
    border-color: ${props => (props.$hasError ? tokens.colors.error : tokens.colors.primary)};
  }
`;

const StyledInput = styled.input`
  flex: 1;
  min-height: 24px;
  border: none;
  background: transparent;
  font-size: 16px;
  color: ${tokens.colors.text.primary};

  &::placeholder {
    color: ${tokens.colors.text.secondary};
  }

  &:focus {
    outline: none;
  }

  /* Prevent zoom on iOS */
  @media screen and (max-width: 768px) {
    font-size: 16px;
  }
`;

const InputError = styled.div`
  font-size: 14px;
  color: ${tokens.colors.error};
  min-height: 20px;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  color: ${tokens.colors.text.secondary};
`;

export const TouchInput = forwardRef<HTMLInputElement, TouchInputProps>(
  (
    {
      label,
      error,
      size = 'medium',
      density = 'comfortable',
      haptic = true,
      fullWidth = false,
      leftIcon,
      rightIcon,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setFocused(true);
        if (haptic) {
          hapticFeedback.light();
        }
        onFocus?.(e);
      },
      [haptic, onFocus]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    return (
      <InputContainer $fullWidth={fullWidth} $hasError={!!error}>
        {label && <InputLabel>{label}</InputLabel>}

        <InputWrapper $size={size} $density={density} $hasError={!!error} $focused={focused}>
          {leftIcon && <IconWrapper>{leftIcon}</IconWrapper>}

          <StyledInput ref={ref} onFocus={handleFocus} onBlur={handleBlur} {...props} />

          {rightIcon && <IconWrapper>{rightIcon}</IconWrapper>}
        </InputWrapper>

        <InputError>{error || ' '}</InputError>
      </InputContainer>
    );
  }
);

TouchInput.displayName = 'TouchInput';

// Touch-Optimized Checkbox
interface TouchCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  size?: 'small' | 'medium' | 'large';
  density?: TouchDensity;
  haptic?: boolean;
}

const CheckboxWrapper = styled.label<{
  $size: TouchCheckboxProps['size'];
  $density: TouchDensity;
}>`
  ${touchOptimizedStyles}

  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 200ms ease-out;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.08);
  }
`;

const CheckboxInput = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

const CheckboxIndicator = styled.div<{ $checked: boolean; $size: TouchCheckboxProps['size'] }>`
  position: relative;
  width: ${props => {
    const sizes = { small: 20, medium: 24, large: 28 };
    return sizes[props.$size || 'medium'];
  }}px;
  height: ${props => {
    const sizes = { small: 20, medium: 24, large: 28 };
    return sizes[props.$size || 'medium'];
  }}px;
  border: 2px solid
    ${props => (props.$checked ? tokens.colors.primary : tokens.colors.border.secondary)};
  border-radius: 4px;
  background-color: ${props => (props.$checked ? tokens.colors.primary : 'transparent')};
  transition: all 200ms ease-out;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform-origin: center;
    transform: translate(-50%, -60%) rotate(45deg) scale(${props => (props.$checked ? 1 : 0)});
    transition: transform 200ms ease-out;
  }
`;

const CheckboxLabel = styled.span`
  font-size: 16px;
  color: ${tokens.colors.text.primary};
  user-select: none;
`;

export const TouchCheckbox = forwardRef<HTMLInputElement, TouchCheckboxProps>(
  (
    { label, size = 'medium', density = 'comfortable', haptic = true, checked, onChange, ...props },
    ref
  ) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (haptic) {
          hapticFeedback.light();
        }
        onChange?.(e);
      },
      [haptic, onChange]
    );

    return (
      <CheckboxWrapper $size={size} $density={density}>
        <CheckboxInput
          ref={ref}
          type='checkbox'
          checked={checked}
          onChange={handleChange}
          {...props}
        />

        <CheckboxIndicator $checked={!!checked} $size={size} />

        {label && <CheckboxLabel>{label}</CheckboxLabel>}
      </CheckboxWrapper>
    );
  }
);

TouchCheckbox.displayName = 'TouchCheckbox';

// Touch-Optimized Card
interface TouchCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  haptic?: boolean;
  elevation?: 'none' | 'low' | 'medium' | 'high';
  padding?: 'none' | 'small' | 'medium' | 'large';
  className?: string;
}

const CardBase = styled.div<{
  $interactive: boolean;
  $disabled?: boolean;
  $elevation: TouchCardProps['elevation'];
  $padding: TouchCardProps['padding'];
}>`
  ${props => props.$interactive && touchOptimizedStyles}

  position: relative;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  transition: all 200ms ease-out;

  ${props => {
    const paddingMap = {
      none: '0',
      small: '12px',
      medium: '16px',
      large: '24px',
    };
    return css`
      padding: ${paddingMap[props.$padding || 'medium']};
    `;
  }}

  ${props => {
    const elevationMap = {
      none: 'none',
      low: '0 1px 3px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 12px rgba(0, 0, 0, 0.1)',
      high: '0 8px 24px rgba(0, 0, 0, 0.15)',
    };
    return css`
      box-shadow: ${elevationMap[props.$elevation || 'medium']};
    `;
  }}
  
  ${props =>
    props.$interactive &&
    !props.$disabled &&
    css`
      cursor: pointer;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
    `}
  
  ${props =>
    props.$disabled &&
    css`
      opacity: 0.6;
      cursor: not-allowed;
    `}
`;

export const TouchCard: React.FC<TouchCardProps> = ({
  children,
  onPress,
  onLongPress,
  disabled = false,
  haptic = true,
  elevation = 'medium',
  padding = 'medium',
  className,
}) => {
  const { bind } = useTouchOptimized({
    onTap: () => {
      if (!disabled && onPress) {
        if (haptic) hapticFeedback.light();
        onPress();
      }
    },
    onLongPress: () => {
      if (!disabled && onLongPress) {
        if (haptic) hapticFeedback.medium();
        onLongPress();
      }
    },
  });

  const interactive = !!(onPress || onLongPress);

  return (
    <CardBase
      {...(interactive ? bind : {})}
      $interactive={interactive}
      $disabled={disabled}
      $elevation={elevation}
      $padding={padding}
      className={className}
    >
      {children}
    </CardBase>
  );
};

// Touch-Optimized Navigation Tab
interface TouchTabProps {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  haptic?: boolean;
  badge?: string | number;
}

const TabWrapper = styled.div<{ $active?: boolean; $disabled?: boolean }>`
  ${touchOptimizedStyles}

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 200ms ease-out;
  border-radius: 8px;
  position: relative;

  ${props =>
    props.$active &&
    css`
      background-color: rgba(0, 123, 255, 0.1);
    `}

  ${props =>
    !props.$disabled &&
    css`
      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      &:active {
        background-color: rgba(0, 0, 0, 0.08);
        transform: scale(0.98);
      }
    `}
  
  ${props =>
    props.$disabled &&
    css`
      opacity: 0.5;
      cursor: not-allowed;
    `}
`;

const TabIcon = styled.div<{ $active?: boolean }>`
  color: ${props => (props.$active ? tokens.colors.primary : tokens.colors.text.secondary)};
  transition: color 200ms ease-out;
`;

const TabLabel = styled.span<{ $active?: boolean }>`
  font-size: 12px;
  font-weight: ${props => (props.$active ? '600' : '400')};
  color: ${props => (props.$active ? tokens.colors.primary : tokens.colors.text.secondary)};
  transition: all 200ms ease-out;
  text-align: center;
`;

const TabBadge = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  background-color: ${tokens.colors.error};
  color: white;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
`;

export const TouchTab: React.FC<TouchTabProps> = ({
  label,
  icon,
  active = false,
  disabled = false,
  onPress,
  haptic = true,
  badge,
}) => {
  const handlePress = useCallback(() => {
    if (!disabled && onPress) {
      if (haptic) hapticFeedback.light();
      onPress();
    }
  }, [disabled, onPress, haptic]);

  const { bind } = useTouchOptimized({
    onTap: handlePress,
  });

  return (
    <TabWrapper {...bind} $active={active} $disabled={disabled}>
      {badge && <TabBadge>{badge}</TabBadge>}

      {icon && <TabIcon $active={active}>{icon}</TabIcon>}
      <TabLabel $active={active}>{label}</TabLabel>
    </TabWrapper>
  );
};

// Touch-Optimized Form Field Group
interface TouchFormGroupProps {
  children: React.ReactNode;
  density?: TouchDensity;
  spacing?: 'compact' | 'comfortable' | 'spacious';
  className?: string;
}

const FormGroupWrapper = styled.div<{
  $density: TouchDensity;
  $spacing: TouchFormGroupProps['spacing'];
}>`
  display: flex;
  flex-direction: column;
  gap: ${props => {
    const spacingMap = {
      compact: 12,
      comfortable: 16,
      spacious: 24,
    };
    const base = spacingMap[props.$spacing || 'comfortable'];
    const multiplier = WCAG_TOUCH_CONSTANTS.DENSITY_ADJUSTMENTS[props.$density];
    return Math.ceil(base * multiplier);
  }}px;
`;

export const TouchFormGroup: React.FC<TouchFormGroupProps> = ({
  children,
  density = 'comfortable',
  spacing = 'comfortable',
  className,
}) => {
  return (
    <FormGroupWrapper $density={density} $spacing={spacing} className={className}>
      {children}
    </FormGroupWrapper>
  );
};

// Export all components
export { TouchButton, TouchInput, TouchCheckbox, TouchCard, TouchTab, TouchFormGroup };
