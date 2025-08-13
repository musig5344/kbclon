import React, { useEffect, useState } from 'react';

import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../../core/auth/AuthContext';

import { PageLoader } from './PageLoader';
const ProtectedRoute: React.FC = () => {
  const authContext = useAuth();
  const [isInitialCheck, setIsInitialCheck] = useState(true);
  useEffect(() => {
    // 초기 체크 완료 후 플래그 설정
    const timer = setTimeout(() => {
      setIsInitialCheck(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  // 초기 로딩이거나 인증 확인 중일 때만 로더 표시
  if (isInitialCheck && authContext.loading) {
    return <PageLoader />;
  }
  // 인증 상태 확인 - AuthContext만 사용
  const isAuthenticated = authContext.isLoggedIn && !!authContext.session;
  if (!isAuthenticated) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Authentication check failed:', {
        isLoggedIn: authContext.isLoggedIn,
        hasSession: !!authContext.session,
        hasUser: !!authContext.user,
      });
    }
    return <Navigate to='/' replace />;
  }
  if (process.env.NODE_ENV === 'development') {
    console.log('User authenticated:', {
      userId: authContext.user?.id,
      userEmail: authContext.user?.email,
    });
  }
  return <Outlet />;
};
export default ProtectedRoute;
