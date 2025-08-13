import React from 'react';

import styled, { css } from 'styled-components';

import { MEDIA_QUERIES } from '../../styles/breakpoints';
import { createResponsiveText } from '../../styles/responsive-system';
import { tokens } from '../../styles/tokens';
// Typography 컴포넌트 Props 타입
export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?:
    | 'displayLarge'
    | 'displayMedium'
    | 'displaySmall'
    | 'headlineLarge'
    | 'headlineMedium'
    | 'headlineSmall'
    | 'titleLarge'
    | 'titleMedium'
    | 'titleSmall'
    | 'bodyLarge'
    | 'bodyMedium'
    | 'bodySmall'
    | 'labelLarge'
    | 'labelMedium'
    | 'labelSmall';
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  color?: keyof typeof tokens.colors.text;
  align?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: keyof typeof tokens.typography.lineHeight;
  letterSpacing?: string;
  as?: React.ElementType;
  truncate?: boolean;
}
// KB 앱 85% 스케일 적용된 반응형 텍스트 변형별 스타일
const typographyVariants = {
  displayLarge: css`
    ${createResponsiveText('h1')}
    font-weight: ${tokens.typography.fontWeight.bold};
    letter-spacing: ${tokens.typography.letterSpacing.display};
  `,
  displayMedium: css`
    ${createResponsiveText('h1')}
    font-weight: ${tokens.typography.fontWeight.bold};
    letter-spacing: ${tokens.typography.letterSpacing.display};

    ${MEDIA_QUERIES.phoneSmall} {
      font-size: 20px;
    }
    ${MEDIA_QUERIES.phoneMedium} {
      font-size: 22px;
    }
    ${MEDIA_QUERIES.tablet} {
      font-size: 26px;
    }
  `,
  displaySmall: css`
    ${createResponsiveText('h2')}
    font-weight: ${tokens.typography.fontWeight.bold};
    letter-spacing: ${tokens.typography.letterSpacing.display};
  `,
  headlineLarge: css`
    ${createResponsiveText('h2')}
    font-weight: ${tokens.typography.fontWeight.semibold};
    letter-spacing: ${tokens.typography.letterSpacing.headline};
  `,
  headlineMedium: css`
    ${createResponsiveText('h2')}
    font-weight: ${tokens.typography.fontWeight.semibold};
    letter-spacing: ${tokens.typography.letterSpacing.headline};

    ${MEDIA_QUERIES.phoneSmall} {
      font-size: 16px;
    }
    ${MEDIA_QUERIES.tablet} {
      font-size: 20px;
    }
  `,
  headlineSmall: css`
    ${createResponsiveText('h3')}
    font-weight: ${tokens.typography.fontWeight.semibold};
    letter-spacing: ${tokens.typography.letterSpacing.headline};
  `,
  titleLarge: css`
    ${createResponsiveText('h3')}
    font-weight: ${tokens.typography.fontWeight.semibold};
    letter-spacing: ${tokens.typography.letterSpacing.titleLarge};
  `,
  titleMedium: css`
    ${createResponsiveText('h3')}
    font-weight: ${tokens.typography.fontWeight.semibold};
    letter-spacing: ${tokens.typography.letterSpacing.titleMedium};

    ${MEDIA_QUERIES.phoneSmall} {
      font-size: 15px;
    }
    ${MEDIA_QUERIES.tablet} {
      font-size: 18px;
    }
  `,
  titleSmall: css`
    ${createResponsiveText('body')}
    font-weight: ${tokens.typography.fontWeight.medium};
    letter-spacing: ${tokens.typography.letterSpacing.titleSmall};

    ${MEDIA_QUERIES.phoneSmall} {
      font-size: 14px;
    }
    ${MEDIA_QUERIES.tablet} {
      font-size: 16px;
    }
  `,
  bodyLarge: css`
    ${createResponsiveText('body')}
    font-weight: ${tokens.typography.fontWeight.regular};
    letter-spacing: ${tokens.typography.letterSpacing.body};

    ${MEDIA_QUERIES.phoneSmall} {
      font-size: 14px;
    }
    ${MEDIA_QUERIES.tablet} {
      font-size: 16px;
    }
  `,
  bodyMedium: css`
    ${createResponsiveText('body')}
    font-weight: ${tokens.typography.fontWeight.regular};
    letter-spacing: ${tokens.typography.letterSpacing.body};
  `,
  bodySmall: css`
    ${createResponsiveText('caption')}
    font-weight: ${tokens.typography.fontWeight.regular};
    letter-spacing: ${tokens.typography.letterSpacing.body};
  `,
  labelLarge: css`
    ${createResponsiveText('body')}
    font-weight: ${tokens.typography.fontWeight.medium};
    letter-spacing: ${tokens.typography.letterSpacing.label};
  `,
  labelMedium: css`
    ${createResponsiveText('caption')}
    font-weight: ${tokens.typography.fontWeight.medium};
    letter-spacing: ${tokens.typography.letterSpacing.label};
  `,
  labelSmall: css`
    ${createResponsiveText('caption')}
    font-weight: ${tokens.typography.fontWeight.medium};
    letter-spacing: ${tokens.typography.letterSpacing.label};
  `,
};
// 폰트 가중치 매핑
const fontWeights = {
  light: tokens.typography.fontWeight.light,
  regular: tokens.typography.fontWeight.regular,
  medium: tokens.typography.fontWeight.medium,
  semibold: tokens.typography.fontWeight.semibold,
  bold: tokens.typography.fontWeight.bold,
};
// 스타일드 Typography 컴포넌트
const StyledTypography = styled.span<TypographyProps>`
  /* 기본 스타일 */
  font-family: ${tokens.typography.fontFamily.base};
  margin: 0;
  /* 변형 스타일 적용 */
  ${({ variant = 'bodyMedium' }) => typographyVariants[variant]}
  /* 폰트 가중치 오버라이드 */
  ${({ weight }) =>
    weight &&
    css`
      font-weight: ${fontWeights[weight]};
    `}
  /* 색상 적용 */
  ${({ color = 'primary' }) => css`
    color: ${tokens.colors.text[color]};
  `}
  /* 텍스트 정렬 */
  ${({ align }) =>
    align &&
    css`
      text-align: ${align};
    `}
  /* 줄 간격 오버라이드 */
  ${({ lineHeight }) =>
    lineHeight &&
    css`
      line-height: ${tokens.typography.lineHeight[lineHeight]};
    `}
  /* 글자 간격 오버라이드 */
  ${({ letterSpacing }) =>
    letterSpacing &&
    css`
      letter-spacing: ${letterSpacing};
    `}
  /* 텍스트 말줄임 */
  ${({ truncate }) =>
    truncate &&
    css`
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `}
`;
/**
 * KB StarBanking Typography 컴포넌트
 * 원본 XML 명세를 정확히 구현한 타이포그래피 시스템
 */
export const Typography: React.FC<TypographyProps> = ({
  variant = 'bodyMedium',
  weight,
  color = 'primary',
  align,
  lineHeight,
  letterSpacing,
  as,
  truncate = false,
  children,
  ...props
}) => {
  // variant에 따른 기본 HTML 태그 결정
  const getDefaultTag = (variant: string): React.ElementType => {
    if (variant.includes('display')) return 'h1';
    if (variant.includes('headline')) return 'h2';
    if (variant.includes('title')) return 'h3';
    if (variant.includes('label')) return 'span';
    return 'p';
  };
  const component = as || getDefaultTag(variant);
  return (
    <StyledTypography
      as={component}
      variant={variant}
      weight={weight}
      color={color}
      align={align}
      lineHeight={lineHeight}
      letterSpacing={letterSpacing}
      truncate={truncate}
      {...props}
    >
      {children}
    </StyledTypography>
  );
};
// 미리 정의된 Typography 변형들
export const DisplayLarge: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='displayLarge' {...props} />
);
export const DisplayMedium: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='displayMedium' {...props} />
);
export const DisplaySmall: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='displaySmall' {...props} />
);
export const HeadlineLarge: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='headlineLarge' {...props} />
);
export const HeadlineMedium: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='headlineMedium' {...props} />
);
export const HeadlineSmall: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='headlineSmall' {...props} />
);
export const TitleLarge: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='titleLarge' {...props} />
);
export const TitleMedium: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='titleMedium' {...props} />
);
export const TitleSmall: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='titleSmall' {...props} />
);
export const BodyLarge: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='bodyLarge' {...props} />
);
export const BodyMedium: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='bodyMedium' {...props} />
);
export const BodySmall: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='bodySmall' {...props} />
);
export const LabelLarge: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='labelLarge' {...props} />
);
export const LabelMedium: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='labelMedium' {...props} />
);
export const LabelSmall: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='labelSmall' {...props} />
);
// 특화된 텍스트 컴포넌트들
export const PageTitle: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='titleLarge' color='primary' {...props} />
);
export const SectionTitle: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='titleMedium' color='primary' {...props} />
);
export const HelperText: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='labelMedium' color='tertiary' {...props} />
);
export const ErrorText: React.FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='labelMedium' color='error' {...props} />
);
// 금액 표시 특화 컴포넌트
const AmountText = styled(Typography)<{ type?: 'income' | 'expense' | 'neutral' }>`
  font-family: ${tokens.typography.fontFamily.monospace};
  font-weight: ${tokens.typography.fontWeight.semibold};
  ${({ type }) => {
    if (type === 'income')
      return css`
        color: ${tokens.colors.functional.income};
      `;
    if (type === 'expense')
      return css`
        color: ${tokens.colors.functional.expense};
      `;
    return css`
      color: ${tokens.colors.functional.neutral};
    `;
  }}
`;
export interface AmountProps extends Omit<TypographyProps, 'color'> {
  amount: number;
  currency?: string;
  type?: 'income' | 'expense' | 'neutral';
  showSign?: boolean;
}
export const Amount: React.FC<AmountProps> = ({
  amount,
  currency = '원',
  type = 'neutral',
  showSign = false,
  ...props
}) => {
  const formatAmount = (value: number) => {
    const absValue = Math.abs(value);
    const sign = showSign && value !== 0 ? (value > 0 ? '+' : '-') : '';
    return `${sign}${absValue.toLocaleString()}${currency}`;
  };
  return (
    <AmountText type={type} {...props}>
      {formatAmount(amount)}
    </AmountText>
  );
};
export default Typography;
