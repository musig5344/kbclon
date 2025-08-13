import React, { useState } from 'react';

import styled from 'styled-components';

import { dimensions } from '../../styles/dimensions';
import { tokens } from '../../styles/tokens';
// import { colors } from '../../styles/colors'; // 사용되지 않음
import { typography } from '../../styles/typography';
interface MenuItem {
  id: string;
  title: string;
  icon?: string;
  children?: MenuItem[];
  isNew?: boolean;
}
interface KBNavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}
// KB스타뱅킹 메뉴 구조 (완전 분석된 계층)
const menuData: MenuItem[] = [
  {
    id: 'account',
    title: '조회',
    children: [
      { id: 'account-inquiry', title: '계좌조회' },
      { id: 'transaction-history', title: '거래내역조회' },
      { id: 'balance-certificate', title: '잔액증명서' },
    ]
  },
  {
    id: 'transfer',
    title: '이체',
    children: [
      { id: 'transfer-account', title: '계좌이체' },
      { id: 'transfer-quick', title: '빠른이체' },
      { id: 'transfer-schedule', title: '예약이체' },
    ]
  },
  {
    id: 'card',
    title: '카드',
    children: [
      { id: 'card-inquiry', title: '카드조회' },
      { id: 'card-payment', title: '카드결제' },
      { id: 'card-limit', title: '한도조회/변경' },
    ]
  },
  {
    id: 'loan',
    title: '대출',
    children: [
      { id: 'loan-inquiry', title: '대출조회' },
      { id: 'loan-apply', title: '대출신청' },
      { id: 'loan-repay', title: '대출상환' },
    ]
  },
];
// 메뉴 오버레이
const MenuOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${tokens.colors.dimmedBackground};
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  z-index: 1000;
  max-width: 390px;
  margin: 0 auto;
`;
// 메뉴 컨테이너 (우측에서 슬라이드)
const MenuContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  background-color: ${tokens.colors.background.primary};
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
`;
// 메뉴 헤더
const MenuHeader = styled.div`
  height: ${dimensions.height.header}px;
  background-color: ${tokens.colors.background.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid ${tokens.colors.backgroundGray2};
`;
const MenuTitle = styled.h2`
  font-size: 18px;
  font-family: ${typography.fontFamily.kbfgTextBold};
  color: ${tokens.colors.text.primary};
  margin: 0;
`;
const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${dimensions.borderRadius.medium}px;
  &:hover {
    background-color: ${tokens.colors.backgroundGray1};
  }
`;
// 탭 컨테이너 (Zero Menu)
const TabContainer = styled.div`
  height: ${dimensions.height.zeroMenu}px;
  display: flex;
  background-color: ${tokens.colors.backgroundGray1};
  border-bottom: 1px solid ${tokens.colors.backgroundGray2};
`;
const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  height: 100%;
  border: none;
  background-color: ${props => props.$active ? tokens.colors.background.primary : 'transparent'};
  color: ${props => props.$active ? tokens.colors.text.primary : tokens.colors.text.tertiary};
  font-size: 16px;
  font-family: ${typography.fontFamily.kbfgTextMedium};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  ${props => props.$active && `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background-color: ${tokens.colors.brand.primary};
    }
  `}
`;
// 메뉴 컨텐츠
const MenuContent = styled.div`
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;
// One Menu (1차 메뉴)
const OneMenuList = styled.div`
  background-color: ${tokens.colors.backgroundGray1};
`;
const OneMenuItem = styled.button<{ $selected: boolean }>`
  width: 100%;
  min-height: ${dimensions.height.oneMenuMin + 24}px; // 최소 높이 + 패딩
  padding: 12px 24px;
  border: none;
  background-color: ${props => props.$selected ? tokens.colors.background.primary : tokens.colors.backgroundGray1};
  color: ${tokens.colors.text.primary};
  font-size: 15px;
  font-family: ${typography.fontFamily.kbfgTextLight};
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid ${tokens.colors.backgroundGray2};
  &:hover {
    background-color: ${tokens.colors.background.primary};
  }
`;
// Two Menu (2차 메뉴)
const TwoMenuContainer = styled.div`
  background-color: ${tokens.colors.background.primary};
  max-height: 400px;
  overflow-y: auto;
`;
// const TwoGroupMenu = styled.div`
//   padding: 18px 20px 6px;
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   border-bottom: 1px solid ${tokens.colors.backgroundGray2};
// `;
// const TwoGroupTitle = styled.h3`
//   font-size: 15px;
//   font-family: ${typography.fontFamily.kbfgTextMedium};
//   color: ${tokens.colors.text.primary};
//   margin: 0;
// `;
// const TwoGroupArrow = styled.div`
//   width: 16px;
//   height: 16px;
//   background-color: ${tokens.colors.text.tertiary};
//   margin-right: 24px;
// `;
const TwoChildMenu = styled.button`
  width: 100%;
  padding: 9px 20px 3px;
  border: none;
  background: none;
  color: ${tokens.colors.text.tertiary};
  font-size: 15px;
  font-family: ${typography.fontFamily.kbfgTextLight};
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: ${tokens.colors.backgroundGray1};
    color: ${tokens.colors.text.primary};
  }
`;
// Recent Menu (최근 사용 메뉴)
const RecentMenuSection = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${tokens.colors.backgroundGray2};
`;
const RecentMenuTitle = styled.h4`
  font-size: 14px;
  font-family: ${typography.fontFamily.kbfgTextMedium};
  color: ${tokens.colors.text.primary};
  margin: 0 0 12px 0;
`;
const RecentMenuList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;
const RecentMenuItem = styled.button`
  height: ${dimensions.height.recentMenu}px;
  padding: 0 12px;
  border: 1px solid ${tokens.colors.border.light};
  background-color: ${tokens.colors.background.primary};
  color: ${tokens.colors.text.tertiary};
  font-size: 14px;
  font-family: ${typography.fontFamily.kbfgTextLight};
  border-radius: ${dimensions.borderRadius.medium}px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  &:hover {
    background-color: ${tokens.colors.brand.primary};
    color: ${tokens.colors.text.primary};
    border-color: ${tokens.colors.brand.primary};
  }
`;
// My Menu (즐겨찾기)
const MyMenuSection = styled.div`
  padding: 16px 20px;
`;
const MyMenuTitle = styled.h4`
  font-size: 14px;
  font-family: ${typography.fontFamily.kbfgTextMedium};
  color: ${tokens.colors.text.primary};
  margin: 0 0 12px 0;
`;
const MyMenuList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;
const MyMenuItem = styled.button`
  height: ${dimensions.height.myMenu}px;
  min-width: ${dimensions.height.myMenu}px;
  padding: 0 16px;
  border: 1px solid ${tokens.colors.border.light};
  background-color: ${tokens.colors.background.primary};
  color: ${tokens.colors.text.primary};
  font-size: 14px;
  font-family: ${typography.fontFamily.kbfgTextLight};
  border-radius: ${dimensions.borderRadius.round}px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: ${tokens.colors.brand.primary};
    border-color: ${tokens.colors.brand.primary};
  }
`;
const KBNavigationMenu: React.FC<KBNavigationMenuProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'recent' | 'my'>('menu');
  const [selectedOneMenu, setSelectedOneMenu] = useState<string>('account');
  const [recentMenus] = useState(['계좌조회', '이체', '카드조회']);
  const [myMenus] = useState(['빠른이체', '잔액조회', '카드결제']);
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  const selectedMenuData = menuData.find(menu => menu.id === selectedOneMenu);
  return (
    <MenuOverlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <MenuContainer $isOpen={isOpen}>
        {/* 메뉴 헤더 */}
        <MenuHeader>
          <MenuTitle>전체메뉴</MenuTitle>
          <CloseButton onClick={onClose}>
            <div style={{ width: 16, height: 16, backgroundColor: tokens.colors.text.tertiary }} />
          </CloseButton>
        </MenuHeader>
        {/* 탭 메뉴 (Zero Menu) */}
        <TabContainer>
          <TabButton 
            $active={activeTab === 'menu'}
            onClick={() => setActiveTab('menu')}
          >
            메뉴
          </TabButton>
          <TabButton 
            $active={activeTab === 'recent'}
            onClick={() => setActiveTab('recent')}
          >
            최근
          </TabButton>
          <TabButton 
            $active={activeTab === 'my'}
            onClick={() => setActiveTab('my')}
          >
            MY
          </TabButton>
        </TabContainer>
        {/* 메뉴 컨텐츠 */}
        <MenuContent>
          {activeTab === 'menu' && (
            <div style={{ display: 'flex', height: '100%' }}>
              {/* One Menu (1차 메뉴) */}
              <OneMenuList style={{ width: '40%', borderRight: `1px solid ${tokens.colors.backgroundGray2}` }}>
                {menuData.map(menu => (
                  <OneMenuItem
                    key={menu.id}
                    $selected={selectedOneMenu === menu.id}
                    onClick={() => setSelectedOneMenu(menu.id)}
                  >
                    {menu.title}
                  </OneMenuItem>
                ))}
              </OneMenuList>
              {/* Two Menu (2차 메뉴) */}
              <TwoMenuContainer style={{ width: '60%' }}>
                {selectedMenuData?.children?.map(childMenu => (
                  <TwoChildMenu key={childMenu.id}>
                    {childMenu.title}
                  </TwoChildMenu>
                ))}
              </TwoMenuContainer>
            </div>
          )}
          {activeTab === 'recent' && (
            <RecentMenuSection>
              <RecentMenuTitle>최근 사용 메뉴</RecentMenuTitle>
              <RecentMenuList>
                {recentMenus.map((menu, index) => (
                  <RecentMenuItem key={index}>
                    {menu}
                  </RecentMenuItem>
                ))}
              </RecentMenuList>
            </RecentMenuSection>
          )}
          {activeTab === 'my' && (
            <MyMenuSection>
              <MyMenuTitle>즐겨찾는 메뉴</MyMenuTitle>
              <MyMenuList>
                {myMenus.map((menu, index) => (
                  <MyMenuItem key={index}>
                    {menu}
                  </MyMenuItem>
                ))}
              </MyMenuList>
            </MyMenuSection>
          )}
        </MenuContent>
      </MenuContainer>
    </MenuOverlay>
  );
};
export default KBNavigationMenu;