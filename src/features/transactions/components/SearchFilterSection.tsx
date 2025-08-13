import React from 'react';

import {
  SearchSection,
  SearchFilterRow,
  SearchIcon,
  FilterToggle,
  DateRangeRow,
  DateRange,
  BalanceToggle,
  ToggleSwitch,
} from '../AccountTransactionPage.styles';

import { FilterState } from './TransactionFilterModal';

interface SearchFilterSectionProps {
  dateRange: string;
  showBalance: boolean;
  appliedFilters: FilterState;
  onToggleBalance: () => void;
  onFilterClick: () => void;
  getSearchPlaceholder: () => string;
}

const SearchFilterSection: React.FC<SearchFilterSectionProps> = ({
  dateRange,
  showBalance,
  appliedFilters,
  onToggleBalance,
  onFilterClick,
  getSearchPlaceholder,
}) => {
  return (
    <SearchSection>
      <SearchFilterRow>
        <SearchIcon>🔍</SearchIcon>
        <FilterToggle onClick={onFilterClick}>
          {getSearchPlaceholder()}
        </FilterToggle>
      </SearchFilterRow>
      <DateRangeRow>
        <DateRange>{dateRange}</DateRange>
        <BalanceToggle>
          <span>잔액표기</span>
          <ToggleSwitch 
            $enabled={showBalance}
            onClick={onToggleBalance}
          />
        </BalanceToggle>
      </DateRangeRow>
    </SearchSection>
  );
};

export default SearchFilterSection;