/**
 * In-App Notification Component
 *
 * 앱 내에서 표시되는 알림 컴포넌트
 * - 실시간 알림 표시
 * - 드롭다운 애니메이션
 * - 알림 유형별 스타일링
 * - 액션 버튼 지원
 */

import React, { useState, useEffect, useRef } from 'react';

import styled, { keyframes, css } from 'styled-components';

import {
  PushNotificationData,
  NotificationType,
  NotificationPriority,
} from '../../services/pushNotificationService';

interface InAppNotificationProps {
  notification: PushNotificationData;
  onClose: () => void;
  onAction?: (actionId: string) => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const slideDown = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const NotificationContainer = styled.div<{
  isVisible: boolean;
  priority: NotificationPriority;
  notificationType: NotificationType;
}>`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 400px;
  z-index: 10000;

  animation: ${props => (props.isVisible ? slideDown : slideUp)} 0.3s ease-out forwards;

  ${props =>
    props.priority === NotificationPriority.CRITICAL &&
    css`
      animation:
        ${slideDown} 0.3s ease-out,
        ${pulse} 2s ease-in-out infinite;
    `}

  @media (max-width: 768px) {
    top: 10px;
    left: 10px;
    right: 10px;
    width: auto;
    transform: none;
  }
`;

const NotificationCard = styled.div<{
  priority: NotificationPriority;
  notificationType: NotificationType;
}>`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${props => {
      switch (props.notificationType) {
        case NotificationType.TRANSACTION:
          return '#4CAF50';
        case NotificationType.SECURITY:
          return '#F44336';
        case NotificationType.BALANCE_ALERT:
          return '#FF9800';
        case NotificationType.BILL_REMINDER:
          return '#2196F3';
        case NotificationType.PROMOTIONAL:
          return '#9C27B0';
        case NotificationType.SYSTEM_MAINTENANCE:
          return '#607D8B';
        default:
          return '#FFD338';
      }
    }};
  }

  ${props =>
    props.priority === NotificationPriority.CRITICAL &&
    css`
      border: 2px solid #f44336;
      box-shadow: 0 0 20px rgba(244, 67, 54, 0.3);
    `}
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px 12px;
  position: relative;
`;

const NotificationIcon = styled.div<{ notificationType: NotificationType }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
  background: ${props => {
    switch (props.notificationType) {
      case NotificationType.TRANSACTION:
        return 'linear-gradient(135deg, #4CAF50, #45A049)';
      case NotificationType.SECURITY:
        return 'linear-gradient(135deg, #F44336, #E53935)';
      case NotificationType.BALANCE_ALERT:
        return 'linear-gradient(135deg, #FF9800, #F57C00)';
      case NotificationType.BILL_REMINDER:
        return 'linear-gradient(135deg, #2196F3, #1976D2)';
      case NotificationType.PROMOTIONAL:
        return 'linear-gradient(135deg, #9C27B0, #7B1FA2)';
      case NotificationType.SYSTEM_MAINTENANCE:
        return 'linear-gradient(135deg, #607D8B, #455A64)';
      default:
        return 'linear-gradient(135deg, #FFD338, #FFCC00)';
    }
  }};

  &::after {
    content: '${props => {
      switch (props.notificationType) {
        case NotificationType.TRANSACTION:
          return '💳';
        case NotificationType.SECURITY:
          return '🔒';
        case NotificationType.BALANCE_ALERT:
          return '📈';
        case NotificationType.BILL_REMINDER:
          return '📄';
        case NotificationType.PROMOTIONAL:
          return '🎁';
        case NotificationType.SYSTEM_MAINTENANCE:
          return '⚙️';
        default:
          return '🔔';
      }
    }}';
    color: white;
  }
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
  line-height: 1.3;
`;

const NotificationBody = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;

const PriorityBadge = styled.div<{ priority: NotificationPriority }>`
  position: absolute;
  top: 12px;
  right: 16px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;

  ${props => {
    switch (props.priority) {
      case NotificationPriority.CRITICAL:
        return `
          background: #FFEBEE;
          color: #C62828;
          border: 1px solid #FFCDD2;
        `;
      case NotificationPriority.HIGH:
        return `
          background: #FFF3E0;
          color: #F57C00;
          border: 1px solid #FFCC02;
        `;
      case NotificationPriority.NORMAL:
        return `
          background: #E3F2FD;
          color: #1976D2;
          border: 1px solid #BBDEFB;
        `;
      default:
        return `
          background: #F3E5F5;
          color: #7B1FA2;
          border: 1px solid #E1BEE7;
        `;
    }
  }}
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #999;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #666;
  }

  &::after {
    content: '×';
    font-size: 16px;
    font-weight: bold;
  }
`;

const NotificationImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-bottom: 1px solid #f0f0f0;
`;

const NotificationFooter = styled.div`
  padding: 12px 20px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #f0f0f0;
`;

const NotificationTime = styled.div`
  font-size: 12px;
  color: #999;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ primary?: boolean }>`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props =>
    props.primary
      ? `
    background: #FFD338;
    color: #333;
    
    &:hover {
      background: #FFCC00;
    }
  `
      : `
    background: #F5F5F5;
    color: #666;
    
    &:hover {
      background: #E9E9E9;
    }
  `}
`;

const ProgressBar = styled.div<{ duration: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: #ffd338;
  animation: shrink ${props => props.duration}ms linear forwards;

  @keyframes shrink {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
`;

const InAppNotification: React.FC<InAppNotificationProps> = ({
  notification,
  onClose,
  onAction,
  autoClose = true,
  autoCloseDelay = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(autoCloseDelay);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoClose && notification.priority !== NotificationPriority.CRITICAL) {
      // 자동 닫기 타이머
      timerRef.current = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      // 진행률 업데이트
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 100));
      }, 100);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoClose, autoCloseDelay, notification.priority]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // 애니메이션 및 대기
  };

  const handleActionClick = (actionId: string) => {
    onAction?.(actionId);
    handleClose();
  };

  const handleMouseEnter = () => {
    // 마우스 호버 시 타이머 일시 정지
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    // 마우스 나가면 타이마 재시작
    if (autoClose && notification.priority !== NotificationPriority.CRITICAL && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        handleClose();
      }, timeLeft);

      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 100));
      }, 100);
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return '지금';
    if (minutes < 60) return `${minutes}분 전`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;

    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  };

  const getPriorityText = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.CRITICAL:
        return '긴급';
      case NotificationPriority.HIGH:
        return '중요';
      case NotificationPriority.NORMAL:
        return '일반';
      default:
        return '낮음';
    }
  };

  return (
    <NotificationContainer
      isVisible={isVisible}
      priority={notification.priority}
      notificationType={notification.type}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <NotificationCard
        priority={notification.priority}
        notificationType={notification.type}
        onClick={() => onAction?.('view')}
      >
        <CloseButton
          onClick={e => {
            e.stopPropagation();
            handleClose();
          }}
        />

        {notification.priority !== NotificationPriority.LOW && (
          <PriorityBadge priority={notification.priority}>
            {getPriorityText(notification.priority)}
          </PriorityBadge>
        )}

        {notification.image && (
          <NotificationImage
            src={notification.image}
            alt='Notification image'
            onError={e => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}

        <NotificationHeader>
          <NotificationIcon notificationType={notification.type} />
          <NotificationContent>
            <NotificationTitle>{notification.title}</NotificationTitle>
            <NotificationBody>{notification.body}</NotificationBody>
          </NotificationContent>
        </NotificationHeader>

        <NotificationFooter>
          <NotificationTime>{formatTime(notification.timestamp || Date.now())}</NotificationTime>

          {notification.actions && notification.actions.length > 0 && (
            <ActionButtons>
              {notification.actions.slice(0, 2).map(action => (
                <ActionButton
                  key={action.id}
                  primary={action.id === 'view' || action.id === 'confirm'}
                  onClick={e => {
                    e.stopPropagation();
                    handleActionClick(action.id);
                  }}
                >
                  {action.title}
                </ActionButton>
              ))}
            </ActionButtons>
          )}
        </NotificationFooter>

        {autoClose && notification.priority !== NotificationPriority.CRITICAL && timeLeft > 0 && (
          <ProgressBar duration={autoCloseDelay} />
        )}
      </NotificationCard>
    </NotificationContainer>
  );
};

export default InAppNotification;
