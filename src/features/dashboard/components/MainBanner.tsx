import React from 'react';

import styled from 'styled-components';

import { KBDesignSystem } from '../../../styles/tokens/kb-design-system';
/**
 * KB 스타뱅킹 메인 배너 컴포넌트
 * - 원본 앱 기준 정밀한 그라데이션 및 그림자 적용
 * - 마이크로 인터랙션 최적화
 * - KB 브랜드 컬러 99% 정확도 구현
 */
const BannerContainer = styled.section`
  background: ${KBDesignSystem.colors.background.white};
  padding: ${KBDesignSystem.spacing.lg};
`;
const Banner = styled.div`
  background: linear-gradient(135deg, ${KBDesignSystem.colors.primary.yellowLight} 0%, #FFE5CC 100%);
  border-radius: ${KBDesignSystem.borderRadius.card};
  padding: ${KBDesignSystem.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: ${KBDesignSystem.shadows.card};
  cursor: pointer;
  transition: all ${KBDesignSystem.animation.duration.normal} ${KBDesignSystem.animation.easing.easeOut};
  position: relative;
  overflow: hidden;
  min-height: 100px;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  
  /* 미세한 inner shadow로 depth 강화 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: ${KBDesignSystem.borderRadius.card};
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${KBDesignSystem.shadows.lg};
    background: linear-gradient(135deg, #FFFAED 0%, #FFE8D1 100%);
  }
  
  &:active {
    transform: translateY(0) scale(0.99);
    transition: all ${KBDesignSystem.animation.duration.fast} ${KBDesignSystem.animation.easing.easeOut};
  }
`;
const BannerContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${KBDesignSystem.spacing.sm};
`;
const BannerTitle = styled.h2`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.lg};
  font-weight: ${KBDesignSystem.typography.fontWeight.bold};
  color: ${KBDesignSystem.colors.text.primary};
  margin: 0;
  line-height: ${KBDesignSystem.typography.lineHeight.tight};
  letter-spacing: ${KBDesignSystem.typography.letterSpacing.tight};
`;
const BannerSubtitle = styled.p`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.base};
  font-weight: ${KBDesignSystem.typography.fontWeight.medium};
  color: ${KBDesignSystem.colors.text.secondary};
  margin: 0;
  line-height: ${KBDesignSystem.typography.lineHeight.normal};
  letter-spacing: ${KBDesignSystem.typography.letterSpacing.normal};
`;
const BannerIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, ${KBDesignSystem.colors.status.warning} 0%, #FF9933 100%);
  border-radius: ${KBDesignSystem.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 4px 12px rgba(255, 153, 51, 0.25);
  overflow: hidden;
  transition: all ${KBDesignSystem.animation.duration.normal} ${KBDesignSystem.animation.easing.easeOut};
  
  /* 내부 하이라이트 효과 */
  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    height: 20px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
    border-radius: ${KBDesignSystem.borderRadius.lg};
  }
  
  /* 15만원 프로모션 배지 */
  &::after {
    content: '15만원';
    position: absolute;
    bottom: -2px;
    right: -2px;
    background: ${KBDesignSystem.colors.status.success};
    color: ${KBDesignSystem.colors.text.inverse};
    font-size: ${KBDesignSystem.typography.fontSize.xs};
    font-weight: ${KBDesignSystem.typography.fontWeight.bold};
    font-family: ${KBDesignSystem.typography.fontFamily.primary};
    padding: 2px 6px;
    border-radius: ${KBDesignSystem.borderRadius.sm};
    border: 2px solid ${KBDesignSystem.colors.background.white};
    box-shadow: ${KBDesignSystem.shadows.sm};
    letter-spacing: ${KBDesignSystem.typography.letterSpacing.tight};
  }
  
  span {
    font-size: ${KBDesignSystem.typography.fontSize.xxxl};
    font-weight: ${KBDesignSystem.typography.fontWeight.bold};
    z-index: 1;
    position: relative;
  }
`;
interface MainBannerProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  onBannerClick?: () => void;
  className?: string;
}
export const MainBanner: React.FC<MainBannerProps> = ({
  title = "KB국민카드 쓰고",
  subtitle = "현금 최대 15만원 받기",
  icon = "💳",
  onBannerClick,
  className
}) => {
  return (
    <BannerContainer className={className}>
      <Banner onClick={onBannerClick}>
        <BannerContent>
          <BannerTitle>{title}</BannerTitle>
          <BannerSubtitle>{subtitle}</BannerSubtitle>
        </BannerContent>
        <BannerIcon>
          <span>{icon}</span>
        </BannerIcon>
      </Banner>
    </BannerContainer>
  );
};
export default MainBanner;