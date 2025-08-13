/**
 * 계좌 관련 도메인 타입 정의
 */
import { 
  AccountId, 
  UserId, 
  AccountNumber, 
  ISODateString,
  Money 
} from '../../../shared/types/common.types';
// 계좌 엔티티
export interface Account {
  id: AccountId;
  userId: UserId;
  accountNumber: AccountNumber;
  accountName: string;
  accountType: AccountType;
  balance: number;
  currency: 'KRW';
  status: AccountStatus;
  isPrimary: boolean;
  bankName: string;
  bankCode: string;
  accountHolder: string;
  openedAt: ISODateString;
  lastTransactionAt?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
// 계좌 타입
export enum AccountType {
  CHECKING = 'CHECKING',           // 입출금
  SAVINGS = 'SAVINGS',            // 저축
  FIXED_DEPOSIT = 'FIXED_DEPOSIT', // 정기예금
  INSTALLMENT = 'INSTALLMENT',     // 적금
  LOAN = 'LOAN',                  // 대출
  INVESTMENT = 'INVESTMENT',       // 투자
}
// 계좌 상태
export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}
// 계좌 상세 정보
export interface AccountDetail extends Account {
  interestRate?: number;
  maturityDate?: ISODateString;
  monthlyDepositAmount?: number;
  overdraftLimit?: number;
  linkedAccounts?: AccountId[];
  benefits?: AccountBenefit[];
}
// 계좌 혜택
export interface AccountBenefit {
  id: string;
  type: 'CASHBACK' | 'POINTS' | 'INTEREST_BONUS' | 'FEE_WAIVER';
  description: string;
  value: number;
  unit: 'PERCENT' | 'WON' | 'POINTS';
  conditions?: string;
}
// 계좌 요약 정보
export interface AccountSummary {
  totalBalance: Money;
  accountCount: number;
  accountsByType: Record<AccountType, number>;
  primaryAccount?: Account;
  recentTransactionDate?: ISODateString;
}
// 계좌 생성 요청
export interface CreateAccountRequest {
  accountType: AccountType;
  accountName: string;
  initialDeposit?: number;
  linkedAccountId?: AccountId;
  productCode?: string;
}
// 계좌 업데이트 요청
export interface UpdateAccountRequest {
  accountName?: string;
  isPrimary?: boolean;
  overdraftLimit?: number;
}
// 계좌 검색 필터
export interface AccountFilter {
  accountType?: AccountType;
  status?: AccountStatus;
  minBalance?: number;
  maxBalance?: number;
  bankCode?: string;
}
// 계좌 권한
export interface AccountPermission {
  accountId: AccountId;
  userId: UserId;
  role: AccountRole;
  permissions: Permission[];
  grantedAt: ISODateString;
  grantedBy: UserId;
}
// 계좌 역할
export enum AccountRole {
  OWNER = 'OWNER',
  CO_OWNER = 'CO_OWNER',
  VIEWER = 'VIEWER',
}
// 권한 타입
export enum Permission {
  VIEW_BALANCE = 'VIEW_BALANCE',
  VIEW_TRANSACTIONS = 'VIEW_TRANSACTIONS',
  TRANSFER = 'TRANSFER',
  WITHDRAW = 'WITHDRAW',
  CLOSE_ACCOUNT = 'CLOSE_ACCOUNT',
}
// 계좌 한도
export interface AccountLimit {
  accountId: AccountId;
  dailyTransferLimit: Money;
  dailyWithdrawalLimit: Money;
  monthlyTransferLimit: Money;
  perTransactionLimit: Money;
  remainingDailyTransfer: Money;
  remainingDailyWithdrawal: Money;
  lastResetAt: ISODateString;
}
// 계좌 알림 설정
export interface AccountNotificationSettings {
  accountId: AccountId;
  lowBalanceAlert: {
    enabled: boolean;
    threshold: number;
  };
  transactionAlert: {
    enabled: boolean;
    minAmount?: number;
  };
  monthlyStatement: boolean;
  securityAlert: boolean;
}
// 타입 가드
export const isAccount = (value: unknown): value is Account => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'accountNumber' in value &&
    'balance' in value
  );
};
export const isActiveAccount = (account: Account): boolean => {
  return account.status === AccountStatus.ACTIVE;
};
// 헬퍼 함수 타입
export type AccountPredicate = (account: Account) => boolean;
export type AccountComparator = (a: Account, b: Account) => number;
// 계좌 그룹화 결과
export type AccountsByType = Map<AccountType, Account[]>;
export type AccountsByBank = Map<string, Account[]>;