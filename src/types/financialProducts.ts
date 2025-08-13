// 금융상품 관련 타입 정의
export interface InsuranceProduct {
  id: number;
  user_id: string;
  product_name: string; // 상품명 (예: "삼성생명보험", "KB손해보험")
  product_type: string; // 상품 유형 (보험, 공제)
  account_number?: string; // 계약번호
  premium: number; // 보험료
  coverage_amount: number; // 보장금액
  status: 'active' | 'inactive'; // 계약 상태
  created_at: string;
  updated_at: string;
}
export interface PensionProduct {
  id: number;
  user_id: string;
  product_name: string; // 상품명 (예: "KB퇴직연금", "개인형퇴직연금(IRP)")
  product_type: string; // 상품 유형 (퇴직연금, IRP, 개인연금)
  account_number?: string; // 계약번호
  balance: number; // 적립금액
  monthly_contribution: number; // 월 납입액
  status: 'active' | 'inactive'; // 계약 상태
  created_at: string;
  updated_at: string;
}
export interface LoanProduct {
  id: number;
  user_id: string;
  product_name: string; // 상품명
  loan_type: string; // 대출 유형
  account_number: string; // 계좌번호
  loan_amount: number; // 대출금액
  remaining_balance: number; // 잔여원금
  interest_rate: number; // 금리
  monthly_payment: number; // 월 상환액
  maturity_date: string; // 만기일
  status: 'active' | 'completed' | 'overdue'; // 대출 상태
  created_at: string;
  updated_at: string;
}
// 계좌 타입 확장
export interface ExtendedAccount {
  id: number;
  user_id: string;
  account_number: string;
  account_type: string;
  bank_name: string;
  balance: number;
  product_category: 'deposit' | 'savings' | 'checking'; // 예금, 적금, 입출금
  interest_rate?: number;
  maturity_date?: string;
  status: 'active' | 'inactive' | 'dormant';
  created_at: string;
  updated_at: string;
}
// 전체 자산 요약
export interface AssetSummary {
  total_deposits: number; // 예금·적금 총액
  total_insurance: number; // 보험 총 가입금액
  total_pension: number; // 퇴직연금 총 적립금
  total_loans: number; // 대출 총 잔액
  net_worth: number; // 순자산 (자산 - 부채)
}