const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 클라이언트 생성
const supabaseUrl = 'https://xbzbmweaxwsxpffwvobf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhiemhtd2VheHdzeHBmZnd2b2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNzQ1NjgsImV4cCI6MjA4NDc1MDU2OH0.t6jHy7BtqLjEQf-xwrXr-vqJtRt4wiTwcOOhNxBP7kw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyTransactions() {
  try {
    // 기존 거래내역 삭제
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 레코드 삭제

    if (deleteError) {
      console.error('Error deleting transactions:', deleteError);
      return;
    }

    // 새 거래내역 추가
    const transactions = [
      // 김민준의 계좌 거래내역
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '출금',
        amount: 30388,
        balance_after: 499701,
        description: 'ABL생명04026',
        transaction_date: '2025-04-25T20:14:14'
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '출금',
        amount: 351192,
        balance_after: 754031,
        description: '농협손보합산납입',
        transaction_date: '2025-04-25T19:32:59'
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '출금',
        amount: 17148,
        balance_after: 1135611,
        description: 'KB카드출금',
        transaction_date: '2025-04-25T18:28:43'
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '출금',
        amount: 91213,
        balance_after: 1152759,
        description: '삼성카드',
        transaction_date: '2025-04-24T19:19:02'
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '입금',
        amount: 500000,
        balance_after: 1243972,
        description: '이경희',
        transaction_date: '2025-04-24T02:54:17'
      },
      // 추가 거래내역
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '입금',
        amount: 500000,
        balance_after: 743972,
        description: '이경희',
        transaction_date: '2025-04-23T15:30:00'
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '출금',
        amount: 85400,
        balance_after: 243972,
        description: '현대카드',
        transaction_date: '2025-04-23T12:15:30'
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '출금',
        amount: 23450,
        balance_after: 329372,
        description: 'GS25',
        transaction_date: '2025-04-22T23:45:00'
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '출금',
        amount: 4500,
        balance_after: 352822,
        description: '스타벅스',
        transaction_date: '2025-04-22T14:20:00'
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '출금',
        amount: 12800,
        balance_after: 357322,
        description: 'CU',
        transaction_date: '2025-04-22T09:30:00'
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '출금',
        amount: 89900,
        balance_after: 370122,
        description: 'NETFLIX',
        transaction_date: '2025-04-21T00:00:00'
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '입금',
        amount: 3500000,
        balance_after: 460022,
        description: '급여',
        transaction_date: '2025-04-20T09:00:00'
      },
      // 이서연의 계좌 거래내역
      {
        account_id: '660e8400-e29b-41d4-a716-446655440003',
        transaction_type: '입금',
        amount: 100000,
        balance_after: 4300000,
        description: '김민준',
        transaction_date: '2025-04-25T16:00:00'
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440003',
        transaction_type: '출금',
        amount: 45800,
        balance_after: 4200000,
        description: '이마트24',
        transaction_date: '2025-04-25T13:30:00'
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440003',
        transaction_type: '출금',
        amount: 156000,
        balance_after: 4245800,
        description: '신한카드',
        transaction_date: '2025-04-25T12:00:00'
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440003',
        transaction_type: '출금',
        amount: 23500,
        balance_after: 4401800,
        description: 'ABC마트',
        transaction_date: '2025-04-24T18:00:00'
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440003',
        transaction_type: '입금',
        amount: 2800000,
        balance_after: 4425300,
        description: '급여',
        transaction_date: '2025-04-20T09:00:00'
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440003',
        transaction_type: '출금',
        amount: 12900,
        balance_after: 2564300,
        description: 'WATCHA',
        transaction_date: '2025-04-01T00:00:00'
      }
    ];

    const { data, error: insertError } = await supabase
      .from('transactions')
      .insert(transactions);

    if (insertError) {
      console.error('Error inserting transactions:', insertError);
      return;
    }

    // 계좌 잔액 업데이트
    const { error: updateError1 } = await supabase
      .from('accounts')
      .update({ balance: 499701 })
      .eq('id', '660e8400-e29b-41d4-a716-446655440001');

    const { error: updateError2 } = await supabase
      .from('accounts')
      .update({ balance: 4300000 })
      .eq('id', '660e8400-e29b-41d4-a716-446655440003');

    if (updateError1 || updateError2) {
      console.error('Error updating balances:', updateError1 || updateError2);
      return;
    }

    console.log('Transactions applied successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

applyTransactions();