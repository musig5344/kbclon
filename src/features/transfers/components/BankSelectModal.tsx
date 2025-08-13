import React from 'react';

import {
  BankModalOverlay,
  BankModalContainer,
  BankModalHeader,
  BankModalTitle,
  BankModalCloseButton,
  BankSearchContainer,
  BankSearchInput,
  BankListContainer,
  BankSectionTitle,
  BankItem,
  BankName,
} from '../TransferPage.styles';

interface Bank {
  code: string;
  name: string;
  type: 'bank' | 'securities';
}

interface BankSelectModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectBank: (bankName: string) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}

const bankCategories: Bank[] = [
  // 주요 인터넷은행 & 시중은행
  { code: 'KAKAO', name: '카카오뱅크', type: 'bank' },
  { code: 'TOSS', name: '토스뱅크', type: 'bank' },
  { code: 'KBANK', name: '케이뱅크', type: 'bank' },
  { code: 'KB', name: 'KB국민은행', type: 'bank' },
  { code: 'SH', name: '신한은행', type: 'bank' },
  { code: 'WR', name: '우리은행', type: 'bank' },
  { code: 'HN', name: '하나은행', type: 'bank' },
  { code: 'NH', name: 'NH농협은행', type: 'bank' },
  { code: 'IBK', name: 'IBK기업은행', type: 'bank' },
  { code: 'BS', name: '부산은행', type: 'bank' },
  { code: 'KN', name: '경남은행', type: 'bank' },
  { code: 'DG', name: '대구은행', type: 'bank' },
  { code: 'JB', name: '전북은행', type: 'bank' },
  { code: 'GJ', name: '광주은행', type: 'bank' },
  { code: 'JJ', name: '제주은행', type: 'bank' },
  { code: 'SH_COOP', name: '수협은행', type: 'bank' },
  { code: 'MG', name: '새마을금고', type: 'bank' },
  { code: 'CU', name: '신협', type: 'bank' },
  { code: 'POST', name: '우체국', type: 'bank' },
  { code: 'KDB', name: 'KDB산업은행', type: 'bank' },
  { code: 'SBI', name: 'SBI저축은행', type: 'bank' },
  // 주요 증권사
  { code: 'MA', name: '미래에셋증권', type: 'securities' },
  { code: 'SS', name: '삼성증권', type: 'securities' },
  { code: 'KI', name: '키움증권', type: 'securities' },
  { code: 'HT', name: '한국투자증권', type: 'securities' },
  { code: 'NH_INV', name: 'NH투자증권', type: 'securities' },
  { code: 'SH_INV', name: '신한투자증권', type: 'securities' },
  { code: 'HN_INV', name: '하나증권', type: 'securities' },
  { code: 'KB_SEC', name: 'KB증권', type: 'securities' },
];

const BankSelectModal: React.FC<BankSelectModalProps> = ({
  isVisible,
  onClose,
  onSelectBank,
  searchTerm,
  onSearchTermChange,
}) => {
  if (!isVisible) return null;

  const filteredBanks = bankCategories.filter(bank =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBankSelect = (bankName: string) => {
    onSelectBank(bankName);
    onSearchTermChange(''); // Reset search term
  };

  return (
    <BankModalOverlay onClick={onClose}>
      <BankModalContainer onClick={e => e.stopPropagation()}>
        <BankModalHeader>
          <BankModalTitle>은행 선택</BankModalTitle>
          <BankModalCloseButton onClick={onClose}>×</BankModalCloseButton>
        </BankModalHeader>
        <BankSearchContainer>
          <BankSearchInput
            placeholder='은행명을 검색하세요'
            value={searchTerm}
            onChange={e => onSearchTermChange(e.target.value)}
          />
        </BankSearchContainer>
        <BankListContainer>
          <BankSectionTitle>은행</BankSectionTitle>
          {filteredBanks
            .filter(bank => bank.type === 'bank')
            .map(bank => (
              <BankItem key={bank.code} onClick={() => handleBankSelect(bank.name)}>
                <BankName>{bank.name}</BankName>
              </BankItem>
            ))}
          <BankSectionTitle>증권사</BankSectionTitle>
          {filteredBanks
            .filter(bank => bank.type === 'securities')
            .map(bank => (
              <BankItem key={bank.code} onClick={() => handleBankSelect(bank.name)}>
                <BankName>{bank.name}</BankName>
              </BankItem>
            ))}
        </BankListContainer>
      </BankModalContainer>
    </BankModalOverlay>
  );
};

export default BankSelectModal;
