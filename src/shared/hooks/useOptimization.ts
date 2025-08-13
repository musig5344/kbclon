/**
 * React 성능 최적화 훅 모음
 * - 불필요한 리렌더링 방지
 * - 메모이제이션 최적화
 * - 디바운스/쓰로틀 처리
 */

import { 
  useCallback, 
  useEffect, 
  useRef, 
  useState, 
  useMemo,
  DependencyList 
} from 'react';

/**
 * 안정적인 콜백 생성 (의존성 변경 시에도 참조 유지)
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });
  
  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as T;
}

/**
 * 디바운스된 값 반환
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * 디바운스된 콜백
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay, ...deps]) as T;
}

/**
 * 쓰로틀된 콜백
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: DependencyList = []
): T {
  const lastCallRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useCallback((...args: any[]) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallRef.current;
    
    if (timeSinceLastCall >= delay) {
      lastCallRef.current = now;
      callbackRef.current(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        callbackRef.current(...args);
      }, delay - timeSinceLastCall);
    }
  }, [delay, ...deps]) as T;
}

/**
 * 이전 값 추적
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

/**
 * 컴포넌트 마운트 상태 추적
 */
export function useIsMounted(): () => boolean {
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  return useCallback(() => isMountedRef.current, []);
}

/**
 * 깊은 비교 메모이제이션
 */
export function useDeepCompareMemo<T>(
  factory: () => T,
  deps: DependencyList
): T {
  const ref = useRef<{ deps: DependencyList; value: T }>();
  
  if (!ref.current || !deepEqual(deps, ref.current.deps)) {
    ref.current = { deps, value: factory() };
  }
  
  return ref.current.value;
}

/**
 * 깊은 비교 이펙트
 */
export function useDeepCompareEffect(
  effect: React.EffectCallback,
  deps: DependencyList
): void {
  const ref = useRef<DependencyList>();
  const signalRef = useRef(0);
  
  if (!deepEqual(deps, ref.current)) {
    ref.current = deps;
    signalRef.current += 1;
  }
  
  useEffect(effect, [signalRef.current]);
}

/**
 * 지연 로딩 상태 관리
 */
export function useLazyLoad<T>(
  loader: () => Promise<T>,
  delay: number = 0
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  load: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useIsMounted();
  
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const result = await loader();
      
      if (isMounted()) {
        setData(result);
      }
    } catch (err) {
      if (isMounted()) {
        setError(err as Error);
      }
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, [loader, delay, isMounted]);
  
  return { data, loading, error, load };
}

/**
 * 무한 스크롤 훅
 */
export function useInfiniteScroll(
  callback: () => void,
  options?: {
    threshold?: number;
    rootMargin?: string;
    enabled?: boolean;
  }
) {
  const { threshold = 0.1, rootMargin = '100px', enabled = true } = options || {};
  const observerRef = useRef<IntersectionObserver>();
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  const targetRef = useCallback((node: HTMLElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    if (!enabled || !node) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callbackRef.current();
        }
      },
      { threshold, rootMargin }
    );
    
    observerRef.current.observe(node);
  }, [enabled, threshold, rootMargin]);
  
  return targetRef;
}

/**
 * 로컬 스토리지 상태 관리
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  }, [key]);
  
  return [storedValue, setValue];
}

/**
 * 윈도우 사이즈 추적
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  const handleResize = useThrottledCallback(() => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, 200);
  
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);
  
  return size;
}

// 유틸리티 함수
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  
  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) {
    return a === b;
  }
  
  if (a === null || a === undefined || b === null || b === undefined) {
    return false;
  }
  
  if (a.prototype !== b.prototype) return false;
  
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  
  return keys.every(k => deepEqual(a[k], b[k]));
}

// 컴포넌트 최적화 HOC
export function withOptimization<P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
): React.ComponentType<P> {
  return React.memo(Component, propsAreEqual);
}

// 성능 모니터링 훅
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const renderStartTime = useRef<number>();
  
  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;
    
    return () => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        if (renderTime > 16.67) { // 60fps = 16.67ms per frame
          console.warn(
            `[Performance] ${componentName} slow render: ${renderTime.toFixed(2)}ms (render #${renderCount.current})`
          );
        }
      }
    };
  });
  
  return {
    renderCount: renderCount.current,
    measureTime: (label: string, fn: () => void) => {
      const start = performance.now();
      fn();
      const duration = performance.now() - start;
      if (duration > 10) {
        console.warn(`[Performance] ${componentName}.${label}: ${duration.toFixed(2)}ms`);
      }
    }
  };
}