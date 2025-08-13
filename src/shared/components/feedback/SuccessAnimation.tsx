import React, { useEffect, useState } from 'react';

import styled, { keyframes, css } from 'styled-components';

import { tokens } from '../../../styles/tokens';
import { typography } from '../../../styles/typography';

interface SuccessAnimationProps {
  show: boolean;
  title?: string;
  message?: string;
  amount?: string;
  onComplete?: () => void;
  duration?: number;
  type?: 'checkmark' | 'confetti' | 'transfer' | 'save';
}

// Animations
const scaleIn = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const checkmarkDraw = keyframes`
  0% {
    stroke-dashoffset: 100;
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const confettiDrop = keyframes`
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

// Styled Components
const AnimationContainer = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.95);
  z-index: 10000;
  opacity: ${props => props.$show ? 1 : 0};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const IconWrapper = styled.div<{ $type: string }>`
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  position: relative;
  
  ${props => props.$type === 'checkmark' && css`
    animation: ${scaleIn} 0.5s ease-out;
  `}
`;

const CheckmarkCircle = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
`;

const CheckmarkSvg = styled.svg`
  width: 60px;
  height: 60px;
`;

const CheckmarkPath = styled.path`
  fill: none;
  stroke: white;
  stroke-width: 5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: ${checkmarkDraw} 0.6s ease-out 0.3s forwards;
`;

const TransferIcon = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: ${tokens.colors.brand.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 2s ease-in-out infinite;
  box-shadow: 0 4px 20px rgba(255, 211, 56, 0.3);
`;

const SaveIcon = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${scaleIn} 0.5s ease-out;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
`;

const Title = styled.h2`
  font-family: ${typography.fontFamily.kbfgTextBold};
  font-size: 24px;
  font-weight: 700;
  color: ${tokens.colors.text.primary};
  margin: 0 0 8px 0;
  animation: ${fadeInUp} 0.5s ease-out 0.2s both;
  text-align: center;
`;

const Message = styled.p`
  font-family: ${typography.fontFamily.kbfgTextLight};
  font-size: 16px;
  color: ${tokens.colors.text.secondary};
  margin: 0;
  animation: ${fadeInUp} 0.5s ease-out 0.3s both;
  text-align: center;
  line-height: 1.5;
`;

const Amount = styled.div`
  font-family: ${typography.fontFamily.kbfgTextBold};
  font-size: 32px;
  font-weight: 700;
  color: ${tokens.colors.brand.primary};
  margin: 16px 0;
  animation: ${fadeInUp} 0.5s ease-out 0.4s both;
`;

const ConfettiPiece = styled.div<{
  $color: string;
  $left: number;
  $delay: number;
  $duration: number;
}>`
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: ${props => props.$color};
  left: ${props => props.$left}%;
  animation: ${confettiDrop} ${props => props.$duration}s linear ${props => props.$delay}s infinite;
`;

const ConfettiContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
`;

// Success Animation Component
export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  show,
  title = '완료되었습니다',
  message,
  amount,
  onComplete,
  duration = 2000,
  type = 'checkmark'
}) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      if (onComplete) {
        const timer = setTimeout(onComplete, duration);
        return () => clearTimeout(timer);
      }
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  const renderIcon = () => {
    switch (type) {
      case 'checkmark':
        return (
          <CheckmarkCircle>
            <CheckmarkSvg viewBox="0 0 100 100">
              <CheckmarkPath d="M20 50 L40 70 L75 30" />
            </CheckmarkSvg>
          </CheckmarkCircle>
        );
      
      case 'transfer':
        return (
          <TransferIcon>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
              <path d="M12 2l4 4h-3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L4.7 19.8C3.65 18.1 3 16.13 3 14c0-5.52 4.48-10 10-10V2zm0 20l-4-4h3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26l1.54-1.54C20.35 5.9 21 7.87 21 10c0 5.52-4.48 10-10 10v2z"/>
            </svg>
          </TransferIcon>
        );
      
      case 'save':
        return (
          <SaveIcon>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
              <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/>
            </svg>
          </SaveIcon>
        );
      
      default:
        return (
          <CheckmarkCircle>
            <CheckmarkSvg viewBox="0 0 100 100">
              <CheckmarkPath d="M20 50 L40 70 L75 30" />
            </CheckmarkSvg>
          </CheckmarkCircle>
        );
    }
  };

  const renderConfetti = () => {
    const colors = ['#FFD338', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
    const pieces = [];
    
    for (let i = 0; i < 50; i++) {
      pieces.push(
        <ConfettiPiece
          key={i}
          $color={colors[i % colors.length]}
          $left={Math.random() * 100}
          $delay={Math.random() * 2}
          $duration={3 + Math.random() * 2}
        />
      );
    }
    
    return pieces;
  };

  if (!shouldRender) return null;

  return (
    <AnimationContainer $show={show}>
      {type === 'confetti' && (
        <ConfettiContainer>
          {renderConfetti()}
        </ConfettiContainer>
      )}
      
      <IconWrapper $type={type}>
        {renderIcon()}
      </IconWrapper>
      
      <Title>{title}</Title>
      
      {amount && <Amount>{amount}</Amount>}
      
      {message && <Message>{message}</Message>}
    </AnimationContainer>
  );
};

// Specialized success animations
export const TransferSuccessAnimation: React.FC<Omit<SuccessAnimationProps, 'type'>> = (props) => (
  <SuccessAnimation
    type="transfer"
    title="이체가 완료되었습니다"
    {...props}
  />
);

export const SaveSuccessAnimation: React.FC<Omit<SuccessAnimationProps, 'type'>> = (props) => (
  <SuccessAnimation
    type="save"
    title="저장되었습니다"
    {...props}
  />
);

export const PaymentSuccessAnimation: React.FC<Omit<SuccessAnimationProps, 'type'>> = (props) => (
  <SuccessAnimation
    type="checkmark"
    title="결제가 완료되었습니다"
    {...props}
  />
);