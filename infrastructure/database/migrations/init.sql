-- KB StarBanking Clone Database Schema
-- This script sets up the complete database schema for the KB StarBanking application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (사용자 정보)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Accounts table (계좌 정보)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- '보통예금', '적금', '당좌예금', '정기예금'
    balance DECIMAL(15,2) DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'closed'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table (거래내역)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL, -- '입금', '출금', '이체'
    amount DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    target_account VARCHAR(50), -- 이체 대상 계좌 (이체시만)
    target_name VARCHAR(100), -- 이체 대상 이름 (이체시만)
    transaction_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Transfer history table (이체 기록)
CREATE TABLE transfer_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_account_id UUID REFERENCES accounts(id),
    to_account_number VARCHAR(50) NOT NULL,
    to_account_name VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(255),
    status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    transaction_id UUID REFERENCES transactions(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Admin users table (관리자 사용자)
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin', -- 'admin', 'super_admin', 'manager'
    permissions TEXT[], -- 권한 배열
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Create indexes for performance optimization
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_status ON accounts(status);
CREATE INDEX idx_transactions_account_date ON transactions(account_id, transaction_date DESC);
CREATE INDEX idx_transactions_type_date ON transactions(transaction_type, transaction_date DESC);
CREATE INDEX idx_transactions_amount_date ON transactions(amount, transaction_date DESC);
CREATE INDEX idx_transfer_from_account ON transfer_history(from_account_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for accounts
CREATE POLICY "Users can view own accounts" ON accounts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own accounts" ON accounts
    FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert transactions" ON transactions
    FOR INSERT WITH CHECK (true);

-- RLS Policies for transfer_history
CREATE POLICY "Users can view own transfers" ON transfer_history
    FOR SELECT USING (
        from_account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert transfers" ON transfer_history
    FOR INSERT WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate account numbers
CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS TEXT AS $$
DECLARE
    account_num TEXT;
    exists_check INTEGER;
BEGIN
    LOOP
        -- Generate account number format: 110-123-XXXXXX (6 random digits)
        account_num := '110-123-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        
        -- Check if it already exists
        SELECT COUNT(*) INTO exists_check FROM accounts WHERE account_number = account_num;
        
        -- If it doesn't exist, we can use it
        IF exists_check = 0 THEN
            RETURN account_num;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to handle transaction creation and balance update
CREATE OR REPLACE FUNCTION process_transaction(
    p_account_id UUID,
    p_transaction_type TEXT,
    p_amount DECIMAL,
    p_description TEXT,
    p_target_account TEXT DEFAULT NULL,
    p_target_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    current_balance DECIMAL;
    new_balance DECIMAL;
    transaction_id UUID;
BEGIN
    -- Get current balance
    SELECT balance INTO current_balance FROM accounts WHERE id = p_account_id;
    
    -- Calculate new balance
    IF p_transaction_type = '입금' THEN
        new_balance := current_balance + p_amount;
    ELSIF p_transaction_type = '출금' OR p_transaction_type = '이체' THEN
        new_balance := current_balance - p_amount;
    END IF;
    
    -- Check for sufficient funds
    IF new_balance < 0 THEN
        RAISE EXCEPTION 'Insufficient funds';
    END IF;
    
    -- Update account balance
    UPDATE accounts SET balance = new_balance WHERE id = p_account_id;
    
    -- Insert transaction record
    INSERT INTO transactions (
        account_id, transaction_type, amount, balance_after, 
        description, target_account, target_name
    ) VALUES (
        p_account_id, p_transaction_type, p_amount, new_balance,
        p_description, p_target_account, p_target_name
    ) RETURNING id INTO transaction_id;
    
    RETURN transaction_id;
END;
$$ LANGUAGE plpgsql;