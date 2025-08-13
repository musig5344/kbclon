import React, { useState, useRef, useCallback, ReactNode } from 'react';

import styled, { css } from 'styled-components';

import { 
  useFastClick, 
  normalizeTouch, 
  calculateDistance, 
  TOUCH_CONSTANTS,
  hapticFeedback,
  preventGhostClick,
  validateTouchTarget,
} from '../../utils/touchOptimization';

import { RippleEffect } from './RippleEffect';

interface TouchableProps {
  onPress?: () => void;
  onLongPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  children: ReactNode;
  disabled?: boolean;
  activeOpacity?: number;
  pressRetentionOffset?: number;
  delayLongPress?: number;
  ripple?: boolean;
  rippleColor?: string;
  haptic?: boolean;
  style?: React.CSSProperties;
  className?: string;
  testID?: string;
}

interface StyledTouchableProps {
  $isPressed: boolean;
  $activeOpacity: number;
  $disabled: boolean;
}

const StyledTouchable = styled.div<StyledTouchableProps>`
  position: relative;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  transition: opacity 150ms ease-out, transform 100ms ease-out;
  
  ${props => props.$isPressed && !props.$disabled && css`
    opacity: ${props.$activeOpacity};
    transform: scale(0.98);
  `}
  
  ${props => props.$disabled && css`
    opacity: 0.5;
  `}
  
  /* Ensure minimum touch target size */
  min-width: ${TOUCH_CONSTANTS.MIN_TOUCH_TARGET}px;
  min-height: ${TOUCH_CONSTANTS.MIN_TOUCH_TARGET}px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export const Touchable: React.FC<TouchableProps> = ({
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  children,
  disabled = false,
  activeOpacity = 0.7,
  pressRetentionOffset = 20,
  delayLongPress = TOUCH_CONSTANTS.LONG_PRESS_DELAY,
  ripple = true,
  rippleColor,
  haptic = true,
  style,
  className,
  testID,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const isPressValidRef = useRef(true);

  // Validate touch target size on mount
  React.useEffect(() => {
    if (elementRef.current) {
      const isValid = validateTouchTarget(elementRef.current);
      if (!isValid && process.env.NODE_ENV === 'development') {
        console.warn('Touch target size is below recommended 44x44px', elementRef.current);
      }
      
      // Prevent ghost clicks
      preventGhostClick(elementRef.current);
    }
  }, []);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    
    setIsPressed(true);
    isPressValidRef.current = true;
    
    if (onPressIn) {
      onPressIn();
    }
    
    if (haptic) {
      hapticFeedback.light();
    }
    
    // Start long press timer
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        if (isPressValidRef.current && isPressed) {
          if (haptic) {
            hapticFeedback.medium();
          }
          onLongPress();
          isPressValidRef.current = false;
        }
      }, delayLongPress);
    }
  }, [disabled, onPressIn, onLongPress, delayLongPress, haptic, isPressed]);

  const handlePressOut = useCallback(() => {
    setIsPressed(false);
    clearLongPressTimer();
    
    if (onPressOut) {
      onPressOut();
    }
  }, [clearLongPressTimer, onPressOut]);

  const handlePress = useCallback(() => {
    if (disabled || !isPressValidRef.current) return;
    
    handlePressOut();
    
    if (onPress) {
      onPress();
    }
  }, [disabled, handlePressOut, onPress]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = normalizeTouch(e.nativeEvent);
    touchStartRef.current = { x: touch.x, y: touch.y };
    handlePressIn();
  }, [handlePressIn]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = normalizeTouch(e.nativeEvent);
    const distance = calculateDistance(
      { ...touchStartRef.current, timestamp: 0, identifier: 0 },
      touch
    );
    
    // Check if touch moved outside retention area
    if (distance > pressRetentionOffset) {
      isPressValidRef.current = false;
      handlePressOut();
    }
  }, [pressRetentionOffset, handlePressOut]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || !isPressValidRef.current) {
      handlePressOut();
      return;
    }
    
    const touch = normalizeTouch(e.nativeEvent);
    const distance = calculateDistance(
      { ...touchStartRef.current, timestamp: 0, identifier: 0 },
      touch
    );
    
    if (distance <= TOUCH_CONSTANTS.TOUCH_SLOP) {
      handlePress();
    } else {
      handlePressOut();
    }
    
    touchStartRef.current = null;
  }, [handlePress, handlePressOut]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only handle mouse events on non-touch devices
    if ('ontouchstart' in window) return;
    
    touchStartRef.current = { x: e.clientX, y: e.clientY };
    handlePressIn();
  }, [handlePressIn]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // Only handle mouse events on non-touch devices
    if ('ontouchstart' in window) return;
    
    handlePress();
  }, [handlePress]);

  const handleMouseLeave = useCallback(() => {
    // Only handle mouse events on non-touch devices
    if ('ontouchstart' in window) return;
    
    handlePressOut();
  }, [handlePressOut]);

  const content = (
    <StyledTouchable
      ref={elementRef}
      $isPressed={isPressed}
      $activeOpacity={activeOpacity}
      $disabled={disabled}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handlePressOut}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={className}
      data-testid={testID}
    >
      {children}
    </StyledTouchable>
  );

  if (ripple && !disabled) {
    return (
      <RippleEffect
        color={rippleColor}
        enableHaptic={false} // We handle haptic separately
      >
        {content}
      </RippleEffect>
    );
  }

  return content;
};

// Specialized touchable components
export const TouchableOpacity = styled(Touchable)``;

export const TouchableHighlight = styled(Touchable)`
  &:active {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

export const TouchableWithoutFeedback: React.FC<Omit<TouchableProps, 'activeOpacity' | 'ripple'>> = (props) => {
  return <Touchable {...props} activeOpacity={1} ripple={false} />;
};