import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { LoginHeader } from '../../shared/components/layout/LoginHeader';
import Button from '../../shared/components/ui/Button';
import Input from '../../shared/components/ui/Input';
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
const ResultContainer = styled.div`
  background-color: ${tokens.colors.white};
  border: 1px solid ${tokens.colors.border.primary};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;
`;
const ResultTitle = styled.h3`
  font-family: 'KBFGText', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: ${tokens.colors.text.primary};
  margin-bottom: 16px;
`;
const ResultEmail = styled.p`
  font-family: 'KBFGText', sans-serif;
  font-size: 16px;
  color: ${tokens.colors.brand.primary};
  font-weight: 600;
  margin-bottom: 8px;
`;
const ResultDate = styled.p`
  font-size: 14px;
  color: ${tokens.colors.text.secondary};
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
const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;
const SecondaryButton = styled(Button)`
  background-color: ${tokens.colors.white};
  color: ${tokens.colors.text.primary};
  border: 1px solid ${tokens.colors.border.primary};
  &:hover {
    background-color: ${tokens.colors.lightGray};
  }
`;
const FindIdPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundEmail, setFoundEmail] = useState('');
  const [showResult, setShowResult] = useState(false);
  const handleFindId = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // 유효성 검사
    if (!name || !phone) {
      setError('이름과 휴대폰 번호를 모두 입력해주세요.');
      setLoading(false);
      return;
    }
    if (phone.length < 10) {
      setError('올바른 휴대폰 번호를 입력해주세요.');
      setLoading(false);
      return;
    }
    try {
      // 실제로는 API 호출을 해야 하지만, 데모용으로 가상의 결과를 표시
      await new Promise(resolve => setTimeout(resolve, 1500));
      // 데모용 이메일 표시 (실제로는 Supabase에서 찾아야 함)
      const maskedEmail = `test***@example.com`;
      setFoundEmail(maskedEmail);
      setShowResult(true);
    } catch (err) {
      setError('등록된 정보를 찾을 수 없습니다. 입력정보를 다시 확인해주세요.');
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
  const goToPasswordReset = () => {
    navigate('/reset-password');
  };
  return (
    <Container>
      <LoginHeader showCloseButton={true} onCloseClick={handleClose} />
      <Content>
        <Title>아이디 찾기</Title>
        <Subtitle>
          회원가입 시 등록한 정보를 입력하여
          <br />
          아이디를 찾으실 수 있습니다.
        </Subtitle>
        {!showResult ? (
          <>
            <Form onSubmit={handleFindId}>
              <Input
                fullWidth
                placeholder='이름'
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <Input
                fullWidth
                type='tel'
                placeholder='휴대폰 번호 (01012345678)'
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </Form>
            <InfoText>
              • 회원가입 시 등록한 이름과 휴대폰 번호를 정확히 입력해주세요.{'\n'}• 개인정보 보호를
              위해 아이디의 일부만 표시됩니다.{'\n'}• 문의사항이 있으시면 고객센터(1588-9999)로
              연락해주세요.
            </InfoText>
            <ErrorText>{error}</ErrorText>
            <Spacer />
            <Button fullWidth onClick={handleFindId} disabled={loading || !name || !phone}>
              {loading ? '아이디 찾는 중...' : '아이디 찾기'}
            </Button>
          </>
        ) : (
          <>
            <ResultContainer>
              <ResultTitle>아이디 찾기 결과</ResultTitle>
              <ResultEmail>{foundEmail}</ResultEmail>
              <ResultDate>가입일: 2024.01.15</ResultDate>
            </ResultContainer>
            <Spacer />
            <ActionButtons>
              <SecondaryButton fullWidth onClick={goToPasswordReset}>
                비밀번호 재설정
              </SecondaryButton>
              <Button fullWidth onClick={goToLogin}>
                로그인하기
              </Button>
            </ActionButtons>
          </>
        )}
      </Content>
    </Container>
  );
};
export default FindIdPage;
