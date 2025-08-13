import React, { useState } from 'react';

import {
  BottomSheetLayout,
  SlideBar,
  TabLayout,
  TabButton,
  ActiveTabIndicator,
  ViewPagerContainer,
} from './LoginScreen.styles';
import { CertificateLoginTab } from './tabs/CertificateLoginTab';
import { FinanceCertificateTab } from './tabs/FinanceCertificateTab';
import { IDLoginTab } from './tabs/IDLoginTab';

interface LoginBottomSheetProps {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
  initialTab?: number;
}

export const LoginBottomSheet: React.FC<LoginBottomSheetProps> = ({
  isOpen,
  isClosing,
  onClose,
  initialTab = 0,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const tabs = ['공동인증서', '금융인증서', '아이디'];

  // initialTab prop이 변경되면 activeTab도 업데이트
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <BottomSheetLayout $isOpen={isOpen} $isClosing={isClosing}>
      <SlideBar />
      <TabLayout>
        <ActiveTabIndicator $activeIndex={activeTab} $tabCount={tabs.length} />
        {tabs.map((tab, index) => (
          <TabButton key={tab} $active={activeTab === index} onClick={() => setActiveTab(index)}>
            {tab}
          </TabButton>
        ))}
      </TabLayout>
      <ViewPagerContainer>
        {activeTab === 0 && <CertificateLoginTab />}
        {activeTab === 1 && <FinanceCertificateTab />}
        {activeTab === 2 && <IDLoginTab />}
      </ViewPagerContainer>
    </BottomSheetLayout>
  );
};
