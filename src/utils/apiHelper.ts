import { safeLog } from './errorHandler';
export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
}
const defaultRetryOptions: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryCondition: (error) => {
    // 네트워크 에러나 5xx 서버 에러인 경우에만 재시도
    if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
      return true;
    }
    if (error.status >= 500 && error.status < 600) {
      return true;
    }
    return false;
  }
};
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const opts = { ...defaultRetryOptions, ...options };
  let lastError: any;
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      // 재시도 조건 확인
      if (!opts.retryCondition(error) || attempt === opts.maxRetries) {
        throw error;
      }
      // 지수 백오프 계산
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffFactor, attempt),
        opts.maxDelay
      );
      safeLog('info', `🔄 재시도 ${attempt + 1}/${opts.maxRetries} - ${delay}ms 대기`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
// 병렬 요청 처리 헬퍼
export async function batchRequests<T>(
  requests: (() => Promise<T>)[],
  options?: {
    maxConcurrent?: number;
    onProgress?: (completed: number, total: number) => void;
  }
): Promise<T[]> {
  const maxConcurrent = options?.maxConcurrent || 5;
  const results: T[] = [];
  const executing: Promise<void>[] = [];
  for (let i = 0; i < requests.length; i++) {
    const request = requests[i];
    const promise = request().then(result => {
      results[i] = result;
      options?.onProgress?.(results.filter(r => r !== undefined).length, requests.length);
    });
    executing.push(promise);
    if (executing.length >= maxConcurrent) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }
  await Promise.all(executing);
  return results;
}
// 디바운스 헬퍼
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
// 쓰로틀 헬퍼
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}