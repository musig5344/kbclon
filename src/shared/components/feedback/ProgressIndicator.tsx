import React from 'react';

import styled, { keyframes, css } from 'styled-components';

import { tokens } from '../../../styles/tokens';
import { typography } from '../../../styles/typography';

export type ProgressType = 'linear' | 'circular' | 'dots' | 'skeleton';
export type ProgressSize = 'small' | 'medium' | 'large';

interface ProgressIndicatorProps {
  type?: ProgressType;
  size?: ProgressSize;
  value?: number; // 0-100 for determinate progress
  indeterminate?: boolean;
  color?: string;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

// Animations
const linearIndeterminate = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

const circularRotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const circularDash = keyframes`
  0% {
    stroke-dasharray: 1px, 125px;
    stroke-dashoffset: 0px;
  }
  50% {
    stroke-dasharray: 90px, 125px;
    stroke-dashoffset: -35px;
  }
  100% {
    stroke-dasharray: 90px, 125px;
    stroke-dashoffset: -124px;
  }
`;

const dotPulse = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

// Linear Progress
const LinearProgressContainer = styled.div<{ $size: ProgressSize }>`
  width: 100%;
  height: ${props => {
    switch (props.$size) {
      case 'small': return '2px';
      case 'large': return '8px';
      default: return '4px';
    }
  }};
  background-color: ${tokens.colors.backgroundGray2};
  border-radius: 2px;
  overflow: hidden;
  position: relative;
`;

const LinearProgressBar = styled.div<{
  $value?: number;
  $indeterminate?: boolean;
  $color?: string;
}>`
  height: 100%;
  background-color: ${props => props.$color || tokens.colors.brand.primary};
  transition: width 0.3s ease;
  
  ${props => props.$indeterminate
    ? css`
        width: 40%;
        position: absolute;
        animation: ${linearIndeterminate} 1.5s ease-in-out infinite;
      `
    : css`
        width: ${props.$value || 0}%;
      `
  }
`;

// Circular Progress
const CircularProgressContainer = styled.div<{ $size: ProgressSize }>`
  display: inline-flex;
  position: relative;
  width: ${props => {
    switch (props.$size) {
      case 'small': return '24px';
      case 'large': return '48px';
      default: return '36px';
    }
  }};
  height: ${props => {
    switch (props.$size) {
      case 'small': return '24px';
      case 'large': return '48px';
      default: return '36px';
    }
  }};
`;

const CircularProgressSvg = styled.svg<{ $indeterminate?: boolean }>`
  ${props => props.$indeterminate && css`
    animation: ${circularRotate} 2s linear infinite;
  `}
`;

const CircularProgressCircle = styled.circle<{
  $indeterminate?: boolean;
  $color?: string;
}>`
  stroke: ${props => props.$color || tokens.colors.brand.primary};
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
  
  ${props => props.$indeterminate && css`
    animation: ${circularDash} 1.4s ease-in-out infinite;
  `}
`;

// Dots Progress
const DotsProgressContainer = styled.div<{ $size: ProgressSize }>`
  display: inline-flex;
  gap: ${props => props.$size === 'small' ? '4px' : '8px'};
`;

const Dot = styled.div<{
  $size: ProgressSize;
  $delay: number;
  $color?: string;
}>`
  width: ${props => {
    switch (props.$size) {
      case 'small': return '6px';
      case 'large': return '12px';
      default: return '8px';
    }
  }};
  height: ${props => {
    switch (props.$size) {
      case 'small': return '6px';
      case 'large': return '12px';
      default: return '8px';
    }
  }};
  background-color: ${props => props.$color || tokens.colors.brand.primary};
  border-radius: 50%;
  animation: ${dotPulse} 1.4s ease-in-out ${props => props.$delay}s infinite;
`;

// Skeleton Progress
const SkeletonContainer = styled.div<{
  $width?: string;
  $height?: string;
}>`
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || '20px'};
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
`;

// Progress with label
const ProgressWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: ${typography.fontFamily.kbfgTextMedium};
  font-size: 14px;
  color: ${tokens.colors.text.secondary};
`;

const ProgressValue = styled.span`
  font-family: ${typography.fontFamily.kbfgTextBold};
  color: ${tokens.colors.text.primary};
`;

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  type = 'linear',
  size = 'medium',
  value,
  indeterminate = true,
  color,
  label,
  showLabel = false,
  className
}) => {
  const renderProgress = () => {
    switch (type) {
      case 'linear':
        return (
          <LinearProgressContainer $size={size}>
            <LinearProgressBar
              $value={value}
              $indeterminate={indeterminate}
              $color={color}
            />
          </LinearProgressContainer>
        );

      case 'circular':
        const sizeMap = {
          small: { size: 24, strokeWidth: 3 },
          medium: { size: 36, strokeWidth: 4 },
          large: { size: 48, strokeWidth: 5 }
        };
        const { size: svgSize, strokeWidth } = sizeMap[size];
        const radius = (svgSize - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const strokeDashoffset = indeterminate
          ? 0
          : circumference - (value || 0) / 100 * circumference;

        return (
          <CircularProgressContainer $size={size}>
            <CircularProgressSvg
              width={svgSize}
              height={svgSize}
              viewBox={`0 0 ${svgSize} ${svgSize}`}
              $indeterminate={indeterminate}
            >
              <circle
                cx={svgSize / 2}
                cy={svgSize / 2}
                r={radius}
                fill="none"
                stroke={tokens.colors.backgroundGray2}
                strokeWidth={strokeWidth}
              />
              <CircularProgressCircle
                cx={svgSize / 2}
                cy={svgSize / 2}
                r={radius}
                fill="none"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${svgSize / 2} ${svgSize / 2})`}
                $indeterminate={indeterminate}
                $color={color}
              />
            </CircularProgressSvg>
          </CircularProgressContainer>
        );

      case 'dots':
        return (
          <DotsProgressContainer $size={size}>
            <Dot $size={size} $delay={0} $color={color} />
            <Dot $size={size} $delay={0.16} $color={color} />
            <Dot $size={size} $delay={0.32} $color={color} />
          </DotsProgressContainer>
        );

      case 'skeleton':
        return <SkeletonContainer />;

      default:
        return null;
    }
  };

  if (showLabel && (label || value !== undefined)) {
    return (
      <ProgressWrapper className={className}>
        <ProgressLabel>
          {label && <span>{label}</span>}
          {value !== undefined && !indeterminate && (
            <ProgressValue>{value}%</ProgressValue>
          )}
        </ProgressLabel>
        {renderProgress()}
      </ProgressWrapper>
    );
  }

  return <div className={className}>{renderProgress()}</div>;
};

// Specialized progress components
export const LinearProgress: React.FC<Omit<ProgressIndicatorProps, 'type'>> = (props) => (
  <ProgressIndicator type="linear" {...props} />
);

export const CircularProgress: React.FC<Omit<ProgressIndicatorProps, 'type'>> = (props) => (
  <ProgressIndicator type="circular" {...props} />
);

export const DotsProgress: React.FC<Omit<ProgressIndicatorProps, 'type'>> = (props) => (
  <ProgressIndicator type="dots" {...props} />
);

export const SkeletonProgress: React.FC<Omit<ProgressIndicatorProps, 'type'>> = (props) => (
  <ProgressIndicator type="skeleton" {...props} />
);

// Transaction progress indicator
export const TransactionProgress: React.FC<{
  step: number;
  totalSteps: number;
  currentStepLabel?: string;
}> = ({ step, totalSteps, currentStepLabel }) => {
  const progress = (step / totalSteps) * 100;

  return (
    <ProgressWrapper>
      <ProgressLabel>
        {currentStepLabel && <span>{currentStepLabel}</span>}
        <span>{step} / {totalSteps}</span>
      </ProgressLabel>
      <LinearProgress
        value={progress}
        indeterminate={false}
        size="medium"
      />
    </ProgressWrapper>
  );
};