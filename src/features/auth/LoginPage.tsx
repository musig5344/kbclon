import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import kbLogo from '../../assets/images/kb_logo.png';
import { useAuth } from '../../core/auth/AuthContext';
import Button from '../../shared/components/ui/Button';
import Input from '../../shared/components/ui/Input';
const LoginPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.white};
`;
const Header = styled.header`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;
const LogoImage = styled.img`
  height: 40px;
`;
const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 320px;
`;
const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.md};
`;
const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.body1};
`;
const Footer = styled.footer`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.lg};
`;
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login(email, password);
    if (result.success) {
      // 성공 시 useEffect가 대시보드로 리다이렉트
    } else {
      setError(result.error || '로그인에 실패했습니다.');
    }
    setLoading(false);
  };
  return (
    <LoginPageContainer>
      <Header>
        <LogoImage src={kbLogo} alt='KB스타뱅킹 로고' />
      </Header>
      <LoginForm onSubmit={handleSubmit}>
        <Input
          type='email'
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder='이메일 주소'
          fullWidth
          disabled={loading}
        />
        <Input
          type='password'
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder='비밀번호'
          fullWidth
          disabled={loading}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type='submit' fullWidth style={{ marginTop: '16px' }} disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </Button>
        <ButtonGroup>
          <Button variant='text' size='small'>
            아이디 찾기
          </Button>
          <Button variant='text' size='small'>
            비밀번호 재설정
          </Button>
          <Button variant='text' size='small'>
            회원가입
          </Button>
        </ButtonGroup>
      </LoginForm>
      <Footer>
        <Button variant='secondary' style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src='/assets/images/icons/login_finance_cert_icon.png'
            alt='금융인증서'
            style={{ height: '20px', width: 'auto' }}
          />
          <span>금융인증서 로그인</span>
        </Button>
      </Footer>
    </LoginPageContainer>
  );
};
export default LoginPage;
