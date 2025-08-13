import React from 'react';

import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { ToolsIcon } from '../assets/icons/CommonIcons';
import Header from '../shared/components/layout/Header';
import Button from '../shared/components/ui/Button';
import { Title, Body } from '../shared/components/ui/Typography';
const DummyPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;
const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  gap: ${({ theme }) => theme.spacing.lg};
`;
interface DummyPageProps {
  title?: string;
  message?: string;
}
const DummyPage: React.FC<DummyPageProps> = ({ 
  title = "서비스 준비중", 
  message = "이용에 불편을 드려 죄송합니다. 빠른 시일 내에 더 좋은 모습으로 찾아뵙겠습니다." 
}) => {
  const navigate = useNavigate();
  return (
    <DummyPageContainer>
      <Header />
      <MainContent>
        <ToolsIcon size={48} color="#9E9E9E" />
        <Title>{title}</Title>
        <Body>{message}</Body>
        <Button onClick={() => navigate(-1)} style={{ marginTop: '24px' }}>
          이전으로 돌아가기
        </Button>
      </MainContent>
    </DummyPageContainer>
  );
};
export default DummyPage; 