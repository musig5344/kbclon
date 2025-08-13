import React, { memo, useMemo, useCallback } from 'react';

import {
  AccountInfoSection as StyledAccountInfoSection,
  TopRow,
  MiddleRow,
  BottomRow,
  LeftSection,
  RightSection,
  AccountName,
  EditIcon,
  SettingsIcon,
  BalanceSection,
  AccountNumber,
  LargeBalance,
  AvailableBalance,
  ATMButton
} from '../styles/AccountPage.styles';

// Props 인터페이스 정의
interface AccountInfoSectionProps {
  account: {
    id: string;
    account_name?: string;
    account_number: string;
    balance: number;
  } | null;
  onEditClick?: () => void;
  onSettingsClick?: () => void;
  onATMClick?: () => void;
}

const AccountInfoSection: React.FC<AccountInfoSectionProps> = memo(({
  account,
  onEditClick,
  onSettingsClick,
  onATMClick
}) => {
  // 계좌 잔액 포맷팅을 메모이제이션
  const formattedBalance = useMemo(() => {
    const balance = account?.balance || 510000;
    return balance.toLocaleString();
  }, [account?.balance]);

  // 계좌 번호를 메모이제이션
  const accountNumber = useMemo(() => 
    account?.account_number || '110-609-756856',
    [account?.account_number]
  );

  // 클릭 핸들러들을 메모이제이션
  const handleEditClick = useCallback(() => {
    onEditClick?.();
  }, [onEditClick]);

  const handleSettingsClick = useCallback(() => {
    onSettingsClick?.();
  }, [onSettingsClick]);

  const handleATMClick = useCallback(() => {
    onATMClick?.();
  }, [onATMClick]);

  return (
    <StyledAccountInfoSection>
      <TopRow>
        <LeftSection>
          <AccountName>
            KB국민ONE통장 
            <EditIcon onClick={handleEditClick}>✏️</EditIcon>
          </AccountName>
        </LeftSection>
        <RightSection>
          <SettingsIcon onClick={handleSettingsClick}>⚙️</SettingsIcon>
        </RightSection>
      </TopRow>
      <MiddleRow>
        <AccountNumber>
          {accountNumber}
        </AccountNumber>
        <BalanceSection>
          <LargeBalance>{formattedBalance}원</LargeBalance>
        </BalanceSection>
      </MiddleRow>
      <BottomRow>
        <AvailableBalance>출금가능금액 {formattedBalance}원</AvailableBalance>
      </BottomRow>
      <ATMButton onClick={handleATMClick}>ATM/창구출금</ATMButton>
    </StyledAccountInfoSection>
  );
});

AccountInfoSection.displayName = 'AccountInfoSection';

export default AccountInfoSection;