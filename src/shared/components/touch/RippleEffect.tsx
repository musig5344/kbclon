/**
 * Ripple Effect Component
 * Material Design-inspired ripple effect for touch feedback
 */

import React, { useState, useRef, useCallback } from 'react';

import styled, { keyframes, css } from 'styled-components';

import { tokens } from '../../../styles/tokens';

// Ripple animation
const rippleAnimation = keyframes`
  0% {
    transform: scale(0);
    opacity: 0.6;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

// Ripple container
const RippleContainer = styled.div<{ $color?: string; $duration?: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
  
  /* Ensure ripple doesn't affect layout */
  z-index: 0;
`;

// Individual ripple
const RippleElement = styled.span<{
  $x: number;
  $y: number;
  $size: number;
  $color: string;
  $duration: number;
}>`
  position: absolute;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: 50%;
  background-color: ${props => props.$color};
  transform: translate(-50%, -50%) scale(0);
  animation: ${rippleAnimation} ${props => props.$duration}ms ease-out;
  pointer-events: none;
`;

// Ripple wrapper for positioning
const RippleWrapper = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: inherit;
  
  /* Ensure content is above ripple */
  & > *:not(${RippleContainer}) {
    position: relative;
    z-index: 1;
  }
`;

// Ripple instance interface
interface RippleInstance {
  id: number;
  x: number;
  y: number;
  size: number;
}

// Ripple effect props
export interface RippleEffectProps {
  color?: string;
  duration?: number;
  opacity?: number;
  disabled?: boolean;
  center?: boolean; // Center ripple instead of touch point
  radius?: number; // Custom ripple radius
  className?: string;
  children: React.ReactNode;
}

// Ripple effect component
export const RippleEffect: React.FC<RippleEffectProps> = ({
  color = 'currentColor',
  duration = 600,
  opacity = 0.3,
  disabled = false,
  center = false,
  radius,
  className,
  children,
}) => {
  const [ripples, setRipples] = useState<RippleInstance[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextRippleId = useRef(0);
  
  // Calculate ripple color with opacity
  const rippleColor = color === 'currentColor' 
    ? `rgba(0, 0, 0, ${opacity})`
    : color.startsWith('rgba')
    ? color
    : `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  
  // Create ripple effect
  const createRipple = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (disabled || !containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Get touch/click coordinates
    let clientX: number;
    let clientY: number;
    
    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ('clientX' in event) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      return;
    }
    
    // Calculate ripple position
    const x = center ? rect.width / 2 : clientX - rect.left;
    const y = center ? rect.height / 2 : clientY - rect.top;
    
    // Calculate ripple size
    let rippleSize: number;
    if (radius) {
      rippleSize = radius * 2;
    } else {
      // Calculate the maximum distance from click point to container corners
      const sizeX = Math.max(x, rect.width - x);
      const sizeY = Math.max(y, rect.height - y);
      rippleSize = Math.sqrt(sizeX * sizeX + sizeY * sizeY) * 2;
    }
    
    // Create new ripple
    const ripple: RippleInstance = {
      id: nextRippleId.current++,
      x,
      y,
      size: rippleSize,
    };
    
    setRipples(prev => [...prev, ripple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, duration);
  }, [disabled, center, radius, duration]);
  
  // Handle touch/mouse events
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    createRipple(event);
  }, [createRipple]);
  
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    // Only handle primary mouse button
    if (event.button === 0) {
      createRipple(event);
    }
  }, [createRipple]);
  
  return (
    <RippleWrapper
      ref={containerRef}
      className={className}
      onTouchStart={handleTouchStart}
      onMouseDown={handleMouseDown}
    >
      {children}
      {!disabled && (
        <RippleContainer $color={rippleColor} $duration={duration}>
          {ripples.map(ripple => (
            <RippleElement
              key={ripple.id}
              $x={ripple.x}
              $y={ripple.y}
              $size={ripple.size}
              $color={rippleColor}
              $duration={duration}
            />
          ))}
        </RippleContainer>
      )}
    </RippleWrapper>
  );
};

// Styled ripple button component
const StyledRippleButton = styled.button<{
  $variant?: 'primary' | 'secondary' | 'text';
  $size?: 'small' | 'medium' | 'large';
  $fullWidth?: boolean;
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => {
    switch (props.$size) {
      case 'small': return '8px 16px';
      case 'large': return '16px 32px';
      default: return '12px 24px';
    }
  }};
  min-height: ${props => {
    switch (props.$size) {
      case 'small': return '32px';
      case 'large': return '48px';
      default: return '40px';
    }
  }};
  min-width: 64px;
  border: none;
  border-radius: ${tokens.borderRadius.medium};
  font-family: ${tokens.typography.fontFamily.base};
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return '14px';
      case 'large': return '16px';
      default: return '15px';
    }
  }};
  font-weight: 500;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 200ms ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  
  ${props => props.$fullWidth && css`
    width: 100%;
  `}
  
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return css`
          background-color: ${tokens.colors.brand.primary};
          color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          
          &:hover:not(:disabled) {
            background-color: ${tokens.colors.brand.dark};
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }
          
          &:active:not(:disabled) {
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
        `;
        
      case 'secondary':
        return css`
          background-color: ${tokens.colors.background.secondary};
          color: ${tokens.colors.text.primary};
          border: 1px solid ${tokens.colors.border.primary};
          
          &:hover:not(:disabled) {
            background-color: ${tokens.colors.background.tertiary};
            border-color: ${tokens.colors.border.secondary};
          }
        `;
        
      case 'text':
        return css`
          background-color: transparent;
          color: ${tokens.colors.brand.primary};
          
          &:hover:not(:disabled) {
            background-color: rgba(40, 126, 255, 0.08);
          }
        `;
        
      default:
        return '';
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &:focus-visible {
    outline: 2px solid ${tokens.colors.brand.primary};
    outline-offset: 2px;
  }
`;

// Ripple button props
export interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  rippleColor?: string;
  rippleDuration?: number;
  rippleDisabled?: boolean;
  children: React.ReactNode;
}

// Ripple button component
export const RippleButton: React.FC<RippleButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  rippleColor,
  rippleDuration = 600,
  rippleDisabled = false,
  children,
  ...props
}) => {
  const defaultRippleColor = variant === 'primary' ? 'rgba(255, 255, 255, 0.3)' : 'currentColor';
  
  return (
    <RippleEffect
      color={rippleColor || defaultRippleColor}
      duration={rippleDuration}
      disabled={rippleDisabled || props.disabled}
    >
      <StyledRippleButton
        $variant={variant}
        $size={size}
        $fullWidth={fullWidth}
        {...props}
      >
        {children}
      </StyledRippleButton>
    </RippleEffect>
  );
};

// Icon button with ripple
const StyledIconButton = styled.button<{ $size?: number }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.$size || 40}px;
  height: ${props => props.$size || 40}px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: transparent;
  color: ${tokens.colors.text.primary};
  cursor: pointer;
  transition: background-color 200ms ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  
  &:hover:not(:disabled) {
    background-color: rgba(0, 0, 0, 0.04);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &:focus-visible {
    outline: 2px solid ${tokens.colors.brand.primary};
    outline-offset: 2px;
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

// Icon button props
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
  rippleColor?: string;
  rippleDuration?: number;
  rippleDisabled?: boolean;
  children: React.ReactNode;
}

// Icon button component
export const IconButton: React.FC<IconButtonProps> = ({
  size = 40,
  rippleColor = 'currentColor',
  rippleDuration = 400,
  rippleDisabled = false,
  children,
  ...props
}) => {
  return (
    <RippleEffect
      color={rippleColor}
      duration={rippleDuration}
      disabled={rippleDisabled || props.disabled}
      center
    >
      <StyledIconButton $size={size} {...props}>
        {children}
      </StyledIconButton>
    </RippleEffect>
  );
};

export default RippleEffect;