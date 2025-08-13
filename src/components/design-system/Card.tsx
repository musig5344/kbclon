import React from 'react';

import styled, { css } from 'styled-components';

import { MEDIA_QUERIES } from '../../styles/breakpoints';
import { createResponsiveCard, KB_DESIGN_TOKENS } from '../../styles/responsive-system';
import { tokens } from '../../styles/tokens';
// Card 컴포넌트 Props 타입
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'basic' | 'elevated' | 'outlined' | 'account';
  size?: 'small' | 'medium' | 'large' | 'xl';
  interactive?: boolean;
  fullWidth?: boolean;
}
// Card Header Props
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}
// Card Content Props
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
// Card Actions Props
export interface CardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'center' | 'end' | 'space-between';
}
// KB 앱 85% 스케일 적용된 반응형 Card 변형별 스타일
const cardVariants = {
  basic: css`
    background: ${KB_DESIGN_TOKENS.colors.background};
    border: 1px solid ${KB_DESIGN_TOKENS.colors.surfaceVariant};
    box-shadow: none;
  `,
  elevated: css`
    background: ${KB_DESIGN_TOKENS.colors.background};
    border: none;
    box-shadow: ${KB_DESIGN_TOKENS.shadows.card};
  `,
  outlined: css`
    background: ${KB_DESIGN_TOKENS.colors.background};
    border: 2px solid ${KB_DESIGN_TOKENS.colors.primary};
    box-shadow: none;
  `,
  account: css`
    background: linear-gradient(
      135deg,
      ${KB_DESIGN_TOKENS.colors.background} 0%,
      ${KB_DESIGN_TOKENS.colors.surface} 100%
    );
    border: 1px solid ${KB_DESIGN_TOKENS.colors.surfaceVariant};
    box-shadow: ${KB_DESIGN_TOKENS.shadows.card};
  `,
};
// Card 크기별 스타일
const cardSizes = {
  small: css`
    padding: ${tokens.sizes.card.paddingSmall};
  `,
  medium: css`
    padding: ${tokens.sizes.card.paddingMedium};
  `,
  large: css`
    padding: ${tokens.sizes.card.paddingLarge};
  `,
  xl: css`
    padding: ${tokens.sizes.card.paddingXL};
  `,
};
// KB 앱 완전 반응형 스타일드 Card 컴포넌트
const StyledCard = styled.div<CardProps>`
  /* KB 앱 반응형 카드 기본 스타일 */
  ${createResponsiveCard('low')}
  border-radius: ${KB_DESIGN_TOKENS.borderRadius.large};
  transition: all 0.2s ease;

  /* 크기 스타일 적용 */
  ${({ size = 'medium' }) => cardSizes[size]}
  /* 변형 스타일 적용 */
  ${({ variant = 'basic' }) => cardVariants[variant]}
  
  /* 전체 너비 옵션 */
  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}
  
  /* 반응형 인터랙티브 옵션 */
  ${({ interactive }) =>
    interactive &&
    css`
      cursor: pointer;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;

      /* 마우스 디바이스에서만 호버 효과 */
      ${MEDIA_QUERIES.mouse} {
        &:hover {
          transform: translateY(-2px);
          box-shadow: ${KB_DESIGN_TOKENS.shadows.button};
        }
      }

      /* 터치 디바이스에서 터치 피드백 */
      ${MEDIA_QUERIES.touch} {
        &:active {
          transform: scale(0.98);
          transition-duration: 0.1s;
        }
      }
    `}
  
  /* 폴더블 기기 최적화 */
  ${MEDIA_QUERIES.foldableClosed} {
    margin: ${KB_DESIGN_TOKENS.spacing.xs} ${KB_DESIGN_TOKENS.spacing.sm};
    padding: ${KB_DESIGN_TOKENS.spacing.sm};
  }

  /* 태블릿에서 중앙 정렬 */
  ${MEDIA_QUERIES.tablet} {
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
`;
// Card Header 스타일
const StyledCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${tokens.sizes.card.titleSpacing};
  &:last-child {
    margin-bottom: 0;
  }
`;
const CardHeaderContent = styled.div`
  flex: 1;
  min-width: 0; /* 텍스트 오버플로우 방지 */
`;
const CardTitle = styled.h3`
  font-size: ${tokens.typography.fontSize.titleMedium};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.text.primary};
  line-height: ${tokens.typography.lineHeight.title};
  margin: 0 0 ${tokens.spacing[1]} 0;
`;
const CardSubtitle = styled.p`
  font-size: ${tokens.typography.fontSize.bodySmall};
  font-weight: ${tokens.typography.fontWeight.regular};
  color: ${tokens.colors.text.secondary};
  line-height: ${tokens.typography.lineHeight.body};
  margin: 0;
`;
const CardHeaderAction = styled.div`
  margin-left: ${tokens.spacing[4]};
  flex-shrink: 0;
`;
// Card Content 스타일
const StyledCardContent = styled.div`
  margin-bottom: ${tokens.sizes.card.contentSpacing};
  &:last-child {
    margin-bottom: 0;
  }
`;
// Card Actions 스타일
const StyledCardActions = styled.div<{ justify?: 'start' | 'center' | 'end' | 'space-between' }>`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[2]};
  margin-top: ${tokens.sizes.card.actionSpacing};
  ${({ justify = 'end' }) => {
    const justifyContent = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      'space-between': 'space-between',
    };
    return css`
      justify-content: ${justifyContent[justify]};
    `;
  }}
  &:first-child {
    margin-top: 0;
  }
`;
/**
 * KB StarBanking Card 컴포넌트
 * 원본 XML 명세를 정확히 구현한 카드 시스템
 */
export const Card: React.FC<CardProps> = ({
  variant = 'basic',
  size = 'medium',
  interactive = false,
  fullWidth = false,
  children,
  ...props
}) => {
  return (
    <StyledCard
      variant={variant}
      size={size}
      interactive={interactive}
      fullWidth={fullWidth}
      {...props}
    >
      {children}
    </StyledCard>
  );
};
/**
 * Card Header 컴포넌트
 */
export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  children,
  ...props
}) => {
  return (
    <StyledCardHeader {...props}>
      <CardHeaderContent>
        {title && <CardTitle>{title}</CardTitle>}
        {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
        {children}
      </CardHeaderContent>
      {action && <CardHeaderAction>{action}</CardHeaderAction>}
    </StyledCardHeader>
  );
};
/**
 * Card Content 컴포넌트
 */
export const CardContent: React.FC<CardContentProps> = ({ children, ...props }) => {
  return <StyledCardContent {...props}>{children}</StyledCardContent>;
};
/**
 * Card Actions 컴포넌트
 */
export const CardActions: React.FC<CardActionsProps> = ({
  justify = 'end',
  children,
  ...props
}) => {
  return (
    <StyledCardActions justify={justify} {...props}>
      {children}
    </StyledCardActions>
  );
};
// 특화된 Account Card 컴포넌트
const AccountCardBalance = styled.div`
  font-size: ${tokens.typography.fontSize.displaySmall};
  font-weight: ${tokens.typography.fontWeight.bold};
  color: ${tokens.colors.text.primary};
  line-height: ${tokens.typography.lineHeight.display};
  letter-spacing: ${tokens.typography.letterSpacing.display};
  margin-bottom: ${tokens.spacing[1]};
`;
const AccountCardNumber = styled.div`
  font-size: ${tokens.typography.fontSize.bodyMedium};
  color: ${tokens.colors.text.secondary};
  font-family: ${tokens.typography.fontFamily.monospace};
  letter-spacing: 0.5px;
`;
const AccountCardType = styled.div`
  font-size: ${tokens.typography.fontSize.bodySmall};
  color: ${tokens.colors.text.tertiary};
  margin-bottom: ${tokens.spacing[2]};
`;
export interface AccountCardProps extends Omit<CardProps, 'variant'> {
  accountType?: string;
  accountNumber?: string;
  balance?: number;
  currency?: string;
}
/**
 * Account Card 특화 컴포넌트
 */
export const AccountCard: React.FC<AccountCardProps> = ({
  accountType,
  accountNumber,
  balance,
  currency = '원',
  children,
  ...props
}) => {
  return (
    <Card variant='account' {...props}>
      {accountType && <AccountCardType>{accountType}</AccountCardType>}
      {accountNumber && <AccountCardNumber>{accountNumber}</AccountCardNumber>}
      {balance !== undefined && (
        <AccountCardBalance>
          {balance.toLocaleString()}
          {currency}
        </AccountCardBalance>
      )}
      {children}
    </Card>
  );
};
// 미리 정의된 카드 변형들
export const BasicCard: React.FC<Omit<CardProps, 'variant'>> = props => (
  <Card variant='basic' {...props} />
);
export const ElevatedCard: React.FC<Omit<CardProps, 'variant'>> = props => (
  <Card variant='elevated' {...props} />
);
export const OutlinedCard: React.FC<Omit<CardProps, 'variant'>> = props => (
  <Card variant='outlined' {...props} />
);
export default Card;
