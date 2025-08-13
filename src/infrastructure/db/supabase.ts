import { createClient } from '@supabase/supabase-js';

import { env } from '../../config/env';

// Supabase configuration from centralized env config
const supabaseUrl = env.supabase.url;
const supabaseAnonKey = env.supabase.anonKey;

// Check for required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration is missing. Please check your environment variables.');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Supabase configuration is required in production');
  }
}
// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
// Database table names
export const TABLES = {
  USERS: 'users',
  ACCOUNTS: 'accounts',
  TRANSACTIONS: 'transactions',
  TRANSFER_HISTORY: 'transfer_history',
} as const;
// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};
// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  if (error?.code === 'PGRST301') {
    return 'No data found for the requested filters.';
  }
  if (error?.code === 'PGRST116') {
    return 'Invalid request format.';
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};
// Type definitions for database rows
export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}
export interface DatabaseAccount {
  id: string;
  user_id: string;
  account_number: string;
  account_name: string;
  account_type: string;
  bank_name?: string;
  account_holder?: string;
  balance: number;
  is_primary: boolean;
  status: 'active' | 'inactive' | 'closed';
  created_at: string;
  updated_at: string;
}
export interface DatabaseTransaction {
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
export interface DatabaseTransferHistory {
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
// Service classes for backward compatibility
class AccountService {
  async getAccount(accountId: string): Promise<DatabaseAccount> {
    const { data, error } = await supabase
      .from(TABLES.ACCOUNTS)
      .select('*')
      .eq('id', accountId)
      .single();
    if (error) throw error;
    return data;
  }
  async getUserAccounts(
    userId: string,
    options?: { bypassCache?: boolean; _timestamp?: number }
  ): Promise<DatabaseAccount[]> {
    // 캐시 무효화를 위한 쿼리 파라미터 추가
    let query = supabase
      .from(TABLES.ACCOUNTS)
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });
    // bypassCache가 true면 타임스탬프를 추가하여 캐시 우회
    if (options?.bypassCache && options?._timestamp) {
      // Supabase는 자동으로 최신 데이터를 가져옴
      // 추가적인 캐시 무효화가 필요한 경우 여기에 로직 추가
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
  async getAccountBalance(accountId: string): Promise<number> {
    const { data, error } = await supabase
      .from(TABLES.ACCOUNTS)
      .select('balance')
      .eq('id', accountId)
      .single();
    if (error) throw error;
    return data.balance;
  }
}
class TransactionService {
  async getAccountTransactions(
    accountId: string,
    limit: number = 50
  ): Promise<DatabaseTransaction[]> {
    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .select('*')
      .eq('account_id', accountId)
      .order('transaction_date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }
  async getRecentTransactions(
    accountId: string,
    limit: number = 5
  ): Promise<DatabaseTransaction[]> {
    return this.getAccountTransactions(accountId, limit);
  }
  async getTransactionsByDateRange(
    accountId: string,
    startDate: string,
    endDate: string
  ): Promise<DatabaseTransaction[]> {
    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .select('*')
      .eq('account_id', accountId)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }
}
// Export service instances
export const accountService = new AccountService();
export const transactionService = new TransactionService();
// Type exports for backward compatibility
export type Account = DatabaseAccount;
export type Transaction = DatabaseTransaction;
export type User = DatabaseUser;
export type TransferHistory = DatabaseTransferHistory;
