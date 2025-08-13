/**
 * 거래내역 관련 도메인 타입 정의
 */
import {
  TransactionId,
  AccountId,
  AccountNumber,
  ISODateString,
  Money
} from '../../../shared/types/common.types';
// 거래내역 엔티티
export interface Transaction {
  id: TransactionId;
  accountId: AccountId;
  transactionType: TransactionType;
  transactionCategory: TransactionCategory;
  amount: number;
  currency: 'KRW';
  balanceAfter: number;
  description: string;
  memo?: string;
  targetAccount?: AccountNumber;
  targetName?: string;
  targetBank?: string;
  transactionDate: ISODateString;
  processedDate: ISODateString;
  status: TransactionStatus;
  referenceNumber?: string;
  fee?: number;
  createdAt: ISODateString;
}
// 거래 타입
export enum TransactionType {
  DEPOSIT = '입금',
  WITHDRAWAL = '출금',
  TRANSFER = '이체',
  PAYMENT = '결제',
  INTEREST = '이자',
  FEE = '수수료',
}
// 거래 카테고리
export enum TransactionCategory {
  SALARY = 'SALARY',              // 급여
  TRANSFER_IN = 'TRANSFER_IN',    // 이체입금
  TRANSFER_OUT = 'TRANSFER_OUT',  // 이체출금
  SHOPPING = 'SHOPPING',          // 쇼핑
  DINING = 'DINING',              // 외식
  TRANSPORT = 'TRANSPORT',        // 교통
  UTILITY = 'UTILITY',            // 공과금
  HEALTHCARE = 'HEALTHCARE',      // 의료
  EDUCATION = 'EDUCATION',        // 교육
  ENTERTAINMENT = 'ENTERTAINMENT', // 엔터테인먼트
  OTHER = 'OTHER',                // 기타
}
// 거래 상태
export enum TransactionStatus {
  PENDING = 'PENDING',      // 처리중
  COMPLETED = 'COMPLETED',  // 완료
  FAILED = 'FAILED',        // 실패
  CANCELLED = 'CANCELLED',  // 취소
  REVERSED = 'REVERSED',    // 반환
}
// 거래내역 상세
export interface TransactionDetail extends Transaction {
  location?: TransactionLocation;
  device?: TransactionDevice;
  metadata?: Record<string, unknown>;
  relatedTransactionId?: TransactionId;
  reversalReason?: string;
}
// 거래 위치 정보
export interface TransactionLocation {
  merchantName?: string;
  merchantId?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  country?: string;
}
// 거래 디바이스 정보
export interface TransactionDevice {
  type: 'ATM' | 'POS' | 'ONLINE' | 'MOBILE' | 'BRANCH';
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}
// 거래내역 필터
export interface TransactionFilter {
  accountId?: AccountId;
  transactionType?: TransactionType | 'all';
  transactionCategory?: TransactionCategory;
  status?: TransactionStatus;
  startDate?: ISODateString;
  endDate?: ISODateString;
  minAmount?: number;
  maxAmount?: number;
  searchText?: string;
  targetAccount?: AccountNumber;
}
// 거래내역 정렬
export interface TransactionSort {
  field: 'date' | 'amount' | 'type';
  order: 'asc' | 'desc';
}
// 거래내역 통계
export interface TransactionStatistics {
  period: {
    start: ISODateString;
    end: ISODateString;
  };
  totalIncome: Money;
  totalExpense: Money;
  netAmount: Money;
  transactionCount: number;
  averageTransaction: Money;
  categoryBreakdown: CategoryStatistics[];
  dailyStatistics?: DailyStatistics[];
}
// 카테고리별 통계
export interface CategoryStatistics {
  category: TransactionCategory;
  amount: Money;
  count: number;
  percentage: number;
}
// 일별 통계
export interface DailyStatistics {
  date: ISODateString;
  income: Money;
  expense: Money;
  count: number;
}
// 거래내역 요약
export interface TransactionSummary {
  accountId: AccountId;
  month: string; // YYYY-MM
  openingBalance: Money;
  closingBalance: Money;
  totalDeposits: Money;
  totalWithdrawals: Money;
  largestDeposit?: Transaction;
  largestWithdrawal?: Transaction;
  frequentMerchants: MerchantSummary[];
}
// 가맹점 요약
export interface MerchantSummary {
  name: string;
  totalAmount: Money;
  transactionCount: number;
  lastTransactionDate: ISODateString;
}
// 거래내역 내보내기 옵션
export interface ExportOptions {
  format: 'PDF' | 'EXCEL' | 'CSV';
  dateRange: {
    start: ISODateString;
    end: ISODateString;
  };
  includeDetails: boolean;
  groupByCategory: boolean;
  language: 'ko' | 'en';
}
// 반복 거래
export interface RecurringTransaction {
  id: string;
  accountId: AccountId;
  name: string;
  amount: Money;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  nextDate: ISODateString;
  endDate?: ISODateString;
  category: TransactionCategory;
  isActive: boolean;
}
// 거래 알림
export interface TransactionAlert {
  id: string;
  transactionId: TransactionId;
  type: 'LARGE_AMOUNT' | 'UNUSUAL_LOCATION' | 'SUSPICIOUS' | 'RECURRING';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  isRead: boolean;
  createdAt: ISODateString;
}
// 타입 가드
export const isTransaction = (value: unknown): value is Transaction => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'accountId' in value &&
    'amount' in value &&
    'transactionType' in value
  );
};
export const isDepositTransaction = (transaction: Transaction): boolean => {
  return transaction.transactionType === TransactionType.DEPOSIT;
};
export const isWithdrawalTransaction = (transaction: Transaction): boolean => {
  return transaction.transactionType === TransactionType.WITHDRAWAL;
};
// 헬퍼 타입
export type TransactionPredicate = (transaction: Transaction) => boolean;
export type TransactionComparator = (a: Transaction, b: Transaction) => number;
export type TransactionMap = Map<TransactionId, Transaction>;