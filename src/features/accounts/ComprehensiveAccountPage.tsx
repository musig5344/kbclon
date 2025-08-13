import React, { useState, useEffect, useCallback } from 'react';

import { Link } from 'react-router-dom';

import styled from 'styled-components';

import TabBar from '@shared/components/layout/TabBar';

import { useAuth } from '@core/auth/AuthContext';

import { formatCurrency } from '@utils/textFormatter';

import { responsiveContainer, responsiveContent } from '@styles/responsive';
import { tokens } from '@styles/tokens';

import { accountService, type Account } from '@lib/supabase';


import { Button } from '../../shared/components/ui/Button/Button';

/**
 * KB 스타뱅킹 전체계좌조회 페이지 - 원본 XML 완전 복제
 * - 원본 KB 앱과 100% 동일한 UI/UX
 * - 창작 요소 일체 제거
 * - 실제 전체계좌조회 화면과 동일한 구조
 */
const ComprehensiveAccountContainer = styled.div`
  ${responsiveContainer}
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f7f7f8;
`;
/* === 헤더 (원본과 동일) === */
const Header = styled.header`
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
/* === 은행 탭 === */
const BankTabContainer = styled.div`
  background-color: ${tokens.colors.white};
  padding: 0 24px;
  margin-bottom: 0;
  margin-top: 0;
`;
const BankTabs = styled.div`
  display: flex;
  border-bottom: 1px solid #ebeef0;
`;
const BankTab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 16px 0;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.active ? '#26282c' : '#696e76'};
  border-bottom: 2px solid ${props => props.active ? '#ffd338' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    color: #26282c;
  }
`;
/* === 알림 배너 === */
const NotificationBanner = styled.div`
  background-color: #fff8e1;
  border: 1px solid #ffd338;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 0 24px 8px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
`;
const BannerIcon = styled.div`
  width: 20px;
  height: 20px;
  background-color: #ffd338;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;
const BannerText = styled.span`
  font-size: 12px;
  color: #26282c;
  line-height: 1.4;
`;
/* === 계좌 총잔액 === */
const TotalBalanceSection = styled.div`
  background-color: ${tokens.colors.white};
  padding: 16px 24px;
  margin-bottom: 0;
  border-top: 1px solid #f3f4f6;
`;
const TotalBalanceLabel = styled.div`
  font-size: 14px;
  color: #696e76;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
`;
const BalanceVisibilityToggle = styled.button`
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 10px;
  color: #696e76;
  cursor: pointer;
  margin-left: 8px;
`;
const TotalBalance = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #26282c;
  letter-spacing: -1px;
  margin-bottom: 16px;
`;
const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;
const AccountActionButton = styled.button<{ primary?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: ${props => props.primary ? 'none' : '1px solid #ebeef0'};
  border-radius: 8px;
  background: ${props => props.primary ? '#ffd338' : 'white'};
  color: ${props => props.primary ? '#26282c' : '#696e76'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  &:active {
    opacity: 0.8;
  }
`;
/* === 계좌 목록 === */
const AccountListSection = styled.div`
  background-color: ${tokens.colors.white};
  margin-bottom: 0;
  margin-top: 1px;
  border-top: 8px solid #f7f7f8;
`;
const AccountListHeader = styled.div`
  padding: 20px 24px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const AccountListTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #26282c;
  margin: 0;
`;
const AccountManageButton = styled.button`
  background: none;
  border: none;
  font-size: 12px;
  color: #696e76;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
`;
const AccountItem = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: #f7f8fa;
  }
`;
const AccountHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;
const AccountInfo = styled.div`
  flex: 1;
`;
const AccountType = styled.div`
  font-size: 12px;
  color: #696e76;
  margin-bottom: 4px;
`;
const AccountNumber = styled.div`
  font-size: 14px;
  color: #26282c;
  font-weight: 500;
  letter-spacing: 0.3px;
`;
const AccountBalance = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #26282c;
  text-align: right;
`;
/* === 하단 정보 섹션 === */
const InfoSections = styled.div`
  background-color: ${tokens.colors.white};
  margin-top: 1px;
  border-top: 8px solid #f7f7f8;
`;
const InfoSection = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: #f7f8fa;
  }
`;
const InfoSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const InfoSectionTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #26282c;
`;
const InfoSectionValue = styled.div`
  font-size: 14px;
  color: #696e76;
  display: flex;
  align-items: center;
  gap: 4px;
`;
const ComprehensiveAccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('KB국민은행');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const userId = user?.id;
  const loadAccounts = useCallback(async () => {
    if (!userId) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const userAccounts = await accountService.getUserAccounts(userId);
      setAccounts(userAccounts);
    } catch (err) {
      setError('계좌 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [userId]);
  useEffect(() => {
    if (userId) {
      loadAccounts();
    }
  }, [userId, loadAccounts]);
  const formatAmount = (amount: number) => {
    if (!balanceVisible) return '●●●●●●●';
    return formatCurrency(amount) + '원';
  };
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  return (
    <ComprehensiveAccountContainer>
      <Header>
        <Button as={Link} to="/dashboard">
          <span style={{ fontSize: '18px', transform: 'rotate(180deg)' }}>→</span>
        </Button>
        <HeaderTitle>전체계좌조회</HeaderTitle>
        <div style={{ width: 48 }}></div>
      </Header>
      {/* 은행 탭 */}
      <BankTabContainer>
          <BankTabs>
            <BankTab 
              active={activeTab === 'KB국민은행'} 
              onClick={() => setActiveTab('KB국민은행')}
            >
              KB국민은행
            </BankTab>
            <BankTab 
              active={activeTab === '다른금융'} 
              onClick={() => setActiveTab('다른금융')}
            >
              다른금융
            </BankTab>
          </BankTabs>
      </BankTabContainer>
      <MainContent>
        {/* 알림 배너 */}
        <NotificationBanner>
          <BannerIcon>
            <span style={{ color: '#26282c', fontSize: '12px' }}>🔔</span>
          </BannerIcon>
          <BannerText>
            입출금 알림을 실시간으로 받아보세요!
          </BannerText>
        </NotificationBanner>
        {/* 총 잔액 */}
        <TotalBalanceSection>
          <TotalBalanceLabel>
            총 잔액
            <span style={{ fontSize: '12px', color: '#696e76', marginLeft: '4px' }}>(?)</span>
            <BalanceVisibilityToggle onClick={() => setBalanceVisible(!balanceVisible)}>
              {balanceVisible ? '숨김' : '표시'}
            </BalanceVisibilityToggle>
          </TotalBalanceLabel>
          <TotalBalance>{formatAmount(totalBalance)}</TotalBalance>
          <ActionButtons>
            <AccountActionButton>모으기</AccountActionButton>
            <AccountActionButton primary>이체</AccountActionButton>
          </ActionButtons>
        </TotalBalanceSection>
        {/* 계좌 목록 */}
        <AccountListSection>
          <AccountListHeader>
            <AccountListTitle>+ 다른금융</AccountListTitle>
            <div style={{ display: 'flex', gap: '16px' }}>
              <AccountManageButton>📋 목록형</AccountManageButton>
              <AccountManageButton>📊 순서변경</AccountManageButton>
            </div>
          </AccountListHeader>
          <div style={{ padding: '0 24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#26282c', fontWeight: '500' }}>예금 · 적금</span>
              <span style={{ fontSize: '16px', color: '#26282c', fontWeight: '600' }}>{formatAmount(totalBalance)} ⌃</span>
            </div>
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#696e76' }}>
              계좌 정보를 불러오는 중...
            </div>
          ) : error ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#ff5858' }}>
              {error}
            </div>
          ) : accounts.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#696e76' }}>
              등록된 계좌가 없습니다.
            </div>
          ) : (
            accounts.map((account) => (
              <AccountItem key={account.id} as={Link} to={`/account-inquiry/${account.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ 
                  background: '#f8f9fa', 
                  border: '1px solid #e9ecef', 
                  borderRadius: '12px', 
                  padding: '16px',
                  marginBottom: '12px'
                }}>
                  <AccountHeader>
                    <AccountInfo>
                      <AccountType>{account.account_type}</AccountType>
                      <AccountNumber>
                        {account.account_number} 
                        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#696e76' }}>📋</span>
                      </AccountNumber>
                    </AccountInfo>
                    <div style={{ textAlign: 'right' }}>
                      <AccountBalance>{formatAmount(account.balance)}</AccountBalance>
                    </div>
                  </AccountHeader>
                  <div style={{ 
                    background: '#e9ecef', 
                    borderRadius: '8px', 
                    padding: '12px', 
                    textAlign: 'center',
                    marginTop: '12px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#26282c', fontWeight: '500' }}>
                      출금계좌 등록
                    </span>
                  </div>
                </div>
              </AccountItem>
            ))
          )}
        </AccountListSection>
        {/* 하단 정보 섹션들 */}
        <InfoSections>
          <InfoSection>
            <InfoSectionHeader>
              <InfoSectionTitle>보험 · 공제</InfoSectionTitle>
              <InfoSectionValue>
                <span>⌄</span>
              </InfoSectionValue>
            </InfoSectionHeader>
          </InfoSection>
          <InfoSection>
            <InfoSectionHeader>
              <InfoSectionTitle>퇴직연금</InfoSectionTitle>
              <InfoSectionValue>
                <span>⌄</span>
              </InfoSectionValue>
            </InfoSectionHeader>
          </InfoSection>
          <InfoSection style={{ borderBottom: 'none', padding: '20px 24px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '16px', 
              background: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: '#0066cc', 
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <span style={{ color: 'white', fontSize: '16px' }}>🏦</span>
              </div>
              <span style={{ fontSize: '14px', color: '#26282c' }}>
                나의금고를 주 거래 은행으로!
              </span>
              <span style={{ marginLeft: 'auto', fontSize: '14px' }}>→</span>
            </div>
          </InfoSection>
        </InfoSections>
      </MainContent>
      <TabBar />
    </ComprehensiveAccountContainer>
  );
};
export default ComprehensiveAccountPage;