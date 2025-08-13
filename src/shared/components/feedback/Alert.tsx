import React from 'react';

import styled, { css } from 'styled-components';

import { duration, easing } from '../../../styles/animations';
import { dimensions } from '../../../styles/dimensions';
import { tokens } from '../../../styles/tokens';
import { typography } from '../../../styles/typography';

export type AlertSeverity = 'error' | 'warning' | 'info' | 'success';
export type AlertVariant = 'standard' | 'filled' | 'outlined';

interface AlertProps {
  severity: AlertSeverity;
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode | boolean;
  onClose?: () => void;
  className?: string;
}

// Alert container styles
const AlertContainer = styled.div<{
  $severity: AlertSeverity;
  $variant: AlertVariant;
}>`
  display: flex;
  padding: 16px;
  border-radius: ${dimensions.borderRadius.medium}px;
  margin-bottom: 16px;
  position: relative;
  transition: all ${duration.normal} ${easing.easeOut};

  ${props => {
    const colors = {
      error: {
        standard: {
          bg: '#fef2f2',
          border: 'transparent',
          text: '#991b1b',
          icon: '#dc2626',
        },
        filled: {
          bg: '#dc2626',
          border: '#dc2626',
          text: '#ffffff',
          icon: '#ffffff',
        },
        outlined: {
          bg: 'transparent',
          border: '#dc2626',
          text: '#dc2626',
          icon: '#dc2626',
        },
      },
      warning: {
        standard: {
          bg: '#fffbeb',
          border: 'transparent',
          text: '#92400e',
          icon: '#f59e0b',
        },
        filled: {
          bg: '#f59e0b',
          border: '#f59e0b',
          text: '#ffffff',
          icon: '#ffffff',
        },
        outlined: {
          bg: 'transparent',
          border: '#f59e0b',
          text: '#f59e0b',
          icon: '#f59e0b',
        },
      },
      info: {
        standard: {
          bg: '#eff6ff',
          border: 'transparent',
          text: '#1e40af',
          icon: '#3b82f6',
        },
        filled: {
          bg: '#3b82f6',
          border: '#3b82f6',
          text: '#ffffff',
          icon: '#ffffff',
        },
        outlined: {
          bg: 'transparent',
          border: '#3b82f6',
          text: '#3b82f6',
          icon: '#3b82f6',
        },
      },
      success: {
        standard: {
          bg: '#f0fdf4',
          border: 'transparent',
          text: '#166534',
          icon: '#22c55e',
        },
        filled: {
          bg: '#22c55e',
          border: '#22c55e',
          text: '#ffffff',
          icon: '#ffffff',
        },
        outlined: {
          bg: 'transparent',
          border: '#22c55e',
          text: '#22c55e',
          icon: '#22c55e',
        },
      },
    };

    const color = colors[props.$severity][props.$variant];

    return css`
      background-color: ${color.bg};
      border: 1px solid ${color.border};
      color: ${color.text};

      ${AlertIcon} {
        color: ${color.icon};
      }
    `;
  }}
`;

const AlertIcon = styled.div`
  display: flex;
  align-items: flex-start;
  margin-right: 12px;
  padding-top: 2px;
  flex-shrink: 0;

  svg {
    width: 22px;
    height: 22px;
  }
`;

const AlertContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const AlertTitle = styled.div`
  font-family: ${typography.fontFamily.kbfgTextBold};
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
  line-height: 1.3;
`;

const AlertMessage = styled.div`
  font-family: ${typography.fontFamily.kbfgTextLight};
  font-size: 14px;
  line-height: 1.5;

  a {
    color: inherit;
    text-decoration: underline;
    font-weight: 600;

    &:hover {
      text-decoration: none;
    }
  }
`;

const AlertAction = styled.div`
  display: flex;
  align-items: flex-start;
  margin-left: 8px;
  flex-shrink: 0;
`;

const AlertCloseButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  margin: -4px -4px -4px 8px;
  border-radius: 4px;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  transition: opacity ${duration.fast} ${easing.easeOut};

  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.04);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

// Default icons for each severity
const defaultIcons: Record<AlertSeverity, React.ReactNode> = {
  error: (
    <svg viewBox='0 0 24 24' fill='currentColor'>
      <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' />
    </svg>
  ),
  warning: (
    <svg viewBox='0 0 24 24' fill='currentColor'>
      <path d='M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z' />
    </svg>
  ),
  info: (
    <svg viewBox='0 0 24 24' fill='currentColor'>
      <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z' />
    </svg>
  ),
  success: (
    <svg viewBox='0 0 24 24' fill='currentColor'>
      <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' />
    </svg>
  ),
};

export const Alert: React.FC<AlertProps> = ({
  severity,
  variant = 'standard',
  title,
  children,
  action,
  icon = true,
  onClose,
  className,
}) => {
  return (
    <AlertContainer $severity={severity} $variant={variant} className={className}>
      {icon && <AlertIcon>{icon === true ? defaultIcons[severity] : icon}</AlertIcon>}

      <AlertContent>
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertMessage>{children}</AlertMessage>
      </AlertContent>

      {action && <AlertAction>{action}</AlertAction>}

      {onClose && (
        <AlertCloseButton onClick={onClose} aria-label='닫기'>
          <svg viewBox='0 0 24 24' fill='currentColor'>
            <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' />
          </svg>
        </AlertCloseButton>
      )}
    </AlertContainer>
  );
};

// Specialized alert components
export const ErrorAlert: React.FC<Omit<AlertProps, 'severity'>> = props => (
  <Alert severity='error' {...props} />
);

export const WarningAlert: React.FC<Omit<AlertProps, 'severity'>> = props => (
  <Alert severity='warning' {...props} />
);

export const InfoAlert: React.FC<Omit<AlertProps, 'severity'>> = props => (
  <Alert severity='info' {...props} />
);

export const SuccessAlert: React.FC<Omit<AlertProps, 'severity'>> = props => (
  <Alert severity='success' {...props} />
);

// Alert with actions
export const AlertWithAction: React.FC<
  AlertProps & {
    actionLabel: string;
    onAction: () => void;
  }
> = ({ actionLabel, onAction, ...props }) => {
  const ActionButton = styled.button`
    background: none;
    border: none;
    color: inherit;
    font-family: ${typography.fontFamily.kbfgTextMedium};
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    cursor: pointer;
    padding: 4px 8px;
    margin: -4px -8px;
    border-radius: 4px;
    transition: background-color ${duration.fast} ${easing.easeOut};

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `;

  return (
    <Alert {...props} action={<ActionButton onClick={onAction}>{actionLabel}</ActionButton>} />
  );
};
