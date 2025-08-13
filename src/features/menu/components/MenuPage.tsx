import React, { useState } from 'react';

import { Link } from 'react-router-dom';

import styled from 'styled-components';

import { FullScreenModalContainer } from '../../../shared/components/layout/MobileContainer';
import { mobileMediaQueries } from '../../../styles/responsive';
/**
 * KB 스타뱅킹 원본 전체 메뉴 시스템
 * - 좌측: 카테고리 네비게이션 (최근/My메뉴, 조회, 이체, 상품가입, 가업상품관리, 자산관리, 공과금, 외환, 금융편의, 혜택, 멤버십, 생활/제휴)
 * - 우측: 선택된 카테고리의 상세 메뉴 리스트
 * - 상단: 로그인 버튼, Language, 닫기, 검색 기능
 * - 하단: 고객센터, 인증/보안, 환경설정 링크
 */
const MenuContainer = styled(FullScreenModalContainer)`
  background-color: #fff;
`;
const MenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  height: 48px;
  background-color: #ffffff;
  border-bottom: 1px solid #ffebeef0;
  ${mobileMediaQueries.small} {
    padding: 8px 16px;
  }
`;
const LoginButton = styled.button`
  background: none;
  border: 1px solid #ffebeef0;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  color: #ff26282c;
  font-weight: 500;
  cursor: pointer;
  &:hover {
    background-color: #fff7f7f8;
  }
`;
const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;
const LanguageButton = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  color: #ff696e76;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
`;
const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #ff26282c;
  cursor: pointer;
  padding: 4px;
`;
const WelcomeText = styled.div`
  padding: 16px 24px;
  font-size: 14px;
  color: #ff696e76;
  background-color: #fff7f7f8;
  border-bottom: 1px solid #ffebeef0;
  ${mobileMediaQueries.small} {
    padding: 12px 16px;
    font-size: 13px;
  }
`;
const SearchSection = styled.div`
  padding: 20px 24px;
  border-bottom: 8px solid #fff7f7f8;
  ${mobileMediaQueries.small} {
    padding: 16px;
  }
`;
const SearchInput = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 16px 0 48px;
  border: 1px solid #ffebeef0;
  border-radius: 4px;
  font-size: 16px;
  background-color: #fff;
  background-image: url('/assets/images/icons/icon_appbar_search.png');
  background-repeat: no-repeat;
  background-position: 16px center;
  background-size: 20px 20px;
  &::placeholder {
    color: #ffaaaaaa;
  }
  &:focus {
    outline: none;
    border-color: #ffffd338;
  }
`;
const QuickActions = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 20px 24px;
  border-bottom: 8px solid #fff7f7f8;
  ${mobileMediaQueries.small} {
    padding: 16px;
  }
`;
const QuickActionItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 12px 8px;
  border-radius: 8px;
  &:hover {
    background-color: rgba(255, 211, 56, 0.1);
  }
`;
const QuickActionIcon = styled.div`
  width: 32px;
  height: 32px;
  background-color: #fff7f7f8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;
const QuickActionText = styled.span`
  font-size: 12px;
  color: #ff26282c;
  font-weight: 500;
`;
const MenuContent = styled.div`
  display: flex;
  height: calc(100vh - 200px);
  ${mobileMediaQueries.small} {
    height: calc(100vh - 180px);
  }
`;
const CategorySidebar = styled.div`
  width: 140px;
  background-color: #fff7f7f8;
  border-right: 1px solid #ffebeef0;
  overflow-y: auto;
  ${mobileMediaQueries.small} {
    width: 120px;
  }
`;
const CategoryItem = styled.button<{ active: boolean }>`
  width: 100%;
  padding: 16px 12px;
  border: none;
  background: ${props => props.active ? '#ffffff' : 'transparent'};
  color: ${props => props.active ? '#ff26282c' : '#ff484b51'};
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  text-align: left;
  border-right: ${props => props.active ? '3px solid #ffffd338' : 'none'};
  position: relative;
  &:hover {
    background-color: #ffffff;
  }
  ${mobileMediaQueries.small} {
    padding: 12px 8px;
    font-size: 13px;
  }
`;
const MenuDetailSection = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #ffffff;
  ${mobileMediaQueries.small} {
    padding: 16px;
  }
`;
const MenuDetailTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #ff26282c;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  ${mobileMediaQueries.small} {
    font-size: 16px;
    margin-bottom: 16px;
  }
`;
const MenuDetailList = styled.div`
  display: flex;
  flex-direction: column;
`;
const MenuDetailItem = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border: none;
  background: none;
  font-size: 16px;
  color: #ff26282c;
  cursor: pointer;
  border-bottom: 1px solid #fff7f7f8;
  &:hover {
    background-color: rgba(255, 211, 56, 0.05);
  }
  &:last-child {
    border-bottom: none;
  }
  ${mobileMediaQueries.small} {
    font-size: 14px;
    padding: 14px 0;
  }
`;
const ExpandIcon = styled.span<{ expanded?: boolean }>`
  font-size: 12px;
  color: #ff696e76;
  transition: transform 0.2s ease;
  transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;
const SubMenuList = styled.div<{ expanded: boolean }>`
  display: ${props => props.expanded ? 'block' : 'none'};
  padding-left: 16px;
  margin-top: 8px;
`;
const SubMenuItem = styled.button`
  display: block;
  width: 100%;
  padding: 12px 0;
  border: none;
  background: none;
  font-size: 14px;
  color: #ff484b51;
  cursor: pointer;
  text-align: left;
  &:hover {
    color: #ff26282c;
  }
  ${mobileMediaQueries.small} {
    font-size: 13px;
    padding: 10px 0;
  }
`;
interface MenuData {
  [key: string]: {
    title: string;
    items: Array<{
      name: string;
      subItems?: string[];
    }>;
  };
}
const menuData: MenuData = {
  recent: {
    title: "최근 이용 메뉴",
    items: [
      { name: "로그인 후 이용할 수 있습니다." }
    ]
  },
  myMenu: {
    title: "My메뉴",
    items: [
      { name: "로그인 후 이용할 수 있습니다." }
    ]
  },
  inquiry: {
    title: "조회",
    items: [
      { name: "전체계좌조회" },
      { name: "통합거래내역조회" },
      { name: "해지계좌조회" },
      { name: "휴면예금·보험금 찾기" },
      { name: "수수료 납부내역조회" },
      { name: "ID모아보기 계좌조회" },
      { name: "계좌통합관리서비스(어카운팅포)" }
    ]
  },
  transfer: {
    title: "이체",
    items: [
      { name: "이체" },
      { name: "이체결과조회(이체확인증)" },
      { 
        name: "자동이체", 
        subItems: ["자동이체 신청", "자동이체 조회/해지"] 
      },
      { name: "이체한도 조회/변경" },
      { 
        name: "이체관리", 
        subItems: ["이체관리 신청", "이체관리 조회/해지"] 
      },
      { name: "잔액모으기" },
      { 
        name: "ID모아보기", 
        subItems: ["ID모아보기 신청", "ID모아보기 조회/해지"] 
      },
      { name: "계좌이동서비스(자동이체통합관리)" }
    ]
  },
  products: {
    title: "상품가입",
    items: [
      { name: "금융상품" },
      { name: "입출금+카드" },
      { name: "적금" },
      { name: "정기예금" },
      { name: "외화예적금" },
      { name: "대출" },
      { name: "퇴직연금" },
      { name: "펀드" },
      { name: "신탁" },
      { name: "ISA" },
      { name: "청약/채권" },
      { name: "골드/실버" }
    ]
  },
  businessProducts: {
    title: "가업상품관리",
    items: [
      { name: "계좌설정" },
      { name: "입출금" },
      { name: "예적금" },
      { name: "외화예적금" },
      { name: "대출" },
      { name: "퇴직연금" },
      { name: "펀드" },
      { name: "신탁" },
      { name: "ISA" },
      { name: "청약/채권" },
      { name: "골드투자통장" },
      { name: "보험" }
    ]
  },
  assetManagement: {
    title: "자산관리",
    items: [
      { 
        name: "한번에", 
        subItems: ["한번에 조회", "한번에 이체"] 
      },
      { 
        name: "지출", 
        subItems: ["지출 관리", "지출 분석"] 
      },
      { 
        name: "투자", 
        subItems: ["투자 포트폴리오", "투자 성과"] 
      },
      { 
        name: "연금/절세", 
        subItems: ["연금 관리", "절세 상품"] 
      },
      { 
        name: "금융팁", 
        subItems: ["금융 상식", "투자 가이드"] 
      }
    ]
  },
  bills: {
    title: "공과금",
    items: [
      { name: "공과금 납부하기" },
      { name: "공과금 납부조회/취소" },
      { name: "법원업무" }
    ]
  },
  fx: {
    title: "외환",
    items: [
      { 
        name: "환율", 
        subItems: ["실시간 환율", "환율 알림"] 
      },
      { 
        name: "환전", 
        subItems: ["외화 환전", "환전 내역"] 
      },
      { 
        name: "해외송금", 
        subItems: ["해외송금 신청", "송금 조회"] 
      },
      { 
        name: "국내외환이체/예금입출금", 
        subItems: ["외환이체", "예금입출금"] 
      },
      { 
        name: "외환정보관리", 
        subItems: ["환율 정보", "외환 뉴스"] 
      },
      { name: "외환수수료납부/조회" }
    ]
  },
  convenience: {
    title: "금융편의",
    items: [
      { name: "ATM/창구출금" },
      { name: "미성년자계좌신규미리작성" },
      { 
        name: "증명서,통장/보안매체", 
        subItems: ["잔액증명서", "거래내역증명서", "통장재발급", "보안카드 재발급"] 
      },
      { name: "발급(배송)" }
    ]
  }
};
export const MenuPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('recent');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const categories = [
    { key: 'recent', label: '최근/My메뉴', hasNotification: false },
    { key: 'inquiry', label: '조회', hasNotification: false },
    { key: 'transfer', label: '이체', hasNotification: false },
    { key: 'products', label: '상품가입', hasNotification: false },
    { key: 'businessProducts', label: '가업상품관리', hasNotification: false },
    { key: 'assetManagement', label: '자산관리', hasNotification: false },
    { key: 'bills', label: '공과금', hasNotification: false },
    { key: 'fx', label: '외환', hasNotification: false },
    { key: 'convenience', label: '금융편의', hasNotification: false },
    { key: 'benefits', label: '혜택', hasNotification: false },
    { key: 'membership', label: '멤버십', hasNotification: false },
    { key: 'lifestyle', label: '생활/제휴', hasNotification: false },
  ];
  const toggleExpanded = (itemName: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemName)) {
      newExpanded.delete(itemName);
    } else {
      newExpanded.add(itemName);
    }
    setExpandedItems(newExpanded);
  };
  const currentMenuData = menuData[activeCategory] || { title: "선택된 메뉴", items: [] };
  return (
    <MenuContainer>
      <MenuHeader>
        <LoginButton>로그인</LoginButton>
        <HeaderActions>
          <LanguageButton>
            🌐 Language
          </LanguageButton>
          <CloseButton as={Link} to="/dashboard">×</CloseButton>
        </HeaderActions>
      </MenuHeader>
      <WelcomeText>
        KB스타뱅킹에 오신 것을 환영합니다.
      </WelcomeText>
      <SearchSection>
        <SearchInput placeholder="메뉴를 검색해보세요." />
      </SearchSection>
      <QuickActions>
        <QuickActionItem>
          <QuickActionIcon>🔊</QuickActionIcon>
          <QuickActionText>고객센터</QuickActionText>
        </QuickActionItem>
        <QuickActionItem>
          <QuickActionIcon>🔒</QuickActionIcon>
          <QuickActionText>인증/보안</QuickActionText>
        </QuickActionItem>
        <QuickActionItem>
          <QuickActionIcon>⚙️</QuickActionIcon>
          <QuickActionText>환경설정</QuickActionText>
        </QuickActionItem>
      </QuickActions>
      <MenuContent>
        <CategorySidebar>
          {categories.map(category => (
            <CategoryItem
              key={category.key}
              active={activeCategory === category.key}
              onClick={() => setActiveCategory(category.key)}
            >
              {category.label}
            </CategoryItem>
          ))}
        </CategorySidebar>
        <MenuDetailSection>
          <MenuDetailTitle>
            {currentMenuData.title}
          </MenuDetailTitle>
          <MenuDetailList>
            {currentMenuData.items.map((item, index) => (
              <div key={index}>
                <MenuDetailItem
                  onClick={() => item.subItems && toggleExpanded(item.name)}
                >
                  <span>{item.name}</span>
                  {item.subItems && (
                    <ExpandIcon expanded={expandedItems.has(item.name)}>
                      ▼
                    </ExpandIcon>
                  )}
                </MenuDetailItem>
                {item.subItems && (
                  <SubMenuList expanded={expandedItems.has(item.name)}>
                    {item.subItems.map((subItem, subIndex) => (
                      <SubMenuItem key={subIndex}>
                        {subItem}
                      </SubMenuItem>
                    ))}
                  </SubMenuList>
                )}
              </div>
            ))}
          </MenuDetailList>
        </MenuDetailSection>
      </MenuContent>
    </MenuContainer>
  );
};