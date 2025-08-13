import { useState, useEffect, Suspense } from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import styled, { ThemeProvider } from 'styled-components';

import { QueryProvider } from '@app/providers/QueryProvider';

import { LoginScreen } from '@features/auth/components/LoginScreen';

// 원본 에셋 기반 스플래시 및 로딩 시스템

import { LazyLoadErrorBoundary } from '@shared/components/ui/LazyLoadErrorBoundary';
import ProtectedRoute from '@shared/components/ui/ProtectedRoute';
import { UnifiedLoading } from '@shared/components/ui/UnifiedLoading';
// Unused imports removed
import { NotificationProvider } from '@shared/contexts/NotificationContext';

import { AuthProvider } from '@core/auth/AuthContext';

import { LoadingManager } from '@components/loading/LoadingManager';
import { SplashScreen } from '@components/splash/SplashScreen';
import { PageTransition } from '@components/transitions/PageTransition';

// lazyWithRetry import removed as unused
import {
  createOptimizedLazyRoute,
  LoadingPriority,
  advancedLazyLoadingManager,
  intelligentPrefetcher,
} from '@utils/advancedLazyLoading';

import { androidAppContainer } from '@styles/android-webview-optimizations';
import GlobalStyle from '@styles/GlobalStyle';
import { createResponsiveContainer } from '@styles/responsive-system';
import { theme } from '@styles/theme';
import { tokens } from '@styles/tokens';

// 고급 lazy loading으로 업그레이드된 페이지들

// 로그인 관련 페이지는 빠른 로드를 위해 별도 그룹화 (HIGH 우선순위)
const IdPasswordLoginPage = createOptimizedLazyRoute(
  () => import(/* webpackChunkName: "auth-id-login" */ '@features/auth/IdPasswordLoginPage'),
  { chunkName: 'auth-id-login', priority: LoadingPriority.HIGH, prefetch: true }
);

const LoginPage = createOptimizedLazyRoute(
  () => import(/* webpackChunkName: "auth-login" */ '@features/auth/LoginPage'),
  { chunkName: 'auth-login', priority: LoadingPriority.HIGH }
);

// 대시보드 - 가장 중요한 페이지 (IMMEDIATE 우선순위)
const DashboardPage = createOptimizedLazyRoute(
  () =>
    import(
      /* webpackChunkName: "dashboard", webpackPrefetch: true */ '@features/dashboard/DashboardPage'
    ),
  { chunkName: 'dashboard', priority: LoadingPriority.IMMEDIATE, prefetch: true, preload: true }
);

// 계좌 관련 페이지들 (HIGH 우선순위)
const AccountPage = createOptimizedLazyRoute(
  () =>
    import(
      /* webpackChunkName: "account-main", webpackPrefetch: true */ '@features/accounts/AccountPage'
    ),
  { chunkName: 'account-main', priority: LoadingPriority.HIGH, prefetch: true }
);

const AccountDetailPage = createOptimizedLazyRoute(
  () => import(/* webpackChunkName: "account-detail" */ '@features/accounts/AccountDetailPage'),
  { chunkName: 'account-detail', priority: LoadingPriority.HIGH, dependencies: ['account-main'] }
);

const ComprehensiveAccountPage = createOptimizedLazyRoute(
  () =>
    import(
      /* webpackChunkName: "account-comprehensive" */ '@features/accounts/ComprehensiveAccountPage'
    ),
  { chunkName: 'account-comprehensive', priority: LoadingPriority.MEDIUM }
);

// 거래 관련 페이지들 (MEDIUM 우선순위)
const TransferPage = createOptimizedLazyRoute(
  () =>
    import(
      /* webpackChunkName: "transfer-main", webpackPrefetch: true */ '@features/transfers/TransferPage'
    ),
  { chunkName: 'transfer-main', priority: LoadingPriority.MEDIUM, prefetch: true }
);

const TransferPicturePage = createOptimizedLazyRoute(
  () =>
    import(/* webpackChunkName: "transfer-picture" */ '@features/transfers/TransferPicturePage'),
  {
    chunkName: 'transfer-picture',
    priority: LoadingPriority.MEDIUM,
    dependencies: ['transfer-main'],
  }
);

const TransactionHistoryPage = createOptimizedLazyRoute(
  () =>
    import(
      /* webpackChunkName: "transaction-history" */ '@features/transactions/TransactionHistoryPage'
    ),
  { chunkName: 'transaction-history', priority: LoadingPriority.MEDIUM }
);

const AccountTransactionPage = createOptimizedLazyRoute(
  () =>
    import(
      /* webpackChunkName: "account-transaction" */ '@features/transactions/AccountTransactionPage'
    ),
  {
    chunkName: 'account-transaction',
    priority: LoadingPriority.MEDIUM,
    dependencies: ['account-main'],
  }
);

// 메뉴 페이지 (MEDIUM 우선순위)
const KBMenuPage = createOptimizedLazyRoute(
  () =>
    import(/* webpackChunkName: "kb-menu" */ '@features/menu/components/KBMenuPage').then(
      module => ({ default: module.KBMenuPage })
    ),
  { chunkName: 'kb-menu', priority: LoadingPriority.MEDIUM }
);

// 기타 페이지들 (LOW 우선순위)
const ShopPage = createOptimizedLazyRoute(
  () => import(/* webpackChunkName: "shop" */ '@pages/ShopPage'),
  { chunkName: 'shop', priority: LoadingPriority.LOW }
);

const AssetsPage = createOptimizedLazyRoute(
  () => import(/* webpackChunkName: "assets" */ '@pages/AssetsPage'),
  { chunkName: 'assets', priority: LoadingPriority.LOW }
);

const BenefitsPage = createOptimizedLazyRoute(
  () => import(/* webpackChunkName: "benefits" */ '@pages/BenefitsPage'),
  { chunkName: 'benefits', priority: LoadingPriority.LOW }
);

const DummyPage = createOptimizedLazyRoute(
  () => import(/* webpackChunkName: "dummy" */ '@pages/DummyPage'),
  { chunkName: 'dummy', priority: LoadingPriority.ON_DEMAND }
);

// 지능형 프리페치를 위한 라우트 매핑
const routeImportMap = new Map<string, () => Promise<any>>([
  ['dashboard', () => import('@features/dashboard/DashboardPage')],
  ['account', () => import('@features/accounts/AccountPage')],
  ['transfer', () => import('@features/transfers/TransferPage')],
  ['transactions', () => import('@features/transactions/TransactionHistoryPage')],
  ['menu', () => import('@features/menu/components/KBMenuPage')],
]);

// 우선순위 기반 프리페치 함수
const prefetchImportantPages = async (): Promise<void> => {
  // 지능형 프리페치 초기화
  intelligentPrefetcher.recordUserAction('app_start');

  // 우선순위 기반 프리페치
  const prioritizedRoutes = [
    {
      priority: LoadingPriority.IMMEDIATE,
      importFn: () => import('@features/dashboard/DashboardPage'),
      chunkName: 'dashboard',
    },
    {
      priority: LoadingPriority.HIGH,
      importFn: () => import('@features/accounts/AccountPage'),
      chunkName: 'account-main',
    },
    {
      priority: LoadingPriority.MEDIUM,
      importFn: () => import('@features/transfers/TransferPage'),
      chunkName: 'transfer-main',
    },
  ];

  await advancedLazyLoadingManager.prefetchByPriority(prioritizedRoutes);

  // 사용자 패턴 기반 예측 프리페치
  await intelligentPrefetcher.prefetchPredictedActions('app_start', routeImportMap);
};

// KB 스타뱅킹 완전 반응형 컨테이너 - 모든 안드로이드 기기 완벽 대응
const AppContainer = styled.div`
  ${createResponsiveContainer()}
  background-color: ${tokens.colors.background.primary};

  /* PC에서만 모바일 시뮬레이션 */
  @media (min-width: 769px) {
    width: 430px;
    max-width: 430px;
    height: 100vh;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    border-radius: 0;
    overflow-y: auto;
  }

  /* Android APK에서는 AndroidWebView 최적화 적용 */
  @media (max-width: 768px) {
    ${androidAppContainer}
  }
`;

const SPLASH_DURATION = 2000; // 2초로 변경

const App = (): React.JSX.Element => {
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
      prefetchImportantPages();
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, []);

  const handleSplashComplete = () => {
    setIsInitialLoading(false);
    prefetchImportantPages();
  };

  if (isInitialLoading) {
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <SplashScreen onAnimationComplete={handleSplashComplete} duration={SPLASH_DURATION} />
      </ThemeProvider>
    );
  }
  return (
    <QueryProvider>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <LoadingManager>
          <NotificationProvider>
            <AuthProvider>
              <AppContainer>
                <Router>
                  <LazyLoadErrorBoundary>
                    <PageTransition>
                      <Routes>
                        {/* 스플래시 후 처음 표시되는 로그인 화면 */}
                        <Route
                          path='/'
                          element={
                            <Suspense
                              fallback={
                                <UnifiedLoading
                                  isVisible={true}
                                  size='large'
                                  message='로그인 화면을 불러오는 중...'
                                  type='fullscreen'
                                />
                              }
                            >
                              <LoginScreen />
                            </Suspense>
                          }
                        />

                        {/* 보조 로그인 페이지들은 lazy loading */}
                        <Route
                          path='/login/id'
                          element={
                            <Suspense
                              fallback={
                                <UnifiedLoading
                                  isVisible={true}
                                  message='로그인 페이지를 불러오고 있습니다'
                                  size='large'
                                  type='fullscreen'
                                />
                              }
                            >
                              <IdPasswordLoginPage />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/old-login'
                          element={
                            <Suspense
                              fallback={
                                <UnifiedLoading
                                  isVisible={true}
                                  message='로그인 페이지를 불러오고 있습니다'
                                  size='large'
                                  type='fullscreen'
                                />
                              }
                            >
                              <LoginPage />
                            </Suspense>
                          }
                        />
                        <Route element={<ProtectedRoute />}>
                          {/* 대시보드는 로그인 후 첫 페이지이므로 PageLoader 사용 */}
                          <Route
                            path='/dashboard'
                            element={
                              <Suspense
                                fallback={
                                  <UnifiedLoading
                                    isVisible={true}
                                    size='large'
                                    message='대시보드를 불러오는 중...'
                                    type='fullscreen'
                                  />
                                }
                              >
                                <DashboardPage />
                              </Suspense>
                            }
                          />

                          {/* 계좌 관련 페이지들 */}
                          <Route
                            path='/account'
                            element={
                              <Suspense
                                fallback={
                                  <UnifiedLoading
                                    isVisible={true}
                                    size='large'
                                    message='계좌 정보를 불러오는 중...'
                                    type='overlay'
                                  />
                                }
                              >
                                <AccountPage />
                              </Suspense>
                            }
                          />
                          <Route
                            path='/account/:accountId'
                            element={
                              <Suspense
                                fallback={
                                  <UnifiedLoading
                                    isVisible={true}
                                    size='large'
                                    message='계좌 상세 정보를 불러오는 중...'
                                    type='overlay'
                                  />
                                }
                              >
                                <AccountDetailPage />
                              </Suspense>
                            }
                          />
                          <Route
                            path='/account/:accountId/transactions'
                            element={
                              <Suspense
                                fallback={
                                  <UnifiedLoading
                                    isVisible={true}
                                    size='large'
                                    message='거래 내역을 불러오는 중...'
                                    type='overlay'
                                  />
                                }
                              >
                                <AccountTransactionPage />
                              </Suspense>
                            }
                          />
                          <Route
                            path='/comprehensive-account'
                            element={
                              <Suspense
                                fallback={
                                  <UnifiedLoading
                                    isVisible={true}
                                    size='large'
                                    message='종합 계좌 정보를 불러오는 중...'
                                    type='overlay'
                                  />
                                }
                              >
                                <ComprehensiveAccountPage />
                              </Suspense>
                            }
                          />

                          {/* 이체 관련 페이지들 */}
                          <Route
                            path='/transfer'
                            element={
                              <Suspense
                                fallback={
                                  <UnifiedLoading
                                    isVisible={true}
                                    size='large'
                                    message='이체 서비스를 준비하고 있습니다'
                                    type='fullscreen'
                                  />
                                }
                              >
                                <TransferPage />
                              </Suspense>
                            }
                          />
                          <Route
                            path='/transfer/picture'
                            element={
                              <Suspense
                                fallback={
                                  <UnifiedLoading
                                    isVisible={true}
                                    size='large'
                                    message='이체 화면을 불러오는 중...'
                                    type='overlay'
                                  />
                                }
                              >
                                <TransferPicturePage />
                              </Suspense>
                            }
                          />

                          {/* 거래내역 */}
                          <Route
                            path='/transactions'
                            element={
                              <Suspense
                                fallback={
                                  <UnifiedLoading
                                    isVisible={true}
                                    size='large'
                                    message='거래 내역을 불러오는 중...'
                                    type='overlay'
                                  />
                                }
                              >
                                <TransactionHistoryPage />
                              </Suspense>
                            }
                          />

                          {/* 기타 서비스 페이지들 */}
                          <Route
                            path='/shop'
                            element={
                              <Suspense
                                fallback={
                                  <UnifiedLoading
                                    isVisible={true}
                                    size='large'
                                    message='쇼핑 서비스를 불러오는 중...'
                                    type='overlay'
                                  />
                                }
                              >
                                <ShopPage />
                              </Suspense>
                            }
                          />
                          <Route
                            path='/assets'
                            element={
                              <Suspense
                                fallback={
                                  <UnifiedLoading
                                    isVisible={true}
                                    size='large'
                                    message='자산 정보를 불러오는 중...'
                                    type='overlay'
                                  />
                                }
                              >
                                <AssetsPage />
                              </Suspense>
                            }
                          />
                          <Route
                            path='/benefits'
                            element={
                              <Suspense
                                fallback={
                                  <UnifiedLoading
                                    isVisible={true}
                                    size='large'
                                    message='혜택 정보를 불러오는 중...'
                                    type='overlay'
                                  />
                                }
                              >
                                <BenefitsPage />
                              </Suspense>
                            }
                          />
                        </Route>
                        {/* 공개 페이지들 */}
                        <Route
                          path='/products'
                          element={
                            <Suspense
                              fallback={
                                <UnifiedLoading
                                  isVisible={true}
                                  size='large'
                                  message='금융상품 정보를 불러오는 중...'
                                  type='overlay'
                                />
                              }
                            >
                              <DummyPage title='금융상품' />
                            </Suspense>
                          }
                        />
                        <Route
                          path='/menu'
                          element={
                            <Suspense
                              fallback={
                                <UnifiedLoading
                                  isVisible={true}
                                  size='large'
                                  message='메뉴를 불러오는 중...'
                                  type='overlay'
                                />
                              }
                            >
                              <KBMenuPage />
                            </Suspense>
                          }
                        />
                      </Routes>
                    </PageTransition>
                  </LazyLoadErrorBoundary>
                </Router>
              </AppContainer>
            </AuthProvider>
          </NotificationProvider>
        </LoadingManager>
      </ThemeProvider>
    </QueryProvider>
  );
};
export default App;
