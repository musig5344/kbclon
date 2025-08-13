/**
 * KB 스타뱅킹 반응형 훅
 * 화면 크기 감지, 디바이스 타입 식별, 반응형 상태 관리
 * 실시간 화면 크기 변화 감지 및 최적화된 리렌더링
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

import { BREAKPOINTS, getDeviceType, MEDIA_QUERIES, KB_BREAKPOINTS } from '../styles/breakpoints';
import {
  calculateResponsiveSize,
  getDPIScale,
  KB_DESIGN_TOKENS,
} from '../styles/responsive-system';

export interface ResponsiveState {
  // 기본 화면 정보
  width: number;
  height: number;
  devicePixelRatio: number;

  // 디바이스 타입
  deviceType: string;
  isPhone: boolean;
  isTablet: boolean;
  isFoldable: boolean;
  isDesktop: boolean;

  // 방향 정보
  orientation: 'portrait' | 'landscape';
  isPortrait: boolean;
  isLandscape: boolean;

  // 브레이크포인트 매칭
  breakpoint: keyof typeof BREAKPOINTS | 'unknown';
  matches: {
    phoneSmall: boolean;
    phoneMedium: boolean;
    phoneLarge: boolean;
    tablet7: boolean;
    tablet10: boolean;
    tablet12: boolean;
    foldableClosed: boolean;
    foldableOpen: boolean;
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };

  // KB 앱 최적화 정보
  isKBOptimalWidth: boolean;
  kbScale: number;

  // 터치 및 접근성
  isTouchDevice: boolean;
  hasHover: boolean;
  prefersReducedMotion: boolean;

  // 안전 영역 정보
  safeArea: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

// 미디어 쿼리 매칭 함수
const matchMediaQuery = (query: string): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(query.replace('@media ', '')).matches;
};

// 안전 영역 크기 계산
const getSafeAreaValues = (): { top: number; bottom: number; left: number; right: number } => {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
  };
};

// 브레이크포인트 매칭
const getBreakpointMatches = (width: number) => ({
  phoneSmall: width >= BREAKPOINTS.phoneSmall && width < BREAKPOINTS.phoneMedium,
  phoneMedium: width >= BREAKPOINTS.phoneMedium && width < BREAKPOINTS.phoneLarge,
  phoneLarge: width >= BREAKPOINTS.phoneLarge && width < BREAKPOINTS.tablet7,
  tablet7: width >= BREAKPOINTS.tablet7 && width < BREAKPOINTS.tablet10,
  tablet10: width >= BREAKPOINTS.tablet10 && width < BREAKPOINTS.tablet12,
  tablet12: width >= BREAKPOINTS.tablet12 && width < BREAKPOINTS.desktop,
  foldableClosed: width >= BREAKPOINTS.foldableClosed && width <= 360,
  foldableOpen: width >= BREAKPOINTS.foldableOpen && width <= 616,
  mobile: width < BREAKPOINTS.tablet7,
  tablet: width >= BREAKPOINTS.tablet7 && width < BREAKPOINTS.desktop,
  desktop: width >= BREAKPOINTS.desktop,
});

// 현재 브레이크포인트 결정
const getCurrentBreakpoint = (width: number): keyof typeof BREAKPOINTS | 'unknown' => {
  if (width >= BREAKPOINTS.desktopXLarge) return 'desktopXLarge';
  if (width >= BREAKPOINTS.desktopLarge) return 'desktopLarge';
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet12) return 'tablet12';
  if (width >= BREAKPOINTS.tablet10) return 'tablet10';
  if (width >= BREAKPOINTS.tablet7) return 'tablet7';
  if (width >= BREAKPOINTS.phoneLarge) return 'phoneLarge';
  if (width >= BREAKPOINTS.phoneMedium) return 'phoneMedium';
  if (width >= BREAKPOINTS.phoneSmall) return 'phoneSmall';
  return 'unknown';
};

export const useResponsive = () => {
  // 초기 상태
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: KB_BREAKPOINTS.kbOptimal, height: 800 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  });

  // 화면 크기 변경 감지
  const updateDimensions = useCallback(() => {
    if (typeof window === 'undefined') return;

    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  // 디바운스된 리사이즈 핸들러
  const [resizeTimeout, setResizeTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleResize = useCallback(() => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }

    const timeout = setTimeout(updateDimensions, 100);
    setResizeTimeout(timeout);
  }, [resizeTimeout, updateDimensions]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 초기 크기 설정
    updateDimensions();

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // 미디어 쿼리 변경 감지
    const mediaQueryLists = Object.values(MEDIA_QUERIES)
      .map(query => {
        if (typeof window.matchMedia === 'function') {
          const mql = window.matchMedia(query.replace('@media ', ''));
          mql.addEventListener('change', updateDimensions);
          return mql;
        }
        return null;
      })
      .filter(Boolean);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);

      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      // 미디어 쿼리 리스너 제거
      mediaQueryLists.forEach(mql => {
        if (mql) {
          mql.removeEventListener('change', updateDimensions);
        }
      });
    };
  }, [handleResize, updateDimensions, resizeTimeout]);

  // 반응형 상태 계산 (메모이제이션)
  const responsiveState = useMemo((): ResponsiveState => {
    const { width, height } = dimensions;
    const devicePixelRatio = getDPIScale();
    const orientation = width > height ? 'landscape' : 'portrait';
    const deviceType = getDeviceType(width, height);
    const breakpoint = getCurrentBreakpoint(width);
    const matches = getBreakpointMatches(width);
    const kbScale = Math.min(width / KB_BREAKPOINTS.kbOptimal, 1.2);

    // 디바이스 카테고리 판단
    const isPhone = matches.phoneSmall || matches.phoneMedium || matches.phoneLarge;
    const isTablet = matches.tablet7 || matches.tablet10 || matches.tablet12;
    const isFoldable = matches.foldableClosed || matches.foldableOpen;
    const isDesktop = matches.desktop;

    // 터치 및 접근성 기능 감지
    const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;
    const hasHover = matchMediaQuery('(hover: hover) and (pointer: fine)');
    const prefersReducedMotion = matchMediaQuery('(prefers-reduced-motion: reduce)');

    // KB 앱 최적 너비 여부
    const isKBOptimalWidth = Math.abs(width - KB_BREAKPOINTS.kbOptimal) < 50;

    // 안전 영역 정보
    const safeArea = getSafeAreaValues();

    return {
      width,
      height,
      devicePixelRatio,
      deviceType,
      isPhone,
      isTablet,
      isFoldable,
      isDesktop,
      orientation,
      isPortrait: orientation === 'portrait',
      isLandscape: orientation === 'landscape',
      breakpoint,
      matches,
      isKBOptimalWidth,
      kbScale,
      isTouchDevice,
      hasHover,
      prefersReducedMotion,
      safeArea,
    };
  }, [dimensions]);

  // 반응형 값 계산 유틸리티 함수들
  const getResponsiveValue = useCallback(
    <T>(values: {
      phoneSmall?: T;
      phoneMedium?: T;
      phoneLarge?: T;
      tablet7?: T;
      tablet10?: T;
      tablet12?: T;
      desktop?: T;
      default: T;
    }): T => {
      const { matches } = responsiveState;

      if (matches.desktop && values.desktop !== undefined) return values.desktop;
      if (matches.tablet12 && values.tablet12 !== undefined) return values.tablet12;
      if (matches.tablet10 && values.tablet10 !== undefined) return values.tablet10;
      if (matches.tablet7 && values.tablet7 !== undefined) return values.tablet7;
      if (matches.phoneLarge && values.phoneLarge !== undefined) return values.phoneLarge;
      if (matches.phoneMedium && values.phoneMedium !== undefined) return values.phoneMedium;
      if (matches.phoneSmall && values.phoneSmall !== undefined) return values.phoneSmall;

      return values.default;
    },
    [responsiveState]
  );

  // 반응형 폰트 크기 계산
  const getResponsiveFontSize = useCallback(
    (baseFontSize: number): string => {
      const scale = responsiveState.kbScale * 0.85; // 85% 스케일 적용
      let finalSize = baseFontSize * scale;

      // 디바이스별 최소/최대 크기 제한
      if (responsiveState.isPhone) {
        finalSize = Math.max(finalSize, 10);
        finalSize = Math.min(finalSize, 18);
      } else if (responsiveState.isTablet) {
        finalSize = Math.max(finalSize, 12);
        finalSize = Math.min(finalSize, 24);
      }

      return `${Math.round(finalSize)}px`;
    },
    [responsiveState]
  );

  // 반응형 간격 계산
  const getResponsiveSpacing = useCallback(
    (baseSpacing: keyof typeof KB_DESIGN_TOKENS.spacing): string => {
      const baseValue = parseInt(KB_DESIGN_TOKENS.spacing[baseSpacing]);
      const scale = responsiveState.kbScale;
      const finalValue = baseValue * scale;

      return `${Math.round(finalValue)}px`;
    },
    [responsiveState]
  );

  // 반응형 크기 계산
  const getResponsiveSize = useCallback(
    (baseSize: number, minSize?: number, maxSize?: number): number => {
      return calculateResponsiveSize(baseSize, responsiveState.width, minSize, maxSize);
    },
    [responsiveState.width]
  );

  // 미디어 쿼리 매칭 확인
  const matchesQuery = useCallback((query: string): boolean => {
    return matchMediaQuery(query);
  }, []);

  // KB 디자인 시스템 호환 체크
  const isKBCompatible = useMemo(() => {
    return (
      responsiveState.width >= KB_BREAKPOINTS.kbMinimum &&
      responsiveState.width <= KB_BREAKPOINTS.kbMaximum * 2
    );
  }, [responsiveState.width]);

  return {
    // 기본 반응형 상태
    ...responsiveState,

    // 유틸리티 함수들
    getResponsiveValue,
    getResponsiveFontSize,
    getResponsiveSpacing,
    getResponsiveSize,
    matchesQuery,

    // KB 앱 호환성
    isKBCompatible,

    // 디버그 정보
    debug: {
      breakpoint: responsiveState.breakpoint,
      deviceType: responsiveState.deviceType,
      kbScale: responsiveState.kbScale,
      matches: responsiveState.matches,
    },
  };
};

// 반응형 값 선택 유틸리티 (훅 외부에서도 사용 가능)
export const selectResponsiveValue = <T>(
  width: number,
  values: {
    phoneSmall?: T;
    phoneMedium?: T;
    phoneLarge?: T;
    tablet7?: T;
    tablet10?: T;
    tablet12?: T;
    desktop?: T;
    default: T;
  }
): T => {
  const matches = getBreakpointMatches(width);

  if (matches.desktop && values.desktop !== undefined) return values.desktop;
  if (matches.tablet12 && values.tablet12 !== undefined) return values.tablet12;
  if (matches.tablet10 && values.tablet10 !== undefined) return values.tablet10;
  if (matches.tablet7 && values.tablet7 !== undefined) return values.tablet7;
  if (matches.phoneLarge && values.phoneLarge !== undefined) return values.phoneLarge;
  if (matches.phoneMedium && values.phoneMedium !== undefined) return values.phoneMedium;
  if (matches.phoneSmall && values.phoneSmall !== undefined) return values.phoneSmall;

  return values.default;
};

// 반응형 컨텍스트용 타입
export type ResponsiveContextType = ReturnType<typeof useResponsive>;

export default useResponsive;
