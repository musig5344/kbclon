/**
 * Optimized Transition Components
 * Uses only GPU-accelerated properties (transform, opacity) for 60fps performance
 */

import React, { useEffect, useState, useRef, CSSProperties } from 'react';

import styled, { css } from 'styled-components';

import { animationMonitor, performanceHelpers } from '../../utils/animationPerformance';

// Types
interface TransitionProps {
  children: React.ReactNode;
  in: boolean;
  duration?: number;
  delay?: number;
  easing?: string;
  onEnter?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExited?: () => void;
  unmountOnExit?: boolean;
  appearOnMount?: boolean;
  disabled?: boolean;
}

interface FadeProps extends TransitionProps {
  from?: number;
  to?: number;
}

interface SlideProps extends TransitionProps {
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: string | number;
}

interface ScaleProps extends TransitionProps {
  from?: number;
  to?: number;
  origin?: string;
}

interface TransformProps extends TransitionProps {
  from?: {
    x?: string | number;
    y?: string | number;
    scale?: number;
    rotate?: string;
    opacity?: number;
  };
  to?: {
    x?: string | number;
    y?: string | number;
    scale?: number;
    rotate?: string;
    opacity?: number;
  };
}

// Base styles for GPU acceleration
const gpuAcceleration = css`
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
`;

// Styled components
const TransitionContainer = styled.div<{
  $duration: number;
  $delay: number;
  $easing: string;
  $style?: CSSProperties;
}>`
  ${gpuAcceleration}
  transition: transform ${props => props.$duration}ms ${props => props.$easing} ${props =>
    props.$delay}ms,
              opacity ${props => props.$duration}ms ${props => props.$easing} ${props =>
    props.$delay}ms;
  ${props =>
    props.$style &&
    Object.entries(props.$style)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n')}
`;

// Fade Transition Component
export const FadeTransition: React.FC<FadeProps> = ({
  children,
  in: inProp,
  duration = 300,
  delay = 0,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  from = 0,
  to = 1,
  onEnter,
  onEntered,
  onExit,
  onExited,
  unmountOnExit = false,
  appearOnMount = true,
  disabled = false,
}) => {
  const [mounted, setMounted] = useState(!unmountOnExit || inProp);
  const [opacity, setOpacity] = useState(appearOnMount ? from : to);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const animationIdRef = useRef<string>('');

  useEffect(() => {
    if (disabled) {
      setOpacity(inProp ? to : from);
      return;
    }

    if (inProp) {
      // Entering
      if (!mounted) setMounted(true);
      onEnter?.();

      // Start performance tracking
      animationIdRef.current = `fade-${Date.now()}`;
      animationMonitor.startAnimation(animationIdRef.current);

      // Use RAF for smooth transition start
      requestAnimationFrame(() => {
        setOpacity(to);
      });

      timeoutRef.current = setTimeout(() => {
        onEntered?.();
        // End performance tracking
        const metrics = animationMonitor.endAnimation(animationIdRef.current);
        if (metrics && metrics.averageFps < 55) {
          console.warn('Fade animation performance below 60fps:', metrics);
        }
      }, duration + delay);
    } else {
      // Exiting
      onExit?.();
      setOpacity(from);

      timeoutRef.current = setTimeout(() => {
        onExited?.();
        if (unmountOnExit) setMounted(false);
      }, duration + delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inProp, disabled]);

  if (!mounted) return null;

  return (
    <TransitionContainer
      $duration={performanceHelpers.prefersReducedMotion() ? 0 : duration}
      $delay={delay}
      $easing={easing}
      $style={{ opacity }}
    >
      {children}
    </TransitionContainer>
  );
};

// Slide Transition Component
export const SlideTransition: React.FC<SlideProps> = ({
  children,
  in: inProp,
  direction = 'left',
  distance = '100%',
  duration = 300,
  delay = 0,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  onEnter,
  onEntered,
  onExit,
  onExited,
  unmountOnExit = false,
  appearOnMount = true,
  disabled = false,
}) => {
  const [mounted, setMounted] = useState(!unmountOnExit || inProp);
  const [transform, setTransform] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout>();
  const animationIdRef = useRef<string>('');

  const getTransform = (show: boolean) => {
    if (disabled) return 'translate3d(0, 0, 0)';

    const dist = typeof distance === 'number' ? `${distance}px` : distance;

    if (show) return 'translate3d(0, 0, 0)';

    switch (direction) {
      case 'left':
        return `translate3d(-${dist}, 0, 0)`;
      case 'right':
        return `translate3d(${dist}, 0, 0)`;
      case 'up':
        return `translate3d(0, -${dist}, 0)`;
      case 'down':
        return `translate3d(0, ${dist}, 0)`;
      default:
        return 'translate3d(0, 0, 0)';
    }
  };

  useEffect(() => {
    if (appearOnMount && !inProp) {
      setTransform(getTransform(false));
    } else {
      setTransform(getTransform(inProp));
    }
  }, []);

  useEffect(() => {
    if (inProp) {
      // Entering
      if (!mounted) setMounted(true);
      onEnter?.();

      // Start performance tracking
      animationIdRef.current = `slide-${direction}-${Date.now()}`;
      animationMonitor.startAnimation(animationIdRef.current);

      requestAnimationFrame(() => {
        setTransform(getTransform(true));
      });

      timeoutRef.current = setTimeout(() => {
        onEntered?.();
        // End performance tracking
        const metrics = animationMonitor.endAnimation(animationIdRef.current);
        if (metrics && metrics.averageFps < 55) {
          console.warn(`Slide ${direction} animation performance below 60fps:`, metrics);
        }
      }, duration + delay);
    } else {
      // Exiting
      onExit?.();
      setTransform(getTransform(false));

      timeoutRef.current = setTimeout(() => {
        onExited?.();
        if (unmountOnExit) setMounted(false);
      }, duration + delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inProp, disabled]);

  if (!mounted) return null;

  return (
    <TransitionContainer
      $duration={performanceHelpers.prefersReducedMotion() ? 0 : duration}
      $delay={delay}
      $easing={easing}
      $style={{ transform }}
    >
      {children}
    </TransitionContainer>
  );
};

// Scale Transition Component
export const ScaleTransition: React.FC<ScaleProps> = ({
  children,
  in: inProp,
  from = 0.95,
  to = 1,
  origin = 'center',
  duration = 300,
  delay = 0,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  onEnter,
  onEntered,
  onExit,
  onExited,
  unmountOnExit = false,
  appearOnMount = true,
  disabled = false,
}) => {
  const [mounted, setMounted] = useState(!unmountOnExit || inProp);
  const [scale, setScale] = useState(appearOnMount ? from : to);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const animationIdRef = useRef<string>('');

  useEffect(() => {
    if (disabled) {
      setScale(inProp ? to : from);
      return;
    }

    if (inProp) {
      // Entering
      if (!mounted) setMounted(true);
      onEnter?.();

      // Start performance tracking
      animationIdRef.current = `scale-${Date.now()}`;
      animationMonitor.startAnimation(animationIdRef.current);

      requestAnimationFrame(() => {
        setScale(to);
      });

      timeoutRef.current = setTimeout(() => {
        onEntered?.();
        // End performance tracking
        const metrics = animationMonitor.endAnimation(animationIdRef.current);
        if (metrics && metrics.averageFps < 55) {
          console.warn('Scale animation performance below 60fps:', metrics);
        }
      }, duration + delay);
    } else {
      // Exiting
      onExit?.();
      setScale(from);

      timeoutRef.current = setTimeout(() => {
        onExited?.();
        if (unmountOnExit) setMounted(false);
      }, duration + delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inProp, disabled]);

  if (!mounted) return null;

  return (
    <TransitionContainer
      $duration={performanceHelpers.prefersReducedMotion() ? 0 : duration}
      $delay={delay}
      $easing={easing}
      $style={{
        transform: `scale3d(${scale}, ${scale}, 1)`,
        transformOrigin: origin,
      }}
    >
      {children}
    </TransitionContainer>
  );
};

// Advanced Transform Transition Component
export const TransformTransition: React.FC<TransformProps> = ({
  children,
  in: inProp,
  from = {},
  to = {},
  duration = 300,
  delay = 0,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  onEnter,
  onEntered,
  onExit,
  onExited,
  unmountOnExit = false,
  appearOnMount = true,
  disabled = false,
}) => {
  const [mounted, setMounted] = useState(!unmountOnExit || inProp);
  const [style, setStyle] = useState<CSSProperties>({});
  const timeoutRef = useRef<NodeJS.Timeout>();
  const animationIdRef = useRef<string>('');

  const getStyle = (target: typeof from | typeof to): CSSProperties => {
    if (disabled) return {};

    const transforms: string[] = [];

    if (target.x !== undefined || target.y !== undefined) {
      const x = typeof target.x === 'number' ? `${target.x}px` : target.x || '0';
      const y = typeof target.y === 'number' ? `${target.y}px` : target.y || '0';
      transforms.push(`translate3d(${x}, ${y}, 0)`);
    }

    if (target.scale !== undefined) {
      transforms.push(`scale3d(${target.scale}, ${target.scale}, 1)`);
    }

    if (target.rotate !== undefined) {
      transforms.push(`rotate(${target.rotate})`);
    }

    return {
      transform: transforms.join(' ') || 'none',
      opacity: target.opacity !== undefined ? target.opacity : 1,
    };
  };

  useEffect(() => {
    if (appearOnMount && !inProp) {
      setStyle(getStyle(from));
    } else {
      setStyle(getStyle(to));
    }
  }, []);

  useEffect(() => {
    if (inProp) {
      // Entering
      if (!mounted) setMounted(true);
      onEnter?.();

      // Start performance tracking
      animationIdRef.current = `transform-${Date.now()}`;
      animationMonitor.startAnimation(animationIdRef.current);

      requestAnimationFrame(() => {
        setStyle(getStyle(to));
      });

      timeoutRef.current = setTimeout(() => {
        onEntered?.();
        // End performance tracking
        const metrics = animationMonitor.endAnimation(animationIdRef.current);
        if (metrics && metrics.averageFps < 55) {
          console.warn('Transform animation performance below 60fps:', metrics);
        }
      }, duration + delay);
    } else {
      // Exiting
      onExit?.();
      setStyle(getStyle(from));

      timeoutRef.current = setTimeout(() => {
        onExited?.();
        if (unmountOnExit) setMounted(false);
      }, duration + delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inProp, disabled]);

  if (!mounted) return null;

  return (
    <TransitionContainer
      $duration={performanceHelpers.prefersReducedMotion() ? 0 : duration}
      $delay={delay}
      $easing={easing}
      $style={style}
    >
      {children}
    </TransitionContainer>
  );
};

// Compound Transition Component for complex animations
interface CompoundTransitionProps extends TransitionProps {
  transitions: Array<{
    type: 'fade' | 'slide' | 'scale' | 'transform';
    props: any;
  }>;
}

export const CompoundTransition: React.FC<CompoundTransitionProps> = ({
  children,
  in: inProp,
  transitions,
  ...props
}) => {
  let result = <>{children}</>;

  // Apply transitions in reverse order so they nest correctly
  transitions
    .slice()
    .reverse()
    .forEach(transition => {
      const TransitionComponent = {
        fade: FadeTransition,
        slide: SlideTransition,
        scale: ScaleTransition,
        transform: TransformTransition,
      }[transition.type];

      result = (
        <TransitionComponent in={inProp} {...props} {...transition.props}>
          {result}
        </TransitionComponent>
      );
    });

  return result;
};

export default {
  Fade: FadeTransition,
  Slide: SlideTransition,
  Scale: ScaleTransition,
  Transform: TransformTransition,
  Compound: CompoundTransition,
};
