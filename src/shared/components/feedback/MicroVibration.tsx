/**
 * KB 스타뱅킹 마이크로 진동 효과 컴포넌트
 * CSS 기반으로 햅틱 피드백을 시뮬레이션
 */

import React, { useState, useEffect } from 'react';

import styled, { keyframes, css } from 'styled-components';

// 진동 강도별 애니메이션
const microVibration = keyframes`
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-1px) rotate(-0.5deg); }
  20% { transform: translateX(1px) rotate(0.5deg); }
  30% { transform: translateX(-1px) rotate(-0.5deg); }
  40% { transform: translateX(1px) rotate(0.5deg); }
  50% { transform: translateX(-0.5px) rotate(-0.25deg); }
  60% { transform: translateX(0.5px) rotate(0.25deg); }
  70% { transform: translateX(-0.25px); }
  80% { transform: translateX(0.25px); }
  90% { transform: translateX(0); }
`;

const softVibration = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-0.5px); }
  75% { transform: translateX(0.5px); }
`;

const pulseVibration = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(0.98); }
  100% { transform: scale(1); }
`;

const errorVibration = keyframes`
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-4px); }
  20% { transform: translateX(4px); }
  30% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  50% { transform: translateX(-2px); }
  60% { transform: translateX(2px); }
  70% { transform: translateX(-1px); }
  80% { transform: translateX(1px); }
  90% { transform: translateX(0); }
`;

// 진동 타입
export type VibrationIntensity = 'soft' | 'medium' | 'strong' | 'error' | 'pulse';

interface VibrationStyles {
  soft: ReturnType<typeof css>;
  medium: ReturnType<typeof css>;
  strong: ReturnType<typeof css>;
  error: ReturnType<typeof css>;
  pulse: ReturnType<typeof css>;
}

const vibrationStyles: VibrationStyles = {
  soft: css`
    animation: ${softVibration} 0.15s ease-in-out;
  `,
  medium: css`
    animation: ${microVibration} 0.3s ease-in-out;
  `,
  strong: css`
    animation: ${microVibration} 0.4s ease-in-out;
  `,
  error: css`
    animation: ${errorVibration} 0.5s ease-in-out;
  `,
  pulse: css`
    animation: ${pulseVibration} 0.2s ease-in-out;
  `,
};

const VibrationWrapper = styled.div<{
  $isVibrating: boolean;
  $intensity: VibrationIntensity;
}>`
  display: inline-block;
  ${props => props.$isVibrating && vibrationStyles[props.$intensity]}
`;

interface MicroVibrationProps {
  children: React.ReactNode;
  trigger?: boolean;
  intensity?: VibrationIntensity;
  duration?: number;
  onVibrationEnd?: () => void;
}

export const MicroVibration: React.FC<MicroVibrationProps> = ({
  children,
  trigger = false,
  intensity = 'medium',
  duration,
  onVibrationEnd,
}) => {
  const [isVibrating, setIsVibrating] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsVibrating(true);

      const timeout = setTimeout(
        () => {
          setIsVibrating(false);
          onVibrationEnd?.();
        },
        duration ||
          (intensity === 'error'
            ? 500
            : intensity === 'strong'
              ? 400
              : intensity === 'medium'
                ? 300
                : 150)
      );

      return () => clearTimeout(timeout);
    }
  }, [trigger, intensity, duration, onVibrationEnd]);

  return (
    <VibrationWrapper $isVibrating={isVibrating} $intensity={intensity}>
      {children}
    </VibrationWrapper>
  );
};

// Hook for triggering vibrations
export const useVibration = () => {
  const [vibrationTrigger, setVibrationTrigger] = useState(false);

  const vibrate = (intensity: VibrationIntensity = 'medium') => {
    setVibrationTrigger(true);
    setTimeout(() => setVibrationTrigger(false), 10);

    // 실제 진동 API 호출 (지원하는 경우)
    if ('vibrate' in navigator) {
      switch (intensity) {
        case 'soft':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'strong':
          navigator.vibrate([30, 10, 30]);
          break;
        case 'error':
          navigator.vibrate([50, 30, 50, 30, 50]);
          break;
        case 'pulse':
          navigator.vibrate(15);
          break;
      }
    }
  };

  return { vibrate, vibrationTrigger };
};

// 특정 이벤트에 진동 효과를 자동으로 추가하는 HOC
export const withVibration = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    onPress?: VibrationIntensity;
    onLongPress?: VibrationIntensity;
    onError?: VibrationIntensity;
  } = {}
) => {
  return React.forwardRef<any, P>((props: P, ref) => {
    const { vibrate } = useVibration();
    const [shouldVibrate, setShouldVibrate] = useState(false);
    const [vibrationIntensity, setVibrationIntensity] = useState<VibrationIntensity>('medium');

    const handlePress = () => {
      if (options.onPress) {
        vibrate(options.onPress);
        setVibrationIntensity(options.onPress);
        setShouldVibrate(true);
        setTimeout(() => setShouldVibrate(false), 100);
      }
    };

    const enhancedProps = {
      ...props,
      onClick: (e: React.MouseEvent) => {
        handlePress();
        if ((props as any).onClick) {
          (props as any).onClick(e);
        }
      },
      onTouchStart: (e: React.TouchEvent) => {
        handlePress();
        if ((props as any).onTouchStart) {
          (props as any).onTouchStart(e);
        }
      },
    };

    return (
      <MicroVibration trigger={shouldVibrate} intensity={vibrationIntensity}>
        <Component {...enhancedProps} ref={ref} />
      </MicroVibration>
    );
  });
};

// 프리셋 진동 패턴
export const VibrationPatterns = {
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([20, 50, 20]);
    }
  },
  warning: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 30, 30]);
    }
  },
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50, 30, 50]);
    }
  },
  notification: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([25, 25, 25]);
    }
  },
};

// 터치 피드백 컴포넌트
const TouchFeedbackWrapper = styled.div<{ $pressed: boolean }>`
  transform: ${props => (props.$pressed ? 'scale(0.97)' : 'scale(1)')};
  transition: transform 0.1s ease-out;
`;

interface TouchFeedbackProps {
  children: React.ReactNode;
  vibrationIntensity?: VibrationIntensity;
  onPress?: () => void;
}

export const TouchFeedback: React.FC<TouchFeedbackProps> = ({
  children,
  vibrationIntensity = 'soft',
  onPress,
}) => {
  const [pressed, setPressed] = useState(false);
  const { vibrate } = useVibration();

  const handleTouchStart = () => {
    setPressed(true);
    vibrate(vibrationIntensity);
  };

  const handleTouchEnd = () => {
    setPressed(false);
    onPress?.();
  };

  return (
    <TouchFeedbackWrapper
      $pressed={pressed}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={() => setPressed(false)}
    >
      {children}
    </TouchFeedbackWrapper>
  );
};
