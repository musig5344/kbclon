/**
 * KB 스타뱅킹 메뉴 관련 타입 정의 - 원본 스크린샷 기준 완전 복제
 */

export interface MenuItemType {
  name: string;
  hasButton?: boolean;
  hasDropdown?: boolean;
}

export interface MenuSection {
  title?: string;
  items: MenuItemType[];
  highlighted?: boolean;
  message?: string; // "로그인 후 이용할 수 있습니다." 메시지
  hasButton?: boolean; // 설정 버튼 표시 여부
  buttonText?: string; // 버튼 텍스트
}

export interface MenuData {
  sections: MenuSection[];
}

export interface MenuCategory {
  key: string;
  label: string;
}
