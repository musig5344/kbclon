import React, { useEffect, useState, useCallback, useMemo } from 'react';

import { Link } from 'react-router-dom';

import { useAuth } from '../../core/auth/AuthContext';
import { supabase } from '../../infrastructure/db/supabase';
import TabBar from '../../shared/components/layout/TabBar';
import { MoreOptionsModal } from '../../shared/components/ui/MoreOptionsModal';
import { TransactionPageSkeleton } from '../../shared/components/ui/TransactionSkeleton';

// 컴포넌트 import
import AccountInfoSection from './components/AccountInfoSection';
import { TransactionDetailModal, FilterModal } from './components/AccountModals';
import TransactionListSection from './components/TransactionListSection';
// 타입 및 유틸리티 함수 import
import {
  AccountPageContainer,
  MainContent,
  AccountHeader,
  HeaderButton,
  HeaderTitle,
  HeaderRightButtons,
  FilterSection,
  SearchIcon,
  FilterOptions,
  FilterButton,
  ToggleSwitch,
  DateRangeSection,
  DateRangeText,
  ScrollToTopButton
} from './styles/AccountPage.styles';
import { Transaction, FilterPeriod, FilterType, FilterSort } from './types';
import { getDefaultDateRange } from './utils/transactionFilters';

// 스타일드 컴포넌트 import
const AccountPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('3개월');
  const [filterType, setFilterType] = useState<FilterType>('전체');
  const [filterSort, setFilterSort] = useState<FilterSort>('최신순');
  const defaultDateRange = getDefaultDateRange('3개월');
  const [startDate, setStartDate] = useState(defaultDateRange.startDate);
  const [endDate, setEndDate] = useState(defaultDateRange.endDate);
  const [account, setAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // 샘플 거래내역 생성 함수
  const getSampleTransactions = useCallback((): Transaction[] => [
    { id: '1', date: '2025.05.20', time: '16:29:53', desc: 'KB국민은행', amount: 200000, balance: 413232, type: 'income' },
    { id: '2', date: '2025.05.16', time: '16:20:19', desc: '스타벅스코리아', amount: -22000, balance: 213232, type: 'expense' },
    { id: '3', date: '2025.05.16', time: '14:53:16', desc: '급여', amount: 2200000, balance: 2413232, type: 'income' },
    { id: '4', date: '2025.05.15', time: '19:07:00', desc: '이체입금', amount: 150000, balance: 213232, type: 'income' },
    { id: '5', date: '2025.05.12', time: '20:51:46', desc: 'LG전자구독료', amount: -15900, balance: 63232, type: 'expense' },
  ], []);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // 1. 계좌 정보 가져오기
        const { data: accountData, error: accountError } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('is_primary', { ascending: false })
          .limit(1)
          .single();
        if (accountError) {
          // Mock 데이터 사용
          setAccount({
            id: 'mock-account',
            account_name: 'KB국민 ONE통장',
            account_number: '110-609-756856',
            balance: 510000
          });
        } else {
          setAccount(accountData);
        }
        // 2. 거래내역 가져오기
        const { data: transactionData, error: transactionError } = await supabase
          .from('transactions')
          .select('*')
          .eq('account_id', accountData?.id || 'mock-account')
          .order('transaction_date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(100);
        if (transactionError) {
          // Mock 데이터 사용
          setTransactions(getSampleTransactions());
        } else {
          // Supabase 데이터를 Transaction 타입으로 변환
          const convertedTransactions: Transaction[] = transactionData?.map((tx, index: number) => ({
            id: tx.id ? String(tx.id) : String(index),
            date: tx.transaction_date ? new Date(tx.transaction_date).toISOString().split('T')[0].replace(/-/g, '.') : '2025.07.21',
            time: tx.transaction_date ? new Date(tx.transaction_date).toTimeString().split(' ')[0] : '12:00:00',
            desc: tx.description || tx.recipient_name || '거래없음',
            amount: tx.amount || 0,
            balance: tx.balance_after || 0,
            type: (tx.amount || 0) > 0 ? 'income' : 'expense'
          })) || [];
          setTransactions(convertedTransactions.length > 0 ? convertedTransactions : getSampleTransactions());
        }
      } catch (error) {
        // 에러 때 Mock 데이터 사용
        setAccount({
          id: 'mock-account',
          account_name: 'KB국민 ONE통장',
          account_number: '110-609-756856',
          balance: 510000
        });
        setTransactions(getSampleTransactions());
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);
  // 이벤트 핸들러들
  const handleShowFilterModal = useCallback(() => setShowFilterModal(true), []);
  const handleToggleBalance = useCallback(() => setShowBalance(prev => !prev), []);
  const handleTransactionClick = useCallback((transaction: Transaction) => setSelectedTransaction(transaction), []);
  const handleScrollToTop = useCallback(() => window.scrollTo({top: 0, behavior: 'smooth'}), []);
  const handleCloseTransaction = useCallback(() => setSelectedTransaction(null), []);
  const handleCloseFilter = useCallback(() => setShowFilterModal(false), []);
  const handleConfirmFilter = useCallback(() => {
    setShowFilterModal(false);
  }, []);
  const handleCloseMoreOptions = useCallback(() => setShowMoreOptions(false), []);
  
  if (loading) {
    return (
      <AccountPageContainer>
        <AccountHeader>
          <HeaderButton as={Link} to="/dashboard">
            <img src="/assets/images/icons/icon_arrow_20.png" alt="뒤로가기" style={{transform: 'rotate(180deg)'}} />
          </HeaderButton>
          <HeaderTitle>거래내역조회</HeaderTitle>
          <HeaderRightButtons>
            <HeaderButton as={Link} to="/dashboard">
              <img src="/assets/images/icons/icon_home.png" alt="" />
            </HeaderButton>
            <HeaderButton as={Link} to="/menu">
              <img src="/assets/images/icons/icon_appbar_menu.png" alt="전체메뉴" />
            </HeaderButton>
          </HeaderRightButtons>
        </AccountHeader>
        <MainContent>
          <TransactionPageSkeleton />
        </MainContent>
        <TabBar />
      </AccountPageContainer>
    );
  }
  return (
    <AccountPageContainer>
      <AccountHeader>
        <HeaderButton as={Link} to="/dashboard">
          <img src="/assets/images/icons/icon_arrow_20.png" alt="뒤로가기" style={{transform: 'rotate(180deg)'}} />
        </HeaderButton>
        <HeaderTitle>거래내역조회</HeaderTitle>
        <HeaderRightButtons>
          <HeaderButton as={Link} to="/dashboard">
            <img src="/assets/images/icons/icon_home.png" alt="" />
          </HeaderButton>
          <HeaderButton as={Link} to="/menu">
            <img src="/assets/images/icons/icon_appbar_menu.png" alt="전체메뉴" />
          </HeaderButton>
        </HeaderRightButtons>
      </AccountHeader>
      <MainContent>
        {/* 계좌 정보 */}
        <AccountInfoSection account={account} />
        {/* 필터 섹션 */}
        <FilterSection>
          <SearchIcon />
          <FilterOptions>
            <FilterButton onClick={handleShowFilterModal}>
              {filterPeriod} • {filterType} • {filterSort}
            </FilterButton>
            <ToggleSwitch 
              enabled={showBalance} 
              onClick={handleToggleBalance} 
            />
          </FilterOptions>
        </FilterSection>
        {/* 날짜 범위 */}
        <DateRangeSection>
          <DateRangeText>{startDate} ~ {endDate}</DateRangeText>
        </DateRangeSection>
        {/* 날짜별 거래내역 */}
        <TransactionListSection
          transactions={transactions}
          filterPeriod={filterPeriod}
          filterType={filterType}
          filterSort={filterSort}
          startDate={startDate}
          endDate={endDate}
          onTransactionClick={handleTransactionClick}
        />
        {/* 위로 스크롤 버튼 */}
        <ScrollToTopButton onClick={handleScrollToTop}>
          <img src="/assets/images/icons/icon_arrow_20.png" alt="위로" style={{transform: 'rotate(-90deg)'}} />
        </ScrollToTopButton>
      </MainContent>
      <TabBar />
      {/* 거래내역 상세 모달 */}
      {selectedTransaction && (
        <TransactionDetailModal 
          transaction={selectedTransaction} 
          onClose={handleCloseTransaction}
        />
      )}
      {/* 조회기간 설정 모달 */}
      {showFilterModal && (
        <FilterModal 
          show={showFilterModal}
          filterPeriod={filterPeriod}
          filterType={filterType}
          filterSort={filterSort}
          startDate={startDate}
          endDate={endDate}
          onPeriodChange={setFilterPeriod}
          onTypeChange={setFilterType}
          onSortChange={setFilterSort}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClose={handleCloseFilter}
          onConfirm={handleConfirmFilter}
        />
      )}
      <MoreOptionsModal 
        show={showMoreOptions} 
        onClose={handleCloseMoreOptions}
      />
    </AccountPageContainer>
  );
};
export default AccountPage;