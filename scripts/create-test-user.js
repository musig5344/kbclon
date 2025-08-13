#!/usr/bin/env node

/**
 * Create Test User Script for KB StarBanking Clone
 * This script creates a test user in Supabase Auth and the corresponding profile in the database
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Test user credentials
const TEST_USER = {
  email: 'test@kbstar.com',
  password: 'test123',
  name: '테스트사용자',
  phone: '010-1234-5678'
};

async function createTestUser() {
  if (!supabaseUrl) {
    console.error('❌ Missing REACT_APP_SUPABASE_URL in environment variables');
    process.exit(1);
  }

  if (!supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in environment variables');
    console.error('ℹ️  You need to add SUPABASE_SERVICE_ROLE_KEY to your .env file');
    console.error('ℹ️  You can find this key in your Supabase dashboard under Settings > API');
    process.exit(1);
  }

  // Create Supabase client with service role key (bypasses RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('🚀 Creating test user...');
    console.log(`📧 Email: ${TEST_USER.email}`);
    console.log(`🔑 Password: ${TEST_USER.password}`);

    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: TEST_USER.email,
      password: TEST_USER.password,
      email_confirm: true // Auto-confirm the email
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log('⚠️  User already exists in Supabase Auth');
        
        // Try to get existing user
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users?.users?.find(u => u.email === TEST_USER.email);
        
        if (existingUser) {
          console.log('✅ Found existing user:', existingUser.id);
          
          // Check if profile exists
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', existingUser.id)
            .single();
            
          if (!profile) {
            console.log('📝 Creating missing user profile...');
            await createUserProfile(supabase, existingUser.id);
          } else {
            console.log('✅ User profile already exists');
          }
          
          await createSampleData(supabase, existingUser.id);
          return;
        }
      }
      
      throw authError;
    }

    const userId = authData.user.id;
    console.log('✅ User created in Supabase Auth:', userId);

    // Step 2: Create user profile in the database
    await createUserProfile(supabase, userId);

    // Step 3: Create sample account data
    await createSampleData(supabase, userId);

    console.log('✅ Test user created successfully!');
    console.log('\n📋 You can now login with:');
    console.log(`   Email: ${TEST_USER.email}`);
    console.log(`   Password: ${TEST_USER.password}`);

  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
}

async function createUserProfile(supabase, userId) {
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: TEST_USER.email,
      name: TEST_USER.name,
      phone: TEST_USER.phone,
      status: 'active'
    });

  if (profileError) {
    if (profileError.code === '23505') { // Unique violation
      console.log('⚠️  User profile already exists');
    } else {
      throw profileError;
    }
  } else {
    console.log('✅ User profile created in database');
  }
}

async function createSampleData(supabase, userId) {
  try {
    // Check if user already has accounts
    const { data: existingAccounts } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', userId);

    if (existingAccounts && existingAccounts.length > 0) {
      console.log('⚠️  User already has accounts, skipping sample data creation');
      return;
    }

    console.log('📊 Creating sample account data...');

    // Get KB Bank ID
    const { data: banks } = await supabase
      .from('banks')
      .select('id')
      .eq('bank_code', '001')
      .single();

    if (!banks) {
      console.error('❌ KB Bank not found in database');
      return;
    }

    // Create a sample account
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .insert({
        user_id: userId,
        bank_id: banks.id,
        account_number: '1002-123-456789',
        account_type: 'KB Star*t 통장',
        account_holder: TEST_USER.name,
        balance: 102418.00,
        is_primary: true,
        account_alias: '주거래통장'
      })
      .select()
      .single();

    if (accountError) {
      console.error('❌ Error creating account:', accountError);
      return;
    }

    console.log('✅ Sample account created');

    // Create sample transactions
    const transactions = [
      {
        account_id: account.id,
        transaction_type: 'income',
        amount: 50000.00,
        description: '카카오뱅크',
        transaction_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        balance_after: 102418.00
      },
      {
        account_id: account.id,
        transaction_type: 'expense',
        amount: 4500.00,
        description: '스타벅스코리아',
        transaction_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        balance_after: 52418.00
      },
      {
        account_id: account.id,
        transaction_type: 'expense',
        amount: 15000.00,
        description: '교보문고',
        transaction_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        balance_after: 56918.00
      }
    ];

    const { error: transactionError } = await supabase
      .from('transactions')
      .insert(transactions);

    if (transactionError) {
      console.error('❌ Error creating transactions:', transactionError);
    } else {
      console.log('✅ Sample transactions created');
    }

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

// Run the script
createTestUser();