/**
 * 접근 가능한 계좌 선택 컴포넌트
 * WCAG 2.1 라디오 버튼 그룹 및 계좌 정보 접근성
 */

import React, { useRef, useEffect } from 'react';

import styled from 'styled-components';

import { KeyboardNavigator } from '../utils/focusManagement';
import { announce, formatAmountForScreenReader, formatAccountNumberForScreenReader } from '../utils/screenReader';

interface Account {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  type: string;
}

interface Props {
  accounts: Account[];
  selectedAccountId?: string;
  onSelect: (account: Account) => void;
  label?: string;
  error?: string;
  required?: boolean;
}

const Container = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.div<{ required?: boolean }>`
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};

  ${({ required, theme }) => required && `
    &::after {
      content: ' *';
      color: ${theme.colors.error};
    }
  `}
`;

const AccountList = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  overflow: hidden;
`;

const AccountItem = styled.label<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  background-color: ${({ theme, selected }) => 
    selected ? theme.colors.backgroundGray1 : theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundGray1};
  }

  &:focus-within {
    outline: 2px solid ${({ theme }) => theme.colors.accentBlue};
    outline-offset: -2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const RadioInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

const RadioButton = styled.span<{ checked?: boolean }>`
  width: 20px;
  height: 20px;
  border: 2px solid ${({ theme, checked }) => 
    checked ? theme.colors.accentBlue : theme.colors.border};
  border-radius: 50%;
  margin-right: 12px;
  position: relative;
  flex-shrink: 0;

  ${({ checked, theme }) => checked && `
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 10px;
      background-color: ${theme.colors.accentBlue};
      border-radius: 50%;
    }
  `}
`;

const AccountInfo = styled.div`
  flex: 1;
`;

const AccountName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 4px;
`;

const AccountNumber = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 4px;
`;

const AccountBalance = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ErrorMessage = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.error};
  font-weight: 500;
`;

const ScreenReaderOnly = styled.span`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

export const AccessibleAccountSelector: React.FC<Props> = ({
  accounts,
  selectedAccountId,
  onSelect,
  label = '계좌 선택',
  error,
  required = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigatorRef = useRef<KeyboardNavigator | null>(null);
  const groupId = `account-group-${Date.now()}`;
  const errorId = `${groupId}-error`;

  useEffect(() => {
    if (containerRef.current) {
      navigatorRef.current = new KeyboardNavigator(containerRef.current, {
        orientation: 'vertical'
      });
    }

    return () => {
      navigatorRef.current?.destroy();
    };
  }, []);

  const handleSelect = (account: Account) => {
    onSelect(account);
    
    const balanceText = formatAmountForScreenReader(account.balance);
    announce(`${account.name} 계좌가 선택되었습니다. 잔액: ${balanceText}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent, account: Account) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(account);
    }
  };

  return (
    <Container>
      <Label 
        id={groupId} 
        required={required}
        role="group"
        aria-required={required}
        aria-invalid={!!error}
        aria-errormessage={error ? errorId : undefined}
      >
        {label}
        {required && <ScreenReaderOnly> (필수)</ScreenReaderOnly>}
      </Label>

      <AccountList 
        ref={containerRef}
        role="radiogroup"
        aria-labelledby={groupId}
      >
        {accounts.map((account, index) => {
          const isSelected = account.id === selectedAccountId;
          const accountNumberForSR = formatAccountNumberForScreenReader(account.accountNumber);
          const balanceForSR = formatAmountForScreenReader(account.balance);

          return (
            <AccountItem
              key={account.id}
              selected={isSelected}
              onKeyDown={(e) => handleKeyDown(e, account)}
            >
              <RadioInput
                type="radio"
                name={groupId}
                value={account.id}
                checked={isSelected}
                onChange={() => handleSelect(account)}
                aria-describedby={`${account.id}-info`}
              />
              <RadioButton checked={isSelected} />
              <AccountInfo id={`${account.id}-info`}>
                <AccountName>{account.name}</AccountName>
                <AccountNumber>
                  {account.accountNumber}
                  <ScreenReaderOnly> {accountNumberForSR}</ScreenReaderOnly>
                </AccountNumber>
                <AccountBalance>
                  잔액: {account.balance.toLocaleString()}원
                  <ScreenReaderOnly> {balanceForSR}</ScreenReaderOnly>
                </AccountBalance>
              </AccountInfo>
              <ScreenReaderOnly>
                {index + 1}번째 계좌, 총 {accounts.length}개 중
              </ScreenReaderOnly>
            </AccountItem>
          );
        })}
      </AccountList>

      {error && (
        <ErrorMessage id={errorId} role="alert">
          {error}
        </ErrorMessage>
      )}
    </Container>
  );
};