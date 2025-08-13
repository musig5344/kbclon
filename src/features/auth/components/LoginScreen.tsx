import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { LoginHeader } from '../../../shared/components/layout/LoginHeader';
import { Button } from '../../../shared/components/ui/Button/Button';

import { LoginBottomSheet } from './LoginBottomSheet';
import { LoginFooter } from './LoginFooter';
import { LoginOptionsSection } from './LoginOptionsSection';
// AuthContext is available if needed for future functionality
// import { useAuth } from '../AuthContext';
// 스타일드 컴포넌트 import
import {
  GlobalStyles,
  CoordinatorLayout,
  BackSurfaceView,
  ContentLayout,
  NewLoginMainContainer,
  TitleSection,
  MainTitle,
  SubTitle,
  YellowButton,
  BottomLinkContainer,
  BottomLink,
  LinkDivider,
} from './LoginScreen.styles';

// 전역 스타일 주입
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = GlobalStyles;
  document.head.appendChild(styleElement);
}

interface LoginScreenProps {}

export const LoginScreen: React.FC<LoginScreenProps> = () => {
  const navigate = useNavigate();
  // These are available if needed for future authentication flows
  // const { setUser, setSession } = useUserStore();
  // const { login } = useAuth();
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [desiredTab, setDesiredTab] = useState(0);

  const handleOtherLoginClick = () => {
    setIsClosing(false);
    setIsBottomSheetOpen(true);
  };

  const handleBackSurfaceClick = () => {
    setIsClosing(true);
    setTimeout(() => setIsBottomSheetOpen(false), 300);
  };

  // 원본 KB 스타뱅킹과 동일한 네비게이션 핸들러들
  const handleMenuClick = () => {
    navigate('/menu');
  };

  const handleSearchClick = () => {
    // 검색 기능 또는 검색 페이지로 이동
    alert('검색 기능이 구현되면 여기에 연결됩니다.');
    // 추후 검색 페이지로 이돔 예정: navigate('/search');
  };

  const handleBiometricAuth = (_type: 'fingerprint' | 'pattern') => {
    // 데모에서는 직접 아이디 로그인 페이지로 이동
    setDesiredTab(2); // 아이디 탭으로 이동
    setIsClosing(false);
    setIsBottomSheetOpen(true);
  };

  const handleCertIssue = () => {
    // TODO: 실제 인증서 발급 기능 구현
    alert('인증서 발급 기능은 준비 중입니다.');
  };

  const handleSimplePay = () => {
    // 간편송금 기능 - 로그인 후 사용 가능
    alert('간편송금·결제는 로그인 후 이용할 수 있습니다.\n아이디 로그인을 해주세요.');
    setDesiredTab(2); // 아이디 탭으로 이동
    setIsClosing(false);
    setIsBottomSheetOpen(true);
  };

  const handleSignup = () => {
    alert('준비중입니다.');
  };

  const handleAuthCenter = () => {
    alert('준비중입니다.');
  };

  return (
    <CoordinatorLayout>
      <BackSurfaceView $isOpen={isBottomSheetOpen} onClick={handleBackSurfaceClick} />
      <LoginHeader
        title='KB국민인증서'
        onSearchClick={handleSearchClick}
        onMenuClick={handleMenuClick}
      />
      <ContentLayout>
        <NewLoginMainContainer>
          <TitleSection>
            <MainTitle>KB국민인증서</MainTitle>
            <SubTitle>쉽고 빠른 전자서명</SubTitle>
          </TitleSection>
          <LoginOptionsSection onBiometricAuth={handleBiometricAuth} />
          <YellowButton
            onClick={handleCertIssue}
            aria-label='KB국민인증서 발급 시작하기'
            type='button'
          >
            간편하게 인증서 발급하기
          </YellowButton>
          <BottomLinkContainer role='navigation' aria-label='보조 메뉴'>
            <BottomLink
              onClick={handleOtherLoginClick}
              aria-label='다른 로그인 방법 선택'
              type='button'
            >
              다른 로그인 방법 선택
            </BottomLink>
          </BottomLinkContainer>
        </NewLoginMainContainer>
        <LoginFooter onSimplePay={handleSimplePay} />
      </ContentLayout>
      <LoginBottomSheet
        isOpen={isBottomSheetOpen}
        isClosing={isClosing}
        onClose={handleBackSurfaceClick}
        initialTab={desiredTab}
      />
    </CoordinatorLayout>
  );
};
