import { useCallback, useMemo, useRef, DependencyList } from 'react';

/**
 * 고급 메모이제이션 훅들
 */

/**
 * 깊은 비교 기반 useMemo
 * 객체나 배열의 깊은 변화를 감지하여 메모이제이션
 */
export function useDeepMemo<T>(
  factory: () => T,
  deps: DependencyList
): T {
  const ref = useRef<{ deps: DependencyList; value: T }>();
  
  const hasChanged = useMemo(() => {
    if (!ref.current) return true;
    
    return !deepEqual(ref.current.deps, deps);
  }, deps);
  
  if (hasChanged) {
    const value = factory();
    ref.current = { deps: [...deps], value };
    return value;
  }
  
  return ref.current.value;
}

/**
 * 조건부 메모이제이션
 * 조건이 true일 때만 값을 재계산
 */
export function useConditionalMemo<T>(
  factory: () => T,
  condition: boolean,
  fallback: T
): T {
  const memoizedValue = useMemo(() => {
    return condition ? factory() : fallback;
  }, [condition, factory, fallback]);
  
  return memoizedValue;
}

/**
 * 배치 메모이제이션
 * 여러 계산을 한 번에 메모이제이션
 */
export function useBatchMemo<T extends Record<string, any>>(
  factories: { [K in keyof T]: () => T[K] },
  deps: DependencyList
): T {
  return useMemo(() => {
    const result = {} as T;
    
    Object.keys(factories).forEach(key => {
      result[key as keyof T] = factories[key as keyof T]();
    });
    
    return result;
  }, deps);
}

/**
 * 지연 계산 메모이제이션
 * 실제로 값이 필요할 때까지 계산을 지연
 */
export function useLazyMemo<T>(factory: () => T, deps: DependencyList): () => T {
  const ref = useRef<{ deps: DependencyList; value: T; computed: boolean }>();
  
  return useCallback(() => {
    const hasChanged = !ref.current || !deepEqual(ref.current.deps, deps);
    
    if (hasChanged || !ref.current.computed) {
      const value = factory();
      ref.current = { deps: [...deps], value, computed: true };
      return value;
    }
    
    return ref.current.value;
  }, deps);
}

/**
 * 성능 모니터링이 포함된 메모이제이션
 */
export function usePerformanceMemo<T>(
  factory: () => T,
  deps: DependencyList,
  label?: string
): T {
  return useMemo(() => {
    const startTime = performance.now();
    const result = factory();
    const endTime = performance.now();
    
    if (process.env.NODE_ENV === 'development' && label) {
      console.log(`${label} 계산 시간: ${(endTime - startTime).toFixed(2)}ms`);
    }
    
    return result;
  }, deps);
}

/**
 * 최적화된 useCallback - 의존성 안정화
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T {
  const callbackRef = useRef<T>();
  const depsRef = useRef<DependencyList>();
  
  const hasChanged = !depsRef.current || !shallowEqual(depsRef.current, deps);
  
  if (hasChanged) {
    callbackRef.current = callback;
    depsRef.current = deps;
  }
  
  return useCallback(
    ((...args: any[]) => callbackRef.current?.(...args)) as T,
    []
  );
}

/**
 * 이벤트 핸들러 최적화
 * 자주 변경되는 이벤트 핸들러를 안정화
 */
export function useEventHandler<T extends (...args: any[]) => any>(
  handler: T
): T {
  const handlerRef = useRef<T>(handler);
  
  // 항상 최신 핸들러를 참조하도록 업데이트
  handlerRef.current = handler;
  
  // 안정된 참조 반환
  const stableHandler = useCallback(
    ((...args: any[]) => handlerRef.current(...args)) as T,
    []
  );
  
  return stableHandler;
}

/**
 * 배치 상태 업데이트 최적화
 */
export function useBatchedUpdates() {
  const pendingUpdates = useRef<Array<() => void>>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const batchUpdate = useCallback((update: () => void) => {
    pendingUpdates.current.push(update);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const updates = [...pendingUpdates.current];
      pendingUpdates.current = [];
      
      // React의 unstable_batchedUpdates 사용 (또는 자동 배칭)
      updates.forEach(update => update());
      
      timeoutRef.current = null;
    }, 0);
  }, []);
  
  return batchUpdate;
}

/**
 * 메모이제이션된 컴포넌트 팩토리
 */
export function useMemoizedComponent<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  props: P,
  deps: DependencyList
): React.ReactElement {
  return useMemo(
    () => <Component {...props} />,
    deps
  );
}

// 유틸리티 함수들
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a == null || b == null) return false;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return a === b;
  
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
}

function shallowEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  
  return true;
}

/**
 * 커스텀 훅 성능 모니터링
 */
export function useHookPerformance(hookName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());
  
  renderCount.current++;
  
  if (process.env.NODE_ENV === 'development') {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    if (renderCount.current % 100 === 0) {
      console.log(`${hookName} - 렌더링 횟수: ${renderCount.current}, 평균 시간: ${renderTime.toFixed(2)}ms`);
    }
  }
  
  startTime.current = performance.now();
  
  return {
    renderCount: renderCount.current,
    recordMetric: (metricName: string, value: number) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`${hookName}.${metricName}: ${value}`);
      }
    }
  };
}