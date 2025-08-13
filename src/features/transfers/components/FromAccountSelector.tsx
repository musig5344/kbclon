import React from 'react';

import kbLogo from '../../../assets/images/icon_poup_kb_logo.png';
import {
  FromAccountSection,
  SectionTitle,
  AccountInfo,
  AccountIcon,
  AccountDetail,
  AccountName,
  AccountNumber,
  AccountBalance
} from '../TransferPage.styles';

interface Account {
  id: string;
  account_name: string;
  account_number: string;
  balance: number;
  is_primary?: boolean;
}

interface FromAccountSelectorProps {
  selectedAccount: Account | null;
  formatAmount: (value: string) => string;
}

/**
 * 보내는 계좌 선택 섹션 컴포넌트
 * TransferPage에서 추출된 계좌 선택 UI
 */
const FromAccountSelector: React.FC<FromAccountSelectorProps> = ({
  selectedAccount,
  formatAmount
}) => {
  return (
    <FromAccountSection>
      <SectionTitle>보내는 계좌</SectionTitle>
      <AccountInfo>
        <AccountIcon>
          <img src={kbLogo} alt="KB" />
        </AccountIcon>
        <AccountDetail>
          <AccountName>{selectedAccount?.account_name || 'KB국민ONE통장-보통예금'}</AccountName>
          <AccountNumber>{selectedAccount?.account_number || '705601-01-500920'}</AccountNumber>
        </AccountDetail>
        <AccountBalance>{formatAmount((selectedAccount?.balance || 0).toString())}</AccountBalance>
      </AccountInfo>
    </FromAccountSection>
  );
};

export default FromAccountSelector;