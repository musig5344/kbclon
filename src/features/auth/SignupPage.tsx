import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { useAuth } from '../../core/auth/AuthContext';
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
const PasswordHint = styled.p`
  font-size: 12px;
  color: ${tokens.colors.text.tertiary};
  margin-top: -8px;
  line-height: 1.4;
`;
const ErrorText = styled.p`
  color: ${tokens.colors.error};
  font-size: 14px;
  text-align: center;
  margin-top: 16px;
  height: 20px;
`;
const SuccessText = styled.p`
  color: ${tokens.colors.success || '#28a745'};
  font-size: 14px;
  text-align: center;
  margin-top: 16px;
  height: 20px;
`;
const Spacer = styled.div`
  flex-grow: 1;
`;
const TermsContainer = styled.div`
  margin-bottom: 24px;
`;
const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;
const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
`;
const StyledCheckbox = styled.div<{ checked: boolean }>`
  display: inline-block;
  width: 20px;
  height: 20px;
  background: ${props => (props.checked ? tokens.colors.brand.primary : colors.lightGray)};
  border: 1px solid ${props => (props.checked ? tokens.colors.brand.primary : colors.border)};
  border-radius: 4px;
  transition: all 150ms;
  svg {
    visibility: ${props => (props.checked ? 'visible' : 'hidden')};
  }
`;
const CheckboxLabel = styled.label`
  font-size: 14px;
  color: ${tokens.colors.text.secondary};
  cursor: pointer;
`;
const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    // 유효성 검사
    if (!email || !password || !confirmPassword || !name || !phone) {
      setError('모든 필드를 입력해주세요.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      setLoading(false);
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError('약관에 동의해주세요.');
      setLoading(false);
      return;
    }
    const result = await signup(email, password, name, phone);
    if (result.success) {
      setSuccess('회원가입이 완료되었습니다! 이메일을 확인하여 계정을 활성화해주세요.');
      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/login/id');
      }, 3000);
    } else {
      setError(result.error || '회원가입 중 오류가 발생했습니다.');
    }
    setLoading(false);
  };
  const handleClose = () => {
    navigate(-1);
  };
  return (
    <Container>
      <LoginHeader showCloseButton={true} onClose={handleClose} />
      <Content>
        <Title>KB국민은행 회원가입</Title>
        <Subtitle>
          KB스타뱅킹 서비스 이용을 위한
          <br />
          회원가입을 진행해주세요.
        </Subtitle>
        <Form onSubmit={handleSignup}>
          <Input
            fullWidth
            placeholder='이름'
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Input
            fullWidth
            type='email'
            placeholder='이메일 주소'
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Input
            fullWidth
            type='tel'
            placeholder='휴대폰 번호 (01012345678)'
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <Input
            fullWidth
            type='password'
            placeholder='비밀번호'
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <PasswordHint>* 8자 이상, 영문/숫자/특수문자 조합을 권장합니다.</PasswordHint>
          <Input
            fullWidth
            type='password'
            placeholder='비밀번호 확인'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </Form>
        <TermsContainer>
          <CheckboxContainer>
            <label>
              <HiddenCheckbox checked={agreeTerms} onChange={() => setAgreeTerms(!agreeTerms)} />
              <StyledCheckbox checked={agreeTerms}>
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                  width='16'
                  height='16'
                  style={{ margin: '2px' }}
                >
                  <polyline
                    points='20 6 9 17 4 12'
                    stroke={colors.white}
                    strokeWidth='3'
                    fill='none'
                  />
                </svg>
              </StyledCheckbox>
            </label>
            <CheckboxLabel>이용약관 동의 (필수)</CheckboxLabel>
          </CheckboxContainer>
          <CheckboxContainer>
            <label>
              <HiddenCheckbox
                checked={agreePrivacy}
                onChange={() => setAgreePrivacy(!agreePrivacy)}
              />
              <StyledCheckbox checked={agreePrivacy}>
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                  width='16'
                  height='16'
                  style={{ margin: '2px' }}
                >
                  <polyline
                    points='20 6 9 17 4 12'
                    stroke={colors.white}
                    strokeWidth='3'
                    fill='none'
                  />
                </svg>
              </StyledCheckbox>
            </label>
            <CheckboxLabel>개인정보처리방침 동의 (필수)</CheckboxLabel>
          </CheckboxContainer>
        </TermsContainer>
        {error && <ErrorText>{error}</ErrorText>}
        {success && <SuccessText>{success}</SuccessText>}
        <Spacer />
        <Button
          fullWidth
          onClick={handleSignup}
          disabled={loading || !email || !password || !confirmPassword || !name || !phone}
        >
          {loading ? '가입 처리중...' : '회원가입'}
        </Button>
      </Content>
    </Container>
  );
};
export default SignupPage;
