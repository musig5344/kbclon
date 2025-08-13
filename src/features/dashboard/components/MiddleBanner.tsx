import React from 'react';

import styled from 'styled-components';

import { KBDesignSystem } from '../../../styles/tokens/kb-design-system';

/**
 * KB 스타뱅킹 중간 배너 컴포넌트 (원본 앱 100% 동일 구현)
 * - "여행자금 마련과 환테크를 한 번에!!" 배너
 * - KB TWO테크 위험성기예금
 */
const MiddleBannerSection = styled.section`
  background: ${KBDesignSystem.colors.background.gray100};
  padding: 0 ${KBDesignSystem.spacing.lg} ${KBDesignSystem.spacing.lg} ${KBDesignSystem.spacing.lg};
`;

const BannerCard = styled.div`
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: ${KBDesignSystem.borderRadius.card};
  padding: ${KBDesignSystem.spacing.lg};
  min-height: 100px;
  display: flex;
  align-items: center;
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

const BannerContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${KBDesignSystem.spacing.xs};
`;

const BannerTitle = styled.h3`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.lg};
  font-weight: ${KBDesignSystem.typography.fontWeight.bold};
  color: #1565c0;
  margin: 0;
  line-height: ${KBDesignSystem.typography.lineHeight.tight};
`;

const BannerSubtitle = styled.p`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.sm};
  font-weight: ${KBDesignSystem.typography.fontWeight.medium};
  color: #1976d2;
  margin: 0;
  line-height: ${KBDesignSystem.typography.lineHeight.normal};
`;

const BannerIcon = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: ${KBDesignSystem.spacing.md};
`;

const CharacterContainer = styled.div`
  position: relative;
  width: 80px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MoneyIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
`;

const KBLogo = styled.div`
  position: absolute;
  top: ${KBDesignSystem.spacing.sm};
  right: ${KBDesignSystem.spacing.sm};
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.xs};
  font-weight: ${KBDesignSystem.typography.fontWeight.bold};
  color: #1976d2;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: ${KBDesignSystem.borderRadius.sm};
`;

interface MiddleBannerProps {
  onBannerClick?: () => void;
  className?: string;
}

export const MiddleBanner: React.FC<MiddleBannerProps> = ({ onBannerClick, className }) => {
  return (
    <MiddleBannerSection className={className}>
      <BannerCard onClick={onBannerClick}>
        <KBLogo>KB</KBLogo>
        <BannerContent>
          <BannerTitle>여행자금 마련과 환테크를 한 번에!!</BannerTitle>
          <BannerSubtitle>KB TWO테크 위험성기예금</BannerSubtitle>
        </BannerContent>
        <BannerIcon>
          <CharacterContainer>
            <MoneyIcon>💰</MoneyIcon>
          </CharacterContainer>
        </BannerIcon>
      </BannerCard>
    </MiddleBannerSection>
  );
};

export default MiddleBanner;
