import React, { useEffect, useState } from 'react';

import styled, { keyframes, css } from 'styled-components';

import { duration, easing } from '../../../styles/animations';
import { tokens } from '../../../styles/tokens';
import { typography } from '../../../styles/typography';

export interface SnackbarProps {
  open: boolean;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoHideDuration?: number;
  onClose?: () => void;
  severity?: 'default' | 'success' | 'error' | 'warning' | 'info';
  position?: 'bottom' | 'top';
  variant?: 'standard' | 'filled';
}

// Animations
const slideInFromBottom = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideInFromTop = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideOutToBottom = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
`;

const slideOutToTop = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
`;

// Styled Components
const SnackbarContainer = styled.div<{
  $open: boolean;
  $position: 'bottom' | 'top';
}>`
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  ${props => props.$position === 'bottom' ? 'bottom: 80px;' : 'top: 20px;'}
  
  ${props => {
    if (props.$open) {
      return css`
        animation: ${props.$position === 'bottom' ? slideInFromBottom : slideInFromTop} 
          ${duration.normal} ${easing.easeOut} forwards;
      `;
    } else {
      return css`
        animation: ${props.$position === 'bottom' ? slideOutToBottom : slideOutToTop} 
          ${duration.fast} ${easing.easeIn} forwards;
      `;
    }
  }}
`;

const SnackbarContent = styled.div<{
  $severity: SnackbarProps['severity'];
  $variant: SnackbarProps['variant'];
}>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 4px;
  box-shadow: 0 3px 5px -1px rgba(0,0,0,0.2), 0 6px 10px 0 rgba(0,0,0,0.14);
  min-width: 288px;
  max-width: 568px;
  word-break: keep-all;
  
  ${props => {
    const severityColors = {
      default: {
        standard: {
          bg: tokens.colors.backgroundGray3,
          text: tokens.colors.text.primary
        },
        filled: {
          bg: tokens.colors.text.secondary,
          text: tokens.colors.white
        }
      },
      success: {
        standard: {
          bg: '#e8f5e9',
          text: '#2e7d32'
        },
        filled: {
          bg: '#2e7d32',
          text: tokens.colors.white
        }
      },
      error: {
        standard: {
          bg: '#ffebee',
          text: '#c62828'
        },
        filled: {
          bg: '#d32f2f',
          text: tokens.colors.white
        }
      },
      warning: {
        standard: {
          bg: '#fffde7',
          text: '#f57c00'
        },
        filled: {
          bg: '#f57c00',
          text: tokens.colors.white
        }
      },
      info: {
        standard: {
          bg: '#e3f2fd',
          text: '#1976d2'
        },
        filled: {
          bg: '#1976d2',
          text: tokens.colors.white
        }
      }
    };
    
    const colors = severityColors[props.$severity || 'default'][props.$variant || 'standard'];
    
    return css`
      background-color: ${colors.bg};
      color: ${colors.text};
    `;
  }}
`;

const SnackbarMessage = styled.div`
  flex: 1;
  font-family: ${typography.fontFamily.kbfgTextMedium};
  font-size: 14px;
  line-height: 1.4;
`;

const SnackbarAction = styled.button<{
  $variant: SnackbarProps['variant'];
}>`
  background: none;
  border: none;
  padding: 6px 8px;
  margin: -6px -8px -6px 0;
  border-radius: 4px;
  font-family: ${typography.fontFamily.kbfgTextMedium};
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color ${duration.fast} ${easing.easeOut};
  color: ${props => props.$variant === 'filled' ? tokens.colors.white : tokens.colors.brand.primary};
  
  &:hover {
    background-color: ${props => 
      props.$variant === 'filled' 
        ? 'rgba(255, 255, 255, 0.08)' 
        : 'rgba(255, 211, 56, 0.08)'
    };
  }
  
  &:active {
    background-color: ${props => 
      props.$variant === 'filled' 
        ? 'rgba(255, 255, 255, 0.12)' 
        : 'rgba(255, 211, 56, 0.12)'
    };
  }
`;

const SnackbarIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`;

// Icon components
const getIcon = (severity: SnackbarProps['severity']) => {
  switch (severity) {
    case 'success':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      );
    case 'error':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
      );
    case 'warning':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
      );
    case 'info':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      );
    default:
      return null;
  }
};

export const Snackbar: React.FC<SnackbarProps> = ({
  open,
  message,
  action,
  autoHideDuration = 4000,
  onClose,
  severity = 'default',
  position = 'bottom',
  variant = 'standard'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      // Trigger animation after component mounts
      requestAnimationFrame(() => {
        setIsVisible(true);
      });

      if (autoHideDuration && autoHideDuration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoHideDuration);

        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
      // Remove from DOM after animation completes
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [open, autoHideDuration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  const handleActionClick = () => {
    action?.onClick();
    handleClose();
  };

  if (!shouldRender) return null;

  return (
    <SnackbarContainer $open={isVisible} $position={position}>
      <SnackbarContent $severity={severity} $variant={variant}>
        {severity !== 'default' && (
          <SnackbarIcon>
            {getIcon(severity)}
          </SnackbarIcon>
        )}
        
        <SnackbarMessage>{message}</SnackbarMessage>
        
        {action && (
          <SnackbarAction 
            onClick={handleActionClick}
            $variant={variant}
          >
            {action.label}
          </SnackbarAction>
        )}
      </SnackbarContent>
    </SnackbarContainer>
  );
};

// Hook for managing snackbar state
export const useSnackbar = () => {
  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    message: string;
    severity?: SnackbarProps['severity'];
    action?: SnackbarProps['action'];
  }>({
    open: false,
    message: ''
  });

  const showSnackbar = (
    message: string, 
    severity?: SnackbarProps['severity'],
    action?: SnackbarProps['action']
  ) => {
    setSnackbarState({
      open: true,
      message,
      severity,
      action
    });
  };

  const hideSnackbar = () => {
    setSnackbarState(prev => ({
      ...prev,
      open: false
    }));
  };

  return {
    snackbarState,
    showSnackbar,
    hideSnackbar,
    // Convenience methods
    showSuccess: (message: string, action?: SnackbarProps['action']) => 
      showSnackbar(message, 'success', action),
    showError: (message: string, action?: SnackbarProps['action']) => 
      showSnackbar(message, 'error', action),
    showWarning: (message: string, action?: SnackbarProps['action']) => 
      showSnackbar(message, 'warning', action),
    showInfo: (message: string, action?: SnackbarProps['action']) => 
      showSnackbar(message, 'info', action)
  };
};