/**
 * Animation Components and Utilities Export
 * Central export point for all animation-related modules
 */

// Performance monitoring
export { animationMonitor, performanceHelpers } from '../../utils/animationPerformance';
export type { PerformanceMetrics, AnimationMetrics } from '../../utils/animationPerformance';

// Animation helpers
export {
  containment,
  willChange,
  gpuAcceleration,
  batchDOM,
  raf,
  transform,
  scroll,
  measure,
  CubicBezier,
} from '../../utils/animationHelpers';

// Optimized transitions
export {
  FadeTransition,
  SlideTransition,
  ScaleTransition,
  TransformTransition,
  CompoundTransition,
} from './OptimizedTransition';

// Spring animations
export {
  Spring,
  SpringTransform,
  SpringTransitionGroup,
  useSpring,
  useSpringValue,
  useSpringGesture,
  springPresets,
  interpolate,
} from './SpringAnimation';

// Gesture animations
export { useGestureRecognizer, Swipeable, Draggable, Pinchable } from './GestureAnimation';
export type { GestureType, GestureState, GestureConfig } from './GestureAnimation';

// FLIP animations
export {
  useFlip,
  useFlipGroup,
  useAutoAnimate,
  useSharedElementTransition,
  Flip,
  FlipGroup,
} from './FlipAnimation';

// Animation hooks
export {
  useAnimation,
  useScrollAnimation,
  useParallax,
  useStagger,
  useCount,
  useTypewriter,
  easings,
} from '../../hooks/useAnimation';

// Scroll optimized components
export {
  default as ScrollOptimizedList,
  AnimatedListItem,
  SortableList,
  useInfiniteScroll,
} from './ScrollOptimizedList';

// Pre-configured animation components are moved to AnimationPresets.tsx
// This is a TypeScript file and cannot contain JSX
export { AnimationPresets } from './AnimationPresets';

// Animation utilities
export const AnimationUtils = {
  // Check if animations should be enabled
  shouldAnimate: () =>
    !performanceHelpers.prefersReducedMotion() && !performanceHelpers.isLowEndDevice(),

  // Get optimal animation duration based on device
  getOptimalDuration: (baseDuration: number = 300) => {
    if (performanceHelpers.prefersReducedMotion()) return 0;
    if (performanceHelpers.isLowEndDevice()) return baseDuration * 0.5;
    return baseDuration;
  },

  // Schedule animation with performance considerations
  scheduleAnimation: (callback: () => void, priority: 'high' | 'normal' | 'low' = 'normal') => {
    if (priority === 'high') {
      requestAnimationFrame(callback);
    } else if (priority === 'normal') {
      performanceHelpers.scheduleAnimation(callback);
    } else {
      performanceHelpers.scheduleAnimation(callback, { timeout: 1000 });
    }
  },

  // Batch multiple animations
  batchAnimations: (animations: Array<() => void>) => {
    raf.sequence(animations);
  },

  // Create staggered animation delays
  createStagger: (count: number, baseDelay: number = 50, maxDelay: number = 300) => {
    return Array.from({ length: count }, (_, i) => Math.min(i * baseDelay, maxDelay));
  },
};

// Performance monitoring utilities
export const PerformanceUtils = {
  // Start monitoring all animations
  startMonitoring: () => {
    animationMonitor.start();
  },

  // Stop monitoring and get report
  stopMonitoring: () => {
    const metrics = animationMonitor.getMetrics();
    animationMonitor.stop();
    return metrics;
  },

  // Monitor specific animation
  monitorAnimation: async (name: string, animation: () => void | Promise<void>) => {
    animationMonitor.startAnimation(name);
    await animation();
    const metrics = animationMonitor.endAnimation(name);

    if (metrics) {
    }

    return metrics;
  },

  // Get current FPS
  getCurrentFPS: () => animationMonitor.getMetrics().fps,

  // Subscribe to performance updates
  subscribeToMetrics: (callback: (metrics: any) => void) => {
    return animationMonitor.subscribe(callback);
  },
};

// CSS-in-JS helpers
export const AnimationStyles = {
  // GPU acceleration
  gpuAccelerated: `
    ${gpuAcceleration.full}
  `,

  // Smooth transitions
  smoothTransition: (property: string = 'all', duration: number = 300) => `
    transition: ${property} ${duration}ms cubic-bezier(0.4, 0, 0.2, 1);
    ${gpuAcceleration.force3D}
  `,

  // Containment
  contained: `
    ${containment.strict}
  `,

  // Will-change management
  willChangeAuto: (property: string) => `
    will-change: ${property};
    
    &:not(:hover) {
      will-change: auto;
    }
  `,

  // Reduced motion support
  respectMotion: (animation: string) => `
    animation: ${animation};
    
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
};

// Export all as default
export default {
  // Components
  FadeTransition,
  SlideTransition,
  ScaleTransition,
  TransformTransition,
  CompoundTransition,
  Spring,
  SpringTransform,
  SpringTransitionGroup,
  Swipeable,
  Draggable,
  Pinchable,
  Flip,
  FlipGroup,
  ScrollOptimizedList,
  AnimatedListItem,
  SortableList,

  // Hooks
  useAnimation,
  useScrollAnimation,
  useParallax,
  useStagger,
  useCount,
  useTypewriter,
  useSpring,
  useSpringValue,
  useSpringGesture,
  useGestureRecognizer,
  useFlip,
  useFlipGroup,
  useAutoAnimate,
  useSharedElementTransition,
  useInfiniteScroll,

  // Utilities
  animationMonitor,
  performanceHelpers,
  AnimationPresets,
  AnimationUtils,
  PerformanceUtils,
  AnimationStyles,

  // Constants
  easings,
  springPresets,
};
