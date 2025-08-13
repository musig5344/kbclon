import React from 'react';

import { Link } from 'react-router-dom';

import styled from 'styled-components';

// KB 스타뱅킹 원본 금융인증서 클라우드 아이콘
import FinanceCertIcon from '../../../../assets/images/icons/login_finance_cert_icon.png';
const Container = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 280px;
  background-color: #ffffff;
`;
const CertButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 280px;
  padding: 40px 24px;
  background: #ffffff;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  &:hover {
    border-color: #ffd338;
    box-shadow: 0 5px 15px rgba(255, 211, 56, 0.3);
    transform: translateY(-2px);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;
const Icon = styled.img`
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
  object-fit: contain;
  opacity: 1;
  filter: brightness(0.9) contrast(1.3) saturate(1.2);
`;
const Title = styled.span`
  font-family: 'KBFGText', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
  letter-spacing: -0.3px;
`;
const Description = styled.span`
  font-family: 'KBFGText', sans-serif;
  font-size: 15px;
  color: #666666;
  line-height: 1.5;
  text-align: center;
  font-weight: 500;
`;
const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;
export const FinanceCertificateTab: React.FC = () => {
  return (
    <Container>
      <StyledLink
        to='#'
        onClick={e => {
          e.preventDefault();
          alert(
            '금융인증서 로그인은 실제 KB국민은행 앱에서만 가능합니다.\n데모에서는 아이디 로그인을 이용해주세요.'
          );
        }}
      >
        <CertButton as='div'>
          <Icon src={FinanceCertIcon} alt='금융인증서 아이콘' />
          <Title>금융인증서</Title>
          <Description>
            클라우드에 저장된 인증서로
            <br />
            어디서나 안전하게 로그인
          </Description>
        </CertButton>
      </StyledLink>
    </Container>
  );
};
