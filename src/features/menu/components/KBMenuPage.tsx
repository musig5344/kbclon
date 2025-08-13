import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../core/auth/AuthContext';
import { menuData, menuCategories } from '../data/menuData';
import {
  MenuOverlay,
  MenuContainer,
  MenuContent,
  CategorySidebar,
  CategoryItem,
  MenuDetailSection,
  MenuSectionTitle,
  MenuItemList,
  MenuItem,
  DisabledText,
  SettingButton
} from '../styles/KBMenuStyles';
import { MenuItemType, MenuSection, MenuData } from '../types/menuTypes';

import { MenuHeaderComponent } from './MenuHeader';
import { MenuSearchSection } from './MenuSearchSection';
import { QuickActionsComponent } from './QuickActions';

/**
 * KB 스타뱅킹 전체메뉴 - 원본 100% 복제
 * 원본 스크린샷 기준으로 완벽하게 재현
 */
interface KBMenuPageProps {
  onClose?: () => void;
}
export const KBMenuPage: React.FC<KBMenuPageProps> = ({ onClose }) => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('recent');
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
        break;
      case 'auth-security':
        // 인증/보안 페이지로 이동 또는 관련 동작
        break;
      case 'settings':
        // 환경설정 페이지로 이동 또는 관련 동작
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
        // 아직 구현되지 않은 메뉴는 알림 표시 또는 대시보드로 이동
        break;
    }
    handleClose();
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
      <MenuSearchSection 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      {/* 퀵 액션 버튼들 */}
      <QuickActionsComponent onAction={handleQuickAction} />
      {/* 메인 메뉴 영역 */}
      <MenuContent>
        {/* 좌측 카테고리 사이드바 */}
        <CategorySidebar>
          {menuCategories.map(category => (
            <CategoryItem
              key={category.key}
              $active={activeCategory === category.key}
              onClick={() => setActiveCategory(category.key)}
            >
              {category.label}
            </CategoryItem>
          ))}
        </CategorySidebar>
        {/* 우측 상세 메뉴 */}
        <MenuDetailSection>
          {currentData.sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && (
                <MenuSectionTitle $highlighted={section.highlighted}>
                  {section.title}
                </MenuSectionTitle>
              )}
              <MenuItemList>
                {section.items.length > 0 ? (
                  section.items.map((item, itemIndex) => (
                    <MenuItem 
                      key={itemIndex}
                      onClick={() => handleMenuItemClick(item.name)}
                    >
                      <span>{item.name}</span>
                      {item.hasButton && (
                        <SettingButton onClick={(e) => e.stopPropagation()}>등록</SettingButton>
                      )}
                      {item.hasDropdown && (
                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>▼</span>
                      )}
                    </MenuItem>
                  ))
                ) : (
                  <DisabledText>로그인 후 이용할 수 있습니다.</DisabledText>
                )}
              </MenuItemList>
            </div>
          ))}
        </MenuDetailSection>
      </MenuContent>
    </MenuContainer>
    </>
  );
};