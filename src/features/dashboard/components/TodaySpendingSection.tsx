import React from 'react';

import styled from 'styled-components';

import { KBDesignSystem } from '../../../styles/tokens/kb-design-system';

const SpendingSection = styled.section`
  background: ${KBDesignSystem.colors.background.white};
  padding: ${KBDesignSystem.spacing.lg};
  margin-bottom: ${KBDesignSystem.spacing.xs};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${KBDesignSystem.spacing.md};
`;

const SectionTitle = styled.h3`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.lg};
  font-weight: ${KBDesignSystem.typography.fontWeight.semibold};
  color: ${KBDesignSystem.colors.text.primary};
  margin: 0;
`;

const ViewMoreButton = styled.button`
  background: none;
  border: none;
  color: ${KBDesignSystem.colors.text.secondary};
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.sm};
  font-weight: ${KBDesignSystem.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${KBDesignSystem.spacing.xxs};

  &:hover {
    color: ${KBDesignSystem.colors.text.primary};
  }
`;

const SpendingContent = styled.div`
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${KBDesignSystem.colors.text.secondary};
  font-size: ${KBDesignSystem.typography.fontSize.base};
`;

interface TodaySpendingSectionProps {
  className?: string;
}

export const TodaySpendingSection: React.FC<TodaySpendingSectionProps> = ({ className }) => {
  return (
    <SpendingSection className={className}>
      <SectionHeader>
        <SectionTitle>오늘한 지출</SectionTitle>
        <ViewMoreButton>??원 〉</ViewMoreButton>
      </SectionHeader>
      <SpendingContent>오늘 지출 내역이 없습니다.</SpendingContent>
    </SpendingSection>
  );
};

export default TodaySpendingSection;
