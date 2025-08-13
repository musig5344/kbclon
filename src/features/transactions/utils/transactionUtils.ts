import { Transaction } from '../../../services/api';
import { FilterState as FilterModalState } from '../components/TransactionFilterModal';

/**
 * 날짜 범위 계산 함수
 * @param period - 기간 문자열 ('오늘', '1개월', '3개월', '6개월')
 * @returns 시작일과 종료일 정보
 */
export const calculateDateRange = (period: string) => {
  const now = new Date();
  let startDate: Date;
  let endDate = now;

  switch (period) {
    case '오늘':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case '1개월':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case '3개월':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    case '6개월':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  }

  return {
    start: startDate.toISOString().split('T')[0].replace(/-/g, '.'),
    end: endDate.toISOString().split('T')[0].replace(/-/g, '.'),
    startISO: startDate.toISOString(),
    endISO: endDate.toISOString()
  };
};

/**
 * 검색바 placeholder 생성 함수
 * @param appliedFilters - 적용된 필터 상태
 * @returns placeholder 문자열
 */
export const getSearchPlaceholder = (appliedFilters: FilterModalState): string => {
  return `${appliedFilters.period} · ${appliedFilters.type} · ${appliedFilters.sort}`;
};

/**
 * 거래내역을 월별로 그룹핑하는 함수
 * @param transactions - 거래내역 배열
 * @returns 월별로 그룹핑된 거래내역 객체
 */
export const groupTransactionsByMonth = (transactions: Transaction[]): { [key: string]: Transaction[] } => {
  const groups: { [key: string]: Transaction[] } = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.transaction_date);
    const monthKey = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(transaction);
  });
  
  return groups;
};

/**
 * 필터가 기본값에서 변경되었는지 확인하는 함수
 * @param filters - 현재 필터 상태
 * @returns 필터가 변경되었는지 여부
 */
export const isFilterModified = (filters: FilterModalState): boolean => {
  return (
    filters.period !== '3개월' || 
    filters.type !== '전체' || 
    filters.sort !== '최신순' ||
    filters.amount.min !== '' ||
    filters.amount.max !== ''
  );
};

/**
 * 기본 필터 상태 반환
 * @returns 기본 필터 상태 객체
 */
export const getDefaultFilters = (): FilterModalState => {
  return {
    period: '3개월',
    type: '전체',
    sort: '최신순',
    amount: { min: '', max: '' }
  };
};

/**
 * 날짜 문자열을 YYYY.MM.DD 형식으로 포맷팅
 * @param dateString - ISO 날짜 문자열
 * @returns 포맷팅된 날짜 문자열
 */
export const formatDateDisplay = (dateString: string): string => {
  return dateString.split('T')[0].replace(/-/g, '.');
};

/**
 * 금액 문자열에서 콤마를 제거하고 숫자로 변환
 * @param amountString - 금액 문자열
 * @returns 숫자 타입의 금액
 */
export const parseAmountString = (amountString: string): number => {
  return parseInt(amountString.replace(/,/g, ''));
};