import React, { useState, useEffect, useCallback, useRef } from 'react';

import { Link, useParams } from 'react-router-dom';

import styled from 'styled-components';

import kbLogo from '../../assets/images/icon_poup_kb_logo.png';
import iconHome from '../../assets/images/icons/icon_appbar_home.png';
import iconArrowLeft from '../../assets/images/icons/icon_arrow_20.png';
import { apiService } from '../../services/api';
import TabBar from '../../shared/components/layout/TabBar';
import { TransactionPageSkeleton as TransactionListSkeleton } from '../../shared/components/ui/TransactionSkeleton';
import {
  androidAppContainer,
  androidOptimizedScroll,
  androidOptimizedList,
  androidOptimizedButton,
} from '../../styles/android-webview-optimizations';
import { responsiveContainer, responsiveContent } from '../../styles/responsive';
import {
  responsiveAppContainer,
  responsiveMainContent,
  responsiveHeader,
  responsiveFontSizes,
  responsiveSpacing,
} from '../../styles/responsive-overhaul';
import { tokens } from '../../styles/tokens';

import TransactionFilterModal, {
  FilterState as FilterModalState,
} from './components/TransactionFilterModal';
import TransactionGroup from './components/TransactionGroup';
import { useTransactions } from './hooks/useTransactions';

// Import icons
/**
 * KB 스타뱅킹 계좌조회 페이지 - 원본 완전 복제
 * - 원본 KB 앱과 100% 동일한 UI/UX
 * - KB 브랜드 컬러 정확히 적용
 * - 실제 KB 계좌조회 화면과 동일한 구조
 */
const TransactionHistoryContainer = styled.div`
  ${androidAppContainer}
  display: flex;
  flex-direction: column;
  background-color: ${tokens.colors.background.primary};
`;
const Header = styled.header`
  ${responsiveHeader}
  background-color: ${tokens.colors.background.primary};
  border-bottom: 1px solid ${tokens.colors.border.light};
  box-shadow: ${tokens.shadows.elevation1};
`;
const HeaderButton = styled.button`
  ${androidOptimizedButton}
  background: none;
  border: none;
  color: ${tokens.colors.text.primary};
  border-radius: ${tokens.borderRadius.medium};

  &:hover {
    background-color: ${tokens.colors.action.hover};
  }

  img {
    width: ${tokens.sizes.icon.medium};
    height: ${tokens.sizes.icon.medium};
    object-fit: contain;
  }
`;
const HeaderTitle = styled.h1`
  font-size: ${tokens.typography.fontSize.titleLarge};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.text.primary};
  margin: 0;
  letter-spacing: ${tokens.typography.letterSpacing.tight};
  font-family: ${tokens.typography.fontFamily.medium};
`;
const MainContent = styled.main`
  ${responsiveMainContent}
  background-color: ${tokens.colors.background.primary};
`;
// 월별 구분선 - 완전 반응형
const MonthDivider = styled.div`
  display: flex;
  align-items: center;
  margin: ${responsiveSpacing.lg} 0 ${responsiveSpacing.md} 0;
  padding: 0 ${responsiveSpacing.lg};
  box-sizing: border-box;

  span {
    font-size: ${responsiveFontSizes.titleSmall};
    font-weight: 600;
    color: #1c1c1e;
    background-color: ${tokens.colors.background.primary};
    padding: 0 ${responsiveSpacing.sm};
    white-space: nowrap;
  }

  &::before {
    content: '';
    flex: 1;
    height: 1px;
    background-color: #e5e5ea;
    margin-right: ${responsiveSpacing.sm};
  }

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: #e5e5ea;
    margin-left: ${responsiveSpacing.sm};
  }

  /* 작은 화면에서 조정 */
  @media (max-width: 360px) {
    margin: ${responsiveSpacing.md} 0 ${responsiveSpacing.sm} 0;
    padding: 0 ${responsiveSpacing.md};
  }
`;
const TransactionListContainer = styled.div`
  ${androidOptimizedScroll}
  background: ${tokens.colors.background.primary};
  flex: 1;
  margin-bottom: calc(60px + env(safe-area-inset-bottom));
`;
const TransactionList = styled.div`
  ${androidOptimizedList}
  display: flex;
  flex-direction: column;
`;
// 거래 항목 스타일링 - 원본 KB 앱과 완전 동일 + 완전 반응형
const TransactionItem = styled.div`
  padding: ${responsiveSpacing.md} ${responsiveSpacing.lg};
  border-bottom: 1px solid #f0f0f0;
  background-color: ${tokens.colors.background.primary};
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  /* 작은 화면에서 패딩 조정 */
  @media (max-width: 360px) {
    padding: ${responsiveSpacing.sm} ${responsiveSpacing.md};
  }
`;

const TransactionHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 4px 16px;
  width: 100%;
`;

const TransactionDate = styled.div`
  font-size: ${responsiveFontSizes.labelSmall};
  color: #8e8e93;
  font-weight: 400;
  line-height: 1.2;
  grid-row: 1;
  grid-column: 1;
  align-self: start;
`;

const TransactionName = styled.div`
  font-size: ${responsiveFontSizes.bodyLarge};
  color: #000000;
  font-weight: 600;
  line-height: 1.3;
  grid-row: 2;
  grid-column: 1;
  letter-spacing: -0.02em;
  align-self: start;

  /* 긴 거래명 말줄임 처리 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: calc(100vw - 200px);

  @media (max-width: 360px) {
    max-width: calc(100vw - 160px);
  }
`;

const TransactionAmount = styled.div<{ $type: 'income' | 'expense' }>`
  font-size: ${responsiveFontSizes.bodyLarge};
  font-weight: 600;
  color: ${props => (props.$type === 'income' ? '#007AFF' : '#FF3B30')};
  line-height: 1.2;
  grid-row: 1;
  grid-column: 2;
  letter-spacing: -0.02em;
  text-align: right;
  justify-self: end;
  white-space: nowrap;
`;

const TransactionBalance = styled.div`
  font-size: ${responsiveFontSizes.labelSmall};
  color: #8e8e93;
  font-weight: 400;
  line-height: 1.2;
  grid-row: 2;
  grid-column: 2;
  text-align: right;
  justify-self: end;
  white-space: nowrap;
`;
const ScrollToTopButton = styled.button`
  position: fixed;
  bottom: calc(${tokens.sizes.navigation.height} + ${tokens.spacing[6]});
  right: ${tokens.spacing[6]};
  width: ${tokens.sizes.touch.minimum};
  height: ${tokens.sizes.touch.minimum};
  border-radius: ${tokens.borderRadius.round};
  background: ${tokens.colors.background.primary};
  border: 1px solid ${tokens.colors.border.primary};
  box-shadow: ${tokens.shadows.elevation2};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: all 0.2s ease;

  img {
    width: ${tokens.sizes.icon.small};
    height: ${tokens.sizes.icon.small};
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${tokens.shadows.elevation3};
  }
`;
const TransactionHistoryPage: React.FC = () => {
  const { accountId } = useParams<{ accountId?: string }>();
  const [balance, setBalance] = useState(102418);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterModalState>({
    period: '3개월',
    type: '전체',
    sort: '최신순',
    amount: {
      min: '',
      max: '',
    },
  });
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  // 무한 스크롤을 위한 ref
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  // 백엔드 연동 거래내역 훅 사용
  const {
    transactions,
    loading,
    error,
    pagination,
    filters: currentFilters,
    loadMore,
    refresh,
  } = useTransactions({
    accountId: accountId || 'mock-account-1',
    initialFilters: {
      limit: 50,
      sort_by: 'date_desc',
    },
    autoLoad: true,
  });
  // 계좌 정보 로드
  useEffect(() => {
    const loadAccountInfo = async () => {
      try {
        if (accountId) {
          const account = await apiService.getAccountById(accountId);
          setAccountInfo(account);
          setBalance(account.balance);
        } else {
          // 기본 계좌 사용
          setAccountInfo({
            id: 'mock-account-1',
            account_number: '705601-01-500920',
            account_name: 'KB국민ONE통장-보통예금',
            balance: 102418,
          });
        }
      } catch (error) {
        // 기본값 설정
        setAccountInfo({
          id: 'mock-account-1',
          account_number: '705601-01-500920',
          account_name: 'KB국민ONE통장-보통예금',
          balance: 102418,
        });
      }
    };
    loadAccountInfo();
    // 초기 로딩 완료 후 상태 변경
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [accountId]);
  const handleFilterApply = (newFilters: FilterModalState) => {
    setFilters(newFilters);
    // 여기서 필터 적용 로직 추가 가능
  };
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  // 무한 스크롤을 위한 Intersection Observer 설정
  useEffect(() => {
    if (!pagination?.has_next) {
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          if (!loading) {
            loadMore();
          }
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0,
      }
    );
    observerRef.current = observer;
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [pagination?.has_next, loading, loadMore]);
  // 초기 로딩 상태 - 전체 페이지 스켈레톤 표시
  if (isInitialLoading && transactions.length === 0) {
    return (
      <TransactionHistoryContainer>
        <Header>
          <HeaderButton as={Link} to='/dashboard'>
            <img
              src='/assets/images/icons/icon_arrow_20.png'
              alt='뒤로가기'
              style={{ transform: 'rotate(180deg)' }}
            />
          </HeaderButton>
          <HeaderTitle>통합거래내역조회</HeaderTitle>
          <HeaderButton>
            <img src='/assets/images/icons/icon_appbar_menu.png' alt='메뉴' />
          </HeaderButton>
        </Header>
        <MainContent>
          <TransactionListSkeleton />
        </MainContent>
        <TabBar />
      </TransactionHistoryContainer>
    );
  }
  return (
    <TransactionHistoryContainer>
      <Header>
        <HeaderButton as={Link} to='/dashboard'>
          <img
            src='/assets/images/icons/icon_arrow_20.png'
            alt='뒤로가기'
            style={{ transform: 'rotate(180deg)' }}
          />
        </HeaderButton>
        <HeaderTitle>통합거래내역조회</HeaderTitle>
        <HeaderButton>
          <img src='/assets/images/icons/icon_appbar_menu.png' alt='메뉴' />
        </HeaderButton>
      </Header>
      <MainContent>
        {/* 거래내역 */}
        <TransactionListContainer>
          {error && (
            <div
              style={{
                color: '#ff4444',
                textAlign: 'center',
                padding: '20px',
                fontSize: '14px',
              }}
            >
              {error}
              <button
                onClick={refresh}
                style={{
                  display: 'block',
                  margin: '10px auto 0',
                  padding: '8px 16px',
                  backgroundColor: '#ffd338',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                다시 시도
              </button>
            </div>
          )}
          {loading && transactions.length === 0 ? (
            <TransactionListSkeleton />
          ) : (
            <TransactionList>
              {(() => {
                // 월별로 거래내역 그룹화
                const groupedByMonth = transactions.reduce(
                  (groups, transaction) => {
                    const transactionDate = new Date(transaction.transaction_date);
                    const monthKey = `${transactionDate.getFullYear()}.${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;

                    if (!groups[monthKey]) {
                      groups[monthKey] = [];
                    }
                    groups[monthKey].push(transaction);
                    return groups;
                  },
                  {} as Record<string, typeof transactions>
                );

                return Object.entries(groupedByMonth).map(([monthKey, monthTransactions]) => (
                  <React.Fragment key={monthKey}>
                    <MonthDivider>
                      <span>{monthKey}</span>
                    </MonthDivider>
                    {monthTransactions.map(transaction => {
                      const transactionDate = new Date(transaction.transaction_date);
                      const dateStr = transactionDate
                        .toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })
                        .replace(/\./g, '.')
                        .replace(/ /g, '');
                      const timeStr = transactionDate.toLocaleTimeString('ko-KR', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      });

                      const isIncome = transaction.amount > 0;
                      const amountText = isIncome ? '입금' : '출금';
                      const displayAmount = Math.abs(transaction.amount).toLocaleString();

                      return (
                        <TransactionItem key={transaction.id}>
                          <TransactionHeader>
                            <TransactionDate>
                              {dateStr} {timeStr}
                            </TransactionDate>
                            <TransactionAmount $type={isIncome ? 'income' : 'expense'}>
                              {amountText} {displayAmount}원
                            </TransactionAmount>
                            <TransactionName>{transaction.description}</TransactionName>
                            <TransactionBalance>
                              잔액 {transaction.balance_after?.toLocaleString() || '0'}원
                            </TransactionBalance>
                          </TransactionHeader>
                        </TransactionItem>
                      );
                    })}
                  </React.Fragment>
                ));
              })()}
              {/* 무한 스크롤 트리거 */}
              {pagination?.has_next && (
                <div
                  ref={loadMoreRef}
                  style={{
                    height: '50px',
                    marginTop: '20px',
                    backgroundColor: 'red', // 디버깅을 위해 빨간색으로 표시
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  스크롤 트리거 (디버깅용)
                </div>
              )}
              {/* 추가 로딩 중 스켈레톤 */}
              {loading && transactions.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <TransactionListSkeleton />
                </div>
              )}
              {transactions.length === 0 && !loading && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#696e76',
                  }}
                >
                  거래내역이 없습니다.
                </div>
              )}
            </TransactionList>
          )}
        </TransactionListContainer>
      </MainContent>
      <TransactionFilterModal
        show={showFilter}
        onClose={() => setShowFilter(false)}
        filters={filters}
        onApply={handleFilterApply}
      />
      <ScrollToTopButton onClick={scrollToTop}>
        <span style={{ fontSize: '18px', transform: 'rotate(-90deg)' }}>→</span>
      </ScrollToTopButton>
      <TabBar />
    </TransactionHistoryContainer>
  );
};
export default TransactionHistoryPage;
