import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

import { supabase } from '../../lib/supabase';
import { handleAuthError, handleUnknownError, safeLog } from '../../utils/errorHandler';
import { validateEmail, validatePassword, validateName, validatePhone, sanitizeInput } from '../../utils/validation';

import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  grade?: string;
  user_metadata?: {
    name?: string;
    phone?: string;
    grade?: string;
  };
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  session: Session | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  checkSession: () => Promise<boolean>;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    loading: true,
    session: null
  });

  // Supabase Auth 상태 변경 감지
  useEffect(() => {
    safeLog('info', '🔄 AuthContext: 초기화 시작');

    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      safeLog('info', '📌 AuthContext: 초기 세션 확인', { hasSession: !!session });
      
      if (session?.user) {
        loadUserProfile(session.user).then(() => {
          setAuthState(prev => ({
            ...prev,
            session,
            isLoggedIn: true,
            loading: false
          }));
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          session: null,
          isLoggedIn: false,
          loading: false
        }));
      }
    }).catch(error => {
      safeLog('error', '❌ AuthContext: 세션 확인 실패', error);
      setAuthState(prev => ({
        ...prev,
        loading: false
      }));
    });

    // Auth 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        safeLog('info', '🔔 AuthContext: Auth 상태 변경', { event });
        
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user);
          setAuthState(prev => ({
            ...prev,
            session,
            isLoggedIn: true,
            loading: false
          }));
        } else if (event === 'SIGNED_OUT') {
          setAuthState(prev => ({
            ...prev,
            user: null,
            session: null,
            isLoggedIn: false,
            loading: false
          }));
        } else if (event === 'USER_UPDATED' && session?.user) {
          await loadUserProfile(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // 사용자 프로필 로드
  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    safeLog('info', '👤 AuthContext: 사용자 프로필 로드 시작');
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        safeLog('error', '❌ AuthContext: 프로필 로드 실패', error);
        // 프로필이 없어도 이메일로 기본 사용자 정보 설정
        const user: User = {
          id: supabaseUser.id,
          name: supabaseUser.email?.split('@')[0] || 'User',
          email: supabaseUser.email || '',
          grade: 'STAR'
        };
        setAuthState(prev => ({
          ...prev,
          user,
          loading: false
        }));
        return;
      }

      if (data) {
        safeLog('info', '✅ AuthContext: 프로필 로드 성공');
        const user: User = {
          id: data.id,
          name: data.name || supabaseUser.email?.split('@')[0] || 'User',
          email: data.email || supabaseUser.email || '',
          phone: data.phone,
          grade: 'STAR'
        };
        setAuthState(prev => ({
          ...prev,
          user,
          loading: false
        }));
      }
    } catch (error) {
      safeLog('error', '❌ AuthContext: 프로필 로드 에러', error);
      // 에러가 발생해도 기본 사용자 정보 설정
      const user: User = {
        id: supabaseUser.id,
        name: supabaseUser.email?.split('@')[0] || 'User',
        email: supabaseUser.email || '',
        grade: 'STAR'
      };
      setAuthState(prev => ({
        ...prev,
        user,
        loading: false
      }));
    }
  };

  // 로그인 (메모이제이션)
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    safeLog('info', '🔐 AuthContext: 로그인 시도');
    
    // 입력 값 검증
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.errors[0] };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.errors[0] };
    }

    // 입력 값 정화
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());

    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password
      });

      if (error) {
        const errorMessage = handleAuthError(error, '로그인에 실패했습니다.');
        setAuthState(prev => ({ ...prev, loading: false }));
        return { success: false, error: errorMessage };
      }

      if (data.user && data.session) {
        safeLog('info', '✅ AuthContext: 로그인 성공');
        
        // 세션 설정
        setAuthState(prev => ({
          ...prev,
          session: data.session,
          isLoggedIn: true
        }));

        // 프로필 로드
        await loadUserProfile(data.user);
        return { success: true };
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, error: '로그인에 실패했습니다.' };
    } catch (error) {
      const errorMessage = handleUnknownError(error, '로그인 중 오류가 발생했습니다.');
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, error: errorMessage };
    }
  }, []); // 의존성 없음

  // 회원가입 (메모이제이션)
  const signup = useCallback(async (
    email: string, 
    password: string, 
    name: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    // 입력 값 검증
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.errors[0] };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.errors[0] };
    }

    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      return { success: false, error: nameValidation.errors[0] };
    }

    if (phone) {
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.isValid) {
        return { success: false, error: phoneValidation.errors[0] };
      }
    }

    // 입력 값 정화
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
    const sanitizedName = sanitizeInput(name.trim());
    const sanitizedPhone = phone ? sanitizeInput(phone.trim()) : undefined;

    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      // 1. Supabase Auth에 사용자 생성
      const { data, error: authError } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password
      });

      if (authError) {
        const errorMessage = handleAuthError(authError, '회원가입에 실패했습니다.');
        return { success: false, error: errorMessage };
      }

      if (!data.user) {
        return { success: false, error: '회원가입에 실패했습니다.' };
      }

      // 2. users 테이블에 프로필 생성
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: sanitizedEmail,
            name: sanitizedName,
            phone: sanitizedPhone,
            status: 'active'
          }
        ]);

      if (profileError) {
        safeLog('error', 'Profile creation error', profileError);
        return { success: false, error: '사용자 프로필 생성에 실패했습니다.' };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = handleUnknownError(error, '회원가입 중 오류가 발생했습니다.');
      return { success: false, error: errorMessage };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []); // 의존성 없음

  // 로그아웃 (메모이제이션)
  const logout = useCallback(async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      await supabase.auth.signOut();
      // 상태는 onAuthStateChange에서 자동으로 업데이트됨
    } catch (error) {
      safeLog('error', 'Logout error', error);
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []); // 의존성 없음

  // 사용자 정보 업데이트 (메모이제이션)
  const updateUser = useCallback(async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!authState.user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 입력 값 검증
    const sanitizedUpdates: Partial<User> = {};

    if (updates.email) {
      const emailValidation = validateEmail(updates.email);
      if (!emailValidation.isValid) {
        return { success: false, error: emailValidation.errors[0] };
      }
      sanitizedUpdates.email = sanitizeInput(updates.email.toLowerCase().trim());
    }

    if (updates.name) {
      const nameValidation = validateName(updates.name);
      if (!nameValidation.isValid) {
        return { success: false, error: nameValidation.errors[0] };
      }
      sanitizedUpdates.name = sanitizeInput(updates.name.trim());
    }

    if (updates.phone) {
      const phoneValidation = validatePhone(updates.phone);
      if (!phoneValidation.isValid) {
        return { success: false, error: phoneValidation.errors[0] };
      }
      sanitizedUpdates.phone = sanitizeInput(updates.phone.trim());
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(sanitizedUpdates)
        .eq('id', authState.user.id);

      if (error) {
        const errorMessage = handleUnknownError(error, '사용자 정보 업데이트에 실패했습니다.');
        return { success: false, error: errorMessage };
      }

      // 로컬 상태 업데이트
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...sanitizedUpdates } : null
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = handleUnknownError(error, '사용자 정보 업데이트에 실패했습니다.');
      return { success: false, error: errorMessage };
    }
  }, [authState.user]); // authState.user에 의존

  // 세션 유효성 확인 (메모이제이션)
  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        safeLog('error', 'Session check error:', error);
        return false;
      }

      if (!session) {
        safeLog('info', 'No active session');
        return false;
      }

      // 세션 만료 확인
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const now = Date.now();
      
      if (expiresAt && expiresAt < now) {
        safeLog('warn', 'Session expired');
        await supabase.auth.signOut();
        return false;
      }

      return true;
    } catch (error) {
      safeLog('error', 'Session check failed:', error);
      return false;
    }
  }, []); // 의존성 없음

  // Context value 메모이제이션으로 불필요한 리렌더링 방지
  const value = useMemo<AuthContextType>(() => ({
    ...authState,
    login,
    logout,
    signup,
    updateUser,
    checkSession,
    isInitialized: !authState.loading
  }), [authState, login, logout, signup, updateUser, checkSession]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;