/**
 * KB 스타뱅킹 완전 반응형 브레이크포인트 시스템
 * 모든 안드로이드 기기 대응 (320px ~ 1920px)
 * 폴더블, 태블릿, 가로/세로 모드 완전 지원
 */

export const DEVICE_TYPES = {
  PHONE_SMALL: 'phone_small',
  PHONE_MEDIUM: 'phone_medium',
  PHONE_LARGE: 'phone_large',
  TABLET_7: 'tablet_7',
  TABLET_10: 'tablet_10',
  TABLET_12: 'tablet_12',
  FOLDABLE_CLOSED: 'foldable_closed',
  FOLDABLE_OPEN: 'foldable_open',
  DESKTOP: 'desktop',
} as const;

export const BREAKPOINTS = {
  // 모바일 폰 크기 (세로 모드)
  phoneSmall: 320, // Galaxy A series, 저가형 Android
  phoneMedium: 360, // Galaxy S series, Pixel standard
  phoneLarge: 414, // Galaxy Note, iPhone Plus size

  // 폴더블 기기
  foldableClosed: 320, // Galaxy Z Flip 닫힘 상태
  foldableOpen: 512, // Galaxy Z Fold 펼침 상태

  // 태블릿 크기
  tablet7: 600, // 7인치 태블릿 (Galaxy Tab A7 Lite)
  tablet10: 768, // 10인치 태블릿 (Galaxy Tab S series)
  tablet12: 1024, // 12인치 태블릿 (Galaxy Tab S Ultra)

  // 데스크톱
  desktop: 1200, // PC 환경
  desktopLarge: 1440, // 대형 모니터
  desktopXLarge: 1920, // 초대형 모니터
} as const;

export const PORTRAIT_HEIGHTS = {
  phoneSmallPortrait: 568, // 작은 폰 세로
  phoneMediumPortrait: 640, // 표준 폰 세로
  phoneLargePortrait: 896, // 큰 폰 세로
  foldableClosedPortrait: 676, // 폴더블 닫힘 세로
  foldableOpenPortrait: 832, // 폴더블 펼침 세로
  tablet7Portrait: 960, // 7인치 태블릿 세로
  tablet10Portrait: 1024, // 10인치 태블릿 세로
  tablet12Portrait: 1366, // 12인치 태블릿 세로
} as const;

export const LANDSCAPE_HEIGHTS = {
  phoneSmallLandscape: 320, // 작은 폰 가로
  phoneMediumLandscape: 360, // 표준 폰 가로
  phoneLargeLandscape: 414, // 큰 폰 가로
  foldableClosedLandscape: 320, // 폴더블 닫힘 가로
  foldableOpenLandscape: 512, // 폴더블 펼침 가로
  tablet7Landscape: 600, // 7인치 태블릿 가로
  tablet10Landscape: 768, // 10인치 태블릿 가로
  tablet12Landscape: 1024, // 12인치 태블릿 가로
} as const;

// 미디어 쿼리 생성 함수
export const createMediaQuery = (
  minWidth?: number,
  maxWidth?: number,
  minHeight?: number,
  maxHeight?: number,
  orientation?: 'portrait' | 'landscape'
) => {
  const conditions = [];

  if (minWidth) conditions.push(`(min-width: ${minWidth}px)`);
  if (maxWidth) conditions.push(`(max-width: ${maxWidth}px)`);
  if (minHeight) conditions.push(`(min-height: ${minHeight}px)`);
  if (maxHeight) conditions.push(`(max-height: ${maxHeight}px)`);
  if (orientation) conditions.push(`(orientation: ${orientation})`);

  return `@media ${conditions.join(' and ')}`;
};

// 주요 미디어 쿼리 세트
export const MEDIA_QUERIES = {
  // === 모바일 폰 ===
  phoneSmall: createMediaQuery(BREAKPOINTS.phoneSmall, BREAKPOINTS.phoneMedium - 1),
  phoneMedium: createMediaQuery(BREAKPOINTS.phoneMedium, BREAKPOINTS.phoneLarge - 1),
  phoneLarge: createMediaQuery(BREAKPOINTS.phoneLarge, BREAKPOINTS.tablet7 - 1),

  // 모든 폰 크기 (세로 모드)
  phonePortrait: createMediaQuery(
    BREAKPOINTS.phoneSmall,
    BREAKPOINTS.phoneLarge,
    undefined,
    undefined,
    'portrait'
  ),

  // 모든 폰 크기 (가로 모드)
  phoneLandscape: createMediaQuery(
    BREAKPOINTS.phoneSmall,
    BREAKPOINTS.phoneLarge,
    undefined,
    undefined,
    'landscape'
  ),

  // === 폴더블 기기 ===
  foldableClosed: createMediaQuery(BREAKPOINTS.foldableClosed, BREAKPOINTS.foldableClosed + 50),
  foldableOpen: createMediaQuery(BREAKPOINTS.foldableOpen, BREAKPOINTS.foldableOpen + 100),

  // 폴더블 특정 상황
  foldableClosedPortrait: createMediaQuery(
    BREAKPOINTS.foldableClosed,
    BREAKPOINTS.foldableClosed + 50,
    PORTRAIT_HEIGHTS.foldableClosedPortrait,
    undefined,
    'portrait'
  ),
  foldableOpenLandscape: createMediaQuery(
    BREAKPOINTS.foldableOpen,
    BREAKPOINTS.foldableOpen + 100,
    undefined,
    LANDSCAPE_HEIGHTS.foldableOpenLandscape,
    'landscape'
  ),

  // === 태블릿 ===
  tablet7: createMediaQuery(BREAKPOINTS.tablet7, BREAKPOINTS.tablet10 - 1),
  tablet10: createMediaQuery(BREAKPOINTS.tablet10, BREAKPOINTS.tablet12 - 1),
  tablet12: createMediaQuery(BREAKPOINTS.tablet12, BREAKPOINTS.desktop - 1),

  // 태블릿 세로/가로 모드
  tablet7Portrait: createMediaQuery(
    BREAKPOINTS.tablet7,
    BREAKPOINTS.tablet10 - 1,
    PORTRAIT_HEIGHTS.tablet7Portrait,
    undefined,
    'portrait'
  ),
  tablet10Portrait: createMediaQuery(
    BREAKPOINTS.tablet10,
    BREAKPOINTS.tablet12 - 1,
    PORTRAIT_HEIGHTS.tablet10Portrait,
    undefined,
    'portrait'
  ),
  tablet12Portrait: createMediaQuery(
    BREAKPOINTS.tablet12,
    BREAKPOINTS.desktop - 1,
    PORTRAIT_HEIGHTS.tablet12Portrait,
    undefined,
    'portrait'
  ),

  tablet7Landscape: createMediaQuery(
    BREAKPOINTS.tablet7,
    BREAKPOINTS.tablet10 - 1,
    undefined,
    LANDSCAPE_HEIGHTS.tablet7Landscape,
    'landscape'
  ),
  tablet10Landscape: createMediaQuery(
    BREAKPOINTS.tablet10,
    BREAKPOINTS.tablet12 - 1,
    undefined,
    LANDSCAPE_HEIGHTS.tablet10Landscape,
    'landscape'
  ),
  tablet12Landscape: createMediaQuery(
    BREAKPOINTS.tablet12,
    BREAKPOINTS.desktop - 1,
    undefined,
    LANDSCAPE_HEIGHTS.tablet12Landscape,
    'landscape'
  ),

  // === 범위 쿼리 ===
  mobile: createMediaQuery(BREAKPOINTS.phoneSmall, BREAKPOINTS.tablet7 - 1), // 모든 모바일
  tablet: createMediaQuery(BREAKPOINTS.tablet7, BREAKPOINTS.desktop - 1), // 모든 태블릿
  desktop: createMediaQuery(BREAKPOINTS.desktop), // 데스크톱 이상

  // === 특수 상황 ===
  // 매우 작은 화면 (갤럭시 폴드 닫힘 상태 등)
  extraSmall: createMediaQuery(BREAKPOINTS.phoneSmall, 340),

  // 매우 큰 화면 (대형 태블릿, 데스크톱)
  extraLarge: createMediaQuery(BREAKPOINTS.desktopLarge),

  // 가로가 세로보다 긴 화면 (일반적인 가로 모드)
  landscape: createMediaQuery(undefined, undefined, undefined, undefined, 'landscape'),

  // 세로가 가로보다 긴 화면 (일반적인 세로 모드)
  portrait: createMediaQuery(undefined, undefined, undefined, undefined, 'portrait'),

  // 정사각형에 가까운 화면 (폴더블의 특정 상태)
  square: '@media (aspect-ratio: 1/1)',

  // 와이드 스크린 (16:9 또는 그 이상)
  widescreen: '@media (min-aspect-ratio: 16/9)',

  // 높은 DPI 화면 (레티나 디스플레이 등)
  highDPI: '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',

  // 터치 디바이스
  touch: '@media (hover: none) and (pointer: coarse)',

  // 마우스 디바이스
  mouse: '@media (hover: hover) and (pointer: fine)',
} as const;

// 디바이스 타입 감지 함수
export const getDeviceType = (width: number, height: number): keyof typeof DEVICE_TYPES => {
  const isPortrait = height > width;

  // 폴더블 기기 감지 (특별한 비율)
  if (width >= 512 && width <= 616 && isPortrait) {
    return DEVICE_TYPES.FOLDABLE_OPEN;
  }
  if (width >= 320 && width <= 360 && height >= 676) {
    return DEVICE_TYPES.FOLDABLE_CLOSED;
  }

  // 태블릿 크기 감지
  if (width >= BREAKPOINTS.tablet12) return DEVICE_TYPES.TABLET_12;
  if (width >= BREAKPOINTS.tablet10) return DEVICE_TYPES.TABLET_10;
  if (width >= BREAKPOINTS.tablet7) return DEVICE_TYPES.TABLET_7;

  // 모바일 폰 크기 감지
  if (width >= BREAKPOINTS.phoneLarge) return DEVICE_TYPES.PHONE_LARGE;
  if (width >= BREAKPOINTS.phoneMedium) return DEVICE_TYPES.PHONE_MEDIUM;

  return DEVICE_TYPES.PHONE_SMALL;
};

// 안전한 화면 크기 계산 (노치, 상태바 고려)
export const getSafeAreaDimensions = () => {
  return {
    top: 'env(safe-area-inset-top, 0px)',
    bottom: 'env(safe-area-inset-bottom, 0px)',
    left: 'env(safe-area-inset-left, 0px)',
    right: 'env(safe-area-inset-right, 0px)',
  };
};

// KB 디자인 시스템 특화 브레이크포인트
export const KB_BREAKPOINTS = {
  // KB 앱의 최적 표시 너비 (430px 기준)
  kbOptimal: 430,

  // KB 앱 최소 너비 (작은 폰에서도 사용 가능)
  kbMinimum: 320,

  // KB 앱 최대 너비 (태블릿에서 중앙 정렬)
  kbMaximum: 430,

  // KB 헤더 고정 높이
  kbHeaderHeight: 48,

  // KB 탭바 고정 높이
  kbTabBarHeight: 60,
} as const;

export type DeviceType = keyof typeof DEVICE_TYPES;
export type BreakpointKey = keyof typeof BREAKPOINTS;
export type MediaQueryKey = keyof typeof MEDIA_QUERIES;
