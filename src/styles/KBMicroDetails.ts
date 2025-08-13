/**
 * KB 스타뱅킹 미세 디테일 스타일
 * 원본보다 더 원본같은 UI를 위한 정교한 스타일 정의
 */

import { css, keyframes } from 'styled-components';

// KB 특유의 그림자 효과들
export const kbShadows = {
  // 카드 컴포넌트 기본 그림자 (매우 연한)
  card: '0 2px 8px rgba(0, 0, 0, 0.04)',
  
  // 호버/포커스 시 그림자
  cardHover: '0 4px 16px rgba(0, 0, 0, 0.08)',
  
  // 바텀시트/모달 그림자
  bottomSheet: '0 -4px 20px rgba(0, 0, 0, 0.12)',
  
  // 플로팅 버튼 그림자
  floating: '0 4px 12px rgba(0, 0, 0, 0.15)',
  
  // 헤더 스크롤 시 그림자
  headerScroll: '0 2px 4px rgba(0, 0, 0, 0.06)',
  
  // 입력 필드 포커스 그림자
  inputFocus: '0 0 0 4px rgba(255, 211, 56, 0.2)', // KB 노란색 글로우
};

// KB 버튼 터치 애니메이션
export const kbButtonPress = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(0.96); }
  100% { transform: scale(1); }
`;

// KB 숫자 롤링 애니메이션
export const kbNumberRoll = keyframes`
  0% { 
    transform: translateY(20px);
    opacity: 0;
  }
  50% {
    opacity: 0.5;
  }
  100% { 
    transform: translateY(0);
    opacity: 1;
  }
`;

// KB 탭 언더라인 슬라이드
export const kbTabSlide = keyframes`
  from { 
    transform: translateX(var(--from-x));
  }
  to { 
    transform: translateX(var(--to-x));
  }
`;

// KB 로딩 도트 애니메이션 (정확한 타이밍)
export const kbLoadingDot = keyframes`
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
`;

// KB 페이지 전환 애니메이션
export const kbPageSlideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0.8;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const kbPageSlideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-30%);
    opacity: 0.6;
  }
`;

// KB 특유의 버튼 스타일
export const kbButtonStyle = css`
  position: relative;
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
  
  &:active {
    animation: ${kbButtonPress} 0.3s ease-out;
  }
  
  /* 터치 시 리플 효과 */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:active::after {
    width: 300px;
    height: 300px;
  }
`;

// KB 입력 필드 스타일
export const kbInputStyle = css`
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:focus {
    box-shadow: ${kbShadows.inputFocus};
    border-color: #FFD338;
  }
  
  /* 입력 시 미세한 진동 효과 */
  &:focus:valid {
    animation: kbMicroShake 0.2s ease-out;
  }
`;

// 미세한 진동 애니메이션
export const kbMicroShake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-1px); }
  75% { transform: translateX(1px); }
`;

// KB 폰트 렌더링 최적화
export const kbFontOptimization = css`
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings: 'kern' 1;
  font-kerning: normal;
  letter-spacing: -0.3px;
  
  /* 숫자에 대한 특별한 처리 */
  &.number {
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.5px;
  }
`;

// KB 스크롤 부드러움
export const kbSmoothScroll = css`
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  
  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
`;

// Bottom Sheet 바운스 효과
export const kbBottomSheetBounce = keyframes`
  0% { transform: translateY(100%); }
  60% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

// 당겨서 새로고침 인디케이터
export const kbPullToRefresh = keyframes`
  0% { 
    transform: rotate(0deg);
    opacity: 0.5;
  }
  100% { 
    transform: rotate(360deg);
    opacity: 1;
  }
`;

// KB 특유의 토스트 메시지 애니메이션
export const kbToastSlideIn = keyframes`
  from {
    transform: translateY(-100%) translateX(-50%);
    opacity: 0;
  }
  to {
    transform: translateY(0) translateX(-50%);
    opacity: 1;
  }
`;

// 잔액 변경 시 하이라이트 효과
export const kbBalanceHighlight = keyframes`
  0% { background-color: transparent; }
  50% { background-color: rgba(255, 211, 56, 0.2); }
  100% { background-color: transparent; }
`;

// 메뉴 아이템 터치 효과
export const kbMenuItemTouch = css`
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.02);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease-out;
  }
  
  &:active::before {
    transform: scaleX(1);
  }
`;

// 스켈레톤 로딩 애니메이션
export const kbSkeletonPulse = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

export const kbSkeletonStyle = css`
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: ${kbSkeletonPulse} 1.5s ease-in-out infinite;
`;

// 정확한 타이밍 상수들
export const kbTimings = {
  instant: '0.1s',
  fast: '0.2s',
  normal: '0.3s',
  slow: '0.5s',
  verySlow: '0.8s',
  
  // 이징 함수들
  easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.6, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// 반응형 터치 영역 확대
export const kbTouchTarget = css`
  position: relative;
  
  /* 최소 44px 터치 영역 보장 */
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    right: -10px;
    bottom: -10px;
    left: -10px;
  }
`;

// KB 특유의 카드 플립 애니메이션
export const kbCardFlip = keyframes`
  0% {
    transform: perspective(1000px) rotateY(0deg);
  }
  100% {
    transform: perspective(1000px) rotateY(180deg);
  }
`;

// 미세한 펄스 효과 (알림 등)
export const kbMicroPulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
`;