import React, { useEffect, useState, useRef } from 'react';

import { useLocation } from 'react-router-dom';

import styled from 'styled-components';

import { kbTimings } from '../../../styles/KBMicroDetails';

/**
 * KB 스타뱅킹 페이지 전환 애니메이션 래퍼
 * - iOS 스타일의 부드러운 슬라이드 전환
 * - 실제 뱅킹 앱과 동일한 애니메이션
 * - 성능 최적화된 GPU 가속 사용
 */

interface PageTransitionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

// 페이지 전환 애니메이션을 위한 컨테이너
const TransitionContainer = styled.div<{ 
  $isAnimating: boolean; 
  $direction: 'forward' | 'backward' | 'none';
  $phase: 'entering' | 'exiting' | 'idle';
}>`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;

  /* GPU 가속 활성화 */
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  will-change: transform, opacity;

  /* 페이지 전환 애니메이션 */
  ${({ $isAnimating, $direction, $phase }) => {
    if (!$isAnimating) return 'transform: translateX(0); opacity: 1;';
    
    switch ($phase) {
      case 'entering':
        return $direction === 'forward' 
          ? `
            transform: translateX(100%);
            opacity: 0.8;
            animation: slideInFromRight ${kbTimings.normal} ${kbTimings.easeOut} forwards;
          `
          : `
            transform: translateX(-100%);
            opacity: 0.8;
            animation: slideInFromLeft ${kbTimings.normal} ${kbTimings.easeOut} forwards;
          `;
      
      case 'exiting':
        return $direction === 'forward'
          ? `
            transform: translateX(0);
            opacity: 1;
            animation: slideOutToLeft ${kbTimings.normal} ${kbTimings.easeIn} forwards;
          `
          : `
            transform: translateX(0);
            opacity: 1;
            animation: slideOutToRight ${kbTimings.normal} ${kbTimings.easeIn} forwards;
          `;
      
      default:
        return 'transform: translateX(0); opacity: 1;';
    }
  }}

  /* 키프레임 애니메이션 정의 */
  @keyframes slideInFromRight {
    from {
      transform: translateX(100%);
      opacity: 0.8;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInFromLeft {
    from {
      transform: translateX(-100%);
      opacity: 0.8;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutToLeft {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(-30%);
      opacity: 0.6;
    }
  }

  @keyframes slideOutToRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(30%);
      opacity: 0.6;
    }
  }
`;

// 페이지 전환 방향을 결정하는 로직
const getTransitionDirection = (fromPath: string, toPath: string): 'forward' | 'backward' | 'none' => {
  // 페이지 계층 구조 정의 (깊이가 클수록 forward)
  const pageDepths: Record<string, number> = {
    '/': 0,
    '/dashboard': 1,
    '/account': 2,
    '/account/:accountId': 3,
    '/account/:accountId/transactions': 4,
    '/transactions': 3,
    '/transfer': 2,
    '/transfer/picture': 3,
    '/shop': 1,
    '/assets': 1,
    '/benefits': 1,
    '/menu': 1,
    '/products': 2,
  };

  // 동적 라우트 매칭
  const getDepth = (path: string) => {
    const exactMatch = pageDepths[path];
    if (exactMatch !== undefined) return exactMatch;
    
    // 동적 라우트 패턴 매칭
    for (const [pattern, depth] of Object.entries(pageDepths)) {
      if (pattern.includes(':') && matchDynamicRoute(pattern, path)) {
        return depth;
      }
    }
    
    return 1; // 기본 깊이
  };

  const fromDepth = getDepth(fromPath);
  const toDepth = getDepth(toPath);

  if (fromDepth < toDepth) return 'forward';
  if (fromDepth > toDepth) return 'backward';
  return 'none';
};

// 동적 라우트 패턴 매칭 함수
const matchDynamicRoute = (pattern: string, path: string): boolean => {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  
  if (patternParts.length !== pathParts.length) return false;
  
  return patternParts.every((part, index) => {
    return part.startsWith(':') || part === pathParts[index];
  });
};

export const PageTransitionWrapper: React.FC<PageTransitionWrapperProps> = ({ 
  children, 
  className 
}) => {
  const location = useLocation();
  const prevLocationRef = useRef<string>(location.pathname);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward' | 'none'>('none');
  const [phase, setPhase] = useState<'entering' | 'exiting' | 'idle'>('idle');
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevLocationRef.current;

    // 같은 페이지면 애니메이션 없음
    if (currentPath === prevPath) return;

    // 전환 방향 결정
    const transitionDirection = getTransitionDirection(prevPath, currentPath);
    
    if (transitionDirection !== 'none') {
      setDirection(transitionDirection);
      setIsAnimating(true);
      setPhase('entering');

      // 애니메이션 완료 후 상태 리셋
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        setPhase('idle');
      }, 300); // kbTimings.normal과 일치
    }

    prevLocationRef.current = currentPath;
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <TransitionContainer
      $isAnimating={isAnimating}
      $direction={direction}
      $phase={phase}
      className={className}
    >
      {children}
    </TransitionContainer>
  );
};

export default PageTransitionWrapper;