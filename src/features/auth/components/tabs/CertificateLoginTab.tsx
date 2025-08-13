import React from 'react';

import styled from 'styled-components';

// import { tokens } from '../../../../styles/tokens'; // 사용되지 않음
import CertIcon from '../../../../assets/images/icons/login_cert_icon.png';
import { colors } from '../../../../styles/colors';
// KB 스타뱅킹 원본 공동인증서 아이콘 
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px;
  text-align: center;
  min-height: 280px;
  background-color: #FFFFFF;
`;
const InfoContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
`;
const InfoIcon = styled.img`
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  object-fit: contain;
  opacity: 1;
  filter: brightness(0.9) contrast(1.3) saturate(1.2);
`;
const InfoTitle = styled.h4`
  font-family: 'KBFGText', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 12px;
  letter-spacing: -0.3px;
`;
const InfoText = styled.p`
  font-family: 'KBFGText', sans-serif;
  font-size: 15px;
  color: #666666;
  line-height: 1.5;
  font-weight: 500;
`;
const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
  max-width: 280px;
`;
const FullWidthButton = styled.button`
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
  &:hover {
    background-color: #FFCC00;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 211, 56, 0.5);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(255, 211, 56, 0.3);
  }
`;
const LinkText = styled.button`
  background: none;
  border: none;
  font-family: 'KBFGText', sans-serif;
  font-size: 14px;
  color: #666666;
  text-decoration: underline;
  cursor: pointer;
  padding: 8px;
  font-weight: 500;
  &:hover {
    color: #333333;
  }
`;
export const CertificateLoginTab: React.FC = () => {
  return (
    <Container>
      <InfoContainer>
        <InfoIcon src={CertIcon} alt="인증서 아이콘" />
        <InfoTitle>등록된 인증서가 없습니다.</InfoTitle>
        <InfoText>
          PC나 다른 기기에 있는 인증서를<br />
          가져오시겠어요?
        </InfoText>
      </InfoContainer>
      <ButtonContainer>
        <FullWidthButton onClick={() => alert('공동인증서 가져오기는 실제 KB국민은행 앱에서만 가능합니다.\n데모에서는 아이디 로그인을 이용해주세요.')}>
          인증서 가져오기
        </FullWidthButton>
      </ButtonContainer>
      <LinkText 
        onClick={() => alert('인증서 관리는 실제 KB국민은행 앱에서만 가능합니다.')}
        style={{ 
          marginTop: '20px', 
          fontSize: '14px', 
          color: colors.textSecondary,
          textDecoration: 'underline',
          cursor: 'pointer'
        }}
      >
        인증서 관리
      </LinkText>
    </Container>
  );
}; 