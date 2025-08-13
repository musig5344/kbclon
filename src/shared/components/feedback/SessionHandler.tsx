import React, { useEffect, useState, useCallback } from 'react';

import styled from 'styled-components';

import { dimensions } from '../../../styles/dimensions';
import { tokens } from '../../../styles/tokens';
import { typography } from '../../../styles/typography';
import Button from '../ui/Button';

import { CircularProgress } from './ProgressIndicator';

interface SessionHandlerProps {
  sessionTimeout?: number; // in milliseconds
  warningTime?: number; // time before timeout to show warning
  onSessionExpired?: () => void;
  onExtendSession?: () => Promise<void>;
  children: React.ReactNode;
}

// Styled Components
const SessionWarningOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const SessionWarningContainer = styled.div`
  background-color: ${tokens.colors.white};
  border-radius: ${dimensions.borderRadius.large}px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 100%;
  padding: 32px;
  text-align: center;
`;

const WarningIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fef3c7;
  border-radius: 50%;
  color: #f59e0b;
`;

const WarningTitle = styled.h2`
  font-family: ${typography.fontFamily.kbfgTextBold};
  font-size: 22px;
  font-weight: 700;
  color: ${tokens.colors.text.primary};
  margin: 0 0 12px 0;
`;

const WarningMessage = styled.p`
  font-family: ${typography.fontFamily.kbfgTextLight};
  font-size: 16px;
  color: ${tokens.colors.text.secondary};
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const CountdownContainer = styled.div`
  margin-bottom: 32px;
`;

const CountdownTimer = styled.div`
  font-family: ${typography.fontFamily.kbfgTextBold};
  font-size: 36px;
  font-weight: 700;
  color: #f59e0b;
  margin-bottom: 8px;
`;

const CountdownLabel = styled.div`
  font-family: ${typography.fontFamily.kbfgTextMedium};
  font-size: 14px;
  color: ${tokens.colors.text.tertiary};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const SessionExpiredContainer = styled.div`
  background-color: ${tokens.colors.white};
  border-radius: ${dimensions.borderRadius.large}px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 100%;
  padding: 32px;
  text-align: center;
`;

const ExpiredIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fee2e2;
  border-radius: 50%;
  color: #dc2626;
`;

// Activity tracker
const ActivityTracker: React.FC<{
  onActivity: () => void;
  events?: string[];
}> = ({ onActivity, events = ['mousedown', 'keydown', 'scroll', 'touchstart'] }) => {
  useEffect(() => {
    const handleActivity = () => {
      onActivity();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [onActivity, events]);

  return null;
};

// Session Handler Component
export const SessionHandler: React.FC<SessionHandlerProps> = ({
  sessionTimeout = 10 * 60 * 1000, // 10 minutes default
  warningTime = 60 * 1000, // 1 minute warning
  onSessionExpired,
  onExtendSession,
  children,
}) => {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isExtending, setIsExtending] = useState(false);

  const handleActivity = useCallback(() => {
    if (!showWarning && !isExpired) {
      setLastActivity(Date.now());
    }
  }, [showWarning, isExpired]);

  const handleExtendSession = async () => {
    setIsExtending(true);
    try {
      if (onExtendSession) {
        await onExtendSession();
      }
      setLastActivity(Date.now());
      setShowWarning(false);
      setCountdown(0);
    } catch (error) {
      console.error('Failed to extend session:', error);
    } finally {
      setIsExtending(false);
    }
  };

  const handleLogout = () => {
    setIsExpired(true);
    setShowWarning(false);
    if (onSessionExpired) {
      onSessionExpired();
    } else {
      // Default: redirect to login
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    const checkSession = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      const timeUntilTimeout = sessionTimeout - timeSinceActivity;

      if (timeUntilTimeout <= 0) {
        // Session expired
        setIsExpired(true);
        setShowWarning(false);
        if (onSessionExpired) {
          onSessionExpired();
        }
      } else if (timeUntilTimeout <= warningTime) {
        // Show warning
        setShowWarning(true);
        setCountdown(Math.ceil(timeUntilTimeout / 1000));
      } else {
        // Session active
        setShowWarning(false);
        setCountdown(0);
      }
    };

    const interval = setInterval(checkSession, 1000);
    return () => clearInterval(interval);
  }, [lastActivity, sessionTimeout, warningTime, onSessionExpired]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <ActivityTracker onActivity={handleActivity} />

      {children}

      {showWarning && !isExpired && (
        <SessionWarningOverlay>
          <SessionWarningContainer>
            <WarningIcon>
              <svg width='48' height='48' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' />
              </svg>
            </WarningIcon>

            <WarningTitle>세션 만료 경고</WarningTitle>

            <WarningMessage>
              보안을 위해 곧 자동으로 로그아웃됩니다.
              <br />
              계속 이용하시려면 연장하기를 눌러주세요.
            </WarningMessage>

            <CountdownContainer>
              <CountdownTimer>{formatTime(countdown)}</CountdownTimer>
              <CountdownLabel>남은 시간</CountdownLabel>
            </CountdownContainer>

            <ButtonContainer>
              <Button
                variant='primary'
                size='medium'
                onClick={handleExtendSession}
                disabled={isExtending}
                fullWidth
              >
                {isExtending ? (
                  <>
                    <CircularProgress size='small' />
                    연장 중...
                  </>
                ) : (
                  '연장하기'
                )}
              </Button>

              <Button variant='secondary' size='medium' onClick={handleLogout} fullWidth>
                로그아웃
              </Button>
            </ButtonContainer>
          </SessionWarningContainer>
        </SessionWarningOverlay>
      )}

      {isExpired && (
        <SessionWarningOverlay>
          <SessionExpiredContainer>
            <ExpiredIcon>
              <svg width='48' height='48' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' />
              </svg>
            </ExpiredIcon>

            <WarningTitle>세션이 만료되었습니다</WarningTitle>

            <WarningMessage>
              보안을 위해 자동으로 로그아웃되었습니다.
              <br />
              다시 로그인해 주세요.
            </WarningMessage>

            <Button
              variant='primary'
              size='medium'
              onClick={() => (window.location.href = '/login')}
              fullWidth
            >
              로그인 페이지로
            </Button>
          </SessionExpiredContainer>
        </SessionWarningOverlay>
      )}
    </>
  );
};

// Hook for session management
export const useSession = (timeout: number = 10 * 60 * 1000) => {
  const [isActive, setIsActive] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(timeout);

  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setIsActive(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      const remaining = timeout - elapsed;

      setTimeRemaining(Math.max(0, remaining));
      setIsActive(remaining > 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastActivity, timeout]);

  return {
    isActive,
    timeRemaining,
    updateActivity,
    percentRemaining: (timeRemaining / timeout) * 100,
  };
};
