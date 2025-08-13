/**
 * Android WebView 전용 최적화 스타일
 * - Capacitor APK에서 완벽한 UI/UX 동작 보장
 * - Android WebView 환경에 특화된 최적화
 * - 웹 호환성보다는 Android 네이티브 성능에 집중
 * - ULTRATHINK 수준의 Android 최적화
 */

import { css } from 'styled-components';

// Android WebView 전용 글로벌 최적화
const androidWebViewGlobalStyles = css`
  /* Android WebView 성능 최적화 */
  * {
    /* GPU 가속 강제 활성화 */
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    will-change: auto;
    
    /* Android WebView 터치 최적화 */
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    
    /* Android WebView 스크롤 최적화 */
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: none;
    
    /* Android 하드웨어 가속 */
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }

  /* Android WebView 전용 루트 스타일 */
  html {
    /* Android WebView 뷰포트 고정 */
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    
    /* Android 폰트 렌더링 최적화 */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    
    /* Android WebView 터치 지연 제거 */
    touch-action: manipulation;
    -ms-touch-action: manipulation;
  }

  body {
    /* Android WebView 전체화면 */
    width: 100vw;
    height: 100vh;
    height: 100dvh; /* Android Chrome의 동적 뷰포트 지원 */
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    
    /* Android 상태바/네비게이션바 대응 */
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
    
    /* Android WebView 성능 */
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: none;
    
    /* Android 키보드 대응 */
    min-height: 100vh;
    min-height: -webkit-fill-available;
  }
`;

// Android WebView 전용 컨테이너 스타일
const androidAppContainer = css`
  /* Android WebView 기본 컨테이너 */
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  height: 100dvh;
  min-height: 100vh;
  min-height: -webkit-fill-available;
  
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  
  /* Android 터치 최적화 */
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: none;
  
  /* Android WebView 하드웨어 가속 */
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  will-change: scroll-position;
  
  /* Android 안전 영역 */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
`;

// Android WebView 터치 최적화 버튼
const androidOptimizedButton = css`
  /* Android WebView 터치 타겟 최적화 */
  min-width: 48px;
  min-height: 48px;
  padding: 12px 16px;
  
  /* Android 터치 피드백 */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  cursor: pointer;
  
  /* Android WebView 성능 최적화 */
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  will-change: transform, background-color;
  
  /* Android 터치 상태 */
  &:active {
    transform: scale(0.98) translateZ(0);
    transition: transform 0.1s ease;
  }
  
  /* Android 접근성 */
  outline: none;
  &:focus-visible {
    outline: 2px solid #FFD338;
    outline-offset: 2px;
  }
`;

// Android WebView 전용 입력 필드
const androidOptimizedInput = css`
  /* Android WebView 입력 필드 최적화 */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  
  width: 100%;
  min-height: 48px;
  padding: 12px 16px;
  
  /* Android 키보드 최적화 */
  font-size: 16px; /* Android 확대 방지 */
  line-height: 1.5;
  
  /* Android WebView 터치 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  /* Android 입력 성능 */
  transform: translateZ(0);
  will-change: border-color, box-shadow;
  
  &:focus {
    outline: none;
    border-color: #FFD338;
    box-shadow: 0 0 0 2px rgba(255, 211, 56, 0.3);
  }
`;

// Android WebView 스크롤 최적화
const androidOptimizedScroll = css`
  /* Android WebView 스크롤 성능 */
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: none;
  
  /* Android 스크롤바 숨김 */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
  
  /* Android 스크롤 성능 */
  transform: translateZ(0);
  will-change: scroll-position;
`;

// Android WebView 리스트 최적화
const androidOptimizedList = css`
  /* Android WebView 리스트 성능 */
  transform: translateZ(0);
  will-change: contents;
  
  /* Android 터치 스크롤 */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: none;
  
  /* Android 리스트 아이템 최적화 */
  & > * {
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
  }
`;

// Android WebView 애니메이션 최적화
const androidOptimizedAnimation = css`
  /* Android WebView 애니메이션 성능 */
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  will-change: transform, opacity;
  
  /* Android 하드웨어 가속 애니메이션 */
  animation-fill-mode: both;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Android 성능 최적화 */
  perspective: 1000px;
  transform-style: preserve-3d;
`;

// Android WebView 모달/오버레이 최적화
const androidOptimizedModal = css`
  /* Android WebView 모달 최적화 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  
  /* Android 터치 이벤트 차단 */
  touch-action: none;
  -webkit-overflow-scrolling: touch;
  
  /* Android WebView 성능 */
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  will-change: opacity, visibility;
  
  /* Android 키보드 대응 */
  height: 100vh;
  height: 100dvh;
  min-height: -webkit-fill-available;
`;

// Android WebView 네비게이션 최적화
const androidOptimizedNavigation = css`
  /* Android WebView 네비게이션 고정 */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  
  /* Android 안전 영역 */
  padding-bottom: env(safe-area-inset-bottom);
  height: calc(60px + env(safe-area-inset-bottom));
  
  /* Android WebView 성능 */
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  will-change: transform;
  
  /* Android 터치 최적화 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
`;

// Android 특정 미디어 쿼리 (주요 Android 디바이스 기준)
const androidMediaQueries = {
  // Samsung Galaxy S22/23 (360dp × 780dp)
  galaxyS: '@media (width: 360px) and (height: 780px)',
  
  // Samsung Galaxy S22+ (384dp × 854dp)  
  galaxySPlus: '@media (width: 384px) and (height: 854px)',
  
  // Samsung Galaxy S22 Ultra (384dp × 854dp)
  galaxyUltra: '@media (width: 384px) and (height: 854dp)',
  
  // Google Pixel 6/7 (360dp × 780dp)
  pixel: '@media (width: 360px) and (height: 780px)',
  
  // OnePlus 10 (360dp × 800dp)
  onePlus: '@media (width: 360px) and (height: 800px)',
  
  // Xiaomi Mi 12 (360dp × 800dp)
  xiaomi: '@media (width: 360px) and (height: 800px)',
  
  // 일반 Android (최소 사양)
  androidMin: '@media (min-width: 360px) and (min-height: 640px)',
  
  // 대형 Android
  androidLarge: '@media (min-width: 400px) and (min-height: 800px)',
} as const;

// Android WebView 디버깅 도구 (개발 모드 전용)
const androidDebugStyles = css`
  ${process.env.NODE_ENV === 'development' && `
    /* Android WebView 성능 모니터링 */
    &::before {
      content: 'Android WebView';
      position: fixed;
      top: env(safe-area-inset-top, 20px);
      left: 10px;
      background: rgba(255, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      z-index: 9999;
      pointer-events: none;
    }
    
    /* 터치 영역 시각화 */
    button::after,
    [role="button"]::after {
      content: '';
      position: absolute;
      top: -10px;
      left: -10px;
      right: -10px;
      bottom: -10px;
      border: 1px dashed rgba(255, 0, 0, 0.3);
      pointer-events: none;
    }
  `}
`;

// Android WebView 폰트 최적화
const androidFontOptimization = css`
  /* Android WebView 폰트 렌더링 */
  font-family: 'Roboto', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  
  /* Android 폰트 크기 동적 조정 방지 */
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;
  
  /* Android 텍스트 선택 방지 (필요시) */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

// Android WebView 이미지 최적화
const androidImageOptimization = css`
  /* Android WebView 이미지 최적화 */
  img {
    /* GPU 가속 이미지 렌더링 */
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    
    /* Android 이미지 로딩 최적화 */
    loading: lazy;
    decoding: async;
    
    /* Android WebView 이미지 품질 */
    image-rendering: -webkit-optimize-contrast;
    -ms-interpolation-mode: bicubic;
  }
`;

export {
  androidWebViewGlobalStyles,
  androidAppContainer,
  androidOptimizedButton,
  androidOptimizedInput,
  androidOptimizedScroll,
  androidOptimizedList,
  androidOptimizedAnimation,
  androidOptimizedModal,
  androidOptimizedNavigation,
  androidMediaQueries,
  androidDebugStyles,
  androidFontOptimization,
  androidImageOptimization,
};