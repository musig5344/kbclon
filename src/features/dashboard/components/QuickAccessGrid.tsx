import React from 'react';

import styled from 'styled-components';

import { KBCard } from '../../../components/kb-native';
import { useTouchFeedback, hapticFeedback, TouchFeedbackOptions } from '../../../shared/utils/touchFeedback';
import { 
  androidAppContainer,
  androidOptimizedButton 
} from '../../../styles/android-webview-optimizations';
import { fadeInUp, staggerDelay, respectMotionPreference, smoothTransition } from '../../../styles/animations';
import { KBDesignSystem } from '../../../styles/tokens/kb-design-system';
/**
 * KB 스타뱅킹 빠른 접근 그리드 컴포넌트
 * - 4개 카드로 구성된 2x2 그리드
 * - 각 카드별 고유한 테마 색상 및 아이콘
 * - 마이크로 인터랙션과 스태거 애니메이션
 * - Enhanced touch feedback with haptic patterns
 * - Android WebView 최적화된 터치 인터랙션
 */
const QuickAccessContainer = styled.section`
  ${androidAppContainer}
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${KBDesignSystem.spacing.md};
  padding: ${KBDesignSystem.spacing.lg};
  background: ${KBDesignSystem.colors.background.white};
  
  /* Android WebView 성능 최적화 */
  transform: translateZ(0);
  will-change: scroll-position;
`;
const QuickAccessIcon = styled.div<{ $isPoint?: boolean }>`
  width: 48px;
  height: 48px;
  background: ${props => props.$isPoint 
    ? `linear-gradient(135deg, ${KBDesignSystem.colors.primary.yellow} 0%, ${KBDesignSystem.colors.primary.yellowDark} 100%)` 
    : KBDesignSystem.colors.background.white
  };
  border-radius: ${KBDesignSystem.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.$isPoint ? KBDesignSystem.typography.fontSize.xl : KBDesignSystem.typography.fontSize.xxxl};
  font-weight: ${props => props.$isPoint ? KBDesignSystem.typography.fontWeight.bold : KBDesignSystem.typography.fontWeight.regular};
  color: ${props => props.$isPoint ? KBDesignSystem.colors.text.primary : 'inherit'};
  box-shadow: ${KBDesignSystem.shadows.sm};
  position: relative;
  transition: all ${KBDesignSystem.animation.duration.normal} ${KBDesignSystem.animation.easing.easeOut};
  /* 내부 하이라이트 효과 */
  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    height: 16px;
    background: linear-gradient(180deg, rgba(255, 255, 255, ${props => props.$isPoint ? '0.3' : '0.5'}) 0%, transparent 100%);
    border-radius: 50%;
  }
  /* P 포인트 배지 */
  ${props => props.$isPoint && `
    &::after {
      content: 'P';
      position: absolute;
      bottom: -2px;
      right: -2px;
      background: ${KBDesignSystem.colors.primary.yellow};
      color: ${KBDesignSystem.colors.text.primary};
      font-size: ${KBDesignSystem.typography.fontSize.xs};
      font-weight: ${KBDesignSystem.typography.fontWeight.bold};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid ${KBDesignSystem.colors.background.white};
      box-shadow: ${KBDesignSystem.shadows.sm};
    }
  `}
`;
const QuickAccessCard = styled.button<{ 
  $animationIndex?: number;
  $bgColor?: string;
}>`
  ${androidOptimizedButton}
  background: ${props => props.$bgColor || KBDesignSystem.colors.background.gray100};
  border: none;
  border-radius: ${KBDesignSystem.borderRadius.card};
  padding: ${KBDesignSystem.spacing.base};
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all ${KBDesignSystem.animation.duration.normal} ${KBDesignSystem.animation.easing.easeOut};
  min-height: 88px;
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  
  /* Android WebView 성능 최적화 강화 */
  will-change: transform;
  backface-visibility: hidden;
  /* 미세한 border highlight */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: ${KBDesignSystem.borderRadius.card};
    border: 1px solid rgba(255, 255, 255, 0.6);
    pointer-events: none;
  }
  /* 스태거 애니메이션 */
  animation: ${fadeInUp} 0.4s ease-out forwards;
  ${props => props.$animationIndex && staggerDelay(props.$animationIndex, 0.08)}
  opacity: 0;
  transform: translate3d(0, 20px, 0);
  ${respectMotionPreference}
  ${smoothTransition}
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${KBDesignSystem.shadows.md};
    /* 호버 시 배경 미세 조정 */
    filter: brightness(1.02);
    /* 아이콘 회전 효과 */
    ${QuickAccessIcon} {
      transform: rotate(-5deg) scale(1.05);
    }
  }
  &:active {
    transform: translateY(0) scale(0.98);
    transition: all ${KBDesignSystem.animation.duration.fast} ${KBDesignSystem.animation.easing.easeOut};
  }
  /* 포커스 상태 */
  &:focus-visible {
    outline: 2px solid ${KBDesignSystem.colors.primary.yellow};
    outline-offset: 2px;
  }
`;
const QuickAccessContent = styled.div`
  text-align: left;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${KBDesignSystem.spacing.xs};
`;
const QuickAccessTitle = styled.h3`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.md};
  font-weight: ${KBDesignSystem.typography.fontWeight.semibold};
  color: ${KBDesignSystem.colors.text.primary};
  margin: 0;
  line-height: ${KBDesignSystem.typography.lineHeight.tight};
  letter-spacing: ${KBDesignSystem.typography.letterSpacing.tight};
`;
const QuickAccessSubtitle = styled.p`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.sm};
  font-weight: ${KBDesignSystem.typography.fontWeight.regular};
  color: ${KBDesignSystem.colors.text.secondary};
  margin: 0;
  line-height: ${KBDesignSystem.typography.lineHeight.normal};
  letter-spacing: ${KBDesignSystem.typography.letterSpacing.normal};
`;
const SpecialIcon = styled.span`
  position: relative;
  z-index: 1;
`;
const PiggyBankBadge = styled.span`
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: ${KBDesignSystem.colors.primary.yellow};
  border-radius: ${KBDesignSystem.borderRadius.full};
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${KBDesignSystem.typography.fontSize.xxs};
  font-weight: ${KBDesignSystem.typography.fontWeight.bold};
  color: ${KBDesignSystem.colors.text.primary};
  border: 2px solid ${KBDesignSystem.colors.background.white};
  box-shadow: ${KBDesignSystem.shadows.xs};
`;
interface QuickAccessItem {
  title: string;
  subtitle: string;
  icon: string;
  bgColor: string;
  onClick?: () => void;
}
interface QuickAccessGridProps {
  items?: QuickAccessItem[];
  className?: string;
  // Enhanced touch feedback options
  touchFeedback?: Partial<TouchFeedbackOptions>;
  disableTouchFeedback?: boolean;
}
const defaultItems: QuickAccessItem[] = [
  { 
    title: '오늘의 걸음', 
    subtitle: '연동하기 ›', 
    icon: '🚶', 
    bgColor: KBDesignSystem.colors.secondary.blueLight 
  },
  { 
    title: '용돈 받기', 
    subtitle: '매일 랜덤 ›', 
    icon: '🐷', 
    bgColor: '#FFE8E8' 
  },
  { 
    title: '식물 키우기', 
    subtitle: '포인트', 
    icon: '🌱', 
    bgColor: '#F0FFF0' 
  },
  { 
    title: '포인트', 
    subtitle: '', 
    icon: 'P', 
    bgColor: KBDesignSystem.colors.primary.yellowLight 
  }
];
export const QuickAccessGrid: React.FC<QuickAccessGridProps> = React.memo(({
  items = defaultItems,
  className,
  touchFeedback,
  disableTouchFeedback = false
}) => {
  // Enhanced touch feedback configuration for quick access cards
  const defaultTouchFeedback: TouchFeedbackOptions = {
    type: 'ripple',
    intensity: 'medium',
    haptic: true,
    androidOptimized: true,
    color: KBDesignSystem.colors.primary.yellowAlpha30,
    duration: 300
  };

  const finalTouchFeedback = { ...defaultTouchFeedback, ...touchFeedback };

  // Create individual touch feedback hooks for each card
  const cardTouchFeedback = useTouchFeedback(disableTouchFeedback ? undefined : finalTouchFeedback);
  const renderIcon = (item: QuickAccessItem, _index: number) => {
    // 용돈 받기 카드의 특별 아이콘 처리
    if (item.icon === '🐷') {
      return (
        <SpecialIcon>
          🐷
          <PiggyBankBadge>P</PiggyBankBadge>
        </SpecialIcon>
      );
    }
    return item.icon;
  };

  const handleCardClick = (item: QuickAccessItem, index: number) => {
    // Enhanced haptic feedback based on card type
    if (!disableTouchFeedback) {
      // Different feedback for different card types
      if (item.icon === 'P') {
        hapticFeedback.touchFeedback('success'); // Points card gets success feedback
      } else if (item.icon === '🐷') {
        hapticFeedback.touchFeedback('medium'); // Money pig gets medium feedback
      } else {
        hapticFeedback.touchFeedback('light'); // Other cards get light feedback
      }
    }

    // Call the original onClick handler
    if (item.onClick) {
      item.onClick();
    }
  };
  return (
    <QuickAccessContainer className={className}>
      {items.map((item, index) => (
        <QuickAccessCard
          key={index}
          $animationIndex={index}
          $bgColor={item.bgColor}
          onClick={() => handleCardClick(item, index)}
          // Enhanced touch feedback integration
          {...(disableTouchFeedback ? {} : cardTouchFeedback)}
          style={!disableTouchFeedback ? cardTouchFeedback.style : {}}
        >
          <QuickAccessContent>
            <QuickAccessTitle>{item.title}</QuickAccessTitle>
            <QuickAccessSubtitle>{item.subtitle}</QuickAccessSubtitle>
          </QuickAccessContent>
          <QuickAccessIcon $isPoint={item.icon === 'P'}>
            {renderIcon(item, index)}
          </QuickAccessIcon>
        </QuickAccessCard>
      ))}
    </QuickAccessContainer>
  );
});

QuickAccessGrid.displayName = 'QuickAccessGrid';
export default QuickAccessGrid;