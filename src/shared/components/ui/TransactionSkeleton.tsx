import React from 'react';

import styled from 'styled-components';

import { tokens } from '../../../styles/tokens';

import { Skeleton, SkeletonGroup } from './Skeleton';

/**
 * Transaction List Skeleton Component
 * - 거래내역 리스트 스켈레톤
 * - TransactionListSection과 동일한 레이아웃
 */

const TransactionSkeletonSection = styled.div`
  padding: 0;
  background: ${tokens.colors.background.primary};
`;

const DateHeaderSkeleton = styled.div`
  background: ${tokens.colors.background.tertiary};
  padding: ${tokens.spacing[4]} ${tokens.spacing[5]};
  border-bottom: 1px solid ${tokens.colors.border.divider};
`;

const TransactionListSkeleton = styled.div`
  padding: 0;
`;

const TransactionItemSkeleton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: ${tokens.spacing[5]} ${tokens.spacing[5]};
  background: ${tokens.colors.background.primary};
  border-bottom: 1px solid ${tokens.colors.border.divider};
  gap: ${tokens.spacing[4]};

  @media (max-width: ${tokens.breakpoints.small}) {
    padding: ${tokens.spacing[4]} ${tokens.spacing[4]};
  }
`;

const TransactionLeftSkeleton = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[2]};
`;

const TransactionRightSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${tokens.spacing[2]};
`;

// 단일 거래내역 스켈레톤
const TransactionItemSkeletonComponent: React.FC = React.memo(() => {
  return (
    <TransactionItemSkeleton>
      <TransactionLeftSkeleton>
        {/* 날짜/시간 스켈레톤 */}
        <Skeleton width={180} height={14} variant='text' />
        {/* 거래내역 설명 스켈레톤 */}
        <Skeleton width={120} height={18} variant='text' />
      </TransactionLeftSkeleton>
      <TransactionRightSkeleton>
        {/* 금액 스켈레톤 */}
        <Skeleton width={100} height={20} variant='text' />
        {/* 잔액 스켈레톤 */}
        <Skeleton width={120} height={16} variant='text' />
      </TransactionRightSkeleton>
    </TransactionItemSkeleton>
  );
});

TransactionItemSkeletonComponent.displayName = 'TransactionItemSkeleton';

// 메인 TransactionSkeleton 컴포넌트
export const TransactionSkeleton: React.FC<{
  count?: number;
  showDateHeader?: boolean;
}> = React.memo(({ count = 5, showDateHeader = true }) => {
  return (
    <TransactionSkeletonSection>
      {/* 날짜 헤더 스켈레톤 */}
      {showDateHeader && (
        <DateHeaderSkeleton>
          <Skeleton width={80} height={20} variant='text' />
        </DateHeaderSkeleton>
      )}

      {/* 거래내역 리스트 스켈레톤 */}
      <TransactionListSkeleton>
        {Array.from({ length: count }).map((_, index) => (
          <TransactionItemSkeletonComponent key={index} />
        ))}
      </TransactionListSkeleton>
    </TransactionSkeletonSection>
  );
});

TransactionSkeleton.displayName = 'TransactionSkeleton';

// 전체 거래내역 페이지 스켈레톤 (필터 섹션 포함)
export const TransactionPageSkeleton: React.FC = React.memo(() => {
  return (
    <>
      {/* 계좌 정보 섹션 스켈레톤 */}
      <AccountInfoSkeleton />

      {/* 필터 섹션 스켈레톤 */}
      <FilterSectionSkeleton />

      {/* 날짜 범위 스켈레톤 */}
      <DateRangeSkeleton />

      {/* 거래내역 리스트 스켈레톤 */}
      <TransactionSkeleton count={5} />
    </>
  );
});

TransactionPageSkeleton.displayName = 'TransactionPageSkeleton';

// 계좌 정보 섹션 스켈레톤
const AccountInfoSkeleton: React.FC = () => {
  const AccountInfoContainer = styled.div`
    background: ${tokens.colors.background.primary};
    padding: ${tokens.spacing[5]};
    border-bottom: 1px solid ${tokens.colors.border.divider};
  `;

  const AccountInfoContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${tokens.spacing[4]};
  `;

  return (
    <AccountInfoContainer>
      <AccountInfoContent>
        <SkeletonGroup>
          <Skeleton width={150} height={20} variant='text' />
          <Skeleton width={180} height={16} variant='text' />
        </SkeletonGroup>
        <Skeleton width={120} height={32} variant='text' />
      </AccountInfoContent>
    </AccountInfoContainer>
  );
};

// 필터 섹션 스켈레톤
const FilterSectionSkeleton: React.FC = () => {
  const FilterContainer = styled.div`
    background: ${tokens.colors.background.primary};
    padding: ${tokens.spacing[4]} ${tokens.spacing[5]};
    border-bottom: 1px solid ${tokens.colors.border.divider};
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;

  return (
    <FilterContainer>
      <Skeleton width={24} height={24} variant='circular' />
      <Skeleton width={200} height={36} variant='rectangular' />
    </FilterContainer>
  );
};

// 날짜 범위 스켈레톤
const DateRangeSkeleton: React.FC = () => {
  const DateRangeContainer = styled.div`
    background: ${tokens.colors.background.tertiary};
    padding: ${tokens.spacing[3]} ${tokens.spacing[5]};
    border-bottom: 1px solid ${tokens.colors.border.divider};
  `;

  return (
    <DateRangeContainer>
      <Skeleton width={200} height={16} variant='text' />
    </DateRangeContainer>
  );
};

export default TransactionSkeleton;
