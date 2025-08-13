import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing skeleton loading states
 * - 최소 로딩 시간 보장 (UX 개선)
 * - 깜빡임 방지
 * - 에러 상태 관리
 */

interface UseSkeletonLoaderOptions {
  minLoadingTime?: number; // 최소 로딩 시간 (ms)
  delay?: number; // 스켈레톤 표시 지연 시간 (ms)
}

interface UseSkeletonLoaderReturn {
  showSkeleton: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  error: Error | null;
  setError: (error: Error | null) => void;
}

export const useSkeletonLoader = (
  isLoading: boolean = false,
  options: UseSkeletonLoaderOptions = {}
): UseSkeletonLoaderReturn => {
  const { minLoadingTime = 500, delay = 100 } = options;
  
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let delayTimer: NodeJS.Timeout;
    let minLoadingTimer: NodeJS.Timeout;
    
    if (isLoading) {
      // 짧은 로딩의 경우 스켈레톤을 표시하지 않음 (깜빡임 방지)
      delayTimer = setTimeout(() => {
        setShowSkeleton(true);
        setLoadingStartTime(Date.now());
      }, delay);
    } else if (loadingStartTime) {
      // 최소 로딩 시간 보장
      const elapsedTime = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      if (remainingTime > 0) {
        minLoadingTimer = setTimeout(() => {
          setShowSkeleton(false);
          setLoadingStartTime(null);
        }, remainingTime);
      } else {
        setShowSkeleton(false);
        setLoadingStartTime(null);
      }
    } else {
      setShowSkeleton(false);
    }
    
    return () => {
      clearTimeout(delayTimer);
      clearTimeout(minLoadingTimer);
    };
  }, [isLoading, loadingStartTime, delay, minLoadingTime]);
  
  const startLoading = useCallback(() => {
    setError(null);
    // Manual loading trigger
    const delayTimer = setTimeout(() => {
      setShowSkeleton(true);
      setLoadingStartTime(Date.now());
    }, delay);
    
    return () => clearTimeout(delayTimer);
  }, [delay]);
  
  const stopLoading = useCallback(() => {
    if (loadingStartTime) {
      const elapsedTime = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      setTimeout(() => {
        setShowSkeleton(false);
        setLoadingStartTime(null);
      }, remainingTime);
    } else {
      setShowSkeleton(false);
    }
  }, [loadingStartTime, minLoadingTime]);
  
  return {
    showSkeleton,
    startLoading,
    stopLoading,
    error,
    setError
  };
};

// 컴포넌트별 특화 훅들
export const useDashboardSkeleton = (isLoading: boolean) => {
  return useSkeletonLoader(isLoading, {
    minLoadingTime: 800,
    delay: 200
  });
};

export const useTransactionSkeleton = (isLoading: boolean) => {
  return useSkeletonLoader(isLoading, {
    minLoadingTime: 600,
    delay: 150
  });
};

export const useAccountSkeleton = (isLoading: boolean) => {
  return useSkeletonLoader(isLoading, {
    minLoadingTime: 500,
    delay: 100
  });
};