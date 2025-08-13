/**
 * 최적화된 로딩 애니메이션 훅
 * requestAnimationFrame 기반으로 부드러운 60fps 애니메이션 제공
 *
 * 성능 최적화 요소:
 * - requestAnimationFrame 사용으로 브라우저 렌더링 주기에 맞춘 애니메이션
 * - 컴포넌트 언마운트 시 자동으로 애니메이션 정리
 * - 페이지 visibility API로 백그라운드에서 애니메이션 일시정지
 * - 메모리 누수 방지
 */
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseOptimizedLoadingAnimationOptions {
  /** 프레임 지속시간 (밀리초) - 기본값: 16.67ms (60fps) */
  frameRate?: number;
  /** 자동 시작 여부 */
  autoStart?: boolean;
  /** 총 프레임 수 */
  totalFrames?: number;
  /** 무한 반복 여부 */
  loop?: boolean;
  /** 애니메이션 완료 콜백 */
  onComplete?: () => void;
}

interface AnimationState {
  currentFrame: number;
  isPlaying: boolean;
  progress: number; // 0-1 사이의 진행률
}

/**
 * 최적화된 로딩 애니메이션 훅
 */
export const useOptimizedLoadingAnimation = (options: UseOptimizedLoadingAnimationOptions = {}) => {
  const {
    frameRate = 16.67, // 60fps
    autoStart = true,
    totalFrames = 60,
    loop = true,
    onComplete,
  } = options;

  const [state, setState] = useState<AnimationState>({
    currentFrame: 0,
    isPlaying: autoStart,
    progress: 0,
  });

  const rafId = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);
  const startTime = useRef<number>(0);
  const isVisible = useRef<boolean>(true);

  // 페이지 visibility 감지
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisible.current = !document.hidden;

      if (document.hidden && state.isPlaying) {
        // 페이지가 백그라운드로 갈 때 애니메이션 일시정지
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
          rafId.current = null;
        }
      } else if (!document.hidden && state.isPlaying) {
        // 페이지가 다시 포커스되면 애니메이션 재시작
        startTime.current = performance.now();
        animate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.isPlaying]);

  // 애니메이션 루프 함수
  const animate = useCallback(() => {
    if (!isVisible.current) return;

    const currentTime = performance.now();

    if (startTime.current === 0) {
      startTime.current = currentTime;
      lastFrameTime.current = currentTime;
    }

    const deltaTime = currentTime - lastFrameTime.current;

    if (deltaTime >= frameRate) {
      setState(prevState => {
        const nextFrame = prevState.currentFrame + 1;
        const progress = nextFrame / totalFrames;

        // 애니메이션 완료 확인
        if (nextFrame >= totalFrames) {
          if (loop) {
            // 무한 반복
            return {
              currentFrame: 0,
              isPlaying: true,
              progress: 0,
            };
          } else {
            // 애니메이션 완료
            onComplete?.();
            return {
              currentFrame: totalFrames - 1,
              isPlaying: false,
              progress: 1,
            };
          }
        }

        return {
          currentFrame: nextFrame,
          isPlaying: prevState.isPlaying,
          progress,
        };
      });

      lastFrameTime.current = currentTime;
    }

    rafId.current = requestAnimationFrame(animate);
  }, [frameRate, totalFrames, loop, onComplete]);

  // 애니메이션 시작
  const play = useCallback(() => {
    if (!state.isPlaying) {
      setState(prev => ({ ...prev, isPlaying: true }));
      startTime.current = performance.now();
      animate();
    }
  }, [state.isPlaying, animate]);

  // 애니메이션 일시정지
  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  // 애니메이션 리셋
  const reset = useCallback(() => {
    setState({
      currentFrame: 0,
      isPlaying: false,
      progress: 0,
    });
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    startTime.current = 0;
    lastFrameTime.current = 0;
  }, []);

  // 특정 프레임으로 점프
  const seekTo = useCallback(
    (frame: number) => {
      const clampedFrame = Math.max(0, Math.min(frame, totalFrames - 1));
      setState(prev => ({
        ...prev,
        currentFrame: clampedFrame,
        progress: clampedFrame / totalFrames,
      }));
    },
    [totalFrames]
  );

  // 애니메이션 시작 (컴포넌트 마운트 시)
  useEffect(() => {
    if (autoStart && state.isPlaying) {
      animate();
    }

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [autoStart, animate]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return {
    // 상태
    currentFrame: state.currentFrame,
    isPlaying: state.isPlaying,
    progress: state.progress,

    // 컨트롤 함수들
    play,
    pause,
    reset,
    seekTo,

    // 유틸리티
    totalFrames,
    frameRate,

    // 시간 기반 진행률 (0-1)
    timeProgress: state.progress,

    // 애니메이션 상태 확인
    isComplete: state.currentFrame >= totalFrames - 1 && !loop,

    // CSS 애니메이션 진행률 (CSS 변수용)
    cssProgress: `${state.progress * 100}%`,
  };
};

/**
 * CSS 키프레임과 연동하는 간단한 로딩 애니메이션 훅
 */
export const useCSSLoadingAnimation = (duration: number = 2000, delay: number = 0) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsAnimating(true);

    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, duration + delay);
  }, [duration, delay]);

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsAnimating(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isAnimating,
    start,
    stop,
    cssAnimationProps: {
      style: {
        animationDuration: `${duration}ms`,
        animationDelay: `${delay}ms`,
        animationPlayState: isAnimating ? 'running' : 'paused',
      },
    },
  };
};

export default useOptimizedLoadingAnimation;
