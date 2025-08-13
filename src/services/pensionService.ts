import { supabase } from './supabase';
// 퇴직연금 상품 타입
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
// 퇴직연금 상품 조회
export const getPensionProducts = async (userId: string): Promise<PensionProduct[]> => {
  const { data, error } = await supabase
    .from('pension_products')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) {
    return [];
  }
  return data || [];
};
// 퇴직연금 총 적립금 조회
export const getTotalPensionBalance = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('pension_products')
    .select('balance')
    .eq('user_id', userId)
    .eq('status', 'active');
  if (error) {
    return 0;
  }
  return data?.reduce((total, product) => total + product.balance, 0) || 0;
};