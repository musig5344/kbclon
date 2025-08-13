/**
 * Pull to Refresh Component
 * Custom pull-to-refresh with KB StarBanking animations
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';

import styled, { keyframes, css } from 'styled-components';

import { useTouchOptimized } from '../../shared/hooks/useTouchOptimized';
import { haptic, PlatformTouchBehavior } from '../../shared/utils/touchOptimization';
import { tokens } from '../../styles/tokens';

// Rotation animation for loading
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Pulse animation for pull indicator
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
`;

// Container for pull to refresh
const RefreshContainer = styled.div<{ $isDragging: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: ${props => props.$isDragging ? 'none' : 'pan-y'};
  -webkit-overflow-scrolling: touch;
`;

// Scrollable content
const ScrollableContent = styled.div<{ 
  $pullDistance: number;
  $isRefreshing: boolean;
}>`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  transform: translateY(${props => {
    if (props.$isRefreshing) return '80px';
    return `${props.$pullDistance}px`;
  }});
  transition: ${props => {
    if (props.$isRefreshing) return 'transform 300ms ease-out';
    if (props.$pullDistance === 0) return 'transform 300ms ease-out';
    return 'none';
  }};
`;

// Pull indicator container
const PullIndicatorContainer = styled.div<{ 
  $pullDistance: number;
  $isRefreshing: boolean;
  $threshold: number;
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(${props => {
    if (props.$isRefreshing) return '0';
    return `${props.$pullDistance - 80}px`;
  }});
  opacity: ${props => {
    if (props.$isRefreshing) return 1;
    return Math.min(1, props.$pullDistance / props.$threshold);
  }};
  transition: ${props => {
    if (props.$isRefreshing) return 'all 300ms ease-out';
    if (props.$pullDistance === 0) return 'all 300ms ease-out';
    return 'opacity 150ms ease-out';
  }};
`;

// Loading spinner
const LoadingSpinner = styled.div<{ $size: number }>`
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border: 3px solid ${tokens.colors.border.light};
  border-top-color: ${tokens.colors.brand.primary};
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
`;

// Pull arrow
const PullArrow = styled.div<{ 
  $rotation: number;
  $isReady: boolean;
}>`
  width: 24px;
  height: 24px;
  transform: rotate(${props => props.$rotation}deg);
  transition: transform 200ms ease-out;
  color: ${props => props.$isReady ? tokens.colors.brand.primary : tokens.colors.text.tertiary};
  
  ${props => props.$isReady && css`
    animation: ${pulse} 1s ease-in-out infinite;
  `}
  
  &::before {
    content: '↓';
    font-size: 24px;
    font-weight: bold;
  }
`;

// Success checkmark
const SuccessCheck = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${tokens.colors.success};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  animation: ${pulse} 0.5s ease-out;
  
  &::before {
    content: '✓';
  }
`;

// Status text
const StatusText = styled.div`
  font-size: 14px;
  color: ${tokens.colors.text.secondary};
  margin-top: 8px;
  text-align: center;
`;

// Props interface
export interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  disabled?: boolean;
  loadingText?: string;
  pullingText?: string;
  releaseText?: string;
  successText?: string;
  showSuccess?: boolean;
  successDuration?: number;
  customIndicator?: React.ReactNode;
  enableHaptic?: boolean;
}

// Pull to refresh component
export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  disabled = false,
  loadingText = '새로고침 중...',
  pullingText = '당겨서 새로고침',
  releaseText = '손을 떼면 새로고침',
  successText = '업데이트 완료',
  showSuccess = true,
  successDuration = 1500,
  customIndicator,
  enableHaptic = true,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);
  const [canPull, setCanPull] = useState(true);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);
  const hasTriggeredHaptic = useRef(false);
  
  // Check if at top of scroll
  const isAtTop = useCallback(() => {
    if (!scrollContainerRef.current) return true;
    return scrollContainerRef.current.scrollTop <= 0;
  }, []);
  
  // Calculate pull resistance
  const calculatePullDistance = useCallback((deltaY: number): number => {
    // Apply resistance formula for iOS-like feel
    const resistance = 2.5;
    return deltaY / resistance;
  }, []);
  
  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (isRefreshing || disabled) return;
    
    setIsRefreshing(true);
    if (enableHaptic) {
      haptic.trigger('medium');
    }
    
    try {
      await onRefresh();
      
      if (showSuccess) {
        setShowSuccessState(true);
        if (enableHaptic) {
          haptic.success();
        }
        
        setTimeout(() => {
          setShowSuccessState(false);
          setIsRefreshing(false);
          setPullDistance(0);
        }, successDuration);
      } else {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } catch (error) {
      console.error('Refresh failed:', error);
      setIsRefreshing(false);
      setPullDistance(0);
      if (enableHaptic) {
        haptic.error();
      }
    }
  }, [isRefreshing, disabled, onRefresh, showSuccess, successDuration, enableHaptic]);
  
  // Use touch optimization hook
  const { bind } = useTouchOptimized({
    onGestureStart: (gesture) => {
      if (!canPull || disabled || isRefreshing || !isAtTop()) return;
      
      startY.current = gesture.startY;
      currentY.current = gesture.currentY;
      isDragging.current = true;
      hasTriggeredHaptic.current = false;
    },
    onGestureMove: (gesture) => {
      if (!isDragging.current || !canPull || disabled || isRefreshing) return;
      
      // Only pull down
      const deltaY = gesture.currentY - startY.current;
      if (deltaY < 0) {
        setPullDistance(0);
        return;
      }
      
      // Check if still at top
      if (!isAtTop()) {
        isDragging.current = false;
        setPullDistance(0);
        return;
      }
      
      currentY.current = gesture.currentY;
      const distance = calculatePullDistance(deltaY);
      const clampedDistance = Math.min(distance, threshold * 2);
      
      setPullDistance(clampedDistance);
      
      // Haptic feedback when threshold reached
      if (clampedDistance >= threshold && !hasTriggeredHaptic.current && enableHaptic) {
        haptic.trigger('light');
        hasTriggeredHaptic.current = true;
      } else if (clampedDistance < threshold && hasTriggeredHaptic.current) {
        hasTriggeredHaptic.current = false;
      }
    },
    onGestureEnd: () => {
      if (!isDragging.current) return;
      
      isDragging.current = false;
      
      if (pullDistance >= threshold) {
        handleRefresh();
      } else {
        setPullDistance(0);
      }
    },
  }, {
    preventDefaultEvents: false, // Allow normal scrolling
    stopPropagation: false,
  });
  
  // Handle scroll to disable pull when not at top
  const handleScroll = useCallback(() => {
    setCanPull(isAtTop());
  }, [isAtTop]);
  
  // Reset on unmount
  useEffect(() => {
    return () => {
      isDragging.current = false;
      setPullDistance(0);
    };
  }, []);
  
  // Calculate arrow rotation
  const arrowRotation = Math.min(180, (pullDistance / threshold) * 180);
  const isReady = pullDistance >= threshold;
  
  // Determine status text
  const getStatusText = () => {
    if (showSuccessState) return successText;
    if (isRefreshing) return loadingText;
    if (isReady) return releaseText;
    if (pullDistance > 0) return pullingText;
    return '';
  };
  
  return (
    <RefreshContainer {...bind} $isDragging={isDragging.current}>
      {/* Pull indicator */}
      <PullIndicatorContainer
        $pullDistance={pullDistance}
        $isRefreshing={isRefreshing}
        $threshold={threshold}
      >
        {customIndicator || (
          <div style={{ textAlign: 'center' }}>
            {showSuccessState ? (
              <SuccessCheck />
            ) : isRefreshing ? (
              <LoadingSpinner $size={32} />
            ) : (
              <PullArrow 
                $rotation={arrowRotation} 
                $isReady={isReady}
              />
            )}
            <StatusText>{getStatusText()}</StatusText>
          </div>
        )}
      </PullIndicatorContainer>
      
      {/* Scrollable content */}
      <ScrollableContent
        ref={scrollContainerRef}
        $pullDistance={pullDistance}
        $isRefreshing={isRefreshing}
        onScroll={handleScroll}
      >
        {children}
      </ScrollableContent>
    </RefreshContainer>
  );
};

// Custom KB StarBanking pull indicator
const KBIndicatorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const KBLogo = styled.div<{ $scale: number }>`
  width: 40px;
  height: 40px;
  background: url('/assets/images/kb_logo.png') center/contain no-repeat;
  transform: scale(${props => props.$scale});
  transition: transform 200ms ease-out;
`;

const KBLoadingDots = styled.div`
  display: flex;
  gap: 4px;
  
  span {
    width: 8px;
    height: 8px;
    background-color: ${tokens.colors.brand.primary};
    border-radius: 50%;
    animation: ${pulse} 1.4s ease-in-out infinite;
    
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
`;

export const KBPullIndicator: React.FC<{
  pullDistance: number;
  threshold: number;
  isRefreshing: boolean;
  showSuccess: boolean;
}> = ({ pullDistance, threshold, isRefreshing, showSuccess }) => {
  const scale = Math.min(1.2, 0.8 + (pullDistance / threshold) * 0.4);
  
  return (
    <KBIndicatorContainer>
      {showSuccess ? (
        <SuccessCheck />
      ) : isRefreshing ? (
        <>
          <KBLogo $scale={1} />
          <KBLoadingDots>
            <span />
            <span />
            <span />
          </KBLoadingDots>
        </>
      ) : (
        <KBLogo $scale={scale} />
      )}
    </KBIndicatorContainer>
  );
};

// Example usage component
export const PullToRefreshExample: React.FC = () => {
  const [items, setItems] = useState(
    Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`)
  );
  
  const handleRefresh = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add new items
    setItems(prev => [
      `New Item ${Date.now()}`,
      ...prev,
    ]);
  };
  
  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div style={{ padding: 16 }}>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              padding: 16,
              marginBottom: 8,
              backgroundColor: tokens.colors.background.secondary,
              borderRadius: 8,
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </PullToRefresh>
  );
};

export default PullToRefresh;