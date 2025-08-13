/**
 * KB 스타뱅킹 강화된 API 서비스
 * - 기존 API 서비스 확장
 * - 네트워크 서비스 통합
 * - 로딩 상태 자동 관리
 * - 에러 처리 및 알림 통합
 * - Android WebView 최적화
 * - 백엔드 연동 완전 자동화
 */

import { apiService, Account, Transaction, TransactionFilter, TransactionResponse, TransferRequest } from '../../services/api';
import { handleApiError, safeLog, ErrorType } from '../utils/errorHandler';

import { networkService, NetworkStatus, RetryConfig } from './NetworkService';

// 타입 정의
export interface ApiCallOptions {
  loadingKey?: string;
  loadingMessage?: string;
  showSuccessMessage?: boolean;
  successMessage?: string;
  showErrorNotification?: boolean;
  skipNetworkCheck?: boolean;
  retryConfig?: Partial<RetryConfig>;
  silentMode?: boolean; // 알림 없이 실행
  cacheStrategy?: 'cache-first' | 'network-first' | 'cache-only' | 'network-only';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  networkStatus?: NetworkStatus;
  fromCache?: boolean;
  retryCount?: number;
}

// 로딩 및 알림 관리 클래스 (싱글톤으로 구현하여 메모리 효율성 확보)
class LoadingNotificationManager {
  private static instance: LoadingNotificationManager;
  private loadingCallbacks: {
    start: (key: string, message?: string) => void;
    stop: (key: string) => void;
    update: (key: string, message: string) => void;
  } | null = null;
  
  private notificationCallbacks: {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showApiError: (error: any, context?: string) => void;
    showNetworkError: (retryCallback?: () => void) => void;
  } | null = null;

  static getInstance(): LoadingNotificationManager {
    if (!LoadingNotificationManager.instance) {
      LoadingNotificationManager.instance = new LoadingNotificationManager();
    }
    return LoadingNotificationManager.instance;
  }

  setLoadingCallbacks(callbacks: typeof this.loadingCallbacks) {
    this.loadingCallbacks = callbacks;
  }

  setNotificationCallbacks(callbacks: typeof this.notificationCallbacks) {
    this.notificationCallbacks = callbacks;
  }

  startLoading(key: string, message?: string) {
    this.loadingCallbacks?.start(key, message);
  }

  stopLoading(key: string) {
    this.loadingCallbacks?.stop(key);
  }

  updateLoading(key: string, message: string) {
    this.loadingCallbacks?.update(key, message);
  }

  showSuccess(message: string) {
    this.notificationCallbacks?.showSuccess(message);
  }

  showError(message: string) {
    this.notificationCallbacks?.showError(message);
  }

  showApiError(error: any, context?: string) {
    this.notificationCallbacks?.showApiError(error, context);
  }

  showNetworkError(retryCallback?: () => void) {
    this.notificationCallbacks?.showNetworkError(retryCallback);
  }
}

// 강화된 API 서비스 클래스
class EnhancedApiService {
  private static instance: EnhancedApiService;
  private manager = LoadingNotificationManager.getInstance();
  private isAndroid: boolean;
  
  // API 호출 통계 (Android WebView 성능 모니터링)
  private callStats = {
    total: 0,
    success: 0,
    failed: 0,
    cached: 0,
    retried: 0
  };

  private constructor() {
    this.isAndroid = /Android/i.test(navigator.userAgent);
    
    // 네트워크 상태 변화 감지
    networkService.addNetworkListener((status) => {
      if (!status.isOnline) {
        this.handleOfflineMode();
      } else {
        this.handleOnlineMode();
      }
    });
  }

  static getInstance(): EnhancedApiService {
    if (!EnhancedApiService.instance) {
      EnhancedApiService.instance = new EnhancedApiService();
    }
    return EnhancedApiService.instance;
  }

  // 로딩 및 알림 콜백 설정
  setCallbacks(loadingCallbacks: any, notificationCallbacks: any) {
    this.manager.setLoadingCallbacks(loadingCallbacks);
    this.manager.setNotificationCallbacks(notificationCallbacks);
  }

  /**
   * 오프라인 모드 처리
   */
  private handleOfflineMode() {
    safeLog('warn', '[EnhancedApiService] 오프라인 모드 전환');
    // 오프라인 상태를 사용자에게 알림 (한 번만)
    if (!this.hasShownOfflineNotification) {
      this.manager.showNetworkError(() => {
        // 네트워크 재연결 시도
        window.location.reload();
      });
      this.hasShownOfflineNotification = true;
    }
  }

  private hasShownOfflineNotification = false;

  /**
   * 온라인 모드 처리
   */
  private handleOnlineMode() {
    safeLog('info', '[EnhancedApiService] 온라인 모드 복구');
    this.hasShownOfflineNotification = false;
    
    if (this.isAndroid) {
      // Android WebView에서 복구 시 성공 메시지
      this.manager.showSuccess('네트워크 연결이 복구되었습니다.');
    }
  }

  /**
   * API 호출 래퍼
   */
  private async executeApiCall<T>(
    apiCall: () => Promise<T>,
    options: ApiCallOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      loadingKey,
      loadingMessage,
      showSuccessMessage = false,
      successMessage,
      showErrorNotification = true,
      skipNetworkCheck = false,
      retryConfig,
      silentMode = false,
      cacheStrategy = 'network-first'
    } = options;

    let retryCount = 0;
    const startTime = Date.now();

    try {
      this.callStats.total++;

      // 네트워크 상태 확인
      if (!skipNetworkCheck && !networkService.isOnline()) {
        throw new Error('네트워크에 연결되어 있지 않습니다.');
      }

      // 로딩 시작
      if (loadingKey && !silentMode) {
        this.manager.startLoading(loadingKey, loadingMessage);
      }

      // Android WebView에서 최적 타임아웃 적용
      const timeout = this.isAndroid ? networkService.getOptimalTimeout() : 30000;

      // 재시도 로직이 포함된 API 호출
      const executeCall = async (): Promise<T> => {
        try {
          const result = await Promise.race([
            apiCall(),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('요청 시간이 초과되었습니다.')), timeout)
            )
          ]);
          return result;
        } catch (error) {
          retryCount++;
          
          // 재시도 조건 확인
          const shouldRetry = retryConfig && 
                             retryCount <= (retryConfig.maxRetries || 3) &&
                             this.shouldRetryOnError(error);
          
          if (shouldRetry) {
            this.callStats.retried++;
            
            // 재시도 알림 (Android에서만)
            if (this.isAndroid && !silentMode) {
              this.manager.updateLoading(
                loadingKey || 'retry',
                `재시도 중... (${retryCount}/${retryConfig.maxRetries || 3})`
              );
            }

            // 지수 백오프 딜레이
            const delay = Math.min(
              (retryConfig.baseDelay || 1000) * Math.pow(retryConfig.backoffMultiplier || 2, retryCount - 1),
              retryConfig.maxDelay || 10000
            );
            
            await new Promise(resolve => setTimeout(resolve, delay));
            return executeCall(); // 재귀 호출
          }

          throw error;
        }
      };

      const result = await executeCall();
      
      // 성공 처리
      this.callStats.success++;
      const endTime = Date.now();
      
      safeLog('info', `[EnhancedApiService] API 호출 성공 (${endTime - startTime}ms, 재시도: ${retryCount}회)`);

      // 성공 메시지 표시
      if (showSuccessMessage && !silentMode) {
        this.manager.showSuccess(successMessage || '완료되었습니다.');
      }

      return {
        success: true,
        data: result,
        networkStatus: networkService.getNetworkStatus(),
        retryCount
      };

    } catch (error) {
      // 실패 처리
      this.callStats.failed++;
      const endTime = Date.now();
      
      safeLog('error', `[EnhancedApiService] API 호출 실패 (${endTime - startTime}ms)`, error);

      // 에러 알림 표시
      if (showErrorNotification && !silentMode) {
        if (error instanceof Error && error.message.includes('네트워크')) {
          this.manager.showNetworkError(() => {
            // 재시도 콜백
            this.executeApiCall(apiCall, options);
          });
        } else {
          this.manager.showApiError(error, loadingKey);
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        networkStatus: networkService.getNetworkStatus(),
        retryCount
      };

    } finally {
      // 로딩 종료
      if (loadingKey && !silentMode) {
        this.manager.stopLoading(loadingKey);
      }
    }
  }

  /**
   * 재시도 여부 판단
   */
  private shouldRetryOnError(error: any): boolean {
    // 5xx 서버 오류나 네트워크 오류만 재시도
    const status = error.response?.status;
    if (!status) return true; // 네트워크 오류
    return status >= 500; // 서버 오류
  }

  /**
   * 계좌 목록 조회 (강화)
   */
  async getAccounts(options: ApiCallOptions = {}): Promise<ApiResponse<Account[]>> {
    return this.executeApiCall(
      () => apiService.getAccounts(),
      {
        loadingKey: 'accounts',
        loadingMessage: '',
        ...options
      }
    );
  }

  /**
   * 계좌 상세 조회 (강화)
   */
  async getAccountById(accountId: string, options: ApiCallOptions = {}): Promise<ApiResponse<Account>> {
    return this.executeApiCall(
      () => apiService.getAccountById(accountId),
      {
        loadingKey: 'account-detail',
        loadingMessage: '',
        ...options
      }
    );
  }

  /**
   * 잔액 조회 (강화)
   */
  async getAccountBalance(accountId: string, options: ApiCallOptions = {}): Promise<ApiResponse<{ balance: number; last_updated: string }>> {
    return this.executeApiCall(
      () => apiService.getAccountBalance(accountId),
      {
        loadingKey: 'account-balance',
        loadingMessage: '',
        ...options
      }
    );
  }

  /**
   * 거래내역 조회 (강화)
   */
  async getTransactions(filter: TransactionFilter = {}, options: ApiCallOptions = {}): Promise<ApiResponse<TransactionResponse>> {
    return this.executeApiCall(
      () => apiService.getTransactions(filter),
      {
        loadingKey: 'transactions',
        loadingMessage: '',
        ...options
      }
    );
  }

  /**
   * 거래내역 통계 (강화)
   */
  async getTransactionStatistics(
    accountId?: string,
    period?: 'today' | 'week' | 'month' | '3months' | '6months',
    options: ApiCallOptions = {}
  ) {
    return this.executeApiCall(
      () => apiService.getTransactionStatistics(accountId, period),
      {
        loadingKey: 'transaction-statistics',
        loadingMessage: '',
        ...options
      }
    );
  }

  /**
   * 이체 실행 (강화)
   */
  async executeTransfer(transferRequest: TransferRequest, options: ApiCallOptions = {}): Promise<ApiResponse<any>> {
    return this.executeApiCall(
      () => apiService.executeTransfer(transferRequest),
      {
        loadingKey: 'transfer',
        loadingMessage: '',
        showSuccessMessage: true,
        successMessage: '이체가 완료되었습니다.',
        retryConfig: {
          maxRetries: 2, // 이체는 신중하게 재시도
          baseDelay: 2000,
          maxDelay: 5000,
          backoffMultiplier: 2
        },
        ...options
      }
    );
  }

  /**
   * 이체 내역 조회 (강화)
   */
  async getTransferHistory(accountId?: string, page = 1, limit = 20, options: ApiCallOptions = {}) {
    return this.executeApiCall(
      () => apiService.getTransferHistory(accountId, page, limit),
      {
        loadingKey: 'transfer-history',
        loadingMessage: '',
        ...options
      }
    );
  }

  /**
   * 배치 API 호출 (여러 API를 동시에 호출)
   */
  async batchApiCalls<T extends Record<string, any>>(
    calls: {
      [K in keyof T]: () => Promise<T[K]>;
    },
    options: ApiCallOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.executeApiCall(
      async () => {
        const results = {} as T;
        const promises = Object.entries(calls).map(async ([key, call]) => {
          try {
            const result = await (call as Function)();
            return { key, result, success: true };
          } catch (error) {
            return { key, error, success: false };
          }
        });

        const settled = await Promise.allSettled(promises);
        
        for (const settled_result of settled) {
          if (settled_result.status === 'fulfilled') {
            const { key, result, success } = settled_result.value;
            if (success) {
              (results as any)[key] = result;
            } else {
              throw new Error(`Batch call failed for ${key}: ${settled_result.value.error}`);
            }
          }
        }

        return results;
      },
      {
        loadingKey: 'batch-api',
        loadingMessage: '',
        ...options
      }
    );
  }

  /**
   * 성능 통계 조회
   */
  getPerformanceStats() {
    return {
      ...this.callStats,
      successRate: this.callStats.total > 0 ? (this.callStats.success / this.callStats.total * 100).toFixed(1) + '%' : '0%',
      cacheHitRate: this.callStats.total > 0 ? (this.callStats.cached / this.callStats.total * 100).toFixed(1) + '%' : '0%'
    };
  }

  /**
   * Android WebView 특화 최적화 상태 확인
   */
  getOptimizationStatus() {
    return {
      isAndroid: this.isAndroid,
      isOnline: networkService.isOnline(),
      networkQuality: networkService.getConnectionQuality(),
      networkStatus: networkService.getNetworkStatus(),
      performanceStats: this.getPerformanceStats()
    };
  }

  /**
   * 캐시 정리 (Android WebView 메모리 최적화)
   */
  clearCache() {
    // API 서비스의 캐시 정리는 내부적으로 처리됨
    this.callStats = {
      total: 0,
      success: 0,
      failed: 0,
      cached: 0,
      retried: 0
    };
    
    if (this.isAndroid) {
      safeLog('info', '[EnhancedApiService] Android WebView 캐시 정리 완료');
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const enhancedApiService = EnhancedApiService.getInstance();

// React Hook 연동용 설정 함수
export const configureEnhancedApiService = (
  loadingCallbacks: any,
  notificationCallbacks: any
) => {
  enhancedApiService.setCallbacks(loadingCallbacks, notificationCallbacks);
};