import React, { useState } from 'react';

import styled from 'styled-components';
const ModalBackdrop = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => (props.show ? 'block' : 'none')};
  z-index: 9999;
`;
const ModalContainer = styled.div<{ show: boolean }>`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) translateY(${props => (props.show ? '0' : '100%')});
  background: white;
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-width: 430px;
  max-height: 60vh;
  padding: 16px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease-out;
  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background-color: #ddd;
    border-radius: 2px;
  }
`;
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-top: 8px;
`;
const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #26282c;
  margin: 0;
  font-family: 'KBFGText', sans-serif;
`;
const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  &:hover {
    color: #666;
  }
`;
const FilterSection = styled.div`
  margin-bottom: 10px;
  &:last-of-type {
    margin-bottom: 12px;
  }
`;
const FilterLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #26282c;
  margin-bottom: 6px;
  font-family: 'KBFGText', sans-serif;
`;
const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;
const FilterButton = styled.button<{ $active: boolean }>`
  padding: 8px 12px;
  border: 1px solid ${props => (props.$active ? '#26282c' : '#ddd')};
  background: white;
  color: #26282c;
  border-radius: 4px;
  font-size: 13px;
  font-weight: ${props => (props.$active ? '600' : '400')};
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'KBFGText', sans-serif;
  white-space: nowrap;
  &:hover {
    border-color: #26282c;
  }
`;
const AmountSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
`;
const AmountGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;
const AmountInput = styled.input`
  width: 90px;
  padding: 6px 0 4px 0;
  border: none;
  border-bottom: 2px solid #ccc;
  font-size: 13px;
  text-align: center;
  font-family: 'KBFGText', sans-serif;
  background: transparent;
  &::placeholder {
    color: #999;
    font-size: 11px;
  }
  &:focus {
    outline: none;
    border-bottom-color: #ffd338;
  }
`;
const AmountLabel = styled.span`
  font-size: 13px;
  color: #666;
  margin-left: 4px;
`;
const Divider = styled.span`
  font-size: 14px;
  color: #666;
  font-weight: 500;
  margin: 0 4px;
`;
const ApplyButton = styled.button`
  width: 100%;
  height: 44px;
  background: #ffd338;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #26282c;
  cursor: pointer;
  font-family: 'KBFGText', sans-serif;
  transition: background 0.2s ease;
  margin-top: 4px;
  &:hover {
    background: #ffda48;
  }
  &:active {
    background: #ffcf28;
    transform: scale(0.98);
  }
`;
export interface FilterState {
  period: string;
  type: string;
  sort: string;
  amount: {
    min: string;
    max: string;
  };
  startDate?: string;
  endDate?: string;
}
interface TransactionFilterModalProps {
  show: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  showDateInputs?: boolean;
}
export const TransactionFilterModal: React.FC<TransactionFilterModalProps> = ({
  show,
  onClose,
  filters: initialFilters,
  onApply,
  showDateInputs: _showDateInputs = false,
}) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  const handleAmountChange = (key: 'min' | 'max', value: string) => {
    setFilters(prev => ({
      ...prev,
      amount: {
        ...prev.amount,
        [key]: value,
      },
    }));
  };
  const handleApply = () => {
    onApply(filters);
    onClose();
  };
  return (
    <ModalBackdrop show={show} onClick={onClose}>
      <ModalContainer show={show} onClick={e => e.stopPropagation()}>
        <Header>
          <Title>조회기간 설정</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>
        <FilterSection>
          <FilterLabel>기간선택</FilterLabel>
          <ButtonGrid>
            {['오늘', '1개월', '3개월', '6개월', '직접입력'].map(period => (
              <FilterButton
                key={period}
                $active={filters.period === period}
                onClick={() => handleFilterChange('period', period)}
              >
                {period}
              </FilterButton>
            ))}
          </ButtonGrid>
        </FilterSection>
        <FilterSection>
          <FilterLabel>거래유형</FilterLabel>
          <ButtonGrid>
            {['전체', '입금', '출금'].map(type => (
              <FilterButton
                key={type}
                $active={filters.type === type}
                onClick={() => handleFilterChange('type', type)}
              >
                {type}
              </FilterButton>
            ))}
          </ButtonGrid>
        </FilterSection>
        <FilterSection>
          <FilterLabel>정렬순서</FilterLabel>
          <ButtonGrid>
            {['최신순', '과거순'].map(sort => (
              <FilterButton
                key={sort}
                $active={filters.sort === sort}
                onClick={() => handleFilterChange('sort', sort)}
              >
                {sort}
              </FilterButton>
            ))}
          </ButtonGrid>
        </FilterSection>
        <FilterSection>
          <FilterLabel>조회금액</FilterLabel>
          <AmountSection>
            <AmountGroup>
              <AmountInput
                placeholder='최소'
                type='number'
                value={filters.amount.min}
                onChange={e => handleAmountChange('min', e.target.value)}
              />
              <AmountLabel>원</AmountLabel>
            </AmountGroup>
            <Divider>-</Divider>
            <AmountGroup>
              <AmountInput
                placeholder='최대'
                type='number'
                value={filters.amount.max}
                onChange={e => handleAmountChange('max', e.target.value)}
              />
              <AmountLabel>원</AmountLabel>
            </AmountGroup>
          </AmountSection>
        </FilterSection>
        <ApplyButton onClick={handleApply}>조회</ApplyButton>
      </ModalContainer>
    </ModalBackdrop>
  );
};
export default TransactionFilterModal;
