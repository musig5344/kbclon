import React from 'react';

import styled from 'styled-components';

import { KBDesignSystem } from '../../../styles/tokens/kb-design-system';

const AssetsSection = styled.section`
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

const AssetsContent = styled.div`
  text-align: center;
  padding: ${KBDesignSystem.spacing.xl} 0;
`;

const AssetsMessage = styled.div`
  color: ${KBDesignSystem.colors.text.secondary};
  font-size: ${KBDesignSystem.typography.fontSize.base};
  font-weight: ${KBDesignSystem.typography.fontWeight.medium};
  margin-bottom: ${KBDesignSystem.spacing.xs};
`;

const AssetsSubMessage = styled.div`
  color: ${KBDesignSystem.colors.text.tertiary};
  font-size: ${KBDesignSystem.typography.fontSize.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${KBDesignSystem.spacing.xs};
`;

const ArrowIcon = styled.span`
  color: ${KBDesignSystem.colors.text.secondary};
  font-size: ${KBDesignSystem.typography.fontSize.lg};
`;

interface MyAssetsSectionProps {
  className?: string;
}

export const MyAssetsSection: React.FC<MyAssetsSectionProps> = ({ className }) => {
  return (
    <AssetsSection className={className}>
      <SectionHeader>
        <SectionTitle>나의 총자산</SectionTitle>
      </SectionHeader>
      <AssetsContent>
        <AssetsMessage>지금까지 모은 자산은 얼마일까요?</AssetsMessage>
        <AssetsSubMessage>
          우리 아이 금융상품 
          <ArrowIcon>〉</ArrowIcon>
        </AssetsSubMessage>
      </AssetsContent>
    </AssetsSection>
  );
};

export default MyAssetsSection;