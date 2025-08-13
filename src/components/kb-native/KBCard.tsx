/**
 * KB스타뱅킹 네이티브 느낌 카드 컴포넌트
 * 원본 앱과 100% 동일한 카드 UI
 */

import React from 'react';

import styled, { css } from 'styled-components';

import { KBDesignSystem } from '../../styles/tokens/kb-design-system';

// 카드 타입
type CardVariant = 'default' | 'account' | 'menu' | 'notification' | 'product';
type CardSize = 'small' | 'medium' | 'large' | 'full';

interface KBCardProps {
  variant?: CardVariant;
  size?: CardSize;
  title?: string;
  subtitle?: string;
  description?: string;
  amount?: string;
  amountLabel?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

// 카드 컨테이너
const CardContainer = styled.div<{
  $variant: CardVariant;
  $size: CardSize;
  $clickable: boolean;
  $selected: boolean;
  $disabled: boolean;
}>`
  position: relative;
  background-color: ${KBDesignSystem.colors.background.white};
  border-radius: ${KBDesignSystem.borderRadius.card};
  overflow: hidden;
  transition: all ${KBDesignSystem.animation.duration.fast}
    ${KBDesignSystem.animation.easing.easeOut};

  /* 그림자 */
  box-shadow: ${({ $variant }) => ($variant === 'menu' ? 'none' : KBDesignSystem.shadows.card)};

  /* 테두리 */
  border: 1px solid
    ${({ $selected, $variant }) =>
      $selected
        ? KBDesignSystem.colors.primary.yellow
        : $variant === 'menu'
          ? KBDesignSystem.colors.border.light
          : 'transparent'};

  /* 사이즈별 스타일 */
  ${({ $size }) => {
    const sizeStyles = {
      small: css`
        padding: ${KBDesignSystem.spacing.md};
      `,
      medium: css`
        padding: ${KBDesignSystem.spacing.base};
      `,
      large: css`
        padding: ${KBDesignSystem.spacing.lg};
      `,
      full: css`
        padding: ${KBDesignSystem.spacing.xl};
      `,
    };
    return sizeStyles[$size];
  }}

  /* 클릭 가능 스타일 */
  ${({ $clickable, $disabled }) =>
    $clickable &&
    !$disabled &&
    css`
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;

      &:hover {
        transform: translateY(-2px);
        box-shadow: ${KBDesignSystem.shadows.lg};
      }

      &:active {
        transform: translateY(0);
        box-shadow: ${KBDesignSystem.shadows.sm};
      }
    `}
  
  /* 비활성화 상태 */
  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.5;
      cursor: not-allowed;
    `}
  
  /* 변형별 특수 스타일 */
  ${({ $variant }) => {
    const variantStyles = {
      default: css``,
      account: css`
        background: linear-gradient(
          135deg,
          ${KBDesignSystem.colors.background.white} 0%,
          ${KBDesignSystem.colors.primary.yellowLight} 100%
        );
      `,
      menu: css`
        padding: ${KBDesignSystem.spacing.base};
        border-radius: ${KBDesignSystem.borderRadius.md};
      `,
      notification: css`
        border-left: 4px solid ${KBDesignSystem.colors.primary.yellow};
      `,
      product: css`
        background-color: ${KBDesignSystem.colors.background.gray100};
      `,
    };
    return variantStyles[$variant];
  }}
`;

// 카드 헤더
const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${KBDesignSystem.spacing.md};
  margin-bottom: ${KBDesignSystem.spacing.sm};
`;

// 아이콘 래퍼
const IconWrapper = styled.div<{ $variant: CardVariant }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ $variant }) => ($variant === 'menu' ? '32px' : '40px')};
  height: ${({ $variant }) => ($variant === 'menu' ? '32px' : '40px')};
  background-color: ${({ $variant }) =>
    $variant === 'menu' ? 'transparent' : KBDesignSystem.colors.primary.yellowLight};
  border-radius: ${KBDesignSystem.borderRadius.full};
  color: ${({ $variant }) =>
    $variant === 'menu'
      ? KBDesignSystem.colors.text.secondary
      : KBDesignSystem.colors.primary.yellow};
  font-size: ${({ $variant }) => ($variant === 'menu' ? '20px' : '24px')};
`;

// 타이틀 섹션
const TitleSection = styled.div`
  flex: 1;
`;

// 타이틀
const Title = styled.h3<{ $variant: CardVariant }>`
  margin: 0;
  font-size: ${({ $variant }) =>
    $variant === 'menu'
      ? KBDesignSystem.typography.fontSize.base
      : KBDesignSystem.typography.fontSize.md};
  font-weight: ${KBDesignSystem.typography.fontWeight.semibold};
  color: ${KBDesignSystem.colors.text.primary};
  line-height: ${KBDesignSystem.typography.lineHeight.tight};
`;

// 서브타이틀
const Subtitle = styled.div`
  margin-top: ${KBDesignSystem.spacing.xxs};
  font-size: ${KBDesignSystem.typography.fontSize.sm};
  color: ${KBDesignSystem.colors.text.secondary};
`;

// 배지
const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 ${KBDesignSystem.spacing.xs};
  background-color: ${KBDesignSystem.colors.status.error};
  color: ${KBDesignSystem.colors.text.inverse};
  font-size: ${KBDesignSystem.typography.fontSize.xxs};
  font-weight: ${KBDesignSystem.typography.fontWeight.bold};
  border-radius: ${KBDesignSystem.borderRadius.full};
`;

// 카드 바디
const CardBody = styled.div`
  margin-top: ${KBDesignSystem.spacing.md};
`;

// 설명
const Description = styled.p`
  margin: 0;
  font-size: ${KBDesignSystem.typography.fontSize.sm};
  color: ${KBDesignSystem.colors.text.secondary};
  line-height: ${KBDesignSystem.typography.lineHeight.normal};
`;

// 금액 섹션
const AmountSection = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: ${KBDesignSystem.spacing.base};
`;

// 금액 라벨
const AmountLabel = styled.span`
  font-size: ${KBDesignSystem.typography.fontSize.sm};
  color: ${KBDesignSystem.colors.text.tertiary};
`;

// 금액
const Amount = styled.span<{ $negative?: boolean }>`
  font-size: ${KBDesignSystem.typography.fontSize.xl};
  font-weight: ${KBDesignSystem.typography.fontWeight.bold};
  color: ${({ $negative }) =>
    $negative ? KBDesignSystem.colors.status.error : KBDesignSystem.colors.text.primary};
`;

// 카드 풋터 (액션 버튼)
const CardFooter = styled.div`
  display: flex;
  gap: ${KBDesignSystem.spacing.sm};
  margin-top: ${KBDesignSystem.spacing.base};
  padding-top: ${KBDesignSystem.spacing.base};
  border-top: 1px solid ${KBDesignSystem.colors.border.light};
`;

// 화살표 아이콘
const ArrowIcon = styled.div`
  position: absolute;
  right: ${KBDesignSystem.spacing.base};
  top: 50%;
  transform: translateY(-50%);
  color: ${KBDesignSystem.colors.text.tertiary};

  &::after {
    content: '>';
    font-size: ${KBDesignSystem.typography.fontSize.lg};
  }
`;

export const KBCard: React.FC<KBCardProps> = ({
  variant = 'default',
  size = 'medium',
  title,
  subtitle,
  description,
  amount,
  amountLabel,
  icon,
  badge,
  onClick,
  selected = false,
  disabled = false,
  children,
  actions,
}) => {
  const isClickable = Boolean(onClick);
  const isNegativeAmount = amount && amount.startsWith('-');

  return (
    <CardContainer
      $variant={variant}
      $size={size}
      $clickable={isClickable}
      $selected={selected}
      $disabled={disabled}
      onClick={disabled ? undefined : onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable && !disabled ? 0 : undefined}
    >
      {/* 헤더 영역 */}
      {(icon || title || subtitle || badge) && (
        <CardHeader>
          {icon && <IconWrapper $variant={variant}>{icon}</IconWrapper>}

          {(title || subtitle) && (
            <TitleSection>
              {title && <Title $variant={variant}>{title}</Title>}
              {subtitle && <Subtitle>{subtitle}</Subtitle>}
            </TitleSection>
          )}

          {badge && <Badge>{badge}</Badge>}
        </CardHeader>
      )}

      {/* 바디 영역 */}
      {(description || amount || children) && (
        <CardBody>
          {description && <Description>{description}</Description>}

          {amount && (
            <AmountSection>
              {amountLabel && <AmountLabel>{amountLabel}</AmountLabel>}
              <Amount $negative={isNegativeAmount}>{amount}</Amount>
            </AmountSection>
          )}

          {children}
        </CardBody>
      )}

      {/* 풋터 영역 */}
      {actions && <CardFooter>{actions}</CardFooter>}

      {/* 화살표 (메뉴 카드) */}
      {variant === 'menu' && isClickable && <ArrowIcon />}
    </CardContainer>
  );
};

// 카드 그룹 컴포넌트
export const KBCardGroup = styled.div<{ $gap?: 'small' | 'medium' | 'large' }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap = 'medium' }) => {
    const gaps = {
      small: KBDesignSystem.spacing.sm,
      medium: KBDesignSystem.spacing.md,
      large: KBDesignSystem.spacing.base,
    };
    return gaps[$gap];
  }};
`;

// 계좌 카드 특화 컴포넌트
export const KBAccountCard = styled(KBCard).attrs({ variant: 'account' })`
  /* 계좌 카드 특별 스타일 */
  position: relative;
  overflow: visible;

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(
      45deg,
      ${KBDesignSystem.colors.primary.yellow},
      ${KBDesignSystem.colors.secondary.blue}
    );
    border-radius: ${KBDesignSystem.borderRadius.card};
    opacity: 0;
    z-index: -1;
    transition: opacity ${KBDesignSystem.animation.duration.normal}
      ${KBDesignSystem.animation.easing.easeOut};
  }

  &:hover::before {
    opacity: 0.3;
  }
`;

export default KBCard;
