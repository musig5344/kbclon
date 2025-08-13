import React from 'react';

import styled from 'styled-components';

import { PageContainer, PageContent } from '../shared/components/layout/MobileContainer';
import TabBar from '../shared/components/layout/TabBar';
import { colors } from '../styles/tokens';
const ShopPageContainer = styled(PageContainer)`
  background-color: ${colors.background.tertiary};
`;
const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  height: 48px;
  background-color: ${colors.background.primary};
  border-bottom: 1px solid ${colors.border.primary};
`;
const HeaderTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.text.primary};
  margin: 0;
`;
const MainContent = styled(PageContent)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;
const ComingSoonText = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${colors.text.secondary};
  margin-bottom: 16px;
`;
const DescriptionText = styled.div`
  font-size: 16px;
  color: ${colors.text.tertiary};
  text-align: center;
  line-height: 1.5;
`;
const ShopPage: React.FC = () => {
  return (
    <ShopPageContainer>
      <Header>
        <HeaderTitle>상점</HeaderTitle>
      </Header>
      <MainContent>
        <ComingSoonText>🏪 상점 준비중</ComingSoonText>
        <DescriptionText>
          KB 상점 서비스가<br/>
          곧 오픈 예정입니다
        </DescriptionText>
      </MainContent>
      <TabBar />
    </ShopPageContainer>
  );
};
export default ShopPage;