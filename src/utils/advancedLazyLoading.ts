import React from 'react';

import { RouteProps } from 'react-router-dom';

/**
 * 고급 Lazy Loading 유틸리티
 */

// 컴포넌트 로딩 우선순위
export enum LoadingPriority {
  IMMEDIATE = 'immediate', // 즉시 로드 (로그인 화면 등)
  HIGH = 'high', // 높음 (대시보드, 계좌)
  MEDIUM = 'medium', // 보통 (이체, 거래내역)
  LOW = 'low', // 낮음 (설정, 기타)
  ON_DEMAND = 'on-demand', // 요청시만 (모달, 서브 컴포넌트)
}

// 청크 분할 전략
export interface ChunkSplitStrategy {
  /** 청크 이름 */
  chunkName: string;
  /** 로딩 우선순위 */
  priority: LoadingPriority;
  /** 프리페치 여부 */
  prefetch?: boolean;
  /** 프리로드 여부 */
  preload?: boolean;
  /** 의존성 청크들 */
  dependencies?: string[];
  /** 최대 재시도 횟수 */
  maxRetries?: number;
}

// 성능 모니터링을 위한 메트릭
interface LoadingMetrics {
  startTime: number;
  endTime?: number;
  chunkName: string;
  retryCount: number;
  error?: Error;
}

class AdvancedLazyLoadingManager {
  private loadingMetrics = new Map<string, LoadingMetrics>();
  private loadedChunks = new Set<string>();
  private failedChunks = new Set<string>();
  private prefetchQueue: string[] = [];

  /**
   * 성능 최적화된 lazy loading with retry
   */
  lazyWithAdvancedRetry<T = React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    strategy: ChunkSplitStrategy
  ): React.LazyExoticComponent<T> {
    return React.lazy(async () => {
      const startTime = performance.now();

      // 메트릭 초기화
      this.loadingMetrics.set(strategy.chunkName, {
        startTime,
        chunkName: strategy.chunkName,
        retryCount: 0,
      });

      let lastError: Error | null = null;
      const maxRetries = strategy.maxRetries || 3;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          // 의존성 청크 먼저 로드
          if (strategy.dependencies) {
            await this.loadDependencies(strategy.dependencies);
          }

          const module = await importFn();

          // 성공 메트릭 업데이트
          const metric = this.loadingMetrics.get(strategy.chunkName)!;
          metric.endTime = performance.now();
          metric.retryCount = attempt;

          this.loadedChunks.add(strategy.chunkName);
          this.failedChunks.delete(strategy.chunkName);

          // 성능 로그 (개발 모드에서만)
          if (process.env.NODE_ENV === 'development') {
            console.log(
              `✅ Chunk loaded: ${strategy.chunkName} in ${(metric.endTime - metric.startTime).toFixed(2)}ms (${attempt} retries)`
            );
          }

          return module;
        } catch (error) {
          lastError = error as Error;

          if (attempt === maxRetries) {
            // 최종 실패 처리
            const metric = this.loadingMetrics.get(strategy.chunkName)!;
            metric.endTime = performance.now();
            metric.retryCount = attempt;
            metric.error = lastError;

            this.failedChunks.add(strategy.chunkName);

            console.error(
              `❌ Chunk failed to load: ${strategy.chunkName} after ${attempt} retries`,
              lastError
            );
            throw lastError;
          }

          // 지수 백오프 대기
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));

          // 네트워크 재연결 확인
          if (!navigator.onLine) {
            await this.waitForNetworkReconnection();
          }
        }
      }

      throw lastError;
    });
  }

  /**
   * 우선순위 기반 프리페치
   */
  async prefetchByPriority(
    routes: Array<{ priority: LoadingPriority; importFn: () => Promise<any>; chunkName: string }>
  ) {
    // 우선순위별로 정렬
    const sortedRoutes = routes.sort((a, b) => {
      const priorities = [
        LoadingPriority.IMMEDIATE,
        LoadingPriority.HIGH,
        LoadingPriority.MEDIUM,
        LoadingPriority.LOW,
        LoadingPriority.ON_DEMAND,
      ];
      return priorities.indexOf(a.priority) - priorities.indexOf(b.priority);
    });

    // 순차적으로 프리페치
    for (const route of sortedRoutes) {
      if (!this.loadedChunks.has(route.chunkName) && !this.failedChunks.has(route.chunkName)) {
        try {
          await route.importFn();
          this.loadedChunks.add(route.chunkName);
        } catch (error) {
          console.warn(`Prefetch failed for ${route.chunkName}:`, error);
          this.failedChunks.add(route.chunkName);
        }
      }
    }
  }

  /**
   * 의존성 청크 로드
   */
  private async loadDependencies(dependencies: string[]): Promise<void> {
    const pendingDeps = dependencies.filter(dep => !this.loadedChunks.has(dep));

    if (pendingDeps.length === 0) return;

    // 의존성들을 병렬로 로드
    await Promise.all(
      pendingDeps.map(async dep => {
        // 의존성 로드 로직 (실제 구현에서는 청크 매핑 필요)
        console.log(`Loading dependency: ${dep}`);
      })
    );
  }

  /**
   * 네트워크 재연결 대기
   */
  private waitForNetworkReconnection(): Promise<void> {
    return new Promise(resolve => {
      const handleOnline = () => {
        window.removeEventListener('online', handleOnline);
        resolve();
      };

      if (navigator.onLine) {
        resolve();
      } else {
        window.addEventListener('online', handleOnline);
      }
    });
  }

  /**
   * 로딩 성능 메트릭 가져오기
   */
  getLoadingMetrics(): Map<string, LoadingMetrics> {
    return new Map(this.loadingMetrics);
  }

  /**
   * 메트릭 리셋
   */
  resetMetrics(): void {
    this.loadingMetrics.clear();
    this.loadedChunks.clear();
    this.failedChunks.clear();
  }
}

// 싱글톤 인스턴스
export const advancedLazyLoadingManager = new AdvancedLazyLoadingManager();

/**
 * 라우트별 최적화된 lazy loading
 */
export function createOptimizedLazyRoute<T = React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  strategy: ChunkSplitStrategy
): React.LazyExoticComponent<T> {
  return advancedLazyLoadingManager.lazyWithAdvancedRetry(importFn, strategy);
}

/**
 * 조건부 lazy loading (사용자 권한, 기기 성능 등에 따라)
 */
export function createConditionalLazyRoute<T = React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallbackFn: () => Promise<{ default: T }>,
  condition: () => boolean,
  strategy: ChunkSplitStrategy
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    try {
      if (condition()) {
        return await importFn();
      } else {
        return await fallbackFn();
      }
    } catch (error) {
      console.warn(
        `Conditional lazy loading failed, using fallback for ${strategy.chunkName}:`,
        error
      );
      return await fallbackFn();
    }
  });
}

/**
 * 번들 분석을 위한 웹팩 매직 코멘트 생성기
 */
export function createWebpackMagicComments(strategy: ChunkSplitStrategy): string {
  const comments: string[] = [];

  comments.push(`webpackChunkName: "${strategy.chunkName}"`);

  if (strategy.prefetch) {
    comments.push('webpackPrefetch: true');
  }

  if (strategy.preload) {
    comments.push('webpackPreload: true');
  }

  return `/* ${comments.join(', ')} */`;
}

/**
 * 지능형 프리페치 - 사용자 행동 패턴 기반
 */
export class IntelligentPrefetcher {
  private userActions: string[] = [];
  private transitionPatterns = new Map<string, string[]>();

  /**
   * 사용자 행동 기록
   */
  recordUserAction(action: string): void {
    this.userActions.push(action);

    // 최근 10개 행동만 유지
    if (this.userActions.length > 10) {
      this.userActions.shift();
    }

    this.updateTransitionPatterns(action);
  }

  /**
   * 전환 패턴 업데이트
   */
  private updateTransitionPatterns(currentAction: string): void {
    const previousAction = this.userActions[this.userActions.length - 2];

    if (previousAction) {
      if (!this.transitionPatterns.has(previousAction)) {
        this.transitionPatterns.set(previousAction, []);
      }

      const transitions = this.transitionPatterns.get(previousAction)!;
      transitions.push(currentAction);

      // 최근 5개 전환만 유지
      if (transitions.length > 5) {
        transitions.shift();
      }
    }
  }

  /**
   * 다음 가능한 행동 예측
   */
  predictNextActions(currentAction: string): string[] {
    const transitions = this.transitionPatterns.get(currentAction);

    if (!transitions || transitions.length === 0) {
      return [];
    }

    // 빈도수 기반으로 정렬
    const frequency = new Map<string, number>();

    transitions.forEach(action => {
      frequency.set(action, (frequency.get(action) || 0) + 1);
    });

    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([action]) => action)
      .slice(0, 3); // 상위 3개만 반환
  }

  /**
   * 예측 기반 프리페치 실행
   */
  async prefetchPredictedActions(
    currentAction: string,
    actionImportMap: Map<string, () => Promise<any>>
  ): Promise<void> {
    const predictedActions = this.predictNextActions(currentAction);

    // 예측된 액션들을 백그라운드에서 프리페치
    const prefetchPromises = predictedActions
      .map(action => actionImportMap.get(action))
      .filter(Boolean)
      .map(importFn => importFn!().catch(console.warn));

    await Promise.allSettled(prefetchPromises);
  }
}

export const intelligentPrefetcher = new IntelligentPrefetcher();

/**
 * 성능 모니터링 훅
 */
export function useLoadingPerformance() {
  const getMetrics = React.useCallback(() => {
    return advancedLazyLoadingManager.getLoadingMetrics();
  }, []);

  const resetMetrics = React.useCallback(() => {
    advancedLazyLoadingManager.resetMetrics();
  }, []);

  return { getMetrics, resetMetrics };
}
