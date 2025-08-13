import React, { useState } from 'react';

import styled from 'styled-components';

import { MenuData } from '../types/menuTypes';

interface MenuDetailsProps {
  menuData: MenuData;
  onMenuItemClick: (itemName: string) => void;
  isLoggedIn: boolean;
  activeCategory: string;
}

/**
 * 우측 상세 메뉴 컴포넌트 - 원본 스크린샷 100% 복제
 * 70% 너비로 고정, 원본과 픽셀 단위로 일치
 * 상단 탭 시스템 포함 (최근/My메뉴, My메뉴)
 */
export const MenuDetails: React.FC<MenuDetailsProps> = ({
  menuData,
  onMenuItemClick,
  isLoggedIn,
  activeCategory,
}) => {
  const [activeTab, setActiveTab] = useState('recent'); // recent 또는 my

  // 최근/My메뉴가 선택된 경우만 탭 표시
  const showTabs = activeCategory === 'recent';

  return (
    <MenuDetailSection>
      {showTabs && (
        <TabContainer>
          <Tab $active={activeTab === 'recent'} onClick={() => setActiveTab('recent')}>
            최근/My메뉴
          </Tab>
          <Tab $active={activeTab === 'my'} onClick={() => setActiveTab('my')}>
            My메뉴
          </Tab>
        </TabContainer>
      )}

      {menuData.sections.map((section, sectionIndex) => (
        <MenuSection key={sectionIndex}>
          {section.title && (
            <SectionHeader>
              <MenuSectionTitle $highlighted={section.highlighted}>
                {section.title}
              </MenuSectionTitle>
              {section.hasButton && section.buttonText && (
                <SettingButton onClick={e => e.stopPropagation()}>
                  {section.buttonText}
                </SettingButton>
              )}
            </SectionHeader>
          )}

          {section.message ? (
            <DisabledMessage>{section.message}</DisabledMessage>
          ) : (
            <MenuItemList>
              {section.items.length > 0
                ? section.items.map((item, itemIndex) => (
                    <MenuItem key={itemIndex} onClick={() => onMenuItemClick(item.name)}>
                      <span>{item.name}</span>
                      {item.hasButton && (
                        <SettingButton onClick={e => e.stopPropagation()}>설정</SettingButton>
                      )}
                      {item.hasDropdown && <DropdownIcon>▼</DropdownIcon>}
                    </MenuItem>
                  ))
                : !section.message && (
                    <DisabledMessage>로그인 후 이용할 수 있습니다.</DisabledMessage>
                  )}
            </MenuItemList>
          )}
        </MenuSection>
      ))}
    </MenuDetailSection>
  );
};

// 우측 상세 메뉴 영역 스타일 - 원본과 완전히 동일
const MenuDetailSection = styled.div`
  width: 70%;
  background-color: #ffffff;
  padding: 20px;
  overflow-y: auto;
`;

const MenuSection = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const MenuSectionTitle = styled.h3<{ $highlighted?: boolean }>`
  font-size: 18px;
  font-weight: 600;
  color: ${props => (props.$highlighted ? '#0066cc' : '#1f2937')};
  margin: 0;
  padding: 0;
  line-height: 1.2;
  letter-spacing: -0.025em;

  /* 원본 스크린샷의 파란색 하이라이트 효과 */
  ${props =>
    props.$highlighted &&
    `
    position: relative;
    padding-left: 8px;
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background-color: #0066cc;
      border-radius: 1.5px;
    }
  `}
`;

const MenuItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const MenuItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  font-size: 16px;
  color: #374151;
  background-color: transparent;
  border: none;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f9fafb;
  }

  &:last-child {
    border-bottom: none;
  }

  /* 원본 스크린샷과 정확히 일치하는 텍스트 스타일 */
  line-height: 1.4;
  font-weight: 400;

  span {
    flex: 1;
    text-align: left;
  }
`;

const SettingButton = styled.button`
  padding: 6px 16px;
  font-size: 14px;
  color: #6b7280;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    background-color: #e5e7eb;
    border-color: #9ca3af;
  }
`;

const DropdownIcon = styled.span`
  color: #9ca3af;
  font-size: 12px;
  margin-left: 8px;
`;

const DisabledMessage = styled.div`
  padding: 20px 16px;
  font-size: 16px;
  color: #9ca3af;
  text-align: center;
  font-weight: 400;
  line-height: 1.4;
`;

// 상단 탭 컨테이너
const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
`;

// 탭 버튼
const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: ${props => (props.$active ? '600' : '400')};
  color: ${props => (props.$active ? '#0066cc' : '#6b7280')};
  background-color: ${props => (props.$active ? '#ffffff' : 'transparent')};
  border: none;
  border-bottom: ${props => (props.$active ? '2px solid #0066cc' : '2px solid transparent')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => (props.$active ? '#ffffff' : '#f3f4f6')};
    color: ${props => (props.$active ? '#0066cc' : '#374151')};
  }

  /* 원본 스크린샷과 정확히 일치하는 스타일 */
  line-height: 1.2;
  letter-spacing: -0.025em;
`;
