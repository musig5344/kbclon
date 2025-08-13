import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { LoginHeader } from '../../shared/components/layout/LoginHeader';
import Button from '../../shared/components/ui/Button';
import Input from '../../shared/components/ui/Input';
import { colors } from '../../styles/colors';
import { tokens } from '../../styles/tokens';
const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${tokens.colors.background.primary};
`;
const Content = styled.div`
  flex: 1;
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
`;
const Title = styled.h1`
  font-family: 'KBFGText', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: ${tokens.colors.text.primary};
  margin-bottom: 16px;
`;
const Subtitle = styled.p`
  font-family: 'KBFGText', sans-serif;
  font-size: 16px;
  color: ${tokens.colors.text.secondary};
  margin-bottom: 32px;
  line-height: 1.5;
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`;
const InfoText = styled.p`
  font-size: 14px;
  color: ${tokens.colors.text.tertiary};
  line-height: 1.4;
  background-color: ${tokens.colors.lightGray};
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
`;
const SuccessContainer = styled.div`
  background-color: ${tokens.colors.white};
  border: 1px solid ${tokens.colors.success || '#28a745'};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;
`;
const SuccessIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${tokens.colors.success || '#28a745'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  svg {
    width: 30px;
    height: 30px;
    color: white;
  }
`;
const SuccessTitle = styled.h3`
  font-family: 'KBFGText', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: ${tokens.colors.text.primary};
  margin-bottom: 16px;
`;
const SuccessText = styled.p`
  font-size: 14px;
  color: ${tokens.colors.text.secondary};
  line-height: 1.5;
`;
const ErrorText = styled.p`
  color: ${tokens.colors.error};
  font-size: 14px;
  text-align: center;
  margin-top: 16px;
  height: 20px;
`;
const Spacer = styled.div`
  flex-grow: 1;
`;
const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 32px;
`;
const Step = styled.div<{ active: boolean; completed: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  ${props => props.completed ? `
    background-color: ${tokens.colors.success || '#28a745'};
    color: white;
  ` : props.active ? `
    background-color: ${tokens.colors.brand.primary};
    color: ${tokens.colors.kbBlack};
  ` : `
    background-color: ${tokens.colors.lightGray};
    color: ${tokens.colors.text.secondary};
  `}
`;
const StepLine = styled.div<{ completed: boolean }>`
  width: 40px;
  height: 2px;
  background-color: ${props => props.completed ? colors.success || '#28a745' : colors.lightGray};
`;
const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // 유효성 검사
    if (!email) {
      setError('이메일을 입력해주세요.');
      setLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 주소를 입력해주세요.');
      setLoading(false);
      return;
    }
    try {
      // 실제로는 Supabase의 resetPasswordForEmail을 사용해야 함
      await new Promise(resolve => setTimeout(resolve, 2000));
      setEmailSent(true);
    } catch (err) {
      setError('비밀번호 재설정 링크 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    navigate(-1);
  };
  const goToLogin = () => {
    navigate('/login/id');
  };
  return (
    <Container>
      <LoginHeader showCloseButton={true} onCloseClick={handleClose}/>
      <Content>
        <Title>비밀번호 재설정</Title>
        <Subtitle>
          등록된 이메일 주소로<br />
          비밀번호 재설정 링크를 보내드립니다.
        </Subtitle>
        <StepIndicator>
          <Step active={!emailSent} completed={emailSent}>1</Step>
          <StepLine completed={emailSent} />
          <Step active={emailSent} completed={false}>2</Step>
        </StepIndicator>
        {!emailSent ? (
          <>
            <Form onSubmit={handleResetPassword}>
              <Input 
                fullWidth 
                type="email"
                placeholder="이메일 주소" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form>
            <InfoText>
              • 회원가입 시 등록한 이메일 주소를 입력해주세요.{'\n'}
              • 입력하신 이메일로 비밀번호 재설정 링크를 보내드립니다.{'\n'}
              • 이메일이 도착하지 않으면 스팸함을 확인해주세요.{'\n'}
              • 링크는 30분 후 만료됩니다.
            </InfoText>
            <ErrorText>{error}</ErrorText>
            <Spacer />
            <Button fullWidth onClick={handleResetPassword} disabled={loading || !email}>
              {loading ? '링크 전송 중...' : '재설정 링크 보내기'}
            </Button>
          </>
        ) : (
          <>
            <SuccessContainer>
              <SuccessIcon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="m6 12 4.5 4.5L18 9"/>
                </svg>
              </SuccessIcon>
              <SuccessTitle>이메일이 전송되었습니다!</SuccessTitle>
              <SuccessText>
                <strong>{email}</strong><br />
                위 주소로 비밀번호 재설정 링크를 보내드렸습니다.<br />
                이메일의 링크를 클릭하여 새 비밀번호를 설정해주세요.
              </SuccessText>
            </SuccessContainer>
            <InfoText>
              • 이메일이 도착하지 않으면 스팸함을 확인해주세요.{'\n'}
              • 링크는 30분 후 자동으로 만료됩니다.{'\n'}
              • 재설정 후에는 새 비밀번호로 로그인해주세요.
            </InfoText>
            <Spacer />
            <Button fullWidth onClick={goToLogin}>
              로그인 페이지로 이동
            </Button>
          </>
        )}
      </Content>
    </Container>
  );
};
export default ResetPasswordPage;