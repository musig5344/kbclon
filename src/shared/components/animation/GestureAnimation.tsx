/**
 * Gesture-based Animation Components
 * Handles touch and mouse gestures with optimized RAF handling for 60fps
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';

import styled from 'styled-components';

import { animationMonitor, performanceHelpers } from '../../utils/animationPerformance';

import { springPresets } from './SpringAnimation';

// Gesture types
export type GestureType = 'drag' | 'swipe' | 'pinch' | 'rotate' | 'tap' | 'longpress';

// Gesture state
interface GestureState {
  type: GestureType | null;
  isActive: boolean;
  startTime: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  velocityX: number;
  velocityY: number;
  distance: number;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  scale: number;
  rotation: number;
}

// Gesture config
interface GestureConfig {
  enableDrag?: boolean;
  enableSwipe?: boolean;
  enablePinch?: boolean;
  enableRotate?: boolean;
  enableTap?: boolean;
  enableLongPress?: boolean;
  dragThreshold?: number;
  swipeThreshold?: number;
  swipeVelocityThreshold?: number;
  tapThreshold?: number;
  tapDuration?: number;
  longPressDuration?: number;
  bounds?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
  momentum?: boolean;
  momentumDecay?: number;
  rubberBand?: boolean;
  rubberBandFactor?: number;
}

// Default config
const defaultConfig: GestureConfig = {
  enableDrag: true,
  enableSwipe: true,
  enablePinch: false,
  enableRotate: false,
  enableTap: true,
  enableLongPress: false,
  dragThreshold: 5,
  swipeThreshold: 50,
  swipeVelocityThreshold: 0.3,
  tapThreshold: 10,
  tapDuration: 250,
  longPressDuration: 500,
  momentum: true,
  momentumDecay: 0.95,
  rubberBand: true,
  rubberBandFactor: 0.3,
};

// Gesture container
const GestureContainer = styled.div<{ $cursor?: string }>`
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  cursor: ${props => props.$cursor || 'default'};
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
`;

// Gesture recognizer hook
export const useGestureRecognizer = (
  config: GestureConfig = defaultConfig,
  onGesture?: (gesture: GestureState) => void
) => {
  const [gesture, setGesture] = useState<GestureState>({
    type: null,
    isActive: false,
    startTime: 0,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    velocityX: 0,
    velocityY: 0,
    distance: 0,
    direction: null,
    scale: 1,
    rotation: 0,
  });

  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const velocitySamplesRef = useRef<Array<{ x: number; y: number; time: number }>>([]);
  const tapTimeoutRef = useRef<NodeJS.Timeout>();
  const longPressTimeoutRef = useRef<NodeJS.Timeout>();
  const initialDistanceRef = useRef<number>(0);
  const initialAngleRef = useRef<number>(0);

  // Calculate velocity from recent samples
  const calculateVelocity = useCallback(() => {
    const samples = velocitySamplesRef.current;
    if (samples.length < 2) return { x: 0, y: 0 };

    const recent = samples.slice(-5); // Use last 5 samples
    if (recent.length < 2) return { x: 0, y: 0 };

    const first = recent[0];
    const last = recent[recent.length - 1];
    const timeDelta = last.time - first.time;

    if (timeDelta === 0) return { x: 0, y: 0 };

    return {
      x: (last.x - first.x) / timeDelta,
      y: (last.y - first.y) / timeDelta,
    };
  }, []);

  // Get direction from delta
  const getDirection = useCallback((deltaX: number, deltaY: number): GestureState['direction'] => {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX < 10 && absY < 10) return null;

    if (absX > absY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, []);

  // Apply bounds with rubber band effect
  const applyBounds = useCallback(
    (value: number, min?: number, max?: number): number => {
      if (min === undefined && max === undefined) return value;

      if (config.rubberBand) {
        if (min !== undefined && value < min) {
          const diff = min - value;
          return min - diff * config.rubberBandFactor!;
        }
        if (max !== undefined && value > max) {
          const diff = value - max;
          return max + diff * config.rubberBandFactor!;
        }
      } else {
        if (min !== undefined) value = Math.max(value, min);
        if (max !== undefined) value = Math.min(value, max);
      }

      return value;
    },
    [config.rubberBand, config.rubberBandFactor]
  );

  // Handle gesture start
  const handleStart = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      event.preventDefault();

      const touch = 'touches' in event ? event.touches[0] : event;
      const startX = touch.clientX;
      const startY = touch.clientY;
      const startTime = Date.now();

      // Reset velocity samples
      velocitySamplesRef.current = [{ x: startX, y: startY, time: startTime }];

      // Initialize gesture state
      const newGesture: GestureState = {
        type: null,
        isActive: true,
        startTime,
        startX,
        startY,
        currentX: startX,
        currentY: startY,
        deltaX: 0,
        deltaY: 0,
        velocityX: 0,
        velocityY: 0,
        distance: 0,
        direction: null,
        scale: 1,
        rotation: 0,
      };

      setGesture(newGesture);

      // Setup tap detection
      if (config.enableTap) {
        tapTimeoutRef.current = setTimeout(() => {
          if (config.enableLongPress && newGesture.distance < config.tapThreshold!) {
            newGesture.type = 'longpress';
            onGesture?.(newGesture);
          }
        }, config.longPressDuration);
      }

      // Handle multi-touch for pinch/rotate
      if ('touches' in event && event.touches.length === 2) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];

        initialDistanceRef.current = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        initialAngleRef.current = Math.atan2(
          touch2.clientY - touch1.clientY,
          touch2.clientX - touch1.clientX
        );
      }
    },
    [config, onGesture]
  );

  // Handle gesture move
  const handleMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!gesture.isActive) return;

      const touch = 'touches' in event ? event.touches[0] : event;
      const currentX = touch.clientX;
      const currentY = touch.clientY;
      const currentTime = Date.now();

      // Calculate deltas
      let deltaX = currentX - gesture.startX;
      let deltaY = currentY - gesture.startY;

      // Apply bounds
      if (config.bounds) {
        deltaX = applyBounds(deltaX, config.bounds.left, config.bounds.right);
        deltaY = applyBounds(deltaY, config.bounds.top, config.bounds.bottom);
      }

      const distance = Math.hypot(deltaX, deltaY);

      // Add velocity sample
      velocitySamplesRef.current.push({ x: currentX, y: currentY, time: currentTime });
      if (velocitySamplesRef.current.length > 10) {
        velocitySamplesRef.current.shift();
      }

      const velocity = calculateVelocity();
      const direction = getDirection(deltaX, deltaY);

      // Determine gesture type
      let type = gesture.type;
      if (!type) {
        if (distance > config.dragThreshold!) {
          type = 'drag';
          // Cancel tap/longpress
          if (tapTimeoutRef.current) {
            clearTimeout(tapTimeoutRef.current);
          }
          if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
          }
        }
      }

      // Handle pinch/rotate
      let scale = gesture.scale;
      let rotation = gesture.rotation;

      if ('touches' in event && event.touches.length === 2 && config.enablePinch) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];

        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        scale = currentDistance / initialDistanceRef.current;

        if (config.enableRotate) {
          const currentAngle = Math.atan2(
            touch2.clientY - touch1.clientY,
            touch2.clientX - touch1.clientX
          );
          rotation = ((currentAngle - initialAngleRef.current) * 180) / Math.PI;
        }

        type = scale !== 1 ? 'pinch' : type;
      }

      const newGesture: GestureState = {
        ...gesture,
        type,
        currentX,
        currentY,
        deltaX,
        deltaY,
        velocityX: velocity.x,
        velocityY: velocity.y,
        distance,
        direction,
        scale,
        rotation,
      };

      setGesture(newGesture);
      onGesture?.(newGesture);
    },
    [gesture, config, applyBounds, calculateVelocity, getDirection, onGesture]
  );

  // Handle gesture end
  const handleEnd = useCallback(() => {
    if (!gesture.isActive) return;

    const endTime = Date.now();
    const duration = endTime - gesture.startTime;
    const velocity = calculateVelocity();

    // Clear timeouts
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }

    let type = gesture.type;

    // Detect tap
    if (
      !type &&
      config.enableTap &&
      gesture.distance < config.tapThreshold! &&
      duration < config.tapDuration!
    ) {
      type = 'tap';
    }

    // Detect swipe
    if (config.enableSwipe && gesture.type === 'drag') {
      const velocityMagnitude = Math.hypot(velocity.x, velocity.y);
      if (
        velocityMagnitude > config.swipeVelocityThreshold! ||
        gesture.distance > config.swipeThreshold!
      ) {
        type = 'swipe';
      }
    }

    const finalGesture: GestureState = {
      ...gesture,
      type,
      isActive: false,
      velocityX: velocity.x,
      velocityY: velocity.y,
    };

    setGesture(finalGesture);
    onGesture?.(finalGesture);

    // Apply momentum if enabled
    if (config.momentum && type === 'drag' && (velocity.x !== 0 || velocity.y !== 0)) {
      applyMomentum(finalGesture, velocity);
    }
  }, [gesture, config, calculateVelocity, onGesture]);

  // Apply momentum animation
  const applyMomentum = useCallback(
    (finalGesture: GestureState, velocity: { x: number; y: number }) => {
      let currentVelocity = { ...velocity };
      let currentDelta = { x: finalGesture.deltaX, y: finalGesture.deltaY };

      const animate = () => {
        // Apply decay
        currentVelocity.x *= config.momentumDecay!;
        currentVelocity.y *= config.momentumDecay!;

        // Update position
        currentDelta.x += currentVelocity.x * 16; // Assume 60fps
        currentDelta.y += currentVelocity.y * 16;

        // Apply bounds
        if (config.bounds) {
          currentDelta.x = applyBounds(currentDelta.x, config.bounds.left, config.bounds.right);
          currentDelta.y = applyBounds(currentDelta.y, config.bounds.top, config.bounds.bottom);
        }

        const momentumGesture: GestureState = {
          ...finalGesture,
          deltaX: currentDelta.x,
          deltaY: currentDelta.y,
          velocityX: currentVelocity.x,
          velocityY: currentVelocity.y,
        };

        onGesture?.(momentumGesture);

        // Continue if velocity is significant
        if (Math.abs(currentVelocity.x) > 0.1 || Math.abs(currentVelocity.y) > 0.1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    },
    [config, applyBounds, onGesture]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);

  // Add/remove event listeners
  useEffect(() => {
    if (gesture.isActive) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
      window.addEventListener('touchcancel', handleEnd);

      return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
        window.removeEventListener('touchcancel', handleEnd);
      };
    }
  }, [gesture.isActive, handleMove, handleEnd]);

  return {
    gesture,
    bind: {
      onMouseDown: handleStart,
      onTouchStart: handleStart,
    },
  };
};

// Swipeable component
interface SwipeableProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  style?: React.CSSProperties;
}

export const Swipeable: React.FC<SwipeableProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  style,
}) => {
  const { gesture, bind } = useGestureRecognizer(
    {
      enableSwipe: true,
      swipeThreshold: threshold,
    },
    gesture => {
      if (gesture.type === 'swipe' && !gesture.isActive) {
        switch (gesture.direction) {
          case 'left':
            onSwipeLeft?.();
            break;
          case 'right':
            onSwipeRight?.();
            break;
          case 'up':
            onSwipeUp?.();
            break;
          case 'down':
            onSwipeDown?.();
            break;
        }
      }
    }
  );

  return (
    <GestureContainer {...bind} style={style}>
      {children}
    </GestureContainer>
  );
};

// Draggable component
interface DraggableProps {
  children: React.ReactNode;
  onDrag?: (delta: { x: number; y: number }) => void;
  onDragEnd?: (velocity: { x: number; y: number }) => void;
  bounds?: GestureConfig['bounds'];
  momentum?: boolean;
  style?: React.CSSProperties;
}

export const Draggable: React.FC<DraggableProps> = ({
  children,
  onDrag,
  onDragEnd,
  bounds,
  momentum = true,
  style,
}) => {
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const animationIdRef = useRef<string>('');

  const { gesture, bind } = useGestureRecognizer(
    {
      enableDrag: true,
      bounds,
      momentum,
    },
    gesture => {
      if (gesture.type === 'drag') {
        if (gesture.isActive) {
          setTransform({ x: gesture.deltaX, y: gesture.deltaY });
          onDrag?.({ x: gesture.deltaX, y: gesture.deltaY });
        } else {
          animationIdRef.current = `drag-${Date.now()}`;
          animationMonitor.startAnimation(animationIdRef.current);
          onDragEnd?.({ x: gesture.velocityX, y: gesture.velocityY });
        }
      }
    }
  );

  // Monitor performance after drag ends
  useEffect(() => {
    if (!gesture.isActive && animationIdRef.current) {
      const metrics = animationMonitor.endAnimation(animationIdRef.current);
      if (metrics && metrics.averageFps < 55) {
        console.warn('Drag animation performance below 60fps:', metrics);
      }
      animationIdRef.current = '';
    }
  }, [gesture.isActive]);

  return (
    <GestureContainer
      {...bind}
      $cursor={gesture.isActive ? 'grabbing' : 'grab'}
      style={{
        ...style,
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }}
    >
      {children}
    </GestureContainer>
  );
};

// Pinchable component
interface PinchableProps {
  children: React.ReactNode;
  onPinch?: (scale: number) => void;
  onPinchEnd?: (scale: number) => void;
  minScale?: number;
  maxScale?: number;
  style?: React.CSSProperties;
}

export const Pinchable: React.FC<PinchableProps> = ({
  children,
  onPinch,
  onPinchEnd,
  minScale = 0.5,
  maxScale = 3,
  style,
}) => {
  const [scale, setScale] = useState(1);

  const { gesture, bind } = useGestureRecognizer(
    {
      enablePinch: true,
    },
    gesture => {
      if (gesture.type === 'pinch') {
        const clampedScale = Math.max(minScale, Math.min(maxScale, gesture.scale));

        if (gesture.isActive) {
          setScale(clampedScale);
          onPinch?.(clampedScale);
        } else {
          onPinchEnd?.(clampedScale);
        }
      }
    }
  );

  return (
    <GestureContainer
      {...bind}
      style={{
        ...style,
        transform: `scale(${scale})`,
      }}
    >
      {children}
    </GestureContainer>
  );
};

export default {
  useGestureRecognizer,
  Swipeable,
  Draggable,
  Pinchable,
};
