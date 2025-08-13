-- KB 스타뱅킹 테스트 사용자 생성
-- Supabase SQL Editor에서 실행

-- 1. auth.users 테이블에 사용자 추가
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'test@kbstar.com',
  crypt('test1234', gen_salt('bf')),
  now(),
  '{"name": "테스트사용자", "phone": "010-1234-5678"}',
  now(),
  now(),
  '',
  ''
);

-- 2. public.users 테이블에 사용자 정보 추가
INSERT INTO public.users (
  id,
  email,
  name,
  phone,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@kbstar.com'),
  'test@kbstar.com',
  '테스트사용자',
  '010-1234-5678',
  now(),
  now()
);

-- 3. 테스트 계좌 생성
INSERT INTO public.accounts (
  id,
  user_id,
  account_number,
  account_name,
  account_type,
  balance,
  is_primary,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'test@kbstar.com'),
  '110-456-789012',
  'KB국민ONE통장-보통예금',
  '보통예금',
  1000000,
  true,
  'active',
  now(),
  now()
);

-- 4. 샘플 거래내역 추가
WITH account_id AS (
  SELECT id FROM accounts WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@kbstar.com') LIMIT 1
)
INSERT INTO transactions (
  account_id,
  transaction_type,
  amount,
  balance_after,
  description,
  transaction_date
) VALUES
  ((SELECT id FROM account_id), '입금', 3000000, 4000000, '월급', now() - interval '5 days'),
  ((SELECT id FROM account_id), '출금', 500000, 3500000, '월세', now() - interval '4 days'),
  ((SELECT id FROM account_id), '출금', 100000, 3400000, '통신비', now() - interval '3 days'),
  ((SELECT id FROM account_id), '출금', 50000, 3350000, 'GS25', now() - interval '2 days'),
  ((SELECT id FROM account_id), '출금', 350000, 3000000, '삼성카드', now() - interval '1 day'),
  ((SELECT id FROM account_id), '입금', 200000, 3200000, '부업수입', now() - interval '12 hours'),
  ((SELECT id FROM account_id), '출금', 2200000, 1000000, '적금납입', now() - interval '6 hours');

-- 테스트 로그인 정보:
-- 아이디: test@kbstar.com
-- 비밀번호: test1234