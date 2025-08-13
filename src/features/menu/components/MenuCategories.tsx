import React from 'react';

import styled from 'styled-components';

import { MenuCategory } from '../types/menuTypes';

interface MenuCategoriesProps {
  categories: MenuCategory[];
  activeCategory: string;
  onCategoryChange: (categoryKey: string) => void;
}

/**
 * 좌측 카테고리 사이드바 컴포넌트 - 원본 스크린샷 100% 복제
 * 30% 너비로 고정, 원본과 픽셀 단위로 일치
 */
export const MenuCategories: React.FC<MenuCategoriesProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <CategorySidebar>
      {categories.map(category => (
        <CategoryItem
          key={category.key}
          $active={activeCategory === category.key}
          onClick={() => onCategoryChange(category.key)}
        >
          {category.label}
        </CategoryItem>
      ))}
    </CategorySidebar>
  );
};

// 좌측 카테고리 사이드바 스타일 - 원본과 완전히 동일
const CategorySidebar = styled.div`
  width: 30%;
  background-color: #e5e7eb;
  border-right: 1px solid #d1d5db;
  min-height: 400px;
  overflow-y: auto;
`;

const CategoryItem = styled.div<{ $active: boolean }>`
  padding: 16px 20px;
  font-size: 16px;
  font-weight: ${props => (props.$active ? '600' : '400')};
  color: ${props => (props.$active ? '#1f2937' : '#4b5563')};
  background-color: ${props => (props.$active ? '#ffffff' : 'transparent')};
  border-right: ${props => (props.$active ? '3px solid #0066cc' : 'none')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => (props.$active ? '#ffffff' : '#f3f4f6')};
  }

  /* 원본 스크린샷과 정확히 일치하는 스타일링 */
  line-height: 1.2;
  letter-spacing: -0.025em;

  /* 선택된 카테고리의 하이라이트 효과 */
  ${props =>
    props.$active &&
    `
    position: relative;
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background-color: #0066cc;
    }
  `}
`;
