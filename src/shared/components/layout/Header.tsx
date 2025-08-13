import React from 'react';

import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { BellIcon, SettingsIcon } from '../../../assets/icons/CommonIcons';
import kbLogo from '../../../assets/images/kb_logo.png';
import { useAuth } from '../../../core/auth/AuthContext';
const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const LogoImage = styled.img`
  height: 24px;
`;
const IconGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: 20px;
  svg {
    cursor: pointer;
  }
`;
const Header: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };
  return (
    <HeaderContainer>
      <LogoImage src={kbLogo} alt='KB스타뱅킹 로고' />
      <IconGroup>
        <BellIcon style={{ cursor: 'pointer' }} />
        <SettingsIcon onClick={handleSignOut} style={{ cursor: 'pointer' }} />
      </IconGroup>
    </HeaderContainer>
  );
};
export default Header;
