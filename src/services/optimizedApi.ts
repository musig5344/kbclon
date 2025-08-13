/**
 * 최적화된 API 서비스
 * - 요청 중복 제거
 * - 응답 캐싱
 * - 자동 재시도
 * - 요청 배칭
 */

import { supabase } from '../infrastructure/db/supabase';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

class OptimizedApiService {
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, PendingRequest>();
  private batchQueue = new Map<string, any[]>();
  private batchTimers = new Map<string, NodeJS.Timeout>();

  // 캐시 설정
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5분
  private readonly CACHE_PREFIX = 'api_cache_';

  constructor() {
    // LocalStorage에서 캐시 복원
    this.restoreCache();
    
    // 페이지 언로드 시 캐시 저장
    window.addEventListener('beforeunload', () => this.saveCache());
  }

  /**
   * 캐시된 API 호출
   */
  async cachedRequest<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: {
      ttl?: number;
      forceRefresh?: boolean;
      dedupe?: boolean;
    }
  ): Promise<T> {
    const { ttl = this.DEFAULT_TTL, forceRefresh = false, dedupe = true } = options || {};

    // 강제 새로고침이 아니면 캐시 확인
    if (!forceRefresh) {
      const cached = this.getFromCache(key);
      if (cached !== null) {
        return cached;
      }
    }

    // 중복 요청 제거
    if (dedupe) {
      const pending = this.pendingRequests.get(key);
      if (pending && Date.now() - pending.timestamp < 10000) {
        return pending.promise;
      }
    }

    // 새 요청 생성
    const promise = fetcher()
      .then(data => {
        this.setCache(key, data, ttl);
        this.pendingRequests.delete(key);
        return data;
      })
      .catch(error => {
        this.pendingRequests.delete(key);
        throw error;
      });

    // 진행 중인 요청으로 등록
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    });

    return promise;
  }

  /**
   * 배치 API 요청
   */
  async batchRequest<T>(
    batchKey: string,
    item: any,
    batchProcessor: (items: any[]) => Promise<T[]>,
    delay: number = 50
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // 배치 큐에 추가
      if (!this.batchQueue.has(batchKey)) {
        this.batchQueue.set(batchKey, []);
      }
      
      const queue = this.batchQueue.get(batchKey)!;
      const itemIndex = queue.length;
      queue.push({ item, resolve, reject });

      // 기존 타이머 취소
      const existingTimer = this.batchTimers.get(batchKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // 새 타이머 설정
      const timer = setTimeout(async () => {
        const items = this.batchQueue.get(batchKey) || [];
        this.batchQueue.delete(batchKey);
        this.batchTimers.delete(batchKey);

        if (items.length === 0) return;

        try {
          const results = await batchProcessor(items.map(i => i.item));
          items.forEach((item, index) => {
            item.resolve(results[index]);
          });
        } catch (error) {
          items.forEach(item => {
            item.reject(error);
          });
        }
      }, delay);

      this.batchTimers.set(batchKey, timer);
    });
  }

  /**
   * 자동 재시도 요청
   */
  async retryableRequest<T>(
    fetcher: () => Promise<T>,
    options?: {
      maxRetries?: number;
      retryDelay?: number;
      shouldRetry?: (error: any) => boolean;
    }
  ): Promise<T> {
    const { 
      maxRetries = 3, 
      retryDelay = 1000,
      shouldRetry = (error) => error.status >= 500 || error.code === 'NETWORK_ERROR'
    } = options || {};

    let lastError: any;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fetcher();
      } catch (error) {
        lastError = error;
        
        if (i < maxRetries && shouldRetry(error)) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
        } else {
          break;
        }
      }
    }

    throw lastError;
  }

  /**
   * 캐시 관리
   */
  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  clearCache(pattern?: string): void {
    if (pattern) {
      Array.from(this.cache.keys())
        .filter(key => key.includes(pattern))
        .forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  /**
   * LocalStorage 연동
   */
  private saveCache(): void {
    try {
      const cacheData: Record<string, CacheEntry> = {};
      this.cache.forEach((value, key) => {
        // TTL이 남은 항목만 저장
        if (Date.now() - value.timestamp < value.ttl) {
          cacheData[key] = value;
        }
      });
      
      localStorage.setItem(this.CACHE_PREFIX + 'data', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  private restoreCache(): void {
    try {
      const saved = localStorage.getItem(this.CACHE_PREFIX + 'data');
      if (!saved) return;

      const cacheData = JSON.parse(saved) as Record<string, CacheEntry>;
      Object.entries(cacheData).forEach(([key, value]) => {
        // 유효한 캐시만 복원
        if (Date.now() - value.timestamp < value.ttl) {
          this.cache.set(key, value);
        }
      });
    } catch (error) {
      console.error('Failed to restore cache:', error);
    }
  }
}

// 싱글톤 인스턴스
export const optimizedApi = new OptimizedApiService();

/**
 * 실제 사용 예제
 */

// 계좌 정보 조회 (캐싱됨)
export const getAccountCached = async (accountId: string) => {
  return optimizedApi.cachedRequest(
    `account_${accountId}`,
    async () => {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .single();
      
      if (error) throw error;
      return data;
    },
    { ttl: 10 * 60 * 1000 } // 10분 캐시
  );
};

// 거래내역 조회 (캐싱 + 중복 제거)
export const getTransactionsCached = async (accountId: string, page: number = 1) => {
  return optimizedApi.cachedRequest(
    `transactions_${accountId}_${page}`,
    async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_id', accountId)
        .order('transaction_date', { ascending: false })
        .range((page - 1) * 50, page * 50 - 1);
      
      if (error) throw error;
      return data;
    },
    { ttl: 5 * 60 * 1000 } // 5분 캐시
  );
};

// 배치 거래 생성
export const createTransactionsBatch = async (transactions: any[]) => {
  return Promise.all(
    transactions.map(tx => 
      optimizedApi.batchRequest(
        'create_transactions',
        tx,
        async (items) => {
          const { data, error } = await supabase
            .from('transactions')
            .insert(items)
            .select();
          
          if (error) throw error;
          return data;
        },
        100 // 100ms 대기 후 배치 처리
      )
    )
  );
};

// 네트워크 에러 시 재시도
export const transferWithRetry = async (transferData: any) => {
  return optimizedApi.retryableRequest(
    async () => {
      const { data, error } = await supabase
        .from('transfers')
        .insert(transferData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    {
      maxRetries: 3,
      retryDelay: 2000,
      shouldRetry: (error) => {
        // 네트워크 에러나 서버 에러일 때만 재시도
        return error.code === 'NETWORK_ERROR' || 
               error.status >= 500 ||
               error.message?.includes('fetch failed');
      }
    }
  );
};

// 캐시 무효화 헬퍼
export const invalidateAccountCache = (accountId: string) => {
  optimizedApi.clearCache(`account_${accountId}`);
};

export const invalidateTransactionsCache = (accountId: string) => {
  optimizedApi.clearCache(`transactions_${accountId}`);
};

export default optimizedApi;