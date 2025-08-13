import React, { useEffect, useState } from 'react';

import styled from 'styled-components';

import { duration, easing } from '../../../styles/animations';
import { tokens } from '../../../styles/tokens';
import { typography } from '../../../styles/typography';
import Button from '../ui/Button';

import { CircularProgress } from './ProgressIndicator';

interface NetworkErrorHandlerProps {
  onRetry?: () => void;
  retryDelay?: number;
  maxRetries?: number;
  children?: React.ReactNode;
  showOfflineIndicator?: boolean;
}

// Styled Components
const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 24px;
  text-align: center;
  background-color: ${tokens.colors.white};
`;

const ErrorIcon = styled.div`
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fee2e2;
  border-radius: 50%;
`;

const ErrorTitle = styled.h2`
  font-family: ${typography.fontFamily.kbfgTextBold};
  font-size: 20px;
  font-weight: 700;
  color: ${tokens.colors.text.primary};
  margin: 0 0 12px 0;
`;

const ErrorMessage = styled.p`
  font-family: ${typography.fontFamily.kbfgTextLight};
  font-size: 16px;
  color: ${tokens.colors.text.secondary};
  margin: 0 0 32px 0;
  line-height: 1.5;
  max-width: 400px;
`;

const RetryInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const RetryCountdown = styled.div`
  font-family: ${typography.fontFamily.kbfgTextMedium};
  font-size: 14px;
  color: ${tokens.colors.text.tertiary};
`;

const TipContainer = styled.div`
  background-color: ${tokens.colors.backgroundGray1};
  border-radius: 8px;
  padding: 16px;
  margin-top: 24px;
  max-width: 400px;
`;

const TipTitle = styled.h3`
  font-family: ${typography.fontFamily.kbfgTextMedium};
  font-size: 14px;
  font-weight: 600;
  color: ${tokens.colors.text.primary};
  margin: 0 0 8px 0;
`;

const TipList = styled.ul`
  margin: 0;
  padding-left: 20px;
  font-family: ${typography.fontFamily.kbfgTextLight};
  font-size: 13px;
  color: ${tokens.colors.text.secondary};
  line-height: 1.6;
  text-align: left;
`;

const OfflineIndicator = styled.div<{ $isOnline: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: ${props => (props.$isOnline ? '#22c55e' : '#ef4444')};
  color: white;
  padding: 8px;
  text-align: center;
  font-family: ${typography.fontFamily.kbfgTextMedium};
  font-size: 14px;
  z-index: 9999;
  transform: translateY(${props => (props.$isOnline ? '-100%' : '0')});
  transition: transform ${duration.normal} ${easing.easeOut};
`;

// Network Error Handler Component
export const NetworkErrorHandler: React.FC<NetworkErrorHandlerProps> = ({
  onRetry,
  retryDelay = 5000,
  maxRetries = 3,
  children,
  showOfflineIndicator = true,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOnline && retryCount < maxRetries) {
      setCountdown(Math.floor(retryDelay / 1000));

      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            handleRetry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [isOnline, retryCount, retryDelay, maxRetries]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      if (onRetry) {
        await onRetry();
      } else {
        // 기본 재시도 로직: 페이지 새로고침
        window.location.reload();
      }
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleManualRetry = () => {
    setRetryCount(0);
    handleRetry();
  };

  if (!isOnline) {
    return (
      <>
        {showOfflineIndicator && (
          <OfflineIndicator $isOnline={false}>인터넷 연결이 끊어졌습니다</OfflineIndicator>
        )}

        <ErrorContainer>
          <ErrorIcon>
            <svg width='48' height='48' viewBox='0 0 24 24' fill='#dc2626'>
              <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' />
            </svg>
          </ErrorIcon>

          <ErrorTitle>네트워크 연결 오류</ErrorTitle>

          <ErrorMessage>
            인터넷 연결을 확인할 수 없습니다.
            <br />
            네트워크 상태를 확인해 주세요.
          </ErrorMessage>

          {isRetrying ? (
            <RetryInfo>
              <CircularProgress size='medium' />
              <RetryCountdown>재시도 중...</RetryCountdown>
            </RetryInfo>
          ) : (
            <>
              {countdown > 0 && retryCount < maxRetries && (
                <RetryInfo>
                  <RetryCountdown>{countdown}초 후 자동으로 재시도합니다</RetryCountdown>
                  <Button variant='secondary' size='small' onClick={handleManualRetry}>
                    지금 재시도
                  </Button>
                </RetryInfo>
              )}

              {(countdown === 0 || retryCount >= maxRetries) && (
                <Button variant='primary' size='medium' onClick={handleManualRetry}>
                  다시 시도
                </Button>
              )}
            </>
          )}

          <TipContainer>
            <TipTitle>해결 방법</TipTitle>
            <TipList>
              <li>Wi-Fi 또는 모바일 데이터 연결 확인</li>
              <li>비행기 모드가 꺼져 있는지 확인</li>
              <li>라우터 재시작</li>
              <li>다른 앱의 인터넷 연결 확인</li>
            </TipList>
          </TipContainer>
        </ErrorContainer>
      </>
    );
  }

  if (showOfflineIndicator && isOnline && retryCount > 0) {
    // 재연결 성공 메시지 표시
    setTimeout(() => setRetryCount(0), 3000);

    return (
      <>
        <OfflineIndicator $isOnline={true}>인터넷에 다시 연결되었습니다</OfflineIndicator>
        {children}
      </>
    );
  }

  return <>{children}</>;
};

// Hook for network status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (!navigator.onLine) {
        setWasOffline(true);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    wasOffline,
    isReconnected: isOnline && wasOffline,
  };
};
