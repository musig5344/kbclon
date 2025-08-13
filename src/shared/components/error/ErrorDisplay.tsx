import React from 'react';

import styled from 'styled-components';

import { colors } from '../../../styles/colors';
export type ErrorType = 'network' | 'validation' | 'auth' | 'server' | 'unknown';
const ErrorContainer = styled.div<{ variant: 'inline' | 'card' | 'banner' }>`
  display: flex;
  align-items: ${props => (props.variant === 'inline' ? 'center' : 'flex-start')};
  gap: 12px;
  padding: ${props => {
    switch (props.variant) {
      case 'inline':
        return '8px 0';
      case 'card':
        return '16px';
      case 'banner':
        return '12px 16px';
      default:
        return '12px';
    }
  }};
  background-color: ${props => {
    switch (props.variant) {
      case 'inline':
        return 'transparent';
      case 'card':
        return '#fff5f5';
      case 'banner':
        return '#fef2f2';
      default:
        return 'transparent';
    }
  }};
  border: ${props => (props.variant === 'card' ? '1px solid #fecaca' : 'none')};
  border-radius: ${props => (props.variant === 'card' ? '8px' : '0')};
  border-left: ${props => (props.variant === 'banner' ? '4px solid #ef4444' : 'none')};
`;
const ErrorIcon = styled.div<{ type: ErrorType }>`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: ${props => {
    switch (props.type) {
      case 'network':
        return '#f59e0b';
      case 'auth':
        return '#ef4444';
      case 'validation':
        return '#f59e0b';
      case 'server':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }};
`;
const ErrorContent = styled.div`
  flex: 1;
  min-width: 0;
`;
const ErrorMessage = styled.div<{ size: 'small' | 'medium' | 'large' }>`
  font-size: ${props => {
    switch (props.size) {
      case 'small':
        return '12px';
      case 'large':
        return '16px';
      default:
        return '14px';
    }
  }};
  color: #dc2626;
  line-height: 1.4;
  font-family: 'KBFGText', sans-serif;
  margin: 0 0 4px 0;
  font-weight: 500;
`;
const ErrorDetails = styled.div`
  font-size: 12px;
  color: #6b7280;
  line-height: 1.3;
  font-family: 'KBFGText', sans-serif;
`;
const ErrorActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;
const ErrorButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: 4px 12px;
  border: 1px solid ${props => (props.variant === 'primary' ? '#dc2626' : '#d1d5db')};
  background-color: ${props => (props.variant === 'primary' ? '#dc2626' : colors.white)};
  color: ${props => (props.variant === 'primary' ? colors.white : '#374151')};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'KBFGText', sans-serif;
  transition: all 0.2s ease;
  &:hover {
    background-color: ${props => (props.variant === 'primary' ? '#b91c1c' : '#f9fafb')};
  }
  &:active {
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
const getErrorIcon = (type: ErrorType): string => {
  switch (type) {
    case 'network':
      return '🌐';
    case 'auth':
      return '🔒';
    case 'validation':
      return '⚠️';
    case 'server':
      return '⚡';
    default:
      return '❌';
  }
};
const getDefaultMessage = (type: ErrorType): string => {
  switch (type) {
    case 'network':
      return '네트워크 연결을 확인해 주세요.';
    case 'auth':
      return '로그인이 필요합니다.';
    case 'validation':
      return '입력한 정보를 확인해 주세요.';
    case 'server':
      return '서버에 일시적인 문제가 발생했습니다.';
    default:
      return '오류가 발생했습니다.';
  }
};
interface ErrorDisplayProps {
  type?: ErrorType;
  message?: string;
  details?: string;
  variant?: 'inline' | 'card' | 'banner';
  size?: 'small' | 'medium' | 'large';
  showRetry?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
  showDismiss?: boolean;
  onDismiss?: () => void;
  dismissLabel?: string;
  className?: string;
}
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  type = 'unknown',
  message,
  details,
  variant = 'inline',
  size = 'medium',
  showRetry = false,
  onRetry,
  retryLabel = '다시 시도',
  showDismiss = false,
  onDismiss,
  dismissLabel = '닫기',
  className,
}) => {
  const displayMessage = message || getDefaultMessage(type);
  return (
    <ErrorContainer variant={variant} className={className}>
      <ErrorIcon type={type}>{getErrorIcon(type)}</ErrorIcon>
      <ErrorContent>
        <ErrorMessage size={size}>{displayMessage}</ErrorMessage>
        {details && <ErrorDetails>{details}</ErrorDetails>}
        {(showRetry || showDismiss) && (
          <ErrorActions>
            {showRetry && onRetry && (
              <ErrorButton variant='primary' onClick={onRetry}>
                {retryLabel}
              </ErrorButton>
            )}
            {showDismiss && onDismiss && (
              <ErrorButton variant='secondary' onClick={onDismiss}>
                {dismissLabel}
              </ErrorButton>
            )}
          </ErrorActions>
        )}
      </ErrorContent>
    </ErrorContainer>
  );
};
// Specialized error display components
export const NetworkError: React.FC<Omit<ErrorDisplayProps, 'type'>> = props => (
  <ErrorDisplay type='network' message='인터넷 연결을 확인해 주세요.' showRetry={true} {...props} />
);
export const AuthError: React.FC<Omit<ErrorDisplayProps, 'type'>> = props => (
  <ErrorDisplay
    type='auth'
    message='로그인이 만료되었습니다.'
    details='다시 로그인해 주세요.'
    {...props}
  />
);
export const ValidationError: React.FC<Omit<ErrorDisplayProps, 'type'>> = props => (
  <ErrorDisplay type='validation' variant='inline' size='small' {...props} />
);
export const ServerError: React.FC<Omit<ErrorDisplayProps, 'type'>> = props => (
  <ErrorDisplay
    type='server'
    message='서버에 일시적인 문제가 발생했습니다.'
    details='잠시 후 다시 시도해 주세요.'
    variant='card'
    showRetry={true}
    {...props}
  />
);
export default ErrorDisplay;
