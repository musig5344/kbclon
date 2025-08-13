import React from 'react';

import kbLogo from '../../../assets/images/icon_poup_kb_logo.png';
import { DatabaseAccount } from '../../../lib/supabase';
import { formatCurrency } from '../../../utils/textFormatter';
import {
  AccountSection,
  AccountDropdown,
  AccountInfo,
  AccountIcon,
  AccountDetails,
  AccountName,
  AccountNumber,
  DropdownIcon,
  Balance,
  BalanceAmount,
  BalanceLabel,
  ActionButtons,
  ActionButton,
} from '../AccountTransactionPage.styles';

interface AccountInfoSectionProps {
  account: DatabaseAccount;
  showBalance: boolean;
  onToggleBalance: () => void;
}

/**
 * 계좌 정보 섹션 컴포넌트
 * - 계좌 정보 표시 (계좌명, 계좌번호)
 * - 잔액 표시 (토글 가능)
 * - ATM/창구출금 버튼
 */
const AccountInfoSection: React.FC<AccountInfoSectionProps> = ({
  account,
  showBalance,
  onToggleBalance,
}) => {
  return (
    <AccountSection>
      <AccountDropdown>
        <AccountInfo>
          <AccountIcon>
            <img src={kbLogo} alt='KB' />
          </AccountIcon>
          <AccountDetails>
            <AccountName>{account.account_name}</AccountName>
            <AccountNumber>{account.account_number}</AccountNumber>
          </AccountDetails>
        </AccountInfo>
        <DropdownIcon>⚙️</DropdownIcon>
      </AccountDropdown>

      <Balance>
        <BalanceAmount>{showBalance ? formatCurrency(account.balance) : '•••••••'}원</BalanceAmount>
        <BalanceLabel>
          출금가능금액 {showBalance ? formatCurrency(account.balance) : '•••••••'}원
        </BalanceLabel>
      </Balance>

      <ActionButtons>
        <ActionButton>ATM/창구출금</ActionButton>
      </ActionButtons>
    </AccountSection>
  );
};

export default AccountInfoSection;
