import React from 'react';

import styled from 'styled-components';

// 아이콘 스프라이트 정의
// 이 데이터는 image-optimization.js 스크립트가 생성한 결과를 바탕으로 업데이트됩니다
export const ICON_SPRITE_MAP = {
  // 메뉴 아이콘들
  'icon_home': { x: 0, y: 0, width: 24, height: 24 },
  'icon_menu': { x: -24, y: 0, width: 24, height: 24 },
  'icon_search': { x: -48, y: 0, width: 24, height: 24 },
  'icon_alarm': { x: -72, y: 0, width: 24, height: 24 },
  'icon_close': { x: -96, y: 0, width: 24, height: 24 },
  
  // 탭 아이콘들
  'icon_tab_assets': { x: 0, y: -24, width: 24, height: 24 },
  'icon_tab_wallet': { x: -24, y: -24, width: 24, height: 24 },
  'icon_tab_shop': { x: -48, y: -24, width: 24, height: 24 },
  'icon_tab_gift': { x: -72, y: -24, width: 24, height: 24 },
  'icon_tab_menu': { x: -96, y: -24, width: 24, height: 24 },
  
  // 기능 아이콘들
  'icon_transfer': { x: 0, y: -48, width: 24, height: 24 },
  'icon_account': { x: -24, y: -48, width: 24, height: 24 },
  'icon_products': { x: -48, y: -48, width: 24, height: 24 },
  'icon_assets': { x: -72, y: -48, width: 24, height: 24 },
  'icon_arrow_20': { x: -96, y: -48, width: 24, height: 24 },
  
  // 로그인 관련 아이콘들
  'login_cert_icon': { x: 0, y: -72, width: 24, height: 24 },
  'login_id_icon': { x: -24, y: -72, width: 24, height: 24 },
  'login_fingerprint_icon': { x: -48, y: -72, width: 24, height: 24 },
  'login_look_icon': { x: -72, y: -72, width: 24, height: 24 },
  
  // 기타 아이콘들
  'icon_check_selected': { x: 0, y: -96, width: 24, height: 24 },
  'icon_arrow_left_white': { x: -24, y: -96, width: 24, height: 24 },
  'icon_list_more': { x: -48, y: -96, width: 24, height: 24 },
  'icon_simple_pay': { x: -72, y: -96, width: 24, height: 24 },
  'icon_fingerprint_line': { x: -96, y: -96, width: 24, height: 24 },
};

interface IconSpriteProps {
  icon: keyof typeof ICON_SPRITE_MAP;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  color?: string;
}

const SpriteContainer = styled.div<{
  $size: number;
  $x: number;
  $y: number;
  $spriteWidth: number;
  $spriteHeight: number;
  $color?: string;
}>`
  display: inline-block;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  background-image: url('/assets/images/sprites/icons-sprite.png');
  background-position: ${props => props.$x}px ${props => props.$y}px;
  background-size: ${props => props.$spriteWidth}px ${props => props.$spriteHeight}px;
  background-repeat: no-repeat;
  
  /* 색상 변경이 필요한 경우 */
  ${props => props.$color && `
    filter: brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
  `}
  
  /* 고해상도 디스플레이를 위한 최적화 */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  
  /* 애니메이션 최적화 */
  transform: translateZ(0);
  backface-visibility: hidden;
`;

// 스프라이트 이미지 전체 크기 (스크립트 실행 후 업데이트 필요)
const SPRITE_DIMENSIONS = {
  width: 120, // 5개 아이콘 x 24px
  height: 120  // 5개 행 x 24px
};

export const IconSprite: React.FC<IconSpriteProps> = ({
  icon,
  size = 24,
  className,
  style,
  onClick,
  color,
}) => {
  const iconData = ICON_SPRITE_MAP[icon];
  
  if (!iconData) {
    console.warn(`아이콘 '${icon}'을 찾을 수 없습니다.`);
    return null;
  }

  // 스케일 계산 (기본 24px에서 요청된 크기로)
  const scale = size / 24;
  const scaledSpriteWidth = SPRITE_DIMENSIONS.width * scale;
  const scaledSpriteHeight = SPRITE_DIMENSIONS.height * scale;

  return (
    <SpriteContainer
      className={className}
      style={style}
      onClick={onClick}
      $size={size}
      $x={iconData.x * scale}
      $y={iconData.y * scale}
      $spriteWidth={scaledSpriteWidth}
      $spriteHeight={scaledSpriteHeight}
      $color={color}
    />
  );
};

// KB 스타일에 맞춘 사전 정의된 아이콘 컴포넌트들
export const KBHomeIcon = (props: Omit<IconSpriteProps, 'icon'>) => (
  <IconSprite icon="icon_home" {...props} />
);

export const KBMenuIcon = (props: Omit<IconSpriteProps, 'icon'>) => (
  <IconSprite icon="icon_menu" {...props} />
);

export const KBSearchIcon = (props: Omit<IconSpriteProps, 'icon'>) => (
  <IconSprite icon="icon_search" {...props} />
);

export const KBAlarmIcon = (props: Omit<IconSpriteProps, 'icon'>) => (
  <IconSprite icon="icon_alarm" {...props} />
);

export const KBCloseIcon = (props: Omit<IconSpriteProps, 'icon'>) => (
  <IconSprite icon="icon_close" {...props} />
);

// 탭 아이콘들
export const KBTabAssetsIcon = (props: Omit<IconSpriteProps, 'icon'>) => (
  <IconSprite icon="icon_tab_assets" {...props} />
);

export const KBTabWalletIcon = (props: Omit<IconSpriteProps, 'icon'>) => (
  <IconSprite icon="icon_tab_wallet" {...props} />
);

export const KBTabShopIcon = (props: Omit<IconSpriteProps, 'icon'>) => (
  <IconSprite icon="icon_tab_shop" {...props} />
);

export const KBTabGiftIcon = (props: Omit<IconSpriteProps, 'icon'>) => (
  <IconSprite icon="icon_tab_gift" {...props} />
);

export const KBTabMenuIcon = (props: Omit<IconSpriteProps, 'icon'>) => (
  <IconSprite icon="icon_tab_menu" {...props} />
);

// 유틸리티: 사용 가능한 모든 아이콘 목록
export const getAvailableIcons = (): string[] => {
  return Object.keys(ICON_SPRITE_MAP);
};

// 유틸리티: 아이콘 존재 여부 확인
export const hasIcon = (iconName: string): iconName is keyof typeof ICON_SPRITE_MAP => {
  return iconName in ICON_SPRITE_MAP;
};

// 개발용: 아이콘 미리보기 컴포넌트
export const IconPreview: React.FC = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const PreviewContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 16px;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 8px;
    margin: 16px;
  `;

  const IconItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    
    span {
      margin-top: 8px;
      font-size: 12px;
      text-align: center;
      word-break: break-all;
    }
  `;

  return (
    <PreviewContainer>
      {Object.keys(ICON_SPRITE_MAP).map(iconName => (
        <IconItem key={iconName}>
          <IconSprite
            icon={iconName as keyof typeof ICON_SPRITE_MAP}
            size={32}
          />
          <span>{iconName}</span>
        </IconItem>
      ))}
    </PreviewContainer>
  );
};