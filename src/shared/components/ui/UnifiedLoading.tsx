import React, { memo, useState, useEffect } from 'react';

import styled, { css } from 'styled-components';

import { fadeIn } from '../../../styles/animations';
import { tokens } from '../../../styles/tokens';

// TECHNICAL_REFERENCE.md 기반 17프레임 애니메이션
const frames = Array.from({ length: 17 }, (_, i) => 
  `/src/assets/images/loading/loading_1_${String(i + 1).padStart(2, '0')}.png`
);

/**
 * KB 스타뱅킹 통합 Loading 컴포넌트
 * - 모든 로딩 UI를 하나로 통합
 * - 다양한 변형 지원 (fullscreen, overlay, inline)
 * - useLoadingAnimation 훅 활용
 */

export interface UnifiedLoadingProps {
  /** 로딩 표시 여부 */
  isVisible?: boolean;
  /** 로딩 메시지 */
  message?: string;
  /** 로딩 타입 */
  type?: 'fullscreen' | 'overlay' | 'inline';
  /** 크기 */
  size?: 'small' | 'medium' | 'large';
  /** 배경 블러 효과 */
  blur?: boolean;
  /** 커스텀 클래스 */
  className?: string;
}

const sizeMap = {
  small: {
    image: '30px',
    fontSize: '12px',
    gap: '8px',
    padding: '16px'
  },
  medium: {
    image: '50px',
    fontSize: '14px',
    gap: '12px',
    padding: '32px'
  },
  large: {
    image: '60px',
    fontSize: '16px',
    gap: '16px',
    padding: '48px'
  }
};

const LoadingWrapper = styled.div<{
  $type: string;
  $isVisible: boolean;
  $blur?: boolean;
}>`
  display: ${props => props.$isVisible ? 'flex' : 'none'};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  ${props => {
    switch (props.$type) {
      case 'fullscreen':
        return css`
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.95);
          z-index: 10002;
          animation: ${fadeIn} 0.2s ease-in-out;
        `;
      case 'overlay':
        return css`
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.95);
          z-index: 10001;
          animation: ${fadeIn} 0.2s ease-in-out;
        `;
      case 'inline':
      default:
        return css`
          position: relative;
          background-color: transparent;
        `;
    }
  }}
`;

const LoadingContent = styled.div<{ $size: keyof typeof sizeMap }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => sizeMap[props.$size].gap};
  padding: ${props => sizeMap[props.$size].padding};
  position: relative;
`;

const AnimationImage = styled.img<{ $size: keyof typeof sizeMap }>`
  width: ${props => sizeMap[props.$size].image};
  height: ${props => sizeMap[props.$size].image};
  object-fit: contain;
  margin-bottom: 8px;
`;

const LoadingMessage = styled.p<{ 
  $size: keyof typeof sizeMap;
  $type: string;
}>`
  margin: 0;
  color: ${tokens.colors.text.primary};
  font-size: ${props => sizeMap[props.$size].fontSize};
  font-family: ${tokens.typography.fontFamily.primary};
  text-align: center;
  line-height: 1.4;
  font-weight: 500;
`;

export const UnifiedLoading: React.FC<UnifiedLoadingProps> = memo(({
  isVisible = true,
  message = '', 
  type = 'fullscreen',
  size = 'medium',
  blur = false,
  className
}) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  
  // TECHNICAL_REFERENCE.md 기반 프레임 애니메이션: 58.8ms 간격
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setCurrentFrameIndex(prev => (prev + 1) % frames.length);
    }, 58.8); // 17프레임 / 1초 = 58.8ms per frame
    
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <LoadingWrapper
      $type={type}
      $isVisible={isVisible}
      $blur={blur}
      className={className}
    >
      <LoadingContent $size={size}>
        <AnimationImage 
          src={frames[currentFrameIndex]} 
          alt="KB 스타뱅킹 로딩"
          $size={size}
        />
        {message && (
          <LoadingMessage $size={size} $type={type}>
            {message}
          </LoadingMessage>
        )}
      </LoadingContent>
    </LoadingWrapper>
  );
});

UnifiedLoading.displayName = 'UnifiedLoading';

// 특화된 로딩 컴포넌트들 (backward compatibility)
export const LoadingScreen: React.FC<{ text?: string }> = ({ text }) => (
  <UnifiedLoading
    type="fullscreen"
    message={text}
    size="medium"
  />
);

export const InlineLoading: React.FC<{ text?: string; size?: 'small' | 'medium' | 'large' }> = ({ 
  text, 
  size = 'small' 
}) => (
  <UnifiedLoading
    type="inline"
    message={text}
    size={size}
  />
);

export const OverlayLoading: React.FC<{ text?: string; blur?: boolean }> = ({ 
  text, 
  blur = true 
}) => (
  <UnifiedLoading
    type="overlay"
    message={text}
    size="medium"
    blur={blur}
  />
);

// 기존 KBLoading과의 호환성을 위한 export
export const KBLoading: React.FC<{
  isVisible: boolean;
  message?: string;
  type?: 'fullscreen' | 'inline' | 'overlay';
  size?: 'small' | 'medium' | 'large';
}> = (props) => <UnifiedLoading {...props} />;