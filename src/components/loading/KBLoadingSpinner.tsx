import React, { useState, useEffect, useMemo } from 'react';

import styled, { keyframes, css } from 'styled-components';

import { tokens } from '../../styles/tokens';

// TECHNICAL_REFERENCE.md 기반 17프레임 애니메이션
const LOADING_FRAMES = 17;
const FRAME_DURATION = 58.8; // 17프레임 / 1초 = 58.8ms per frame

// 프레임 경로 생성
const frames = Array.from(
  { length: LOADING_FRAMES },
  (_, i) => `/assets/images/loading/loading_1_${String(i + 1).padStart(2, '0')}.png`
);

// 페이드인 애니메이션
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// 회전 애니메이션 (fallback용)
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// 로딩 컨테이너
const LoadingContainer = styled.div<{ $size: 'small' | 'medium' | 'large' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return css`
          width: 40px;
          height: 40px;
        `;
      case 'medium':
        return css`
          width: 60px;
          height: 60px;
        `;
      case 'large':
      default:
        return css`
          width: 80px;
          height: 80px;
        `;
    }
  }}

  animation: ${fadeIn} 300ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// 애니메이션 이미지
const LoadingImage = styled.img<{ $size: 'small' | 'medium' | 'large' }>`
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-select: none;

  /* 이미지 로드 실패 시 스타일 */
  &::before {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    background: ${tokens.colors.brand.pressed};
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation: none;
    }
  }
`;

// 로딩 메시지
const LoadingMessage = styled.p<{ $size: 'small' | 'medium' | 'large' }>`
  margin-top: 16px;
  color: ${tokens.colors.text.tertiary};
  font-size: ${({ $size }) => {
    switch ($size) {
      case 'small':
        return '12px';
      case 'medium':
        return '14px';
      case 'large':
      default:
        return '16px';
    }
  }};
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  animation: ${fadeIn} 300ms ease-out 200ms both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// Props 인터페이스
interface KBLoadingSpinnerProps {
  /** 로딩 스피너 크기 */
  size?: 'small' | 'medium' | 'large';
  /** 로딩 메시지 */
  message?: string;
  /** 표시 여부 */
  isVisible?: boolean;
  /** 커스텀 클래스 */
  className?: string;
  /** 접근성 레이블 */
  'aria-label'?: string;
}

/**
 * KB 스타뱅킹 로딩 스피너 컴포넌트
 *
 * TECHNICAL_REFERENCE.md 기반 구현:
 * - loading_1 시리즈 (17프레임) 애니메이션
 * - 58.8ms 프레임 간격 (17프레임 / 1초)
 * - setInterval 사용
 * - styled-components 기반
 * - 다양한 크기 지원
 * - 접근성 지원 (reduced-motion, aria-label)
 * - 이미지 로드 실패 시 fallback
 */
export const KBLoadingSpinner: React.FC<KBLoadingSpinnerProps> = ({
  size = 'medium',
  message,
  isVisible = true,
  className,
  'aria-label': ariaLabel,
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [imageError, setImageError] = useState(false);

  // TECHNICAL_REFERENCE.md 기반 프레임 애니메이션
  useEffect(() => {
    if (!isVisible || imageError) return;

    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % frames.length);
    }, FRAME_DURATION); // 58.8ms per frame

    return () => clearInterval(interval);
  }, [isVisible, imageError]);

  // 현재 프레임 이미지 경로
  const currentImagePath = useMemo(() => {
    return frames[currentFrame];
  }, [currentFrame]);

  // 이미지 로드 에러 핸들러
  const handleImageError = () => {
    setImageError(true);
  };

  // 이미지 로드 성공 시 에러 상태 리셋
  const handleImageLoad = () => {
    setImageError(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <LoadingContainer
      $size={size}
      className={className}
      role='status'
      aria-label={ariaLabel || '로딩 중'}
      aria-live='polite'
    >
      {!imageError ? (
        <LoadingImage
          $size={size}
          src={currentImagePath}
          alt=''
          onError={handleImageError}
          onLoad={handleImageLoad}
          aria-hidden='true'
        />
      ) : (
        // Fallback: CSS 애니메이션
        <div
          style={{
            width: '100%',
            height: '100%',
            background: `linear-gradient(45deg, ${tokens.colors.brand.pressed}, ${tokens.colors.functional.warning})`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
          aria-hidden='true'
        />
      )}

      {message && <LoadingMessage $size={size}>{message}</LoadingMessage>}
    </LoadingContainer>
  );
};

/**
 * 전체 화면 로딩 오버레이 컴포넌트
 */
const FullscreenOverlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;

  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  visibility: ${({ $isVisible }) => ($isVisible ? 'visible' : 'hidden')};
  transition:
    opacity 300ms ease,
    visibility 300ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

interface KBFullscreenLoadingProps extends KBLoadingSpinnerProps {
  /** 배경 오버레이 표시 여부 */
  showOverlay?: boolean;
}

/**
 * 전체 화면 KB 로딩 컴포넌트
 */
export const KBFullscreenLoading: React.FC<KBFullscreenLoadingProps> = ({
  showOverlay = true,
  ...props
}) => {
  if (!showOverlay) {
    return <KBLoadingSpinner {...props} />;
  }

  return (
    <FullscreenOverlay $isVisible={props.isVisible ?? true}>
      <KBLoadingSpinner size='large' {...props} />
    </FullscreenOverlay>
  );
};

export default KBLoadingSpinner;
