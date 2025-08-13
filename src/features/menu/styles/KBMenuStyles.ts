import styled from 'styled-components';

import { FullScreenModalContainer } from '../../../shared/components/layout/MobileContainer';
import { duration, easing } from '../../../styles/animations';
import { tokens } from '../../../styles/tokens';

/* === 레이아웃 === */
export const MenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${tokens.colors.backdrop.medium};
  z-index: 998;
  animation: overlayFadeIn 0.3s ease-out forwards;
  cursor: pointer;
  @keyframes overlayFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const MenuContainer = styled(FullScreenModalContainer)`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  max-width: 430px;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background-color: ${tokens.colors.background.primary};
  z-index: 999;
  /* 진입 애니메이션 */
  animation: menuFadeIn 0.3s ease-out forwards;
  @keyframes menuFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const MenuContent = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`;

/* === 헤더 === */
export const MenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  background-color: ${tokens.colors.background.primary};
  border-bottom: 1px solid ${tokens.colors.border.light};
  position: relative;
`;

export const LoginButton = styled.button`
  background: none;
  border: 1px solid ${tokens.colors.border.secondary};
  border-radius: ${tokens.borderRadius.pill};
  padding: ${tokens.spacing[2]} ${tokens.spacing[4]};
  font-size: ${tokens.typography.fontSize.bodyMedium};
  color: ${tokens.colors.text.primary};
  font-weight: ${tokens.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${duration.fast} ${easing.easeInOut};
  &:hover {
    background-color: ${tokens.colors.background.surfaceVariant};
  }
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
`;

export const UserDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const UserNameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const UserName = styled.span`
  font-size: ${tokens.typography.fontSize.bodyMedium};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.text.primary};
  line-height: ${tokens.typography.lineHeight.label};
`;

export const UserGrade = styled.span`
  font-size: ${tokens.typography.fontSize.bodySmall};
  color: ${tokens.colors.text.secondary};
  line-height: ${tokens.typography.lineHeight.label};
`;

export const LogoutButton = styled.button`
  background: none;
  border: 1px solid ${tokens.colors.border.secondary};
  border-radius: ${tokens.borderRadius.medium};
  padding: 4px 12px;
  font-size: ${tokens.typography.fontSize.bodySmall};
  color: ${tokens.colors.text.secondary};
  font-weight: ${tokens.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${duration.fast} ${easing.easeInOut};
  &:hover {
    background-color: ${tokens.colors.background.surfaceVariant};
    color: ${tokens.colors.text.primary};
    border-color: ${tokens.colors.border.primary};
  }
  &:active {
    transform: scale(0.95);
  }
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const LanguageButton = styled.button`
  background: none;
  border: none;
  font-size: ${tokens.typography.fontSize.bodyMedium};
  color: ${tokens.colors.text.tertiary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[1]};
  transition: color ${duration.fast} ${easing.easeInOut};
  &::before {
    content: '🌐';
    font-size: ${tokens.typography.fontSize.bodyLarge};
  }
  &:hover {
    color: ${tokens.colors.text.secondary};
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 28px;
  color: ${tokens.colors.text.primary};
  cursor: pointer;
  padding: ${tokens.spacing[2]};
  min-width: ${tokens.sizes.touch.minimum};
  min-height: ${tokens.sizes.touch.minimum};
  line-height: 1;
  transition: all ${duration.fast} ${easing.easeInOut};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: ${tokens.colors.action.hover};
    border-radius: 50%;
  }
  &:active {
    transform: scale(0.95);
  }
  &:focus {
    outline: none;
  }
`;

/* === 검색 === */
export const SearchSection = styled.div`
  padding: ${tokens.spacing[4]};
  background-color: ${tokens.colors.background.primary};
`;

export const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const SearchInput = styled.input`
  width: 100%;
  height: ${tokens.sizes.input.heightLarge};
  padding: 0 48px 0 0;
  border: none;
  border-bottom: 2px solid ${tokens.colors.text.primary};
  font-size: ${tokens.typography.fontSize.bodyLarge};
  background-color: transparent;
  transition: border-color ${duration.fast} ${easing.easeInOut};
  &::placeholder {
    color: ${tokens.colors.text.quaternary};
  }
  &:focus {
    outline: none;
    border-bottom-color: ${tokens.colors.brand.primary};
  }
`;

export const SearchIcon = styled.button`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

/* === 퀵액션 === */
export const QuickActions = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60px;
  padding: ${tokens.spacing[5]} ${tokens.spacing[6]} ${tokens.spacing[6]};
  background-color: ${tokens.colors.background.primary};
  border-bottom: 1px solid ${tokens.colors.border.light};
`;

export const QuickActionItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${tokens.spacing[2]};
  background: none;
  border: none;
  cursor: pointer;
  padding: ${tokens.spacing[2]} ${tokens.spacing[3]};
  border-radius: ${tokens.borderRadius.large};
  transition: all ${duration.fast} ${easing.easeInOut};
  &:hover {
    background-color: ${tokens.colors.action.hover};
  }
  &:active {
    transform: scale(0.96);
    background-color: ${tokens.colors.action.pressed};
  }
`;

export const QuickActionIcon = styled.div`
  width: 40px;
  height: 40px;
  background-color: ${tokens.colors.background.surfaceVariant};
  border-radius: ${tokens.borderRadius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${tokens.colors.text.tertiary};
  border: 1px solid ${tokens.colors.border.light};
  transition: all ${duration.fast} ${easing.easeInOut};
  svg {
    width: ${tokens.sizes.icon.medium};
    height: ${tokens.sizes.icon.medium};
  }
  ${QuickActionItem}:hover & {
    background-color: ${tokens.colors.background.surfaceDark};
    border-color: ${tokens.colors.border.secondary};
  }
`;

export const QuickActionText = styled.span`
  font-size: ${tokens.typography.fontSize.bodySmall};
  color: ${tokens.colors.text.primary};
  font-weight: ${tokens.typography.fontWeight.medium};
  text-align: center;
  line-height: ${tokens.typography.lineHeight.label};
  letter-spacing: ${tokens.typography.letterSpacing.tight};
`;

/* === 메뉴 === */
export const CategorySidebar = styled.div`
  width: 160px;
  background-color: ${tokens.colors.background.tertiary};
  overflow-y: auto;
  flex-shrink: 0;
`;

export const CategoryItem = styled.button<{ $active: boolean }>`
  width: 100%;
  padding: ${tokens.spacing[4]} ${tokens.spacing[5]};
  border: none;
  background: ${props => props.$active ? tokens.colors.background.primary : 'transparent'};
  color: ${tokens.colors.text.primary};
  font-size: ${tokens.typography.fontSize.bodySmall};
  font-weight: ${props => props.$active ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.regular};
  cursor: pointer;
  text-align: left;
  border-right: ${props => props.$active ? `3px solid ${tokens.colors.text.link}` : 'none'};
  transition: all ${duration.fast} ${easing.easeInOut};
  &:hover {
    background-color: ${tokens.colors.background.primary};
  }
  &:active {
    background-color: ${tokens.colors.background.surfaceVariant};
  }
`;

export const MenuDetailSection = styled.div`
  flex: 1;
  background-color: ${tokens.colors.background.primary};
  overflow-y: auto;
  padding: ${tokens.spacing[4]} 0;
`;

export const MenuSectionTitle = styled.h3<{ $highlighted?: boolean }>`
  font-size: ${tokens.typography.fontSize.titleSmall};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${props => props.$highlighted ? tokens.colors.text.link : tokens.colors.text.primary};
  margin: 0 0 ${tokens.spacing[3]} 0;
  padding: 0 ${tokens.spacing[5]};
  position: relative;
  line-height: ${tokens.typography.lineHeight.title};
  ${props => props.$highlighted && `
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background-color: ${tokens.colors.text.link};
    }
  `}
`;

export const MenuItemList = styled.div`
  margin-bottom: 24px;
`;

export const MenuItem = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: ${tokens.spacing[2]} ${tokens.spacing[5]};
  border: none;
  background: none;
  font-size: ${tokens.typography.fontSize.bodySmall};
  color: ${tokens.colors.text.primary};
  cursor: pointer;
  text-align: left;
  transition: all ${duration.fast} ${easing.easeInOut};
  &:hover {
    background-color: ${tokens.colors.background.surfaceVariant};
  }
  &:active {
    background-color: ${tokens.colors.background.surfaceDark};
  }
`;

export const DisabledText = styled.div`
  padding: ${tokens.spacing[3]} ${tokens.spacing[5]};
  font-size: ${tokens.typography.fontSize.bodySmall};
  color: ${tokens.colors.text.quaternary};
  text-align: left;
`;

export const SettingButton = styled.button`
  background-color: ${tokens.colors.background.surfaceVariant};
  border: 1px solid ${tokens.colors.border.light};
  border-radius: ${tokens.borderRadius.xl};
  padding: ${tokens.spacing[1]} ${tokens.spacing[2]};
  font-size: ${tokens.typography.fontSize.labelMedium};
  color: ${tokens.colors.text.tertiary};
  cursor: pointer;
  font-weight: ${tokens.typography.fontWeight.medium};
  transition: all ${duration.fast} ${easing.easeInOut};
  &:hover {
    background-color: ${tokens.colors.background.surfaceDark};
    border-color: ${tokens.colors.border.secondary};
  }
  &:active {
    background-color: ${tokens.colors.border.secondary};
    transform: scale(0.98);
  }
`;