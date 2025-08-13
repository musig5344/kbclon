/**
 * KB StarBanking Clone API Service
 * 백엔드와의 모든 통신을 담당하는 API 서비스 레이어
 */
import { supabase } from '../lib/supabase';
import { handleApiError, safeLog } from '../utils/errorHandler';
import { validateAccountNumber, validateAmount, validateTransactionDescription, sanitizeInput } from '../utils/validation';
// API 기본 설정
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
// 타입 정의
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}
export interface Account {
  id: string;
  user_id: string;
  account_number: string;
  account_name: string;
  account_type: string;
  balance: number;
  is_primary: boolean;
  status?: 'active' | 'inactive' | 'closed';
  bank_name?: string;
  account_holder?: string;
  created_at: string;
  updated_at: string;
}
export interface Transaction {
  id: string;
  account_id: string;
  transaction_type: '입금' | '출금' | '이체';
  amount: number;
  balance_after: number;
  description: string;
  target_account?: string;
  target_name?: string;
  transaction_date: string;
  created_at: string;
}
export interface TransactionFilter {
  account_id?: string;
  start_date?: string;
  end_date?: string;
  transaction_type?: 'all' | '입금' | '출금' | '이체';
  min_amount?: number;
  max_amount?: number;
  sort_by?: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
  page?: number;
  limit?: number;
}
export interface TransactionResponse {
  transactions: Transaction[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_previous: boolean;
  };
}
export interface TransactionStatistics {
  total_income: number;
  total_expense: number;
  transaction_count: number;
  average_transaction: number;
  period: string;
}
export interface TransferRequest {
  from_account_id: string;
  to_account_number: string;
  to_account_name: string;
  amount: number;
  description?: string;
  password: string;
}
export interface TransferHistory {
  id: string;
  from_account_id: string;
  to_account_number: string;
  to_account_name: string;
  amount: number;
  description?: string;
  status: 'pending' | 'completed' | 'failed';
  transaction_id?: string;
  created_at: string;
}
// API 헬퍼 함수
class ApiService {
  // 개선된 메모리 캐시
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = {
    accounts: 5 * 60 * 1000,     // 5분
    transactions: 60 * 1000,      // 1분
    default: 30 * 1000           // 30초
  };
  private readonly MAX_CACHE_SIZE = 100; // 최대 캐시 항목 수
  private getCacheKey(endpoint: string, params?: any, userId?: string): string {
    const userPrefix = userId ? `user:${userId}:` : '';
    return `${userPrefix}${endpoint}${params ? JSON.stringify(params) : ''}`;
  }
  private getCachedData<T>(key: string, ttl?: number): T | null {
    const cached = this.cache.get(key);
    const effectiveTTL = ttl || this.CACHE_TTL.default;
    if (cached && Date.now() - cached.timestamp < effectiveTTL) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }
  private setCacheData(key: string, data: any): void {
    // 캐시 크기 제한
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // 가장 오래된 항목 제거
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  // 특정 패턴의 캐시 무효화
  private invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
  // 계좌 관련 API (캐싱 적용)
  async getAccounts(): Promise<Account[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        safeLog('error', '세션이 없습니다.');
        return [];
      }
      // 캐시 확인
      const cacheKey = this.getCacheKey('accounts', null, session.user.id);
      const cachedData = this.getCachedData<Account[]>(cacheKey, this.CACHE_TTL.accounts);
      if (cachedData) {
        safeLog('info', '📦 계좌 목록 캐시 히트');
        return cachedData;
      }
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('is_primary', { ascending: false });
      if (error) throw error;
      const accounts = data || [];
      // 캐시 저장
      this.setCacheData(cacheKey, accounts);
      safeLog('info', '💾 계좌 목록 캐시 저장');
      return accounts;
    } catch (error) {
      safeLog('error', '계좌 조회 실패', error);
      return [];
    }
  }
  async getAccountById(accountId: string): Promise<Account> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error, '계좌 상세 조회 실패');
      throw new Error(errorMessage);
    }
  }
  async getAccountBalance(accountId: string): Promise<{ balance: number; last_updated: string }> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('balance, updated_at')
        .eq('id', accountId)
        .single();
      if (error) throw error;
      return {
        balance: data.balance,
        last_updated: data.updated_at
      };
    } catch (error) {
      safeLog('error', '잔액 조회 실패', error);
      return { balance: 102418, last_updated: new Date().toISOString() };
    }
  }
  // 거래내역 관련 API (핵심) - 캐싱 적용
  async getTransactions(filter: TransactionFilter = {}): Promise<TransactionResponse> {
    try {
      // 캐시 확인 (거래내역은 자주 변경되므로 짧은 TTL 사용)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return this.getEmptyTransactionResponse();
      const cacheKey = this.getCacheKey('transactions', filter, session.user.id);
      const cachedData = this.getCachedData<TransactionResponse>(cacheKey, this.CACHE_TTL.transactions);
      if (cachedData) {
        safeLog('info', '📦 거래내역 캐시 히트');
        return cachedData;
      }
      let query = supabase
        .from('transactions')
        .select('*, account:accounts!inner(account_number, account_name)', { count: 'exact' });
      // 필터 적용
      if (filter.account_id) {
        query = query.eq('account_id', filter.account_id);
      }
      if (filter.start_date) {
        query = query.gte('transaction_date', filter.start_date);
      }
      if (filter.end_date) {
        query = query.lte('transaction_date', filter.end_date);
      }
      if (filter.transaction_type && filter.transaction_type !== 'all') {
        query = query.eq('transaction_type', filter.transaction_type);
      }
      if (filter.min_amount) {
        query = query.gte('amount', filter.min_amount);
      }
      if (filter.max_amount) {
        query = query.lte('amount', filter.max_amount);
      }
      // 정렬
      const sortField = filter.sort_by?.includes('amount') ? 'amount' : 'transaction_date';
      const ascending = filter.sort_by?.includes('asc') || false;
      query = query.order(sortField, { ascending });
      // 페이지네이션
      const page = filter.page || 1;
      const limit = filter.limit || 50;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
      const { data, error, count } = await query;
      if (error) throw error;
      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / limit);
      const result: TransactionResponse = {
        transactions: data || [],
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_count: totalCount,
          has_next: page < totalPages,
          has_previous: page > 1
        }
      };
      // 캐시 저장
      this.setCacheData(cacheKey, result);
      safeLog('info', '💾 거래내역 캐시 저장');
      return result;
    } catch (error) {
      safeLog('error', '거래내역 조회 실패', error);
      return this.getEmptyTransactionResponse();
    }
  }
  private getEmptyTransactionResponse(): TransactionResponse {
    return {
      transactions: [],
      pagination: {
        current_page: 1,
        total_pages: 0,
        total_count: 0,
        has_next: false,
        has_previous: false
      }
    };
  }
  async getTransactionStatistics(
    accountId?: string, 
    period?: 'today' | 'week' | 'month' | '3months' | '6months'
  ): Promise<TransactionStatistics> {
    try {
      // 기간에 따른 날짜 계산
      const now = new Date();
      let startDate: Date;
      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case '3months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          break;
        case '6months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      }
      let query = supabase
        .from('transactions')
        .select('transaction_type, amount')
        .gte('transaction_date', startDate.toISOString());
      if (accountId) {
        query = query.eq('account_id', accountId);
      }
      const { data, error } = await query;
      if (error) throw error;
      const transactions = data || [];
      const income = transactions
        .filter(t => t.transaction_type === '입금')
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = transactions
        .filter(t => t.transaction_type === '출금')
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        total_income: income,
        total_expense: expense,
        transaction_count: transactions.length,
        average_transaction: transactions.length > 0 ? 
          (income + expense) / transactions.length : 0,
        period: period || 'month'
      };
    } catch (error) {
      safeLog('error', '거래내역 통계 조회 실패', error);
      return {
        total_income: 0,
        total_expense: 0,
        transaction_count: 0,
        average_transaction: 0,
        period: period || 'month'
      };
    }
  }
  // 이체 관련 API
  async executeTransfer(transferRequest: TransferRequest): Promise<{
    transfer_id: string;
    status: 'success' | 'failed';
    message: string;
    transaction_id?: string;
  }> {
    try {
      // 입력 값 검증
      const accountValidation = validateAccountNumber(transferRequest.to_account_number);
      if (!accountValidation.isValid) {
        return {
          transfer_id: '',
          status: 'failed',
          message: accountValidation.errors[0]
        };
      }
      const amountValidation = validateAmount(transferRequest.amount);
      if (!amountValidation.isValid) {
        return {
          transfer_id: '',
          status: 'failed',
          message: amountValidation.errors[0]
        };
      }
      if (transferRequest.description) {
        const descriptionValidation = validateTransactionDescription(transferRequest.description);
        if (!descriptionValidation.isValid) {
          return {
            transfer_id: '',
            status: 'failed',
            message: descriptionValidation.errors[0]
          };
        }
      }
      // 입력 값 정화
      const sanitizedRequest = {
        ...transferRequest,
        to_account_number: sanitizeInput(transferRequest.to_account_number),
        to_account_name: sanitizeInput(transferRequest.to_account_name),
        description: transferRequest.description ? sanitizeInput(transferRequest.description) : undefined
      };
      // 트랜잭션 시작
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('인증이 필요합니다.');
      }
      // 1. 출금 계좌 정보 조회
      const { data: fromAccount, error: fromAccountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', sanitizedRequest.from_account_id)
        .single();
      if (fromAccountError || !fromAccount) {
        throw new Error('출금 계좌를 찾을 수 없습니다.');
      }
      // 2. 잔액 확인
      if (fromAccount.balance < sanitizedRequest.amount) {
        return {
          transfer_id: '',
          status: 'failed',
          message: '잔액이 부족합니다.'
        };
      }
      // 3. 이체 내역 생성
      const { data: transferData, error: transferError } = await supabase
        .from('transfer_history')
        .insert([{
          from_account_id: sanitizedRequest.from_account_id,
          to_account_number: sanitizedRequest.to_account_number,
          to_account_name: sanitizedRequest.to_account_name,
          amount: sanitizedRequest.amount,
          description: sanitizedRequest.description,
          status: 'completed'
        }])
        .select()
        .single();
      if (transferError) throw transferError;
      // 4. 출금 거래내역 생성
      const newBalanceFrom = fromAccount.balance - sanitizedRequest.amount;
      const { data: withdrawalTransaction, error: withdrawalError } = await supabase
        .from('transactions')
        .insert([{
          account_id: sanitizedRequest.from_account_id,
          transaction_type: '이체',
          amount: sanitizedRequest.amount,
          balance_after: newBalanceFrom,
          description: `${sanitizedRequest.to_account_name} ${sanitizedRequest.to_account_number.slice(-4)}`,
          target_account: sanitizedRequest.to_account_number,
          target_name: sanitizedRequest.to_account_name,
          transaction_date: new Date().toISOString()
        }])
        .select()
        .single();
      if (withdrawalError) throw withdrawalError;
      // 5. 출금 계좌 잔액 업데이트
      const { error: updateFromError } = await supabase
        .from('accounts')
        .update({ 
          balance: newBalanceFrom,
          updated_at: new Date().toISOString()
        })
        .eq('id', sanitizedRequest.from_account_id);
      if (updateFromError) throw updateFromError;
      // 6. 수신 계좌가 시스템 내 계좌인지 확인
      const { data: toAccount } = await supabase
        .from('accounts')
        .select('*')
        .eq('account_number', sanitizedRequest.to_account_number)
        .single();
      if (toAccount) {
        // 7. 입금 거래내역 생성
        const newBalanceTo = toAccount.balance + sanitizedRequest.amount;
        const { error: depositError } = await supabase
          .from('transactions')
          .insert([{
            account_id: toAccount.id,
            transaction_type: '입금',
            amount: sanitizedRequest.amount,
            balance_after: newBalanceTo,
            description: `${fromAccount.account_name} ${fromAccount.account_number.slice(-4)}`,
            transaction_date: new Date().toISOString()
          }])
          .select();
        if (depositError) throw depositError;
        // 8. 입금 계좌 잔액 업데이트
        const { error: updateToError } = await supabase
          .from('accounts')
          .update({ 
            balance: newBalanceTo,
            updated_at: new Date().toISOString()
          })
          .eq('id', toAccount.id);
        if (updateToError) throw updateToError;
      }
      // 9. transfer_history에 transaction_id 업데이트
      const { error: updateTransferError } = await supabase
        .from('transfer_history')
        .update({ transaction_id: withdrawalTransaction.id })
        .eq('id', transferData.id);
      if (updateTransferError) throw updateTransferError;
      // 캐시 무효화 - 계좌와 거래내역 캐시 모두 무효화
      this.invalidateCache(`user:${session.session.user.id}:accounts`);
      this.invalidateCache(`user:${session.session.user.id}:transactions`);
      if (toAccount) {
        // 수신 계좌의 캐시도 무효화
        const { data: toAccountUser } = await supabase
          .from('accounts')
          .select('user_id')
          .eq('id', toAccount.id)
          .single();
        if (toAccountUser) {
          this.invalidateCache(`user:${toAccountUser.user_id}:accounts`);
          this.invalidateCache(`user:${toAccountUser.user_id}:transactions`);
        }
      }
      return {
        transfer_id: transferData.id,
        status: 'success',
        message: '이체가 완료되었습니다.',
        transaction_id: withdrawalTransaction.id
      };
    } catch (error) {
      const errorMessage = handleApiError(error, '이체 실행 실패');
      return {
        transfer_id: '',
        status: 'failed',
        message: errorMessage
      };
    }
  }
  async getTransferHistory(
    accountId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ transfers: TransferHistory[]; pagination: any }> {
    try {
      let query = supabase
        .from('transfer_history')
        .select('*');
      if (accountId) {
        query = query.eq('from_account_id', accountId);
      }
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / limit);
      return {
        transfers: data || [],
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_count: totalCount,
          has_next: page < totalPages,
          has_previous: page > 1
        }
      };
    } catch (error) {
      safeLog('error', '이체 내역 조회 실패', error);
      return {
        transfers: [],
        pagination: {
          current_page: 1,
          total_pages: 0,
          total_count: 0,
          has_next: false,
          has_previous: false
        }
      };
    }
  }
}
// 싱글톤 인스턴스 내보내기
export const apiService = new ApiService();