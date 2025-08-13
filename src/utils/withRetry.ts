import { safeLog } from './errorHandler';
interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}
/**
 * 비동기 함수에 재시도 로직을 추가하는 유틸리티
 * @param fn 실행할 비동기 함수
 * @param options 재시도 옵션
 * @returns 재시도 로직이 추가된 함수
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoff = true,
    onRetry
  } = options;
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) {
        safeLog('error', `모든 재시도 실패 (${maxAttempts}회)`, lastError);
        throw lastError;
      }
      // 재시도 가능한 에러인지 확인
      if (!isRetryableError(lastError)) {
        safeLog('warn', '재시도 불가능한 에러', lastError);
        throw lastError;
      }
      // 재시도 대기 시간 계산
      const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;
      const maxDelay = 10000; // 최대 10초
      const actualDelay = Math.min(delay, maxDelay);
      safeLog('info', `재시도 ${attempt}/${maxAttempts} - ${actualDelay}ms 대기`);
      if (onRetry) {
        onRetry(attempt, lastError);
      }
      await sleep(actualDelay);
    }
  }
  throw lastError || new Error('알 수 없는 오류');
}
/**
 * 재시도 가능한 에러인지 확인
 */
function isRetryableError(error: Error): boolean {
  // 네트워크 에러
  if (error.message.includes('fetch')) return true;
  if (error.message.includes('network')) return true;
  if (error.message.includes('Network')) return true;
  // 타임아웃
  if (error.message.includes('timeout')) return true;
  if (error.message.includes('Timeout')) return true;
  // 서버 에러 (5xx)
  if (error.message.includes('500')) return true;
  if (error.message.includes('502')) return true;
  if (error.message.includes('503')) return true;
  if (error.message.includes('504')) return true;
  // 429 Too Many Requests
  if (error.message.includes('429')) return true;
  // Supabase 특정 에러
  if (error.message.includes('FetchError')) return true;
  if (error.message.includes('PGRST')) return true;
  return false;
}
/**
 * 지정된 시간 동안 대기
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * 여러 비동기 작업을 병렬로 실행하면서 재시도 로직 적용
 */
export async function batchWithRetry<T>(
  fns: Array<() => Promise<T>>,
  options: RetryOptions = {}
): Promise<T[]> {
  return Promise.all(
    fns.map(fn => withRetry(fn, options))
  );
}
/**
 * 데코레이터 패턴으로 재시도 로직 적용
 */
export function retryable(options: RetryOptions = {}) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      return withRetry(
        () => originalMethod.apply(this, args),
        options
      );
    };
    return descriptor;
  };
}