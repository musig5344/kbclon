import { keyframes, css } from 'styled-components';

/**
 * KB 스타뱅킹 통합 애니메이션 시스템
 * 
 * 목적:
 * - 중복 애니메이션 제거
 * - 통합 애니메이션 시스템 구축  
 * - GPU 가속 최적화
 * - 60fps 부드러운 애니메이션 보장
 * - 메모리 효율성 향상
 * - 접근성 지원 (reduced-motion)
 */

// =========================
// 1. 기본 애니메이션 키프레임
// =========================

// 페이드 애니메이션
export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

export const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.98);
  }
`;

// 슬라이드 애니메이션 (가로)
export const slideInFromRight = keyframes`
  from {
    transform: translate3d(100%, 0, 0);
    opacity: 0.9;
  }
  to {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
`;

export const slideInFromLeft = keyframes`
  from {
    transform: translate3d(-100%, 0, 0);
    opacity: 0.9;
  }
  to {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
`;

export const slideOutToLeft = keyframes`
  from {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
  to {
    transform: translate3d(-100%, 0, 0);
    opacity: 0.9;
  }
`;

export const slideOutToRight = keyframes`
  from {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
  to {
    transform: translate3d(100%, 0, 0);
    opacity: 0.9;
  }
`;

// 슬라이드 애니메이션 (세로)
export const slideUpIn = keyframes`
  from {
    transform: translate3d(0, 100%, 0);
    opacity: 0.9;
  }
  to {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
`;

export const slideDownIn = keyframes`
  from {
    transform: translate3d(0, -100%, 0);
    opacity: 0.9;
  }
  to {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
`;

export const slideUpOut = keyframes`
  from {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
  to {
    transform: translate3d(0, -100%, 0);
    opacity: 0.9;
  }
`;

export const slideDownOut = keyframes`
  from {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
  to {
    transform: translate3d(0, 100%, 0);
    opacity: 0.9;
  }
`;

// 스케일 애니메이션
export const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale3d(0.8, 0.8, 1);
  }
  to {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
`;

export const scaleOut = keyframes`
  from {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
  to {
    opacity: 0;
    transform: scale3d(0.8, 0.8, 1);
  }
`;

// 회전 애니메이션 (로딩용)
export const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// 펄스 애니메이션
export const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
  50% {
    opacity: 0.7;
    transform: scale3d(1.05, 1.05, 1);
  }
`;

// 바운스 애니메이션
export const bounceIn = keyframes`
  0% {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 1);
  }
  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
  70% {
    transform: scale3d(0.9, 0.9, 1);
  }
  100% {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
`;

// =========================
// 2. 애니메이션 타이밍
// =========================

export const ANIMATION_TIMING = {
  // KB 앱 표준 타이밍
  FAST: '200ms',
  MEDIUM: '300ms',
  SLOW: '500ms',
  VERY_SLOW: '800ms',
  
  // 특수 목적 타이밍
  SPLASH: '600ms',
  PAGE_TRANSITION: '300ms',
  MODAL: '250ms',
  LOADING: '80ms', // 프레임 애니메이션용
  
  // 이징 함수
  EASE_OUT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  EASE_IN: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  EASE_IN_OUT: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  KB_EASE: 'cubic-bezier(0.4, 0, 0.2, 1)', // KB 앱 표준 이징
} as const;

// =========================
// 3. 최적화된 애니메이션 믹스인
// =========================

/**
 * GPU 가속을 위한 기본 애니메이션 속성
 */
export const gpuAcceleration = css`
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
  will-change: transform, opacity;
`;

/**
 * 부드러운 애니메이션을 위한 기본 설정
 */
export const smoothAnimation = css`
  ${gpuAcceleration}
  animation-fill-mode: both;
  animation-timing-function: ${ANIMATION_TIMING.KB_EASE};
`;

/**
 * reduced-motion 미디어 쿼리 지원
 */
export const reducedMotionSupport = css`
  @media (prefers-reduced-motion: reduce) {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
`;

// =========================
// 4. 페이지별 애니메이션 프리셋
// =========================

/**
 * 스플래시 화면 애니메이션
 */
export const splashAnimations = {
  fadeIn: css`
    ${smoothAnimation}
    animation: ${fadeIn} ${ANIMATION_TIMING.SPLASH} ${ANIMATION_TIMING.KB_EASE};
    ${reducedMotionSupport}
  `,
  
  fadeOut: css`
    ${smoothAnimation}
    animation: ${fadeOut} ${ANIMATION_TIMING.VERY_SLOW} ${ANIMATION_TIMING.EASE_IN};
    ${reducedMotionSupport}
  `,
};

/**
 * 페이지 전환 애니메이션
 */
export const pageTransitionAnimations = {
  slideInRight: css`
    ${smoothAnimation}
    animation: ${slideInFromRight} ${ANIMATION_TIMING.PAGE_TRANSITION} ${ANIMATION_TIMING.KB_EASE};
    ${reducedMotionSupport}
  `,
  
  slideInLeft: css`
    ${smoothAnimation}
    animation: ${slideInFromLeft} ${ANIMATION_TIMING.PAGE_TRANSITION} ${ANIMATION_TIMING.KB_EASE};
    ${reducedMotionSupport}
  `,
  
  slideOutLeft: css`
    ${smoothAnimation}
    animation: ${slideOutToLeft} ${ANIMATION_TIMING.PAGE_TRANSITION} ${ANIMATION_TIMING.KB_EASE};
    ${reducedMotionSupport}
  `,
  
  slideOutRight: css`
    ${smoothAnimation}
    animation: ${slideOutToRight} ${ANIMATION_TIMING.PAGE_TRANSITION} ${ANIMATION_TIMING.KB_EASE};
    ${reducedMotionSupport}
  `,
  
  slideUp: css`
    ${smoothAnimation}
    animation: ${slideUpIn} ${ANIMATION_TIMING.PAGE_TRANSITION} ${ANIMATION_TIMING.KB_EASE};
    ${reducedMotionSupport}
  `,
  
  slideDown: css`
    ${smoothAnimation}
    animation: ${slideDownIn} ${ANIMATION_TIMING.PAGE_TRANSITION} ${ANIMATION_TIMING.KB_EASE};
    ${reducedMotionSupport}
  `,
  
  fade: css`
    ${smoothAnimation}
    animation: ${fadeIn} ${ANIMATION_TIMING.FAST} ${ANIMATION_TIMING.KB_EASE};
    ${reducedMotionSupport}
  `,
};

/**
 * 모달/팝업 애니메이션
 */
export const modalAnimations = {
  slideUp: css`
    ${smoothAnimation}
    animation: ${slideUpIn} ${ANIMATION_TIMING.MODAL} ${ANIMATION_TIMING.KB_EASE};
    ${reducedMotionSupport}
  `,
  
  slideDown: css`
    ${smoothAnimation}
    animation: ${slideDownOut} ${ANIMATION_TIMING.MODAL} ${ANIMATION_TIMING.EASE_IN};
    ${reducedMotionSupport}
  `,
  
  scale: css`
    ${smoothAnimation}
    animation: ${scaleIn} ${ANIMATION_TIMING.MODAL} ${ANIMATION_TIMING.KB_EASE};
    ${reducedMotionSupport}
  `,
  
  fade: css`
    ${smoothAnimation}
    animation: ${fadeIn} ${ANIMATION_TIMING.FAST} ${ANIMATION_TIMING.KB_EASE};
    ${reducedMotionSupport}
  `,
};

/**
 * 로딩 애니메이션
 */
export const loadingAnimations = {
  spin: css`
    ${smoothAnimation}
    animation: ${spin} 1s linear infinite;
    ${reducedMotionSupport}
  `,
  
  pulse: css`
    ${smoothAnimation}
    animation: ${pulse} 1.5s ease-in-out infinite;
    ${reducedMotionSupport}
  `,
  
  bounce: css`
    ${smoothAnimation}
    animation: ${bounceIn} ${ANIMATION_TIMING.MEDIUM} ${ANIMATION_TIMING.KB_EASE};
    ${reducedMotionSupport}
  `,
};

// =========================
// 5. 버튼 인터랙션 애니메이션
// =========================

/**
 * 터치 피드백 애니메이션
 */
export const touchFeedback = css`
  ${gpuAcceleration}
  transition: transform ${ANIMATION_TIMING.FAST} ${ANIMATION_TIMING.KB_EASE},
              background-color ${ANIMATION_TIMING.FAST} ${ANIMATION_TIMING.KB_EASE},
              box-shadow ${ANIMATION_TIMING.FAST} ${ANIMATION_TIMING.KB_EASE};
  
  &:active {
    transform: scale3d(0.98, 0.98, 1);
  }
  
  ${reducedMotionSupport}
`;

/**
 * 호버 효과 (데스크톱용)
 */
export const hoverEffect = css`
  ${gpuAcceleration}
  transition: transform ${ANIMATION_TIMING.FAST} ${ANIMATION_TIMING.KB_EASE},
              box-shadow ${ANIMATION_TIMING.FAST} ${ANIMATION_TIMING.KB_EASE};
  
  @media (hover: hover) {
    &:hover {
      transform: translate3d(0, -2px, 0);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
  
  ${reducedMotionSupport}
`;

// =========================
// 6. 리스트 아이템 애니메이션
// =========================

/**
 * 목록 아이템 순차적 등장 애니메이션
 */
export const createStaggeredAnimation = (delay: number = 100) => css`
  ${smoothAnimation}
  animation: ${fadeIn} ${ANIMATION_TIMING.MEDIUM} ${ANIMATION_TIMING.KB_EASE};
  animation-delay: ${delay}ms;
  ${reducedMotionSupport}
`;

// =========================
// 7. 성능 최적화 유틸리티
// =========================

/**
 * 애니메이션 성능 최적화를 위한 속성 초기화
 */
export const resetAnimationProps = css`
  will-change: auto;
  transform: none;
  backface-visibility: visible;
`;

/**
 * 애니메이션 완료 후 최적화 정리
 */
export const cleanupAfterAnimation = () => {
  // JavaScript에서 사용할 함수
  return {
    onAnimationEnd: (element: HTMLElement) => {
      element.style.willChange = 'auto';
      element.style.transform = '';
    }
  };
};

// =========================
// 8. 내보내기
// =========================

export default {
  keyframes: {
    fadeIn,
    fadeOut,
    slideInFromRight,
    slideInFromLeft,
    slideOutToLeft,
    slideOutToRight,
    slideUpIn,
    slideDownIn,
    slideUpOut,
    slideDownOut,
    scaleIn,
    scaleOut,
    spin,
    pulse,
    bounceIn,
  },
  timing: ANIMATION_TIMING,
  presets: {
    splash: splashAnimations,
    pageTransition: pageTransitionAnimations,
    modal: modalAnimations,
    loading: loadingAnimations,
  },
  mixins: {
    gpuAcceleration,
    smoothAnimation,
    reducedMotionSupport,
    touchFeedback,
    hoverEffect,
  },
  utils: {
    createStaggeredAnimation,
    resetAnimationProps,
    cleanupAfterAnimation,
  },
};