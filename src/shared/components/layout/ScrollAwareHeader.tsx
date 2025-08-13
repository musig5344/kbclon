/**
 * KB 스타뱅킹 스크롤 감지 헤더
 * 스크롤 시 미세한 그림자 효과 추가
 */

import React, { useState, useEffect, useRef } from 'react';

import styled from 'styled-components';

import { kbShadows, kbTimings } from '../../../styles/KBMicroDetails';

const HeaderWrapper = styled.header<{ $hasScrolled: boolean }>`
  position: sticky;
  top: 0;
  width: 100%;
  background: white;
  z-index: 100;
  transition: box-shadow ${kbTimings.fast} ${kbTimings.easeOut};
  box-shadow: ${props => props.$hasScrolled ? kbShadows.headerScroll : 'none'};
`;

interface ScrollAwareHeaderProps {
  children: React.ReactNode;
  scrollThreshold?: number;
  className?: string;
}

export const ScrollAwareHeader: React.FC<ScrollAwareHeaderProps> = ({
  children,
  scrollThreshold = 10,
  className
}) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setHasScrolled(scrollTop > scrollThreshold);
    };
    
    // 스크롤 이벤트에 passive 옵션 추가 (성능 최적화)
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // 초기 스크롤 상태 확인
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollThreshold]);
  
  return (
    <HeaderWrapper 
      ref={scrollContainerRef}
      $hasScrolled={hasScrolled}
      className={className}
    >
      {children}
    </HeaderWrapper>
  );
};

// 헤더 내부 요소들을 위한 스타일 컴포넌트
export const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 20px;
`;

export const HeaderTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #1e1e1e;
  letter-spacing: -0.3px;
`;

export const HeaderButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color ${kbTimings.fast} ${kbTimings.easeOut};
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
  
  &:active {
    background-color: rgba(0, 0, 0, 0.08);
    transform: scale(0.96);
  }
  
  img {
    width: 24px;
    height: 24px;
  }
`;