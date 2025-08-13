import React, { useState, useRef, useCallback } from 'react';

import styled from 'styled-components';

import { hapticFeedback } from '../../utils/touchOptimization';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface RippleEffectProps {
  color?: string;
  duration?: number;
  enableHaptic?: boolean;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const RippleContainer = styled.div`
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
`;

const RippleSpan = styled.span<{
  $x: number;
  $y: number;
  $size: number;
  $duration: number;
  $color: string;
}>`
  position: absolute;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background-color: ${props => props.$color};
  pointer-events: none;
  animation: ripple ${props => props.$duration}ms ease-out;

  @keyframes ripple {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 0.6;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0;
    }
  }
`;

export const RippleEffect: React.FC<RippleEffectProps> = ({
  color = 'rgba(0, 0, 0, 0.3)',
  duration = 600,
  enableHaptic = true,
  className,
  children,
  disabled = false,
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextRippleId = useRef(0);

  const createRipple = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (disabled || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      let clientX: number;
      let clientY: number;

      if ('touches' in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Calculate ripple size based on container dimensions
      const sizeX = Math.max(x, rect.width - x);
      const sizeY = Math.max(y, rect.height - y);
      const size = Math.sqrt(sizeX * sizeX + sizeY * sizeY) * 2;

      const newRipple: Ripple = {
        id: nextRippleId.current++,
        x,
        y,
        size,
      };

      setRipples(prevRipples => [...prevRipples, newRipple]);

      // Haptic feedback
      if (enableHaptic) {
        hapticFeedback.light();
      }

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prevRipples => prevRipples.filter(r => r.id !== newRipple.id));
      }, duration);
    },
    [disabled, duration, enableHaptic]
  );

  return (
    <RippleContainer
      ref={containerRef}
      className={className}
      onMouseDown={createRipple}
      onTouchStart={createRipple}
    >
      {children}
      {ripples.map(ripple => (
        <RippleSpan
          key={ripple.id}
          $x={ripple.x}
          $y={ripple.y}
          $size={ripple.size}
          $duration={duration}
          $color={color}
        />
      ))}
    </RippleContainer>
  );
};
