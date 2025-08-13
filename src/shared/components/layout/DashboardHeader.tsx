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
  background: linear-gradient(
    135deg,
    ${tokens.colors.success.base} 0%,
    ${tokens.colors.success.dark} 100%
  );
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
  color: 'primary',
})`
  line-height: 1.2;
`;
const UserTitle = styled(Typography).attrs({
  variant: 'labelMedium',
  color: 'secondary',
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
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onMenuClick,
  userName: propUserName,
}) => {
  const { user: authUser } = useAuth();
  // AuthContext의 User를 우선 사용 (name 속성이 있음)
  let userName = '이경희';
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
        <IconButton aria-label='알림'>
          <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
            <path
              d='M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z'
              fill={tokens.colors.text.secondary}
            />
          </svg>
        </IconButton>
        <IconButton aria-label='검색'>
          <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
            <path
              d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'
              fill={tokens.colors.text.secondary}
            />
          </svg>
        </IconButton>
        <IconButton aria-label='전체메뉴' onClick={onMenuClick}>
          <MenuIcon size={24} color={tokens.colors.text.secondary} />
        </IconButton>
      </RightSection>
    </HeaderContainer>
  );
};
