import React from 'react';

import { Link } from 'react-router-dom';

import styled from 'styled-components';

import { tokens } from '../../../styles/tokens';
const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  height: 48px;
  background-color: ${tokens.colors.white};
  border-bottom: 1px solid #ebeef0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;
const HeaderButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #26282c;
  &:active {
    background-color: rgba(0, 0, 0, 0.1);
  }
  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
`;
const HeaderButtonLink = styled(Link)`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #26282c;
  text-decoration: none;
  &:active {
    background-color: rgba(0, 0, 0, 0.1);
  }
  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
`;
const HeaderTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #26282c;
  margin: 0;
  flex: 1;
  text-align: center;
`;
const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 48px;
`;
const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 48px;
  justify-content: flex-end;
`;
interface HeaderButtonProps {
  onClick?: () => void;
  to?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}
const HeaderButtonComponent: React.FC<HeaderButtonProps> = ({ onClick, to, icon, children }) => {
  if (to) {
    return (
      <HeaderButtonLink to={to}>
        {icon}
        {children}
      </HeaderButtonLink>
    );
  }
  return (
    <HeaderButton onClick={onClick}>
      {icon}
      {children}
    </HeaderButton>
  );
};
interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  backTo?: string;
  leftActions?: Array<HeaderButtonProps>;
  rightActions?: Array<HeaderButtonProps>;
  showBackButton?: boolean;
}
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  onBack,
  backTo,
  leftActions = [],
  rightActions = [],
  showBackButton = true,
}) => {
  return (
    <Header>
      <HeaderLeft>
        {showBackButton && (
          <HeaderButtonComponent
            onClick={onBack}
            to={backTo}
            icon={<span style={{ fontSize: '18px', transform: 'rotate(180deg)' }}>→</span>}
          />
        )}
        {leftActions.map((action, index) => (
          <HeaderButtonComponent key={index} {...action} />
        ))}
      </HeaderLeft>
      <HeaderTitle>{title}</HeaderTitle>
      <HeaderRight>
        {rightActions.map((action, index) => (
          <HeaderButtonComponent key={index} {...action} />
        ))}
      </HeaderRight>
    </Header>
  );
};
// Export individual components for custom use
export { Header, HeaderButton, HeaderButtonLink, HeaderTitle, HeaderLeft, HeaderRight };
export default PageHeader;
