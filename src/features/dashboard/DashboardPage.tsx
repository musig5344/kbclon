import { useState, useMemo, useCallback, useEffect } from 'react';

import styled from 'styled-components';

import { KBMenuPage } from '@features/menu/components/KBMenuPage';

import { DashboardHeader } from '@shared/components/layout/DashboardHeader';
import TabBar from '@shared/components/layout/TabBar';
import { DashboardSkeleton } from '@shared/components/ui/DashboardSkeleton';
import { ErrorNotification } from '@shared/components/ui/ErrorNotification';

import { useAuth } from '@core/auth/AuthContext';


import { useAccountData } from '@hooks/useAccountData';

import { androidOptimizedScroll } from '@styles/android-webview-optimizations';
import { KBDesignSystem } from '@styles/tokens/kb-design-system';

import type { Account } from '@types/common.types';

import AccountSection from './components/AccountSection';
import ContentSections from './components/ContentSections';
import FinancialTabs from './components/FinancialTabs';
import MainBanner from './components/MainBanner';
import MyAssetsSection from './components/MyAssetsSection';
import QuickAccessGrid from './components/QuickAccessGrid';
import TodaySpendingSection from './components/TodaySpendingSection';
import WeeklyCardSection from './components/WeeklyCardSection';

const DashboardContainer = styled.div`
  background: ${KBDesignSystem.colors.background.gray100};
  width: 100%;
  min-height: 100vh;
  margin: 0 auto;
  transform: translateZ(0);
  will-change: scroll-position;
`;

const MainContent = styled.div`
  ${androidOptimizedScroll}
  padding: 0 0 calc(60px + env(safe-area-inset-bottom)) 0;
  min-height: calc(100vh - 48px - 60px);
  overscroll-behavior: none;
  touch-action: pan-y;
`;
interface QuickAccessItem {
  title: string;
  subtitle: string;
  icon: string;
  bgColor: string;
  onClick: () => void;
}

export const DashboardPage = (): JSX.Element => {
  const { isInitialized } = useAuth();
  const { 
    accounts, 
    isLoading: isLoadingAccounts, 
    error: accountError, 
    refetch: refetchAccounts 
  } = useAccountData();
  
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // 통합 로딩 상태 - 메모이제이션으로 최적화
  const isLoading = useMemo(() => {
    return !isInitialized || isLoadingAccounts;
  }, [isInitialized, isLoadingAccounts]);
  // 에러 표시 통합
  useEffect(() => {
    if (accountError) {
      setError(accountError);
    }
  }, [accountError]);
  // 빠른 접근 카드 이벤트 핸들러 - useCallback으로 최적화
  const handleQuickAccessClick = useCallback((index: number) => {
    // 각 카드별 동작 정의
    switch (index) {
      case 0: // 오늘의 걸음
        break;
      case 1: // 용돈 받기
        break;
      case 2: // 식물 키우기
        break;
      case 3: // 포인트
        break;
      default:
        break;
    }
  }, []);
  // 콘텐츠 섹션 이벤트 핸들러 - useCallback으로 최적화
  const handleFortuneClick = useCallback(() => {
  }, []);
  
  const handleGameClick = useCallback(() => {
  }, []);
  
  const handlePickClick = useCallback((index: number) => {
  }, []);
  
  const handleRecommendClick = useCallback((index: number) => {
  }, []);
  
  const handleBannerClick = useCallback(() => {
  }, []);

  // QuickAccessGrid 아이템들을 메모이제이션하여 불필요한 리렌더링 방지
  const quickAccessItems = useMemo<QuickAccessItem[]>(() => [
    { 
      title: '오늘의 걸음', 
      subtitle: '연동하기 ›', 
      icon: '🚶', 
      bgColor: '#E8F5FF',
      onClick: () => handleQuickAccessClick(0)
    },
    { 
      title: '용돈 받기', 
      subtitle: '매일 랜덤 ›', 
      icon: '🐷', 
      bgColor: '#FFE8E8',
      onClick: () => handleQuickAccessClick(1)
    },
    { 
      title: '식물 키우기', 
      subtitle: '포인트', 
      icon: '🌱', 
      bgColor: '#F0FFF0',
      onClick: () => handleQuickAccessClick(2)
    }
  ], [handleQuickAccessClick]);
  if (isLoading) {
    return (
      <DashboardContainer>
        <DashboardHeader onMenuClick={() => setShowMenu(true)} />
        <DashboardSkeleton />
        <TabBar />
      </DashboardContainer>
    );
  }
  if (showMenu) {
    return <KBMenuPage onClose={() => setShowMenu(false)} />;
  }
  return (
    <DashboardContainer>
      <ErrorNotification 
        error={error || accountError} 
        onRetry={accountError ? refetchAccounts : undefined}
        onDismiss={() => setError(null)}
      />
      <DashboardHeader onMenuClick={() => setShowMenu(true)} />
      <MainContent>
        {/* 메인 배너 */}
        <MainBanner onBannerClick={handleBannerClick} />
        {/* 계좌 섹션 */}
        <AccountSection accounts={accounts} />
        {/* 이번 주 카드경제 섹션 */}
        <WeeklyCardSection />
        {/* 오늘한 지출 섹션 */}
        <TodaySpendingSection />
        {/* 나의 총자산 섹션 */}
        <MyAssetsSection />
        {/* 빠른 접근 그리드 */}
        <QuickAccessGrid 
          items={quickAccessItems}
        />
        {/* 환율/증시 탭 */}
        <FinancialTabs />
        {/* 콘텐츠 섹션들 */}
        <ContentSections
          onFortuneClick={handleFortuneClick}
          onGameClick={handleGameClick}
          onPickClick={handlePickClick}
          onRecommendClick={handleRecommendClick}
        />
      </MainContent>
      <TabBar />
    </DashboardContainer>
  );
};

export default DashboardPage;