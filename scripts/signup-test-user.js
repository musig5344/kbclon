#!/usr/bin/env node

/**
 * Alternative signup script using Supabase Auth client-side signup
 * This simulates what would happen if a user signed up through the app
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Test user credentials
const TEST_USER = {
  email: 'test@kbstar.com',
  password: 'test123',
  name: '테스트사용자',
  phone: '010-1234-5678'
};

async function signupTestUser() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  // Create Supabase client with anon key (simulating client-side signup)
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log('🚀 Signing up test user...');
    console.log(`📧 Email: ${TEST_USER.email}`);
    console.log(`🔑 Password: ${TEST_USER.password}`);

    // Step 1: Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    if (authError) {
      throw authError;
    }

    const userId = authData.user?.id;
    if (!userId) {
      throw new Error('User ID not returned from signup');
    }

    console.log('✅ User signed up successfully:', userId);
    console.log('📧 Check your email for confirmation link (if email confirmations are enabled)');

    // Step 2: Create user profile
    // Note: This might fail due to RLS if the user hasn't confirmed their email
    // In production, this would typically be done after email confirmation
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
      console.warn('⚠️  Could not create user profile:', profileError.message);
      console.log('ℹ️  This might be due to RLS policies. The profile will be created on first login.');
    } else {
      console.log('✅ User profile created');
    }

    console.log('\n📋 Next steps:');
    console.log('1. If email confirmations are enabled, check the email and confirm');
    console.log('2. Login with the credentials:');
    console.log(`   Email: ${TEST_USER.email}`);
    console.log(`   Password: ${TEST_USER.password}`);

  } catch (error) {
    console.error('❌ Error during signup:', error);
    
    if (error.message?.includes('already registered')) {
      console.log('\n⚠️  This user already exists.');
      console.log('ℹ️  Try logging in with the existing credentials or use a different email.');
    }
    
    process.exit(1);
  }
}

// Run the script
signupTestUser();