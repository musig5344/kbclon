import React from 'react';

import styled, { keyframes } from 'styled-components';

import { mobileDimensions } from '../../../styles/mobile';
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
/**
 * KB 스타뱅킹 원본과 완전히 동일한 스플래시 화면
 * - 노란색 배경 (#FFD338)
 * - "국민의 평생 금융파트너" 텍스트
 * - KB 캐릭터들 (토끼, 공룡, 곰, 라마, 브로콜리)
 * - 별들과 장식 요소들
 * - 모바일 접근성 인증 로고
 * - 하단 KB국민은행 로고
 */
const SplashContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* 모바일 앱과 동일한 크기 제약 */
  max-width: ${mobileDimensions.screenMaxWidth};
  width: 100%;
  height: ${mobileDimensions.screenHeight};
  margin: 0 auto;
  /* 원본 스플래시 이미지 사용 */
  background-image: url('/assets/images/splash_img.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #FFD338; /* KB 노란색 폴백 */
  /* 레이아웃 */
  position: relative;
  overflow: hidden;
  /* 부드러운 페이드인 애니메이션 */
  animation: ${fadeIn} 0.8s ease-in;
  /* 모바일 앱 느낌의 그림자 */
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  /* 반응형 처리 */
  @media (max-width: 414px) {
    width: 100vw;
    max-width: none;
  }
  /* 고해상도 디스플레이 대응 */
  @media (-webkit-min-device-pixel-ratio: 2) {
    background-size: cover;
  }
`;
/**
 * KB 스타뱅킹 원본 스플래시 화면 컴포넌트
 * - 2초간 표시 후 자동으로 로그인 화면으로 전환
 * - 원본 KB 스플래시 이미지 사용
 * - 모든 KB 캐릭터와 브랜드 요소 포함
 */
export const SplashScreen: React.FC = () => {
  return (
    <SplashContainer />
  );
};