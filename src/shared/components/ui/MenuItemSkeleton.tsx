import React from 'react';

import styled from 'styled-components';

import { tokens } from '../../../styles/tokens';

import { Skeleton, SkeletonGroup } from './Skeleton';

/**
 * Menu Item Skeleton Component
 * - 메뉴 아이템 스켈레톤
 * - KBMenuPage와 동일한 레이아웃
 */

const MenuSkeletonContainer = styled.div`
  padding: ${tokens.spacing[5]};
  background: ${tokens.colors.background.primary};
`;

const MenuSectionSkeleton = styled.div`
  margin-bottom: ${tokens.spacing[6]};
`;

const MenuGridSkeleton = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${tokens.spacing[4]};

  @media (max-width: ${tokens.breakpoints.medium}) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: ${tokens.breakpoints.small}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const MenuItemCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${tokens.spacing[2]};
  padding: ${tokens.spacing[3]};
`;

// 단일 메뉴 아이템 스켈레톤
export const MenuItemSkeleton: React.FC = React.memo(() => {
  return (
    <MenuItemCard>
      {/* 아이콘 스켈레톤 */}
      <Skeleton width={48} height={48} variant='circular' />
      {/* 메뉴명 스켈레톤 */}
      <Skeleton width={60} height={14} variant='text' />
    </MenuItemCard>
  );
});

MenuItemSkeleton.displayName = 'MenuItemSkeleton';

// 메뉴 섹션 스켈레톤
export const MenuSectionSkeleton: React.FC<{
  itemCount?: number;
  showTitle?: boolean;
}> = React.memo(({ itemCount = 8, showTitle = true }) => {
  return (
    <MenuSectionSkeleton>
      {/* 섹션 타이틀 스켈레톤 */}
      {showTitle && (
        <Skeleton
          width={100}
          height={20}
          variant='text'
          style={{ marginBottom: tokens.spacing[4] }}
        />
      )}

      {/* 메뉴 그리드 스켈레톤 */}
      <MenuGridSkeleton>
        {Array.from({ length: itemCount }).map((_, index) => (
          <MenuItemSkeleton key={index} />
        ))}
      </MenuGridSkeleton>
    </MenuSectionSkeleton>
  );
});

// 전체 메뉴 페이지 스켈레톤
export const MenuPageSkeleton: React.FC = React.memo(() => {
  return (
    <MenuSkeletonContainer>
      {/* 주요 메뉴 섹션 */}
      <MenuSectionSkeleton itemCount={8} />

      {/* 자산관리 섹션 */}
      <MenuSectionSkeleton itemCount={6} />

      {/* 대출 섹션 */}
      <MenuSectionSkeleton itemCount={4} />

      {/* 카드 섹션 */}
      <MenuSectionSkeleton itemCount={4} />
    </MenuSkeletonContainer>
  );
});

MenuPageSkeleton.displayName = 'MenuPageSkeleton';

export default MenuItemSkeleton;
