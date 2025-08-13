-- KB StarBanking Clone - Sample Data
-- This script populates the database with realistic sample data for testing

-- Insert sample users
INSERT INTO users (id, email, name, phone, password_hash, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'kim.minjun@example.com', '김민준', '010-1234-5678', '$2b$10$example_hash_1', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'lee.seoyeon@example.com', '이서연', '010-2345-6789', '$2b$10$example_hash_2', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'park.jihoon@example.com', '박지훈', '010-3456-7890', '$2b$10$example_hash_3', 'active'),
('550e8400-e29b-41d4-a716-446655440004', 'choi.yuna@example.com', '최유나', '010-4567-8901', '$2b$10$example_hash_4', 'active'),
('550e8400-e29b-41d4-a716-446655440005', 'jung.hyunwoo@example.com', '정현우', '010-5678-9012', '$2b$10$example_hash_5', 'inactive');

-- Insert sample accounts
INSERT INTO accounts (id, user_id, account_number, account_name, account_type, balance, is_primary, status) VALUES
-- 김민준의 계좌들
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '110-123-456789', 'KB스타뱅킹통장', '보통예금', 2850000.00, true, 'active'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '110-123-987654', '적금통장', '적금', 5000000.00, false, 'active'),

-- 이서연의 계좌들
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '110-123-111222', 'KB급여통장', '보통예금', 4200000.00, true, 'active'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '110-123-333444', '정기예금', '정기예금', 10000000.00, false, 'active'),

-- 박지훈의 계좌들
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', '110-123-555666', '주거래통장', '보통예금', 1750000.00, true, 'active'),

-- 최유나의 계좌들
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440004', '110-123-777888', '용돈통장', '보통예금', 850000.00, true, 'active'),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', '110-123-999000', '청약적금', '적금', 3000000.00, false, 'active'),

-- 정현우의 계좌 (비활성 상태)
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440005', '110-123-121212', '휴면계좌', '보통예금', 50000.00, true, 'inactive');

-- Insert sample admin users
INSERT INTO admin_users (id, email, password_hash, role, permissions) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'admin@kbstar.com', '$2b$10$admin_hash_1', 'super_admin', ARRAY['user_management', 'account_management', 'transaction_management', 'system_settings']),
('770e8400-e29b-41d4-a716-446655440002', 'manager@kbstar.com', '$2b$10$admin_hash_2', 'manager', ARRAY['user_management', 'account_management', 'transaction_management']),
('770e8400-e29b-41d4-a716-446655440003', 'support@kbstar.com', '$2b$10$admin_hash_3', 'admin', ARRAY['transaction_management']);

-- Insert comprehensive transaction history for realistic testing
-- 김민준 계좌 거래내역 (최근 3개월)
INSERT INTO transactions (account_id, transaction_type, amount, balance_after, description, target_account, target_name, transaction_date) VALUES
-- 오늘 거래
('660e8400-e29b-41d4-a716-446655440001', '출금', 150000.00, 2850000.00, '생활비 인출', NULL, NULL, NOW()),
('660e8400-e29b-41d4-a716-446655440001', '입금', 3000000.00, 3000000.00, '급여이체', NULL, NULL, NOW() - INTERVAL '2 hours'),

-- 어제 거래
('660e8400-e29b-41d4-a716-446655440001', '출금', 85000.00, 150000.00, '마트결제', NULL, NULL, NOW() - INTERVAL '1 day'),
('660e8400-e29b-41d4-a716-446655440001', '출금', 12000.00, 235000.00, '교통비', NULL, NULL, NOW() - INTERVAL '1 day' - INTERVAL '3 hours'),
('660e8400-e29b-41d4-a716-446655440001', '이체', 200000.00, 247000.00, '용돈이체', '110-123-777888', '최유나', NOW() - INTERVAL '1 day' - INTERVAL '5 hours'),

-- 일주일 전
('660e8400-e29b-41d4-a716-446655440001', '출금', 45000.00, 447000.00, '주유비', NULL, NULL, NOW() - INTERVAL '7 days'),
('660e8400-e29b-41d4-a716-446655440001', '입금', 492000.00, 492000.00, '부업수입', NULL, NULL, NOW() - INTERVAL '7 days' - INTERVAL '2 hours'),

-- 한달 전
('660e8400-e29b-41d4-a716-446655440001', '출금', 850000.00, 0.00, '월세', NULL, NULL, NOW() - INTERVAL '30 days'),
('660e8400-e29b-41d4-a716-446655440001', '입금', 3200000.00, 850000.00, '급여이체', NULL, NULL, NOW() - INTERVAL '30 days' - INTERVAL '1 hour'),

-- 이서연 계좌 거래내역
('660e8400-e29b-41d4-a716-446655440003', '출금', 120000.00, 4200000.00, '쇼핑', NULL, NULL, NOW() - INTERVAL '2 hours'),
('660e8400-e29b-41d4-a716-446655440003', '입금', 4320000.00, 4320000.00, '급여이체', NULL, NULL, NOW() - INTERVAL '1 day'),
('660e8400-e29b-41d4-a716-446655440003', '이체', 500000.00, 0.00, '적금이체', '110-123-333444', '이서연 정기예금', NOW() - INTERVAL '5 days'),
('660e8400-e29b-41d4-a716-446655440003', '출금', 75000.00, 500000.00, '통신비', NULL, NULL, NOW() - INTERVAL '7 days'),

-- 박지훈 계좌 거래내역
('660e8400-e29b-41d4-a716-446655440005', '입금', 2800000.00, 1750000.00, '프리랜서 수입', NULL, NULL, NOW() - INTERVAL '3 days'),
('660e8400-e29b-41d4-a716-446655440005', '출금', 650000.00, -1050000.00, '렌트비', NULL, NULL, NOW() - INTERVAL '3 days' - INTERVAL '1 hour'),
('660e8400-e29b-41d4-a716-446655440005', '출금', 350000.00, 400000.00, '생활비', NULL, NULL, NOW() - INTERVAL '10 days'),
('660e8400-e29b-41d4-a716-446655440005', '입금', 750000.00, 750000.00, '프로젝트 완료', NULL, NULL, NOW() - INTERVAL '15 days'),

-- 최유나 계좌 거래내역
('660e8400-e29b-41d4-a716-446655440006', '입금', 200000.00, 850000.00, '용돈', NULL, NULL, NOW() - INTERVAL '1 day' - INTERVAL '5 hours'),
('660e8400-e29b-41d4-a716-446655440006', '출금', 25000.00, 650000.00, '카페', NULL, NULL, NOW() - INTERVAL '2 days'),
('660e8400-e29b-41d4-a716-446655440006', '출금', 180000.00, 675000.00, '옷 구매', NULL, NULL, NOW() - INTERVAL '5 days'),
('660e8400-e29b-41d4-a716-446655440006', '입금', 855000.00, 855000.00, '알바비', NULL, NULL, NOW() - INTERVAL '7 days'),

-- 더 많은 과거 거래내역 (통계 및 페이징 테스트용)
INSERT INTO transactions (account_id, transaction_type, amount, balance_after, description, transaction_date) 
SELECT 
    '660e8400-e29b-41d4-a716-446655440001',
    CASE 
        WHEN random() < 0.3 THEN '입금'
        WHEN random() < 0.7 THEN '출금'
        ELSE '이체'
    END,
    FLOOR(random() * 500000 + 10000)::DECIMAL(15,2),
    FLOOR(random() * 5000000 + 100000)::DECIMAL(15,2),
    CASE 
        WHEN random() < 0.2 THEN '급여이체'
        WHEN random() < 0.4 THEN '생활비'
        WHEN random() < 0.6 THEN '쇼핑'
        WHEN random() < 0.8 THEN '식비'
        ELSE '기타'
    END,
    NOW() - (random() * 90)::int * INTERVAL '1 day'
FROM generate_series(1, 50);

-- 이체 내역 추가
INSERT INTO transfer_history (from_account_id, to_account_number, to_account_name, amount, description, status, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', '110-123-777888', '최유나', 200000.00, '용돈이체', 'completed', NOW() - INTERVAL '1 day' - INTERVAL '5 hours'),
('660e8400-e29b-41d4-a716-446655440003', '110-123-333444', '이서연 정기예금', 500000.00, '적금이체', 'completed', NOW() - INTERVAL '5 days'),
('660e8400-e29b-41d4-a716-446655440001', '110-123-555666', '박지훈', 100000.00, '생일축하금', 'completed', NOW() - INTERVAL '15 days'),
('660e8400-e29b-41d4-a716-446655440006', '110-123-456789', '김민준', 50000.00, '돈 갚기', 'completed', NOW() - INTERVAL '20 days');

-- Update balances to match the latest transactions
UPDATE accounts SET balance = (
    SELECT balance_after 
    FROM transactions 
    WHERE account_id = accounts.id 
    ORDER BY transaction_date DESC, created_at DESC 
    LIMIT 1
) WHERE id IN (
    SELECT DISTINCT account_id FROM transactions
);

-- 실제 잔액 보정 (마지막 거래 기준)
UPDATE accounts SET balance = 2850000.00 WHERE id = '660e8400-e29b-41d4-a716-446655440001';
UPDATE accounts SET balance = 4200000.00 WHERE id = '660e8400-e29b-41d4-a716-446655440003';
UPDATE accounts SET balance = 1750000.00 WHERE id = '660e8400-e29b-41d4-a716-446655440005';
UPDATE accounts SET balance = 850000.00 WHERE id = '660e8400-e29b-41d4-a716-446655440006';