// 거래내역 타입 정의
export type Transaction = {
  id: string;
  date: string;
  time: string;
  desc: string;
  amount: number;
  balance: number;
  type: 'income' | 'expense';
};

// 필터 관련 타입 정의
export type FilterPeriod = '오늘' | '1개월' | '3개월' | '6개월' | '직접입력';
export type FilterType = '전체' | '입금' | '출금';
export type FilterSort = '최신순' | '과거순';

// 필터 옵션 타입
export interface FilterOptions {
  period: FilterPeriod;
  type: FilterType;
  sort: FilterSort;
  startDate?: string;
  endDate?: string;
}

// 날짜 범위 타입
export interface DateRange {
  startDate: Date;
  endDate: Date;
}