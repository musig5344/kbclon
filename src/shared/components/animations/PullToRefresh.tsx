/**
 * KB 스타뱅킹 당겨서 새로고침 컴포넌트
 * 부드러운 당기기 효과와 KB 로고 회전 애니메이션
 */

import React, { useState, useRef, useCallback, ReactNode } from 'react';

import styled, { keyframes, css } from 'styled-components';

import kbLogo from '../../../assets/images/kb_logo.png';

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { 
    opacity: 0;
    transform: scale(0.8);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
`;

const Container = styled.div`
  position: relative;
  overflow: hidden;
  height: 100%;
  -webkit-overflow-scrolling: touch;
`;

const ScrollContainer = styled.div<{ $isPulling: boolean; $pullDistance: number }>`
  height: 100%;
  overflow-y: auto;
  transform: translateY(${props => props.$pullDistance}px);
  transition: transform ${props => props.$isPulling ? '0s' : '0.3s cubic-bezier(0.4, 0, 0.2, 1)'};
`;

const RefreshIndicator = styled.div<{ $isVisible: boolean; $isRefreshing: boolean }>`
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: opacity 0.3s ease-out;
  animation: ${props => props.$isVisible ? fadeIn : 'none'} 0.3s ease-out;
`;

const LogoIcon = styled.img<{ $isRefreshing: boolean; $rotation: number }>`
  width: 32px;
  height: 32px;
  transform: rotate(${props => props.$rotation}deg);
  animation: ${props => props.$isRefreshing ? css`${rotate} 1s linear infinite` : 'none'};
  filter: ${props => props.$isRefreshing ? 'none' : 'grayscale(100%)'};
  opacity: ${props => props.$isRefreshing ? 1 : 0.6};
  transition: all 0.3s ease-out;
`;

const RefreshText = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #696e76;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: opacity 0.3s ease-out;
  white-space: nowrap;
`;

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
  children: ReactNode;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  threshold = 80,
  maxPull = 120,
  children,
  disabled = false
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const scrollTop = scrollContainerRef.current?.scrollTop || 0;
    if (scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [disabled, isRefreshing]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    
    if (diff > 0) {
      // 탄성 효과 적용
      const elasticPull = diff > threshold 
        ? threshold + (diff - threshold) * 0.3 
        : diff;
      
      setPullDistance(Math.min(elasticPull, maxPull));
    }
  }, [isPulling, threshold, maxPull, disabled, isRefreshing]);
  
  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled || isRefreshing) return;
    
    setIsPulling(false);
    
    if (pullDistance > threshold) {
      setIsRefreshing(true);
      setPullDistance(60); // 새로고침 중 위치
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [isPulling, pullDistance, threshold, onRefresh, disabled, isRefreshing]);
  
  const getRefreshText = () => {
    if (isRefreshing) return '새로고침 중...';
    if (pullDistance > threshold) return '놓으면 새로고침';
    if (pullDistance > 20) return '당겨서 새로고침';
    return '';
  };
  
  const rotation = (pullDistance / threshold) * 180;
  
  return (
    <Container
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <RefreshIndicator 
        $isVisible={pullDistance > 20} 
        $isRefreshing={isRefreshing}
      >
        <LogoIcon 
          src={kbLogo} 
          alt="KB"
          $isRefreshing={isRefreshing}
          $rotation={rotation}
        />
      </RefreshIndicator>
      
      <RefreshText $isVisible={pullDistance > 20}>
        {getRefreshText()}
      </RefreshText>
      
      <ScrollContainer
        ref={scrollContainerRef}
        $isPulling={isPulling}
        $pullDistance={pullDistance}
      >
        {children}
      </ScrollContainer>
    </Container>
  );
};

// 간단한 로딩 스피너 (KB 스타일)
const spinnerRotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const KBSpinner = styled.div<{ size?: number }>`
  width: ${props => props.size || 24}px;
  height: ${props => props.size || 24}px;
  border: 2px solid #f0f0f0;
  border-top-color: #FFD338;
  border-radius: 50%;
  animation: ${spinnerRotate} 0.8s linear infinite;
`;