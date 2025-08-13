/**
 * Touch optimization utilities for improved mobile responsiveness
 */

import { useEffect, useRef, useCallback } from 'react';

// Touch event types
export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
  identifier: number;
}

export interface TouchGesture {
  type: 'tap' | 'longPress' | 'swipe' | 'doubleTap' | 'pinch' | 'rotate';
  startPoint: TouchPoint;
  endPoint?: TouchPoint;
  duration: number;
  velocity?: { x: number; y: number };
  distance?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  scale?: number;
  rotation?: number;
}

// Touch constants
export const TOUCH_CONSTANTS = {
  TAP_DELAY: 100, // ms - Maximum delay for tap
  LONG_PRESS_DELAY: 500, // ms - Minimum delay for long press
  DOUBLE_TAP_DELAY: 300, // ms - Maximum delay between taps
  SWIPE_THRESHOLD: 50, // px - Minimum distance for swipe
  SWIPE_VELOCITY_THRESHOLD: 0.3, // px/ms - Minimum velocity for swipe
  TOUCH_SLOP: 10, // px - Movement tolerance
  MIN_TOUCH_TARGET: 44, // px - Minimum touch target size (WCAG)
  RIPPLE_DURATION: 600, // ms - Ripple animation duration
  HAPTIC_DURATION: 10, // ms - Haptic feedback duration
};

// Haptic feedback utility
export const hapticFeedback = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(TOUCH_CONSTANTS.HAPTIC_DURATION);
    }
  },
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(TOUCH_CONSTANTS.HAPTIC_DURATION * 2);
    }
  },
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(TOUCH_CONSTANTS.HAPTIC_DURATION * 3);
    }
  },
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 10, 10]);
    }
  },
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([20, 10, 20, 10, 20]);
    }
  },
};

// Touch event normalization
export const normalizeTouch = (
  event: TouchEvent | MouseEvent
): TouchPoint => {
  let x: number, y: number, identifier: number;

  if ('touches' in event && event.touches.length > 0) {
    const touch = event.touches[0];
    x = touch.clientX;
    y = touch.clientY;
    identifier = touch.identifier;
  } else if ('changedTouches' in event && event.changedTouches.length > 0) {
    const touch = event.changedTouches[0];
    x = touch.clientX;
    y = touch.clientY;
    identifier = touch.identifier;
  } else {
    x = (event as MouseEvent).clientX;
    y = (event as MouseEvent).clientY;
    identifier = 0;
  }

  return {
    x,
    y,
    timestamp: Date.now(),
    identifier,
  };
};

// Calculate touch velocity
export const calculateVelocity = (
  start: TouchPoint,
  end: TouchPoint
): { x: number; y: number; magnitude: number } => {
  const deltaTime = end.timestamp - start.timestamp;
  if (deltaTime === 0) {
    return { x: 0, y: 0, magnitude: 0 };
  }

  const velocityX = (end.x - start.x) / deltaTime;
  const velocityY = (end.y - start.y) / deltaTime;
  const magnitude = Math.sqrt(velocityX ** 2 + velocityY ** 2);

  return { x: velocityX, y: velocityY, magnitude };
};

// Calculate touch distance
export const calculateDistance = (
  start: TouchPoint,
  end: TouchPoint
): number => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return Math.sqrt(dx ** 2 + dy ** 2);
};

// Determine swipe direction
export const getSwipeDirection = (
  start: TouchPoint,
  end: TouchPoint
): 'up' | 'down' | 'left' | 'right' | null => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (absDx < TOUCH_CONSTANTS.SWIPE_THRESHOLD && absDy < TOUCH_CONSTANTS.SWIPE_THRESHOLD) {
    return null;
  }

  if (absDx > absDy) {
    return dx > 0 ? 'right' : 'left';
  } else {
    return dy > 0 ? 'down' : 'up';
  }
};

// Touch area expansion for small targets
export const expandTouchArea = (
  element: HTMLElement,
  expansion: number = 10
): void => {
  const rect = element.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  // Only expand if below minimum touch target size
  if (width < TOUCH_CONSTANTS.MIN_TOUCH_TARGET || height < TOUCH_CONSTANTS.MIN_TOUCH_TARGET) {
    element.style.position = 'relative';
    
    // Create invisible expanded touch area
    const touchArea = document.createElement('div');
    touchArea.style.position = 'absolute';
    touchArea.style.top = `-${expansion}px`;
    touchArea.style.right = `-${expansion}px`;
    touchArea.style.bottom = `-${expansion}px`;
    touchArea.style.left = `-${expansion}px`;
    touchArea.style.zIndex = '1';
    
    // Forward touch events to the original element
    touchArea.addEventListener('touchstart', (e) => {
      element.dispatchEvent(new TouchEvent('touchstart', e));
    });
    touchArea.addEventListener('touchend', (e) => {
      element.dispatchEvent(new TouchEvent('touchend', e));
    });
    
    element.appendChild(touchArea);
  }
};

// Prevent ghost clicks (click events fired after touch)
export const preventGhostClick = (element: HTMLElement): void => {
  let lastTouchTime = 0;

  element.addEventListener('touchend', () => {
    lastTouchTime = Date.now();
  });

  element.addEventListener('click', (e) => {
    const timeSinceTouch = Date.now() - lastTouchTime;
    if (timeSinceTouch < 500) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
};

// Touch event debouncing
export const useTouchDebounce = (
  callback: (gesture: TouchGesture) => void,
  delay: number = TOUCH_CONSTANTS.TAP_DELAY
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((gesture: TouchGesture) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(gesture);
    }, delay);
  }, [delay]);
};

// Scroll lock during gestures
export const useScrollLock = () => {
  const scrollPositionRef = useRef({ x: 0, y: 0 });
  const isLockedRef = useRef(false);

  const lock = useCallback(() => {
    if (isLockedRef.current) return;

    scrollPositionRef.current = {
      x: window.scrollX,
      y: window.scrollY,
    };

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPositionRef.current.y}px`;
    document.body.style.left = `-${scrollPositionRef.current.x}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    
    isLockedRef.current = true;
  }, []);

  const unlock = useCallback(() => {
    if (!isLockedRef.current) return;

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.width = '';
    document.body.style.overflow = '';

    window.scrollTo(scrollPositionRef.current.x, scrollPositionRef.current.y);
    
    isLockedRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      if (isLockedRef.current) {
        unlock();
      }
    };
  }, [unlock]);

  return { lock, unlock };
};

// Touch pressure detection (3D Touch / Force Touch)
export interface TouchPressure {
  force: number;
  maxForce: number;
  percentage: number;
}

export const getTouchPressure = (event: TouchEvent): TouchPressure | null => {
  if (!('force' in Touch.prototype)) {
    return null;
  }

  const touch = event.touches[0];
  if (!touch || !('force' in touch)) {
    return null;
  }

  return {
    force: touch.force,
    maxForce: touch.radiusX || 1,
    percentage: touch.force / (touch.radiusX || 1),
  };
};

// Multi-touch gesture detection
export const detectMultiTouchGesture = (
  touches: TouchList
): { type: 'pinch' | 'rotate' | null; value?: number } => {
  if (touches.length !== 2) {
    return { type: null };
  }

  const touch1 = touches[0];
  const touch2 = touches[1];

  // Calculate distance between touches
  const distance = Math.sqrt(
    Math.pow(touch2.clientX - touch1.clientX, 2) +
    Math.pow(touch2.clientY - touch1.clientY, 2)
  );

  // Calculate angle between touches
  const angle = Math.atan2(
    touch2.clientY - touch1.clientY,
    touch2.clientX - touch1.clientX
  );

  return {
    type: 'pinch',
    value: distance,
  };
};

// iOS bounce scroll fix
export const preventIOSBounce = (element: HTMLElement): void => {
  let startY = 0;

  element.addEventListener('touchstart', (e) => {
    startY = e.touches[0].pageY;
  }, { passive: false });

  element.addEventListener('touchmove', (e) => {
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const height = element.clientHeight;
    const deltaY = e.touches[0].pageY - startY;
    const isScrollingUp = deltaY > 0;
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollTop + height >= scrollHeight;

    if ((isScrollingUp && isAtTop) || (!isScrollingUp && isAtBottom)) {
      e.preventDefault();
    }
  }, { passive: false });
};

// Touch target size validator
export const validateTouchTarget = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return rect.width >= TOUCH_CONSTANTS.MIN_TOUCH_TARGET && 
         rect.height >= TOUCH_CONSTANTS.MIN_TOUCH_TARGET;
};

// Fast click implementation (removes 300ms delay)
export const useFastClick = (
  onClick: (e: TouchEvent | MouseEvent) => void,
  options: { preventDoubleTap?: boolean } = {}
) => {
  const touchStartRef = useRef<TouchPoint | null>(null);
  const lastTapRef = useRef<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartRef.current = normalizeTouch(e);
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touchEnd = normalizeTouch(e);
    const distance = calculateDistance(touchStartRef.current, touchEnd);

    if (distance < TOUCH_CONSTANTS.TOUCH_SLOP) {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;

      if (options.preventDoubleTap && timeSinceLastTap < TOUCH_CONSTANTS.DOUBLE_TAP_DELAY) {
        e.preventDefault();
        return;
      }

      onClick(e);
      lastTapRef.current = now;
    }

    touchStartRef.current = null;
  }, [onClick, options.preventDoubleTap]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onMouseDown: (e: MouseEvent) => {
      // Fallback for non-touch devices
      if (!('ontouchstart' in window)) {
        onClick(e);
      }
    },
  };
};