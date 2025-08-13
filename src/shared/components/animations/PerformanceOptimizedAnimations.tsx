/**
 * Performance Optimized Animations
 * 모든 애니메이션 컴포넌트에서 사용할 수 있는 최적화된 애니메이션 기본 설정
 *
 * 최적화 요소:
 * - GPU 레이어 활용 (transform: translateZ(0), will-change)
 * - 60fps 보장을 위한 transform/opacity 기반 애니메이션
 * - containment로 레이아웃/스타일/페인트 격리
 * - 백그라운드에서 애니메이션 최적화
 */
import styled, { css, keyframes } from 'styled-components';

import { gpuAcceleration, willChange, containment } from '../../utils/animationHelpers';

// Base optimized animation container
export const AnimationContainer = styled.div`
  /* GPU 가속 및 성능 최적화 */
  ${gpuAcceleration.full}
  will-change: auto;
  ${containment.strict}

  /* 브라우저 최적화 힌트 */
  transform-style: preserve-3d;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  /* 리듀스드 모션 지원 */
  @media (prefers-reduced-motion: reduce) {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
`;

// Optimized keyframes for various animations
export const optimizedFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateZ(0) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateZ(0) translateY(0);
  }
`;

export const optimizedSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translateZ(0) translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateZ(0) translateX(0);
  }
`;

export const optimizedScaleIn = keyframes`
  from {
    opacity: 0;
    transform: translateZ(0) scale3d(0.95, 0.95, 1);
  }
  to {
    opacity: 1;
    transform: translateZ(0) scale3d(1, 1, 1);
  }
`;

export const optimizedRotate = keyframes`
  from {
    transform: translateZ(0) rotate(0deg);
  }
  to {
    transform: translateZ(0) rotate(360deg);
  }
`;

export const optimizedPulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: translateZ(0) scale3d(1, 1, 1);
  }
  50% {
    opacity: 0.8;
    transform: translateZ(0) scale3d(1.05, 1.05, 1);
  }
`;

export const optimizedBounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translateZ(0) translate3d(0, 0, 0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translateZ(0) translate3d(0, -30px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translateZ(0) translate3d(0, -15px, 0);
  }
  90% {
    transform: translateZ(0) translate3d(0, -4px, 0);
  }
`;

// Optimized animation mixins
export const fadeInAnimation = css<{ duration?: string; delay?: string }>`
  animation: ${optimizedFadeIn} ${props => props.duration || '0.3s'} cubic-bezier(0.4, 0, 0.2, 1)
    ${props => props.delay || '0s'} both;
  ${willChange.common}
`;

export const slideInAnimation = css<{ duration?: string; delay?: string }>`
  animation: ${optimizedSlideIn} ${props => props.duration || '0.3s'} cubic-bezier(0.4, 0, 0.2, 1)
    ${props => props.delay || '0s'} both;
  ${willChange.common}
`;

export const scaleInAnimation = css<{ duration?: string; delay?: string }>`
  animation: ${optimizedScaleIn} ${props => props.duration || '0.2s'}
    cubic-bezier(0.175, 0.885, 0.32, 1.275) ${props => props.delay || '0s'} both;
  ${willChange.common}
`;

export const rotateAnimation = css<{ duration?: string }>`
  animation: ${optimizedRotate} ${props => props.duration || '1s'} linear infinite;
  ${willChange.transform}
`;

export const pulseAnimation = css<{ duration?: string }>`
  animation: ${optimizedPulse} ${props => props.duration || '2s'} ease-in-out infinite;
  ${willChange.common}
`;

export const bounceAnimation = css<{ duration?: string; delay?: string }>`
  animation: ${optimizedBounce} ${props => props.duration || '1s'} ${props => props.delay || '0s'}
    both;
  ${willChange.transform}
`;

// Performance optimized components
export const FadeInContainer = styled(AnimationContainer)<{ duration?: string; delay?: string }>`
  ${fadeInAnimation}
`;

export const SlideInContainer = styled(AnimationContainer)<{ duration?: string; delay?: string }>`
  ${slideInAnimation}
`;

export const ScaleInContainer = styled(AnimationContainer)<{ duration?: string; delay?: string }>`
  ${scaleInAnimation}
`;

export const RotatingContainer = styled(AnimationContainer)<{ duration?: string }>`
  ${rotateAnimation}
`;

export const PulsingContainer = styled(AnimationContainer)<{ duration?: string }>`
  ${pulseAnimation}
`;

export const BouncingContainer = styled(AnimationContainer)<{ duration?: string; delay?: string }>`
  ${bounceAnimation}
`;

// Stagger animation for lists
export const StaggerContainer = styled.div`
  & > * {
    ${fadeInAnimation}
  }

  & > *:nth-child(1) {
    animation-delay: 0ms;
  }
  & > *:nth-child(2) {
    animation-delay: 50ms;
  }
  & > *:nth-child(3) {
    animation-delay: 100ms;
  }
  & > *:nth-child(4) {
    animation-delay: 150ms;
  }
  & > *:nth-child(5) {
    animation-delay: 200ms;
  }
  & > *:nth-child(6) {
    animation-delay: 250ms;
  }
  & > *:nth-child(7) {
    animation-delay: 300ms;
  }
  & > *:nth-child(8) {
    animation-delay: 350ms;
  }
  & > *:nth-child(9) {
    animation-delay: 400ms;
  }
  & > *:nth-child(10) {
    animation-delay: 450ms;
  }
`;

// Micro-interaction optimizations
export const microInteractionMixin = css`
  transition:
    transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  ${gpuAcceleration.force3D}
  will-change: auto;

  &:hover {
    transform: translateZ(0) translateY(-2px);
    will-change: transform;
  }

  &:active {
    transform: translateZ(0) translateY(0) scale(0.98);
    transition-duration: 0.1s;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 184, 0, 0.5);
  }
`;

// Performance monitoring hook
export const useAnimationPerformance = (name: string) => {
  return {
    onAnimationStart: () => {
      performance.mark(`${name}-start`);
    },
    onAnimationEnd: () => {
      performance.mark(`${name}-end`);
      performance.measure(`${name}-duration`, `${name}-start`, `${name}-end`);

      const measure = performance.getEntriesByName(`${name}-duration`)[0];
      if (measure && measure.duration > 16.67) {
        console.warn(`Animation '${name}' exceeded 16.67ms frame budget: ${measure.duration}ms`);
      }

      // Cleanup
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(`${name}-duration`);
    },
  };
};

// Enhanced button with optimized animations
export const OptimizedButton = styled.button`
  /* 기본 스타일 */
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #ffb800, #ff8a00);
  color: white;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  /* 성능 최적화 */
  ${gpuAcceleration.full}
  ${microInteractionMixin}
  
  /* 리플 효과를 위한 가상 요소 */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transition:
      width 0.6s,
      height 0.6s,
      top 0.6s,
      left 0.6s;
    transform: translate(-50%, -50%);
    ${gpuAcceleration.force3D}
  }

  &:active::before {
    width: 300px;
    height: 300px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;

    &:hover {
      transform: none;
    }
  }
`;

// Enhanced card with optimized animations
export const OptimizedCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  /* 성능 최적화 */
  ${gpuAcceleration.full}
  ${microInteractionMixin}
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transform: translateZ(0) translateY(-4px);
  }
`;

export default {
  AnimationContainer,
  FadeInContainer,
  SlideInContainer,
  ScaleInContainer,
  RotatingContainer,
  PulsingContainer,
  BouncingContainer,
  StaggerContainer,
  OptimizedButton,
  OptimizedCard,
  useAnimationPerformance,
  microInteractionMixin,
  fadeInAnimation,
  slideInAnimation,
  scaleInAnimation,
  rotateAnimation,
  pulseAnimation,
  bounceAnimation,
};
