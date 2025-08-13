/**
 * KB 스타뱅킹 숫자 카운팅 애니메이션
 * 잔액 변경 시 부드러운 숫자 롤링 효과
 */

import React, { useEffect, useRef, useState } from 'react';

import styled, { keyframes } from 'styled-components';

import { kbFontOptimization } from '../../../styles/KBMicroDetails';

const rollUp = keyframes`
  from {
    transform: translateY(50%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const rollDown = keyframes`
  from {
    transform: translateY(-50%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const Container = styled.span`
  display: inline-flex;
  align-items: baseline;
  ${kbFontOptimization}
`;

const DigitWrapper = styled.span`
  display: inline-block;
  position: relative;
  overflow: hidden;
  height: 1.2em;
`;

const Digit = styled.span<{ $isIncreasing: boolean; $delay: number }>`
  display: inline-block;
  animation: ${props => props.$isIncreasing ? rollUp : rollDown} 
    0.6s cubic-bezier(0.4, 0, 0.2, 1) ${props => props.$delay}ms both;
`;

const StaticText = styled.span`
  display: inline-block;
`;

interface NumberCounterProps {
  value: number;
  duration?: number;
  format?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const NumberCounter: React.FC<NumberCounterProps> = ({
  value,
  duration = 2000,
  format = true,
  prefix = '',
  suffix = '',
  className
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousValueRef = useRef(0);
  const animationRef = useRef<number>();
  
  useEffect(() => {
    const startValue = previousValueRef.current;
    const endValue = value;
    const isIncreasing = endValue > startValue;
    const startTime = Date.now();
    
    setIsAnimating(true);
    
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 이징 함수 적용 (ease-out-expo)
      const easeOutExpo = progress === 1 
        ? 1 
        : 1 - Math.pow(2, -10 * progress);
      
      const currentValue = startValue + (endValue - startValue) * easeOutExpo;
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        previousValueRef.current = endValue;
      }
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);
  
  // 숫자 포맷팅 (천단위 콤마)
  const formatNumber = (num: number): string => {
    if (!format) return Math.floor(num).toString();
    return Math.floor(num).toLocaleString('ko-KR');
  };
  
  const formattedValue = formatNumber(displayValue);
  const digits = formattedValue.split('');
  const isIncreasing = value > previousValueRef.current;
  
  return (
    <Container className={className}>
      {prefix && <StaticText>{prefix}</StaticText>}
      {digits.map((digit, index) => {
        if (digit === ',') {
          return <StaticText key={`comma-${index}`}>,</StaticText>;
        }
        
        return (
          <DigitWrapper key={`${digit}-${index}`}>
            <Digit 
              $isIncreasing={isIncreasing}
              $delay={index * 30} // 각 자리수마다 약간의 딜레이
            >
              {digit}
            </Digit>
          </DigitWrapper>
        );
      })}
      {suffix && <StaticText>{suffix}</StaticText>}
    </Container>
  );
};

// 간단한 숫자 변경 애니메이션 (롤링 효과 없이)
export const SimpleNumberAnimation = styled.span<{ $isChanging: boolean }>`
  ${kbFontOptimization}
  display: inline-block;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${props => props.$isChanging && `
    animation: numberPulse 0.6s ease-out;
  `}
  
  @keyframes numberPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;