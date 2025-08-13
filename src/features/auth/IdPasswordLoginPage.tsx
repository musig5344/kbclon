import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { Typography } from '../../components/design-system';
import { useAuth } from '../../core/auth/AuthContext';
import { LoginHeader } from '../../shared/components/layout/LoginHeader';
// import { AuthDebugger } from './components/AuthDebugger'; // Temporarily disabled
import { tokens } from '../../styles/tokens';
const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${tokens.colors.text.quaternary}; /* 원본 스크린샷과 동일한 회색 배경 */
`;
const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 ${tokens.spacing[6]};
  position: relative;
`;
const CenterTitle = styled(Typography).attrs({
  variant: 'headlineMedium',
  weight: 'bold',
  align: 'center'
})`
  color: ${tokens.colors.text.black};
  margin-bottom: ${tokens.spacing[5]};
`;
const CenterSubtitle = styled(Typography).attrs({
  variant: 'bodyLarge',
  align: 'center'
})`
  color: ${tokens.colors.text.primary};
  line-height: ${tokens.typography.lineHeight.comfortable};
  margin-bottom: 80px;
`;
const BottomSheet = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${tokens.colors.background.primary};
  border-radius: ${tokens.borderRadius.xxl} ${tokens.borderRadius.xxl} 0 0;
  padding: 0;
  min-height: 400px;
  box-shadow: ${tokens.shadows.elevation4};
`;
const SlideBar = styled.div`
  width: 40px;
  height: 4px;
  background-color: ${tokens.colors.border.tertiary};
  border-radius: ${tokens.borderRadius.small};
  margin: ${tokens.spacing[4]} auto ${tokens.spacing[6]} auto;
`;
const TabContainer = styled.div`
  display: flex;
  margin: 0 ${tokens.spacing[6]} ${tokens.spacing[8]} ${tokens.spacing[6]};
  border-radius: ${tokens.borderRadius.large};
  background-color: #E8E8E8;
  padding: 4px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
`;
const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background-color: ${props => props.$active ? '#FFFFFF' : 'transparent'};
  color: ${props => props.$active ? '#1A1A1A' : '#666666'};
  font-family: 'KBFGText', sans-serif;
  font-size: 16px;
  font-weight: ${props => props.$active ? '700' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.$active ? '0 2px 8px rgba(0, 0, 0, 0.12)' : 'none'};
  position: relative;
  &:hover {
    color: ${props => props.$active ? '#1A1A1A' : '#333333'};
    background-color: ${props => props.$active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'};
  }
  &:active {
    transform: scale(0.98);
  }
`;
const FormContent = styled.div`
  padding: 0 ${tokens.spacing[6]};
  flex: 1;
`;
const InputContainer = styled.div`
  margin-bottom: 24px;
`;
const InputLabel = styled.label`
  display: block;
  font-family: 'KBFGText', sans-serif;
  font-size: 16px;
  color: #1A1A1A;
  margin-bottom: 8px;
  font-weight: 600;
  letter-spacing: -0.3px;
`;
const UnderlineInput = styled.input`
  width: 100%;
  border: none;
  border-bottom: 2px solid #D0D0D0;
  padding: 12px 0;
  font-family: 'KBFGText', sans-serif;
  font-size: 16px;
  color: #1A1A1A;
  background: transparent;
  outline: none;
  font-weight: 500;
  transition: border-color 0.2s ease;
  &:focus {
    border-bottom-color: #FFD338;
  }
  &::placeholder {
    color: #999999;
    font-weight: 400;
  }
`;
const BottomLinks = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin: 40px 0 24px 0;
`;
const LinkText = styled.button`
  background: none;
  border: none;
  font-family: 'KBFGText', sans-serif;
  font-size: 14px;
  color: #666666;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
    color: #333333;
  }
`;
const Divider = styled.div`
  width: 1px;
  height: 12px;
  background-color: #999999;
`;
const LoginButton = styled.button<{ disabled: boolean }>`
  width: calc(100% - 48px);
  height: 56px;
  background-color: #FFD338; /* 원본 KB 옷로우 */
  color: #1A1A1A; /* 원본 버튼 텍스트 */
  border: none;
  border-radius: 0;
  font-family: 'KBFGText', sans-serif;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  position: absolute;
  bottom: 0;
  left: 24px;
  right: 24px;
  margin: 0;
  &:hover {
    background-color: #FFBC00;
  }
  &:disabled {
    background-color: #E0E0E0; /* 비활성화 배경 */
    color: #999999; /* 비활성화 텍스트 */
    cursor: not-allowed;
  }
`;
const IdPasswordLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('아이디');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      // AuthContext의 login 함수만 사용
      const result = await login(loginId, password);
      if (result.success) {
        // 상태 업데이트를 위한 짧은 대기
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 200);
      } else {
        alert(result.error || '로그인에 실패했습니다.');
        setLoading(false);
      }
    } catch (err) {
      alert('로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };
  return (
    <Container>
      <LoginHeader 
        showCloseButton={false}
        onSearchClick={() => {}}
        onMenuClick={() => {}}
      />
      <MainContent>
        <CenterTitle>KB국민인증서</CenterTitle>
        <CenterSubtitle>
          금융에서 생활까지 모든 인증을 하나로<br />
          지문, 패턴으로 로그인
        </CenterSubtitle>
        <BottomSheet>
          <SlideBar />
          <TabContainer>
            <Tab 
              $active={activeTab === '공동인증서'} 
              onClick={() => setActiveTab('공동인증서')}
            >
              공동인증서
            </Tab>
            <Tab 
              $active={activeTab === '금융인증서'} 
              onClick={() => setActiveTab('금융인증서')}
            >
              금융인증서
            </Tab>
            <Tab 
              $active={activeTab === '아이디'} 
              onClick={() => setActiveTab('아이디')}
            >
              아이디
            </Tab>
          </TabContainer>
          <FormContent>
            <form onSubmit={handleLogin}>
              <InputContainer>
                <InputLabel>아이디 (이메일)</InputLabel>
                <UnderlineInput
                  type="email"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="아이디 입력"
                  autoComplete="email"
                  disabled={loading}
                />
              </InputContainer>
              <InputContainer>
                <InputLabel>사용자 암호</InputLabel>
                <UnderlineInput
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </InputContainer>
            </form>
            <BottomLinks>
              <LinkText>인증센터</LinkText>
              <Divider />
              <LinkText>아이디조회/암호 설정</LinkText>
            </BottomLinks>
          </FormContent>
          <LoginButton 
            disabled={loading || !loginId || !password}
            onClick={handleLogin}
          >
            {loading ? '로그인 중...' : '로그인'}
          </LoginButton>
        </BottomSheet>
      </MainContent>
    </Container>
  );
};
export default IdPasswordLoginPage;