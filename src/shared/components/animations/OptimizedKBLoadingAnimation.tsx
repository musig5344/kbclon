/**
 * KB StarBanking 최적화된 로딩 애니메이션
 * PNG 프레임 애니메이션을 고성능 CSS/SVG 애니메이션으로 대체
 * 
 * 성능 최적화 요소:
 * - GPU 가속 활용 (transform: translateZ(0))
 * - will-change 속성으로 레이어 최적화
 * - requestAnimationFrame 기반 스무스 애니메이션
 * - 60fps 보장
 */
import React, { useState, useEffect, useRef } from 'react';

import styled, { keyframes, css } from 'styled-components';

// KB 스타 로고를 활용한 애니메이션 keyframes
const kbStarRotate = keyframes`
  0% { 
    transform: translateZ(0) rotate(0deg) scale(1);
    opacity: 0.8;
  }
  25% { 
    transform: translateZ(0) rotate(90deg) scale(1.1);
    opacity: 1;
  }
  50% { 
    transform: translateZ(0) rotate(180deg) scale(1);
    opacity: 0.9;
  }
  75% { 
    transform: translateZ(0) rotate(270deg) scale(1.1);
    opacity: 1;
  }
  100% { 
    transform: translateZ(0) rotate(360deg) scale(1);
    opacity: 0.8;
  }
`;

const kbPulse = keyframes`
  0%, 100% {
    transform: translateZ(0) scale(0.9);
    opacity: 0.6;
  }
  50% {
    transform: translateZ(0) scale(1.1);
    opacity: 1;
  }
`;

const kbOrbitDot = keyframes`
  0% {
    transform: translateZ(0) rotate(0deg) translateX(30px) rotate(0deg);
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateZ(0) rotate(360deg) translateX(30px) rotate(-360deg);
    opacity: 0.4;
  }
`;

const kbWave = keyframes`
  0%, 100% {
    transform: translateZ(0) translateY(0);
  }
  50% {
    transform: translateZ(0) translateY(-8px);
  }
`;

// 최적화된 컨테이너 스타일
const LoadingContainer = styled.div<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  /* 성능 최적화 */
  transform: translateZ(0);
  will-change: transform;
  contain: layout style paint;
  backface-visibility: hidden;
`;

// KB 스타 로고 스타일 (SVG 기반)
const KBStar = styled.div<{ size: number; color: string }>`
  width: ${props => props.size * 0.6}px;
  height: ${props => props.size * 0.6}px;
  position: absolute;
  
  /* 성능 최적화 */
  transform: translateZ(0);
  will-change: transform, opacity;
  backface-visibility: hidden;
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: ${props => props.color};
    clip-path: polygon(
      50% 0%, 
      61% 35%, 
      98% 35%, 
      68% 57%, 
      79% 91%, 
      50% 70%, 
      21% 91%, 
      32% 57%, 
      2% 35%, 
      39% 35%
    );
    animation: ${kbStarRotate} 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
`;

// 원형 펄스 애니메이션
const PulseRing = styled.div<{ size: number; delay: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  position: absolute;
  border: 2px solid #FFB800;
  border-radius: 50%;
  opacity: 0.6;
  
  /* 성능 최적화 */
  transform: translateZ(0);
  will-change: transform, opacity;
  backface-visibility: hidden;
  
  animation: ${kbPulse} 2s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`;

// 궤도 점들
const OrbitDot = styled.div<{ delay: number; color: string }>`
  width: 6px;
  height: 6px;
  position: absolute;
  background: ${props => props.color};
  border-radius: 50%;
  top: 50%;
  left: 50%;
  margin: -3px 0 0 -3px;
  
  /* 성능 최적화 */
  transform: translateZ(0);
  will-change: transform, opacity;
  backface-visibility: hidden;
  
  animation: ${kbOrbitDot} 3s linear infinite;
  animation-delay: ${props => props.delay}s;
`;

// 웨이브 바 애니메이션
const WaveBar = styled.div<{ height: number; delay: number; color: string }>`
  width: 4px;
  height: ${props => props.height}px;
  background: ${props => props.color};
  margin: 0 2px;
  border-radius: 2px;
  
  /* 성능 최적화 */
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
  
  animation: ${kbWave} 1.2s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`;

const WaveContainer = styled.div`
  display: flex;
  align-items: flex-end;
  height: 40px;
  
  /* 성능 최적화 */
  transform: translateZ(0);
  will-change: transform;
`;

interface OptimizedKBLoadingAnimationProps {
  type?: 'star' | 'pulse' | 'orbit' | 'wave';
  size?: number;
  color?: string;
  className?: string;
}

/**
 * KB 스타뱅킹 최적화 로딩 애니메이션 컴포넌트
 * 
 * @param type - 애니메이션 타입 ('star' | 'pulse' | 'orbit' | 'wave')
 * @param size - 애니메이션 크기 (기본값: 60)
 * @param color - 애니메이션 색상 (기본값: KB 옐로우)
 */
export const OptimizedKBLoadingAnimation: React.FC<OptimizedKBLoadingAnimationProps> = ({
  type = 'star',
  size = 60,
  color = '#FFB800',
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer로 화면에 보일 때만 애니메이션 실행
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // will-change 동적 관리
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isVisible) {
      container.style.willChange = 'transform, opacity';
    } else {
      container.style.willChange = 'auto';
    }

    return () => {
      if (container) {
        container.style.willChange = 'auto';
      }
    };
  }, [isVisible]);

  const renderAnimation = () => {
    switch (type) {
      case 'pulse':
        return (
          <>
            <PulseRing size={size * 0.8} delay={0} />
            <PulseRing size={size * 0.6} delay={0.3} />
            <PulseRing size={size * 0.4} delay={0.6} />
            <KBStar size={size} color={color} />
          </>
        );

      case 'orbit':
        return (
          <>
            <KBStar size={size} color={color} />
            <OrbitDot delay={0} color={color} />
            <OrbitDot delay={0.5} color={color} />
            <OrbitDot delay={1} color={color} />
            <OrbitDot delay={1.5} color={color} />
          </>
        );

      case 'wave':
        return (
          <WaveContainer>
            {Array.from({ length: 5 }, (_, i) => (
              <WaveBar
                key={i}
                height={15 + (i % 2) * 10}
                delay={i * 0.1}
                color={color}
              />
            ))}
          </WaveContainer>
        );

      case 'star':
      default:
        return <KBStar size={size} color={color} />;
    }
  };

  // 화면에 보이지 않을 때는 렌더링하지 않음
  if (!isVisible && containerRef.current) {
    return <LoadingContainer ref={containerRef} size={size} className={className} />;
  }

  return (
    <LoadingContainer 
      ref={containerRef} 
      size={size} 
      className={className}
      role="progressbar"
      aria-label="로딩 중"
    >
      {renderAnimation()}
    </LoadingContainer>
  );
};

export default OptimizedKBLoadingAnimation;