import React, { Component, ReactNode } from 'react';

import styled from 'styled-components';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
`;

const ErrorIcon = styled.div`
  width: 64px;
  height: 64px;
  background-color: #ff4757;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;

  &::after {
    content: '!';
    color: white;
    font-size: 32px;
    font-weight: bold;
  }
`;

const ErrorTitle = styled.h2`
  color: #333;
  font-size: 20px;
  margin: 0 0 12px 0;
  text-align: center;
`;

const ErrorMessage = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0 0 24px 0;
  text-align: center;
  line-height: 1.5;
`;

const RetryButton = styled.button`
  background-color: #ffb831;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e5a52b;
  }

  &:active {
    transform: scale(0.98);
  }
`;

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class LazyLoadErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 청크 로딩 에러인지 확인
    if (error.message && error.message.includes('Loading chunk')) {
      console.error('Chunk loading error:', error);
    } else {
      console.error('Component error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    // 페이지 새로고침으로 재시도
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isChunkError =
        this.state.error?.message?.includes('Loading chunk') ||
        this.state.error?.message?.includes('Failed to fetch');

      return (
        <ErrorContainer>
          <ErrorIcon />
          <ErrorTitle>
            {isChunkError ? '페이지 로딩 중 문제가 발생했습니다' : '오류가 발생했습니다'}
          </ErrorTitle>
          <ErrorMessage>
            {isChunkError
              ? '네트워크 연결을 확인하고 다시 시도해주세요.'
              : '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}
          </ErrorMessage>
          <RetryButton onClick={this.handleRetry}>다시 시도</RetryButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}
