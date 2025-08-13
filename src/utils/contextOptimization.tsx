import React, { 
  createContext, 
  useContext, 
  useRef, 
  useMemo, 
  useCallback,
  ReactNode,
  Context
} from 'react';

/**
 * Context 최적화 유틸리티
 */

/**
 * 분할된 Context 생성 함수
 * 큰 Context를 작은 단위로 분할하여 불필요한 리렌더링 방지
 */
export function createSplitContext<T extends Record<string, any>>() {
  const contexts: { [K in keyof T]?: Context<T[K]> } = {};
  const providers: { [K in keyof T]?: React.FC<{ value: T[K]; children: ReactNode }> } = {};
  const hooks: { [K in keyof T]?: () => T[K] } = {};

  const createContextSlice = <K extends keyof T>(key: K) => {
    if (!contexts[key]) {
      contexts[key] = createContext<T[K]>(undefined as any);
      
      providers[key] = ({ value, children }) => {
        const Provider = contexts[key]!.Provider;
        return <Provider value={value}>{children}</Provider>;
      };
      
      hooks[key] = () => {
        const context = useContext(contexts[key]!);
        if (context === undefined) {
          throw new Error(`use${String(key)} must be used within ${String(key)}Provider`);
        }
        return context;
      };
    }
    
    return {
      Provider: providers[key]!,
      useValue: hooks[key]!
    };
  };

  return { createContextSlice };
}

/**
 * 선택적 Context Hook
 * Context의 특정 부분만 구독하여 성능 최적화
 */
export function createSelectorContext<T>(defaultValue: T) {
  const Context = createContext<{
    state: T;
    subscribe: (listener: () => void) => () => void;
    getSnapshot: <K extends keyof T>(selector: (state: T) => T[K]) => T[K];
  } | null>(null);

  const Provider: React.FC<{ value: T; children: ReactNode }> = ({ value, children }) => {
    const listenersRef = useRef<Set<() => void>>(new Set());
    const stateRef = useRef(value);
    
    // 상태 업데이트 시 리스너들에게 알림
    if (stateRef.current !== value) {
      stateRef.current = value;
      listenersRef.current.forEach(listener => listener());
    }

    const contextValue = useMemo(() => ({
      state: value,
      subscribe: (listener: () => void) => {
        listenersRef.current.add(listener);
        return () => listenersRef.current.delete(listener);
      },
      getSnapshot: <K extends keyof T>(selector: (state: T) => T[K]) => {
        return selector(stateRef.current);
      }
    }), [value]);

    return (
      <Context.Provider value={contextValue}>
        {children}
      </Context.Provider>
    );
  };

  const useSelector = <R,>(selector: (state: T) => R): R => {
    const context = useContext(Context);
    if (!context) {
      throw new Error('useSelector must be used within SelectorProvider');
    }

    const { state, subscribe } = context;
    const selectorRef = useRef(selector);
    const selectedValueRef = useRef<R>();
    
    // 선택된 값 초기화
    if (selectedValueRef.current === undefined) {
      selectedValueRef.current = selector(state);
    }
    
    // 선택자 업데이트
    selectorRef.current = selector;

    // 상태 변화 구독
    React.useEffect(() => {
      return subscribe(() => {
        const newSelectedValue = selectorRef.current(state);
        if (newSelectedValue !== selectedValueRef.current) {
          selectedValueRef.current = newSelectedValue;
          // 강제 리렌더링
          React.startTransition(() => {
            // 리렌더링 트리거
          });
        }
      });
    }, [state, subscribe]);

    return selectedValueRef.current!;
  };

  return { Provider, useSelector };
}

/**
 * 메모이제이션된 Context Provider
 */
export function createMemoizedProvider<T>(
  Context: React.Context<T>,
  equalityFn?: (prev: T, next: T) => boolean
) {
  const defaultEqualityFn = (prev: T, next: T) => prev === next;
  const isEqual = equalityFn || defaultEqualityFn;

  return React.memo<{ value: T; children: ReactNode }>(
    ({ value, children }) => {
      return (
        <Context.Provider value={value}>
          {children}
        </Context.Provider>
      );
    },
    (prevProps, nextProps) => {
      return isEqual(prevProps.value, nextProps.value) && 
             prevProps.children === nextProps.children;
    }
  );
}

/**
 * Context 값 안정화 Hook
 */
export function useStableContextValue<T extends Record<string, any>>(
  value: T,
  deps?: React.DependencyList
): T {
  const stableValue = useMemo(() => value, deps || Object.values(value));
  return stableValue;
}

/**
 * Context 액션 최적화
 * 액션들을 메모이제이션하여 불필요한 리렌더링 방지
 */
export function useStableActions<T extends Record<string, Function>>(actions: T): T {
  const stableActions = useMemo(() => {
    const stableActionsObj = {} as T;
    
    Object.keys(actions).forEach(key => {
      stableActionsObj[key as keyof T] = useCallback(
        actions[key as keyof T],
        [actions[key as keyof T]]
      );
    });
    
    return stableActionsObj;
  }, [actions]);

  return stableActions;
}

/**
 * Context 성능 모니터링
 */
export function useContextPerformance(contextName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  
  renderCount.current++;
  
  React.useEffect(() => {
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${contextName} Context 렌더링 #${renderCount.current}, 간격: ${timeSinceLastRender}ms`);
    }
    
    lastRenderTime.current = now;
  });
  
  return {
    renderCount: renderCount.current,
    logUpdate: (updateType: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`${contextName} Context 업데이트: ${updateType}`);
      }
    }
  };
}

/**
 * 조건부 Context Provider
 * 조건에 따라 Provider를 조건부로 렌더링
 */
export function createConditionalProvider<T>(
  Context: React.Context<T>,
  condition: (value: T) => boolean
) {
  return React.memo<{ value: T; children: ReactNode; fallback?: ReactNode }>(
    ({ value, children, fallback = null }) => {
      if (!condition(value)) {
        return <>{fallback}</>;
      }
      
      return (
        <Context.Provider value={value}>
          {children}
        </Context.Provider>
      );
    }
  );
}

/**
 * Context 값 캐싱 Hook
 */
export function useCachedContextValue<T>(
  value: T,
  cacheKey: string,
  ttl: number = 5000 // 5초 기본 TTL
): T {
  const cacheRef = useRef<Map<string, { value: T; timestamp: number }>>(new Map());
  
  const cachedValue = useMemo(() => {
    const now = Date.now();
    const cached = cacheRef.current.get(cacheKey);
    
    // 캐시가 있고 유효한 경우
    if (cached && (now - cached.timestamp) < ttl) {
      return cached.value;
    }
    
    // 새로운 값을 캐시에 저장
    cacheRef.current.set(cacheKey, { value, timestamp: now });
    
    // 오래된 캐시 정리
    for (const [key, cachedItem] of cacheRef.current.entries()) {
      if ((now - cachedItem.timestamp) > ttl) {
        cacheRef.current.delete(key);
      }
    }
    
    return value;
  }, [value, cacheKey, ttl]);
  
  return cachedValue;
}

/**
 * 최적화된 Global State Context 생성기
 */
export function createOptimizedGlobalContext<
  State extends Record<string, any>,
  Actions extends Record<string, Function>
>(initialState: State) {
  // 상태와 액션을 분리된 Context로 관리
  const StateContext = createContext<State>(initialState);
  const ActionsContext = createContext<Actions>({} as Actions);
  
  const Provider: React.FC<{ 
    actions: Actions; 
    children: ReactNode;
    state?: State;
  }> = ({ 
    actions, 
    children, 
    state = initialState 
  }) => {
    // 상태는 변경될 수 있지만, 액션은 안정적으로 유지
    const stableActions = useMemo(() => actions, []);
    const stableState = useStableContextValue(state, [state]);
    
    return (
      <StateContext.Provider value={stableState}>
        <ActionsContext.Provider value={stableActions}>
          {children}
        </ActionsContext.Provider>
      </StateContext.Provider>
    );
  };
  
  // 상태만 구독하는 Hook
  const useState = () => {
    const state = useContext(StateContext);
    if (state === undefined) {
      throw new Error('useState must be used within Provider');
    }
    return state;
  };
  
  // 액션만 구독하는 Hook
  const useActions = () => {
    const actions = useContext(ActionsContext);
    if (Object.keys(actions).length === 0) {
      throw new Error('useActions must be used within Provider');
    }
    return actions;
  };
  
  // 상태의 특정 부분만 구독하는 Hook
  const useStateSelector = <R,>(selector: (state: State) => R) => {
    const state = useState();
    return useMemo(() => selector(state), [state, selector]);
  };
  
  return {
    Provider,
    useState,
    useActions,
    useStateSelector
  };
}

/**
 * Context 디버깅 도구
 */
export function createContextDebugger<T>(
  Context: React.Context<T>,
  contextName: string
) {
  const useDebugContext = () => {
    const value = useContext(Context);
    const renderCount = useRef(0);
    const prevValue = useRef<T>(value);
    
    renderCount.current++;
    
    React.useEffect(() => {
      if (process.env.NODE_ENV === 'development') {
        console.group(`${contextName} Context 디버그 정보`);
        console.log('렌더링 횟수:', renderCount.current);
        console.log('현재 값:', value);
        console.log('이전 값:', prevValue.current);
        console.log('값 변경됨:', value !== prevValue.current);
        console.groupEnd();
      }
      
      prevValue.current = value;
    });
    
    return value;
  };
  
  return { useDebugContext };
}