import React from 'react';

import styled from 'styled-components';

import { tokens } from '../../../styles/tokens';

import { Skeleton, SkeletonGroup } from './Skeleton';

/**
 * Account Card Skeleton Component
 * - AccountSection 컴포넌트와 동일한 레이아웃
 * - KB 스타뱅킹 계좌 카드 스켈레톤
 */

const AccountSkeletonContainer = styled.div`
  background: ${tokens.colors.background.primary};
  padding: 0;
`;

const AccountSkeletonWrapper = styled.div`
  background: ${tokens.colors.background.tertiary};
  padding: 30px ${tokens.spacing[5]};
  position: relative;
`;

const AccountSkeletonBanner = styled.div`
  background: ${tokens.colors.background.primary};
  border-radius: ${tokens.borderRadius.xxl};
  padding: 28px ${tokens.spacing[6]};
  box-shadow: ${tokens.shadows.elevation3};
  position: relative;
  min-height: 160px;
  overflow: hidden;
  
  /* 미세한 border highlight */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: ${tokens.borderRadius.xxl};
    border: 1px solid rgba(255, 255, 255, 0.8);
    pointer-events: none;
  }
  
  @media (max-width: ${tokens.breakpoints.small}) {
    padding: 24px ${tokens.spacing[5]};
    min-height: 145px;
  }
`;

const AccountRowSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[5]};
  min-height: 100px;
  
  &:first-child {
    margin-bottom: ${tokens.spacing[5]};
  }
  
  @media (max-width: ${tokens.breakpoints.small}) {
    gap: ${tokens.spacing[4]};
    min-height: 90px;
  }
`;

const AccountLeftSkeleton = styled.div`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[4]};
`;

const AccountInfoSkeleton = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${tokens.spacing[1]};
`;

const AccountBalanceSkeleton = styled.div`
  text-align: right;
  margin-top: auto;
  align-self: flex-end;
`;

const TransferButtonSkeleton = styled.div`
  margin-top: ${tokens.spacing[4]};
`;

const PaginationSkeleton = styled.div`
  display: flex;
  justify-content: center;
  gap: ${tokens.spacing[1]};
  margin-top: ${tokens.spacing[3]};
`;

// 계좌 카드 단일 스켈레톤
const AccountCardSkeleton: React.FC = React.memo(() => {
  return (
    <AccountRowSkeleton>
      <AccountLeftSkeleton>
        {/* KB 로고 원형 스켈레톤 */}
        <Skeleton 
          width={48} 
          height={48} 
          variant="circular"
        />
        <AccountInfoSkeleton>
          {/* 계좌명 스켈레톤 */}
          <Skeleton 
            width={120} 
            height={20} 
            variant="text"
          />
          {/* 계좌번호 스켈레톤 */}
          <Skeleton 
            width={140} 
            height={16} 
            variant="text"
          />
        </AccountInfoSkeleton>
      </AccountLeftSkeleton>
      <AccountBalanceSkeleton>
        {/* 잔액 스켈레톤 */}
        <Skeleton 
          width={160} 
          height={28} 
          variant="text"
        />
      </AccountBalanceSkeleton>
    </AccountRowSkeleton>
  );
});

AccountCardSkeleton.displayName = 'AccountCardSkeleton';

// 메인 AccountSkeleton 컴포넌트
export const AccountSkeleton: React.FC<{
  count?: number;
  showTransferButton?: boolean;
  showPagination?: boolean;
}> = React.memo(({ 
  count = 2, 
  showTransferButton = true,
  showPagination = true 
}) => {
  return (
    <AccountSkeletonContainer>
      <AccountSkeletonWrapper>
        <AccountSkeletonBanner>
          {/* 계좌 카드 스켈레톤들 */}
          {Array.from({ length: count }).map((_, index) => (
            <AccountCardSkeleton key={index} />
          ))}
          
          {/* 이체 버튼 스켈레톤 */}
          {showTransferButton && (
            <TransferButtonSkeleton>
              <Skeleton 
                width="100%" 
                height={56} 
                variant="rectangular"
              />
            </TransferButtonSkeleton>
          )}
        </AccountSkeletonBanner>
        
        {/* 페이지네이션 스켈레톤 */}
        {showPagination && (
          <PaginationSkeleton>
            <Skeleton 
              width={6} 
              height={6} 
              variant="circular"
            />
            <Skeleton 
              width={6} 
              height={6} 
              variant="circular"
            />
          </PaginationSkeleton>
        )}
      </AccountSkeletonWrapper>
    </AccountSkeletonContainer>
  );
});

AccountSkeleton.displayName = 'AccountSkeleton';

export default AccountSkeleton;