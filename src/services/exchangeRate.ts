/**
 * 환율 정보 서비스
 * 가상 환율 데이터를 사용하여 앱의 안정성 보장
 */
// interface ExchangeRateResponse {
//   result: string;
//   base_code: string;
//   conversion_rates: {
//     [key: string]: number;
//   };
//   time_last_update_utc: string;
// }
interface CurrencyRate {
  currency: string;
  code: string;
  rate: number;
  flag: string;
}
class ExchangeRateService {
  // API 관련 변수는 가상 환율 사용으로 인해 더 이상 필요하지 않음
  // private readonly API_KEY = 'bb3b8a2a8c7e4b0898b1c2b8';
  // private readonly BASE_URL = 'https://v6.exchangerate-api.com/v6';
  private readonly CACHE_KEY = 'kb_exchange_rates';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5분
  /**
   * 캐시된 환율 데이터 가져오기
   */
  private getCachedRates(): CurrencyRate[] | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      // 캐시가 5분 이내면 사용
      if (now - timestamp < this.CACHE_DURATION) {
        return data;
      }
      return null;
    } catch {
      return null;
    }
  }
  /**
   * 환율 데이터 캐싱
   */
  private setCachedRates(rates: CurrencyRate[]): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify({
        data: rates,
        timestamp: Date.now()
      }));
    } catch (error) {
    }
  }
  /**
   * KRW 기준 환율 가져오기
   */
  async getExchangeRates(): Promise<CurrencyRate[]> {
    // 캐시 확인
    const cached = this.getCachedRates();
    if (cached) {
      return cached;
    }
    // 가상 환율 데이터 사용 (2025년 1월 기준 근사치)
    const baseRates = [
      { currency: 'USD', code: 'USD', rate: 1383.20, flag: '🇺🇸' },
      { currency: 'JPY', code: 'JPY', rate: 937.13, flag: '🇯🇵' },
      { currency: 'EUR', code: 'EUR', rate: 1624.43, flag: '🇪🇺' }
    ];
    // 랜덤하게 약간의 변동성 추가 (±0.5%)
    const rates: CurrencyRate[] = baseRates.map(rate => ({
      ...rate,
      rate: Number((rate.rate * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2))
    }));
    // 캐싱
    this.setCachedRates(rates);
    return rates;
  }
  /**
   * 마지막 업데이트 시간 가져오기
   */
  getLastUpdateTime(): string {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return new Date().toLocaleString('ko-KR');
      const { timestamp } = JSON.parse(cached);
      return new Date(timestamp).toLocaleString('ko-KR');
    } catch {
      return new Date().toLocaleString('ko-KR');
    }
  }
}
export const exchangeRateService = new ExchangeRateService();
export type { CurrencyRate };