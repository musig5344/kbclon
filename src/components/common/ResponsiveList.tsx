/**
 * KB 스타뱅킹 완전 반응형 List 컴포넌트
 * 원본 앱과 85% 스케일 일관성 유지
 * 모든 안드로이드 기기에서 완벽한 리스트 표시
 */

import React, { memo } from 'react';
import styled from 'styled-components';
import { MEDIA_QUERIES } from '../../styles/breakpoints';
import { createResponsiveListItem, KB_DESIGN_TOKENS } from '../../styles/responsive-system';

// List Item Props 타입
export interface ResponsiveListItemProps {
  id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftImage?: string;
  rightContent?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  highlighted?: boolean;
  divider?: boolean;
  compact?: boolean;
  className?: string;
}

// List Props 타입
export interface ResponsiveListProps {
  children: React.ReactNode;
  spacing?: 'none' | 'small' | 'medium' | 'large';
  padding?: boolean;
  className?: string;
}

// KB 앱 완전 반응형 List Container
const ListContainer = styled.div<{ spacing?: 'none' | 'small' | 'medium' | 'large'; padding?: boolean }>`
  width: 100%;
  background: ${KB_DESIGN_TOKENS.colors.background};
  
  ${({ padding }) => padding && `
    padding: 0 ${KB_DESIGN_TOKENS.spacing.md};
    
    ${MEDIA_QUERIES.phoneSmall} {
      padding: 0 ${KB_DESIGN_TOKENS.spacing.sm};
    }
    
    ${MEDIA_QUERIES.tablet} {
      padding: 0 ${KB_DESIGN_TOKENS.spacing.lg};
    }
  `}
  
  ${({ spacing = 'medium' }) => {
    const spacingMap = {
      none: '0',
      small: KB_DESIGN_TOKENS.spacing.xs,
      medium: KB_DESIGN_TOKENS.spacing.sm,
      large: KB_DESIGN_TOKENS.spacing.md
    };
    
    return `
      & > * + * {
        margin-top: ${spacingMap[spacing]};
      }
    `;
  }}
`;

// KB 앱 완전 반응형 List Item
const ListItem = styled.div<{ 
  disabled?: boolean; 
  highlighted?: boolean; 
  clickable?: boolean;
  compact?: boolean;
}>`
  ${createResponsiveListItem()}
  
  /* 컴팩트 모드 */
  ${({ compact }) => compact && `
    min-height: 44px;
    padding: ${KB_DESIGN_TOKENS.spacing.xs} ${KB_DESIGN_TOKENS.spacing.md};
    
    ${MEDIA_QUERIES.phoneSmall} {
      min-height: 40px;
      padding: ${KB_DESIGN_TOKENS.spacing.xs} ${KB_DESIGN_TOKENS.spacing.sm};
    }
    
    ${MEDIA_QUERIES.tablet} {
      min-height: 48px;
      padding: ${KB_DESIGN_TOKENS.spacing.sm} ${KB_DESIGN_TOKENS.spacing.lg};
    }
  `}
  
  /* 하이라이트 상태 */
  ${({ highlighted }) => highlighted && `
    background: ${KB_DESIGN_TOKENS.colors.primaryLight}08;
    border-left: 4px solid ${KB_DESIGN_TOKENS.colors.primary};
  `}
  
  /* 비활성화 상태 */
  ${({ disabled }) => disabled && `
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  `}
  
  /* 클릭 가능한 아이템 스타일 */
  ${({ clickable }) => clickable && `
    cursor: pointer;
    transition: all 0.2s ease;
    
    ${MEDIA_QUERIES.mouse} {
      &:hover {
        background: ${KB_DESIGN_TOKENS.colors.surface};
        transform: translateX(4px);
      }
    }
    
    ${MEDIA_QUERIES.touch} {
      &:active {
        background: ${KB_DESIGN_TOKENS.colors.surfaceVariant};
        transform: scale(0.99);
      }
    }
  `}
`;

// 좌측 컨텐츠 영역
const LeftContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${KB_DESIGN_TOKENS.spacing.md};
  flex: 0 0 auto;
  
  ${MEDIA_QUERIES.phoneSmall} {
    gap: ${KB_DESIGN_TOKENS.spacing.sm};
  }
`;

// 이미지
const ItemImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: ${KB_DESIGN_TOKENS.borderRadius.medium};
  object-fit: cover;
  
  ${MEDIA_QUERIES.phoneSmall} {
    width: 36px;
    height: 36px;
  }
  
  ${MEDIA_QUERIES.tablet} {
    width: 48px;
    height: 48px;
  }
`;

// 아이콘 래퍼
const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${KB_DESIGN_TOKENS.borderRadius.medium};
  background: ${KB_DESIGN_TOKENS.colors.surface};
  color: ${KB_DESIGN_TOKENS.colors.onSurface};
  
  ${MEDIA_QUERIES.phoneSmall} {
    width: 36px;
    height: 36px;
  }
  
  ${MEDIA_QUERIES.tablet} {
    width: 48px;
    height: 48px;
  }
  
  svg {
    width: 24px;
    height: 24px;
    
    ${MEDIA_QUERIES.phoneSmall} {
      width: 20px;
      height: 20px;
    }
    
    ${MEDIA_QUERIES.tablet} {
      width: 28px;
      height: 28px;
    }
  }
`;

// 중앙 컨텐츠 영역
const CenterContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${KB_DESIGN_TOKENS.spacing.xs};
`;

// 타이틀
const ItemTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: ${KB_DESIGN_TOKENS.colors.onSurface};
  margin: 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  ${MEDIA_QUERIES.phoneSmall} {
    font-size: 14px;
  }
  
  ${MEDIA_QUERIES.tablet} {
    font-size: 18px;
  }
`;

// 서브타이틀
const ItemSubtitle = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: ${KB_DESIGN_TOKENS.colors.onSurfaceVariant};
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  ${MEDIA_QUERIES.phoneSmall} {
    font-size: 12px;
  }
  
  ${MEDIA_QUERIES.tablet} {
    font-size: 16px;
  }
`;

// 설명
const ItemDescription = styled.p`
  font-size: 12px;
  font-weight: 400;
  color: ${KB_DESIGN_TOKENS.colors.onSurfaceVariant};
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  ${MEDIA_QUERIES.phoneSmall} {
    font-size: 11px;
  }
  
  ${MEDIA_QUERIES.tablet} {
    font-size: 14px;
  }
`;

// 우측 컨텐츠 영역
const RightContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${KB_DESIGN_TOKENS.spacing.sm};
  flex: 0 0 auto;
`;

// 우측 아이콘
const RightIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${KB_DESIGN_TOKENS.colors.onSurfaceVariant};
  
  svg {
    width: 20px;
    height: 20px;
    
    ${MEDIA_QUERIES.phoneSmall} {
      width: 18px;
      height: 18px;
    }
    
    ${MEDIA_QUERIES.tablet} {
      width: 24px;
      height: 24px;
    }
  }
`;

// 구분선
const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${KB_DESIGN_TOKENS.colors.surfaceVariant};
  margin: 0;
  width: 100%;
`;

/**
 * KB 스타뱅킹 완전 반응형 List Item 컴포넌트
 */
const ResponsiveListItemComponent: React.FC<ResponsiveListItemProps> = memo(({
  id,
  title,
  subtitle,
  description,
  leftIcon,
  rightIcon,
  leftImage,
  rightContent,
  onClick,
  disabled = false,
  highlighted = false,
  divider = false,
  compact = false,
  className
}) => {
  // 기본 우측 화살표 아이콘
  const defaultRightIcon = onClick && !rightIcon && !rightContent ? (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ) : null;

  return (
    <>
      <ListItem
        id={id}
        disabled={disabled}
        highlighted={highlighted}
        clickable={!!onClick}
        compact={compact}
        onClick={disabled ? undefined : onClick}
        className={className}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick && !disabled ? 0 : undefined}
        onKeyDown={(e) => {
          if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {(leftIcon || leftImage) && (
          <LeftContent>
            {leftImage ? (
              <ItemImage src={leftImage} alt={title} />
            ) : leftIcon ? (
              <IconWrapper>
                {leftIcon}
              </IconWrapper>
            ) : null}
          </LeftContent>
        )}

        <CenterContent>
          <ItemTitle>{title}</ItemTitle>
          {subtitle && <ItemSubtitle>{subtitle}</ItemSubtitle>}
          {description && <ItemDescription>{description}</ItemDescription>}
        </CenterContent>

        {(rightIcon || rightContent || defaultRightIcon) && (
          <RightContent>
            {rightContent || (
              <RightIconWrapper>
                {rightIcon || defaultRightIcon}
              </RightIconWrapper>
            )}
          </RightContent>
        )}
      </ListItem>
      {divider && <Divider />}
    </>
  );
});

ResponsiveListItemComponent.displayName = 'ResponsiveListItem';

/**
 * KB 스타뱅킹 완전 반응형 List 컴포넌트
 */
export const ResponsiveList: React.FC<ResponsiveListProps> = ({
  children,
  spacing = 'medium',
  padding = false,
  className
}) => {
  return (
    <ListContainer spacing={spacing} padding={padding} className={className}>
      {children}
    </ListContainer>
  );
};

export const ResponsiveListItem = ResponsiveListItemComponent;

// 미리 정의된 List Item 변형들
export const AccountListItem: React.FC<ResponsiveListItemProps & { 
  accountType?: string; 
  balance?: string; 
  accountNumber?: string; 
}> = ({ 
  accountType, 
  balance, 
  accountNumber, 
  ...props 
}) => (
  <ResponsiveListItem
    {...props}
    subtitle={accountType}
    description={accountNumber}
    rightContent={
      balance ? (
        <div style={{ 
          textAlign: 'right',
          fontSize: '16px',
          fontWeight: '600',
          color: KB_DESIGN_TOKENS.colors.onSurface
        }}>
          {balance}
        </div>
      ) : undefined
    }
  />
);

export const TransactionListItem: React.FC<ResponsiveListItemProps & {
  amount?: string;
  date?: string;
  isIncome?: boolean;
}> = ({ 
  amount, 
  date, 
  isIncome,
  ...props 
}) => (
  <ResponsiveListItem
    {...props}
    subtitle={date}
    rightContent={
      amount ? (
        <div style={{ 
          textAlign: 'right',
          fontSize: '16px',
          fontWeight: '600',
          color: isIncome ? KB_DESIGN_TOKENS.colors.success : KB_DESIGN_TOKENS.colors.error
        }}>
          {isIncome ? '+' : '-'}{amount}
        </div>
      ) : undefined
    }
  />
);

export const MenuListItem: React.FC<ResponsiveListItemProps> = (props) => (
  <ResponsiveListItem {...props} compact />
);

export default ResponsiveList;