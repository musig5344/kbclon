/**
 * FLIP Animation Components
 * Implements First, Last, Invert, Play technique for smooth layout animations
 */

import React, { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';

import { animationMonitor } from '../../utils/animationPerformance';

// FLIP animation configuration
interface FlipConfig {
  duration?: number;
  easing?: string;
  stagger?: number;
  scale?: boolean;
  opacity?: boolean;
  rotateX?: boolean;
  rotateY?: boolean;
  debug?: boolean;
}

// Element rect with additional properties
interface FlipRect {
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
}

// FLIP animation state
interface FlipState {
  first: FlipRect | null;
  last: FlipRect | null;
  invert: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
  } | null;
  isAnimating: boolean;
}

// Default configuration
const defaultConfig: FlipConfig = {
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  stagger: 0,
  scale: true,
  opacity: false,
  rotateX: false,
  rotateY: false,
  debug: false,
};

// Get element rect with transforms
const getFlipRect = (element: HTMLElement): FlipRect => {
  const rect = element.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(element);
  const opacity = parseFloat(computedStyle.opacity);

  // Parse existing transform to get scale
  const transform = computedStyle.transform;
  let scaleX = 1;
  let scaleY = 1;

  if (transform && transform !== 'none') {
    const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
    if (matrixMatch) {
      const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
      scaleX = Math.sqrt(values[0] * values[0] + values[1] * values[1]);
      scaleY = Math.sqrt(values[2] * values[2] + values[3] * values[3]);
    }
  }

  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    scaleX,
    scaleY,
    opacity,
  };
};

// FLIP hook for single elements
export const useFlip = (config: FlipConfig = {}) => {
  const elementRef = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<FlipState>({
    first: null,
    last: null,
    invert: null,
    isAnimating: false,
  });
  const animationIdRef = useRef<string>('');
  const rafRef = useRef<number>();

  const finalConfig = { ...defaultConfig, ...config };

  // Record first position
  const recordFirst = useCallback(() => {
    if (!elementRef.current) return;

    const first = getFlipRect(elementRef.current);
    setState(prev => ({ ...prev, first }));

    if (finalConfig.debug) {
    }
  }, [finalConfig.debug]);

  // Record last position and calculate invert
  const recordLast = useCallback(() => {
    if (!elementRef.current || !state.first) return;

    const last = getFlipRect(elementRef.current);

    // Calculate invert values
    const invert = {
      x: state.first.x - last.x,
      y: state.first.y - last.y,
      scaleX: state.first.width / last.width,
      scaleY: state.first.height / last.height,
    };

    setState(prev => ({ ...prev, last, invert }));

    if (finalConfig.debug) {
    }

    return { last, invert };
  }, [state.first, finalConfig.debug]);

  // Play animation
  const play = useCallback(() => {
    if (!elementRef.current || !state.invert) return;

    const element = elementRef.current;
    const { x, y, scaleX, scaleY } = state.invert;

    // Start performance monitoring
    animationIdRef.current = `flip-${Date.now()}`;
    animationMonitor.startAnimation(animationIdRef.current);

    setState(prev => ({ ...prev, isAnimating: true }));

    // Apply inverted transform immediately (no transition)
    element.style.transition = 'none';
    element.style.transform = `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY})`;

    // Force reflow
    element.offsetHeight;

    // Enable transition and remove transform
    rafRef.current = requestAnimationFrame(() => {
      element.style.transition = `transform ${finalConfig.duration}ms ${finalConfig.easing}`;

      if (finalConfig.opacity && state.first && state.last) {
        element.style.transition += `, opacity ${finalConfig.duration}ms ${finalConfig.easing}`;
      }

      element.style.transform = '';

      // Handle animation end
      const handleTransitionEnd = () => {
        element.style.transition = '';
        setState(prev => ({ ...prev, isAnimating: false }));

        // End performance monitoring
        const metrics = animationMonitor.endAnimation(animationIdRef.current);
        if (metrics && metrics.averageFps < 55) {
          console.warn('FLIP animation performance below 60fps:', metrics);
        }

        element.removeEventListener('transitionend', handleTransitionEnd);
      };

      element.addEventListener('transitionend', handleTransitionEnd);
    });
  }, [state, finalConfig]);

  // Full FLIP animation
  const flip = useCallback(
    (callback?: () => void) => {
      if (!elementRef.current) return;

      // Record first position
      recordFirst();

      // Execute callback (layout change)
      callback?.();

      // Use layout effect to ensure DOM has updated
      requestAnimationFrame(() => {
        recordLast();
        play();
      });
    },
    [recordFirst, recordLast, play]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    ref: elementRef,
    flip,
    recordFirst,
    recordLast,
    play,
    isAnimating: state.isAnimating,
  };
};

// FLIP group hook for multiple elements
export const useFlipGroup = (config: FlipConfig = {}) => {
  const elementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const firstRectsRef = useRef<Map<string, FlipRect>>(new Map());
  const [isAnimating, setIsAnimating] = useState(false);
  const animationIdRef = useRef<string>('');

  const finalConfig = { ...defaultConfig, ...config };

  // Register element
  const register = useCallback(
    (key: string) => ({
      ref: (element: HTMLElement | null) => {
        if (element) {
          elementsRef.current.set(key, element);
        } else {
          elementsRef.current.delete(key);
        }
      },
    }),
    []
  );

  // Record first positions
  const recordFirst = useCallback(() => {
    firstRectsRef.current.clear();

    elementsRef.current.forEach((element, key) => {
      const rect = getFlipRect(element);
      firstRectsRef.current.set(key, rect);
    });

    if (finalConfig.debug) {
    }
  }, [finalConfig.debug]);

  // Play animations
  const play = useCallback(() => {
    const animations: Array<{ element: HTMLElement; invert: any }> = [];

    // Calculate all inverts
    elementsRef.current.forEach((element, key) => {
      const first = firstRectsRef.current.get(key);
      if (!first) return;

      const last = getFlipRect(element);

      const invert = {
        x: first.x - last.x,
        y: first.y - last.y,
        scaleX: first.width / last.width,
        scaleY: first.height / last.height,
      };

      animations.push({ element, invert });
    });

    if (animations.length === 0) return;

    // Start performance monitoring
    animationIdRef.current = `flip-group-${Date.now()}`;
    animationMonitor.startAnimation(animationIdRef.current);

    setIsAnimating(true);

    // Apply inverted transforms
    animations.forEach(({ element, invert }) => {
      element.style.transition = 'none';
      element.style.transform = `translate(${invert.x}px, ${invert.y}px) scale(${invert.scaleX}, ${invert.scaleY})`;
    });

    // Force reflow
    document.body.offsetHeight;

    // Play animations with stagger
    requestAnimationFrame(() => {
      animations.forEach(({ element }, index) => {
        setTimeout(() => {
          element.style.transition = `transform ${finalConfig.duration}ms ${finalConfig.easing}`;
          element.style.transform = '';
        }, index * finalConfig.stagger!);
      });

      // Handle animation end
      const longestDuration =
        finalConfig.duration! + (animations.length - 1) * finalConfig.stagger!;
      setTimeout(() => {
        animations.forEach(({ element }) => {
          element.style.transition = '';
        });

        setIsAnimating(false);

        // End performance monitoring
        const metrics = animationMonitor.endAnimation(animationIdRef.current);
        if (metrics && metrics.averageFps < 55) {
          console.warn('FLIP group animation performance below 60fps:', metrics);
        }
      }, longestDuration);
    });
  }, [finalConfig]);

  // Full FLIP animation
  const flip = useCallback(
    (callback?: () => void) => {
      recordFirst();
      callback?.();
      requestAnimationFrame(play);
    },
    [recordFirst, play]
  );

  return {
    register,
    flip,
    recordFirst,
    play,
    isAnimating,
  };
};

// FLIP component wrapper
interface FlipProps {
  children: React.ReactElement;
  flipKey: string | number;
  config?: FlipConfig;
}

export const Flip: React.FC<FlipProps> = ({ children, flipKey, config }) => {
  const { ref, flip } = useFlip(config);
  const prevKeyRef = useRef(flipKey);

  useLayoutEffect(() => {
    if (prevKeyRef.current !== flipKey) {
      flip();
      prevKeyRef.current = flipKey;
    }
  }, [flipKey, flip]);

  return React.cloneElement(children, { ref });
};

// FLIP group component
interface FlipGroupProps {
  children: React.ReactNode;
  flipKey: string | number;
  config?: FlipConfig;
}

export const FlipGroup: React.FC<FlipGroupProps> = ({ children, flipKey, config }) => {
  const { register, flip, isAnimating } = useFlipGroup(config);
  const prevKeyRef = useRef(flipKey);

  useLayoutEffect(() => {
    if (prevKeyRef.current !== flipKey) {
      flip();
      prevKeyRef.current = flipKey;
    }
  }, [flipKey, flip]);

  return (
    <>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        const key = child.key || index;
        return React.cloneElement(child, {
          ...register(String(key)),
          'data-flip-key': key,
        });
      })}
    </>
  );
};

// Auto-animate hook for automatic FLIP animations
export const useAutoAnimate = (config: FlipConfig = {}) => {
  const { ref, flip } = useFlip(config);
  const mutationObserverRef = useRef<MutationObserver>();

  useEffect(() => {
    if (!ref.current) return;

    // Create mutation observer
    mutationObserverRef.current = new MutationObserver(mutations => {
      // Check if mutations affect layout
      const hasLayoutChange = mutations.some(
        mutation =>
          mutation.type === 'childList' ||
          (mutation.type === 'attributes' &&
            (mutation.attributeName === 'class' || mutation.attributeName === 'style'))
      );

      if (hasLayoutChange) {
        flip();
      }
    });

    // Start observing
    mutationObserverRef.current.observe(ref.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => {
      mutationObserverRef.current?.disconnect();
    };
  }, [ref, flip]);

  return ref;
};

// Shared element transition hook
interface SharedElementConfig extends FlipConfig {
  exitDuration?: number;
}

export const useSharedElementTransition = (config: SharedElementConfig = {}) => {
  const sharedElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const clonesRef = useRef<Map<string, HTMLElement>>(new Map());

  const registerSharedElement = useCallback(
    (id: string) => ({
      ref: (element: HTMLElement | null) => {
        if (element) {
          sharedElementsRef.current.set(id, element);
        } else {
          sharedElementsRef.current.delete(id);
        }
      },
    }),
    []
  );

  const transition = useCallback(
    (fromId: string, toId: string) => {
      const fromElement = sharedElementsRef.current.get(fromId);
      const toElement = sharedElementsRef.current.get(toId);

      if (!fromElement || !toElement) return;

      // Get positions
      const fromRect = fromElement.getBoundingClientRect();
      const toRect = toElement.getBoundingClientRect();

      // Create clone
      const clone = fromElement.cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      clone.style.left = `${fromRect.left}px`;
      clone.style.top = `${fromRect.top}px`;
      clone.style.width = `${fromRect.width}px`;
      clone.style.height = `${fromRect.height}px`;
      clone.style.margin = '0';
      clone.style.zIndex = '9999';
      clone.style.pointerEvents = 'none';
      clone.style.transition = `all ${config.duration || 300}ms ${config.easing || 'cubic-bezier(0.4, 0, 0.2, 1)'}`;

      document.body.appendChild(clone);

      // Hide original elements
      fromElement.style.opacity = '0';
      toElement.style.opacity = '0';

      // Animate clone to target position
      requestAnimationFrame(() => {
        clone.style.left = `${toRect.left}px`;
        clone.style.top = `${toRect.top}px`;
        clone.style.width = `${toRect.width}px`;
        clone.style.height = `${toRect.height}px`;

        // Clean up after animation
        setTimeout(() => {
          clone.remove();
          fromElement.style.opacity = '';
          toElement.style.opacity = '';
        }, config.duration || 300);
      });
    },
    [config]
  );

  return {
    registerSharedElement,
    transition,
  };
};

export default {
  useFlip,
  useFlipGroup,
  useAutoAnimate,
  useSharedElementTransition,
  Flip,
  FlipGroup,
};
