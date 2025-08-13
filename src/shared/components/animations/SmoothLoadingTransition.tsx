import React, { useEffect, useState } from 'react';

import styled, { keyframes } from 'styled-components';

import { kbTimings } from '../../../styles/KBMicroDetails';
import { tokens } from '../../../styles/tokens';

/**
 * 부드러운 로딩 전환 컴포넌트
 * - 페이지 전환 시 자연스러운 로딩 애니메이션
 * - 스켈레톤 로딩에서 실제 콘텐츠로의 부드러운 전환
 * - 성능 최적화된 GPU 가속 사용
 */

interface SmoothLoadingTransitionProps {
  loading: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  minLoadingTime?: number; // 최소 로딩 시간 (ms)
  className?: string;
}

// 페이드 인 애니메이션
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// 페이드 아웃 애니메이션
const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-8px);
  }
`;

// 스케일 인 애니메이션 (더 부드러운 전환)
const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const TransitionContainer = styled.div<{ 
  $isLoading: boolean; 
  $phase: 'loading' | 'loaded' | 'transitioning';
}>`
  position: relative;
  width: 100%;
  height: 100%;
  
  /* GPU 가속 활성화 */
  transform: translateZ(0);
  will-change: opacity, transform;
`;

const ContentWrapper = styled.div<{ 
  $visible: boolean; 
  $animating: boolean;
}>`
  width: 100%;
  height: 100%;
  position: ${({ $animating }) => $animating ? 'absolute' : 'relative'};
  top: 0;
  left: 0;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  
  ${({ $visible, $animating }) => {
    if (!$animating) return '';
    
    return $visible 
      ? `
        animation: ${scaleIn} ${kbTimings.normal} ${kbTimings.easeOut} forwards;
      `
      : `
        animation: ${fadeOut} ${kbTimings.fast} ${kbTimings.easeIn} forwards;
      `;
  }}
  
  transition: opacity ${kbTimings.fast} ${kbTimings.easeOut};
`;

const LoadingWrapper = styled.div<{ 
  $visible: boolean; 
  $animating: boolean;
}>`
  width: 100%;
  height: 100%;
  position: ${({ $animating }) => $animating ? 'absolute' : 'relative'};
  top: 0;
  left: 0;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  
  ${({ $visible, $animating }) => {
    if (!$animating) return '';
    
    return $visible 
      ? `
        animation: ${fadeIn} ${kbTimings.fast} ${kbTimings.easeOut} forwards;
      `
      : `
        animation: ${fadeOut} ${kbTimings.fast} ${kbTimings.easeIn} forwards;
      `;
  }}
  
  transition: opacity ${kbTimings.fast} ${kbTimings.easeOut};
`;

// 기본 로딩 컴포넌트 (스켈레톤 스타일)
const DefaultLoadingComponent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: ${tokens.spacing[6]};
  gap: ${tokens.spacing[4]};
`;

const SkeletonBlock = styled.div<{ $width?: string; $height?: string }>`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '20px'};
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  border-radius: ${tokens.borderRadius.small};
  animation: pulse 1.5s ease-in-out infinite;
  
  @keyframes pulse {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

export const SmoothLoadingTransition: React.FC<SmoothLoadingTransitionProps> = ({
  loading,
  children,
  loadingComponent,
  minLoadingTime = 300,
  className,
}) => {
  const [internalLoading, setInternalLoading] = useState(loading);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (loading && !internalLoading) {
      // 로딩 시작
      setLoadingStartTime(Date.now());
      setInternalLoading(true);
      setIsTransitioning(true);
    } else if (!loading && internalLoading) {
      // 로딩 종료 - 최소 로딩 시간 확인
      const now = Date.now();
      const elapsed = loadingStartTime ? now - loadingStartTime : 0;
      const remainingTime = Math.max(0, minLoadingTime - elapsed);
      
      setTimeout(() => {
        setIsTransitioning(true);
        
        // 전환 애니메이션 완료 후 상태 업데이트
        setTimeout(() => {
          setInternalLoading(false);
          setIsTransitioning(false);
          setLoadingStartTime(null);
        }, 300); // 애니메이션 시간과 일치
      }, remainingTime);
    }
  }, [loading, internalLoading, loadingStartTime, minLoadingTime]);

  const defaultLoading = (
    <DefaultLoadingComponent>
      <SkeletonBlock $height="24px" $width="60%" />
      <SkeletonBlock $height="16px" $width="100%" />
      <SkeletonBlock $height="16px" $width="80%" />
      <SkeletonBlock $height="200px" />
      <SkeletonBlock $height="16px" $width="70%" />
      <SkeletonBlock $height="16px" $width="90%" />
    </DefaultLoadingComponent>
  );

  return (
    <TransitionContainer
      $isLoading={internalLoading}
      $phase={
        internalLoading 
          ? (isTransitioning ? 'transitioning' : 'loading')
          : 'loaded'
      }
      className={className}
    >
      {/* 로딩 상태 */}
      <LoadingWrapper
        $visible={internalLoading}
        $animating={isTransitioning}
      >
        {loadingComponent || defaultLoading}
      </LoadingWrapper>
      
      {/* 실제 콘텐츠 */}
      <ContentWrapper
        $visible={!internalLoading}
        $animating={isTransitioning}
      >
        {children}
      </ContentWrapper>
    </TransitionContainer>
  );
};

export default SmoothLoadingTransition;