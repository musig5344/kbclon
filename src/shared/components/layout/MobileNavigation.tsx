/**
 * Mobile Navigation Components
 * Thumb-friendly navigation optimized for one-handed operation
 * WCAG 2.1 Level AAA compliant with proper touch target sizes
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';

import styled, { css } from 'styled-components';

import { useTouchOptimized } from '../../shared/hooks/useTouchOptimized';
import { hapticFeedback } from '../../shared/utils/touchOptimization';
import { 
  WCAG_TOUCH_CONSTANTS,
  TouchDensity,
} from '../../shared/utils/touchTargetOptimizer';
import { tokens } from '../../styles/tokens';

import { TouchTab } from './TouchOptimizedComponents';

// Thumb reach zones for different hand sizes
const THUMB_ZONES = {
  comfortable: {
    maxReach: 75, // mm - comfortable reach without stretching
    easyReach: 60, // mm - easy reach area
    oneHandedWidth: 320, // px - maximum width for one-handed use
  },
  extended: {
    maxReach: 90, // mm - maximum reach with stretching
    easyReach: 75, // mm - comfortable reach for larger hands
    oneHandedWidth: 375, // px - maximum width for larger screens
  },
} as const;

// Convert mm to px (assuming 160 DPI)
const mmToPx = (mm: number) => Math.round(mm * 6.3);

// Bottom Navigation Bar
interface BottomNavigationProps {
  items: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    disabled?: boolean;
  }>;
  activeId?: string;
  onItemPress?: (id: string) => void;
  density?: TouchDensity;
  haptic?: boolean;
  safeAreaInset?: number;
}

const BottomNavContainer = styled.nav<{
  $density: TouchDensity;
  $safeAreaInset: number;
}>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1px solid ${tokens.colors.gray200};
  padding-bottom: ${props => props.$safeAreaInset}px;
  z-index: 1000;
  
  /* Ensure within thumb reach */
  max-width: ${THUMB_ZONES.extended.oneHandedWidth}px;
  margin: 0 auto;
  
  /* Safe area for iOS */
  padding-bottom: max(${props => props.$safeAreaInset}px, env(safe-area-inset-bottom));
  
  /* Backdrop blur for modern look */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background-color: rgba(255, 255, 255, 0.95);
`;

const BottomNavContent = styled.div<{ $density: TouchDensity }>`
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 16px;
  min-height: ${props => {
    const baseHeight = WCAG_TOUCH_CONSTANTS.MIN_TARGET_SIZE;
    const multiplier = WCAG_TOUCH_CONSTANTS.DENSITY_ADJUSTMENTS[props.$density];
    return Math.ceil(baseHeight * multiplier);
  }}px;
`;

const BottomNavItem = styled.div<{
  $active?: boolean;
  $density: TouchDensity;
}>`
  flex: 1;
  max-width: ${mmToPx(THUMB_ZONES.comfortable.easyReach)}px;
`;

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items,
  activeId,
  onItemPress,
  density = 'comfortable',
  haptic = true,
  safeAreaInset = 20,
}) => {
  const handleItemPress = useCallback((id: string) => {
    const item = items.find(item => item.id === id);
    if (item?.disabled) return;
    
    onItemPress?.(id);
  }, [items, onItemPress]);

  return (
    <BottomNavContainer $density={density} $safeAreaInset={safeAreaInset}>
      <BottomNavContent $density={density}>
        {items.map(item => (
          <BottomNavItem key={item.id} $density={density}>
            <TouchTab
              label={item.label}
              icon={item.icon}
              active={activeId === item.id}
              disabled={item.disabled}
              onPress={() => handleItemPress(item.id)}
              haptic={haptic}
              badge={item.badge}
            />
          </BottomNavItem>
        ))}
      </BottomNavContent>
    </BottomNavContainer>
  );
};

// Floating Action Button (FAB)
interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onPress?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'center-bottom';
  size?: 'normal' | 'large';
  disabled?: boolean;
  haptic?: boolean;
  safeAreaInset?: number;
}

const FABContainer = styled.button<{
  $position: FloatingActionButtonProps['position'];
  $size: FloatingActionButtonProps['size'];
  $safeAreaInset: number;
}>`
  position: fixed;
  z-index: 1001;
  border: none;
  border-radius: 50%;
  background-color: ${tokens.colors.primary};
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: all 200ms ease-out;
  
  /* Size based on touch target requirements */
  width: ${props => props.$size === 'large' ? '64px' : WCAG_TOUCH_CONSTANTS.RECOMMENDED_TARGET_SIZE + 'px'};
  height: ${props => props.$size === 'large' ? '64px' : WCAG_TOUCH_CONSTANTS.RECOMMENDED_TARGET_SIZE + 'px'};
  
  /* Position within thumb reach */
  ${props => {
    const offset = 16;
    const safeOffset = props.$safeAreaInset + offset;
    
    switch (props.$position) {
      case 'bottom-right':
        return css`
          bottom: ${safeOffset}px;
          right: ${offset}px;
        `;
      case 'bottom-left':
        return css`
          bottom: ${safeOffset}px;
          left: ${offset}px;
        `;
      case 'center-bottom':
      default:
        return css`
          bottom: ${safeOffset}px;
          left: 50%;
          transform: translateX(-50%);
        `;
    }
  }}
  
  &:hover:not(:disabled) {
    transform: ${props => props.$position === 'center-bottom' ? 'translateX(-50%) translateY(-2px)' : 'translateY(-2px)'};
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    background-color: ${tokens.colors.primaryDark};
  }
  
  &:active {
    transform: ${props => props.$position === 'center-bottom' ? 'translateX(-50%) scale(0.96)' : 'scale(0.96)'};
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: ${props => props.$position === 'center-bottom' ? 'translateX(-50%)' : 'none'} !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  }
  
  &:focus-visible {
    outline: 2px solid ${tokens.colors.primary};
    outline-offset: 4px;
  }
`;

const FABIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  position = 'center-bottom',
  size = 'normal',
  disabled = false,
  haptic = true,
  safeAreaInset = 20,
}) => {
  const { bind } = useTouchOptimized({
    onTap: () => {
      if (!disabled && onPress) {
        if (haptic) hapticFeedback.medium();
        onPress();
      }
    },
  });

  return (
    <FABContainer
      {...bind}
      $position={position}
      $size={size}
      $safeAreaInset={safeAreaInset}
      disabled={disabled}
    >
      <FABIcon>{icon}</FABIcon>
    </FABContainer>
  );
};

// Thumb-friendly Header
interface ThumbHeaderProps {
  title?: string;
  leftAction?: {
    icon: React.ReactNode;
    onPress: () => void;
    label?: string;
  };
  rightActions?: Array<{
    id: string;
    icon: React.ReactNode;
    onPress: () => void;
    label?: string;
    disabled?: boolean;
  }>;
  density?: TouchDensity;
  haptic?: boolean;
  safeAreaInset?: number;
}

const HeaderContainer = styled.header<{
  $density: TouchDensity;
  $safeAreaInset: number;
}>`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-bottom: 1px solid ${tokens.colors.gray200};
  z-index: 999;
  
  /* Safe area for iOS */
  padding-top: max(${props => props.$safeAreaInset}px, env(safe-area-inset-top));
  
  /* Backdrop blur */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background-color: rgba(255, 255, 255, 0.95);
`;

const HeaderContent = styled.div<{ $density: TouchDensity }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  min-height: ${props => {
    const baseHeight = WCAG_TOUCH_CONSTANTS.MIN_TARGET_SIZE;
    const multiplier = WCAG_TOUCH_CONSTANTS.DENSITY_ADJUSTMENTS[props.$density];
    return Math.ceil(baseHeight * multiplier);
  }}px;
`;

const HeaderTitle = styled.h1`
  flex: 1;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${tokens.colors.text.primary};
  text-align: center;
  padding: 0 16px;
  
  /* Prevent text from interfering with touch targets */
  pointer-events: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const HeaderAction = styled.button<{ $density: TouchDensity }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: ${props => {
    const baseSize = WCAG_TOUCH_CONSTANTS.MIN_TARGET_SIZE;
    const multiplier = WCAG_TOUCH_CONSTANTS.DENSITY_ADJUSTMENTS[props.$density];
    return Math.ceil(baseSize * multiplier);
  }}px;
  min-height: ${props => {
    const baseSize = WCAG_TOUCH_CONSTANTS.MIN_TARGET_SIZE;
    const multiplier = WCAG_TOUCH_CONSTANTS.DENSITY_ADJUSTMENTS[props.$density];
    return Math.ceil(baseSize * multiplier);
  }}px;
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: ${tokens.colors.text.primary};
  cursor: pointer;
  transition: all 200ms ease-out;
  
  &:hover:not(:disabled) {
    background-color: rgba(0, 0, 0, 0.04);
  }
  
  &:active {
    background-color: rgba(0, 0, 0, 0.08);
    transform: scale(0.96);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:focus-visible {
    outline: 2px solid ${tokens.colors.primary};
    outline-offset: 2px;
  }
`;

const HeaderActionsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const ThumbHeader: React.FC<ThumbHeaderProps> = ({
  title,
  leftAction,
  rightActions = [],
  density = 'comfortable',
  haptic = true,
  safeAreaInset = 20,
}) => {
  const handleActionPress = useCallback((action: () => void) => {
    if (haptic) hapticFeedback.light();
    action();
  }, [haptic]);

  return (
    <HeaderContainer $density={density} $safeAreaInset={safeAreaInset}>
      <HeaderContent $density={density}>
        {/* Left action - positioned for easy thumb access */}
        <div style={{ width: WCAG_TOUCH_CONSTANTS.MIN_TARGET_SIZE }}>
          {leftAction && (
            <HeaderAction
              $density={density}
              onClick={() => handleActionPress(leftAction.onPress)}
              aria-label={leftAction.label}
            >
              {leftAction.icon}
            </HeaderAction>
          )}
        </div>
        
        {/* Title */}
        {title && <HeaderTitle>{title}</HeaderTitle>}
        
        {/* Right actions - positioned for easy thumb access */}
        <HeaderActionsGroup>
          {rightActions.map(action => (
            <HeaderAction
              key={action.id}
              $density={density}
              onClick={() => handleActionPress(action.onPress)}
              disabled={action.disabled}
              aria-label={action.label}
            >
              {action.icon}
            </HeaderAction>
          ))}
        </HeaderActionsGroup>
      </HeaderContent>
    </HeaderContainer>
  );
};

// Swipe Navigation (for account cards, etc.)
interface SwipeNavigationProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onItemChange?: (item: T, index: number) => void;
  initialIndex?: number;
  haptic?: boolean;
  showIndicators?: boolean;
  itemWidth?: number;
}

const SwipeContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  touch-action: pan-y;
`;

const SwipeTrack = styled.div<{ $translateX: number; $itemWidth: number }>`
  display: flex;
  transform: translateX(${props => props.$translateX}px);
  transition: transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
`;

const SwipeItem = styled.div<{ $width: number }>`
  width: ${props => props.$width}px;
  flex-shrink: 0;
  padding: 0 8px;
`;

const SwipeIndicators = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding: 8px;
`;

const SwipeIndicator = styled.button<{ $active: boolean }>`
  width: ${WCAG_TOUCH_CONSTANTS.MIN_TARGET_SIZE}px;
  height: 8px;
  background-color: ${props => props.$active ? tokens.colors.primary : tokens.colors.gray200};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 200ms ease-out;
  
  &:hover {
    background-color: ${props => props.$active ? tokens.colors.primaryDark : tokens.colors.gray300};
  }
`;

export function SwipeNavigation<T>({
  items,
  renderItem,
  onItemChange,
  initialIndex = 0,
  haptic = true,
  showIndicators = true,
  itemWidth = 300,
}: SwipeNavigationProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [translateX, setTranslateX] = useState(-initialIndex * itemWidth);
  const containerRef = useRef<HTMLDivElement>(null);

  const { bind } = useTouchOptimized({
    onSwipeLeft: () => {
      const nextIndex = Math.min(currentIndex + 1, items.length - 1);
      if (nextIndex !== currentIndex) {
        setCurrentIndex(nextIndex);
        setTranslateX(-nextIndex * itemWidth);
        if (haptic) hapticFeedback.light();
        onItemChange?.(items[nextIndex], nextIndex);
      }
    },
    onSwipeRight: () => {
      const prevIndex = Math.max(currentIndex - 1, 0);
      if (prevIndex !== currentIndex) {
        setCurrentIndex(prevIndex);
        setTranslateX(-prevIndex * itemWidth);
        if (haptic) hapticFeedback.light();
        onItemChange?.(items[prevIndex], prevIndex);
      }
    },
  });

  const handleIndicatorPress = useCallback((index: number) => {
    setCurrentIndex(index);
    setTranslateX(-index * itemWidth);
    if (haptic) hapticFeedback.light();
    onItemChange?.(items[index], index);
  }, [items, itemWidth, haptic, onItemChange]);

  return (
    <>
      <SwipeContainer ref={containerRef} {...bind}>
        <SwipeTrack $translateX={translateX} $itemWidth={itemWidth}>
          {items.map((item, index) => (
            <SwipeItem key={index} $width={itemWidth}>
              {renderItem(item, index)}
            </SwipeItem>
          ))}
        </SwipeTrack>
      </SwipeContainer>
      
      {showIndicators && items.length > 1 && (
        <SwipeIndicators>
          {items.map((_, index) => (
            <SwipeIndicator
              key={index}
              $active={index === currentIndex}
              onClick={() => handleIndicatorPress(index)}
              aria-label={`Go to item ${index + 1}`}
            />
          ))}
        </SwipeIndicators>
      )}
    </>
  );
}

// Export all navigation components
export {
  BottomNavigation,
  FloatingActionButton,
  ThumbHeader,
  SwipeNavigation,
};