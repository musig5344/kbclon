import React from 'react';

import { SearchSection, SearchInputWrapper, SearchInput, SearchIcon } from '../styles/KBMenuStyles';

/**
 * 메뉴 검색 섹션 컴포넌트
 * KB 스타뱅킹 전체메뉴의 검색 기능을 담당
 */
interface MenuSearchSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export const MenuSearchSection: React.FC<MenuSearchSectionProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = '메뉴를 검색해보세요',
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <SearchSection>
      <SearchInputWrapper>
        <SearchInput value={searchTerm} onChange={handleInputChange} placeholder={placeholder} />
        <SearchIcon>
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none'>
            <circle cx='11' cy='11' r='8' stroke='#696e76' strokeWidth='2' />
            <path d='m21 21-4.35-4.35' stroke='#696e76' strokeWidth='2' strokeLinecap='round' />
          </svg>
        </SearchIcon>
      </SearchInputWrapper>
    </SearchSection>
  );
};
