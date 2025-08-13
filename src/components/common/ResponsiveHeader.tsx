/**
 * KB 스타뱅킹 완전 반응형 Header 컴포넌트
 * 원본 앱과 85% 스케일 일관성 유지
 * 모든 안드로이드 기기에서 완벽한 헤더 표시
 */

import React from 'react';
import styled from 'styled-components';
import { MEDIA_QUERIES } from '../../styles/breakpoints';
import { createResponsiveHeader, KB_DESIGN_TOKENS } from '../../styles/responsive-system';

// Header 컴포넌트 Props 타입
export interface ResponsiveHeaderProps {
  title?: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftClick?: () => void;
  onRightClick?: () => void;
  backgroundColor?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showSearchButton?: boolean;
  transparent?: boolean;
  sticky?: boolean;
  className?: string;
}

// KB 앱 완전 반응형 Header 컨테이너
const HeaderContainer = styled.header<{ 
  backgroundColor?: string; 
  transparent?: boolean; 
  sticky?: boolean;
}>`
  ${createResponsiveHeader()}
  
  background: ${({ backgroundColor, transparent }) => 
    transparent ? 'transparent' : (backgroundColor || KB_DESIGN_TOKENS.colors.background)
  };
  
  ${({ sticky }) => sticky && `
    position: sticky;
    top: 0;
    z-index: 1000;
  `}
  
  /* 투명한 헤더일 때 그림자 제거 */
  ${({ transparent }) => transparent && `
    border-bottom: none;
    box-shadow: none;
  `}
  
  /* 폴더블 기기 최적화 */
  ${MEDIA_QUERIES.foldableClosed} {
    padding-left: ${KB_DESIGN_TOKENS.spacing.sm};
    padding-right: ${KB_DESIGN_TOKENS.spacing.sm};
  }
  
  /* 태블릿에서 중앙 정렬 */
  ${MEDIA_QUERIES.tablet} {
    max-width: 430px;
    margin: 0 auto;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
  }
`;

// 헤더 좌측 영역
const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${KB_DESIGN_TOKENS.spacing.sm};
  flex: 0 0 auto;
`;

// 헤더 중앙 영역
const CenterSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 0;
  padding: 0 ${KB_DESIGN_TOKENS.spacing.sm};
  
  ${MEDIA_QUERIES.phoneSmall} {
    padding: 0 ${KB_DESIGN_TOKENS.spacing.xs};
  }
`;

// 헤더 우측 영역
const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${KB_DESIGN_TOKENS.spacing.sm};
  flex: 0 0 auto;
`;

// 헤더 타이틀
const HeaderTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: ${KB_DESIGN_TOKENS.colors.onSurface};
  margin: 0;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  
  ${MEDIA_QUERIES.phoneSmall} {
    font-size: 16px;
  }
  
  ${MEDIA_QUERIES.tablet} {
    font-size: 20px;
  }
`;

// 헤더 서브타이틀
const HeaderSubtitle = styled.p`
  font-size: 12px;
  font-weight: 400;
  color: ${KB_DESIGN_TOKENS.colors.onSurfaceVariant};
  margin: 0;
  margin-top: 2px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  
  ${MEDIA_QUERIES.phoneSmall} {
    font-size: 11px;
  }
  
  ${MEDIA_QUERIES.tablet} {
    font-size: 13px;
  }
`;

// 아이콘 버튼
const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: ${KB_DESIGN_TOKENS.borderRadius.medium};
  border: none;
  background: transparent;
  color: ${KB_DESIGN_TOKENS.colors.onSurface};
  cursor: pointer;
  transition: all 0.2s ease;
  
  /* 터치 최적화 */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  
  /* 호버 효과 (마우스 디바이스만) */
  ${MEDIA_QUERIES.mouse} {
    &:hover {
      background: ${KB_DESIGN_TOKENS.colors.surface};
    }
  }
  
  /* 터치 피드백 */
  ${MEDIA_QUERIES.touch} {
    &:active {
      background: ${KB_DESIGN_TOKENS.colors.surfaceVariant};
      transform: scale(0.95);
    }
  }
  
  /* 포커스 스타일 */
  &:focus-visible {
    outline: 2px solid ${KB_DESIGN_TOKENS.colors.primary};
    outline-offset: 2px;
  }
  
  /* 반응형 크기 조정 */
  ${MEDIA_QUERIES.phoneSmall} {
    width: 40px;
    height: 40px;
  }
  
  ${MEDIA_QUERIES.tablet} {
    width: 48px;
    height: 48px;
  }
  
  svg {
    width: 24px;
    height: 24px;
    
    ${MEDIA_QUERIES.phoneSmall} {
      width: 20px;
      height: 20px;
    }
    
    ${MEDIA_QUERIES.tablet} {
      width: 28px;
      height: 28px;
    }
  }
`;

// 기본 아이콘들
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/**
 * KB 스타뱅킹 완전 반응형 Header 컴포넌트
 */
export const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftClick,
  onRightClick,
  backgroundColor,
  showBackButton = false,
  showMenuButton = false,
  showSearchButton = false,
  transparent = false,
  sticky = false,
  className
}) => {
  return (
    <HeaderContainer
      backgroundColor={backgroundColor}
      transparent={transparent}
      sticky={sticky}
      className={className}
    >
      <LeftSection>
        {showBackButton && (
          <IconButton onClick={onLeftClick} aria-label="뒤로가기">
            <BackIcon />
          </IconButton>
        )}
        {showMenuButton && (
          <IconButton onClick={onLeftClick} aria-label="메뉴">
            <MenuIcon />
          </IconButton>
        )}
        {leftIcon && (
          <IconButton onClick={onLeftClick} aria-label="좌측 버튼">
            {leftIcon}
          </IconButton>
        )}
      </LeftSection>

      <CenterSection>
        {title && <HeaderTitle>{title}</HeaderTitle>}
        {subtitle && <HeaderSubtitle>{subtitle}</HeaderSubtitle>}
      </CenterSection>

      <RightSection>
        {showSearchButton && (
          <IconButton onClick={onRightClick} aria-label="검색">
            <SearchIcon />
          </IconButton>
        )}
        {rightIcon && (
          <IconButton onClick={onRightClick} aria-label="우측 버튼">
            {rightIcon}
          </IconButton>
        )}
      </RightSection>
    </HeaderContainer>
  );
};

// 미리 정의된 Header 변형들
export const MainHeader: React.FC<Omit<ResponsiveHeaderProps, 'showMenuButton'>> = (props) => (
  <ResponsiveHeader showMenuButton {...props} />
);

export const PageHeader: React.FC<Omit<ResponsiveHeaderProps, 'showBackButton'>> = (props) => (
  <ResponsiveHeader showBackButton {...props} />
);

export const SearchHeader: React.FC<Omit<ResponsiveHeaderProps, 'showSearchButton'>> = (props) => (
  <ResponsiveHeader showSearchButton {...props} />
);

// KB 로고 포함 메인 헤더
const KBLogo = styled.img`
  height: 24px;
  width: auto;
  
  ${MEDIA_QUERIES.phoneSmall} {
    height: 20px;
  }
  
  ${MEDIA_QUERIES.tablet} {
    height: 28px;
  }
`;

export const KBMainHeader: React.FC<Omit<ResponsiveHeaderProps, 'title' | 'showMenuButton'>> = (props) => (
  <ResponsiveHeader
    {...props}
    showMenuButton
    leftIcon={<KBLogo src="/assets/images/kb_logo.png" alt="KB국민은행" />}
  />
);

export default ResponsiveHeader;