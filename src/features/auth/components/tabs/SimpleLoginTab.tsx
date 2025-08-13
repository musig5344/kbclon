import React from 'react';

import { Link } from 'react-router-dom'; // Link import

import styled from 'styled-components';

import CertIcon from '../../../../assets/images/icons/login_cert_icon.png';
import FinanceCertIcon from '../../../../assets/images/icons/login_finance_cert_icon.png';
import IdIcon from '../../../../assets/images/icons/login_id_icon.png';
import { tokens } from '../../../../styles/tokens';
// 원본 KB 스타뱅킹 클라우드 인증서 아이콘 사용 필요
// TODO: imageorigin1/icon_login_cloud.png로 교체
const Container = styled.div`
  padding: 16px 0;
`;
const ListItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 16px 24px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  &:hover {
    background-color: ${tokens.colors.lightGray};
  }
`;
const Icon = styled.img`
  width: 48px;
  height: 48px;
  margin-right: 16px;
`;
const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
`;
const Title = styled.span`
  font-family: 'KBFGText', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: ${tokens.colors.text.primary};
  margin-bottom: 4px;
`;
const Description = styled.span`
  font-family: 'KBFGText', sans-serif;
  font-size: 14px;
  color: ${tokens.colors.text.secondary};
`;
// Link 스타일 초기화
const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;
const loginOptions = [
  {
    title: '공동인증서',
    description: '공인인증서로 안전하게 로그인',
    icon: CertIcon,
    path: '/login/certificate',
  },
  {
    title: '금융인증서',
    description: '클라우드에 저장하여 어디서나 이용',
    icon: FinanceCertIcon,
    path: '/login/finance-cert',
  },
  { title: 'ID', description: '아이디/비밀번호로 로그인', icon: IdIcon, path: '/login/id' },
];
export const SimpleLoginTab: React.FC = () => {
  return (
    <Container>
      {loginOptions.map(option => (
        <StyledLink
          to={option.path}
          key={option.title}
          onClick={_e => {
            // 개발 중인 기능의 경우 참고 로그
            if (option.path.includes('finance-cert') || option.path.includes('certificate')) {
            }
          }}
        >
          <ListItem as='div'>
            {' '}
            {/* button 대신 div로 렌더링 */}
            <Icon src={option.icon} alt={`${option.title} 아이콘`} />
            <TextContainer>
              <Title>{option.title}</Title>
              <Description>{option.description}</Description>
            </TextContainer>
          </ListItem>
        </StyledLink>
      ))}
    </Container>
  );
};
