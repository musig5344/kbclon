/**
 * KB 스타뱅킹 완전 반응형 디자인 시스템
 * - 모든 휴대폰 규격 (320px ~ 768px)에 완벽 대응
 * - 넘침이나 짤림 현상 완전 방지
 * - 원본 KB 디자인 비율 유지하면서 유연한 크기 조절
 * - ULTRATHINK 수준의 정밀한 반응형 설계
 */

import { css } from 'styled-components';

// 표준 휴대폰 규격 정의 (2025년 기준)
const phoneSpecs = {
  // iPhone SE (1st gen) - 가장 작은 현대 스마트폰
  smallest: 320,
  // 일반적인 소형 안드로이드
  small: 360,
  // 표준 크기 (iPhone 12/13 mini, 대부분 안드로이드)
  medium: 375,
  // 큰 크기 (iPhone 12/13/14, Galaxy S22)
  large: 414,
  // 매우 큰 크기 (iPhone 14 Pro Max, Galaxy S22 Ultra)
  xlarge: 430,
  // 태블릿 경계
  tablet: 768,
} as const;

// 뷰포트 기반 동적 스케일링 함수
const vwScale = (baseSize: number, minSize?: number, maxSize?: number) => {
  const vwSize = `${(baseSize / 375) * 100}vw`; // 375px 기준으로 vw 계산
  
  if (minSize && maxSize) {
    return `clamp(${minSize}px, ${vwSize}, ${maxSize}px)`;
  } else if (minSize) {
    return `max(${minSize}px, ${vwSize})`;
  } else if (maxSize) {
    return `min(${vwSize}, ${maxSize}px)`;
  }
  
  return vwSize;
};

// 반응형 폰트 크기 (vw 기반으로 모든 화면에 완벽 적응)
const responsiveFontSizes = {
  displayLarge: vwScale(32, 28, 40),    // 헤드라인
  displayMedium: vwScale(28, 24, 34),   // 큰 제목
  displaySmall: vwScale(24, 20, 28),    // 중간 제목
  titleLarge: vwScale(20, 18, 24),      // 페이지 제목
  titleMedium: vwScale(18, 16, 22),     // 섹션 제목
  titleSmall: vwScale(16, 14, 18),      // 카드 제목
  bodyLarge: vwScale(16, 14, 18),       // 큰 본문
  bodyMedium: vwScale(14, 12, 16),      // 기본 본문
  bodySmall: vwScale(12, 11, 14),       // 작은 본문
  labelLarge: vwScale(12, 11, 14),      // 버튼 텍스트
  labelMedium: vwScale(11, 10, 12),     // 폼 라벨
  labelSmall: vwScale(10, 9, 11),       // 캡션
} as const;

// 반응형 간격 (vw 기반으로 화면 크기에 비례하여 조정)
const responsiveSpacing = {
  micro: vwScale(2, 2, 4),      // 아주 작은 간격
  xs: vwScale(4, 4, 6),         // 매우 작은 간격
  sm: vwScale(8, 6, 10),        // 작은 간격
  md: vwScale(16, 12, 20),      // 기본 간격
  lg: vwScale(24, 18, 28),      // 큰 간격
  xl: vwScale(32, 24, 40),      // 매우 큰 간격
  xxl: vwScale(48, 36, 56),     // 최대 간격
} as const;

// 반응형 컴포넌트 크기
const responsiveSizes = {
  // 버튼 높이
  buttonSmall: vwScale(32, 32, 36),
  buttonMedium: vwScale(44, 40, 48),
  buttonLarge: vwScale(52, 48, 56),
  
  // 입력 필드 높이
  inputHeight: vwScale(44, 40, 48),
  
  // 헤더 높이
  headerHeight: vwScale(48, 44, 56),
  
  // 네비게이션 바 높이
  navHeight: vwScale(60, 56, 68),
  
  // 아이콘 크기
  iconSmall: vwScale(16, 14, 18),
  iconMedium: vwScale(24, 20, 28),
  iconLarge: vwScale(32, 28, 36),
  
  // 터치 타겟 최소 크기
  touchTarget: vwScale(44, 44, 48),
} as const;

// 완전 반응형 앱 컨테이너
const responsiveAppContainer = css`
  /* 기본 컨테이너 설정 */
  width: 100vw;
  max-width: 100vw;
  min-width: 320px;
  height: 100vh;
  height: 100dvh; /* 동적 뷰포트 높이 지원 */
  min-height: 100vh;
  min-height: 100dvh;
  
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  position: relative;
  overflow-x: hidden;
  
  /* iOS Safari 주소창 대응 */
  min-height: -webkit-fill-available;
  
  /* 모바일 최적화 */
  -webkit-overflow-scrolling: touch;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  
  /* 안전 영역 지원 */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);

  /* PC에서 모바일 시뮬레이션 (선택적) */
  @media (min-width: 769px) {
    width: 430px;
    max-width: 430px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    border-radius: 0;
  }
`;

// 반응형 헤더
const responsiveHeader = css`
  width: 100%;
  height: ${responsiveSizes.headerHeight};
  min-height: ${responsiveSizes.headerHeight};
  
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  padding: 0 ${responsiveSpacing.md};
  box-sizing: border-box;
  
  position: fixed;
  top: env(safe-area-inset-top, 0);
  left: 0;
  right: 0;
  z-index: 100;
  
  background-color: #FFFFFF;
  border-bottom: 1px solid #EBEEF0;
  
  /* 더 작은 화면에서 패딩 조정 */
  @media (max-width: ${phoneSpecs.small}px) {
    padding: 0 ${responsiveSpacing.sm};
  }
`;

// 반응형 메인 콘텐츠
const responsiveMainContent = css`
  width: 100%;
  min-height: calc(100vh - ${responsiveSizes.headerHeight} - ${responsiveSizes.navHeight});
  
  padding-top: ${responsiveSizes.headerHeight};
  padding-bottom: calc(${responsiveSizes.navHeight} + env(safe-area-inset-bottom));
  
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  
  /* 스크롤바 숨김 */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

// 반응형 버튼
const responsiveButton = css`
  height: ${responsiveSizes.buttonMedium};
  min-height: ${responsiveSizes.touchTarget};
  
  padding: 0 ${responsiveSpacing.md};
  border-radius: ${vwScale(8, 6, 10)};
  
  font-size: ${responsiveFontSizes.labelLarge};
  font-weight: 600;
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  border: none;
  cursor: pointer;
  
  transition: all 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  /* 작은 화면에서 조정 */
  @media (max-width: ${phoneSpecs.small}px) {
    padding: 0 ${responsiveSpacing.sm};
    font-size: ${responsiveFontSizes.labelMedium};
  }
`;

// 반응형 입력 필드
const responsiveInput = css`
  width: 100%;
  height: ${responsiveSizes.inputHeight};
  min-height: ${responsiveSizes.touchTarget};
  
  padding: 0 ${responsiveSpacing.md};
  border: 1px solid #EBEEF0;
  border-radius: ${vwScale(8, 6, 10)};
  
  font-size: ${responsiveFontSizes.bodyMedium};
  background-color: #FFFFFF;
  
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #FFD338;
    box-shadow: 0 0 0 2px rgba(255, 211, 56, 0.2);
  }
  
  /* 모바일 입력 최적화 */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
`;

// 반응형 카드
const responsiveCard = css`
  width: 100%;
  margin: ${responsiveSpacing.sm} ${responsiveSpacing.md};
  padding: ${responsiveSpacing.lg};
  
  border-radius: ${vwScale(12, 8, 16)};
  background-color: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  box-sizing: border-box;
  
  /* 작은 화면에서 마진/패딩 조정 */
  @media (max-width: ${phoneSpecs.small}px) {
    margin: ${responsiveSpacing.xs} ${responsiveSpacing.sm};
    padding: ${responsiveSpacing.md};
  }
`;

// 반응형 네비게이션 바
const responsiveTabBar = css`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  
  width: 100%;
  height: calc(${responsiveSizes.navHeight} + env(safe-area-inset-bottom));
  
  background-color: #FFFFFF;
  border-top: 1px solid #EBEEF0;
  
  display: flex;
  justify-content: space-around;
  align-items: center;
  
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
  
  z-index: 100;
`;

// 반응형 텍스트 스타일
const responsiveText = {
  display: css`
    font-size: ${responsiveFontSizes.displayMedium};
    font-weight: 700;
    line-height: 1.1;
  `,
  
  title: css`
    font-size: ${responsiveFontSizes.titleLarge};
    font-weight: 600;
    line-height: 1.2;
  `,
  
  subtitle: css`
    font-size: ${responsiveFontSizes.titleMedium};
    font-weight: 500;
    line-height: 1.3;
  `,
  
  body: css`
    font-size: ${responsiveFontSizes.bodyMedium};
    font-weight: 400;
    line-height: 1.4;
  `,
  
  caption: css`
    font-size: ${responsiveFontSizes.bodySmall};
    font-weight: 400;
    line-height: 1.3;
    color: #696E76;
  `,
};

// 반응형 그리드 시스템
const responsiveGrid = {
  container: css`
    display: grid;
    gap: ${responsiveSpacing.md};
    padding: 0 ${responsiveSpacing.md};
    box-sizing: border-box;
    
    @media (max-width: ${phoneSpecs.small}px) {
      gap: ${responsiveSpacing.sm};
      padding: 0 ${responsiveSpacing.sm};
    }
  `,
  
  twoColumn: css`
    grid-template-columns: 1fr 1fr;
  `,
  
  threeColumn: css`
    grid-template-columns: repeat(3, 1fr);
    
    @media (max-width: ${phoneSpecs.small}px) {
      grid-template-columns: repeat(2, 1fr);
    }
  `,
  
  fourColumn: css`
    grid-template-columns: repeat(4, 1fr);
    
    @media (max-width: ${phoneSpecs.medium}px) {
      grid-template-columns: repeat(3, 1fr);
    }
    
    @media (max-width: ${phoneSpecs.small}px) {
      grid-template-columns: repeat(2, 1fr);
    }
  `,
};

// 디버깅을 위한 반응형 정보 표시 (개발 모드에서만)
const debugResponsive = css`
  ${process.env.NODE_ENV === 'development' && `
    &::after {
      content: 'XS';
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(255, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 9999;
      
      @media (min-width: ${phoneSpecs.small}px) {
        content: 'SM';
        background: rgba(255, 165, 0, 0.8);
      }
      
      @media (min-width: ${phoneSpecs.medium}px) {
        content: 'MD';
        background: rgba(255, 255, 0, 0.8);
        color: black;
      }
      
      @media (min-width: ${phoneSpecs.large}px) {
        content: 'LG';
        background: rgba(0, 255, 0, 0.8);
      }
      
      @media (min-width: ${phoneSpecs.xlarge}px) {
        content: 'XL';
        background: rgba(0, 0, 255, 0.8);
      }
    }
  `}
`;

export {
  phoneSpecs,
  vwScale,
  responsiveFontSizes,
  responsiveSpacing,
  responsiveSizes,
  responsiveAppContainer,
  responsiveHeader,
  responsiveMainContent,
  responsiveButton,
  responsiveInput,
  responsiveCard,
  responsiveTabBar,
  responsiveText,
  responsiveGrid,
  debugResponsive,
};