import React from 'react';

import { NavLink, useLocation } from 'react-router-dom';

import styled from 'styled-components';

// Import tab icons - 원본 KB 스타뱅킹 탭바 아이콘들
import iconAssets from '../../../assets/images/icons/icon_tab_assets.png';
import iconGift from '../../../assets/images/icons/icon_tab_gift.png';
import iconMenu from '../../../assets/images/icons/icon_tab_menu.png';
import iconShop from '../../../assets/images/icons/icon_tab_shop.png';
import iconWallet from '../../../assets/images/icons/icon_tab_wallet.png';
import {
  androidOptimizedNavigation,
  androidOptimizedButton,
} from '../../../styles/android-webview-optimizations';
import {
  responsiveTabBar,
  responsiveSizes,
  responsiveSpacing,
} from '../../../styles/responsive-overhaul';
import { tokens } from '../../../styles/tokens';
const TabBarContainer = styled.nav.attrs({
  role: 'navigation',
  'aria-label': '주요 메뉴',
})`
  ${androidOptimizedNavigation}
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: ${tokens.colors.background.primary};
  border-top: 1px solid ${tokens.colors.border.secondary};
  box-shadow: ${tokens.shadows.navigationTop};
  padding: 0 ${responsiveSpacing.sm};
`;
const TabItem = styled(NavLink)<{ $isMain?: boolean }>`
  ${androidOptimizedButton}
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  gap: ${tokens.spacing[1]};
  text-decoration: none;
  border-radius: ${tokens.borderRadius.medium};
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  /* Android WebView 터치 최적화 */
  &:hover {
    background-color: ${tokens.colors.action.hover};
  }
`;
const IconWrapper = styled.div<{ $isMain?: boolean; $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => (props.$isMain ? '44px' : '32px')};
  height: ${props => (props.$isMain ? '44px' : '32px')};
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  ${props =>
    props.$isMain &&
    props.$active &&
    `
    background: linear-gradient(135deg, ${tokens.colors.brand.primary} 0%, ${tokens.colors.brand.pressed} 100%);
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(255, 211, 56, 0.6);
    transform: scale(1.08);
  `}
  ${props =>
    props.$isMain &&
    !props.$active &&
    `
    background: ${tokens.colors.background.surfaceVariant};
    border-radius: 50%;
    border: 1px solid ${tokens.colors.border.secondary};
  `}
`;
const TabIcon = styled.img<{ $active: boolean; $isMain?: boolean }>`
  width: ${props => (props.$isMain ? '24px' : '26px')};
  height: ${props => (props.$isMain ? '24px' : '26px')};
  object-fit: contain;
  transition: all 0.2s ease;
  opacity: 1;
  filter: ${props => {
    if (props.$isMain && props.$active) {
      return 'brightness(0) invert(1) drop-shadow(0 1px 2px rgba(0,0,0,0.2))';
    }
    if (props.$active) {
      return 'brightness(0) saturate(1.2) contrast(1.3)';
    }
    return 'grayscale(100%) brightness(0.4) contrast(1.2)';
  }};
`;
const TabLabel = styled.span<{ $active: boolean; $isMain?: boolean }>`
  font-size: 12px;
  font-weight: ${props => (props.$active ? '700' : '600')};
  letter-spacing: -0.4px;
  margin-top: 3px;
  font-family: 'KBFGText', sans-serif;
  color: ${props => {
    if (props.$active && props.$isMain) return tokens.colors.functional.warning;
    if (props.$active) return tokens.colors.text.primary;
    return tokens.colors.text.tertiary;
  }};
  line-height: 1.2;
  transition: all 0.2s ease;
  text-shadow: ${props => (props.$active ? '0 0.5px 2px rgba(0,0,0,0.15)' : 'none')};
`;
// 활성 탭 인디케이터 (선택적 창작 요소)
const ActiveIndicator = styled.div<{ $show: boolean }>`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) ${props => (props.$show ? 'scaleX(1)' : 'scaleX(0)')};
  width: 70%;
  height: 3px;
  background: linear-gradient(
    90deg,
    ${tokens.colors.brand.primary} 0%,
    ${tokens.colors.brand.pressed} 100%
  );
  border-radius: 0 0 3px 3px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${props => (props.$show ? 1 : 0)};
  box-shadow: 0 1px 4px rgba(255, 211, 56, 0.5);
`;
const TABS = [
  { path: '/shop', label: '상품', iconSrc: iconShop },
  { path: '/time', label: '시간', iconSrc: iconAssets },
  { path: '/dashboard', label: '지갑', iconSrc: iconWallet, isMain: true },
  { path: '/benefits', label: '혜택', iconSrc: iconGift },
  { path: '/data', label: '데이터', iconSrc: iconMenu },
];
const TabBar: React.FC = () => {
  const location = useLocation();
  return (
    <TabBarContainer>
      {TABS.map(tab => {
        const isActive =
          location.pathname === tab.path ||
          (tab.path === '/dashboard' && location.pathname === '/');
        return (
          <TabItem
            to={tab.path}
            key={tab.path}
            $isMain={tab.isMain}
            aria-label={`${tab.label} 페이지로 이동`}
            role='tab'
            aria-current={isActive ? 'page' : undefined}
          >
            <ActiveIndicator $show={isActive && !tab.isMain} />
            <IconWrapper $isMain={tab.isMain} $active={isActive}>
              <TabIcon src={tab.iconSrc} alt={tab.label} $active={isActive} $isMain={tab.isMain} />
            </IconWrapper>
            <TabLabel $active={isActive} $isMain={tab.isMain && isActive}>
              {tab.label}
            </TabLabel>
          </TabItem>
        );
      })}
    </TabBarContainer>
  );
};
export default TabBar;
