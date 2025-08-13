import React from 'react';

import styled, { keyframes, css } from 'styled-components';

import { tokens } from '../../../styles/tokens';

/**
 * Skeleton UI Base Component
 * - 부드러운 shimmer 애니메이션
 * - 다양한 형태 지원 (text, circle, rectangular)
 * - 높은 성능과 재사용성
 */

// Shimmer 애니메이션
const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// 기본 스켈레톤 스타일
const baseSkeletonStyle = css`
  background: linear-gradient(90deg, #f0f0f0 0%, #f8f8f8 20%, #f0f0f0 40%, #f0f0f0 100%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: ${tokens.borderRadius.medium};
  overflow: hidden;
  position: relative;

  /* 성능 최적화 */
  will-change: background-position;
  transform: translateZ(0);
  backface-visibility: hidden;
`;

// 스켈레톤 컨테이너
const SkeletonContainer = styled.div<{
  $width?: string | number;
  $height?: string | number;
  $variant?: 'text' | 'circular' | 'rectangular';
  $animation?: boolean;
}>`
  ${baseSkeletonStyle}

  width: ${props =>
    typeof props.$width === 'number' ? `${props.$width}px` : props.$width || '100%'};
  height: ${props =>
    typeof props.$height === 'number' ? `${props.$height}px` : props.$height || '20px'};

  ${props =>
    props.$variant === 'circular' &&
    css`
      border-radius: ${tokens.borderRadius.round};
    `}

  ${props =>
    props.$variant === 'text' &&
    css`
      border-radius: ${tokens.borderRadius.small};
    `}
  
  ${props =>
    props.$animation === false &&
    css`
      animation: none;
    `}
  
  /* 다크 모드 대응 */
  @media (prefers-color-scheme: dark) {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.1) 20%,
      rgba(255, 255, 255, 0.05) 40%,
      rgba(255, 255, 255, 0.05) 100%
    );
  }
`;

// 스켈레톤 그룹 (여러 스켈레톤을 감싸는 컨테이너)
export const SkeletonGroup = styled.div<{ $gap?: string | number }>`
  display: flex;
  flex-direction: column;
  gap: ${props =>
    typeof props.$gap === 'number' ? `${props.$gap}px` : props.$gap || tokens.spacing[3]};
`;

// Props 타입 정의
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// 메인 Skeleton 컴포넌트
export const Skeleton: React.FC<SkeletonProps> = React.memo(
  ({ width, height, variant = 'rectangular', animation = true, className, style }) => {
    return (
      <SkeletonContainer
        $width={width}
        $height={height}
        $variant={variant}
        $animation={animation}
        className={className}
        style={style}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// 텍스트 스켈레톤 헬퍼
export const TextSkeleton: React.FC<{
  lines?: number;
  width?: string | number;
  height?: string | number;
  gap?: string | number;
  lastLineWidth?: string | number;
}> = React.memo(({ lines = 1, width = '100%', height = 16, gap = 8, lastLineWidth = '60%' }) => {
  return (
    <SkeletonGroup $gap={gap}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 && lines > 1 ? lastLineWidth : width}
          height={height}
          variant='text'
        />
      ))}
    </SkeletonGroup>
  );
});

TextSkeleton.displayName = 'TextSkeleton';

export default Skeleton;
