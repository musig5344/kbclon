/**
 * KB StarBanking Clone - 애니메이션 시스템
 *
 * 60fps 부드러운 애니메이션과 마이크로 인터랙션 제공
 * GPU 가속 및 성능 최적화 적용
 */
import { keyframes, css } from 'styled-components';
// 애니메이션 지속시간 상수
export const duration = {
  fast: '0.15s',
  normal: '0.3s',
  slow: '0.5s',
  page: '0.4s',
} as const;
// 이징 함수들
export const easing = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;
/**
 * 페이지 전환 애니메이션
 */
export const slideInRight = keyframes`
  from {
    transform: translateZ(0) translate3d(100%, 0, 0);
    opacity: 0;
  }
  to {
    transform: translateZ(0) translate3d(0, 0, 0);
    opacity: 1;
  }
`;
export const slideInLeft = keyframes`
  from {
    transform: translateZ(0) translate3d(-100%, 0, 0);
    opacity: 0;
  }
  to {
    transform: translateZ(0) translate3d(0, 0, 0);
    opacity: 1;
  }
`;
export const slideOutRight = keyframes`
  from {
    transform: translateZ(0) translate3d(0, 0, 0);
    opacity: 1;
  }
  to {
    transform: translateZ(0) translate3d(100%, 0, 0);
    opacity: 0;
  }
`;
export const slideOutLeft = keyframes`
  from {
    transform: translateZ(0) translate3d(0, 0, 0);
    opacity: 1;
  }
  to {
    transform: translateZ(0) translate3d(-100%, 0, 0);
    opacity: 0;
  }
`;
/**
 * 페이드 애니메이션
 */
export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;
export const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;
export const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateZ(0) translate3d(0, 30px, 0);
  }
  to {
    opacity: 1;
    transform: translateZ(0) translate3d(0, 0, 0);
  }
`;
export const fadeInDown = keyframes`
  from {
    opacity: 0;
    transform: translateZ(0) translate3d(0, -30px, 0);
  }
  to {
    opacity: 1;
    transform: translateZ(0) translate3d(0, 0, 0);
  }
`;
/**
 * 스케일 애니메이션 (버튼, 카드)
 */
export const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: translateZ(0) scale3d(0.9, 0.9, 1);
  }
  to {
    opacity: 1;
    transform: translateZ(0) scale3d(1, 1, 1);
  }
`;
export const scaleOut = keyframes`
  from {
    opacity: 1;
    transform: translateZ(0) scale3d(1, 1, 1);
  }
  to {
    opacity: 0;
    transform: translateZ(0) scale3d(0.9, 0.9, 1);
  }
`;
/**
 * 바운스 애니메이션
 */
export const bounceIn = keyframes`
  0% {
    opacity: 0;
    transform: translateZ(0) scale3d(0.3, 0.3, 1);
  }
  50% {
    opacity: 1;
  }
  70% {
    transform: translateZ(0) scale3d(1.05, 1.05, 1);
  }
  100% {
    opacity: 1;
    transform: translateZ(0) scale3d(1, 1, 1);
  }
`;
/**
 * 로딩 애니메이션
 */
export const spin = keyframes`
  from {
    transform: translateZ(0) rotate(0deg);
  }
  to {
    transform: translateZ(0) rotate(360deg);
  }
`;
export const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;
export const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;
/**
 * 모달 애니메이션
 */
export const modalSlideUp = keyframes`
  from {
    transform: translateZ(0) translate3d(0, 100%, 0);
  }
  to {
    transform: translateZ(0) translate3d(0, 0, 0);
  }
`;
export const modalSlideDown = keyframes`
  from {
    transform: translateZ(0) translate3d(0, 0, 0);
  }
  to {
    transform: translateZ(0) translate3d(0, 100%, 0);
  }
`;
export const backdropFadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;
/**
 * 리스트 아이템 애니메이션 (스태거링)
 */
export const listItemFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateZ(0) translate3d(0, 20px, 0);
  }
  to {
    opacity: 1;
    transform: translateZ(0) translate3d(0, 0, 0);
  }
`;
/**
 * 성능 최적화 믹스인 - 20년차 시니어 엔지니어 레벨 최적화
 */
export const gpuAcceleration = css`
  /* GPU 레이어 강제 생성 */
  transform: translateZ(0);
  /* 3D 변환 컨텍스트 유지 */
  transform-style: preserve-3d;
  /* 백페이스 숨김으로 렌더링 최적화 */
  backface-visibility: hidden;
  /* 합성 레이어 힌트 */
  will-change: auto;
  /* 레이아웃/스타일/페인트 격리 */
  contain: layout style paint;
  /* 폰트 렌더링 최적화 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

export const dynamicWillChange = css`
  /* 애니메이션 시작 시에만 will-change 활성화 */
  will-change: auto;

  &:hover,
  &:focus,
  &:active,
  &.animating {
    will-change: transform, opacity;
  }
`;

/**
 * 애니메이션 믹스인
 */
export const pageTransition = css`
  animation: ${slideInRight} ${duration.page} ${easing.easeOut};
  ${gpuAcceleration}
  ${dynamicWillChange}
`;
export const modalTransition = css`
  animation: ${modalSlideUp} ${duration.normal} ${easing.easeOut};
  ${gpuAcceleration}
  ${dynamicWillChange}
`;
export const fadeTransition = css`
  animation: ${fadeIn} ${duration.normal} ${easing.easeInOut};
  ${gpuAcceleration}
  ${dynamicWillChange}
`;
export const scaleTransition = css`
  animation: ${scaleIn} ${duration.fast} ${easing.bounce};
  ${gpuAcceleration}
  ${dynamicWillChange}
`;

export const smoothTransition = css`
  transition:
    transform ${duration.normal} ${easing.easeInOut},
    opacity ${duration.normal} ${easing.easeInOut};
  ${gpuAcceleration}
  ${dynamicWillChange}
`;

export const microInteraction = css`
  transition: transform 0.15s ${easing.easeOut};
  ${gpuAcceleration}
  ${dynamicWillChange}
  
  &:hover {
    transform: translateZ(0) translateY(-2px);
  }

  &:active {
    transform: translateZ(0) translateY(0) scale(0.98);
    transition-duration: 0.1s;
  }
`;
/**
 * 리듀스 모션 지원
 */
export const respectMotionPreference = css`
  @media (prefers-reduced-motion: reduce) {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
`;
/**
 * 스태거링 애니메이션 헬퍼
 */
export const staggerDelay = (index: number, baseDelay: number = 0.1) => css`
  animation-delay: ${index * baseDelay}s;
`;
const animations = {
  duration,
  easing,
  slideInRight,
  slideInLeft,
  fadeIn,
  fadeInUp,
  scaleIn,
  bounceIn,
  spin,
  pulse,
  shimmer,
  modalSlideUp,
  backdropFadeIn,
  listItemFadeIn,
  pageTransition,
  modalTransition,
  fadeTransition,
  scaleTransition,
  gpuAcceleration,
  dynamicWillChange,
  smoothTransition,
  microInteraction,
  respectMotionPreference,
  staggerDelay,
};
export default animations;
