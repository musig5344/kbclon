/**
 * KB 스타뱅킹 클론 성능 최적화 유틸리티
 * 20년차 React Performance Architect가 제작
 */

import { useRef, useEffect, useState, useCallback } from 'react';

// 렌더링 성능 측정을 위한 Hook
export function useRenderPerformance(componentName: string, enabled = false) {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    
    renderStartTime.current = performance.now();
    renderCount.current += 1;
  });

  useEffect(() => {
    if (!enabled) return;
    
    const renderTime = performance.now() - renderStartTime.current;
    
    if (renderTime > 16) { // 60fps 기준 초과
      console.warn(`🐌 ${componentName} 렌더링 성능 주의: ${renderTime.toFixed(2)}ms (렌더링 #${renderCount.current})`);
    } else if (renderTime > 8) {
      console.info(`⚡ ${componentName} 렌더링: ${renderTime.toFixed(2)}ms (렌더링 #${renderCount.current})`);
    }
  });
}

// 메모리 리크 감지를 위한 Hook
export function useMemoryLeak(componentName: string, enabled = false) {
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const initialMemory = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !(performance as any).memory) return;
    
    initialMemory.current = (performance as any).memory.usedJSHeapSize;
    
    const checkMemory = () => {
      const currentMemory = (performance as any).memory.usedJSHeapSize;
      const memoryDiff = currentMemory - initialMemory.current;
      
      setMemoryUsage(memoryDiff);
      
      // 10MB 이상 증가 시 경고
      if (memoryDiff > 10 * 1024 * 1024) {
        console.warn(`🚨 ${componentName} 메모리 리크 의심: +${(memoryDiff / 1024 / 1024).toFixed(2)}MB`);
      }
    };

    const interval = setInterval(checkMemory, 5000);
    return () => clearInterval(interval);
  }, [componentName, enabled]);

  return memoryUsage;
}

// 불필요한 리렌더링 감지
export function useWhyDidYouUpdate(name: string, props: Record<string, any>, enabled = false) {
  const previousProps = useRef<Record<string, any>>();

  useEffect(() => {
    if (!enabled) return;
    
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, { from: any; to: any }> = {};

      allKeys.forEach((key) => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key]
          };
        }
      });

      if (Object.keys(changedProps).length) {
        console.log(`🔄 ${name} 리렌더링 원인:`, changedProps);
      }
    }

    previousProps.current = props;
  });
}

// 지연 로딩을 위한 Intersection Observer Hook
export function useInViewport(options?: IntersectionObserverInit) {
  const [inViewport, setInViewport] = useState(false);
  const [hasBeenInViewport, setHasBeenInViewport] = useState(false);
  const elementRef = useRef<Element | null>(null);

  const setRef = useCallback((element: Element | null) => {
    elementRef.current = element;
  }, []);

  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        setInViewport(isIntersecting);
        
        if (isIntersecting && !hasBeenInViewport) {
          setHasBeenInViewport(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [hasBeenInViewport, options]);

  return { inViewport, hasBeenInViewport, setRef };
}

// 디바운스된 상태 업데이트
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 성능 메트릭 수집
export interface PerformanceMetrics {
  renderCount: number;
  averageRenderTime: number;
  maxRenderTime: number;
  memoryUsage: number;
  lastUpdate: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  recordRender(componentName: string, renderTime: number) {
    const existing = this.metrics.get(componentName) || {
      renderCount: 0,
      averageRenderTime: 0,
      maxRenderTime: 0,
      memoryUsage: 0,
      lastUpdate: 0
    };

    const newCount = existing.renderCount + 1;
    const newAverage = (existing.averageRenderTime * existing.renderCount + renderTime) / newCount;

    this.metrics.set(componentName, {
      renderCount: newCount,
      averageRenderTime: newAverage,
      maxRenderTime: Math.max(existing.maxRenderTime, renderTime),
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      lastUpdate: Date.now()
    });
  }

  getMetrics(componentName?: string): PerformanceMetrics | Map<string, PerformanceMetrics> {
    if (componentName) {
      return this.metrics.get(componentName) || {
        renderCount: 0,
        averageRenderTime: 0,
        maxRenderTime: 0,
        memoryUsage: 0,
        lastUpdate: 0
      };
    }
    return this.metrics;
  }

  reset(componentName?: string) {
    if (componentName) {
      this.metrics.delete(componentName);
    } else {
      this.metrics.clear();
    }
  }

  // 성능 리포트 생성
  generateReport(): string {
    const report = Array.from(this.metrics.entries())
      .map(([name, metrics]) => {
        const memoryMB = (metrics.memoryUsage / 1024 / 1024).toFixed(2);
        return `📊 ${name}:
  • 렌더링 횟수: ${metrics.renderCount}
  • 평균 렌더링 시간: ${metrics.averageRenderTime.toFixed(2)}ms
  • 최대 렌더링 시간: ${metrics.maxRenderTime.toFixed(2)}ms
  • 메모리 사용량: ${memoryMB}MB
  • 마지막 업데이트: ${new Date(metrics.lastUpdate).toLocaleTimeString()}`;
      })
      .join('\n\n');

    return report || '📈 성능 데이터가 없습니다.';
  }
}

// 전역 성능 모니터 인스턴스
export const performanceMonitor = PerformanceMonitor.getInstance();