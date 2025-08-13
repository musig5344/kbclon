import React, { useState, useEffect } from 'react';

import { Link, useParams } from 'react-router-dom';

import styled from 'styled-components';

import TabBar from '@shared/components/layout/TabBar';

import { formatCurrency } from '@utils/textFormatter';

import { responsiveContainer, responsiveContent } from '@styles/responsive';
import { tokens } from '@styles/tokens';

import { accountService, transactionService, type Account, type Transaction } from '@lib/supabase';

import { Button } from '../../shared/components/ui/Button/Button';

/**
 * KB 스타뱅킹 전체계좌조회 페이지 - 원본 XML 완전 복제
 * - 원본 KB 앱과 100% 동일한 UI/UX
 * - 창작 요소 일체 제거
 * - 실제 계좌정보 화면과 동일한 구조
 */
const AccountInquiryContainer = styled.div`
  ${responsiveContainer}
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f7f7f8;
`;
/* === 헤더 (원본과 동일) === */
const AccountInquiryHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  height: 48px;
  background-color: ${tokens.colors.white};
  border-bottom: 1px solid #ebeef0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;
const HeaderTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #26282c;
  margin: 0;
`;
const MainContent = styled.main`
  ${responsiveContent}
  flex: 1;
  padding-bottom: calc(60px + env(safe-area-inset-bottom)); /* TabBar height + safe area */
  min-height: calc(100vh - 48px); /* viewport height - header height */
`;
/* === 계좌 정보 카드 === */
const AccountInfoCard = styled.div`
  background-color: ${tokens.colors.white};
  padding: 32px 24px;
  margin-bottom: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;
const BankBranding = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
`;
const BankLogo = styled.div`
  width: 36px;
  height: 36px;
  background-color: #ffd338;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  &::before {
    content: '★';
    color: #26282c;
    font-size: 20px;
    font-weight: bold;
  }
`;
const BankName = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #26282c;
`;
const AccountNumber = styled.div`
  font-size: 18px;
  color: #484b51;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
`;
const AccountHolder = styled.div`
  font-size: 14px;
  color: #696e76;
  margin-bottom: 20px;
`;
const BalanceContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const Balance = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #26282c;
  letter-spacing: -0.5px;
`;
const BalanceToggle = styled.button`
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 12px;
  color: #696e76;
  cursor: pointer;
  &:hover {
    background-color: #f3f4f6;
  }
`;
/* === 액션 버튼 그리드 === */
const ActionButtonGrid = styled.div`
  background-color: ${tokens.colors.white};
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;
const ActionButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  border: 1px solid #ebeef0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
  &:hover {
    background-color: #f7f8fa;
    border-color: #ffd338;
  }
  &:active {
    background-color: #eef1f5;
  }
`;
const ActionIcon = styled.div`
  width: 48px;
  height: 48px;
  background-color: #f3f4f6;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  font-size: 20px;
`;
const ActionText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #26282c;
  text-align: center;
`;
/* === 최근 거래내역 섹션 === */
const RecentTransactionsSection = styled.div`
  background-color: ${tokens.colors.white};
  margin-top: 8px;
`;
const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
`;
const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #26282c;
  margin: 0;
`;
const SeeMoreButton = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  color: #696e76;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  &:hover {
    color: #26282c;
  }
`;
const TransactionList = styled.div`
  padding: 0 24px 24px;
`;
const TransactionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
  &:last-child {
    border-bottom: none;
  }
`;
const TransactionInfo = styled.div`
  flex: 1;
`;
const TransactionDate = styled.div`
  font-size: 12px;
  color: #696e76;
  margin-bottom: 4px;
`;
const TransactionDescription = styled.div`
  font-size: 14px;
  color: #26282c;
  font-weight: 500;
`;
const TransactionAmount = styled.div<{ type: '입금' | '출금' | '이체' }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => (props.type === '입금' ? '#22c55e' : '#26282c')};
  text-align: right;
`;
const TransactionType = styled.div<{ type: '입금' | '출금' | '이체' }>`
  font-size: 12px;
  color: ${props => (props.type === '입금' ? '#22c55e' : '#696e76')};
  text-align: right;
  margin-top: 2px;
`;
const AccountInquiryPage: React.FC = () => {
  // const navigate = useNavigate(); // 사용되지 않음
  const { accountId } = useParams<{ accountId: string }>();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [account, setAccount] = useState<Account | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (accountId) {
      loadAccountData();
    }
  }, [accountId]);
  const loadAccountData = async () => {
    if (!accountId) return;
    try {
      setLoading(true);
      // 계좌 정보와 최근 거래내역을 병렬로 로드
      const [accountData, transactionsData] = await Promise.all([
        accountService.getAccount(accountId),
        transactionService.getRecentTransactions(accountId, 5),
      ]);
      setAccount(accountData);
      setRecentTransactions(transactionsData);
    } catch (err) {
      setError('계좌 정보를 불러올 수 없습니다.');
      // 에러 발생시 샘플 데이터 사용
      setAccount({
        id: 'sample-account-1',
        user_id: 'user-demo-id',
        account_number: '1002-123-456789',
        account_name: 'KB국민ONE통장-보통예금',
        account_type: 'KB국민ONE통장-보통예금',
        bank_name: 'KB국민은행',
        account_holder: '김○○',
        balance: 102418,
        is_primary: true,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setRecentTransactions([
        {
          id: '1',
          account_id: accountId,
          transaction_type: '입금',
          amount: 50000,
          description: '카카오뱅크',
          transaction_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          balance_after: 102418,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          account_id: accountId,
          transaction_type: '출금',
          amount: 4500,
          description: '스타벅스코리아',
          transaction_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          balance_after: 52418,
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          account_id: accountId,
          transaction_type: '출금',
          amount: 15000,
          description: '교보문고',
          transaction_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          balance_after: 56918,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${month}/${day} (${weekday})`;
  };
  if (loading) {
    return (
      <AccountInquiryContainer>
        <AccountInquiryHeader>
          <Button as={Link} to='/comprehensive-account'>
            <span style={{ fontSize: '18px', transform: 'rotate(180deg)' }}>→</span>
          </Button>
          <HeaderTitle>계좌정보</HeaderTitle>
          <Button>
            <span style={{ fontSize: '18px' }}>⋮</span>
          </Button>
        </AccountInquiryHeader>
        <div style={{ padding: '40px', textAlign: 'center', color: '#696e76', flex: 1 }}>
          계좌 정보를 불러오는 중...
        </div>
        <TabBar />
      </AccountInquiryContainer>
    );
  }
  if (error || !account) {
    return (
      <AccountInquiryContainer>
        <AccountInquiryHeader>
          <Button as={Link} to='/comprehensive-account'>
            <span style={{ fontSize: '18px', transform: 'rotate(180deg)' }}>→</span>
          </Button>
          <HeaderTitle>계좌정보</HeaderTitle>
          <Button>
            <span style={{ fontSize: '18px' }}>⋮</span>
          </Button>
        </AccountInquiryHeader>
        <div style={{ padding: '40px', textAlign: 'center', color: '#ff5858', flex: 1 }}>
          {error || '계좌를 찾을 수 없습니다.'}
        </div>
        <TabBar />
      </AccountInquiryContainer>
    );
  }
  return (
    <AccountInquiryContainer>
      <AccountInquiryHeader>
        <Button as={Link} to='/dashboard'>
          <span style={{ fontSize: '18px', transform: 'rotate(180deg)' }}>→</span>
        </Button>
        <HeaderTitle>계좌정보</HeaderTitle>
        <Button>
          <span style={{ fontSize: '18px' }}>⋮</span>
        </Button>
      </AccountInquiryHeader>
      <MainContent>
        {/* 계좌 정보 카드 */}
        <AccountInfoCard>
          <BankBranding>
            <BankLogo />
            <BankName>{account.bank_name}</BankName>
          </BankBranding>
          <AccountNumber>{account.account_number}</AccountNumber>
          <AccountHolder>{account.account_holder}</AccountHolder>
          <BalanceContainer>
            <Balance>{balanceVisible ? formatCurrency(account.balance) + '원' : '●●●●●●●'}</Balance>
            <BalanceToggle onClick={() => setBalanceVisible(!balanceVisible)}>
              {balanceVisible ? '숨김' : '표시'}
            </BalanceToggle>
          </BalanceContainer>
        </AccountInfoCard>
        {/* 액션 버튼 그리드 */}
        <ActionButtonGrid>
          <ActionButton as={Link} to='/transaction-history'>
            <ActionIcon>📋</ActionIcon>
            <ActionText>거래내역조회</ActionText>
          </ActionButton>
          <ActionButton as={Link} to='/transfer'>
            <ActionIcon>💳</ActionIcon>
            <ActionText>계좌이체</ActionText>
          </ActionButton>
          <ActionButton>
            <ActionIcon>📊</ActionIcon>
            <ActionText>한도조회/변경</ActionText>
          </ActionButton>
          <ActionButton>
            <ActionIcon>⚙️</ActionIcon>
            <ActionText>기타서비스</ActionText>
          </ActionButton>
        </ActionButtonGrid>
        {/* 최근 거래내역 */}
        <RecentTransactionsSection>
          <SectionHeader>
            <SectionTitle>최근 거래내역</SectionTitle>
            <SeeMoreButton as={Link} to='/transaction-history'>
              전체보기
              <span style={{ fontSize: '12px' }}>→</span>
            </SeeMoreButton>
          </SectionHeader>
          <TransactionList>
            {recentTransactions.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#696e76' }}>
                최근 거래내역이 없습니다.
              </div>
            ) : (
              recentTransactions.map(transaction => (
                <TransactionItem key={transaction.id}>
                  <TransactionInfo>
                    <TransactionDate>
                      {formatTransactionDate(transaction.transaction_date)}
                    </TransactionDate>
                    <TransactionDescription>{transaction.description}</TransactionDescription>
                  </TransactionInfo>
                  <div>
                    <TransactionAmount type={transaction.transaction_type}>
                      {transaction.transaction_type === '입금' ? '+' : '-'}
                      {formatCurrency(transaction.amount) + '원'}
                    </TransactionAmount>
                    <TransactionType type={transaction.transaction_type}>
                      {transaction.transaction_type}
                    </TransactionType>
                  </div>
                </TransactionItem>
              ))
            )}
          </TransactionList>
        </RecentTransactionsSection>
      </MainContent>
      <TabBar />
    </AccountInquiryContainer>
  );
};
export default AccountInquiryPage;
