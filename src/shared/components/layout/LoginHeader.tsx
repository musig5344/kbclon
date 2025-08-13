import React from 'react';

import styled from 'styled-components';

import { SearchIcon, MenuIcon, HomeIcon } from '../../../assets/icons/CommonIcons';
import KBBankLogo from '../../../assets/images/logo_kb_kookmin.png';
import { colors } from '../../../styles/colors';
import { tokens } from '../../../styles/tokens';
interface LoginHeaderProps {
  title?: string;
  onSearchClick?: () => void;
  onMenuClick?: () => void;
  onHomeClick?: () => void;
  onClose?: () => void;
  showHomeButton?: boolean;
  showCloseButton?: boolean;
}
// view_header_login.xml 기반 스타일
const HeaderContainer = styled.div`
  width: 100%;
  height: 58px; // 약간 높이 증가로 더 자연스러운 비율
  background: linear-gradient(
    180deg,
    ${tokens.colors.headerBackground} 0%,
    ${tokens.colors.backgroundGray1} 100%
  );
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 100;
  border-bottom: 1px solid ${tokens.colors.border.light}; /* 미묘한 하단 구분선 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* 매우 미묘한 그림자 */
`;
const LeftSection = styled.div`
  display: flex;
  align-items: center;
  margin-left: 20px; // 약간 줄여서 더 자연스러운 비율
  padding: 8px 0; // 상하 패딩 추가로 클릭 영역 확보
`;
const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px; // 버튼 간격 약간 줄여서 더 균형감 있게
  margin-right: 20px; // 좌측과 동일하게 맞춤
  padding: 8px 0; // 상하 패딩 추가
`;
const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;
const LogoImage = styled.img`
  height: 19px; // 헤더 높이 증가에 맞춰 약간 확대
  width: auto;
  filter: brightness(0.9) contrast(1.1); // 미묘한 명암 조정으로 더 선명하게
`;
const IconButton = styled.button<{ $visible?: boolean }>`
  background: none;
  border: none;
  padding: 10px; // 패딩 약간 증가로 더 넓은 터치 영역
  cursor: pointer;
  border-radius: 50%;
  width: 42px; // 헤더 높이 증가에 맞춰 약간 확대
  height: 42px;
  display: ${props => (props.$visible === false ? 'none' : 'flex')};
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); // 부드러운 전환 효과
  &:hover {
    background: linear-gradient(135deg, rgba(255, 211, 56, 0.1) 0%, rgba(255, 200, 0, 0.05) 100%);
    transform: scale(1.05); // 미묘한 확대 효과
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  &:active {
    background: linear-gradient(135deg, rgba(255, 211, 56, 0.15) 0%, rgba(255, 200, 0, 0.08) 100%);
    transform: scale(1.02);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  &:focus {
    outline: 2px solid rgba(255, 211, 56, 0.5);
    outline-offset: 2px;
  }
`;
// 닫기 아이콘
const CloseIcon = () => (
  <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
    <path
      d='M18 6L6 18M6 6l12 12'
      stroke={colors.textSecondary}
      strokeWidth='2'
      strokeLinecap='round'
    />
  </svg>
);

const CenterTitle = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-family: ${tokens.typography.fontFamily.primary};
  font-size: 18px;
  font-weight: ${tokens.typography.fontWeight.medium};
  color: ${colors.textPrimary};
  white-space: nowrap;
`;
export const LoginHeader: React.FC<LoginHeaderProps> = ({
  title,
  onSearchClick,
  onMenuClick,
  onHomeClick,
  onClose,
  showHomeButton = false,
  showCloseButton = false,
}) => {
  return (
    <HeaderContainer>
      <LeftSection>
        <LogoContainer>
          <LogoImage src={KBBankLogo} alt='KB국민은행 로고' />
        </LogoContainer>
      </LeftSection>
      {title && <CenterTitle>{title}</CenterTitle>}
      <RightSection>
        {/* 검색 버튼 */}
        <IconButton onClick={onSearchClick} aria-label='검색'>
          <SearchIcon color={colors.textSecondary} />
        </IconButton>
        {/* 메뉴 버튼 */}
        <IconButton
          onClick={onMenuClick}
          aria-label='전체메뉴'
          $visible={!showHomeButton && !showCloseButton}
        >
          <MenuIcon color={colors.textSecondary} />
        </IconButton>
        {/* 홈 버튼 (조건부 표시) */}
        <IconButton onClick={onHomeClick} aria-label='홈' $visible={showHomeButton}>
          <HomeIcon color={colors.textSecondary} />
        </IconButton>
        {/* 닫기 버튼 (조건부 표시) */}
        <IconButton onClick={onClose} aria-label='닫기' $visible={showCloseButton}>
          <CloseIcon />
        </IconButton>
      </RightSection>
    </HeaderContainer>
  );
};
