import React from 'react';

import styled from 'styled-components';

import { fadeInUp, staggerDelay, respectMotionPreference } from '../../../styles/animations';
import { tokens } from '../../../styles/tokens';
/**
 * KB 스타뱅킹 콘텐츠 섹션들
 * - 운세서비스, 게임 프로모션, 이달의 pick, 추천서비스
 * - 일관된 디자인 시스템과 애니메이션
 * - 재사용 가능한 컴포넌트 구조
 */
// === 공통 스타일 ===
const Section = styled.section`
  background: ${tokens.colors.background.primary};
  padding: ${tokens.spacing[5]};
  border-top: 8px solid ${tokens.colors.background.tertiary};
  &:first-child {
    border-top: none;
  }
`;
const SectionTitle = styled.h2`
  font-family: ${tokens.typography.fontFamily.bold};
  font-size: ${tokens.typography.fontSize.titleMedium};
  font-weight: ${tokens.typography.fontWeight.bold};
  color: ${tokens.colors.text.primary};
  margin: 0 0 ${tokens.spacing[4]} 0;
  letter-spacing: ${tokens.typography.letterSpacing.korean.title};
`;
// === 운세서비스 섹션 ===
const FortuneSection = styled(Section)`
  border-top: none;
`;
const FortuneBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${tokens.spacing[4]};
  background: ${tokens.colors.background.surfaceVariant};
  border-radius: ${tokens.borderRadius.xl};
  cursor: pointer;
  transition: all ${tokens.animation.duration.normal} ${tokens.animation.easing.easeOut};
  &:hover {
    background: ${tokens.colors.background.surfaceDark};
    transform: translateY(-1px);
    box-shadow: ${tokens.shadows.elevation1};
  }
  &:active {
    transform: translateY(0);
  }
`;
const FortuneContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[3]};
`;
const FortuneIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #FFE5CC 0%, #FFD4A3 100%);
  border-radius: ${tokens.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: ${tokens.shadows.elevation1};
`;
const FortuneText = styled.div`
  font-family: ${tokens.typography.fontFamily.medium};
  font-size: ${tokens.typography.fontSize.bodyMedium};
  font-weight: ${tokens.typography.fontWeight.medium};
  color: ${tokens.colors.text.primary};
  line-height: ${tokens.typography.lineHeight.body};
  div:first-child {
    font-weight: ${tokens.typography.fontWeight.semibold};
    margin-bottom: 2px;
  }
`;
const FortuneArrow = styled.div`
  color: ${tokens.colors.text.tertiary};
  font-size: 18px;
`;
// === 게임 프로모션 섹션 ===
const GamePromotionSection = styled(Section)``;
const GameBanner = styled.div`
  background: linear-gradient(135deg, #4A69BD 0%, #3C5BA9 100%);
  border-radius: ${tokens.borderRadius.xxl};
  padding: ${tokens.spacing[5]};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all ${tokens.animation.duration.normal} ${tokens.animation.easing.easeOut};
  overflow: hidden;
  position: relative;
  /* 그라데이션 오버레이 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(74, 105, 189, 0.25);
  }
  &:active {
    transform: translateY(-1px);
  }
`;
const GameContent = styled.div`
  color: ${tokens.colors.text.white};
  z-index: 2;
  position: relative;
`;
const GameTitle = styled.h3`
  font-family: ${tokens.typography.fontFamily.bold};
  font-size: ${tokens.typography.fontSize.titleMedium};
  font-weight: ${tokens.typography.fontWeight.bold};
  margin: 0 0 ${tokens.spacing[2]} 0;
`;
const GameSubtitle = styled.p`
  font-family: ${tokens.typography.fontFamily.medium};
  font-size: ${tokens.typography.fontSize.bodyMedium};
  font-weight: ${tokens.typography.fontWeight.regular};
  margin: 0;
  opacity: 0.9;
`;
const GameImage = styled.div`
  width: 80px;
  height: 80px;
  background: ${tokens.colors.background.primary};
  border-radius: ${tokens.borderRadius.xxl};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  box-shadow: ${tokens.shadows.elevation2};
  z-index: 2;
  position: relative;
`;
// === 이달의 pick 섹션 ===
const MonthlyPickSection = styled(Section)``;
const PickGrid = styled.div`
  display: grid;
  gap: ${tokens.spacing[4]};
`;
const PickCard = styled.div<{ $animationIndex?: number }>`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[4]};
  padding: ${tokens.spacing[4]};
  background: ${tokens.colors.background.surfaceVariant};
  border-radius: ${tokens.borderRadius.xl};
  cursor: pointer;
  transition: all ${tokens.animation.duration.normal} ${tokens.animation.easing.easeOut};
  animation: ${fadeInUp} 0.4s ease-out forwards;
  ${props => props.$animationIndex && staggerDelay(props.$animationIndex, 0.1)}
  opacity: 0;
  transform: translate3d(0, 20px, 0);
  ${respectMotionPreference}
  &:hover {
    background: ${tokens.colors.background.surfaceDark};
    transform: translateX(4px);
    box-shadow: ${tokens.shadows.elevation1};
  }
  &:active {
    transform: translateX(2px);
  }
`;
const PickIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${tokens.colors.background.primary};
  border-radius: ${tokens.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: ${tokens.shadows.elevation1};
  flex-shrink: 0;
`;
const PickContent = styled.div`
  flex: 1;
`;
const PickTitle = styled.h3`
  font-family: ${tokens.typography.fontFamily.bold};
  font-size: ${tokens.typography.fontSize.bodyLarge};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.text.primary};
  margin: 0 0 ${tokens.spacing[1]} 0;
  letter-spacing: ${tokens.typography.letterSpacing.korean.body};
`;
const PickSubtitle = styled.p`
  font-family: ${tokens.typography.fontFamily.medium};
  font-size: ${tokens.typography.fontSize.labelLarge};
  font-weight: ${tokens.typography.fontWeight.regular};
  color: ${tokens.colors.text.secondary};
  margin: 0;
  line-height: ${tokens.typography.lineHeight.body};
`;
const PickDescription = styled.p`
  font-family: ${tokens.typography.fontFamily.medium};
  font-size: ${tokens.typography.fontSize.labelMedium};
  font-weight: ${tokens.typography.fontWeight.regular};
  color: ${tokens.colors.text.tertiary};
  margin: 2px 0 0 0;
  line-height: ${tokens.typography.lineHeight.body};
`;
// === 추천서비스 섹션 ===
const RecommendSection = styled(Section)``;
const RecommendGrid = styled.div`
  display: grid;
  gap: ${tokens.spacing[3]};
`;
const RecommendCard = styled.div<{ $animationIndex?: number }>`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[3]};
  padding: ${tokens.spacing[4]};
  background: ${tokens.colors.background.primary};
  border: 1px solid ${tokens.colors.border.primary};
  border-radius: ${tokens.borderRadius.xl};
  cursor: pointer;
  transition: all ${tokens.animation.duration.normal} ${tokens.animation.easing.easeOut};
  animation: ${fadeInUp} 0.4s ease-out forwards;
  ${props => props.$animationIndex && staggerDelay(props.$animationIndex, 0.1)}
  opacity: 0;
  transform: translate3d(0, 20px, 0);
  ${respectMotionPreference}
  &:hover {
    border-color: ${tokens.colors.brand.primary};
    box-shadow: ${tokens.shadows.elevation1};
    transform: translate3d(0, -2px, 0);
  }
  &:active {
    transform: translate3d(0, -1px, 0);
  }
`;
const RecommendIcon = styled.div`
  width: 56px;
  height: 56px;
  background: ${tokens.colors.background.tertiary};
  border-radius: ${tokens.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
`;
const RecommendContent = styled.div`
  flex: 1;
`;
const RecommendTitle = styled.h3`
  font-family: ${tokens.typography.fontFamily.bold};
  font-size: ${tokens.typography.fontSize.bodyLarge};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.text.primary};
  margin: 0 0 ${tokens.spacing[1]} 0;
  letter-spacing: ${tokens.typography.letterSpacing.korean.body};
`;
const RecommendDesc = styled.p`
  font-family: ${tokens.typography.fontFamily.medium};
  font-size: ${tokens.typography.fontSize.labelLarge};
  font-weight: ${tokens.typography.fontWeight.regular};
  color: ${tokens.colors.text.secondary};
  margin: 0;
  line-height: ${tokens.typography.lineHeight.body};
`;
// === 데이터 인터페이스 ===
interface PickItem {
  icon: string;
  title: string;
  subtitle: string;
  desc?: string;
}
interface RecommendItem {
  icon: string;
  title: string;
  desc: string;
}
interface ContentSectionsProps {
  className?: string;
  onFortuneClick?: () => void;
  onGameClick?: () => void;
  onPickClick?: (index: number) => void;
  onRecommendClick?: (index: number) => void;
}
// === 기본 데이터 ===
const monthlyPicks: PickItem[] = [
  { 
    icon: '💳', 
    title: '함께 모으는 순간', 
    subtitle: '여행은 이미 시작!', 
    desc: 'KB모임통장 서비스' 
  },
  { 
    icon: '💵', 
    title: '환전 걱정 없이', 
    subtitle: '공항에서 외화받기', 
    desc: '인천공항 환전하기' 
  },
  { 
    icon: '🔔', 
    title: '안 쓰는 계좌의 잔액을 모아보세요', 
    subtitle: '숨은 잔돈 모으기' 
  }
];
const recommendServices: RecommendItem[] = [
  { 
    icon: '📊', 
    title: 'KB금융그룹 계열사 상품까지 한번에!', 
    desc: '내게 맞는 대출 찾기' 
  },
  { 
    icon: '🏠', 
    title: '홈 화면 계좌와 알림을 바로 확인', 
    desc: '빠른 로그인 설정하기' 
  },
  { 
    icon: '📱', 
    title: '7,500원에 10GB 든든하게!', 
    desc: '가입도 간단해서 걱정 없어요' 
  }
];
export const ContentSections: React.FC<ContentSectionsProps> = ({
  className,
  onFortuneClick,
  onGameClick,
  onPickClick,
  onRecommendClick
}) => {
  return (
    <div className={className}>
      {/* 운세서비스 */}
      <FortuneSection>
        <FortuneBanner onClick={onFortuneClick}>
          <FortuneContent>
            <FortuneIcon>🎁</FortuneIcon>
            <FortuneText>
              <div>운세서비스</div>
              <div>오늘 나의 운세는?</div>
            </FortuneText>
          </FortuneContent>
          <FortuneArrow>›</FortuneArrow>
        </FortuneBanner>
      </FortuneSection>
      {/* 게임 프로모션 */}
      <GamePromotionSection>
        <GameBanner onClick={onGameClick}>
          <GameContent>
            <GameTitle>국민오락실</GameTitle>
            <GameSubtitle>시간 순삭, 공짜 보상!</GameSubtitle>
          </GameContent>
          <GameImage>🎮</GameImage>
        </GameBanner>
      </GamePromotionSection>
      {/* 이달의 pick */}
      <MonthlyPickSection>
        <SectionTitle>이달의 pick</SectionTitle>
        <PickGrid>
          {monthlyPicks.map((pick, index) => (
            <PickCard 
              key={index} 
              $animationIndex={index}
              onClick={() => onPickClick?.(index)}
            >
              <PickIcon>{pick.icon}</PickIcon>
              <PickContent>
                <PickTitle>{pick.title}</PickTitle>
                <PickSubtitle>{pick.subtitle}</PickSubtitle>
                {pick.desc && (
                  <PickDescription>{pick.desc}</PickDescription>
                )}
              </PickContent>
            </PickCard>
          ))}
        </PickGrid>
      </MonthlyPickSection>
      {/* 추천서비스 */}
      <RecommendSection>
        <SectionTitle>추천서비스</SectionTitle>
        <RecommendGrid>
          {recommendServices.map((service, index) => (
            <RecommendCard 
              key={index} 
              $animationIndex={index}
              onClick={() => onRecommendClick?.(index)}
            >
              <RecommendIcon>{service.icon}</RecommendIcon>
              <RecommendContent>
                <RecommendTitle>{service.title}</RecommendTitle>
                <RecommendDesc>{service.desc}</RecommendDesc>
              </RecommendContent>
            </RecommendCard>
          ))}
        </RecommendGrid>
      </RecommendSection>
    </div>
  );
};
export default ContentSections;