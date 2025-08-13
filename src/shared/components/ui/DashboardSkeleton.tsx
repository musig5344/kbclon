import React from 'react';

import styled from 'styled-components';

import { tokens } from '../../../styles/tokens';

import { AccountSkeleton } from './AccountSkeleton';
import { Skeleton, SkeletonGroup } from './Skeleton';

/**
 * Dashboard Page Skeleton Component
 * - 대시보드 전체 페이지 스켈레톤
 * - 각 섹션별 스켈레톤 조합
 */

const DashboardSkeletonContainer = styled.div`
  width: 100%;
  max-width: ${tokens.app.maxWidth};
  background: ${tokens.colors.background.tertiary};
  min-height: 100vh;
`;

const MainContentSkeleton = styled.div`
  padding-bottom: calc(${tokens.sizes.navigation.height} + env(safe-area-inset-bottom));
`;

// 메인 배너 스켈레톤
const MainBannerSkeleton = styled.div`
  background: ${tokens.colors.background.primary};
  padding: ${tokens.spacing[5]};
  margin-bottom: ${tokens.spacing[4]};
`;

// 빠른 접근 그리드 스켈레톤
const QuickAccessGridSkeleton = styled.div`
  padding: ${tokens.spacing[5]};
  background: ${tokens.colors.background.primary};
  margin-bottom: ${tokens.spacing[4]};
`;

const QuickAccessGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${tokens.spacing[3]};
  
  @media (max-width: ${tokens.breakpoints.medium}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const QuickAccessCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${tokens.spacing[2]};
`;

// 금융 탭 스켈레톤
const FinancialTabsSkeleton = styled.div`
  background: ${tokens.colors.background.primary};
  padding: ${tokens.spacing[5]};
  margin-bottom: ${tokens.spacing[4]};
`;

const TabHeaderSkeleton = styled.div`
  display: flex;
  gap: ${tokens.spacing[4]};
  margin-bottom: ${tokens.spacing[4]};
`;

const TabContentSkeleton = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${tokens.spacing[3]};
`;

// 콘텐츠 섹션 스켈레톤
const ContentSectionSkeleton = styled.div`
  background: ${tokens.colors.background.primary};
  padding: ${tokens.spacing[5]};
  margin-bottom: ${tokens.spacing[4]};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${tokens.spacing[3]};
  
  @media (max-width: ${tokens.breakpoints.small}) {
    grid-template-columns: 1fr;
  }
`;

// 메인 DashboardSkeleton 컴포넌트
export const DashboardSkeleton: React.FC = React.memo(() => {
  return (
    <DashboardSkeletonContainer>
      <MainContentSkeleton>
        {/* 메인 배너 스켈레톤 */}
        <MainBannerSkeleton>
          <Skeleton 
            width="100%" 
            height={120} 
            variant="rectangular"
          />
        </MainBannerSkeleton>
        
        {/* 계좌 섹션 스켈레톤 */}
        <AccountSkeleton count={2} />
        
        {/* 빠른 접근 그리드 스켈레톤 */}
        <QuickAccessGridSkeleton>
          <QuickAccessGrid>
            {Array.from({ length: 4 }).map((_, index) => (
              <QuickAccessCard key={index}>
                <Skeleton 
                  width={64} 
                  height={64} 
                  variant="circular"
                />
                <SkeletonGroup $gap={4}>
                  <Skeleton 
                    width={60} 
                    height={16} 
                    variant="text"
                  />
                  <Skeleton 
                    width={40} 
                    height={12} 
                    variant="text"
                  />
                </SkeletonGroup>
              </QuickAccessCard>
            ))}
          </QuickAccessGrid>
        </QuickAccessGridSkeleton>
        
        {/* 환율/증시 탭 스켈레톤 */}
        <FinancialTabsSkeleton>
          <TabHeaderSkeleton>
            <Skeleton width={60} height={32} variant="rectangular" />
            <Skeleton width={60} height={32} variant="rectangular" />
          </TabHeaderSkeleton>
          <TabContentSkeleton>
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonGroup key={index} $gap={8}>
                <Skeleton width={80} height={16} variant="text" />
                <Skeleton width={100} height={20} variant="text" />
                <Skeleton width={60} height={14} variant="text" />
              </SkeletonGroup>
            ))}
          </TabContentSkeleton>
        </FinancialTabsSkeleton>
        
        {/* 콘텐츠 섹션들 스켈레톤 */}
        <ContentSectionSkeleton>
          <Skeleton 
            width={120} 
            height={24} 
            variant="text" 
            style={{ marginBottom: tokens.spacing[4] }}
          />
          <ContentGrid>
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton 
                key={index}
                width="100%" 
                height={120} 
                variant="rectangular"
              />
            ))}
          </ContentGrid>
        </ContentSectionSkeleton>
        
        {/* 추천 섹션 스켈레톤 */}
        <ContentSectionSkeleton>
          <Skeleton 
            width={150} 
            height={24} 
            variant="text" 
            style={{ marginBottom: tokens.spacing[4] }}
          />
          <SkeletonGroup $gap={16}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} style={{ display: 'flex', gap: tokens.spacing[3] }}>
                <Skeleton width={80} height={80} variant="rectangular" />
                <SkeletonGroup style={{ flex: 1 }}>
                  <Skeleton width="80%" height={18} variant="text" />
                  <Skeleton width="60%" height={14} variant="text" />
                  <Skeleton width="40%" height={14} variant="text" />
                </SkeletonGroup>
              </div>
            ))}
          </SkeletonGroup>
        </ContentSectionSkeleton>
      </MainContentSkeleton>
    </DashboardSkeletonContainer>
  );
});

DashboardSkeleton.displayName = 'DashboardSkeleton';

export default DashboardSkeleton;