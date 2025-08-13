/**
 * KB 스타뱅킹 메뉴 관련 타입 정의
 */

export interface MenuItemType {
  name: string;
  hasButton?: boolean;
  hasDropdown?: boolean;
}

export interface MenuSection {
  title: string;
  items: MenuItemType[];
  highlighted?: boolean;
}

export interface MenuData {
  sections: MenuSection[];
}

export interface MenuCategory {
  key: string;
  label: string;
}