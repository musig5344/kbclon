/**
 * Optimized KB Toast Component
 * Uses GPU-accelerated animations and performance utilities for 60fps
 */

import React, { useEffect, useState, useRef } from 'react';

import styled from 'styled-components';

import {
  ScaleTransition,
  FadeTransition,
  CompoundTransition,
} from '../../shared/components/animation/OptimizedTransition';
import { gpuAcceleration, containment } from '../../shared/utils/animationHelpers';
import { animationMonitor, performanceHelpers } from '../../shared/utils/animationPerformance';
import { dimensions } from '../../styles/dimensions';
import { tokens } from '../../styles/tokens';
import { typography } from '../../styles/typography';

interface OptimizedKBToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  position?: 'top' | 'center' | 'bottom';
  isVisible: boolean;
  onClose: () => void;
  useSpringAnimation?: boolean;
}

// Optimized toast container with containment
const ToastWrapper = styled.div<{ $position: string }>`
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10001;
  pointer-events: none;
  ${containment.layout}
  ${gpuAcceleration.full}
  
  ${props => {
    switch (props.$position) {
      case 'top':
        return 'top: 100px;';
      case 'center':
        return 'top: 50%; transform: translateX(-50%) translateY(-50%);';
      case 'bottom':
        return 'bottom: 140px;'; // Above navigation bar
      default:
        return 'bottom: 140px;';
    }
  }}
`;

// Optimized toast message with GPU acceleration
const ToastMessage = styled.div<{ $type: string }>`
  background-color: ${tokens.colors.toastBackground};
  color: ${tokens.colors.toastText};
  padding: 16px 24px;
  border-radius: ${dimensions.borderRadius.toast}px;
  font-family: ${typography.fontFamily.kbfgTextMedium};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  text-align: center;
  box-shadow: ${dimensions.elevation.toast};
  max-width: 320px;
  min-width: 200px;
  word-break: keep-all;
  white-space: pre-wrap;
  ${containment.paint}

  ${props => {
    switch (props.$type) {
      case 'success':
        return `
          background-color: ${tokens.colors.successBackground};
          color: ${tokens.colors.successText};
        `;
      case 'warning':
        return `
          background-color: ${tokens.colors.warningBackground};
          color: ${tokens.colors.warningText};
        `;
      case 'error':
        return `
          background-color: ${tokens.colors.errorBackground};
          color: ${tokens.colors.errorText};
        `;
      default:
        return `
          background-color: ${tokens.colors.toastBackground};
          color: ${tokens.colors.toastText};
        `;
    }
  }}
  
  @media (prefers-color-scheme: dark) {
    background-color: ${tokens.colors.toastBackgroundDark};
    color: ${tokens.colors.toastTextDark};
  }
`;

const ToastIcon = styled.span<{ $type: string }>`
  display: inline-block;
  margin-right: 8px;
  font-size: 16px;

  ${props => {
    switch (props.$type) {
      case 'success':
        return '&::before { content: "✓"; }';
      case 'warning':
        return '&::before { content: "⚠"; }';
      case 'error':
        return '&::before { content: "✕"; }';
      case 'info':
      default:
        return '&::before { content: "ℹ"; }';
    }
  }}
`;

// Optimized Toast Component
const OptimizedKBToast: React.FC<OptimizedKBToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  position = 'bottom',
  isVisible,
  onClose,
  useSpringAnimation = false,
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const animationIdRef = useRef<string>('');
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);

      // Start performance monitoring
      animationIdRef.current = `toast-${Date.now()}`;
      animationMonitor.startAnimation(animationIdRef.current);

      // Auto close timer
      autoCloseTimerRef.current = setTimeout(() => {
        onClose();
      }, duration);

      return () => {
        if (autoCloseTimerRef.current) {
          clearTimeout(autoCloseTimerRef.current);
        }
      };
    } else {
      // End performance monitoring
      if (animationIdRef.current) {
        const metrics = animationMonitor.endAnimation(animationIdRef.current);
        if (metrics && metrics.averageFps < 55) {
          console.warn('Toast animation performance below 60fps:', metrics);
        }
      }

      // Delay unmount for exit animation
      const unmountTimer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Animation duration

      return () => clearTimeout(unmountTimer);
    }
  }, [isVisible, duration, onClose]);

  if (!shouldRender) {
    return null;
  }

  const toastContent = (
    <ToastMessage $type={type}>
      <ToastIcon $type={type} />
      {message}
    </ToastMessage>
  );

  // Use compound transition for complex animation
  if (useSpringAnimation) {
    return (
      <ToastWrapper $position={position}>
        <CompoundTransition
          in={isVisible}
          transitions={[
            {
              type: 'fade',
              props: { from: 0, to: 1 },
            },
            {
              type: 'scale',
              props: { from: 0.9, to: 1 },
            },
            {
              type: 'slide',
              props: { direction: 'up', distance: 20 },
            },
          ]}
          duration={300}
          unmountOnExit
        >
          {toastContent}
        </CompoundTransition>
      </ToastWrapper>
    );
  }

  // Default optimized animation
  return (
    <ToastWrapper $position={position}>
      <FadeTransition in={isVisible} duration={300} unmountOnExit>
        <ScaleTransition in={isVisible} from={0.9} to={1} duration={300}>
          {toastContent}
        </ScaleTransition>
      </FadeTransition>
    </ToastWrapper>
  );
};

// Enhanced toast hook with performance monitoring
export const useOptimizedToast = () => {
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      message: string;
      type: 'info' | 'success' | 'warning' | 'error';
      duration?: number;
      position?: 'top' | 'center' | 'bottom';
      useSpringAnimation?: boolean;
    }>
  >([]);

  const showToast = (
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    duration: number = 3000,
    position: 'top' | 'center' | 'bottom' = 'bottom',
    useSpringAnimation: boolean = false
  ) => {
    // Skip animations if user prefers reduced motion
    if (performanceHelpers.prefersReducedMotion()) {
      return;
    }

    const id = `toast-${Date.now()}`;
    const newToast = { id, message, type, duration, position, useSpringAnimation };

    setToasts(prev => [...prev, newToast]);

    // Schedule removal
    performanceHelpers.scheduleAnimation(() => {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration + 300); // Include animation duration
    });
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
    // Convenience methods
    showSuccess: (message: string, duration?: number) => showToast(message, 'success', duration),
    showError: (message: string, duration?: number) => showToast(message, 'error', duration),
    showWarning: (message: string, duration?: number) => showToast(message, 'warning', duration),
    showInfo: (message: string, duration?: number) => showToast(message, 'info', duration),
  };
};

// Optimized global toast container
const GlobalToastContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10001;
  ${containment.layout}
`;

// Toast Context for global state management
const ToastContext = React.createContext<ReturnType<typeof useOptimizedToast> | null>(null);

export const useToastContext = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
};

// Optimized Toast Provider
interface ToastProviderProps {
  children: React.ReactNode;
  enablePerformanceMonitoring?: boolean;
}

export const OptimizedToastProvider: React.FC<ToastProviderProps> = ({
  children,
  enablePerformanceMonitoring = false,
}) => {
  const toastMethods = useOptimizedToast();

  useEffect(() => {
    if (enablePerformanceMonitoring) {
      animationMonitor.start();

      return () => {
        animationMonitor.stop();
      };
    }
    return () => {}; // Return empty cleanup function when monitoring is disabled
  }, [enablePerformanceMonitoring]);

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      <GlobalToastContainer>
        {toastMethods.toasts.map(toast => (
          <OptimizedKBToast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            position={toast.position}
            isVisible={true}
            onClose={() => toastMethods.removeToast(toast.id)}
            useSpringAnimation={toast.useSpringAnimation}
          />
        ))}
      </GlobalToastContainer>
    </ToastContext.Provider>
  );
};

export default OptimizedKBToast;
