/**
 * KB 스타뱅킹 통합 로딩 상태 관리
 * - Android WebView 최적화
 * - 백엔드 API 연동 상태 관리
 * - 17페이지 곰 로딩 애니메이션 통합
 * - 로딩 상태 중복 방지
 */

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

import { KBLoading } from '../components/ui/UnifiedLoading';

export interface LoadingState {
  [key: string]: {
    isLoading: boolean;
    message?: string;
    type?: 'overlay' | 'fullscreen' | 'inline';
    variant?: 'type1' | 'type2' | 'type3';
    size?: 'small' | 'medium' | 'large';
    startTime: number;
    minDisplayTime?: number; // 최소 표시 시간 (UX 개선용)
  };
}

export interface LoadingOptions {
  message?: string;
  type?: 'overlay' | 'fullscreen' | 'inline';
  variant?: 'type1' | 'type2' | 'type3';
  size?: 'small' | 'medium' | 'large';
  minDisplayTime?: number;
}

type LoadingAction = 
  | { type: 'START_LOADING'; key: string; options?: LoadingOptions }
  | { type: 'STOP_LOADING'; key: string }
  | { type: 'CLEAR_ALL_LOADING' }
  | { type: 'UPDATE_MESSAGE'; key: string; message: string };

interface LoadingContextType {
  loadingState: LoadingState;
  startLoading: (key: string, options?: LoadingOptions) => void;
  stopLoading: (key: string) => void;
  updateLoadingMessage: (key: string, message: string) => void;
  clearAllLoading: () => void;
  isLoading: (key?: string) => boolean;
  hasAnyLoading: () => boolean;
  getGlobalLoadingStates: () => string[];
}

// 기본 로딩 옵션
const DEFAULT_LOADING_OPTIONS: Required<LoadingOptions> = {
  message: '', // 메시지 제거
  type: 'overlay',
  variant: 'type2', // 곰 이미지가 있는 type2 사용
  size: 'large',
  minDisplayTime: 800 // Android WebView에서 깜빡임 방지
};

// 키별 기본 설정 (백엔드 API 연동 최적화) - 모든 메시지 제거
const LOADING_PRESETS: Record<string, Partial<LoadingOptions>> = {
  // 계좌 관련
  'accounts': {
    message: '',
    type: 'overlay',
    variant: 'type2',
    minDisplayTime: 600
  },
  'account-balance': {
    message: '',
    type: 'inline',
    variant: 'type2',
    size: 'medium'
  },
  
  // 거래내역 관련
  'transactions': {
    message: '',
    type: 'overlay',
    variant: 'type2',
    minDisplayTime: 800
  },
  'transaction-statistics': {
    message: '',
    type: 'inline',
    variant: 'type2',
    size: 'medium'
  },
  
  // 이체 관련
  'transfer': {
    message: '',
    type: 'fullscreen',
    variant: 'type2',
    size: 'large',
    minDisplayTime: 1200 // 이체는 충분한 시간 필요
  },
  'transfer-validation': {
    message: '',
    type: 'overlay',
    variant: 'type2',
    minDisplayTime: 400
  },
  
  // 인증 관련
  'login': {
    message: '',
    type: 'overlay',
    variant: 'type2',
    minDisplayTime: 800
  },
  'auth-refresh': {
    message: '',
    type: 'inline',
    variant: 'type2',
    size: 'small'
  },
  
  // 페이지 전환
  'page-transition': {
    message: '',
    type: 'fullscreen',
    variant: 'type2',
    minDisplayTime: 600
  },

  // 네트워크 관련
  'network-retry': {
    message: '',
    type: 'overlay',
    variant: 'type2',
    minDisplayTime: 1000
  }
};

const loadingReducer = (state: LoadingState, action: LoadingAction): LoadingState => {
  switch (action.type) {
    case 'START_LOADING': {
      const { key, options = {} } = action;
      
      // 이미 로딩 중이면 무시 (중복 방지)
      if (state[key]?.isLoading) {
        return state;
      }

      // 프리셋과 옵션 병합
      const preset = LOADING_PRESETS[key] || {};
      const finalOptions = { ...DEFAULT_LOADING_OPTIONS, ...preset, ...options };

      return {
        ...state,
        [key]: {
          isLoading: true,
          message: finalOptions.message,
          type: finalOptions.type,
          variant: finalOptions.variant,
          size: finalOptions.size,
          startTime: Date.now(),
          minDisplayTime: finalOptions.minDisplayTime
        }
      };
    }

    case 'STOP_LOADING': {
      const { key } = action;
      const currentLoading = state[key];
      
      if (!currentLoading || !currentLoading.isLoading) {
        return state;
      }

      // 최소 표시 시간 확인
      const elapsedTime = Date.now() - currentLoading.startTime;
      const minTime = currentLoading.minDisplayTime || 0;
      
      if (elapsedTime < minTime) {
        // 최소 시간이 지나지 않았으면 딜레이 후 제거
        setTimeout(() => {
          // 리듀서 호출을 위해 별도 처리가 필요할 수 있음
        }, minTime - elapsedTime);
        return state;
      }

      const newState = { ...state };
      delete newState[key];
      return newState;
    }

    case 'UPDATE_MESSAGE': {
      const { key, message } = action;
      if (!state[key]) return state;

      return {
        ...state,
        [key]: {
          ...state[key],
          message
        }
      };
    }

    case 'CLEAR_ALL_LOADING': {
      return {};
    }

    default:
      return state;
  }
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loadingState, dispatch] = useReducer(loadingReducer, {});

  // Android WebView에서 메모리 누수 방지
  useEffect(() => {
    const cleanup = () => {
      dispatch({ type: 'CLEAR_ALL_LOADING' });
    };

    // 페이지 언마운트 시 정리
    window.addEventListener('beforeunload', cleanup);
    
    return () => {
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, []);

  const startLoading = (key: string, options?: LoadingOptions) => {
    dispatch({ type: 'START_LOADING', key, options });
  };

  const stopLoading = (key: string) => {
    const currentLoading = loadingState[key];
    if (!currentLoading || !currentLoading.isLoading) return;

    const elapsedTime = Date.now() - currentLoading.startTime;
    const minTime = currentLoading.minDisplayTime || 0;
    
    if (elapsedTime < minTime) {
      // Android WebView 최적화: requestAnimationFrame 사용
      const remainingTime = minTime - elapsedTime;
      setTimeout(() => {
        dispatch({ type: 'STOP_LOADING', key });
      }, remainingTime);
    } else {
      dispatch({ type: 'STOP_LOADING', key });
    }
  };

  const updateLoadingMessage = (key: string, message: string) => {
    dispatch({ type: 'UPDATE_MESSAGE', key, message });
  };

  const clearAllLoading = () => {
    dispatch({ type: 'CLEAR_ALL_LOADING' });
  };

  const isLoading = (key?: string): boolean => {
    if (key) {
      return loadingState[key]?.isLoading || false;
    }
    return Object.values(loadingState).some(state => state.isLoading);
  };

  const hasAnyLoading = (): boolean => {
    return Object.keys(loadingState).length > 0;
  };

  const getGlobalLoadingStates = (): string[] => {
    return Object.entries(loadingState)
      .filter(([_, state]) => state.type === 'fullscreen')
      .map(([key]) => key);
  };

  // 로딩 표시할 상태 찾기 (하나만)
  const activeLoading = Object.entries(loadingState)
    .filter(([_, state]) => state.isLoading)
    .sort((a, b) => b[1].startTime - a[1].startTime)[0]; // 가장 최근 로딩만
    
  const showLoading = activeLoading && activeLoading[1].isLoading;
  const loadingState_ = activeLoading ? activeLoading[1] : null;

  return (
    <LoadingContext.Provider value={{
      loadingState,
      startLoading,
      stopLoading,
      updateLoadingMessage,
      clearAllLoading,
      isLoading,
      hasAnyLoading,
      getGlobalLoadingStates
    }}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div style={{
          width: '100%',
          height: '100%',
          transition: 'all 0.3s ease-out',
          transformOrigin: 'top center',
          transform: showLoading ? 'scale(0.92) translateY(20px)' : 'scale(1) translateY(0)',
          opacity: showLoading ? 0.6 : 1,
          filter: showLoading ? 'blur(2px)' : 'none',
          pointerEvents: showLoading ? 'none' : 'auto'
        }}>
          {children}
        </div>
        {showLoading && loadingState_ && (
          <KBLoading
            isVisible={true}
            type={loadingState_.type || 'overlay'}
            variant={loadingState_.variant}
            size={loadingState_.size}
            message={loadingState_.message}
          />
        )}
      </div>
    </LoadingContext.Provider>
  );
};

// Hook
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

// 백엔드 API 호출용 편의 Hook
export const useApiLoading = (key: string) => {
  const { startLoading, stopLoading, updateLoadingMessage, isLoading } = useLoading();

  return {
    startApiCall: (message?: string) => {
      const preset = LOADING_PRESETS[key];
      startLoading(key, { ...preset, message });
    },
    
    stopApiCall: () => stopLoading(key),
    
    updateMessage: (message: string) => updateLoadingMessage(key, message),
    
    isApiLoading: () => isLoading(key),
    
    // API 호출 래퍼
    withLoading: async <T,>(
      apiCall: () => Promise<T>, 
      loadingMessage?: string
    ): Promise<T> => {
      try {
        const preset = LOADING_PRESETS[key];
        startLoading(key, { ...preset, message: loadingMessage });
        const result = await apiCall();
        return result;
      } finally {
        stopLoading(key);
      }
    }
  };
};

// Android WebView 최적화 Hook
export const useAndroidOptimizedLoading = (key: string) => {
  const loading = useApiLoading(key);
  
  return {
    ...loading,
    
    // Android WebView에서 메모리 효율적인 로딩
    withOptimizedLoading: async <T,>(
      apiCall: () => Promise<T>,
      options?: {
        message?: string;
        onProgress?: (progress: number) => void;
        estimatedDuration?: number;
      }
    ): Promise<T> => {
      const { message, onProgress, estimatedDuration = 2000 } = options || {};
      
      try {
        loading.startApiCall(message);
        
        // Android WebView에서 진행률 시뮬레이션
        if (onProgress) {
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress < 90) {
              onProgress(Math.min(progress, 90));
            } else {
              clearInterval(interval);
            }
          }, estimatedDuration / 10);
        }
        
        const result = await apiCall();
        
        if (onProgress) {
          onProgress(100);
        }
        
        return result;
      } finally {
        loading.stopApiCall();
      }
    }
  };
};