import React, { Component, ErrorInfo, ReactNode } from 'react';

import styled from 'styled-components';

import { duration, easing } from '../../../styles/animations';
import { tokens } from '../../../styles/tokens';
import { typography } from '../../../styles/typography';
import { safeLog } from '../../utils/errorHandler';
import Button from '../ui/Button';

interface ErrorHandlerProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  errorType?: 'page' | 'component' | 'transaction' | 'auth';
  showDetails?: boolean;
}

interface ErrorHandlerState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCode?: string;
}

// 에러 타입별 스타일
const ErrorContainer = styled.div<{ $type: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${props => (props.$type === 'component' ? '100px' : '300px')};
  padding: ${props => (props.$type === 'component' ? '16px' : '24px')};
  text-align: center;
  background-color: ${tokens.colors.white};
  border-radius: ${props => (props.$type === 'component' ? '8px' : '0')};
  ${props =>
    props.$type === 'component' &&
    `
    border: 1px solid ${tokens.colors.backgroundGray2};
    margin: 8px 0;
  `}
`;

const ErrorIcon = styled.div<{ $type: string }>`
  font-size: ${props => (props.$type === 'component' ? '32px' : '48px')};
  margin-bottom: 16px;
  animation: shake 0.5s ease-in-out;

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-10px);
    }
    75% {
      transform: translateX(10px);
    }
  }
`;

const ErrorTitle = styled.h2`
  font-family: ${typography.fontFamily.kbfgTextBold};
  font-size: 18px;
  font-weight: 700;
  color: ${tokens.colors.text.primary};
  margin: 0 0 8px 0;
  line-height: 1.4;
`;

const ErrorMessage = styled.p`
  font-family: ${typography.fontFamily.kbfgTextLight};
  font-size: 14px;
  color: ${tokens.colors.text.secondary};
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const ErrorCode = styled.div`
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  color: ${tokens.colors.text.tertiary};
  margin-bottom: 16px;
  padding: 8px 16px;
  background-color: ${tokens.colors.backgroundGray1};
  border-radius: 4px;
`;

const ErrorDetails = styled.details`
  margin-top: 16px;
  width: 100%;
  max-width: 500px;
  text-align: left;

  summary {
    cursor: pointer;
    font-size: 12px;
    color: ${tokens.colors.text.tertiary};
    margin-bottom: 8px;

    &:hover {
      color: ${tokens.colors.text.secondary};
    }
  }

  pre {
    font-size: 11px;
    background-color: ${tokens.colors.backgroundGray1};
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

// 에러 타입별 정보
const ERROR_TYPE_CONFIG = {
  page: {
    icon: '📄',
    title: '페이지 로딩 오류',
    message: '페이지를 불러오는 중 문제가 발생했습니다.',
    actions: ['새로고침', '홈으로'],
  },
  component: {
    icon: '🔧',
    title: '일시적인 오류',
    message: '화면 일부를 표시하는 중 문제가 발생했습니다.',
    actions: ['다시 시도'],
  },
  transaction: {
    icon: '💳',
    title: '거래 처리 오류',
    message: '거래를 처리하는 중 문제가 발생했습니다.',
    actions: ['다시 시도', '고객센터'],
  },
  auth: {
    icon: '🔒',
    title: '인증 오류',
    message: '로그인 상태를 확인할 수 없습니다.',
    actions: ['다시 로그인', '홈으로'],
  },
};

// 에러 코드 생성
const generateErrorCode = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `ERR-${timestamp}-${random}`.toUpperCase();
};

export class ErrorHandler extends Component<ErrorHandlerProps, ErrorHandlerState> {
  private resetTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorHandlerProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCode: undefined,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorHandlerState> {
    return {
      hasError: true,
      error,
      errorCode: generateErrorCode(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
    });

    // 중앙화된 에러 로깅
    safeLog('error', 'ErrorHandler caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorCode: this.state.errorCode,
      errorType: this.props.errorType,
    });

    // 커스텀 에러 핸들러 호출
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorHandlerProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

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
        errorCode: undefined,
      });
    }, 100);
  };

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  handleHomeClick = () => {
    window.location.href = '/';
  };

  handleRefreshClick = () => {
    window.location.reload();
  };

  handleCustomerServiceClick = () => {
    window.location.href = 'tel:1588-9999';
  };

  handleLoginClick = () => {
    window.location.href = '/login';
  };

  renderErrorFallback = () => {
    const { errorType = 'component', showDetails = false } = this.props;
    const { error, errorInfo, errorCode } = this.state;
    const config = ERROR_TYPE_CONFIG[errorType];

    return (
      <ErrorContainer $type={errorType}>
        <ErrorIcon $type={errorType}>{config.icon}</ErrorIcon>
        <ErrorTitle>{config.title}</ErrorTitle>
        <ErrorMessage>{config.message}</ErrorMessage>

        {errorCode && <ErrorCode>오류 코드: {errorCode}</ErrorCode>}

        <ButtonGroup>
          {config.actions.includes('다시 시도') && (
            <Button variant='primary' size='medium' onClick={this.resetErrorBoundary}>
              다시 시도
            </Button>
          )}

          {config.actions.includes('새로고침') && (
            <Button variant='primary' size='medium' onClick={this.handleRefreshClick}>
              새로고침
            </Button>
          )}

          {config.actions.includes('홈으로') && (
            <Button variant='secondary' size='medium' onClick={this.handleHomeClick}>
              홈으로
            </Button>
          )}

          {config.actions.includes('고객센터') && (
            <Button variant='secondary' size='medium' onClick={this.handleCustomerServiceClick}>
              고객센터
            </Button>
          )}

          {config.actions.includes('다시 로그인') && (
            <Button variant='primary' size='medium' onClick={this.handleLoginClick}>
              다시 로그인
            </Button>
          )}
        </ButtonGroup>

        {showDetails && process.env.NODE_ENV === 'development' && error && (
          <ErrorDetails>
            <summary>오류 상세 정보 (개발자용)</summary>
            <pre>
              {error.message}
              {'\n\n'}
              {error.stack}
              {errorInfo && '\n\n컴포넌트 스택:\n' + errorInfo.componentStack}
            </pre>
          </ErrorDetails>
        )}
      </ErrorContainer>
    );
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return this.renderErrorFallback();
    }

    return this.props.children;
  }
}

// 특수화된 에러 바운더리
export const PageErrorHandler: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorHandler errorType='page'>{children}</ErrorHandler>
);

export const ComponentErrorHandler: React.FC<{
  children: ReactNode;
  componentName?: string;
}> = ({ children, componentName }) => <ErrorHandler errorType='component'>{children}</ErrorHandler>;

export const TransactionErrorHandler: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorHandler errorType='transaction'>{children}</ErrorHandler>
);

export const AuthErrorHandler: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorHandler errorType='auth'>{children}</ErrorHandler>
);

export default ErrorHandler;
