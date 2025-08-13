import React from 'react';

import styled from 'styled-components';

import { MenuIcon } from '../../../assets/icons/CommonIcons';
import { Typography } from '../../../components/design-system';
import { useAuth } from '../../../core/auth/AuthContext';
// import { useUserStore } from '../../../stores/userStore'; // Removed - using AuthContext
import { smoothTransition } from '../../../styles/animations';
import { tokens } from '../../../styles/tokens';
const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${tokens.spacing[2]} ${tokens.sizes.page.paddingHorizontal};
  height: ${tokens.sizes.header.height};
  background-color: ${tokens.colors.background.primary};
  border-bottom: 1px solid ${tokens.colors.border.light};
  box-shadow: ${tokens.shadows.elevation1};
`;
const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[3]};
`;
const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[1]};
`;
const FamilyLogo = styled.div`
  width: ${tokens.sizes.avatar.medium};
  height: ${tokens.sizes.avatar.medium};
  background: linear-gradient(135deg, ${tokens.colors.success.base} 0%, ${tokens.colors.success.dark} 100%);
  border-radius: ${tokens.borderRadius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${tokens.colors.background.primary};
  font-weight: ${tokens.typography.fontWeight.bold};
  font-size: ${tokens.typography.fontSize.bodyLarge};
  box-shadow: 0 2px 4px rgba(34, 197, 94, 0.2);
`;
const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[0]};
`;
const UserName = styled(Typography).attrs({
  variant: 'titleSmall',
  weight: 'semibold',
  color: 'primary'
})`
  line-height: 1.2;
`;
const UserTitle = styled(Typography).attrs({
  variant: 'labelMedium',
  color: 'secondary'
})`
  line-height: 1.2;
`;
const IconButton = styled.button`
  background: none;
  border: none;
  padding: ${tokens.spacing[2]};
  cursor: pointer;
  width: ${tokens.sizes.touch.minimum};
  height: ${tokens.sizes.touch.minimum};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${tokens.borderRadius.round};
  ${smoothTransition};
  position: relative;
  &:hover {
    background-color: ${tokens.colors.action.hover};
  }
  &:active {
    background-color: ${tokens.colors.action.pressed};
  }
`;
interface DashboardHeaderProps {
  onMenuClick?: () => void;
  userName?: string;
}
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick, userName: propUserName }) => {
  const { user: authUser } = useAuth();
  // AuthContext의 User를 우선 사용 (name 속성이 있음)
  let userName = '사용자';
  if (propUserName) {
    userName = propUserName;
  } else if (authUser?.name) {
    userName = authUser.name;
  } else if (authUser?.email) {
    userName = authUser.email.split('@')[0];
  }
  return (
    <HeaderContainer>
      <LeftSection>
        <FamilyLogo>F</FamilyLogo>
        <UserInfo>
          <UserName>{userName}님</UserName>
          <UserTitle>패밀리</UserTitle>
        </UserInfo>
      </LeftSection>
      <RightSection>
        <IconButton 
          aria-label="전체메뉴" 
          onClick={onMenuClick}
        >
          <MenuIcon size={24} color={tokens.colors.text.secondary} />
        </IconButton>
      </RightSection>
    </HeaderContainer>
  );
};