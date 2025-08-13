/**
 * KB 스타뱅킹 원본 앱 기준 완전 반응형 레이아웃 시스템
 * - XML dimens.xml 기준 정확한 치수 매핑
 * - 모든 디바이스 크기에서 원본과 동일한 비율 유지
 * - 짤림 현상 완전 방지
 */
import { mobileDimensions } from './mobile';
// 미디어 쿼리 - Android 앱 기준 반응형 디자인
export const mobileMediaQueries = {
  // 소형 모바일 (320px-359px)
  small: '@media (min-width: 320px) and (max-width: 359px)',
  // 표준 모바일 (360px-411px) - 대부분 Android 디바이스
  medium: '@media (min-width: 360px) and (max-width: 411px)',
  // 대형 모바일 (412px 이상)
  large: '@media (min-width: 412px)',
  // 모든 모바일 범위
  mobile: '@media (max-width: 768px)',
  // 최소 너비 보장
  minWidth: '@media (min-width: 320px)',
} as const;
// 반응형 컨테이너 믹신 - 430px 규격 엄격히 유지
export const responsiveContainer = `
  width: 100%;
  max-width: 430px;
  min-width: 320px;
  height: 100vh;
  min-height: 100vh;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  overflow-x: hidden;
  position: relative;
  /* 모바일 브라우저 안전 영역 */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  /* iOS Safari 주소창 높이 대응 */
  height: 100vh;
  min-height: -webkit-fill-available;
  /* Android Chrome 주소창 대응 */
  @supports (-webkit-appearance: none) {
    height: 100vh;
    min-height: 100vh;
  }
  /* PC에서도 430px 유지 */
  @media (min-width: 431px) {
    max-width: 430px;
  }
`;
// 헤더 반응형
export const responsiveHeader = `
  width: 100%;
  height: ${mobileDimensions.headerHeight};
  min-height: ${mobileDimensions.headerHeight};
  padding: ${mobileDimensions.headerPaddingTop} ${mobileDimensions.headerPaddingEnd} ${mobileDimensions.headerPaddingBottom} ${mobileDimensions.headerPaddingStart};
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  background-color: #ffffff;
  /* 안전 영역 고려 */
  padding-top: calc(${mobileDimensions.headerPaddingTop} + env(safe-area-inset-top));
  ${mobileMediaQueries.small} {
    padding-left: 16px;
    padding-right: 16px;
  }
  ${mobileMediaQueries.medium} {
    padding-left: 20px;
    padding-right: 20px;
  }
  ${mobileMediaQueries.large} {
    padding-left: 24px;
    padding-right: 24px;
  }
`;
// 메인 콘텐츠 반응형
export const responsiveContent = `
  width: 100%;
  min-height: calc(100vh - ${mobileDimensions.headerHeight});
  padding-top: ${mobileDimensions.headerHeight};
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  /* 안전 영역 고려 */
  padding-top: calc(${mobileDimensions.headerHeight} + env(safe-area-inset-top));
  padding-bottom: env(safe-area-inset-bottom);
`;
// 버튼 반응형
export const responsiveButton = `
  width: 100%;
  height: ${mobileDimensions.buttonHeight};
  min-height: ${mobileDimensions.buttonHeight};
  padding: 0 ${mobileDimensions.buttonPaddingHorizontal};
  box-sizing: border-box;
  border: none;
  border-radius: ${mobileDimensions.borderRadius};
  font-size: ${mobileDimensions.textSizeButton};
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  /* 작은 화면에서 패딩 조정 */
  ${mobileMediaQueries.small} {
    padding: 0 16px;
    font-size: 13px;
  }
`;
// 입력 필드 반응형
export const responsiveInput = `
  width: 100%;
  height: ${mobileDimensions.inputHeight};
  min-height: ${mobileDimensions.inputHeight};
  padding: 0 ${mobileDimensions.inputPadding};
  box-sizing: border-box;
  border: 1px solid #EBEEF0;
  border-radius: ${mobileDimensions.borderRadius};
  font-size: ${mobileDimensions.textSizeBody};
  background-color: #ffffff;
  /* 모바일 입력 최적화 */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  &:focus {
    outline: none;
    border-color: #FFD338;
  }
  ${mobileMediaQueries.small} {
    padding: 0 12px;
    font-size: 14px;
  }
`;
// 카드 컴포넌트 반응형
export const responsiveCard = `
  width: 100%;
  margin: ${mobileDimensions.spacingS} ${mobileDimensions.spacingL};
  padding: ${mobileDimensions.spacingL};
  box-sizing: border-box;
  border-radius: ${mobileDimensions.borderRadiusLarge};
  background-color: #ffffff;
  ${mobileMediaQueries.small} {
    margin: 4px 16px;
    padding: 16px;
  }
  ${mobileMediaQueries.medium} {
    margin: 6px 20px;
    padding: 20px;
  }
  ${mobileMediaQueries.large} {
    margin: 8px 24px;
    padding: 24px;
  }
`;
// 하단 탭바 반응형
export const responsiveTabBar = `
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 60px;
  background-color: #ffffff;
  border-top: 1px solid #EBEEF0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
  /* 안전 영역 고려 */
  padding-bottom: env(safe-area-inset-bottom);
  height: calc(60px + env(safe-area-inset-bottom));
`;
// 텍스트 반응형 크기
export const responsiveText = {
  title: `
    font-size: ${mobileDimensions.textSizeTitle};
    line-height: 1.2;
    ${mobileMediaQueries.small} {
      font-size: 18px;
    }
    ${mobileMediaQueries.medium} {
      font-size: 19px;
    }
    ${mobileMediaQueries.large} {
      font-size: 20px;
    }
  `,
  body: `
    font-size: ${mobileDimensions.textSizeBody};
    line-height: 1.4;
    ${mobileMediaQueries.small} {
      font-size: 13px;
    }
    ${mobileMediaQueries.medium} {
      font-size: 14px;
    }
    ${mobileMediaQueries.large} {
      font-size: 14px;
    }
  `,
  caption: `
    font-size: ${mobileDimensions.textSizeCaption};
    line-height: 1.3;
    ${mobileMediaQueries.small} {
      font-size: 11px;
    }
    ${mobileMediaQueries.medium} {
      font-size: 12px;
    }
    ${mobileMediaQueries.large} {
      font-size: 12px;
    }
  `,
};
// 스크롤 영역 반응형
export const responsiveScrollArea = `
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  /* 스크롤바 숨기기 */
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;