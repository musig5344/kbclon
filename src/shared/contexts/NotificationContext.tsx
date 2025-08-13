/**
 * KB 스타뱅킹 통합 알림 시스템
 * - Android WebView 최적화
 * - 토스트, 스낵바, 다이얼로그 통합 관리
 * - 백엔드 API 에러 처리 연동
 * - 네이티브 앱 느낌의 사용자 피드백
 */

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

import styled from 'styled-components';

import {
  androidOptimizedButton,
  androidOptimizedAnimation,
} from '../../styles/android-webview-optimizations';
import { KBDesignSystem } from '../../styles/tokens/kb-design-system';

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number; // 0이면 자동 사라지지 않음
  actions?: NotificationAction[];
  persistent?: boolean; // true면 사용자가 직접 닫아야 함
  androidOptimized?: boolean;
  showProgress?: boolean;
  onDismiss?: () => void;
  timestamp: number;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  type?: 'primary' | 'secondary' | 'danger';
}

type NotificationState = {
  notifications: NotificationItem[];
  maxVisible: number;
};

type NotificationAction_Type =
  | { type: 'ADD_NOTIFICATION'; notification: NotificationItem }
  | { type: 'REMOVE_NOTIFICATION'; id: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_MAX_VISIBLE'; count: number };

interface NotificationContextType {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;

  // 편의 메서드들 (백엔드 API 연동용)
  showSuccess: (message: string, options?: Partial<NotificationItem>) => string;
  showError: (message: string, options?: Partial<NotificationItem>) => string;
  showWarning: (message: string, options?: Partial<NotificationItem>) => string;
  showInfo: (message: string, options?: Partial<NotificationItem>) => string;

  // API 에러 처리 전용
  showApiError: (error: any, context?: string) => string;
  showNetworkError: (retryCallback?: () => void) => string;
  showOfflineNotification: () => string;
}

// Android WebView 최적화된 기본 설정
const DEFAULT_DURATIONS = {
  success: 3000,
  info: 4000,
  warning: 5000,
  error: 6000,
};

const ANDROID_OPTIMIZED_DURATIONS = {
  success: 2500, // Android에서 더 빠르게
  info: 3500,
  warning: 4500,
  error: 5500,
};

// 알림 컨테이너 스타일 (Android WebView 최적화)
const NotificationContainer = styled.div`
  position: fixed;
  top: env(safe-area-inset-top, 20px);
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 90vw;
  width: 400px;
  pointer-events: none;

  /* Android WebView 최적화 */
  transform: translateZ(0);
  will-change: transform;

  @media (max-width: 480px) {
    top: env(safe-area-inset-top, 16px);
    right: 8px;
    left: 8px;
    width: auto;
    max-width: none;
  }
`;

const NotificationCard = styled.div<{
  $type: NotificationItem['type'];
  $androidOptimized?: boolean;
  $isExiting?: boolean;
}>`
  ${androidOptimizedAnimation}

  background: ${KBDesignSystem.colors.background.white};
  border-radius: ${KBDesignSystem.borderRadius.lg};
  box-shadow: ${KBDesignSystem.shadows.xl};
  padding: 16px;
  pointer-events: auto;
  position: relative;
  overflow: hidden;

  /* 타입별 색상 */
  border-left: 4px solid
    ${props => {
      switch (props.$type) {
        case 'success':
          return KBDesignSystem.colors.status.success;
        case 'error':
          return KBDesignSystem.colors.status.error;
        case 'warning':
          return KBDesignSystem.colors.status.warning;
        case 'info':
          return KBDesignSystem.colors.primary.yellow;
        default:
          return KBDesignSystem.colors.border.medium;
      }
    }};

  /* Android WebView 터치 최적화 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;

  /* 애니메이션 */
  animation: ${props => (props.$isExiting ? 'slideOut' : 'slideIn')}
    ${props => (props.$androidOptimized ? '200ms' : '300ms')} cubic-bezier(0.25, 0.8, 0.25, 1);

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  /* 호버 효과 (Android에서는 비활성화) */
  ${props =>
    !props.$androidOptimized &&
    `
    &:hover {
      transform: translateX(-4px);
      box-shadow: ${KBDesignSystem.shadows.xxl};
    }
  `}
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
`;

const NotificationIcon = styled.div<{ $type: NotificationItem['type'] }>`
  width: 24px;
  height: 24px;
  border-radius: ${KBDesignSystem.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;

  background: ${props => {
    switch (props.$type) {
      case 'success':
        return KBDesignSystem.colors.status.success;
      case 'error':
        return KBDesignSystem.colors.status.error;
      case 'warning':
        return KBDesignSystem.colors.status.warning;
      case 'info':
        return KBDesignSystem.colors.primary.yellow;
      default:
        return KBDesignSystem.colors.border.medium;
    }
  }};

  color: ${KBDesignSystem.colors.text.inverse};

  &::after {
    content: '${props => {
      switch (props.$type) {
        case 'success':
          return '✓';
        case 'error':
          return '✕';
        case 'warning':
          return '!';
        case 'info':
          return 'i';
        default:
          return '•';
      }
    }}';
  }
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h4`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.md};
  font-weight: ${KBDesignSystem.typography.fontWeight.semibold};
  color: ${KBDesignSystem.colors.text.primary};
  margin: 0 0 4px 0;
  line-height: 1.3;
`;

const NotificationMessage = styled.p`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.sm};
  font-weight: ${KBDesignSystem.typography.fontWeight.regular};
  color: ${KBDesignSystem.colors.text.secondary};
  margin: 0;
  line-height: 1.4;
  word-break: keep-all;
`;

const NotificationActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  justify-content: flex-end;
`;

const NotificationActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  ${androidOptimizedButton}

  padding: 6px 12px;
  border-radius: ${KBDesignSystem.borderRadius.sm};
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.xs};
  font-weight: ${KBDesignSystem.typography.fontWeight.medium};
  border: none;
  cursor: pointer;
  transition: all 150ms ease;

  background: ${props => {
    switch (props.$variant) {
      case 'primary':
        return KBDesignSystem.colors.primary.yellow;
      case 'danger':
        return KBDesignSystem.colors.status.error;
      default:
        return KBDesignSystem.colors.background.gray200;
    }
  }};

  color: ${props => {
    switch (props.$variant) {
      case 'primary':
        return KBDesignSystem.colors.text.primary;
      case 'danger':
        return KBDesignSystem.colors.text.inverse;
      default:
        return KBDesignSystem.colors.text.secondary;
    }
  }};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CloseButton = styled.button`
  ${androidOptimizedButton}

  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: ${KBDesignSystem.colors.text.tertiary};
  font-size: 16px;
  line-height: 1;
  border-radius: ${KBDesignSystem.borderRadius.sm};

  &:hover {
    background: ${KBDesignSystem.colors.background.gray200};
    color: ${KBDesignSystem.colors.text.primary};
  }
`;

const ProgressBar = styled.div<{ $progress: number; $type: NotificationItem['type'] }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: ${props => props.$progress}%;
  transition: width 100ms linear;

  background: ${props => {
    switch (props.$type) {
      case 'success':
        return KBDesignSystem.colors.status.success;
      case 'error':
        return KBDesignSystem.colors.status.error;
      case 'warning':
        return KBDesignSystem.colors.status.warning;
      case 'info':
        return KBDesignSystem.colors.primary.yellow;
      default:
        return KBDesignSystem.colors.border.medium;
    }
  }};
`;

// 리듀서
const notificationReducer = (
  state: NotificationState,
  action: NotificationAction_Type
): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.notification, ...state.notifications].slice(0, state.maxVisible),
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.id),
      };

    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
      };

    case 'SET_MAX_VISIBLE':
      return {
        ...state,
        maxVisible: action.count,
        notifications: state.notifications.slice(0, action.count),
      };

    default:
      return state;
  }
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isAndroid = /Android/i.test(navigator.userAgent);

  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: [],
    maxVisible: isAndroid ? 3 : 5, // Android에서 메모리 효율성
  });

  // 자동 제거 관리
  useEffect(() => {
    const timers = new Map<string, NodeJS.Timeout>();

    state.notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0 && !notification.persistent) {
        if (!timers.has(notification.id)) {
          const timer = setTimeout(() => {
            removeNotification(notification.id);
          }, notification.duration);
          timers.set(notification.id, timer);
        }
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();
    };
  }, [state.notifications]);

  const generateId = (): string => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const addNotification = (notification: Omit<NotificationItem, 'id' | 'timestamp'>): string => {
    const id = generateId();
    const fullNotification: NotificationItem = {
      ...notification,
      id,
      timestamp: Date.now(),
      androidOptimized: isAndroid,
      duration:
        notification.duration ??
        (isAndroid ? ANDROID_OPTIMIZED_DURATIONS : DEFAULT_DURATIONS)[notification.type],
    };

    dispatch({ type: 'ADD_NOTIFICATION', notification: fullNotification });
    return id;
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', id });
  };

  const clearAllNotifications = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  // 편의 메서드들
  const showSuccess = (message: string, options: Partial<NotificationItem> = {}): string => {
    return addNotification({
      type: 'success',
      message,
      title: '성공',
      ...options,
    });
  };

  const showError = (message: string, options: Partial<NotificationItem> = {}): string => {
    return addNotification({
      type: 'error',
      message,
      title: '오류',
      persistent: true, // 에러는 사용자가 직접 닫도록
      ...options,
    });
  };

  const showWarning = (message: string, options: Partial<NotificationItem> = {}): string => {
    return addNotification({
      type: 'warning',
      message,
      title: '주의',
      ...options,
    });
  };

  const showInfo = (message: string, options: Partial<NotificationItem> = {}): string => {
    return addNotification({
      type: 'info',
      message,
      title: '안내',
      ...options,
    });
  };

  // API 에러 처리 전용
  const showApiError = (error: any, context?: string): string => {
    let message = '알 수 없는 오류가 발생했습니다.';
    let title = '오류';

    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 401:
          title = '인증 오류';
          message = '로그인이 필요합니다.';
          break;
        case 403:
          title = '권한 오류';
          message = '접근 권한이 없습니다.';
          break;
        case 404:
          title = '데이터 오류';
          message = '요청한 정보를 찾을 수 없습니다.';
          break;
        case 429:
          title = '요청 제한';
          message = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          title = '서버 오류';
          message = '서버에 일시적인 문제가 발생했습니다.';
          break;
        default:
          message = error.response.data?.message || error.message || message;
      }
    } else if (error.message) {
      message = error.message;
    }

    if (context) {
      title = `${context} ${title}`;
    }

    return showError(message, { title });
  };

  const showNetworkError = (retryCallback?: () => void): string => {
    const actions: NotificationAction[] = retryCallback
      ? [
          {
            label: '다시 시도',
            action: retryCallback,
            type: 'primary',
          },
        ]
      : [];

    return showError('네트워크 연결을 확인해주세요.', {
      title: '연결 오류',
      actions,
    });
  };

  const showOfflineNotification = (): string => {
    return showWarning('인터넷 연결이 끊어졌습니다. 연결을 확인해주세요.', {
      title: '오프라인',
      persistent: true,
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications: state.notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showApiError,
        showNetworkError,
        showOfflineNotification,
      }}
    >
      {children}

      {/* 알림 렌더링 */}
      <NotificationContainer>
        {state.notifications.map(notification => (
          <NotificationCard
            key={notification.id}
            $type={notification.type}
            $androidOptimized={notification.androidOptimized}
          >
            <NotificationHeader>
              <NotificationIcon $type={notification.type} />
              <NotificationContent>
                {notification.title && <NotificationTitle>{notification.title}</NotificationTitle>}
                <NotificationMessage>{notification.message}</NotificationMessage>
              </NotificationContent>
              <CloseButton
                onClick={() => {
                  notification.onDismiss?.();
                  removeNotification(notification.id);
                }}
              >
                ×
              </CloseButton>
            </NotificationHeader>

            {notification.actions && notification.actions.length > 0 && (
              <NotificationActions>
                {notification.actions.map((action, index) => (
                  <NotificationActionButton
                    key={index}
                    $variant={action.type}
                    onClick={() => {
                      action.action();
                      removeNotification(notification.id);
                    }}
                  >
                    {action.label}
                  </NotificationActionButton>
                ))}
              </NotificationActions>
            )}

            {notification.showProgress && notification.duration && notification.duration > 0 && (
              <ProgressBar
                $progress={
                  100 - ((Date.now() - notification.timestamp) / notification.duration) * 100
                }
                $type={notification.type}
              />
            )}
          </NotificationCard>
        ))}
      </NotificationContainer>
    </NotificationContext.Provider>
  );
};

// Hook
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
