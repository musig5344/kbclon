import React, { useState, useEffect } from 'react';

import styled, { keyframes, css } from 'styled-components';

// 원본 스플래시 이미지 직접 import
import splashBackground from '../../assets/images/splash_background.png';

// 애니메이션 키프레임
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

// 스플래시 컨테이너 - 원본 이미지를 전체 화면 배경으로 사용
const SplashContainer = styled.div<{ $isVisible: boolean; $isFadingOut: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url(${splashBackground}) no-repeat center center;
  background-size: cover;
  z-index: 10000;

  /* 부드러운 애니메이션 적용 */
  animation: ${({ $isFadingOut }) =>
    $isFadingOut
      ? css`
          ${fadeOut} 300ms ease-out forwards
        `
      : css`
          ${fadeIn} 300ms ease-in forwards
        `};

  /* 접근성: reduced-motion 지원 */
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: ${({ $isVisible, $isFadingOut }) => ($isVisible && !$isFadingOut ? 1 : 0)};
    transition: opacity 300ms ease;
  }
`;

// Props 인터페이스
interface SplashScreenProps {
  onAnimationComplete?: () => void;
  duration?: number;
}

/**
 * KB 스타뱅킹 스플래시 화면 컴포넌트
 * 원본 splash_background.png를 사용하여 실제 앱과 동일한 스플래시 화면 구현
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({
  onAnimationComplete,
  duration = 2000,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // 스플래시 화면 타이밍 제어
  useEffect(() => {
    // 타이머 설정: duration 후 페이드아웃 시작
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, duration);

    // 페이드아웃 애니메이션 완료 후 콜백 실행
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onAnimationComplete?.();
    }, duration + 300); // 300ms는 페이드아웃 애니메이션 시간

    // 클린업
    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onAnimationComplete]);

  // 스플래시 화면이 보이지 않으면 null 반환
  if (!isVisible) return null;

  return (
    <SplashContainer
      $isVisible={isVisible}
      $isFadingOut={isFadingOut}
      role='presentation'
      aria-label='KB 스타뱅킹 앱 로딩 중'
    />
  );
};

export default SplashScreen;
