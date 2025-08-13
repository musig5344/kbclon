import { Link } from 'react-router-dom';

import styled from 'styled-components';

import { responsiveContainer } from '../../styles/responsive';
import { tokens } from '../../styles/tokens';

// 레이아웃 관련 스타일
export const Container = styled.div`
  ${responsiveContainer}
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100%;
  background-color: #f5f6f8;
`;

// 헤더 관련 스타일
export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  height: 64px;
  background-color: ${tokens.colors.white};
  border-bottom: 1px solid #ebeef0;
`;

export const BackButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  &:active {
    opacity: 0.7;
  }
`;

export const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #333333;
  margin: 0;
  flex: 1;
  text-align: center;
  letter-spacing: -0.5px;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

export const HomeButton = styled(Link)`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333333;
  text-decoration: none;
  font-size: 20px;
  padding: 4px;

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  &:active {
    opacity: 0.7;
  }
`;

export const MenuButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #333333;
  padding: 4px;

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  &:active {
    opacity: 0.7;
  }
`;

// 계좌 정보 섹션 스타일
export const AccountSection = styled.div`
  padding: 20px;
  background: #ffffff;
  border-bottom: 8px solid #f5f6f8;
`;

export const AccountDropdown = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
`;

export const AccountInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const AccountIcon = styled.div`
  width: 32px;
  height: 32px;
  background-color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  img {
    width: 18px;
    height: 18px;
    object-fit: contain;
  }
`;

export const AccountDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

export const AccountName = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 4px;
`;

export const AccountNumber = styled.div`
  font-size: 13px;
  color: #666666;
`;

export const DropdownIcon = styled.div`
  font-size: 16px;
  color: #999999;
`;

export const Balance = styled.div`
  text-align: right;
  margin-top: 16px;
`;

export const BalanceAmount = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  letter-spacing: -0.5px;
`;

export const BalanceLabel = styled.div`
  font-size: 12px;
  color: #666666;
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

export const ActionButton = styled.button`
  flex: 1;
  padding: 14px;
  background: #f5f6f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #ebebeb;
  }

  &:active {
    transform: scale(0.98);
  }
`;

// 검색 및 필터 섹션 스타일
export const SearchSection = styled.div`
  padding: 20px 24px;
  background: #ffffff;
  border-bottom: 8px solid #f5f6f8;
`;

export const SearchFilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

export const SearchIcon = styled.div`
  font-size: 18px;
  color: #999999;
  flex-shrink: 0;
`;

export const FilterToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  background: none;
  border: none;
  font-size: 14px;
  color: #333333;
  cursor: pointer;
  font-weight: 500;

  &::after {
    content: '▼';
    font-size: 12px;
    color: #666666;
  }
`;

export const DateRangeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
`;

export const DateRange = styled.div`
  font-size: 14px;
  color: #666666;
  font-weight: 400;
`;

export const BalanceToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666666;
`;

export const ToggleSwitch = styled.div<{ $enabled: boolean }>`
  width: 40px;
  height: 20px;
  background: ${props => props.$enabled ? '#4CAF50' : '#CCCCCC'};
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$enabled ? '22px' : '2px'};
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
`;

// 거래내역 목록 스타일
export const TransactionList = styled.div`
  background: #ffffff;
  padding: 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  
  /* 스크롤바 숨기기 */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

// 거래내역 상세 모달 스타일
export const TransactionDetailModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  ${responsiveContainer}
`;

export const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #f5f6f8;
  border-bottom: 1px solid #e0e0e0;
`;

export const DetailTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin: 0;
  letter-spacing: -0.5px;
`;

export const DetailCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 28px;
  color: #666666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.7;
  }
`;

export const DetailBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  background: #ffffff;
`;

export const DetailMerchantName = styled.h3`
  font-size: 22px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 32px 0;
  letter-spacing: -0.5px;
`;

export const DetailMemoSection = styled.div`
  margin-bottom: 40px;
`;

export const DetailSectionLabel = styled.div`
  font-size: 14px;
  color: #666666;
  margin-bottom: 12px;
  font-weight: 400;
`;

export const DetailMemoDropdown = styled.div`
  position: relative;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  background: transparent;
  padding: 12px 0;
  margin-bottom: 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &::after {
    content: '▼';
    font-size: 14px;
    color: #999999;
  }
`;

export const DetailMemoDropdownText = styled.span`
  font-size: 16px;
  color: #333333;
  font-weight: 500;
`;

export const DetailMemoInput = styled.input`
  width: 100%;
  padding: 12px 0;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  background: transparent;
  font-size: 16px;
  color: #333333;
  outline: none;

  &::placeholder {
    color: #999999;
  }

  &:focus {
    border-bottom-color: #FFCC00;
  }
`;

export const DetailInfoSection = styled.div`
  margin-top: 40px;
`;

export const DetailDateTime = styled.div`
  font-size: 18px;
  font-weight: 400;
  color: #333333;
  margin-bottom: 32px;
  letter-spacing: -0.5px;
`;

export const DetailInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const DetailInfoLabel = styled.div`
  font-size: 15px;
  color: #666666;
  font-weight: 400;
`;

export const DetailInfoValue = styled.div<{ $isAmount?: boolean; $isPositive?: boolean }>`
  font-size: ${props => props.$isAmount ? '16px' : '15px'};
  font-weight: ${props => props.$isAmount ? '500' : '400'};
  color: ${props => 
    props.$isAmount 
      ? (props.$isPositive ? '#1976d2' : '#e53935')
      : '#000000'
  };
  text-align: right;
`;

export const DetailConfirmButton = styled.button`
  width: 100%;
  padding: 20px;
  background: #FFCC00;
  color: #000000;
  border: none;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  letter-spacing: -0.5px;

  &:active {
    background: #FFB800;
  }
`;