import React from 'react';

import styled from 'styled-components';

import { KBDesignSystem } from '../../../styles/tokens/kb-design-system';

/**
 * KB 스타뱅킹 추천 서비스 섹션 (원본 앱 100% 동일 구현)
 * - KB금융그룹 계열사 상품까지 한번에!
 * - 홈 화면 계좌와 알림을 바로 확인
 * - 7,500원에 10GB 든든하게!
 * - 공지사항
 */
const RecommendedSection = styled.section`
  background: ${KBDesignSystem.colors.background.gray100};
  padding: ${KBDesignSystem.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.lg};
  font-weight: ${KBDesignSystem.typography.fontWeight.bold};
  color: ${KBDesignSystem.colors.text.primary};
  margin: 0 0 ${KBDesignSystem.spacing.lg} 0;
`;

const ServicesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${KBDesignSystem.spacing.md};
`;

const ServiceCard = styled.div<{ $variant?: 'default' | 'notice' }>`
  background: ${KBDesignSystem.colors.background.white};
  border-radius: ${KBDesignSystem.borderRadius.card};
  padding: ${KBDesignSystem.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${KBDesignSystem.spacing.md};
  cursor: pointer;
  transition: all ${KBDesignSystem.animation.duration.normal}
    ${KBDesignSystem.animation.easing.easeOut};
  box-shadow: ${KBDesignSystem.shadows.sm};
  border: ${props => (props.$variant === 'notice' ? '1px solid #E0E0E0' : 'none')};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${KBDesignSystem.shadows.lg};
  }
`;

const ServiceIcon = styled.div<{ $iconType: string }>`
  width: 48px;
  height: 48px;
  border-radius: ${KBDesignSystem.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: ${props => {
    switch (props.$iconType) {
      case 'percentage':
        return 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
      case 'home':
        return 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)';
      case 'data':
        return 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)';
      case 'notice':
        return '#E0E0E0';
      default:
        return KBDesignSystem.colors.primary.yellow;
    }
  }};
  color: ${props => (props.$iconType === 'notice' ? '#666' : 'white')};
  position: relative;

  ${props =>
    props.$iconType === 'data' &&
    `
    &::after {
      content: '10GB';
      position: absolute;
      bottom: -2px;
      right: -2px;
      background: #FF5722;
      color: white;
      font-size: 8px;
      font-weight: bold;
      padding: 1px 3px;
      border-radius: 3px;
      border: 1px solid white;
    }
  `}
`;

const ServiceContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${KBDesignSystem.spacing.xs};
`;

const ServiceTitle = styled.h3`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.base};
  font-weight: ${KBDesignSystem.typography.fontWeight.bold};
  color: ${KBDesignSystem.colors.text.primary};
  margin: 0;
  line-height: ${KBDesignSystem.typography.lineHeight.tight};
`;

const ServiceSubtitle = styled.p`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.sm};
  font-weight: ${KBDesignSystem.typography.fontWeight.regular};
  color: ${KBDesignSystem.colors.text.secondary};
  margin: 0;
  line-height: ${KBDesignSystem.typography.lineHeight.normal};
`;

const NoticeTag = styled.div`
  background: #666;
  color: white;
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.xs};
  font-weight: ${KBDesignSystem.typography.fontWeight.bold};
  padding: 4px 8px;
  border-radius: ${KBDesignSystem.borderRadius.sm};
  align-self: flex-start;
`;

interface RecommendedServicesProps {
  className?: string;
}

export const RecommendedServices: React.FC<RecommendedServicesProps> = ({ className }) => {
  const services = [
    {
      id: 'kb-group',
      icon: '📊',
      iconType: 'percentage' as const,
      title: 'KB금융그룹 계열사 상품까지 한번에!',
      subtitle: '내게 맞는 대출 찾기',
    },
    {
      id: 'home-screen',
      icon: '🏠',
      iconType: 'home' as const,
      title: '홈 화면 계좌와 알림을 바로 확인',
      subtitle: '빠른 로그인 설정하기',
    },
    {
      id: 'data-plan',
      icon: '📶',
      iconType: 'data' as const,
      title: '7,500원에 10GB 든든하게!',
      subtitle: '가입도 간단해서 걱정 없어요',
    },
  ];

  return (
    <RecommendedSection className={className}>
      <SectionTitle>추천 서비스</SectionTitle>
      <ServicesList>
        {services.map(service => (
          <ServiceCard key={service.id}>
            <ServiceIcon $iconType={service.iconType}>{service.icon}</ServiceIcon>
            <ServiceContent>
              <ServiceTitle>{service.title}</ServiceTitle>
              <ServiceSubtitle>{service.subtitle}</ServiceSubtitle>
            </ServiceContent>
          </ServiceCard>
        ))}

        {/* 공지사항 카드 */}
        <ServiceCard $variant='notice'>
          <NoticeTag>공지</NoticeTag>
          <ServiceContent>
            <ServiceTitle>'민생회복 소비쿠폰' 사업 운영에 주의하세요!</ServiceTitle>
          </ServiceContent>
        </ServiceCard>
      </ServicesList>
    </RecommendedSection>
  );
};

export default RecommendedServices;
