import React from 'react';
interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}
// 홈 아이콘 (KB 원본)
export const HomeIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#484B51',
  className,
  style,
  onClick,
}) => (
  <img
    src='/assets/images/icons/icon_home.png'
    alt=''
    width={size}
    height={size}
    className={className}
    style={{
      cursor: onClick ? 'pointer' : undefined,
      filter:
        color !== '#484B51'
          ? `brightness(0) saturate(100%) invert(32%) sepia(8%) saturate(838%) hue-rotate(178deg) brightness(95%) contrast(91%)`
          : undefined,
      ...style,
    }}
    onClick={onClick}
  />
);
// 사용자 아이콘
export const UserIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#484B51',
  className,
  style,
  onClick,
}) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    className={className}
    style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
    onClick={onClick}
  >
    <path d='M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2' stroke={color} strokeWidth='2' fill='none' />
    <circle cx='12' cy='7' r='4' stroke={color} strokeWidth='2' fill='none' />
  </svg>
);
// 이체 아이콘 (KB 원본)
export const TransferIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#484B51',
  className,
  style,
  onClick,
}) => (
  <img
    src='/assets/images/icon_shortcut_transfer.png'
    alt='이체'
    width={size}
    height={size}
    className={className}
    style={{
      cursor: onClick ? 'pointer' : undefined,
      filter:
        color !== '#484B51'
          ? `brightness(0) saturate(100%) invert(32%) sepia(8%) saturate(838%) hue-rotate(178deg) brightness(95%) contrast(91%)`
          : undefined,
      ...style,
    }}
    onClick={onClick}
  />
);
// 메뉴 아이콘 (KB 원본)
export const MenuIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#484B51',
  className,
  style,
  onClick,
}) => (
  <img
    src='/assets/images/icon_appbar_menu.png'
    alt='메뉴'
    width={size}
    height={size}
    className={className}
    style={{
      cursor: onClick ? 'pointer' : undefined,
      filter:
        color !== '#484B51'
          ? `brightness(0) saturate(100%) invert(32%) sepia(8%) saturate(838%) hue-rotate(178deg) brightness(95%) contrast(91%)`
          : undefined,
      ...style,
    }}
    onClick={onClick}
  />
);
// 검색 아이콘 (원본 KB 이미지 사용)
export const SearchIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#484B51',
  className,
  style,
  onClick,
}) => (
  <img
    src='/assets/images/icons/icon_search_header.png'
    alt='검색'
    width={size}
    height={size}
    className={className}
    style={{
      cursor: onClick ? 'pointer' : undefined,
      filter:
        color !== '#484B51'
          ? `brightness(0) saturate(100%) invert(32%) sepia(8%) saturate(838%) hue-rotate(178deg) brightness(95%) contrast(91%)`
          : undefined,
      ...style,
    }}
    onClick={onClick}
  />
);
// 알림 아이콘 (KB 원본)
export const BellIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#484B51',
  className,
  style,
  onClick,
}) => (
  <img
    src='/assets/images/icon_notification.png'
    alt='알림'
    width={size}
    height={size}
    className={className}
    style={{
      cursor: onClick ? 'pointer' : undefined,
      filter:
        color !== '#484B51'
          ? `brightness(0) saturate(100%) invert(32%) sepia(8%) saturate(838%) hue-rotate(178deg) brightness(95%) contrast(91%)`
          : undefined,
      ...style,
    }}
    onClick={onClick}
  />
);
// 설정 아이콘
export const SettingsIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#484B51',
  className,
  style,
  onClick,
}) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    className={className}
    style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
    onClick={onClick}
  >
    <circle cx='12' cy='12' r='3' stroke={color} strokeWidth='2' fill='none' />
    <path
      d='M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z'
      stroke={color}
      strokeWidth='2'
      fill='none'
    />
  </svg>
);
// 박스 아이콘 (상품)
export const BoxIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#484B51',
  className,
  style,
  onClick,
}) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    className={className}
    style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
    onClick={onClick}
  >
    <path
      d='M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z'
      stroke={color}
      strokeWidth='2'
      fill='none'
    />
    <polyline points='3.27,6.96 12,12.01 20.73,6.96' stroke={color} strokeWidth='2' fill='none' />
    <line x1='12' y1='22.08' x2='12' y2='12' stroke={color} strokeWidth='2' />
  </svg>
);
// 그리드 아이콘 (전체메뉴)
export const GridIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#484B51',
  className,
  style,
  onClick,
}) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    className={className}
    style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
    onClick={onClick}
  >
    <rect x='3' y='3' width='7' height='7' stroke={color} strokeWidth='2' fill='none' />
    <rect x='14' y='3' width='7' height='7' stroke={color} strokeWidth='2' fill='none' />
    <rect x='14' y='14' width='7' height='7' stroke={color} strokeWidth='2' fill='none' />
    <rect x='3' y='14' width='7' height='7' stroke={color} strokeWidth='2' fill='none' />
  </svg>
);
// 체크 아이콘
export const CheckIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#08FF02',
  className,
  style,
  onClick,
}) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    className={className}
    style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
    onClick={onClick}
  >
    <circle cx='12' cy='12' r='10' fill={color} />
    <path
      d='M9 12l2 2 4-4'
      stroke='white'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);
// 도구 아이콘
export const ToolsIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#484B51',
  className,
  style,
  onClick,
}) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    className={className}
    style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
    onClick={onClick}
  >
    <path
      d='M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1.1.4 1.5 0l2.3-2.3c.5-.4.5-1.1.1-1.5z'
      stroke={color}
      strokeWidth='2'
      fill='none'
    />
  </svg>
);
