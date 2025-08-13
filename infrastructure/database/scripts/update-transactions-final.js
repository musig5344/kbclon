const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 생성
const supabaseUrl = 'https://xbzbmweaxwsxpffwvobf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhiemhtd2VheHdzeHBmZnd2b2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNzQ1NjgsImV4cCI6MjA4NDc1MDU2OH0.t6jHy7BtqLjEQf-xwrXr-vqJtRt4wiTwcOOhNxBP7kw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateTransactions() {
  try {
    console.log('거래내역 업데이트 시작...');

    // 기존 거래내역 삭제
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('거래내역 삭제 실패:', deleteError);
      return;
    }

    // 김민준의 계좌 거래내역 (원본 스크린샷 기반)
    const minJunTransactions = [
      // 최신순
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '출금',
        amount: 30388,
        balance_after: 499701,
        description: 'ABL생명04026',
        transaction_date: new Date('2025-04-25T20:14:14').toISOString()
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '출금',
        amount: 351192,
        balance_after: 754031,
        description: '농협손보합산납입',
        transaction_date: new Date('2025-04-25T19:32:59').toISOString()
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '출금',
        amount: 17148,
        balance_after: 1135611,
        description: 'KB카드출금',
        transaction_date: new Date('2025-04-25T18:28:43').toISOString()
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '출금',
        amount: 91213,
        balance_after: 1152759,
        description: '삼성카드',
        transaction_date: new Date('2025-04-24T19:19:02').toISOString()
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '입금',
        amount: 500000,
        balance_after: 1243972,
        description: '이경희',
        transaction_date: new Date('2025-04-24T02:54:17').toISOString()
      },
      // 추가 거래내역
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '출금',
        amount: 89900,
        balance_after: 743972,
        description: 'NETFLIX',
        transaction_date: new Date('2025-04-23T15:30:00').toISOString()
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '출금',
        amount: 23500,
        balance_after: 833872,
        description: 'GS25',
        transaction_date: new Date('2025-04-23T14:20:00').toISOString()
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '출금',
        amount: 4500,
        balance_after: 857372,
        description: '스타벅스',
        transaction_date: new Date('2025-04-23T09:30:00').toISOString()
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '입금',
        amount: 3500000,
        balance_after: 861872,
        description: '급여',
        transaction_date: new Date('2025-04-20T09:00:00').toISOString()
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440001',
        transaction_type: '출금',
        amount: 850000,
        balance_after: -2638128,
        description: '월세',
        transaction_date: new Date('2025-04-05T12:00:00').toISOString()
      }
    ];

    // 이서연의 계좌 거래내역
    const seoYeonTransactions = [
      {
        account_id: '660e8400-e29b-41d4-a716-446655440003',
        transaction_type: '입금',
        amount: 100000,
        balance_after: 4300000,
        description: '김민준',
        transaction_date: new Date('2025-04-25T16:00:00').toISOString()
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440003',
        transaction_type: '출금',
        amount: 45800,
        balance_after: 4200000,
        description: '이마트24',
        transaction_date: new Date('2025-04-25T13:30:00').toISOString()
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440003',
        transaction_type: '출금',
        amount: 156000,
        balance_after: 4245800,
        description: '신한카드',
        transaction_date: new Date('2025-04-25T12:00:00').toISOString()
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440003',
        transaction_type: '출금',
        amount: 12900,
        balance_after: 4401800,
        description: 'WATCHA',
        transaction_date: new Date('2025-04-24T00:00:00').toISOString()
      },
      {
        account_id: '660e8400-e29b-41d4-a716-446655440003',
        transaction_type: '입금',
        amount: 2800000,
        balance_after: 4414700,
        description: '급여',
        transaction_date: new Date('2025-04-20T09:00:00').toISOString()
      }
    ];

    // 모든 거래내역 삽입
    const allTransactions = [...minJunTransactions, ...seoYeonTransactions];
    
    const { data, error: insertError } = await supabase
      .from('transactions')
      .insert(allTransactions);

    if (insertError) {
      console.error('거래내역 삽입 실패:', insertError);
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
      console.error('잔액 업데이트 실패:', updateError1 || updateError2);
      return;
    }

    console.log('거래내역 업데이트 완료!');
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

updateTransactions();