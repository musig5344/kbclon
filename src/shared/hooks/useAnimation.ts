/**
 * Reusable Animation Hooks
 * Common animation patterns optimized for 60fps performance
 */

import { useEffect, useRef, useState, useCallback } from 'react';

import { animationMonitor, performanceHelpers } from '../utils/animationPerformance';

// Animation state
interface AnimationState {
  isAnimating: boolean;
  progress: number;
  value: number;
}

// Easing functions
export const easings = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - --t * t * t * t,
  easeInOutQuart: (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),
  easeInQuint: (t: number) => t * t * t * t * t,
  easeOutQuint: (t: number) => 1 + --t * t * t * t * t,
  easeInOutQuint: (t: number) => (t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t),
  easeInSine: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t: number) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInExpo: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t: number) => {
    if (t === 0 || t === 1) return t;
    return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  easeInCirc: (t: number) => 1 - Math.sqrt(1 - t * t),
  easeOutCirc: (t: number) => Math.sqrt(1 - --t * t),
  easeInOutCirc: (t: number) =>
    t < 0.5
      ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
      : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2,
  easeInBack: (t: number) => 2.70158 * t * t * t - 1.70158 * t * t,
  easeOutBack: (t: number) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
  easeInOutBack: (t: number) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  elasticOut: (t: number) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1;
  },
  bounceOut: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
};

// Base animation hook
interface UseAnimationOptions {
  duration?: number;
  easing?: keyof typeof easings | ((t: number) => number);
  delay?: number;
  onComplete?: () => void;
  onUpdate?: (value: number) => void;
  disabled?: boolean;
}

export const useAnimation = (
  from: number,
  to: number,
  options: UseAnimationOptions = {}
): AnimationState & { start: () => void; stop: () => void; reset: () => void } => {
  const {
    duration = 300,
    easing = 'easeInOut',
    delay = 0,
    onComplete,
    onUpdate,
    disabled = false,
  } = options;

  const [state, setState] = useState<AnimationState>({
    isAnimating: false,
    progress: 0,
    value: from,
  });

  const rafRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const animationIdRef = useRef<string>('');

  const easingFn = typeof easing === 'function' ? easing : easings[easing];

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp + delay;
      }

      const elapsed = timestamp - startTimeRef.current;

      if (elapsed < 0) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(progress);
      const value = from + (to - from) * easedProgress;

      setState({
        isAnimating: progress < 1,
        progress,
        value,
      });

      onUpdate?.(value);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        const metrics = animationMonitor.endAnimation(animationIdRef.current);
        if (metrics && metrics.averageFps < 55) {
          console.warn('Animation performance below 60fps:', metrics);
        }
        onComplete?.();
      }
    },
    [from, to, duration, delay, easingFn, onUpdate, onComplete]
  );

  const start = useCallback(() => {
    if (disabled || performanceHelpers.prefersReducedMotion()) {
      setState({
        isAnimating: false,
        progress: 1,
        value: to,
      });
      onComplete?.();
      return;
    }

    // Cancel any existing animation
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Start performance monitoring
    animationIdRef.current = `animation-${Date.now()}`;
    animationMonitor.startAnimation(animationIdRef.current);

    // Reset and start
    startTimeRef.current = 0;
    setState({
      isAnimating: true,
      progress: 0,
      value: from,
    });

    rafRef.current = requestAnimationFrame(animate);
  }, [from, to, disabled, animate, onComplete]);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
    setState(prev => ({ ...prev, isAnimating: false }));
  }, []);

  const reset = useCallback(() => {
    stop();
    setState({
      isAnimating: false,
      progress: 0,
      value: from,
    });
  }, [from, stop]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { ...state, start, stop, reset };
};

// Scroll-triggered animation hook
interface UseScrollAnimationOptions extends UseAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useScrollAnimation = (
  ref: React.RefObject<HTMLElement>,
  options: UseScrollAnimationOptions = {}
) => {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true, ...animationOptions } = options;

  const [isVisible, setIsVisible] = useState(false);
  const hasTriggeredRef = useRef(false);
  const animation = useAnimation(0, 1, animationOptions);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const shouldTrigger = entry.isIntersecting && (!triggerOnce || !hasTriggeredRef.current);

        if (shouldTrigger) {
          setIsVisible(true);
          hasTriggeredRef.current = true;
          animation.start();
        } else if (!triggerOnce && !entry.isIntersecting) {
          setIsVisible(false);
          animation.reset();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, threshold, rootMargin, triggerOnce, animation]);

  return {
    ...animation,
    isVisible,
  };
};

// Parallax animation hook
interface UseParallaxOptions {
  speed?: number;
  offset?: number;
  disabled?: boolean;
}

export const useParallax = (
  ref: React.RefObject<HTMLElement>,
  options: UseParallaxOptions = {}
) => {
  const { speed = 0.5, offset = 0, disabled = false } = options;

  const [translateY, setTranslateY] = useState(0);
  const rafRef = useRef<number>();
  const lastScrollRef = useRef(0);

  const updateParallax = useCallback(() => {
    if (!ref.current || disabled) return;

    const rect = ref.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    // Calculate if element is in viewport
    const elementTop = rect.top + scrollY;
    const elementBottom = elementTop + rect.height;
    const viewportTop = scrollY;
    const viewportBottom = scrollY + windowHeight;

    if (elementBottom > viewportTop && elementTop < viewportBottom) {
      // Element is in viewport
      const relativeScroll = scrollY - elementTop + windowHeight;
      const parallaxOffset = relativeScroll * speed + offset;

      setTranslateY(parallaxOffset);
    }
  }, [ref, speed, offset, disabled]);

  const handleScroll = useCallback(() => {
    if (performanceHelpers.prefersReducedMotion()) return;

    // Throttle scroll updates using RAF
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        updateParallax();
        rafRef.current = undefined;
      });
    }
  }, [updateParallax]);

  useEffect(() => {
    if (disabled) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateParallax);

    // Initial calculation
    updateParallax();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateParallax);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [disabled, handleScroll, updateParallax]);

  return {
    translateY,
    style: {
      transform: `translateY(${translateY}px)`,
      willChange: 'transform',
    },
  };
};

// Stagger animation hook
interface UseStaggerOptions extends UseAnimationOptions {
  staggerDelay?: number;
  staggerFrom?: 'start' | 'end' | 'center' | 'random';
}

export const useStagger = (count: number, options: UseStaggerOptions = {}) => {
  const { staggerDelay = 50, staggerFrom = 'start', ...animationOptions } = options;

  const [animations, setAnimations] = useState<AnimationState[]>(
    Array(count)
      .fill(null)
      .map(() => ({
        isAnimating: false,
        progress: 0,
        value: 0,
      }))
  );

  const getStaggerIndex = useCallback(
    (index: number): number => {
      switch (staggerFrom) {
        case 'end':
          return count - 1 - index;
        case 'center':
          return Math.abs(index - Math.floor(count / 2));
        case 'random':
          return Math.floor(Math.random() * count);
        default:
          return index;
      }
    },
    [count, staggerFrom]
  );

  const start = useCallback(() => {
    animations.forEach((_, index) => {
      const staggerIndex = getStaggerIndex(index);
      const delay = staggerIndex * staggerDelay;

      setTimeout(() => {
        const animation = useAnimation(0, 1, {
          ...animationOptions,
          onUpdate: value => {
            setAnimations(prev => {
              const newAnimations = [...prev];
              newAnimations[index] = {
                isAnimating: value < 1,
                progress: value,
                value,
              };
              return newAnimations;
            });
          },
        });

        animation.start();
      }, delay);
    });
  }, [animations, staggerDelay, getStaggerIndex, animationOptions]);

  return {
    animations,
    start,
  };
};

// Count animation hook
interface UseCountOptions extends Omit<UseAnimationOptions, 'onUpdate'> {
  decimals?: number;
  separator?: string;
  prefix?: string;
  suffix?: string;
}

export const useCount = (from: number, to: number, options: UseCountOptions = {}) => {
  const { decimals = 0, separator = ',', prefix = '', suffix = '', ...animationOptions } = options;

  const [displayValue, setDisplayValue] = useState(
    formatNumber(from, decimals, separator, prefix, suffix)
  );

  const animation = useAnimation(from, to, {
    ...animationOptions,
    onUpdate: value => {
      setDisplayValue(formatNumber(value, decimals, separator, prefix, suffix));
    },
  });

  return {
    ...animation,
    displayValue,
  };
};

// Helper function to format numbers
function formatNumber(
  value: number,
  decimals: number,
  separator: string,
  prefix: string,
  suffix: string
): string {
  const fixed = value.toFixed(decimals);
  const parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return `${prefix}${parts.join('.')}${suffix}`;
}

// Typewriter animation hook
interface UseTypewriterOptions {
  speed?: number;
  delay?: number;
  loop?: boolean;
  cursor?: boolean;
  cursorChar?: string;
  onComplete?: () => void;
}

export const useTypewriter = (text: string, options: UseTypewriterOptions = {}) => {
  const {
    speed = 50,
    delay = 0,
    loop = false,
    cursor = true,
    cursorChar = '|',
    onComplete,
  } = options;

  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(cursor);
  const indexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const type = useCallback(() => {
    if (indexRef.current < text.length) {
      setDisplayText(text.slice(0, indexRef.current + 1));
      indexRef.current++;

      timeoutRef.current = setTimeout(type, speed);
    } else {
      setIsTyping(false);
      onComplete?.();

      if (loop) {
        timeoutRef.current = setTimeout(() => {
          indexRef.current = 0;
          setDisplayText('');
          start();
        }, 1000);
      }
    }
  }, [text, speed, loop, onComplete]);

  const start = useCallback(() => {
    setIsTyping(true);
    timeoutRef.current = setTimeout(type, delay);
  }, [type, delay]);

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsTyping(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    indexRef.current = 0;
    setDisplayText('');
  }, [stop]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Cursor blink effect
  useEffect(() => {
    if (!cursor || !showCursor) return;

    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, [cursor, showCursor]);

  return {
    displayText: displayText + (cursor && showCursor ? cursorChar : ''),
    isTyping,
    start,
    stop,
    reset,
  };
};

export default {
  useAnimation,
  useScrollAnimation,
  useParallax,
  useStagger,
  useCount,
  useTypewriter,
  easings,
};
