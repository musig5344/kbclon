import styled, { keyframes, css } from 'styled-components';

import {
  androidAppContainer,
  androidOptimizedButton,
  androidOptimizedAnimation,
  androidOptimizedScroll
} from '../../../styles/android-webview-optimizations';
import { KBDesignSystem } from '../../../styles/tokens/kb-design-system';

// 스크린 리더 전용 스타일
export const GlobalStyles = `
  .sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }
  .sr-only:focus {
    position: static !important;
    width: auto !important;
    height: auto !important;
    padding: 0.5rem !important;
    margin: 0 !important;
    overflow: visible !important;
    clip: auto !important;
    white-space: normal !important;
    background-color: ${KBDesignSystem.colors.primary.yellow} !important;
    color: ${KBDesignSystem.colors.text.primary} !important;
    border: 2px solid ${KBDesignSystem.colors.text.primary} !important;
    border-radius: ${KBDesignSystem.borderRadius.xs} !important;
  }
`;

// 애니메이션 정의
export const slideUp = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
`;

export const slideDown = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
`;

// 1. CoordinatorLayout - 크로스 플랫폼 호환
export const CoordinatorLayout = styled.div`
  background: linear-gradient(180deg, ${KBDesignSystem.colors.background.gray100} 0%, ${KBDesignSystem.colors.background.white} 10%);
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  min-height: -webkit-fill-available;
  position: relative;
  
  /* PC 브라우저에서 기본 스타일 */
  @media (min-width: 769px) {
    height: 100vh;
    overflow: hidden; /* 모달 열렸을 때 배경 스크롤 방지 */
  }
  
  /* Android APK에서만 WebView 최적화 적용 */
  @media (max-width: 768px) {
    ${androidAppContainer}
    /* Android WebView 터치 최적화 */
    touch-action: pan-y;
    overscroll-behavior: none;
  }
  
  /* 고대비 모드 지원 */
  @media (prefers-contrast: high) {
    background-color: ${KBDesignSystem.colors.background.white};
    border: 2px solid ${KBDesignSystem.colors.text.primary};
  }
  
  /* Android WebView 성능 최적화 */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  
  /* 색상 약자 지원 */
  @media (prefers-color-scheme: dark) {
    background-color: #1A1A1A;
    color: ${KBDesignSystem.colors.text.inverse};
  }
`;

// 2. BackSurfaceView
export const BackSurfaceView = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${KBDesignSystem.colors.overlay.black50};
  opacity: ${props => props.$isOpen ? 1 : 0};
  transition: opacity ${KBDesignSystem.animation.duration.normal} ${KBDesignSystem.animation.easing.easeOut};
  z-index: ${KBDesignSystem.zIndex.modalBackdrop};
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
`;

// 3. ContentLayout - Android WebView 최적화
export const ContentLayout = styled.div`
  ${androidOptimizedScroll}
  flex: 1;
  background: linear-gradient(180deg, ${KBDesignSystem.colors.background.gray100} 0%, ${KBDesignSystem.colors.background.white} 15%);
  display: flex;
  flex-direction: column;
  position: relative;
  
  /* Android WebView 성능 최적화 */
  transform: translateZ(0);
  will-change: scroll-position;
`;

// 4. NewLoginMainContainer - Android WebView 최적화
export const NewLoginMainContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${KBDesignSystem.spacing.xxxl} ${KBDesignSystem.spacing.lg} ${KBDesignSystem.spacing.xxl} ${KBDesignSystem.spacing.lg};
  background-color: ${KBDesignSystem.colors.background.white}; 
  min-height: 0;        
  position: relative;
  
  /* Android WebView 터치 최적화 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  /* Android WebView 성능 */
  transform: translateZ(0);
  will-change: transform;
`;

// 5. LoginOptionText
export const LoginOptionText = styled.span`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.base};
  font-weight: ${KBDesignSystem.typography.fontWeight.bold};
  color: ${KBDesignSystem.colors.text.primary};
  margin-top: ${KBDesignSystem.spacing.xs};
  letter-spacing: ${KBDesignSystem.typography.letterSpacing.tight};
`;

// 6. TitleSection
export const TitleSection = styled.div`
  text-align: center;
  margin-bottom: ${KBDesignSystem.spacing.xxxxl};
  padding: 0 ${KBDesignSystem.spacing.xxl};
  position: relative;
  z-index: 1;
`;

// 7. MainTitle
export const MainTitle = styled.h1`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.xxxxl};
  font-weight: ${KBDesignSystem.typography.fontWeight.bold};
  color: ${KBDesignSystem.colors.text.primary};
  margin-bottom: ${KBDesignSystem.spacing.base};
  letter-spacing: ${KBDesignSystem.typography.letterSpacing.tight};
  line-height: ${KBDesignSystem.typography.lineHeight.tight};
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

// 8. SubTitle
export const SubTitle = styled.p`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.lg};
  color: ${KBDesignSystem.colors.text.secondary};
  line-height: ${KBDesignSystem.typography.lineHeight.normal};
  margin: 0;
  text-align: center;
  font-weight: ${KBDesignSystem.typography.fontWeight.medium};
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

// 9. LoginOptionsContainer
export const LoginOptionsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;            /* 아이콘 컨테이너 증가에 맞춘 간격 조정 */
  margin: 40px 0 56px 0; /* 마진 최적화 */
  padding: 0 24px;      /* 패딩 조정 */
  position: relative;
  z-index: 2;           /* 주요 액션 영역 강조 */
`;

// 10. LoginOptionButton - Android WebView 최적화
export const LoginOptionButton = styled.button`
  ${androidOptimizedButton}
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;            
  padding: 20px;        /* 더 넓은 터치 영역 */
  border-radius: 20px;  /* 더 세련된 모서리 */
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); /* 전문가 easing */
  min-width: 120px;     
  min-height: 120px;    
  position: relative;
  overflow: hidden;
  
  /* Android WebView 터치 최적화 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  /* 미묘한 배경 그라데이션 */
  background: radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%);
  /* 실시간 리플 효과 */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(circle, rgba(255,211,56,0.3) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.6s ease;
    z-index: 0;
  }
  &:hover {
    background: radial-gradient(circle at center, rgba(255,211,56,0.12) 0%, rgba(255,211,56,0.04) 70%);
    transform: translateY(-4px) scale(1.03);
    box-shadow: 
      0 8px 32px rgba(255, 211, 56, 0.25),
      0 4px 16px rgba(0, 0, 0, 0.1);
  }
  &:hover::before {
    width: 100px;
    height: 100px;
    opacity: 0.6;
  }
  &:active {
    transform: translateY(-2px) scale(1.01);
    background: radial-gradient(circle at center, rgba(255,211,56,0.18) 0%, rgba(255,211,56,0.06) 70%);
  }
  &:active::before {
    width: 120px;
    height: 120px;
    opacity: 0.8;
    transition: all 0.15s ease;
  }
  &:focus {
    outline: 4px solid rgba(255, 211, 56, 0.7);
    outline-offset: 4px;
    box-shadow: 
      0 0 0 2px rgba(255, 255, 255, 1),
      0 0 20px rgba(255, 211, 56, 0.3);
  }
`;

// 11. IconImage
export const IconImage = styled.img`
  width: 48px;          /* 실제 앱처럼 약간 크게 */
  height: 48px;
  object-fit: contain;
  filter: brightness(0.6) contrast(1.3) saturate(1.1); /* 최고 명확성을 위한 필터 */
  transition: all 0.2s ease;
`;

// 12. IconContainer
export const IconContainer = styled.div`
  width: 76px;          
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;   
  background: 
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 1) 0%, rgba(248, 248, 248, 0.95) 100%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(240, 240, 240, 0.1) 100%);
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 2px rgba(255, 255, 255, 0.8),
    inset 0 -1px 1px rgba(0, 0, 0, 0.05); /* 고급 입체감 */
  border: 2px solid rgba(255, 255, 255, 0.9);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
  /* 내부 반짝이 효과 */
  &::before {
    content: '';
    position: absolute;
    top: 15%;
    left: 15%;
    width: 25%;
    height: 25%;
    background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
    border-radius: 50%;
    opacity: 0.6;
    transition: all 0.3s ease;
  }
  ${LoginOptionButton}:hover & {
    background: 
      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 1) 0%, rgba(255, 250, 235, 0.98) 100%),
      linear-gradient(135deg, rgba(255, 211, 56, 0.1) 0%, rgba(255, 200, 0, 0.05) 100%);
    box-shadow: 
      0 12px 32px rgba(255, 211, 56, 0.25),
      0 6px 16px rgba(0, 0, 0, 0.15),
      inset 0 2px 4px rgba(255, 255, 255, 0.9),
      inset 0 -2px 2px rgba(255, 211, 56, 0.1);
    border-color: rgba(255, 211, 56, 0.7);
    transform: scale(1.08) translateY(-2px);
  }
  ${LoginOptionButton}:hover &::before {
    opacity: 0.9;
    transform: scale(1.2);
  }
  ${LoginOptionButton}:hover & ${IconImage} {
    filter: brightness(0.3) contrast(1.6) saturate(1.3);
    transform: scale(1.05);
  }
  ${LoginOptionButton}:active & {
    transform: scale(1.05) translateY(-1px);
    box-shadow: 
      0 8px 24px rgba(255, 211, 56, 0.3),
      0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

// 13. Divider
export const Divider = styled.div`
  width: 2px;           
  height: 64px;         /* 컨테이너 크기에 맞춘 증가 */
  background: linear-gradient(to bottom, 
    rgba(200, 200, 200, 0.2) 0%,
    rgba(180, 180, 180, 0.8) 20%,
    rgba(160, 160, 160, 1) 50%,
    rgba(180, 180, 180, 0.8) 80%,
    rgba(200, 200, 200, 0.2) 100%
  ); /* 정교한 그라데이션 */
  border-radius: 1px;
  margin: 0 12px;       /* 좌우 여백 증가 */
  position: relative;
  /* 미묘한 반짝이 효과 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    width: 1px;
    height: 100%;
    background: linear-gradient(to bottom, 
      transparent 0%,
      rgba(255, 255, 255, 0.6) 30%,
      rgba(255, 255, 255, 0.8) 50%,
      rgba(255, 255, 255, 0.6) 70%,
      transparent 100%
    );
    transform: translateX(-50%);
  }
  /* 미묘한 애니메이션 */
  &::after {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    width: 4px;
    height: 4px;
    background: radial-gradient(circle, rgba(255,211,56,0.6) 0%, transparent 70%);
    border-radius: 50%;
    transform: translateX(-50%);
    animation: dividerPulse 3s ease-in-out infinite;
  }
  @keyframes dividerPulse {
    0%, 100% { 
      opacity: 0;
      transform: translateX(-50%) translateY(0px);
    }
    50% { 
      opacity: 1;
      transform: translateX(-50%) translateY(10px);
    }
  }
`;

// 14. YellowButton - Android WebView 최적화
export const YellowButton = styled.button`
  ${androidOptimizedButton}
  width: 100%;
  max-width: 320px;     
  height: ${KBDesignSystem.touchTarget.large};
  background: linear-gradient(135deg, ${KBDesignSystem.colors.primary.yellow} 0%, ${KBDesignSystem.colors.primary.yellowDark} 100%);
  border: none;
  border-radius: ${KBDesignSystem.borderRadius.button};
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.lg};
  font-weight: ${KBDesignSystem.typography.fontWeight.bold};
  color: ${KBDesignSystem.colors.text.primary};
  box-shadow: ${KBDesignSystem.shadows.button};
  margin-bottom: ${KBDesignSystem.spacing.xxl};  
  letter-spacing: ${KBDesignSystem.typography.letterSpacing.tight};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left ${KBDesignSystem.animation.duration.verySlow};
  }
  &:hover::before {
    left: 100%;
  }
  &:hover {
    background: linear-gradient(135deg, ${KBDesignSystem.colors.primary.yellowDark} 0%, #FFB800 100%);
    transform: translateY(-2px) scale(1.01);
    box-shadow: ${KBDesignSystem.shadows.lg};
  }
  &:active {
    transform: translateY(0) scale(0.98);
    box-shadow: ${KBDesignSystem.shadows.sm};
  }
`;

// 15. BottomLinkContainer
export const BottomLinkContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;             /* 링크와 구분선 간 최소 간격 */
  margin-top: 20px;     /* 상단 여백 */
  padding: 0 32px;      /* 좌우 여백 증가 */
  position: relative;
  z-index: 1;           /* 보조 액션 영역 */
`;

// 16. BottomLink - Android WebView 최적화
export const BottomLink = styled.button`
  ${androidOptimizedButton}
  background: none;
  border: none;
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.base};
  color: ${KBDesignSystem.colors.text.secondary};
  cursor: pointer;
  padding: ${KBDesignSystem.spacing.base} ${KBDesignSystem.spacing.lg};   
  border-radius: ${KBDesignSystem.borderRadius.lg};
  transition: all ${KBDesignSystem.animation.duration.normal} ${KBDesignSystem.animation.easing.easeOut};
  min-height: ${KBDesignSystem.touchTarget.minimum};     
  font-weight: ${KBDesignSystem.typography.fontWeight.medium};
  position: relative;
  overflow: hidden;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  
  /* Android WebView 터치 최적화 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  &:hover {
    color: ${KBDesignSystem.colors.text.primary};
    background-color: ${KBDesignSystem.colors.primary.yellowAlpha10};
  }
  
  &:active {
    opacity: 0.7;
    transform: scale(0.98);
  }
  
  &:focus {
    outline: 3px solid ${KBDesignSystem.colors.primary.yellowAlpha20};
    outline-offset: 2px;
  }
`;

// 17. LinkDivider
export const LinkDivider = styled.span`
  color: ${KBDesignSystem.colors.border.medium};
  font-size: ${KBDesignSystem.typography.fontSize.base};
  user-select: none;
  font-weight: ${KBDesignSystem.typography.fontWeight.regular};
  margin: 0 ${KBDesignSystem.spacing.xs};
  opacity: 0.7;
`;

// 18. Footer
export const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${KBDesignSystem.spacing.xxl} ${KBDesignSystem.spacing.xl} ${KBDesignSystem.spacing.xxxxl} ${KBDesignSystem.spacing.xl};
  background: linear-gradient(180deg, ${KBDesignSystem.colors.background.white} 0%, ${KBDesignSystem.colors.background.gray100} 100%);   
  margin-top: auto;
  gap: ${KBDesignSystem.spacing.base};
  border-top: 1px solid ${KBDesignSystem.colors.border.light};
`;

// 19. OtherLoginButton - Android WebView 최적화
export const OtherLoginButton = styled.button`
  ${androidOptimizedButton}
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  gap: 10px;            
  padding: 18px 24px;   
  margin-bottom: 0;     
  font-family: 'KBFGText', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;     
  font-size: 17px;      
  color: #2A2A2A;       
  cursor: pointer;
  border-radius: 16px;  
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); /* 탄성 easing */
  min-height: 48px;     
  position: relative;
  overflow: hidden;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  
  /* Android WebView 터치 최적화 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  /* 미묘한 배경 그라데이션 */
  background: linear-gradient(135deg, rgba(0,0,0,0.015) 0%, rgba(0,0,0,0.005) 100%);
  /* 애니메이션 오버레이 */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(
      circle, 
      rgba(255, 211, 56, 0.2) 0%, 
      rgba(255, 200, 0, 0.1) 50%,
      transparent 70%
    );
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    z-index: 0;
  }
  /* 텍스트와 아이콘 z-index */
  & > * {
    position: relative;
    z-index: 1;
  }
  &:hover {
    color: #0A0A0A;       
    transform: translateY(-2px) scale(1.03);
    box-shadow: 
      0 6px 20px rgba(255, 211, 56, 0.15),
      0 3px 10px rgba(0, 0, 0, 0.08);
  }
  &:hover::before {
    width: 150px;
    height: 150px;
    opacity: 0.8;
  }
  &:active {
    transform: translateY(-1px) scale(1.02);
    transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  &:active::before {
    width: 160px;
    height: 160px;
    opacity: 1;
    transition: all 0.1s ease;
  }
`;

// 20. SimplePayButton - Android WebView 최적화
export const SimplePayButton = styled.button`
  ${androidOptimizedButton}
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;            
  width: 260px;         
  height: 54px;         
  background: 
    linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 100%),
    radial-gradient(circle at top left, rgba(255,211,56,0.03) 0%, transparent 50%);
  border: 2px solid #E0E0E0;
  border-radius: 27px;  
  font-family: 'KBFGText', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;      
  font-weight: 700;     /* Bold로 선명도 강화 */
  color: #1A1A1A;       /* 극대 대비 */
  box-shadow: 
    0 4px 16px rgba(0,0,0,0.08),
    0 2px 8px rgba(0,0,0,0.05),
    inset 0 1px 0 rgba(255,255,255,0.8); /* 내부 하이라이트 */
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 48px;     
  position: relative;
  overflow: hidden;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  
  /* Android WebView 터치 최적화 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  /* 미묘한 반짝이 효과 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%);
    border-radius: 27px 27px 0 0;
  }
  /* 호버 시 색상 오버레이 */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(255, 211, 56, 0.1) 0%, 
      rgba(255, 200, 0, 0.05) 50%,
      rgba(255, 230, 120, 0.08) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 27px;
  }
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 
      0 8px 24px rgba(255, 211, 56, 0.2),
      0 4px 16px rgba(0,0,0,0.12),
      inset 0 1px 0 rgba(255,255,255,0.9);
    border-color: rgba(255, 211, 56, 0.8);
    color: #0A0A0A;       
  }
  &:hover::after {
    opacity: 1;
  }
  &:active {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 
      0 4px 16px rgba(255, 211, 56, 0.25),
      0 2px 8px rgba(0,0,0,0.1);
  }
  &:focus {
    outline: 3px solid rgba(255, 211, 56, 0.6);
    outline-offset: 3px;
  }
`;

// 21. SimplePayIconImg
export const SimplePayIconImg = styled.img`
  width: 24px;          /* 실제 앱 크기 */
  height: 24px;
  object-fit: contain;
`;

// 22. ArrowIconStyled
export const ArrowIconStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  ${OtherLoginButton}:hover & {
    transform: translateX(2px);
  }
`;

// 23. BottomSheetLayout
export const BottomSheetLayout = styled.div<{ $isOpen: boolean; $isClosing: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${KBDesignSystem.colors.background.white};
  border-radius: ${KBDesignSystem.borderRadius.modal} ${KBDesignSystem.borderRadius.modal} 0 0;
  box-shadow: ${KBDesignSystem.shadows.bottomSheet};
  z-index: ${KBDesignSystem.zIndex.modal};
  max-height: 80vh;
  overflow: hidden;
  ${({ $isOpen, $isClosing }) => {
    if ($isOpen && !$isClosing) return css`animation: ${slideUp} ${KBDesignSystem.animation.duration.normal} ${KBDesignSystem.animation.easing.decelerate} forwards;`;
    if ($isClosing) return css`animation: ${slideDown} ${KBDesignSystem.animation.duration.normal} ${KBDesignSystem.animation.easing.accelerate} forwards;`;
    return css`transform: translateY(100%);`;
  }}
`;

// 24. SlideBar
export const SlideBar = styled.div`
  width: 52px;
  height: 4px;
  background-color: ${KBDesignSystem.colors.border.medium};
  border-radius: ${KBDesignSystem.borderRadius.xs};
  margin: ${KBDesignSystem.spacing.sm} auto;
`;

// 25. TabLayout
export const TabLayout = styled.div`
  background-color: ${KBDesignSystem.colors.background.gray200};
  padding: 3px;
  margin: ${KBDesignSystem.spacing.xxxl} ${KBDesignSystem.spacing.xl} 0 ${KBDesignSystem.spacing.xl};
  height: 38px;
  border-radius: 19px;
  display: flex;
  align-items: center;
  position: relative;
`;

// 26. TabButton - Android WebView 최적화
export const TabButton = styled.button<{ $active: boolean }>`
  ${androidOptimizedButton}
  flex: 1;
  height: 32px;
  background-color: transparent;
  border: none;
  border-radius: ${KBDesignSystem.borderRadius.button};
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-weight: ${KBDesignSystem.typography.fontWeight.medium};
  font-size: ${KBDesignSystem.typography.fontSize.xs};
  color: ${props => props.$active ? KBDesignSystem.colors.text.primary : KBDesignSystem.colors.text.secondary};
  cursor: pointer;
  z-index: 2;
  transition: color ${KBDesignSystem.animation.duration.fast} ${KBDesignSystem.animation.easing.easeOut};
  
  /* Android WebView 터치 최적화 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
`;

// 27. ActiveTabIndicator
export const ActiveTabIndicator = styled.div<{ $activeIndex: number; $tabCount: number }>`
  position: absolute;
  top: 3px;
  left: ${props => `calc(${props.$activeIndex * (100 / props.$tabCount)}% + 3px)`};
  width: ${props => `calc(${100 / props.$tabCount}% - 6px)`};
  height: 32px;
  background-color: #FFFFFF; /* 흰색 탭 인디케이터 */
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 1;
`;

// 28. ViewPagerContainer
export const ViewPagerContainer = styled.div`
  padding: ${KBDesignSystem.spacing.xl};
  min-height: 300px;
  background-color: ${KBDesignSystem.colors.background.white};
`;