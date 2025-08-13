import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { KBFullscreenLoading, LoadingVariant } from './KBLoadingSpinner';

// 로딩 상태 타입
interface LoadingState {
  id: string;
  message?: string;
  variant?: LoadingVariant;
  priority?: number;
}

// 로딩 매니저 컨텍스트 타입
interface LoadingContextType {
  /** 로딩 표시 */
  showLoading: (id: string, options?: {
    message?: string;
    variant?: LoadingVariant;
    priority?: number;
  }) => void;
  
  /** 로딩 숨김 */
  hideLoading: (id: string) => void;
  
  /** 모든 로딩 숨김 */
  hideAllLoading: () => void;
  
  /** 현재 로딩 상태 */
  isLoading: boolean;
  
  /** 현재 로딩 메시지 */
  currentMessage?: string;
  
  /** 현재 로딩 변형 */
  currentVariant?: LoadingVariant;
}

// 로딩 컨텍스트 생성
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// 로딩 매니저 Props
interface LoadingManagerProps {
  children: React.ReactNode;
  /** 기본 로딩 메시지 */
  defaultMessage?: string;
  /** 기본 로딩 변형 */
  defaultVariant?: LoadingVariant;
  /** 최소 로딩 표시 시간 (ms) */
  minDisplayTime?: number;
}

/**
 * 글로벌 로딩 매니저 컴포넌트
 * 
 * 기능:
 * - 페이지 전환 시 자동 로딩 표시
 * - 데이터 로딩 시 로딩 스피너
 * - 우선순위 기반 로딩 관리
 * - Context API를 통한 상태 관리
 * - 최소 표시 시간으로 깜빡임 방지
 */
export const LoadingManager: React.FC<LoadingManagerProps> = ({
  children,
  defaultMessage = '처리중입니다...',
  defaultVariant = 'type1',
  minDisplayTime = 300
}) => {
  const [loadingStates, setLoadingStates] = useState<Map<string, LoadingState>>(new Map());
  const loadingTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // 현재 로딩 상태 계산 (우선순위 기반)
  const currentLoading = React.useMemo(() => {
    if (loadingStates.size === 0) {
      return null;
    }

    // 우선순위가 높은 로딩을 찾음
    let highestPriority = -1;
    let currentState: LoadingState | null = null;

    for (const state of loadingStates.values()) {
      const priority = state.priority ?? 0;
      if (priority > highestPriority) {
        highestPriority = priority;
        currentState = state;
      }
    }

    return currentState;
  }, [loadingStates]);

  // 로딩 표시 함수
  const showLoading = useCallback((
    id: string, 
    options: {
      message?: string;
      variant?: LoadingVariant;
      priority?: number;
    } = {}
  ) => {
    // 기존 타이머 제거
    const existingTimer = loadingTimers.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      loadingTimers.current.delete(id);
    }

    const newState: LoadingState = {
      id,
      message: options.message || defaultMessage,
      variant: options.variant || defaultVariant,
      priority: options.priority || 0
    };

    setLoadingStates(prev => new Map(prev.set(id, newState)));
  }, [defaultMessage, defaultVariant]);

  // 로딩 숨김 함수
  const hideLoading = useCallback((id: string) => {
    // 최소 표시 시간 적용
    const timer = setTimeout(() => {
      setLoadingStates(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
      loadingTimers.current.delete(id);
    }, minDisplayTime);

    loadingTimers.current.set(id, timer);
  }, [minDisplayTime]);

  // 모든 로딩 숨김 함수
  const hideAllLoading = useCallback(() => {
    // 모든 타이머 제거
    loadingTimers.current.forEach(timer => clearTimeout(timer));
    loadingTimers.current.clear();
    
    setLoadingStates(new Map());
  }, []);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      loadingTimers.current.forEach(timer => clearTimeout(timer));
      loadingTimers.current.clear();
    };
  }, []);

  // 컨텍스트 값
  const contextValue: LoadingContextType = {
    showLoading,
    hideLoading,
    hideAllLoading,
    isLoading: loadingStates.size > 0,
    currentMessage: currentLoading?.message,
    currentVariant: currentLoading?.variant
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      
      {/* 글로벌 로딩 오버레이 */}
      {currentLoading && (
        <KBFullscreenLoading
          isVisible={true}
          variant={currentLoading.variant}
          message={currentLoading.message}
          aria-label={currentLoading.message}
        />
      )}
    </LoadingContext.Provider>
  );
};

/**
 * 로딩 매니저 훅
 * 
 * @returns LoadingContextType
 */
export const useLoadingManager = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  
  if (!context) {
    throw new Error('useLoadingManager must be used within LoadingManager');
  }
  
  return context;
};

/**
 * 페이지 전환 로딩 훅
 * 페이지 전환 시 자동으로 로딩을 표시/숨김
 */
export const usePageTransitionLoading = () => {
  const { showLoading, hideLoading } = useLoadingManager();

  const startPageTransition = useCallback((
    page: string,
    message?: string
  ) => {
    showLoading(`page-transition-${page}`, {
      message: message || '페이지를 불러오고 있습니다...',
      variant: 'type2',
      priority: 100 // 페이지 전환은 최고 우선순위
    });
  }, [showLoading]);

  const endPageTransition = useCallback((page: string) => {
    hideLoading(`page-transition-${page}`);
  }, [hideLoading]);

  return {
    startPageTransition,
    endPageTransition
  };
};

/**
 * API 요청 로딩 훅
 * API 요청 시 자동으로 로딩을 표시/숨김
 */
export const useApiLoading = () => {
  const { showLoading, hideLoading } = useLoadingManager();

  const startApiLoading = useCallback((
    apiName: string,
    message?: string
  ) => {
    showLoading(`api-${apiName}`, {
      message: message || '데이터를 불러오고 있습니다...',
      variant: 'type1',
      priority: 50 // API 로딩은 중간 우선순위
    });
  }, [showLoading]);

  const endApiLoading = useCallback((apiName: string) => {
    hideLoading(`api-${apiName}`);
  }, [hideLoading]);

  return {
    startApiLoading,
    endApiLoading
  };
};

/**
 * 사용자 액션 로딩 훅
 * 사용자의 특정 액션에 대한 로딩을 표시/숨김
 */
export const useActionLoading = () => {
  const { showLoading, hideLoading } = useLoadingManager();

  const startActionLoading = useCallback((
    actionName: string,
    message?: string
  ) => {
    showLoading(`action-${actionName}`, {
      message: message || '처리 중입니다...',
      variant: 'type2',
      priority: 75 // 사용자 액션은 높은 우선순위
    });
  }, [showLoading]);

  const endActionLoading = useCallback((actionName: string) => {
    hideLoading(`action-${actionName}`);
  }, [hideLoading]);

  return {
    startActionLoading,
    endActionLoading
  };
};

export default LoadingManager;