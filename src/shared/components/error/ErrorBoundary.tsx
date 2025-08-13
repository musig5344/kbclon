import React, { Component, ErrorInfo, ReactNode } from 'react';

import styled from 'styled-components';

import { tokens } from '../../../styles/tokens';
import { safeLog } from '../../../utils/errorHandler';
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}
interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}
const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 24px;
  text-align: center;
  background-color: ${tokens.colors.white};
`;
const ErrorIcon = styled.div`
  font-size: 48px;
  color: #ff4444;
  margin-bottom: 16px;
`;
const ErrorTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #26282c;
  margin: 0 0 8px 0;
  font-family: 'KBFGText', sans-serif;
`;
const ErrorMessage = styled.p`
  font-size: 14px;
  color: #666666;
  margin: 0 0 24px 0;
  line-height: 1.4;
  font-family: 'KBFGText', sans-serif;
`;
const RetryButton = styled.button`
  padding: 12px 24px;
  background-color: #ffd338;
  color: #26282c;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'KBFGText', sans-serif;
  transition: all 0.2s ease;
  &:hover {
    background-color: #ffda48;
  }
  &:active {
    background-color: #ffcf28;
    transform: scale(0.98);
  }
`;
const DefaultErrorFallback: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <ErrorContainer>
    <ErrorIcon>⚠️</ErrorIcon>
    <ErrorTitle>문제가 발생했습니다</ErrorTitle>
    <ErrorMessage>
      일시적인 오류가 발생했습니다.
      <br />
      잠시 후 다시 시도해 주세요.
    </ErrorMessage>
    <RetryButton onClick={onRetry}>다시 시도</RetryButton>
  </ErrorContainer>
);
export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null;
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    // Log error using centralized error handler
    safeLog('error', 'ErrorBoundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }
  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;
    // Reset error state if resetKeys changed
    if (hasError && resetOnPropsChange && resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => prevProps.resetKeys?.[index] !== key
      );
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }
  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    this.resetTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }, 100);
  };
  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <DefaultErrorFallback onRetry={this.resetErrorBoundary} />;
    }
    return this.props.children;
  }
}
// Specialized error boundaries for different contexts
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallback={
      <ErrorContainer>
        <ErrorIcon>🏠</ErrorIcon>
        <ErrorTitle>페이지 로딩 중 오류가 발생했습니다</ErrorTitle>
        <ErrorMessage>
          페이지를 불러오는 중 문제가 발생했습니다.
          <br />
          홈으로 돌아가거나 새로고침해 주세요.
        </ErrorMessage>
        <RetryButton onClick={() => window.location.reload()}>새로고침</RetryButton>
      </ErrorContainer>
    }
  >
    {children}
  </ErrorBoundary>
);
export const ComponentErrorBoundary: React.FC<{ children: ReactNode; componentName?: string }> = ({
  children,
  componentName = '컴포넌트',
}) => (
  <ErrorBoundary
    fallback={
      <ErrorContainer style={{ minHeight: '100px', padding: '16px' }}>
        <ErrorIcon style={{ fontSize: '24px' }}>⚠️</ErrorIcon>
        <ErrorTitle style={{ fontSize: '14px' }}>{componentName} 오류</ErrorTitle>
        <ErrorMessage style={{ fontSize: '12px', marginBottom: '16px' }}>
          {componentName}를 불러올 수 없습니다.
        </ErrorMessage>
      </ErrorContainer>
    }
  >
    {children}
  </ErrorBoundary>
);
export default ErrorBoundary;
