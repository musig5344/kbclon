/**
 * TouchableOpacity Component
 * Provides immediate visual feedback with opacity changes
 * Similar to React Native's TouchableOpacity
 */

import React, { useState, useCallback, useRef } from 'react';

import styled from 'styled-components';

import { useTouchOptimized } from '../../hooks/useTouchOptimized';
import { haptic } from '../../utils/touchOptimization';

// Touchable container with opacity animation
const TouchableContainer = styled.div<{
  $activeOpacity: number;
  $disabled?: boolean;
  $isPressed: boolean;
}>`
  position: relative;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: opacity 100ms ease-out;
  opacity: ${props => {
    if (props.$disabled) return 0.6;
    if (props.$isPressed) return props.$activeOpacity;
    return 1;
  }};
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;

  /* Ensure touch target meets minimum size */
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

// Props interface
export interface TouchableOpacityProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  activeOpacity?: number;
  disabled?: boolean;
  delayLongPress?: number;
  pressRetentionOffset?: {
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
  };
  hitSlop?: {
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
  };
  enableHaptic?: boolean;
  hapticStyle?: 'light' | 'medium' | 'heavy';
  style?: React.CSSProperties;
  className?: string;
  testID?: string;
}

// TouchableOpacity component
export const TouchableOpacity: React.FC<TouchableOpacityProps> = ({
  children,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  activeOpacity = 0.7,
  disabled = false,
  delayLongPress = 500,
  pressRetentionOffset,
  hitSlop,
  enableHaptic = true,
  hapticStyle = 'light',
  style,
  className,
  testID,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const pressOutsideBounds = useRef(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Handle press in
  const handlePressIn = useCallback(() => {
    if (disabled) return;

    setIsPressed(true);
    pressOutsideBounds.current = false;

    if (enableHaptic) {
      haptic.trigger(hapticStyle);
    }

    onPressIn?.();
  }, [disabled, enableHaptic, hapticStyle, onPressIn]);

  // Handle press out
  const handlePressOut = useCallback(() => {
    setIsPressed(false);
    onPressOut?.();
  }, [onPressOut]);

  // Use touch optimization hook
  const { bind } = useTouchOptimized(
    {
      onTap: () => {
        if (!disabled && !pressOutsideBounds.current) {
          onPress?.();
        }
      },
      onLongPress: () => {
        if (!disabled && !pressOutsideBounds.current) {
          if (enableHaptic) {
            haptic.trigger('medium');
          }
          onLongPress?.();
        }
      },
      onGestureStart: handlePressIn,
      onGestureEnd: handlePressOut,
      onGestureMove: gesture => {
        // Check if touch moved outside bounds
        if (!elementRef.current || pressOutsideBounds.current) return;

        const rect = elementRef.current.getBoundingClientRect();
        const offset = pressRetentionOffset || { top: 20, left: 20, bottom: 20, right: 20 };

        const isOutside =
          gesture.currentX < rect.left - offset.left! ||
          gesture.currentX > rect.right + offset.right! ||
          gesture.currentY < rect.top - offset.top! ||
          gesture.currentY > rect.bottom + offset.bottom!;

        if (isOutside && !pressOutsideBounds.current) {
          pressOutsideBounds.current = true;
          handlePressOut();
        } else if (!isOutside && pressOutsideBounds.current) {
          pressOutsideBounds.current = false;
          handlePressIn();
        }
      },
    },
    {
      longPressDelay: delayLongPress,
      enableHaptic: false, // We handle haptic manually
    }
  );

  // Apply hit slop
  const hitSlopStyle = hitSlop
    ? {
        padding: `${hitSlop.top || 0}px ${hitSlop.right || 0}px ${hitSlop.bottom || 0}px ${hitSlop.left || 0}px`,
        margin: `-${hitSlop.top || 0}px -${hitSlop.right || 0}px -${hitSlop.bottom || 0}px -${hitSlop.left || 0}px`,
      }
    : {};

  return (
    <TouchableContainer
      ref={elementRef}
      $activeOpacity={activeOpacity}
      $disabled={disabled}
      $isPressed={isPressed}
      style={{ ...hitSlopStyle, ...style }}
      className={className}
      data-testid={testID}
      {...bind}
    >
      {children}
    </TouchableContainer>
  );
};

// Touchable highlight component with color change
const HighlightContainer = styled(TouchableContainer)<{
  $underlayColor: string;
  $isPressed: boolean;
}>`
  background-color: ${props => (props.$isPressed ? props.$underlayColor : 'transparent')};
  transition:
    background-color 100ms ease-out,
    opacity 100ms ease-out;
`;

export interface TouchableHighlightProps extends TouchableOpacityProps {
  underlayColor?: string;
}

export const TouchableHighlight: React.FC<TouchableHighlightProps> = ({
  underlayColor = 'rgba(0, 0, 0, 0.1)',
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      {...props}
      onPressIn={() => {
        setIsPressed(true);
        props.onPressIn?.();
      }}
      onPressOut={() => {
        setIsPressed(false);
        props.onPressOut?.();
      }}
    >
      <HighlightContainer
        $underlayColor={underlayColor}
        $isPressed={isPressed}
        $activeOpacity={1}
        $disabled={props.disabled}
      >
        {props.children}
      </HighlightContainer>
    </TouchableOpacity>
  );
};

// Touchable without feedback (no visual feedback)
export const TouchableWithoutFeedback: React.FC<
  Omit<TouchableOpacityProps, 'activeOpacity'>
> = props => {
  return <TouchableOpacity {...props} activeOpacity={1} />;
};

// Preset touchable components
export const TouchableButton = styled(TouchableOpacity)`
  padding: 12px 24px;
  background-color: ${props => props.theme?.colors?.primary || '#007AFF'};
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  text-align: center;
`;

export const TouchableListItem = styled(TouchableHighlight)`
  width: 100%;
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme?.colors?.border || '#E5E5E5'};
`;

export const TouchableCard = styled(TouchableOpacity)`
  width: 100%;
  padding: 16px;
  background-color: ${props => props.theme?.colors?.card || '#FFFFFF'};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export default TouchableOpacity;
