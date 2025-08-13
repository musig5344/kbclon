import React, { useEffect, useState, createContext, useContext } from 'react';

import styled, { keyframes, css } from 'styled-components';

import { duration, easing } from '../../../styles/animations';
import { dimensions } from '../../../styles/dimensions';
import { tokens } from '../../../styles/tokens';
import { typography } from '../../../styles/typography';

// Toast 타입 정의
export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'loading';
export type ToastPosition =
  | 'top'
  | 'top-right'
  | 'top-left'
  | 'bottom'
  | 'bottom-right'
  | 'bottom-left'
  | 'center';

export interface ToastOptions {
  id?: string;
  message: string;
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
  showProgress?: boolean;
  showIcon?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

// Toast Context
interface ToastContextType {
  showToast: (options: ToastOptions | string) => void;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Animations
const slideInTop = keyframes`
  from {
    transform: translateY(-100%) translateX(-50%);
    opacity: 0;
  }
  to {
    transform: translateY(0) translateX(-50%);
    opacity: 1;
  }
`;

const slideInBottom = keyframes`
  from {
    transform: translateY(100%) translateX(-50%);
    opacity: 0;
  }
  to {
    transform: translateY(0) translateX(-50%);
    opacity: 1;
  }
`;

const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideInLeft = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

// Toast Container Styles
const ToastContainer = styled.div<{ $position: ToastPosition }>`
  position: fixed;
  z-index: 10000;
  pointer-events: none;

  ${props => {
    switch (props.$position) {
      case 'top':
        return css`
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
        `;
      case 'top-right':
        return css`
          top: 20px;
          right: 20px;
        `;
      case 'top-left':
        return css`
          top: 20px;
          left: 20px;
        `;
      case 'bottom':
        return css`
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
        `;
      case 'bottom-right':
        return css`
          bottom: 80px;
          right: 20px;
        `;
      case 'bottom-left':
        return css`
          bottom: 80px;
          left: 20px;
        `;
      case 'center':
        return css`
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        `;
    }
  }}
`;

// Toast Item Styles
const ToastItem = styled.div<{
  $type: ToastType;
  $position: ToastPosition;
  $isExiting: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  margin-bottom: 12px;
  border-radius: ${dimensions.borderRadius.medium}px;
  box-shadow: ${dimensions.elevation.toast};
  pointer-events: auto;
  max-width: 380px;
  min-width: 280px;
  word-break: keep-all;
  transition: all ${duration.normal} ${easing.easeOut};

  ${props => {
    const colors = {
      info: {
        bg: tokens.colors.brand.light,
        text: tokens.colors.text.primary,
        icon: tokens.colors.brand.primary,
      },
      success: {
        bg: '#e6f4ea',
        text: '#1e7e34',
        icon: '#28a745',
      },
      warning: {
        bg: '#fff3cd',
        text: '#856404',
        icon: '#ffc107',
      },
      error: {
        bg: '#f8d7da',
        text: '#721c24',
        icon: '#dc3545',
      },
      loading: {
        bg: tokens.colors.backgroundGray1,
        text: tokens.colors.text.primary,
        icon: tokens.colors.brand.primary,
      },
    };

    const color = colors[props.$type];

    return css`
      background-color: ${color.bg};
      color: ${color.text};

      svg,
      .toast-icon {
        color: ${color.icon};
      }
    `;
  }}

  ${props => {
    if (props.$isExiting) {
      return css`
        animation: ${fadeOut} ${duration.fast} ${easing.easeIn} forwards;
      `;
    }

    switch (props.$position) {
      case 'top':
      case 'top-left':
      case 'top-right':
        return css`
          animation: ${props.$position === 'top'
              ? slideInTop
              : props.$position === 'top-right'
                ? slideInRight
                : slideInLeft}
            ${duration.normal} ${easing.easeOut};
        `;
      case 'bottom':
      case 'bottom-left':
      case 'bottom-right':
        return css`
          animation: ${props.$position === 'bottom'
              ? slideInBottom
              : props.$position === 'bottom-right'
                ? slideInRight
                : slideInLeft}
            ${duration.normal} ${easing.easeOut};
        `;
      case 'center':
        return css`
          animation: ${fadeIn} ${duration.normal} ${easing.easeOut};
        `;
    }
  }}
`;

const ToastIcon = styled.div<{ $type: ToastType }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;

  ${props =>
    props.$type === 'loading' &&
    css`
      animation: ${spin} 1s linear infinite;
    `}
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const ToastContent = styled.div`
  flex: 1;
  font-family: ${typography.fontFamily.kbfgTextMedium};
  font-size: 14px;
  line-height: 1.4;
`;

const ToastAction = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-family: ${typography.fontFamily.kbfgTextMedium};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  margin: -4px -8px;
  border-radius: 4px;
  transition: background-color ${duration.fast} ${easing.easeOut};

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const ToastCloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  margin: -4px;
  border-radius: 50%;
  opacity: 0.6;
  transition: opacity ${duration.fast} ${easing.easeOut};

  &:hover {
    opacity: 1;
  }
`;

const ToastProgress = styled.div<{ $duration: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: currentColor;
  opacity: 0.3;
  border-radius: 0 0 ${dimensions.borderRadius.medium}px ${dimensions.borderRadius.medium}px;
  animation: progress ${props => props.$duration}ms linear forwards;

  @keyframes progress {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
`;

// Toast Icons
const getToastIcon = (type: ToastType): React.ReactNode => {
  switch (type) {
    case 'success':
      return (
        <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z' />
        </svg>
      );
    case 'error':
      return (
        <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z' />
        </svg>
      );
    case 'warning':
      return (
        <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' />
        </svg>
      );
    case 'loading':
      return (
        <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M12 2C6.48 2 2 6.48 2 12h2c0-4.42 3.58-8 8-8s8 3.58 8 8-3.58 8-8 8v2c5.52 0 10-4.48 10-10S17.52 2 12 2z' />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z' />
        </svg>
      );
  }
};

// Toast Component
const Toast: React.FC<
  ToastOptions & {
    onRemove: () => void;
    isExiting: boolean;
  }
> = ({
  message,
  type = 'info',
  position = 'bottom',
  showProgress = true,
  showIcon = true,
  action,
  duration = 3000,
  onRemove,
  isExiting,
}) => {
  useEffect(() => {
    if (duration > 0 && !isExiting) {
      const timer = setTimeout(onRemove, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onRemove, isExiting]);

  return (
    <ToastItem $type={type} $position={position} $isExiting={isExiting}>
      {showIcon && (
        <ToastIcon $type={type} className='toast-icon'>
          {getToastIcon(type)}
        </ToastIcon>
      )}

      <ToastContent>{message}</ToastContent>

      {action && <ToastAction onClick={action.onClick}>{action.label}</ToastAction>}

      {duration > 0 && (
        <ToastCloseButton onClick={onRemove}>
          <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
            <path
              d='M12 4L4 12M4 4l8 8'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
            />
          </svg>
        </ToastCloseButton>
      )}

      {showProgress && duration > 0 && !isExiting && <ToastProgress $duration={duration} />}
    </ToastItem>
  );
};

// Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<
    (ToastOptions & {
      id: string;
      isExiting: boolean;
    })[]
  >([]);

  const showToast = (options: ToastOptions | string) => {
    const toastOptions: ToastOptions = typeof options === 'string' ? { message: options } : options;

    const id = toastOptions.id || Date.now().toString();

    setToasts(prev => [
      ...prev,
      {
        ...toastOptions,
        id,
        isExiting: false,
      },
    ]);
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.map(toast => (toast.id === id ? { ...toast, isExiting: true } : toast)));

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  };

  const hideAllToasts = () => {
    setToasts(prev => prev.map(toast => ({ ...toast, isExiting: true })));

    setTimeout(() => {
      setToasts([]);
    }, 300);
  };

  // 위치별로 토스트 그룹화
  const toastsByPosition = toasts.reduce(
    (acc, toast) => {
      const position = toast.position || 'bottom';
      if (!acc[position]) acc[position] = [];
      acc[position].push(toast);
      return acc;
    },
    {} as Record<ToastPosition, typeof toasts>
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast, hideAllToasts }}>
      {children}
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <ToastContainer key={position} $position={position as ToastPosition}>
          {positionToasts.map(toast => (
            <Toast
              key={toast.id}
              {...toast}
              onRemove={() => {
                hideToast(toast.id);
                toast.onClose?.();
              }}
            />
          ))}
        </ToastContainer>
      ))}
    </ToastContext.Provider>
  );
};

// Toast Hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return {
    ...context,
    // 편의 메서드들
    success: (message: string, options?: Partial<ToastOptions>) =>
      context.showToast({ ...options, message, type: 'success' }),
    error: (message: string, options?: Partial<ToastOptions>) =>
      context.showToast({ ...options, message, type: 'error' }),
    warning: (message: string, options?: Partial<ToastOptions>) =>
      context.showToast({ ...options, message, type: 'warning' }),
    info: (message: string, options?: Partial<ToastOptions>) =>
      context.showToast({ ...options, message, type: 'info' }),
    loading: (message: string, options?: Partial<ToastOptions>) =>
      context.showToast({ ...options, message, type: 'loading', duration: 0 }),
  };
};
