import styled from 'styled-components';

import { tokens } from '../../../styles/tokens';
/**
 * 모바일 컨테이너 - 모든 페이지에서 일관된 430px 레이아웃 유지
 * PC에서도 모바일 UI 규격을 엄격히 준수
 */
export const MobileContainer = styled.div`
  width: 100%;
  max-width: ${tokens.app.maxWidth};
  margin: 0 auto;
  min-height: 100vh;
  background-color: ${tokens.colors.background.primary};
  position: relative;
  overflow: hidden;
  /* PC에서 모바일 UI 시각화를 위한 그림자 */
  @media (min-width: 431px) {
    box-shadow: ${tokens.shadows.elevation5};
  }
`;
/**
 * 페이지 컨테이너 - TabBar를 고려한 페이지 레이아웃
 */
export const PageContainer = styled.div`
  width: 100%;
  max-width: ${tokens.app.maxWidth};
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${tokens.colors.background.secondary};
  position: relative;
  overflow: hidden;
`;
/**
 * 페이지 콘텐츠 - TabBar 높이를 고려한 콘텐츠 영역
 */
export const PageContent = styled.main`
  flex: 1;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: calc(
    ${tokens.sizes.navigation.height} + ${tokens.spacing[4]}
  ); /* TabBar 높이 + 여유분 */
  -webkit-overflow-scrolling: touch;
`;
/**
 * 고정 하단 컨테이너 - 버튼이나 액션바용
 */
export const FixedBottomContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: ${tokens.app.maxWidth};
  background-color: ${tokens.colors.background.primary};
  border-top: 1px solid ${tokens.colors.border.primary};
  z-index: ${tokens.app.zIndex.sticky};
`;
/**
 * 고정 하단 버튼 영역 - TabBar 위에 표시
 */
export const FixedBottomButtonArea = styled(FixedBottomContainer)`
  padding: ${tokens.spacing[4]} ${tokens.sizes.page.paddingHorizontal};
  padding-bottom: calc(
    ${tokens.spacing[4]} + ${tokens.sizes.navigation.height} + env(safe-area-inset-bottom)
  ); /* 패딩 + TabBar 높이 + safe area */
`;
/**
 * 전체화면 모달 컨테이너 - 메뉴 등에 사용
 */
export const FullScreenModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: ${tokens.app.maxWidth};
  height: 100vh;
  background-color: ${tokens.colors.background.primary};
  z-index: ${tokens.app.zIndex.modal};
  overflow: hidden;
  /* PC에서 모바일 UI 시각화 */
  @media (min-width: 431px) {
    box-shadow: ${tokens.shadows.elevation6};
  }
`;
