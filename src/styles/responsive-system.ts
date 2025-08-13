/**
 * KB 스타뱅킹 통합 반응형 시스템
 * 모든 안드로이드 기기에서 완벽한 반응형 레이아웃 제공
 * 원본 앱과 85% 스케일 일관성 유지
 */

import { BREAKPOINTS, MEDIA_QUERIES, KB_BREAKPOINTS, getDeviceType, getSafeAreaDimensions } from './breakpoints';

// KB 디자인 토큰 - 원본 앱 기준
export const KB_DESIGN_TOKENS = {
  // 원본 KB 옐로우
  colors: {
    primary: '#FFD338',
    primaryDark: '#E6BE32',
    primaryLight: '#FFF066',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceVariant: '#EBEEF0',
    onSurface: '#1C1C1E',
    onSurfaceVariant: '#757575',
    error: '#F44336',
    success: '#4CAF50'
  },
  
  // 원본 앱 그림자 효과
  shadows: {
    card: '0 2px 8px rgba(0, 0, 0, 0.1)',
    button: '0 2px 4px rgba(0, 0, 0, 0.2)',
    modal: '0 8px 32px rgba(0, 0, 0, 0.2)',
    bottomSheet: '0 -4px 16px rgba(0, 0, 0, 0.1)'
  },
  
  // 원본 앱 border-radius 값
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    xlarge: '16px',
    round: '50%'
  },
  
  // 85% 스케일 적용된 간격
  spacing: {
    xs: '4px',   // 4 * 0.85 = 3.4px ≈ 4px
    sm: '8px',   // 8 * 0.85 = 6.8px ≈ 8px  
    md: '16px',  // 16 * 0.85 = 13.6px ≈ 16px
    lg: '24px',  // 24 * 0.85 = 20.4px ≈ 24px
    xl: '32px',  // 32 * 0.85 = 27.2px ≈ 32px
    xxl: '48px'  // 48 * 0.85 = 40.8px ≈ 48px
  }
} as const;

// DPI 및 화면 밀도 계산
export const getDPIScale = (): number => {
  if (typeof window === 'undefined') return 1;
  return window.devicePixelRatio || 1;
};

// 동적 크기 계산 함수
export const calculateResponsiveSize = (
  baseSize: number,
  screenWidth: number,
  minSize?: number,
  maxSize?: number
): number => {
  // KB 앱 기준 430px에서의 비율 계산
  const scale = Math.min(screenWidth / KB_BREAKPOINTS.kbOptimal, 1.2);
  const dpiScale = getDPIScale();
  
  // 85% 스케일 적용
  let calculatedSize = baseSize * 0.85 * scale * dpiScale;
  
  // 최소/최대 크기 제한
  if (minSize) calculatedSize = Math.max(calculatedSize, minSize);
  if (maxSize) calculatedSize = Math.min(calculatedSize, maxSize);
  
  return Math.round(calculatedSize);
};

// 터치 타겟 크기 보장 (최소 44px)
export const ensureTouchTarget = (size: number): number => {
  const minTouchSize = 44;
  return Math.max(size, minTouchSize);
};

// 안전 영역 처리 유틸리티
export const createSafeAreaStyle = (includeBottom = true, includeTop = true) => {
  const safeArea = getSafeAreaDimensions();
  return {
    paddingTop: includeTop ? safeArea.top : '0',
    paddingBottom: includeBottom ? safeArea.bottom : '0',
    paddingLeft: safeArea.left,
    paddingRight: safeArea.right
  };
};

// 반응형 폰트 크기 계산
export const getResponsiveFontSize = (
  baseFontSize: number,
  screenWidth: number,
  deviceType?: string
): string => {
  let scale = 1;
  
  // 디바이스 타입별 폰트 스케일
  switch (deviceType) {
    case 'phone_small':
      scale = 0.9;
      break;
    case 'phone_medium':
      scale = 1.0;
      break;
    case 'phone_large':
      scale = 1.1;
      break;
    case 'tablet_7':
      scale = 1.2;
      break;
    case 'tablet_10':
      scale = 1.3;
      break;
    case 'tablet_12':
      scale = 1.4;
      break;
    case 'foldable_closed':
      scale = 0.9;
      break;
    case 'foldable_open':
      scale = 1.1;
      break;
    default:
      // 화면 너비 기반 스케일
      scale = Math.min(screenWidth / KB_BREAKPOINTS.kbOptimal, 1.3);
  }
  
  // 85% 스케일 적용
  const finalSize = baseFontSize * 0.85 * scale;
  return `${Math.round(finalSize)}px`;
};

// 반응형 간격 계산
export const getResponsiveSpacing = (
  baseSpacing: keyof typeof KB_DESIGN_TOKENS.spacing,
  screenWidth: number,
  multiplier = 1
): string => {
  const baseValue = parseInt(KB_DESIGN_TOKENS.spacing[baseSpacing]);
  const scale = Math.min(screenWidth / KB_BREAKPOINTS.kbOptimal, 1.2);
  const finalValue = baseValue * scale * multiplier;
  return `${Math.round(finalValue)}px`;
};

// 컨테이너 최적화 스타일
export const createResponsiveContainer = (maxWidth = KB_BREAKPOINTS.kbOptimal) => `
  width: 100%;
  max-width: ${maxWidth}px;
  min-width: ${KB_BREAKPOINTS.kbMinimum}px;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  position: relative;
  
  /* 안전 영역 고려 */
  ${Object.entries(createSafeAreaStyle()).map(([key, value]) => 
    `${key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)}: ${value};`
  ).join('\n  ')}
  
  /* 모바일 최적화 */
  -webkit-overflow-scrolling: touch;
  -webkit-tap-highlight-color: transparent;
  
  /* 브라우저 호환성 */
  height: 100vh;
  min-height: 100vh;
  min-height: -webkit-fill-available;
  
  ${MEDIA_QUERIES.mobile} {
    width: 100vw;
    max-width: 100vw;
  }
`;

// 헤더 반응형 스타일
export const createResponsiveHeader = (includeSearch = false) => `
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
  height: ${KB_BREAKPOINTS.kbHeaderHeight}px;
  background: ${KB_DESIGN_TOKENS.colors.background};
  border-bottom: 1px solid ${KB_DESIGN_TOKENS.colors.surfaceVariant};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${KB_DESIGN_TOKENS.spacing.lg};
  box-sizing: border-box;
  
  /* 안전 영역 고려 */
  padding-top: calc(${KB_DESIGN_TOKENS.spacing.sm} + env(safe-area-inset-top));
  height: calc(${KB_BREAKPOINTS.kbHeaderHeight}px + env(safe-area-inset-top));
  
  ${MEDIA_QUERIES.phoneSmall} {
    padding-left: ${KB_DESIGN_TOKENS.spacing.md};
    padding-right: ${KB_DESIGN_TOKENS.spacing.md};
  }
  
  ${MEDIA_QUERIES.tablet} {
    max-width: ${KB_BREAKPOINTS.kbOptimal}px;
    margin: 0 auto;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
  }
`;

// 버튼 반응형 스타일
export const createResponsiveButton = (variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
  const baseColors = {
    primary: {
      background: KB_DESIGN_TOKENS.colors.primary,
      color: KB_DESIGN_TOKENS.colors.onSurface,
      border: 'none'
    },
    secondary: {
      background: KB_DESIGN_TOKENS.colors.surface,
      color: KB_DESIGN_TOKENS.colors.onSurface,
      border: `1px solid ${KB_DESIGN_TOKENS.colors.surfaceVariant}`
    },
    outline: {
      background: 'transparent',
      color: KB_DESIGN_TOKENS.colors.primary,
      border: `1px solid ${KB_DESIGN_TOKENS.colors.primary}`
    }
  };
  
  const colors = baseColors[variant];
  
  return `
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 48px;
    padding: ${KB_DESIGN_TOKENS.spacing.sm} ${KB_DESIGN_TOKENS.spacing.lg};
    background: ${colors.background};
    color: ${colors.color};
    border: ${colors.border};
    border-radius: ${KB_DESIGN_TOKENS.borderRadius.medium};
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    box-sizing: border-box;
    transition: all 0.2s ease;
    
    /* 터치 최적화 */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    user-select: none;
    
    /* 반응형 크기 조정 */
    ${MEDIA_QUERIES.phoneSmall} {
      min-height: 44px;
      padding: ${KB_DESIGN_TOKENS.spacing.sm} ${KB_DESIGN_TOKENS.spacing.md};
      font-size: 13px;
    }
    
    ${MEDIA_QUERIES.phoneLarge} {
      min-height: 52px;
      font-size: 15px;
    }
    
    ${MEDIA_QUERIES.tablet} {
      min-height: 56px;
      font-size: 16px;
      padding: ${KB_DESIGN_TOKENS.spacing.md} ${KB_DESIGN_TOKENS.spacing.xl};
    }
    
    /* 호버 효과 (마우스 디바이스만) */
    ${MEDIA_QUERIES.mouse} {
      &:hover {
        transform: translateY(-1px);
        box-shadow: ${KB_DESIGN_TOKENS.shadows.button};
      }
    }
    
    /* 터치 피드백 */
    ${MEDIA_QUERIES.touch} {
      &:active {
        transform: scale(0.98);
      }
    }
    
    /* 포커스 스타일 */
    &:focus {
      outline: 2px solid ${KB_DESIGN_TOKENS.colors.primary};
      outline-offset: 2px;
    }
  `;
};

// 카드 반응형 스타일
export const createResponsiveCard = (elevation: 'low' | 'medium' | 'high' = 'low') => {
  const shadows = {
    low: KB_DESIGN_TOKENS.shadows.card,
    medium: KB_DESIGN_TOKENS.shadows.button,
    high: KB_DESIGN_TOKENS.shadows.modal
  };
  
  return `
    background: ${KB_DESIGN_TOKENS.colors.background};
    border-radius: ${KB_DESIGN_TOKENS.borderRadius.large};
    box-shadow: ${shadows[elevation]};
    padding: ${KB_DESIGN_TOKENS.spacing.lg};
    margin: ${KB_DESIGN_TOKENS.spacing.sm} 0;
    box-sizing: border-box;
    
    ${MEDIA_QUERIES.phoneSmall} {
      padding: ${KB_DESIGN_TOKENS.spacing.md};
      margin: ${KB_DESIGN_TOKENS.spacing.xs} ${KB_DESIGN_TOKENS.spacing.sm};
      border-radius: ${KB_DESIGN_TOKENS.borderRadius.medium};
    }
    
    ${MEDIA_QUERIES.tablet} {
      padding: ${KB_DESIGN_TOKENS.spacing.xl};
      margin: ${KB_DESIGN_TOKENS.spacing.md} 0;
      border-radius: ${KB_DESIGN_TOKENS.borderRadius.xlarge};
    }
  `;
};

// 입력 필드 반응형 스타일
export const createResponsiveInput = () => `
  width: 100%;
  min-height: 48px;
  padding: ${KB_DESIGN_TOKENS.spacing.sm} ${KB_DESIGN_TOKENS.spacing.md};
  border: 1px solid ${KB_DESIGN_TOKENS.colors.surfaceVariant};
  border-radius: ${KB_DESIGN_TOKENS.borderRadius.medium};
  background: ${KB_DESIGN_TOKENS.colors.background};
  color: ${KB_DESIGN_TOKENS.colors.onSurface};
  font-size: 14px;
  box-sizing: border-box;
  transition: all 0.2s ease;
  
  /* 모바일 입력 최적화 */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  
  ${MEDIA_QUERIES.phoneSmall} {
    min-height: 44px;
    padding: ${KB_DESIGN_TOKENS.spacing.xs} ${KB_DESIGN_TOKENS.spacing.sm};
    font-size: 13px;
  }
  
  ${MEDIA_QUERIES.tablet} {
    min-height: 52px;
    padding: ${KB_DESIGN_TOKENS.spacing.md} ${KB_DESIGN_TOKENS.spacing.lg};
    font-size: 16px;
  }
  
  &:focus {
    outline: none;
    border-color: ${KB_DESIGN_TOKENS.colors.primary};
    box-shadow: 0 0 0 2px ${KB_DESIGN_TOKENS.colors.primary}33;
  }
  
  &::placeholder {
    color: ${KB_DESIGN_TOKENS.colors.onSurfaceVariant};
  }
`;

// 텍스트 반응형 스타일
export const createResponsiveText = (variant: 'h1' | 'h2' | 'h3' | 'body' | 'caption' = 'body') => {
  const baseSizes = {
    h1: 24,
    h2: 20,
    h3: 18,
    body: 14,
    caption: 12
  };
  
  const baseSize = baseSizes[variant];
  
  return `
    font-size: ${baseSize * 0.85}px;
    line-height: ${variant.startsWith('h') ? '1.2' : '1.4'};
    color: ${KB_DESIGN_TOKENS.colors.onSurface};
    margin: 0;
    font-weight: ${variant.startsWith('h') ? '600' : '400'};
    
    ${MEDIA_QUERIES.phoneSmall} {
      font-size: ${Math.max((baseSize * 0.85) - 2, 10)}px;
    }
    
    ${MEDIA_QUERIES.phoneLarge} {
      font-size: ${(baseSize * 0.85) + 1}px;
    }
    
    ${MEDIA_QUERIES.tablet} {
      font-size: ${(baseSize * 0.85) + 2}px;
    }
  `;
};

// 리스트 아이템 반응형 스타일
export const createResponsiveListItem = () => `
  display: flex;
  align-items: center;
  min-height: 56px;
  padding: ${KB_DESIGN_TOKENS.spacing.sm} ${KB_DESIGN_TOKENS.spacing.lg};
  border-bottom: 1px solid ${KB_DESIGN_TOKENS.colors.surfaceVariant};
  background: ${KB_DESIGN_TOKENS.colors.background};
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  ${MEDIA_QUERIES.phoneSmall} {
    min-height: 52px;
    padding: ${KB_DESIGN_TOKENS.spacing.xs} ${KB_DESIGN_TOKENS.spacing.md};
  }
  
  ${MEDIA_QUERIES.tablet} {
    min-height: 64px;
    padding: ${KB_DESIGN_TOKENS.spacing.md} ${KB_DESIGN_TOKENS.spacing.xl};
  }
  
  ${MEDIA_QUERIES.touch} {
    &:active {
      background: ${KB_DESIGN_TOKENS.colors.surface};
    }
  }
  
  ${MEDIA_QUERIES.mouse} {
    &:hover {
      background: ${KB_DESIGN_TOKENS.colors.surface};
    }
  }
`;

// 그리드 반응형 레이아웃
export const createResponsiveGrid = (columns: number, gap: keyof typeof KB_DESIGN_TOKENS.spacing = 'md') => `
  display: grid;
  gap: ${KB_DESIGN_TOKENS.spacing[gap]};
  
  ${MEDIA_QUERIES.phoneSmall} {
    grid-template-columns: repeat(${Math.max(1, columns - 1)}, 1fr);
  }
  
  ${MEDIA_QUERIES.phoneMedium} {
    grid-template-columns: repeat(${columns}, 1fr);
  }
  
  ${MEDIA_QUERIES.tablet7} {
    grid-template-columns: repeat(${columns + 1}, 1fr);
  }
  
  ${MEDIA_QUERIES.tablet10} {
    grid-template-columns: repeat(${columns + 2}, 1fr);
  }
`;

// 디바이스별 최적화된 스타일 생성
export const createDeviceOptimizedStyle = (deviceType: string) => {
  switch (deviceType) {
    case 'foldable_closed':
      return `
        /* 갤럭시 폴드 닫힘 상태 - 좁은 화면 최적화 */
        .kb-button {
          font-size: 12px;
          padding: 8px 12px;
        }
        .kb-text {
          font-size: 13px;
        }
      `;
    case 'foldable_open':
      return `
        /* 갤럭시 폴드 펼침 상태 - 와이드 화면 활용 */
        .kb-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
      `;
    case 'tablet_7':
    case 'tablet_10':
    case 'tablet_12':
      return `
        /* 태블릿 최적화 - 여백 활용 */
        .kb-container {
          max-width: ${KB_BREAKPOINTS.kbOptimal}px;
          margin: 0 auto;
        }
        .kb-card {
          margin: 16px 24px;
        }
      `;
    default:
      return '';
  }
};

// 반응형 애니메이션 최적화
export const createResponsiveAnimation = (reducedMotion = true) => `
  ${reducedMotion ? '@media (prefers-reduced-motion: no-preference) {' : ''}
    transition: all 0.2s ease;
    
    ${MEDIA_QUERIES.mobile} {
      /* 모바일에서는 더 빠른 애니메이션 */
      transition-duration: 0.15s;
    }
    
    ${MEDIA_QUERIES.tablet} {
      /* 태블릿에서는 부드러운 애니메이션 */
      transition-duration: 0.25s;
    }
  ${reducedMotion ? '}' : ''}
  
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    animation: none;
  }
`;

export default {
  KB_DESIGN_TOKENS,
  getDPIScale,
  calculateResponsiveSize,
  ensureTouchTarget,
  createSafeAreaStyle,
  getResponsiveFontSize,
  getResponsiveSpacing,
  createResponsiveContainer,
  createResponsiveHeader,
  createResponsiveButton,
  createResponsiveCard,
  createResponsiveInput,
  createResponsiveText,
  createResponsiveListItem,
  createResponsiveGrid,
  createDeviceOptimizedStyle,
  createResponsiveAnimation
};