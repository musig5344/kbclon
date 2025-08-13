import { createGlobalStyle } from 'styled-components';

import KBFGTextBoldOTF from '../assets/fonts/kbfg_text_b.otf';
import KBFGTextLightOTF from '../assets/fonts/kbfg_text_l.otf';
import KBFGTextMediumOTF from '../assets/fonts/kbfg_text_m.otf';

import { 
  androidWebViewGlobalStyles,
  androidFontOptimization,
  androidImageOptimization 
} from './android-webview-optimizations';
import { kbFontOptimization, kbSmoothScroll, kbTimings } from './KBMicroDetails';
import { tokens } from './tokens';
const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'KBFGText';
    src: url(${KBFGTextLightOTF}) format('opentype');
    font-weight: 300;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'KBFGText';
    src: url(${KBFGTextMediumOTF}) format('opentype');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'KBFGText';
    src: url(${KBFGTextBoldOTF}) format('opentype');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: 'KBFGText', ${tokens.typography.fontFamily.base};
    font-weight: ${tokens.typography.fontWeight.medium};
    ${kbFontOptimization}
    background-color: ${tokens.colors.background.tertiary}; /* PC에서 보일 배경색 */
    color: ${tokens.colors.text.primary};
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100vh;
    overflow-x: hidden;
    ${kbSmoothScroll}
    
    /* PC에서는 중앙 정렬로 모바일 시뮬레이션 */
    @media (min-width: 769px) {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    /* 모바일에서는 전체 화면 */
    @media (max-width: 768px) {
      display: block;
    }
  }
  #root {
    width: 100%;
    max-width: 100vw;
    height: 100%;
    min-height: 100vh;
    min-height: 100dvh; /* 동적 뷰포트 높이 지원 */
    background-color: ${tokens.colors.background.primary};
    position: relative;
    overflow-x: hidden;
    
    /* iOS Safari 주소창 대응 */
    min-height: -webkit-fill-available;
  }
  /* 디자인 토큰은 tokens.ts에서 관리되므로 별도 CSS 파일 임포트 제거 */
  /* 접근성 개선 */
  :focus-visible {
    outline: ${tokens.app.focusOutlineWidth} solid ${tokens.colors.brand.primary};
    outline-offset: ${tokens.app.focusOutlineOffset};
  }
  /* 스크롤바 숨김 - 모든 브라우저 지원 */
  * {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }
  
  ::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
    width: 0;
    height: 0;
  }
  /* 터치 하이라이트 제거 */
  * {
    -webkit-tap-highlight-color: transparent;
  }
  /* 버튼 기본 스타일 */
  button {
    font-family: inherit;
    font-weight: inherit;
    cursor: pointer;
    user-select: none;
  }
  /* 링크 기본 스타일 */
  a {
    color: inherit;
    text-decoration: none;
  }
  /* 입력 필드 기본 스타일 */
  input, textarea, select {
    font-family: inherit;
    font-weight: inherit;
    ${kbFontOptimization}
  }
  
  /* KB 특유의 전역 애니메이션 설정 */
  * {
    /* 모든 요소에 부드러운 트랜지션 기본값 */
    transition-property: opacity, transform, box-shadow, background-color, border-color;
    transition-duration: ${kbTimings.fast};
    transition-timing-function: ${kbTimings.easeOut};
  }
  
  /* 숫자 요소에 특별한 처리 */
  .number, [data-type="number"] {
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.5px;
  }
  
  /* 페이지 전환 애니메이션 - 향상된 iOS 스타일 */
  .page-transition-enter {
    opacity: 0.8;
    transform: translateX(100%);
  }
  
  .page-transition-enter-active {
    opacity: 1;
    transform: translateX(0);
    transition: all ${kbTimings.normal} ${kbTimings.easeOut};
  }
  
  .page-transition-exit {
    opacity: 1;
    transform: translateX(0);
  }
  
  .page-transition-exit-active {
    opacity: 0.6;
    transform: translateX(-30%);
    transition: all ${kbTimings.normal} ${kbTimings.easeIn};
  }

  /* 뒤로가기 전환 애니메이션 */
  .page-transition-backward-enter {
    opacity: 0.8;
    transform: translateX(-100%);
  }
  
  .page-transition-backward-enter-active {
    opacity: 1;
    transform: translateX(0);
    transition: all ${kbTimings.normal} ${kbTimings.easeOut};
  }
  
  .page-transition-backward-exit {
    opacity: 1;
    transform: translateX(0);
  }
  
  .page-transition-backward-exit-active {
    opacity: 0.6;
    transform: translateX(30%);
    transition: all ${kbTimings.normal} ${kbTimings.easeIn};
  }
  
  /* 모달 애니메이션 */
  .modal-enter {
    opacity: 0;
    transform: scale(0.95);
  }
  
  .modal-enter-active {
    opacity: 1;
    transform: scale(1);
    transition: all ${kbTimings.fast} ${kbTimings.easeOut};
  }
  
  /* 터치 가능 영역 최소 크기 보장 */
  button, a, [role="button"], [role="link"] {
    min-height: 44px;
    min-width: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  /* 이미지 로딩 최적화 */
  img {
    display: block;
    max-width: 100%;
    height: auto;
  }
  
  /* 텍스트 선택 스타일 */
  ::selection {
    background-color: rgba(255, 211, 56, 0.3);
    color: ${tokens.colors.text.primary};
  }

  /* Android WebView 전용 최적화 - 모바일에서만 적용 */
  @media (max-width: 768px) {
    ${androidWebViewGlobalStyles}
    ${androidFontOptimization}
    ${androidImageOptimization}
  }
`;
export default GlobalStyle; 