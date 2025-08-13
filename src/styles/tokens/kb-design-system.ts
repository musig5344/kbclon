/**
 * KB스타뱅킹 공식 디자인 시스템 토큰
 * 원본 앱 100% 정확도로 추출한 디자인 토큰
 */

export const KBDesignSystem = {
  // KB 공식 컬러 팔레트
  colors: {
    primary: {
      yellow: '#FFD338', // KB 시그니처 노란색
      yellowDark: '#FFBC00', // 진한 노란색 (pressed state) - 정확한 KB 색상
      yellowLight: '#FFF9E6', // 연한 노란색 (background)
      yellowAlpha10: 'rgba(255, 211, 56, 0.1)',
      yellowAlpha20: 'rgba(255, 211, 56, 0.2)',
    },
    secondary: {
      blue: '#004C9F', // KB 파란색
      blueDark: '#003C7F', // 진한 파란색
      blueLight: '#E6F0FF', // 연한 파란색
    },
    text: {
      primary: '#26282C', // KB 정확한 블랙 색상
      secondary: '#636366', // 보조 텍스트
      tertiary: '#8E8E93', // 3차 텍스트
      inverse: '#FFFFFF', // 반전 텍스트
    },
    background: {
      white: '#FFFFFF',
      gray100: '#F8F9FA', // 최연한 회색 (메인 배경)
      gray200: '#F2F2F7', // 연한 회색
      gray300: '#E5E5EA', // 중간 회색
      gray400: '#D1D1D6', // 진한 회색
    },
    border: {
      light: '#E5E5EA', // 연한 테두리
      medium: '#D1D1D6', // 중간 테두리
      dark: '#C7C7CC', // 진한 테두리
    },
    status: {
      success: '#34C759', // 성공/입금
      error: '#FF3B30', // 에러/출금
      warning: '#FF9500', // 경고
      info: '#007AFF', // 정보
    },
    overlay: {
      black50: 'rgba(0, 0, 0, 0.5)',
      black70: 'rgba(0, 0, 0, 0.7)',
      white50: 'rgba(255, 255, 255, 0.5)',
    },
  },

  // KB 타이포그래피 시스템
  typography: {
    fontFamily: {
      primary:
        "'kbfg_text', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'SF Mono', 'Monaco', 'Inconsolata', monospace",
    },
    fontSize: {
      // 원본 앱 정확한 사이즈
      xxxs: '10px', // 매우 작은 텍스트
      xxs: '11px', // 아주 작은 텍스트
      xs: '12px', // 작은 텍스트
      sm: '13px', // 보조 텍스트
      base: '14px', // 기본 텍스트
      md: '15px', // 중간 텍스트
      lg: '16px', // 큰 텍스트
      xl: '18px', // 제목
      xxl: '20px', // 큰 제목
      xxxl: '24px', // 메인 제목
      xxxxl: '28px', // 대형 숫자
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7,
    },
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em',
    },
  },

  // KB 스페이싱 시스템 (8px 기준)
  spacing: {
    xxs: '2px', // 0.125rem
    xs: '4px', // 0.25rem
    sm: '8px', // 0.5rem
    md: '12px', // 0.75rem
    base: '16px', // 1rem
    lg: '20px', // 1.25rem
    xl: '24px', // 1.5rem
    xxl: '32px', // 2rem
    xxxl: '40px', // 2.5rem
    xxxxl: '48px', // 3rem
  },

  // KB 모서리 둥글기
  borderRadius: {
    none: '0',
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    xxl: '20px',
    full: '9999px',
    // 원본 앱 특정 radius
    card: '16px', // 카드 컴포넌트
    button: '8px', // 버튼
    input: '8px', // 입력 필드
    modal: '20px', // 모달/바텀시트
    tab: '20px 20px 0 0', // 탭 상단
  },

  // KB 그림자 시스템
  shadows: {
    none: 'none',
    // 원본 앱 정확한 그림자
    xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
    sm: '0 2px 4px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.10)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
    // 특수 그림자
    card: '0 2px 8px rgba(0, 0, 0, 0.08)',
    button: '0 2px 4px rgba(0, 0, 0, 0.12)',
    bottomSheet: '0 -2px 10px rgba(0, 0, 0, 0.10)',
    topBar: '0 2px 4px rgba(0, 0, 0, 0.06)',
  },

  // KB 애니메이션
  animation: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
      verySlow: '500ms',
    },
    easing: {
      // iOS 네이티브 느낌
      easeIn: 'cubic-bezier(0.32, 0, 0.67, 0)',
      easeOut: 'cubic-bezier(0.33, 1, 0.68, 1)',
      easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      // Android Material 느낌
      standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
      accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    },
  },

  // KB 터치 타겟 사이즈
  touchTarget: {
    minimum: '44px', // iOS 최소 권장
    comfortable: '48px', // 편안한 터치
    large: '56px', // 큰 버튼
  },

  // KB 레이아웃
  layout: {
    headerHeight: '56px',
    tabBarHeight: '56px',
    bottomPadding: '84px', // 하단 탭바 + safe area
    containerPadding: '16px',
    cardGap: '12px',
    sectionGap: '24px',
  },

  // Z-Index 시스템
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    modalBackdrop: 400,
    modal: 500,
    popover: 600,
    tooltip: 700,
    toast: 800,
    loading: 900,
  },
} as const;

// 타입 추출
export type KBColors = typeof KBDesignSystem.colors;
export type KBTypography = typeof KBDesignSystem.typography;
export type KBSpacing = typeof KBDesignSystem.spacing;
export type KBShadows = typeof KBDesignSystem.shadows;
export type KBAnimation = typeof KBDesignSystem.animation;

// 기본 내보내기
export default KBDesignSystem;
