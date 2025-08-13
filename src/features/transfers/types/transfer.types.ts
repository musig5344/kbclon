/**
 * 이체 관련 도메인 타입 정의
 */
import {
  AccountId,
  AccountNumber,
  TransactionId,
  ISODateString,
  Money
} from '../../../shared/types/common.types';
// 이체 요청
export interface TransferRequest {
  fromAccountId: AccountId;
  toAccountNumber: AccountNumber;
  toAccountName: string;
  toBankCode: string;
  toBankName: string;
  amount: number;
  description?: string;
  memo?: string;
  transferType: TransferType;
  scheduledDate?: ISODateString;
  password: string;
}
// 이체 타입
export enum TransferType {
  IMMEDIATE = 'IMMEDIATE',         // 즉시이체
  SCHEDULED = 'SCHEDULED',         // 예약이체
  RECURRING = 'RECURRING',         // 자동이체
  BULK = 'BULK',                  // 대량이체
}
// 이체 결과
export interface TransferResult {
  transferId: string;
  transactionId: TransactionId;
  status: TransferStatus;
  message: string;
  processedAt: ISODateString;
  fee?: Money;
  estimatedArrival?: ISODateString;
  referenceNumber: string;
}
// 이체 상태
export enum TransferStatus {
  PENDING = 'PENDING',           // 대기중
  PROCESSING = 'PROCESSING',     // 처리중
  COMPLETED = 'COMPLETED',       // 완료
  FAILED = 'FAILED',            // 실패
  CANCELLED = 'CANCELLED',       // 취소
  SCHEDULED = 'SCHEDULED',       // 예약됨
}
// 이체 내역
export interface TransferHistory {
  id: string;
  fromAccountId: AccountId;
  fromAccountNumber: AccountNumber;
  fromAccountName: string;
  toAccountNumber: AccountNumber;
  toAccountName: string;
  toBankCode: string;
  toBankName: string;
  amount: Money;
  fee: Money;
  description?: string;
  memo?: string;
  status: TransferStatus;
  transferType: TransferType;
  scheduledDate?: ISODateString;
  processedDate?: ISODateString;
  failureReason?: string;
  transactionId?: TransactionId;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
// 예약 이체
export interface ScheduledTransfer {
  id: string;
  transferRequest: TransferRequest;
  scheduledDate: ISODateString;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  createdAt: ISODateString;
  nextExecutionDate: ISODateString;
}
// 자동 이체
export interface RecurringTransfer {
  id: string;
  transferRequest: Omit<TransferRequest, 'password' | 'scheduledDate'>;
  frequency: TransferFrequency;
  startDate: ISODateString;
  endDate?: ISODateString;
  nextExecutionDate: ISODateString;
  executionDay: number; // 실행일 (1-31)
  executionCount: number;
  maxExecutions?: number;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  lastExecutedAt?: ISODateString;
  createdAt: ISODateString;
}
// 이체 주기
export interface TransferFrequency {
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  interval: number; // 주기 간격 (예: 2 = 격주/격월)
  dayOfWeek?: number; // 0-6 (일-토)
  dayOfMonth?: number; // 1-31
  monthOfYear?: number; // 1-12
}
// 수취인 정보
export interface Recipient {
  id: string;
  nickname: string;
  accountNumber: AccountNumber;
  accountName: string;
  bankCode: string;
  bankName: string;
  isFrequent: boolean;
  isFavorite: boolean;
  lastUsedAt?: ISODateString;
  usageCount: number;
  createdAt: ISODateString;
}
// 이체 한도
export interface TransferLimit {
  type: 'DAILY' | 'PER_TRANSACTION' | 'MONTHLY';
  amount: Money;
  remainingAmount: Money;
  resetAt: ISODateString;
}
// 이체 검증 결과
export interface TransferValidation {
  isValid: boolean;
  errors: TransferValidationError[];
  warnings: TransferValidationWarning[];
  estimatedFee?: Money;
  estimatedArrival?: ISODateString;
}
// 이체 검증 에러
export interface TransferValidationError {
  code: string;
  field: string;
  message: string;
}
// 이체 검증 경고
export interface TransferValidationWarning {
  code: string;
  message: string;
}
// 대량 이체
export interface BulkTransfer {
  id: string;
  name: string;
  fromAccountId: AccountId;
  totalAmount: Money;
  totalFee: Money;
  transfers: BulkTransferItem[];
  status: TransferStatus;
  processedCount: number;
  failedCount: number;
  scheduledDate?: ISODateString;
  createdAt: ISODateString;
}
// 대량 이체 항목
export interface BulkTransferItem {
  id: string;
  toAccountNumber: AccountNumber;
  toAccountName: string;
  toBankCode: string;
  amount: Money;
  description?: string;
  status: TransferStatus;
  errorMessage?: string;
  transactionId?: TransactionId;
}
// 이체 수수료
export interface TransferFee {
  bankCode: string;
  transferType: 'SAME_BANK' | 'OTHER_BANK';
  feeType: 'STANDARD' | 'EXPRESS';
  amount: Money;
  conditions?: string;
}
// 이체 확인 정보
export interface TransferConfirmation {
  transferRequest: TransferRequest;
  fromAccountBalance: Money;
  balanceAfterTransfer: Money;
  fee: Money;
  totalAmount: Money;
  estimatedArrival: ISODateString;
  warnings: string[];
}
// 타입 가드
export const isTransferRequest = (value: unknown): value is TransferRequest => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'fromAccountId' in value &&
    'toAccountNumber' in value &&
    'amount' in value
  );
};
export const isScheduledTransfer = (transfer: TransferHistory): boolean => {
  return transfer.transferType === TransferType.SCHEDULED;
};
export const isRecurringTransfer = (transfer: TransferHistory): boolean => {
  return transfer.transferType === TransferType.RECURRING;
};
// 헬퍼 타입
export type TransferPredicate = (transfer: TransferHistory) => boolean;
export type RecipientPredicate = (recipient: Recipient) => boolean;