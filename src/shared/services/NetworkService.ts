/**
 * KB 스타뱅킹 네트워크 서비스
 * - Android WebView 최적화
 * - 네트워크 상태 감지
 * - 자동 재시도 로직
 * - 오프라인 감지 및 처리
 * - 백엔드 연동 최적화
 */

export interface NetworkStatus {
  isOnline: boolean;
  connectionType: 'wifi' | 'cellular' | 'unknown';
  effectiveType: '2g' | '3g' | '4g' | 'unknown';
  rtt: number; // Round Trip Time
  downlink: number; // Mbps
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition?: (error: any) => boolean;
}

export interface ApiRequestOptions extends RequestInit {
  timeout?: number;
  retry?: RetryConfig;
  skipRetryOn?: number[]; // HTTP status codes to skip retry
  cacheKey?: string;
  cacheTTL?: number;
}

class NetworkService {
  private static instance: NetworkService;
  private networkStatus: NetworkStatus;
  private listeners: ((status: NetworkStatus) => void)[] = [];
  private isAndroid: boolean;
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryCondition: (error) => {
      // 5xx 서버 오류나 네트워크 오류만 재시도
      const status = error.response?.status;
      return !status || status >= 500 || error.name === 'NetworkError';
    }
  };

  private constructor() {
    this.isAndroid = /Android/i.test(navigator.userAgent);
    this.networkStatus = this.getCurrentNetworkStatus();
    this.setupNetworkListeners();
  }

  static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  /**
   * 현재 네트워크 상태 가져오기
   */
  private getCurrentNetworkStatus(): NetworkStatus {
    const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;

    return {
      isOnline: navigator.onLine,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown',
      rtt: connection?.rtt || 0,
      downlink: connection?.downlink || 0
    };
  }

  /**
   * 네트워크 상태 변화 리스너 설정
   */
  private setupNetworkListeners(): void {
    // 기본 온라인/오프라인 이벤트
    window.addEventListener('online', this.handleNetworkChange.bind(this));
    window.addEventListener('offline', this.handleNetworkChange.bind(this));

    // Android WebView에서 더 정확한 네트워크 감지
    if (this.isAndroid) {
      // Connection API 이벤트
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', this.handleNetworkChange.bind(this));
      }

      // Android WebView 특정 이벤트
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          // 앱이 포그라운드로 돌아올 때 네트워크 상태 재확인
          setTimeout(() => this.checkNetworkConnectivity(), 100);
        }
      });
    }

    // 주기적 네트워크 상태 확인 (Android WebView에서 중요)
    if (this.isAndroid) {
      setInterval(() => this.checkNetworkConnectivity(), 30000); // 30초마다
    }
  }

  /**
   * 네트워크 변화 핸들러
   */
  private handleNetworkChange(): void {
    const previousStatus = this.networkStatus;
    this.networkStatus = this.getCurrentNetworkStatus();

    // 상태가 실제로 변화했을 때만 리스너 호출
    if (previousStatus.isOnline !== this.networkStatus.isOnline ||
        previousStatus.connectionType !== this.networkStatus.connectionType) {
      this.notifyListeners();
      
      // Android WebView 로그
      if (this.isAndroid) {
        console.log(`[NetworkService] 네트워크 상태 변화: ${this.networkStatus.isOnline ? '온라인' : '오프라인'} (${this.networkStatus.connectionType})`);
      }
    }
  }

  /**
   * 네트워크 연결성 실제 확인
   */
  private async checkNetworkConnectivity(): Promise<void> {
    try {
      // 실제 서버에 핑 요청으로 연결성 확인
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const isActuallyOnline = response.ok;
      if (this.networkStatus.isOnline !== isActuallyOnline) {
        this.networkStatus.isOnline = isActuallyOnline;
        this.notifyListeners();
      }
    } catch (error) {
      // 연결 실패 시 오프라인으로 처리
      if (this.networkStatus.isOnline) {
        this.networkStatus.isOnline = false;
        this.notifyListeners();
      }
    }
  }

  /**
   * 네트워크 상태 리스너 등록
   */
  public addNetworkListener(callback: (status: NetworkStatus) => void): () => void {
    this.listeners.push(callback);
    // 즉시 현재 상태 알림
    callback(this.networkStatus);

    // 리스너 제거 함수 반환
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 리스너들에게 상태 변화 알림
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.networkStatus));
  }

  /**
   * 현재 네트워크 상태 반환
   */
  public getNetworkStatus(): NetworkStatus {
    return { ...this.networkStatus };
  }

  /**
   * 네트워크 연결 상태 확인
   */
  public isOnline(): boolean {
    return this.networkStatus.isOnline;
  }

  /**
   * 연결 품질 평가
   */
  public getConnectionQuality(): 'poor' | 'moderate' | 'good' | 'excellent' {
    const { effectiveType, rtt, downlink } = this.networkStatus;
    
    if (effectiveType === '2g' || rtt > 2000 || downlink < 0.5) {
      return 'poor';
    }
    if (effectiveType === '3g' || rtt > 1000 || downlink < 1.5) {
      return 'moderate';
    }
    if (rtt > 500 || downlink < 5) {
      return 'good';
    }
    return 'excellent';
  }

  /**
   * 재시도 로직이 포함된 안전한 fetch
   */
  public async safeFetch(
    url: string, 
    options: ApiRequestOptions = {}
  ): Promise<Response> {
    const { retry = this.defaultRetryConfig, timeout = 30000, skipRetryOn = [], ...fetchOptions } = options;

    return this.executeWithRetry(async () => {
      // 오프라인 상태 확인
      if (!this.isOnline()) {
        throw new Error('네트워크에 연결되어 있지 않습니다.');
      }

      // Android WebView 최적화: AbortController 사용
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        // Android WebView에서 CORS 및 캐싱 최적화
        const androidOptimizedOptions = this.isAndroid ? {
          ...fetchOptions,
          signal: controller.signal,
          cache: 'no-cache' as RequestCache,
          mode: 'cors' as RequestMode,
          credentials: 'same-origin' as RequestCredentials,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            ...fetchOptions.headers
          }
        } : {
          ...fetchOptions,
          signal: controller.signal
        };

        const response = await fetch(url, androidOptimizedOptions);
        clearTimeout(timeoutId);

        // 재시도하지 않을 상태 코드 확인
        if (skipRetryOn.includes(response.status)) {
          return response;
        }

        // 4xx 클라이언트 오류는 재시도하지 않음
        if (response.status >= 400 && response.status < 500) {
          return response;
        }

        // 5xx 서버 오류는 재시도 가능
        if (!response.ok && response.status >= 500) {
          throw new Error(`서버 오류: ${response.status} ${response.statusText}`);
        }

        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    }, retry);
  }

  /**
   * 재시도 로직 실행
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig
  ): Promise<T> {
    let lastError: any;
    let attempt = 0;

    while (attempt <= config.maxRetries) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        attempt++;

        // 재시도 조건 확인
        if (attempt > config.maxRetries || 
            (config.retryCondition && !config.retryCondition(error))) {
          break;
        }

        // 지수 백오프 딜레이
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxDelay
        );

        console.log(`[NetworkService] 재시도 ${attempt}/${config.maxRetries} (${delay}ms 후)`);
        
        await this.delay(delay);

        // Android WebView에서 네트워크 상태 재확인
        if (this.isAndroid) {
          await this.checkNetworkConnectivity();
          if (!this.isOnline()) {
            throw new Error('네트워크 연결이 끊어졌습니다.');
          }
        }
      }
    }

    throw lastError;
  }

  /**
   * 지연 함수
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 네트워크 상태 기반 타임아웃 계산
   */
  public getOptimalTimeout(): number {
    const quality = this.getConnectionQuality();
    const baseTimeout = 15000; // 15초 기본

    switch (quality) {
      case 'poor': return baseTimeout * 3;     // 45초
      case 'moderate': return baseTimeout * 2;  // 30초
      case 'good': return baseTimeout * 1.5;   // 22.5초
      case 'excellent': return baseTimeout;    // 15초
      default: return baseTimeout;
    }
  }

  /**
   * Android WebView 특화 네트워크 최적화 설정
   */
  public getAndroidOptimizedHeaders(): Record<string, string> {
    if (!this.isAndroid) return {};

    return {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Encoding': 'gzip, deflate'
    };
  }
}

// 싱글톤 인스턴스 내보내기
export const networkService = NetworkService.getInstance();

// 편의 함수들
export const isOnline = () => networkService.isOnline();
export const getNetworkStatus = () => networkService.getNetworkStatus();
export const addNetworkListener = (callback: (status: NetworkStatus) => void) => 
  networkService.addNetworkListener(callback);
export const safeFetch = (url: string, options?: ApiRequestOptions) => 
  networkService.safeFetch(url, options);