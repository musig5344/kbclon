import React from 'react';

import {
  MenuHeader,
  LoginButton,
  UserInfo,
  UserAvatar,
  UserDetails,
  UserNameContainer,
  UserName,
  UserGrade,
  LogoutButton,
  HeaderRight,
  LanguageButton,
  CloseButton
} from '../styles/KBMenuStyles';

interface User {
  name: string;
  grade: string;
}

interface MenuHeaderProps {
  isLoggedIn: boolean;
  user: User | null;
  onLogout: () => void;
  onClose: () => void;
}

export const MenuHeaderComponent: React.FC<MenuHeaderProps> = ({
  isLoggedIn,
  user,
  onLogout,
  onClose
}) => {
  return (
    <MenuHeader>
      {isLoggedIn && user ? (
        <UserInfo>
          <UserAvatar>F</UserAvatar>
          <UserDetails>
            <UserNameContainer>
              <UserName>{user.name}님</UserName>
              <UserGrade>{user.grade}</UserGrade>
            </UserNameContainer>
            <LogoutButton onClick={onLogout}>로그아웃</LogoutButton>
          </UserDetails>
        </UserInfo>
      ) : (
        <LoginButton onClick={() => window.location.href = '/'}>로그인</LoginButton>
      )}
      <HeaderRight>
        <LanguageButton>Language</LanguageButton>
        <CloseButton onClick={onClose}>×</CloseButton>
      </HeaderRight>
    </MenuHeader>
  );
};