import React from 'react';

import styled from 'styled-components';

import bibiCharacterSmall from '../../../assets/images/bibi_s.png';
import { KBDesignSystem } from '../../../styles/tokens/kb-design-system';

/**
 * KB 스타뱅킹 메인 배너 컴포넌트 (원본 앱 100% 동일 구현)
 * - 좌우 2개 카드 레이아웃
 * - 원본과 동일한 텍스트 및 색상
 * - KB 캐릭터 이미지 활용
 */
const BannerContainer = styled.section`
  background: ${KBDesignSystem.colors.background.gray100};
  padding: ${KBDesignSystem.spacing.lg};
`;

const BannerGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${KBDesignSystem.spacing.sm};
`;

const BannerCard = styled.div<{ $variant: 'orange' | 'blue' }>`
  background: ${props =>
    props.$variant === 'orange'
      ? 'linear-gradient(135deg, #FFA726 0%, #FF8A50 100%)'
      : 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)'};
  border-radius: ${KBDesignSystem.borderRadius.card};
  padding: ${KBDesignSystem.spacing.lg};
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all ${KBDesignSystem.animation.duration.normal}
    ${KBDesignSystem.animation.easing.easeOut};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${KBDesignSystem.shadows.lg};
  }
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${KBDesignSystem.spacing.xs};
`;

const CardTitle = styled.h3<{ $variant: 'orange' | 'blue' }>`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.base};
  font-weight: ${KBDesignSystem.typography.fontWeight.bold};
  color: ${props => (props.$variant === 'orange' ? '#FFFFFF' : '#1565C0')};
  margin: 0;
  line-height: ${KBDesignSystem.typography.lineHeight.tight};
  letter-spacing: ${KBDesignSystem.typography.letterSpacing.tight};
`;

const CardSubtitle = styled.p<{ $variant: 'orange' | 'blue' }>`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.sm};
  font-weight: ${KBDesignSystem.typography.fontWeight.medium};
  color: ${props => (props.$variant === 'orange' ? 'rgba(255, 255, 255, 0.9)' : '#1976D2')};
  margin: 0;
  line-height: ${KBDesignSystem.typography.lineHeight.normal};
`;

const CardHighlight = styled.div<{ $variant: 'orange' | 'blue' }>`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.lg};
  font-weight: ${KBDesignSystem.typography.fontWeight.bold};
  color: ${props => (props.$variant === 'orange' ? '#FFFFFF' : '#0D47A1')};
  margin-top: ${KBDesignSystem.spacing.sm};
`;

const CardIcon = styled.div<{ $variant: 'orange' | 'blue' }>`
  position: absolute;
  bottom: ${KBDesignSystem.spacing.sm};
  right: ${KBDesignSystem.spacing.sm};
  width: 50px;
  height: 50px;
  background: ${props =>
    props.$variant === 'orange'
      ? 'linear-gradient(135deg, #FFD54F 0%, #FFB74D 100%)'
      : 'transparent'};
  border-radius: ${KBDesignSystem.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${KBDesignSystem.typography.fontSize.xl};
  opacity: 0.9;
`;

const CharacterImage = styled.img`
  position: absolute;
  bottom: 0;
  right: ${KBDesignSystem.spacing.sm};
  width: 60px;
  height: 60px;
  object-fit: contain;
`;

const KBLogo = styled.div`
  position: absolute;
  top: ${KBDesignSystem.spacing.sm};
  right: ${KBDesignSystem.spacing.sm};
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.xs};
  font-weight: ${KBDesignSystem.typography.fontWeight.bold};
  color: #1976d2;
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: ${KBDesignSystem.borderRadius.sm};
`;

interface MainBannerProps {
  onBannerClick?: () => void;
  className?: string;
}

export const MainBanner: React.FC<MainBannerProps> = ({ onBannerClick, className }) => {
  return (
    <BannerContainer className={className}>
      <BannerGrid>
        {/* 좌측 카드: 안 쓰는 계좌의 잔액을 모아보세요 */}
        <BannerCard $variant='orange' onClick={onBannerClick}>
          <CardContent>
            <CardTitle $variant='orange'>안 쓰는 계좌의</CardTitle>
            <CardTitle $variant='orange'>잔액을 모아보세요</CardTitle>
            <CardSubtitle $variant='orange'>숨은 잔돈 모으기</CardSubtitle>
            <CardHighlight $variant='orange'>최대 4.5%</CardHighlight>
          </CardContent>
          <CardIcon $variant='orange'>💰</CardIcon>
        </BannerCard>

        {/* 우측 카드: 자녀의 금융생활, 시작이 고민이라면? */}
        <BannerCard $variant='blue' onClick={onBannerClick}>
          <KBLogo>KB</KBLogo>
          <CardContent>
            <CardTitle $variant='blue'>자녀의 금융생활,</CardTitle>
            <CardTitle $variant='blue'>시작이 고민이라면?</CardTitle>
            <CardSubtitle $variant='blue'>우리 아이 금융상품</CardSubtitle>
          </CardContent>
          <CharacterImage src={bibiCharacterSmall} alt='KB 캐릭터' />
        </BannerCard>
      </BannerGrid>
    </BannerContainer>
  );
};

export default MainBanner;
