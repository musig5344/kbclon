import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { useAuth } from '../../../../core/auth/AuthContext';
import { useApiLoading } from '../../../../shared/contexts/LoadingContext';
import { 
  androidOptimizedButton, 
  androidOptimizedInput 
} from '../../../../styles/android-webview-optimizations';
// import { tokens } from '../../../../styles/tokens'; // 사용되지 않음
const Container = styled.div`
  padding: 24px 24px 0 24px;
  display: flex;
  flex-direction: column;
  min-height: 280px;
  background-color: #FFFFFF;
`;
const FormContainer = styled.form`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;
// const NoticeText = styled.div`
//   font-family: 'KBFGText', sans-serif;
//   font-size: 14px;
//   color: #666666;
//   margin-bottom: 24px;
//   font-weight: 500;
//   text-align: center;
// `;
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
  ${androidOptimizedInput}
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
  
  /* Android WebView 터치 최적화 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  &:focus {
    border-bottom-color: #FFD338;
  }
  &::placeholder {
    color: #999999;
    font-weight: 400;
  }
`;
const LoginButton = styled.button<{ disabled: boolean }>`
  ${androidOptimizedButton}
  width: 100%;
  height: 48px;
  background-color: #FFD338;
  color: #1A1A1A;
  border: none;
  border-radius: 12px;
  font-family: 'KBFGText', sans-serif;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 3px 10px rgba(255, 211, 56, 0.4);
  letter-spacing: -0.3px;
  margin-top: 32px;
  
  /* Android WebView 터치 최적화 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  &:hover {
    background-color: #FFCC00;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 211, 56, 0.5);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(255, 211, 56, 0.3);
  }
  &:disabled {
    background-color: #E0E0E0;
    color: #999999;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;
const BottomLinks = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin: 24px 0 16px 0;
`;
const LinkText = styled.button`
  ${androidOptimizedButton}
  background: none;
  border: none;
  font-family: 'KBFGText', sans-serif;
  font-size: 14px;
  color: #666666;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
  
  /* Android WebView 터치 최적화 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;
  padding: 8px 12px;
  
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
export const IDLoginTab: React.FC = () => {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { startApiCall, stopApiCall, isApiLoading } = useApiLoading('login');
  const loading = isApiLoading();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    
    try {
      startApiCall();
      const result = await login(loginId, password);
      if (result.success) {
        // 로그인 성공 시 자연스러운 전환을 위해 약간의 지연
        setTimeout(() => {
          stopApiCall();
          navigate('/dashboard', { replace: true });
        }, 800);
      } else {
        stopApiCall();
        alert(result.error || '로그인에 실패했습니다.');
      }
    } catch (err) {
      stopApiCall();
      alert('로그인 중 오류가 발생했습니다.');
    }
  };
  const handleLinkClick = (_type: string) => {
    alert('준비중입니다.');
  };
  return (
    <Container>
      <FormContainer onSubmit={handleLogin}>
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
        <LoginButton 
          type="submit"
          disabled={loading || !loginId || !password}
        >
          {loading ? '로그인 중...' : '로그인'}
        </LoginButton>
      </FormContainer>
      <BottomLinks>
        <LinkText onClick={() => handleLinkClick('auth-center')}>
          인증센터
        </LinkText>
        <Divider />
        <LinkText onClick={() => handleLinkClick('find-account')}>
          아이디조회/암호 설정
        </LinkText>
      </BottomLinks>
    </Container>
  );
};