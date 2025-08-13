import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { useAuth } from '../../../core/auth/AuthContext';
import { menuData, menuCategories } from '../data/menuData';

import { MenuCategories } from './MenuCategories';
import { MenuDetails } from './MenuDetails';
import { MenuHeaderComponent } from './MenuHeader';
import { MenuSearchSection } from './MenuSearchSection';
import { QuickActionsComponent } from './QuickActions';

/**
 * KB 스타뱅킹 전체메뉴 - 원본 스크린샷 100% 복제
 * 픽셀 단위로 정확히 일치하도록 구현
 */
interface KBMenuPageProps {
  onClose?: () => void;
}

export const KBMenuPage: React.FC<KBMenuPageProps> = ({ onClose }) => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('recent'); // 기본값을 '최근/My메뉴'로 설정
  const [searchTerm, setSearchTerm] = useState('');

  // X 버튼 클릭 시 대시보드로 이동하는 기본 핸들러
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('로그아웃 하시겠습니까?');
    if (confirmed) {
      await logout();
      navigate('/');
      handleClose();
    }
  };

  // 퀵 액션 핸들러
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'customer-center':
        // 고객센터 페이지로 이동 또는 관련 동작
        console.log('고객센터 클릭됨');
        break;
      case 'auth-security':
        // 인증/보안 페이지로 이동 또는 관련 동작
        console.log('인증/보안 클릭됨');
        break;
      case 'settings':
        // 환경설정 페이지로 이동 또는 관련 동작
        console.log('환경설정 클릭됨');
        break;
      default:
        break;
    }
  };

  // 메뉴 아이템 클릭 핸들러
  const handleMenuItemClick = (itemName: string) => {
    if (!isLoggedIn) {
      // 로그인되지 않은 경우 로그인 페이지로 이동
      navigate('/');
      handleClose();
      return;
    }

    // 메뉴 이름에 따른 라우팅
    switch (itemName) {
      case '이체':
        navigate('/transfer');
        break;
      case '계좌조회':
      case '예금계좌조회':
        navigate('/account');
        break;
      case '전체계좌조회':
        navigate('/comprehensive-account');
        break;
      case '거래내역조회':
      case '통합거래내역조회':
        navigate('/transactions');
        break;
      case '자산관리':
        navigate('/assets');
        break;
      case '혜택':
        navigate('/benefits');
        break;
      case '쇼핑':
        navigate('/shop');
        break;
      default:
        // 아직 구현되지 않은 메뉴는 알림 표시
        console.log(`${itemName} 메뉴 클릭됨 - 구현 예정`);
        break;
    }
    handleClose();
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (categoryKey: string) => {
    setActiveCategory(categoryKey);
  };

  const currentData = menuData[activeCategory as keyof typeof menuData] || { sections: [] };

  return (
    <>
      <MenuOverlay onClick={handleClose} />
      <MenuContainer>
        {/* 상단 헤더 */}
        <MenuHeaderComponent
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={handleLogout}
          onClose={handleClose}
        />

        {/* 검색 영역 */}
        <MenuSearchSection searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* 퀵 액션 버튼들 */}
        <QuickActionsComponent onAction={handleQuickAction} />

        {/* 메인 메뉴 영역 - 원본 스크린샷과 정확히 일치 */}
        <MenuContent>
          {/* 좌측 카테고리 사이드바 (30% 너비) */}
          <MenuCategories
            categories={menuCategories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />

          {/* 우측 상세 메뉴 (70% 너비) */}
          <MenuDetails
            menuData={currentData}
            onMenuItemClick={handleMenuItemClick}
            isLoggedIn={isLoggedIn}
            activeCategory={activeCategory}
          />
        </MenuContent>
      </MenuContainer>
    </>
  );
};

// 메뉴 전체 오버레이
const MenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

// 메뉴 컨테이너
const MenuContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 480px;
  height: 100vh;
  background-color: #ffffff;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
`;

// 메인 메뉴 컨텐츠 영역 - 좌우 분할 레이아웃
const MenuContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  border-top: 1px solid #e5e7eb;
`;
