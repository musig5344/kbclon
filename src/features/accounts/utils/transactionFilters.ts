import { Transaction, FilterPeriod, FilterType, FilterSort, FilterOptions, DateRange } from '../types';

/**
 * 선택된 기간에 따른 날짜 범위를 계산하는 함수
 */
export const getPeriodDateRange = (period: FilterPeriod, customStartDate?: string, customEndDate?: string): DateRange => {
  const now = new Date();
  
  switch (period) {
    case '오늘': {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return {
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
    }
    case '1개월': {
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      return {
        startDate: oneMonthAgo,
        endDate: now
      };
    }
    case '3개월': {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      return {
        startDate: threeMonthsAgo,
        endDate: now
      };
    }
    case '6개월': {
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      return {
        startDate: sixMonthsAgo,
        endDate: now
      };
    }
    case '직접입력': {
      const startDate = customStartDate ? new Date(customStartDate.replace(/\./g, '-')) : new Date();
      const endDate = customEndDate ? new Date(customEndDate.replace(/\./g, '-')) : new Date();
      return {
        startDate,
        endDate
      };
    }
    default:
      return {
        startDate: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
        endDate: now
      };
  }
};

/**
 * 날짜 범위에 따라 거래내역을 필터링하는 함수
 */
const filterByDateRange = (transactions: Transaction[], dateRange: DateRange): Transaction[] => {
  return transactions.filter(tx => {
    const txDate = new Date(tx.date.replace(/\./g, '-'));
    return txDate >= dateRange.startDate && txDate <= dateRange.endDate;
  });
};

/**
 * 거래 타입에 따라 거래내역을 필터링하는 함수
 */
const filterByType = (transactions: Transaction[], type: FilterType): Transaction[] => {
  if (type === '전체') {
    return transactions;
  }
  
  return transactions.filter(tx => {
    if (type === '입금') {
      return tx.type === 'income';
    } else if (type === '출금') {
      return tx.type === 'expense';
    }
    return true;
  });
};

/**
 * 정렬 순서에 따라 거래내역을 정렬하는 함수
 */
const sortTransactions = (transactions: Transaction[], sort: FilterSort): Transaction[] => {
  const sorted = [...transactions];
  
  return sorted.sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`.replace(/\./g, '-'));
    const dateB = new Date(`${b.date} ${b.time}`.replace(/\./g, '-'));
    
    if (sort === '최신순') {
      return dateB.getTime() - dateA.getTime();
    } else if (sort === '과거순') {
      return dateA.getTime() - dateB.getTime();
    }
    
    return 0;
  });
};

/**
 * 복합 필터링 로직을 수행하는 메인 함수
 */
export const getFilteredTransactions = (
  transactions: Transaction[], 
  options: FilterOptions
): Transaction[] => {
  let filtered = [...transactions];
  
  // 1. 날짜 범위 필터링
  const dateRange = getPeriodDateRange(options.period, options.startDate, options.endDate);
  filtered = filterByDateRange(filtered, dateRange);
  
  // 2. 거래 타입 필터링
  filtered = filterByType(filtered, options.type);
  
  // 3. 정렬
  filtered = sortTransactions(filtered, options.sort);
  
  return filtered;
};

/**
 * 날짜 문자열을 포맷팅하는 헬퍼 함수
 */
export const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

/**
 * 현재 날짜 기준으로 기본 날짜 범위를 설정하는 함수
 */
export const getDefaultDateRange = (period: FilterPeriod = '3개월'): { startDate: string; endDate: string } => {
  const dateRange = getPeriodDateRange(period);
  return {
    startDate: formatDateString(dateRange.startDate),
    endDate: formatDateString(dateRange.endDate)
  };
};