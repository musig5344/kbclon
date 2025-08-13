/**
 * Touch Optimization Hooks
 * React hooks for touch gesture detection and handling
 */

import { useEffect, useRef, useCallback, useState } from 'react';

import {
  TouchConfig,
  GestureState,
  GestureType,
  TouchEventNormalizer,
  VelocityTracker,
  HapticFeedback,
  DoubleTapPrevention,
  ScrollLockManager,
  GestureConflictResolver,
  ForceTouchDetector,
  PlatformTouchBehavior,
  defaultTouchConfig,
} from '../utils/touchOptimization';

// Touch handlers
export interface TouchHandlers {
  onTap?: (state: GestureState) => void;
  onDoubleTap?: (state: GestureState) => void;
  onLongPress?: (state: GestureState) => void;
  onSwipeLeft?: (state: GestureState) => void;
  onSwipeRight?: (state: GestureState) => void;
  onSwipeUp?: (state: GestureState) => void;
  onSwipeDown?: (state: GestureState) => void;
  onPinch?: (state: GestureState) => void;
  onRotate?: (state: GestureState) => void;
  onPan?: (state: GestureState) => void;
  onForceTouch?: (state: GestureState) => void;
  onGestureStart?: (state: GestureState) => void;
  onGestureMove?: (state: GestureState) => void;
  onGestureEnd?: (state: GestureState) => void;
}

// Main touch optimization hook
export function useTouchOptimized(handlers: TouchHandlers, config: Partial<TouchConfig> = {}) {
  const touchConfig = { ...defaultTouchConfig, ...config };
  const elementRef = useRef<HTMLElement | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [gesture, setGesture] = useState<GestureState>({
    type: null,
    isActive: false,
    startTime: 0,
    duration: 0,
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
    force: 0,
    touchCount: 0,
  });

  // Refs for gesture detection
  const gestureRef = useRef<GestureState>(gesture);
  const velocityTracker = useRef(new VelocityTracker());
  const doubleTapPrevention = useRef(new DoubleTapPrevention());
  const conflictResolver = useRef(new GestureConflictResolver());
  const haptic = useRef(HapticFeedback.getInstance());

  // Timers
  const longPressTimer = useRef<NodeJS.Timeout>();
  const tapTimer = useRef<NodeJS.Timeout>();
  const lastTapTime = useRef(0);

  // Touch tracking
  const initialTouches = useRef<TouchList | Touch[]>();
  const initialDistance = useRef(0);
  const initialAngle = useRef(0);
  const hasMovedBeyondThreshold = useRef(false);

  // Update gesture ref when state changes
  useEffect(() => {
    gestureRef.current = gesture;
  }, [gesture]);

  // Calculate gesture properties
  const updateGesture = useCallback((touches: Touch[] | TouchList) => {
    const normalizedTouches = TouchEventNormalizer.normalize({
      touches: touches as any,
    } as any);

    if (normalizedTouches.length === 0) return;

    const center = TouchEventNormalizer.getCenter(normalizedTouches);
    const startCenter = TouchEventNormalizer.getCenter(
      TouchEventNormalizer.normalize({ touches: initialTouches.current as any } as any)
    );

    const deltaX = center.x - startCenter.x;
    const deltaY = center.y - startCenter.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Update velocity
    velocityTracker.current.addSample(center.x, center.y);
    const velocity = velocityTracker.current.getVelocity();

    // Determine direction
    let direction: GestureState['direction'] = null;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    // Multi-touch gestures
    let scale = 1;
    let rotation = 0;

    if (
      normalizedTouches.length >= 2 &&
      initialTouches.current &&
      initialTouches.current.length >= 2
    ) {
      const currentDistance = TouchEventNormalizer.getDistance(
        normalizedTouches[0],
        normalizedTouches[1]
      );
      scale = currentDistance / initialDistance.current;

      const currentAngle = TouchEventNormalizer.getAngle(
        normalizedTouches[0],
        normalizedTouches[1]
      );
      rotation = currentAngle - initialAngle.current;
    }

    // Force touch
    const force = ForceTouchDetector.checkSupport()
      ? ForceTouchDetector.normalizeForce(normalizedTouches[0].force)
      : 0;

    const newGesture: GestureState = {
      ...gestureRef.current,
      duration: Date.now() - gestureRef.current.startTime,
      currentX: center.x,
      currentY: center.y,
      deltaX,
      deltaY,
      velocityX: velocity.x,
      velocityY: velocity.y,
      distance,
      direction,
      scale,
      rotation,
      force,
      touchCount: normalizedTouches.length,
    };

    setGesture(newGesture);
    return newGesture;
  }, []);

  // Detect gesture type
  const detectGestureType = useCallback(
    (state: GestureState): GestureType | null => {
      // Force touch
      if (state.force >= touchConfig.forceTouchThreshold && touchConfig.forceTouchAvailable) {
        return 'force';
      }

      // Multi-touch gestures
      if (state.touchCount >= 2) {
        if (Math.abs(state.scale - 1) > touchConfig.pinchThreshold) {
          return 'pinch';
        }
        if (Math.abs(state.rotation) > touchConfig.rotationThreshold) {
          return 'rotate';
        }
      }

      // Movement-based gestures
      if (state.distance > touchConfig.tapMovementThreshold) {
        if (
          state.velocityX > touchConfig.swipeVelocityThreshold ||
          state.velocityY > touchConfig.swipeVelocityThreshold ||
          state.distance > touchConfig.swipeDistanceThreshold
        ) {
          return 'swipe';
        }
        return 'pan';
      }

      // Time-based gestures
      if (state.duration < touchConfig.maxTapDuration) {
        const now = Date.now();
        if (now - lastTapTime.current < touchConfig.doubleTapTimeout) {
          return 'doubleTap';
        }
        return 'tap';
      }

      if (state.duration >= touchConfig.longPressDelay) {
        return 'longPress';
      }

      return null;
    },
    [touchConfig]
  );

  // Handle touch start
  const handleTouchStart = useCallback(
    (event: TouchEvent | MouseEvent) => {
      if (touchConfig.preventDefaultEvents) {
        event.preventDefault();
      }
      if (touchConfig.stopPropagation) {
        event.stopPropagation();
      }

      const touches = 'touches' in event ? event.touches : [event as any];
      if (touches.length === 0) return;

      // Reset state
      velocityTracker.current.reset();
      hasMovedBeyondThreshold.current = false;
      conflictResolver.current.reset();

      // Store initial touches
      initialTouches.current = touches;

      // Calculate initial multi-touch properties
      if (touches.length >= 2) {
        const normalizedTouches = TouchEventNormalizer.normalize({ touches } as any);
        initialDistance.current = TouchEventNormalizer.getDistance(
          normalizedTouches[0],
          normalizedTouches[1]
        );
        initialAngle.current = TouchEventNormalizer.getAngle(
          normalizedTouches[0],
          normalizedTouches[1]
        );
      }

      const center = TouchEventNormalizer.getCenter(
        TouchEventNormalizer.normalize({ touches } as any)
      );

      // Initialize gesture state
      const initialGesture: GestureState = {
        type: null,
        isActive: true,
        startTime: Date.now(),
        duration: 0,
        startX: center.x,
        startY: center.y,
        currentX: center.x,
        currentY: center.y,
        deltaX: 0,
        deltaY: 0,
        velocityX: 0,
        velocityY: 0,
        distance: 0,
        direction: null,
        scale: 1,
        rotation: 0,
        force: 0,
        touchCount: touches.length,
      };

      setGesture(initialGesture);
      setIsPressed(true);

      // Haptic feedback
      if (touchConfig.enableHaptic) {
        haptic.current.trigger(touchConfig.hapticStyle);
      }

      // Start long press timer
      longPressTimer.current = setTimeout(() => {
        if (!hasMovedBeyondThreshold.current && gestureRef.current.isActive) {
          const longPressGesture = { ...gestureRef.current, type: 'longPress' as GestureType };
          setGesture(longPressGesture);
          handlers.onLongPress?.(longPressGesture);

          if (touchConfig.enableHaptic) {
            haptic.current.trigger('medium');
          }
        }
      }, touchConfig.longPressDelay);

      handlers.onGestureStart?.(initialGesture);
    },
    [touchConfig, handlers]
  );

  // Handle touch move
  const handleTouchMove = useCallback(
    (event: TouchEvent | MouseEvent) => {
      if (!gestureRef.current.isActive) return;

      if (touchConfig.preventDefaultEvents) {
        event.preventDefault();
      }

      const touches = 'touches' in event ? event.touches : [event as any];
      if (touches.length === 0) return;

      const updatedGesture = updateGesture(touches);
      if (!updatedGesture) return;

      // Check if moved beyond tap threshold
      if (updatedGesture.distance > touchConfig.tapMovementThreshold) {
        hasMovedBeyondThreshold.current = true;

        // Cancel long press timer
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
        }
      }

      // Detect and update gesture type
      const detectedType = detectGestureType(updatedGesture);
      if (detectedType && detectedType !== updatedGesture.type) {
        if (conflictResolver.current.startGesture(detectedType)) {
          const typedGesture = { ...updatedGesture, type: detectedType };
          setGesture(typedGesture);

          // Call specific handlers
          switch (detectedType) {
            case 'pan':
              handlers.onPan?.(typedGesture);
              break;
            case 'pinch':
              handlers.onPinch?.(typedGesture);
              break;
            case 'rotate':
              handlers.onRotate?.(typedGesture);
              break;
            case 'force':
              handlers.onForceTouch?.(typedGesture);
              if (touchConfig.enableHaptic) {
                haptic.current.trigger('heavy');
              }
              break;
          }
        }
      }

      handlers.onGestureMove?.(updatedGesture);
    },
    [touchConfig, updateGesture, detectGestureType, handlers]
  );

  // Handle touch end
  const handleTouchEnd = useCallback(
    (event: TouchEvent | MouseEvent) => {
      if (!gestureRef.current.isActive) return;

      // Clear timers
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }

      const finalGesture = { ...gestureRef.current, isActive: false };

      // Detect final gesture type if not already detected
      if (!finalGesture.type) {
        const detectedType = detectGestureType(finalGesture);
        if (detectedType) {
          finalGesture.type = detectedType;
        }
      }

      setGesture(finalGesture);
      setIsPressed(false);
      conflictResolver.current.reset();

      // Handle specific gesture types
      switch (finalGesture.type) {
        case 'tap':
          doubleTapPrevention.current.handleTap(() => {
            handlers.onTap?.(finalGesture);
          }, touchConfig.doubleTapTimeout);
          lastTapTime.current = Date.now();
          break;

        case 'doubleTap':
          handlers.onDoubleTap?.(finalGesture);
          lastTapTime.current = 0; // Reset to prevent triple tap
          break;

        case 'swipe':
          if (finalGesture.direction === 'left') {
            handlers.onSwipeLeft?.(finalGesture);
          } else if (finalGesture.direction === 'right') {
            handlers.onSwipeRight?.(finalGesture);
          } else if (finalGesture.direction === 'up') {
            handlers.onSwipeUp?.(finalGesture);
          } else if (finalGesture.direction === 'down') {
            handlers.onSwipeDown?.(finalGesture);
          }
          break;
      }

      handlers.onGestureEnd?.(finalGesture);
    },
    [touchConfig, detectGestureType, handlers]
  );

  // Touch event bindings
  const bind = {
    ref: elementRef,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
    onMouseDown: handleTouchStart,
    onMouseMove: handleTouchMove,
    onMouseUp: handleTouchEnd,
    onMouseLeave: handleTouchEnd,
    style: {
      touchAction: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
    },
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
      }
      doubleTapPrevention.current.reset();
      conflictResolver.current.reset();
    };
  }, []);

  return {
    bind,
    gesture,
    isPressed,
    elementRef,
  };
}

// Simplified tap handler hook
export function useTap(
  onTap: () => void,
  options: {
    enableHaptic?: boolean;
    preventDoubleTap?: boolean;
    tapThreshold?: number;
  } = {}
) {
  const { bind, gesture } = useTouchOptimized(
    {
      onTap: () => onTap(),
    },
    {
      enableHaptic: options.enableHaptic ?? true,
      tapMovementThreshold: options.tapThreshold ?? 10,
    }
  );

  return bind;
}

// Long press hook
export function useLongPress(
  onLongPress: () => void,
  options: {
    delay?: number;
    enableHaptic?: boolean;
  } = {}
) {
  const { bind, gesture } = useTouchOptimized(
    {
      onLongPress: () => onLongPress(),
    },
    {
      longPressDelay: options.delay ?? 500,
      enableHaptic: options.enableHaptic ?? true,
    }
  );

  return bind;
}

// Swipe hook
export function useSwipe(
  handlers: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
  },
  options: {
    threshold?: number;
    velocityThreshold?: number;
    enableHaptic?: boolean;
  } = {}
) {
  const { bind } = useTouchOptimized(
    {
      onSwipeLeft: handlers.onSwipeLeft,
      onSwipeRight: handlers.onSwipeRight,
      onSwipeUp: handlers.onSwipeUp,
      onSwipeDown: handlers.onSwipeDown,
    },
    {
      swipeDistanceThreshold: options.threshold ?? 50,
      swipeVelocityThreshold: options.velocityThreshold ?? 0.3,
      enableHaptic: options.enableHaptic ?? true,
    }
  );

  return bind;
}

// Pinch zoom hook
export function usePinch(
  onPinch: (scale: number) => void,
  options: {
    minScale?: number;
    maxScale?: number;
    enableHaptic?: boolean;
  } = {}
) {
  const [scale, setScale] = useState(1);

  const { bind } = useTouchOptimized(
    {
      onPinch: gesture => {
        const clampedScale = Math.max(
          options.minScale ?? 0.5,
          Math.min(options.maxScale ?? 3, gesture.scale)
        );
        setScale(clampedScale);
        onPinch(clampedScale);
      },
      onGestureEnd: () => {
        setScale(1); // Reset scale
      },
    },
    {
      enableHaptic: options.enableHaptic ?? true,
    }
  );

  return { bind, scale };
}

// Draggable hook
export function useDraggable(
  options: {
    bounds?: { left?: number; right?: number; top?: number; bottom?: number };
    onDrag?: (delta: { x: number; y: number }) => void;
    onDragEnd?: (velocity: { x: number; y: number }) => void;
    enableHaptic?: boolean;
  } = {}
) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const { bind } = useTouchOptimized(
    {
      onPan: gesture => {
        let x = gesture.deltaX;
        let y = gesture.deltaY;

        // Apply bounds
        if (options.bounds) {
          if (options.bounds.left !== undefined) {
            x = Math.max(x, options.bounds.left);
          }
          if (options.bounds.right !== undefined) {
            x = Math.min(x, options.bounds.right);
          }
          if (options.bounds.top !== undefined) {
            y = Math.max(y, options.bounds.top);
          }
          if (options.bounds.bottom !== undefined) {
            y = Math.min(y, options.bounds.bottom);
          }
        }

        setPosition({ x, y });
        setIsDragging(true);
        options.onDrag?.({ x, y });
      },
      onGestureEnd: gesture => {
        setIsDragging(false);
        options.onDragEnd?.({
          x: gesture.velocityX,
          y: gesture.velocityY,
        });
      },
    },
    {
      enableHaptic: options.enableHaptic ?? true,
    }
  );

  return {
    bind,
    position,
    isDragging,
    reset: () => setPosition({ x: 0, y: 0 }),
  };
}

// Force touch hook
export function useForceTouch(
  onForceTouch: (force: number) => void,
  options: {
    threshold?: number;
    enableHaptic?: boolean;
  } = {}
) {
  const [force, setForce] = useState(0);
  const [isSupported] = useState(() => ForceTouchDetector.checkSupport());

  const { bind } = useTouchOptimized(
    {
      onForceTouch: gesture => {
        setForce(gesture.force);
        onForceTouch(gesture.force);
      },
      onGestureEnd: () => {
        setForce(0);
      },
    },
    {
      forceTouchAvailable: isSupported,
      forceTouchThreshold: options.threshold ?? 0.75,
      enableHaptic: options.enableHaptic ?? true,
    }
  );

  return {
    bind,
    force,
    isSupported,
  };
}

// Scroll lock hook
export function useScrollLock(enabled: boolean = true) {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    ScrollLockManager.lock(element);

    return () => {
      ScrollLockManager.unlock(element);
    };
  }, [enabled]);

  return elementRef;
}
