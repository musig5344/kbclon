import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { usePageTransitionLoading } from '../loading/LoadingManager';

// 애니메이션 타입 정의
export type TransitionType = 'slide' | 'fade' | 'slideUp' | 'slideDown';

// 슬라이드 인 애니메이션 (오른쪽에서 왼쪽으로)
const slideInFromRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0.8;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

// 슬라이드 아웃 애니메이션 (왼쪽으로)
const slideOutToLeft = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0.8;
  }
`;

// 슬라이드 인 애니메이션 (왼쪽에서 오른쪽으로) - 뒤로가기용
const slideInFromLeft = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0.8;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

// 슬라이드 아웃 애니메이션 (오른쪽으로) - 뒤로가기용
const slideOutToRight = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0.8;
  }
`;

// 페이드 인 애니메이션
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// 페이드 아웃 애니메이션
const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.98);
  }
`;

// 위로 슬라이드 인
const slideUpIn = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0.9;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// 아래로 슬라이드 아웃
const slideDownOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0.9;
  }
`;

// 아래로 슬라이드 인
const slideDownIn = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0.9;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// 위로 슬라이드 아웃
const slideUpOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0.9;
  }
`;

// 전환 컨테이너
const TransitionContainer = styled.div<{
  $transitionType: TransitionType;
  $isEntering: boolean;
  $isExiting: boolean;
  $isBackNavigation: boolean;
}>`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;

  ${({ $transitionType, $isEntering, $isExiting, $isBackNavigation }) => {
    if ($isExiting) {
      // 나가는 애니메이션
      switch ($transitionType) {
        case 'slide':
          return css`
            animation: ${$isBackNavigation ? slideOutToRight : slideOutToLeft} 300ms ease-out forwards;
          `;
        case 'fade':
          return css`
            animation: ${fadeOut} 200ms ease-out forwards;
          `;
        case 'slideUp':
          return css`
            animation: ${slideUpOut} 300ms ease-out forwards;
          `;
        case 'slideDown':
          return css`
            animation: ${slideDownOut} 300ms ease-out forwards;
          `;
        default:
          return css`
            animation: ${fadeOut} 200ms ease-out forwards;
          `;
      }
    } else if ($isEntering) {
      // 들어오는 애니메이션
      switch ($transitionType) {
        case 'slide':
          return css`
            animation: ${$isBackNavigation ? slideInFromLeft : slideInFromRight} 300ms ease-out forwards;
          `;
        case 'fade':
          return css`
            animation: ${fadeIn} 200ms ease-out forwards;
          `;
        case 'slideUp':
          return css`
            animation: ${slideUpIn} 300ms ease-out forwards;
          `;
        case 'slideDown':
          return css`
            animation: ${slideDownIn} 300ms ease-out forwards;
          `;
        default:
          return css`
            animation: ${fadeIn} 200ms ease-out forwards;
          `;
      }
    }

    return '';
  }}

  /* reduced-motion 지원 */
  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
    
    ${({ $isExiting }) => $isExiting && css`
      opacity: 0;
    `}
    
    ${({ $isEntering }) => $isEntering && css`
      opacity: 1;
    `}
  }
`;

// Props 인터페이스
interface PageTransitionProps {
  children: React.ReactNode;
  transitionType?: TransitionType;
  duration?: number;
  className?: string;
}

// 페이지 경로별 전환 타입 맵핑
const PAGE_TRANSITION_MAP: Record<string, TransitionType> = {
  '/': 'fade',
  '/login': 'fade',
  '/login/id': 'slide',
  '/dashboard': 'slideUp',
  '/account': 'slide',
  '/transfer': 'slide',
  '/transactions': 'slide',
  '/menu': 'slideDown',
  '/shop': 'slide',
  '/assets': 'slide',
  '/benefits': 'slide',
};

// 페이지 계층 구조 (뒤로가기 판단용)
const PAGE_HIERARCHY: Record<string, number> = {
  '/': 0,
  '/login': 0,
  '/login/id': 1,
  '/dashboard': 1,
  '/account': 2,
  '/transfer': 2,
  '/transactions': 2,
  '/menu': 2,
  '/shop': 2,
  '/assets': 2,
  '/benefits': 2,
};

/**
 * 페이지 전환 애니메이션 컴포넌트
 * 
 * 기능:
 * - 슬라이드 인/아웃 애니메이션
 * - 페이드 인/아웃 효과
 * - React Router와 통합
 * - 뒤로가기 감지 및 역방향 애니메이션
 * - 페이지별 커스텀 전환 효과
 * - 접근성 지원 (reduced-motion)
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  transitionType,
  duration = 300,
  className
}) => {
  const location = useLocation();
  const [isEntering, setIsEntering] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [isBackNavigation, setIsBackNavigation] = useState(false);
  const [previousPath, setPreviousPath] = useState<string>('');
  
  const { startPageTransition, endPageTransition } = usePageTransitionLoading();

  // 현재 페이지의 전환 타입 결정
  const currentTransitionType = transitionType || 
    PAGE_TRANSITION_MAP[location.pathname] || 'fade';

  // 뒤로가기 판단 로직
  const detectBackNavigation = (currentPath: string, prevPath: string): boolean => {
    const currentLevel = PAGE_HIERARCHY[currentPath] ?? 999;
    const prevLevel = PAGE_HIERARCHY[prevPath] ?? 999;
    
    return currentLevel < prevLevel;
  };

  // 페이지 전환 시 애니메이션 처리
  useEffect(() => {
    const currentPath = location.pathname;
    
    // 뒤로가기 감지
    const isBack = detectBackNavigation(currentPath, previousPath);
    setIsBackNavigation(isBack);
    
    // 페이지 전환 로딩 시작
    startPageTransition(currentPath, '페이지를 불러오는 중...');
    
    // 나가는 애니메이션 시작
    setIsExiting(true);
    setIsEntering(false);

    const exitTimer = setTimeout(() => {
      // 들어오는 애니메이션 시작
      setIsExiting(false);
      setIsEntering(true);

      const enterTimer = setTimeout(() => {
        // 애니메이션 완료
        setIsEntering(false);
        endPageTransition(currentPath);
      }, duration);

      return () => clearTimeout(enterTimer);
    }, 50); // 짧은 지연으로 자연스러운 전환

    setPreviousPath(currentPath);

    return () => {
      clearTimeout(exitTimer);
    };
  }, [location.pathname, duration, startPageTransition, endPageTransition, previousPath]);

  return (
    <TransitionContainer
      $transitionType={currentTransitionType}
      $isEntering={isEntering}
      $isExiting={isExiting}
      $isBackNavigation={isBackNavigation}
      className={className}
      role="main"
      aria-live="polite"
    >
      {children}
    </TransitionContainer>
  );
};

/**
 * 모달/팝업용 전환 애니메이션 컴포넌트
 */
const ModalTransitionContainer = styled.div<{
  $isVisible: boolean;
  $transitionType: 'slideUp' | 'fade' | 'scale';
}>`
  ${({ $isVisible, $transitionType }) => {
    if (!$isVisible) {
      switch ($transitionType) {
        case 'slideUp':
          return css`
            animation: ${slideDownOut} 200ms ease-in forwards;
          `;
        case 'scale':
          return css`
            animation: ${fadeOut} 200ms ease-in forwards;
            transform: scale(0.95);
          `;
        case 'fade':
        default:
          return css`
            animation: ${fadeOut} 200ms ease-in forwards;
          `;
      }
    } else {
      switch ($transitionType) {
        case 'slideUp':
          return css`
            animation: ${slideUpIn} 250ms ease-out forwards;
          `;
        case 'scale':
          return css`
            animation: ${fadeIn} 250ms ease-out forwards;
          `;
        case 'fade':
        default:
          return css`
            animation: ${fadeIn} 250ms ease-out forwards;
          `;
      }
    }
  }}

  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
    opacity: ${({ $isVisible }) => $isVisible ? 1 : 0};
    transform: none !important;
  }
`;

interface ModalTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  transitionType?: 'slideUp' | 'fade' | 'scale';
  onTransitionEnd?: () => void;
}

/**
 * 모달/팝업용 전환 애니메이션
 */
export const ModalTransition: React.FC<ModalTransitionProps> = ({
  children,
  isVisible,
  transitionType = 'slideUp',
  onTransitionEnd
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
        onTransitionEnd?.();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onTransitionEnd]);

  if (!shouldRender) {
    return null;
  }

  return (
    <ModalTransitionContainer
      $isVisible={isVisible}
      $transitionType={transitionType}
    >
      {children}
    </ModalTransitionContainer>
  );
};

export default PageTransition;