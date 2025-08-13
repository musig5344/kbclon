import React, { useState, useMemo, useEffect } from 'react';

import styled from 'styled-components';

import { useAuth } from '../../core/auth/AuthContext';
import { prefetchQueries } from '../../core/cache/queryClient';
import { useAccounts, useExchangeRates, usePrefetch } from '../../services/cachedApiService';
import { DashboardHeader } from '../../shared/components/layout/DashboardHeader';
import TabBar from '../../shared/components/layout/TabBar';
import { ErrorNotification } from '../../shared/components/ui/ErrorNotification';
import { LoadingScreen } from '../../shared/components/ui/UnifiedLoading';
import { tokens } from '../../styles/tokens';
import { formatCurrency } from '../../utils/textFormatter';
import { KBMenuPage } from '../menu/components/KBMenuPage';

// 분리된 컴포넌트들 import
import AccountSection from './components/AccountSection';
import ContentSections from './components/ContentSections';
import FinancialTabs from './components/FinancialTabs';
import MainBanner from './components/MainBanner';
import QuickAccessGrid from './components/QuickAccessGrid';

/**
 * KB 스타뱅킹 2025년 최신 버전 대시보드 (캐싱 최적화)
 * - React Query를 활용한 스마트 캐싱
 * - 프리페칭으로 사용자 경험 개선
 * - 백그라운드 데이터 새로고침
 */

// 메인 컨테이너
const DashboardContainer = styled.div`
  width: 100%;
  max-width: ${tokens.app.maxWidth};
  height: 100vh;
  background: ${tokens.colors.background.tertiary};
  position: relative;
  overflow: hidden;
  margin: 0 auto;
`;

// 메인 콘텐츠 영역
const MainContent = styled.div`
  padding: 0 0 calc(${tokens.sizes.navigation.height} + env(safe-area-inset-bottom)) 0;
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - ${tokens.sizes.header.height});
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
`;

// 에러 컨테이너
const ErrorContainer = styled.div`
  padding: 20px;
  text-align: center;
`;

// 새로고침 버튼
const RefreshButton = styled.button`
  margin-top: 16px;
  padding: 12px 24px;
  background-color: ${tokens.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: ${tokens.colors.primaryDark};
  }
`;

interface DashboardPageProps {}

export const DashboardPageCached: React.FC<DashboardPageProps> = () => {
  const { isInitialized, user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('home');

  // React Query 훅 사용
  const {
    data: accounts = [],
    isLoading: isLoadingAccounts,
    error: accountsError,
    refetch: refetchAccounts,
  } = useAccounts();

  const { data: exchangeRates = [], isLoading: isLoadingRates } = useExchangeRates();

  const { prefetchAccountDetail, prefetchTransactions } = usePrefetch();

  // 대시보드 진입 시 프리페칭
  useEffect(() => {
    if (user?.id) {
      prefetchQueries.dashboard(user.id);
    }
  }, [user?.id]);

  // 계좌 호버 시 상세 정보 프리페칭
  const handleAccountHover = (accountId: string) => {
    prefetchAccountDetail(accountId);
    prefetchTransactions(accountId, { limit: 20 });
  };

  // 계산된 값들 (메모이제이션)
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  }, [accounts]);

  const primaryAccount = useMemo(() => {
    return accounts.find(account => account.is_primary) || accounts[0];
  }, [accounts]);

  // 로딩 상태
  if (!isInitialized || isLoadingAccounts) {
    return <LoadingScreen />;
  }

  // 에러 상태
  if (accountsError) {
    return (
      <DashboardContainer>
        <DashboardHeader />
        <ErrorContainer>
          <ErrorNotification message='데이터를 불러오는 중 오류가 발생했습니다.' />
          <RefreshButton onClick={() => refetchAccounts()}>다시 시도</RefreshButton>
        </ErrorContainer>
      </DashboardContainer>
    );
  }

  // 메뉴 탭 선택 시
  if (selectedTab === 'menu') {
    return <KBMenuPage />;
  }

  return (
    <DashboardContainer>
      <DashboardHeader />

      <MainContent>
        {/* 메인 배너 - 총 자산 표시 */}
        <MainBanner
          totalBalance={totalBalance}
          accountCount={accounts.length}
          lastUpdated={new Date().toLocaleTimeString('ko-KR')}
        />

        {/* 계좌 섹션 - 주계좌 정보 */}
        {primaryAccount && (
          <AccountSection
            account={primaryAccount}
            onHover={() => handleAccountHover(primaryAccount.id)}
          />
        )}

        {/* 빠른 액세스 그리드 */}
        <QuickAccessGrid />

        {/* 금융 상품 탭 */}
        <FinancialTabs />

        {/* 콘텐츠 섹션들 */}
        <ContentSections exchangeRates={exchangeRates} isLoadingRates={isLoadingRates} />
      </MainContent>

      <TabBar onTabChange={setSelectedTab} activeTab={selectedTab} />
    </DashboardContainer>
  );
};

export default DashboardPageCached;
