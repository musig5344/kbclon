/**
 * KB 스타뱅킹 성능 모니터링 시스템
 *
 * 특징:
 * - 실시간 성능 메트릭 수집
 * - Web Vitals 측정 및 분석
 * - 번들 크기 및 로딩 시간 추적
 * - 사용자 경험 지표 모니터링
 */

// Web Vitals 타입 정의
interface WebVitalMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  entries: PerformanceEntry[];
}

// 커스텀 성능 메트릭
interface CustomMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'loading' | 'interactivity' | 'visual' | 'network' | 'memory';
  unit?: 'ms' | 'kb' | 'mb' | 'score' | 'count';
}

// 성능 리포트
interface PerformanceReport {
  timestamp: number;
  url: string;
  userAgent: string;
  connection: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  } | null;
  webVitals: WebVitalMetric[];
  customMetrics: CustomMetric[];
  bundleStats: {
    totalSize: number;
    chunkSizes: Record<string, number>;
    loadTime: number;
  };
  memoryUsage: {
    usedJSMemory: number;
    totalJSMemory: number;
    jsMemoryLimit: number;
  } | null;
}

class PerformanceMonitor {
  private metrics: Map<string, CustomMetric[]> = new Map();
  private webVitalsMetrics: WebVitalMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private startTime = performance.now();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWebVitals();
      this.initializeCustomObservers();
      this.trackPageLoad();
    }
  }

  /**
   * Web Vitals 초기화 및 측정
   */
  private initializeWebVitals() {
    // Cumulative Layout Shift (CLS) 측정
    this.observePerformanceEntry('layout-shift', entries => {
      let cumulativeScore = 0;

      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          cumulativeScore += entry.value;
        }
      });

      this.addWebVitalMetric({
        name: 'CLS',
        value: cumulativeScore,
        rating: this.getCLSRating(cumulativeScore),
        delta: cumulativeScore,
        id: 'cls-' + Date.now(),
        entries,
      });
    });

    // First Input Delay (FID) 측정
    this.observePerformanceEntry('first-input', entries => {
      const entry = entries[0] as any;
      const fid = entry.processingStart - entry.startTime;

      this.addWebVitalMetric({
        name: 'FID',
        value: fid,
        rating: this.getFIDRating(fid),
        delta: fid,
        id: 'fid-' + Date.now(),
        entries,
      });
    });

    // Largest Contentful Paint (LCP) 측정
    this.observePerformanceEntry('largest-contentful-paint', entries => {
      const entry = entries[entries.length - 1] as any;
      const lcp = entry.startTime;

      this.addWebVitalMetric({
        name: 'LCP',
        value: lcp,
        rating: this.getLCPRating(lcp),
        delta: lcp,
        id: 'lcp-' + Date.now(),
        entries,
      });
    });

    // First Contentful Paint (FCP) 측정
    this.observePerformanceEntry('paint', entries => {
      const fcpEntry = entries.find((entry: any) => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        const fcp = fcpEntry.startTime;

        this.addWebVitalMetric({
          name: 'FCP',
          value: fcp,
          rating: this.getFCPRating(fcp),
          delta: fcp,
          id: 'fcp-' + Date.now(),
          entries: [fcpEntry],
        });
      }
    });

    // Navigation Timing으로 TTFB 측정
    this.measureTTFB();
  }

  /**
   * 커스텀 성능 관찰자 초기화
   */
  private initializeCustomObservers() {
    // 리소스 로딩 시간 측정
    this.observePerformanceEntry('resource', entries => {
      entries.forEach((entry: any) => {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          this.addCustomMetric({
            name: `resource_load_${this.getResourceType(entry.name)}`,
            value: entry.responseEnd - entry.startTime,
            timestamp: Date.now(),
            category: 'loading',
            unit: 'ms',
          });
        }
      });
    });

    // 메모리 사용량 주기적 측정
    if ('memory' in performance) {
      setInterval(() => {
        this.measureMemoryUsage();
      }, 30000); // 30초마다 측정
    }
  }

  /**
   * 페이지 로드 추적
   */
  private trackPageLoad() {
    window.addEventListener('load', () => {
      const loadTime = performance.now() - this.startTime;

      this.addCustomMetric({
        name: 'page_load_time',
        value: loadTime,
        timestamp: Date.now(),
        category: 'loading',
        unit: 'ms',
      });

      // DOM 크기 측정
      this.measureDOMSize();

      // 번들 크기 측정
      this.measureBundleSize();
    });
  }

  /**
   * Performance Observer 설정
   */
  private observePerformanceEntry(type: string, callback: (entries: PerformanceEntry[]) => void) {
    try {
      const observer = new PerformanceObserver(list => {
        callback(list.getEntries());
      });

      observer.observe({ entryTypes: [type] });
      this.observers.push(observer);
    } catch (error) {
      // Performance Observer를 지원하지 않는 브라우저에서는 조용히 무시
    }
  }

  /**
   * TTFB 측정
   */
  private measureTTFB() {
    const navigation = performance.getEntriesByType('navigation')[0] as any;
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;

      this.addWebVitalMetric({
        name: 'TTFB',
        value: ttfb,
        rating: this.getTTFBRating(ttfb),
        delta: ttfb,
        id: 'ttfb-' + Date.now(),
        entries: [navigation],
      });
    }
  }

  /**
   * 메모리 사용량 측정
   */
  private measureMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;

      this.addCustomMetric({
        name: 'js_memory_used',
        value: Math.round(memory.usedJSMemory / 1048576), // MB 변환
        timestamp: Date.now(),
        category: 'memory',
        unit: 'mb',
      });

      this.addCustomMetric({
        name: 'js_memory_total',
        value: Math.round(memory.totalJSMemory / 1048576),
        timestamp: Date.now(),
        category: 'memory',
        unit: 'mb',
      });
    }
  }

  /**
   * DOM 크기 측정
   */
  private measureDOMSize() {
    const domSize = document.querySelectorAll('*').length;

    this.addCustomMetric({
      name: 'dom_size',
      value: domSize,
      timestamp: Date.now(),
      category: 'visual',
      unit: 'count',
    });
  }

  /**
   * 번들 크기 측정
   */
  private measureBundleSize() {
    const resources = performance.getEntriesByType('resource');
    let totalSize = 0;
    const chunkSizes: Record<string, number> = {};

    resources.forEach((resource: any) => {
      if (resource.name.includes('.js') && resource.transferSize) {
        totalSize += resource.transferSize;

        const chunkName = this.extractChunkName(resource.name);
        chunkSizes[chunkName] = resource.transferSize;
      }
    });

    this.addCustomMetric({
      name: 'bundle_total_size',
      value: Math.round(totalSize / 1024), // KB 변환
      timestamp: Date.now(),
      category: 'loading',
      unit: 'kb',
    });
  }

  /**
   * 커스텀 메트릭 추가
   */
  addCustomMetric(metric: CustomMetric) {
    const metrics = this.metrics.get(metric.name) || [];
    metrics.push(metric);
    this.metrics.set(metric.name, metrics);

    // 개발 모드에서 콘솔 로그
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance Metric: ${metric.name} = ${metric.value}${metric.unit || ''}`);
    }
  }

  /**
   * Web Vitals 메트릭 추가
   */
  private addWebVitalMetric(metric: WebVitalMetric) {
    this.webVitalsMetrics.push(metric);

    if (process.env.NODE_ENV === 'development') {
      const emoji =
        metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
      console.log(`${emoji} ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
    }
  }

  /**
   * 성능 리포트 생성
   */
  generateReport(): PerformanceReport {
    if (typeof window === 'undefined') {
      return {
        timestamp: Date.now(),
        url: '',
        userAgent: '',
        connection: null,
        webVitals: [],
        customMetrics: [],
        bundleStats: { totalSize: 0, chunkSizes: {}, loadTime: 0 },
        memoryUsage: null,
      };
    }

    const connection = (navigator as any).connection || null;
    const memory = (performance as any).memory || null;

    return {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: connection
        ? {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
          }
        : null,
      webVitals: this.webVitalsMetrics,
      customMetrics: Array.from(this.metrics.values()).flat(),
      bundleStats: this.calculateBundleStats(),
      memoryUsage: memory
        ? {
            usedJSMemory: memory.usedJSMemory,
            totalJSMemory: memory.totalJSMemory,
            jsMemoryLimit: memory.jsMemoryLimit,
          }
        : null,
    };
  }

  /**
   * 번들 통계 계산
   */
  private calculateBundleStats() {
    const bundleSizeMetric = this.metrics.get('bundle_total_size')?.[0];
    const loadTimeMetric = this.metrics.get('page_load_time')?.[0];

    return {
      totalSize: bundleSizeMetric?.value || 0,
      chunkSizes: {},
      loadTime: loadTimeMetric?.value || 0,
    };
  }

  /**
   * 성능 점수 계산
   */
  calculatePerformanceScore(): number {
    let score = 100;

    this.webVitalsMetrics.forEach(metric => {
      switch (metric.rating) {
        case 'poor':
          score -= 20;
          break;
        case 'needs-improvement':
          score -= 10;
          break;
      }
    });

    return Math.max(0, score);
  }

  /**
   * 리소스 타입 추출
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) return 'image';
    return 'other';
  }

  /**
   * 청크 이름 추출
   */
  private extractChunkName(url: string): string {
    const match = url.match(/\/static\/js\/(.+?)\.chunk\.js/);
    return match ? match[1] : 'main';
  }

  // Rating 함수들
  private getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  private getFIDRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  private getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  private getFCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 1800) return 'good';
    if (value <= 3000) return 'needs-improvement';
    return 'poor';
  }

  private getTTFBRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 800) return 'good';
    if (value <= 1800) return 'needs-improvement';
    return 'poor';
  }

  /**
   * 정리 함수
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
    this.webVitalsMetrics = [];
  }
}

// 전역 성능 모니터 인스턴스
export const performanceMonitor = new PerformanceMonitor();

/**
 * React Hook for performance monitoring
 */
export const usePerformanceMonitoring = () => {
  const addMetric = (
    name: string,
    value: number,
    category: CustomMetric['category'] = 'interactivity'
  ) => {
    performanceMonitor.addCustomMetric({
      name,
      value,
      timestamp: Date.now(),
      category,
      unit: 'ms',
    });
  };

  const generateReport = () => performanceMonitor.generateReport();
  const getScore = () => performanceMonitor.calculatePerformanceScore();

  return {
    addMetric,
    generateReport,
    getScore,
  };
};

/**
 * 성능 최적화 결과 요약
 */
export const getOptimizationSummary = () => {
  const report = performanceMonitor.generateReport();

  return {
    webVitalsScore: performanceMonitor.calculatePerformanceScore(),
    bundleSize: report.bundleStats.totalSize,
    loadTime: report.bundleStats.loadTime,
    memoryUsage: report.memoryUsage?.usedJSMemory || 0,
    optimizationTips: getPerformanceOptimizationTips(report),
  };
};

/**
 * 성능 최적화 팁 제공
 */
export const getPerformanceOptimizationTips = (report: PerformanceReport): string[] => {
  const tips: string[] = [];

  // Web Vitals 기반 팁
  report.webVitals.forEach(metric => {
    if (metric.rating === 'poor') {
      switch (metric.name) {
        case 'LCP':
          tips.push('LCP 개선: 이미지 최적화, 폰트 최적화, 중요한 리소스 우선 로드를 고려하세요.');
          break;
        case 'FID':
          tips.push('FID 개선: JavaScript 실행 시간을 줄이고, 코드 스플리팅을 적용하세요.');
          break;
        case 'CLS':
          tips.push(
            'CLS 개선: 이미지와 광고에 명시적 크기를 지정하고, 동적 콘텐츠 삽입을 최소화하세요.'
          );
          break;
      }
    }
  });

  // 번들 크기 기반 팁
  if (report.bundleStats.totalSize > 500) {
    tips.push('번들 크기가 큽니다. Tree shaking과 코드 스플리팅을 적용하여 크기를 줄이세요.');
  }

  // 메모리 사용량 기반 팁
  if (report.memoryUsage && report.memoryUsage.usedJSMemory > 50 * 1024 * 1024) {
    tips.push('메모리 사용량이 높습니다. 메모리 누수를 확인하고 불필요한 객체 참조를 정리하세요.');
  }

  return tips;
};
