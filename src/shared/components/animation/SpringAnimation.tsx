/**
 * Spring-based Animation Components
 * Provides natural, physics-based animations for smooth 60fps performance
 */

import React, { useEffect, useRef, useState } from 'react';

import styled from 'styled-components';

import { animationMonitor } from '../../utils/animationPerformance';

// Spring physics configuration
interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
  initialVelocity?: number;
  precision?: number;
  restDelta?: number;
  restSpeed?: number;
}

// Spring animation state
interface SpringState {
  value: number;
  velocity: number;
  done: boolean;
}

// Default spring configurations
export const springPresets = {
  default: { stiffness: 170, damping: 26 },
  gentle: { stiffness: 120, damping: 14 },
  wobbly: { stiffness: 180, damping: 12 },
  stiff: { stiffness: 210, damping: 20 },
  slow: { stiffness: 70, damping: 16 },
  quick: { stiffness: 300, damping: 30 },
  bounce: { stiffness: 600, damping: 15 },
  noWobble: { stiffness: 170, damping: 40 },
} as const;

// Spring physics solver
class SpringSolver {
  private stiffness: number;
  private damping: number;
  private mass: number;

  constructor(config: SpringConfig) {
    this.stiffness = config.stiffness ?? 170;
    this.damping = config.damping ?? 26;
    this.mass = config.mass ?? 1;
  }

  solve(
    current: number,
    target: number,
    velocity: number,
    deltaTime: number
  ): { value: number; velocity: number } {
    const spring = -this.stiffness * (current - target);
    const damper = -this.damping * velocity;
    const acceleration = (spring + damper) / this.mass;

    const newVelocity = velocity + acceleration * deltaTime;
    const newValue = current + newVelocity * deltaTime;

    return {
      value: newValue,
      velocity: newVelocity,
    };
  }

  isAtRest(
    current: number,
    target: number,
    velocity: number,
    restDelta: number = 0.01,
    restSpeed: number = 0.01
  ): boolean {
    const displacement = Math.abs(target - current);
    const speed = Math.abs(velocity);

    return displacement < restDelta && speed < restSpeed;
  }
}

// Spring animation hook
export const useSpring = (
  target: number,
  config: SpringConfig = springPresets.default
): SpringState => {
  const [state, setState] = useState<SpringState>({
    value: target,
    velocity: config.initialVelocity ?? 0,
    done: true,
  });

  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const solverRef = useRef(new SpringSolver(config));
  const targetRef = useRef(target);
  const animationIdRef = useRef<string>('');

  // Update solver when config changes
  useEffect(() => {
    solverRef.current = new SpringSolver(config);
  }, [config.stiffness, config.damping, config.mass]);

  // Animate to target
  useEffect(() => {
    targetRef.current = target;

    // Start animation
    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
        animationIdRef.current = `spring-${Date.now()}`;
        animationMonitor.startAnimation(animationIdRef.current);
      }

      const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.064); // Cap at ~15fps min
      lastTimeRef.current = timestamp;

      setState(prevState => {
        const { value, velocity } = solverRef.current.solve(
          prevState.value,
          targetRef.current,
          prevState.velocity,
          deltaTime
        );

        const done = solverRef.current.isAtRest(
          value,
          targetRef.current,
          velocity,
          config.restDelta,
          config.restSpeed
        );

        if (done) {
          // Animation complete
          const metrics = animationMonitor.endAnimation(animationIdRef.current);
          if (metrics && metrics.averageFps < 55) {
            console.warn('Spring animation performance below 60fps:', metrics);
          }

          return {
            value: targetRef.current,
            velocity: 0,
            done: true,
          };
        }

        rafRef.current = requestAnimationFrame(animate);

        return { value, velocity, done: false };
      });
    };

    // Cancel any existing animation
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Reset last time and start animation
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target]);

  return state;
};

// Spring animation component props
interface SpringProps {
  children: (value: number) => React.ReactNode;
  to: number;
  from?: number;
  config?: SpringConfig;
  onRest?: () => void;
}

// Spring animation component
export const Spring: React.FC<SpringProps> = ({
  children,
  to,
  from,
  config = springPresets.default,
  onRest,
}) => {
  const spring = useSpring(to, { ...config, initialVelocity: from ? 0 : config.initialVelocity });

  useEffect(() => {
    if (spring.done && onRest) {
      onRest();
    }
  }, [spring.done, onRest]);

  return <>{children(spring.value)}</>;
};

// Spring transform component
interface SpringTransformProps {
  children: React.ReactNode;
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  opacity?: number;
  config?: SpringConfig;
  style?: React.CSSProperties;
}

const SpringContainer = styled.div`
  will-change: transform, opacity;
  transform-origin: center;
  backface-visibility: hidden;
`;

export const SpringTransform: React.FC<SpringTransformProps> = ({
  children,
  x = 0,
  y = 0,
  scale = 1,
  rotate = 0,
  opacity = 1,
  config = springPresets.default,
  style,
}) => {
  const springX = useSpring(x, config);
  const springY = useSpring(y, config);
  const springScale = useSpring(scale, config);
  const springRotate = useSpring(rotate, config);
  const springOpacity = useSpring(opacity, config);

  const transform = `
    translate3d(${springX.value}px, ${springY.value}px, 0)
    scale3d(${springScale.value}, ${springScale.value}, 1)
    rotate(${springRotate.value}deg)
  `;

  return (
    <SpringContainer
      style={{
        ...style,
        transform,
        opacity: springOpacity.value,
      }}
    >
      {children}
    </SpringContainer>
  );
};

// Spring transition group for staggered animations
interface SpringTransitionGroupProps {
  children: React.ReactElement[];
  stagger?: number;
  config?: SpringConfig;
}

export const SpringTransitionGroup: React.FC<SpringTransitionGroupProps> = ({
  children,
  stagger = 50,
  config = springPresets.default,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {React.Children.map(children, (child, index) => (
        <SpringTransform
          key={child.key || index}
          y={mounted ? 0 : 20}
          opacity={mounted ? 1 : 0}
          config={{
            ...config,
            ...(mounted ? {} : { initialVelocity: -index * stagger }),
          }}
        >
          {child}
        </SpringTransform>
      ))}
    </>
  );
};

// Spring value hook for custom animations
export const useSpringValue = (
  initialValue: number = 0,
  config: SpringConfig = springPresets.default
) => {
  const [target, setTarget] = useState(initialValue);
  const spring = useSpring(target, config);

  return {
    value: spring.value,
    set: setTarget,
    velocity: spring.velocity,
    done: spring.done,
  };
};

// Interpolation helper
export const interpolate = (
  value: number,
  inputRange: [number, number],
  outputRange: [number, number]
): number => {
  const [inputMin, inputMax] = inputRange;
  const [outputMin, outputMax] = outputRange;

  const ratio = (value - inputMin) / (inputMax - inputMin);
  return outputMin + ratio * (outputMax - outputMin);
};

// Spring-based gesture handler hook
interface GestureConfig {
  onDragStart?: (event: React.MouseEvent | React.TouchEvent) => void;
  onDrag?: (delta: { x: number; y: number }) => void;
  onDragEnd?: (velocity: { x: number; y: number }) => void;
  bounds?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
}

export const useSpringGesture = (config: GestureConfig = {}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(0);

  const springX = useSpring(position.x, springPresets.default);
  const springY = useSpring(position.y, springPresets.default);

  const handleStart = (event: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);

    const point = 'touches' in event ? event.touches[0] : event;
    startPosRef.current = { x: point.clientX, y: point.clientY };
    lastPosRef.current = { x: point.clientX, y: point.clientY };
    lastTimeRef.current = Date.now();

    config.onDragStart?.(event);
  };

  const handleMove = (event: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    const point = 'touches' in event ? event.touches[0] : event;
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTimeRef.current;

    const delta = {
      x: point.clientX - startPosRef.current.x,
      y: point.clientY - startPosRef.current.y,
    };

    // Apply bounds
    if (config.bounds) {
      if (config.bounds.left !== undefined) {
        delta.x = Math.max(delta.x, config.bounds.left);
      }
      if (config.bounds.right !== undefined) {
        delta.x = Math.min(delta.x, config.bounds.right);
      }
      if (config.bounds.top !== undefined) {
        delta.y = Math.max(delta.y, config.bounds.top);
      }
      if (config.bounds.bottom !== undefined) {
        delta.y = Math.min(delta.y, config.bounds.bottom);
      }
    }

    // Calculate velocity
    if (deltaTime > 0) {
      velocityRef.current = {
        x: ((point.clientX - lastPosRef.current.x) / deltaTime) * 1000,
        y: ((point.clientY - lastPosRef.current.y) / deltaTime) * 1000,
      };
    }

    lastPosRef.current = { x: point.clientX, y: point.clientY };
    lastTimeRef.current = currentTime;

    setPosition(delta);
    config.onDrag?.(delta);
  };

  const handleEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);
    config.onDragEnd?.(velocityRef.current);

    // Spring back to origin or snap point
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);

      return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging]);

  return {
    bind: {
      onMouseDown: handleStart,
      onTouchStart: handleStart,
    },
    x: springX.value,
    y: springY.value,
    isDragging,
  };
};

export default {
  Spring,
  SpringTransform,
  SpringTransitionGroup,
  useSpring,
  useSpringValue,
  useSpringGesture,
  springPresets,
  interpolate,
};
