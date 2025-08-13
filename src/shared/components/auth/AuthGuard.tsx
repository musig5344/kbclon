import React, { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../core/auth/AuthContext';
import { safeLog } from '../../../utils/errorHandler';
import { LoadingScreen } from '../ui/UnifiedLoading';
interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/auth/login',
}) => {
  const navigate = useNavigate();
  const { user, isInitialized, checkSession } = useAuth();
  useEffect(() => {
    const verifyAuth = async () => {
      if (!isInitialized) return;
      // 세션 재확인
      const isValid = await checkSession();
      if (requireAuth && !isValid) {
        safeLog('warn', 'AuthGuard: 인증되지 않은 접근 시도');
        navigate(redirectTo, { replace: true });
      } else if (!requireAuth && isValid) {
        // 로그인 페이지 등에서 이미 로그인된 경우
        navigate('/dashboard', { replace: true });
      }
    };
    verifyAuth();
  }, [isInitialized, user, requireAuth, redirectTo, navigate, checkSession]);
  // 초기화 중일 때 로딩 화면 표시
  if (!isInitialized) {
    return <LoadingScreen />;
  }
  // 인증이 필요한데 사용자가 없는 경우
  if (requireAuth && !user) {
    return <LoadingScreen />;
  }
  // 인증이 필요 없는데 사용자가 있는 경우 (로그인 페이지 등)
  if (!requireAuth && user) {
    return <LoadingScreen />;
  }
  return <>{children}</>;
};
