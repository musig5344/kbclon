/**
 * Notification Provider
 * 
 * 전체 앱에서 알림을 관리하는 컨텍스트 프로바이더
 * - 알림 상태 관리
 * - 인앱 알림 표시
 * - 알림 대기열 관리
 * - 알림 이벤트 처리
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

import { 
  pushNotificationService, 
  PushNotificationData, 
  NotificationPreferences,
  NotificationType
} from '../../services/pushNotificationService';

import InAppNotification from './InAppNotification';
import NotificationPermissionModal from './NotificationPermissionModal';

interface NotificationContextValue {
  notifications: PushNotificationData[];
  unreadCount: number;
  isPermissionGranted: boolean;
  preferences: NotificationPreferences | null;
  showNotification: (notification: PushNotificationData) => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  requestPermission: () => Promise<void>;
  updatePreferences: (preferences: NotificationPreferences) => void;
  subscribe: (userId: string) => Promise<boolean>;
  unsubscribe: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
  userId?: string;
  maxNotifications?: number;
}

interface StoredNotification extends PushNotificationData {
  isRead: boolean;
  receivedAt: number;
}

const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  userId,
  maxNotifications = 10
}) => {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<PushNotificationData | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 초기화
  useEffect(() => {
    initializeNotifications();
  }, [userId]);

  // 알림 이벤트 리스너
  useEffect(() => {
    const handlePushNotification = (event: CustomEvent) => {
      const notification = event.detail as PushNotificationData;
      handleIncomingNotification(notification);
    };

    const handleNavigateToTransaction = (event: CustomEvent) => {
      const { transactionId } = event.detail;
      // 라우터로 네비게이션 처리
      window.location.href = `/transactions/${transactionId}`;
    };

    const handleNavigateToTransfer = () => {
      window.location.href = '/transfer';
    };

    window.addEventListener('pushNotificationReceived', handlePushNotification as EventListener);
    window.addEventListener('navigateToTransaction', handleNavigateToTransaction as EventListener);
    window.addEventListener('navigateToTransfer', handleNavigateToTransfer as EventListener);

    return () => {
      window.removeEventListener('pushNotificationReceived', handlePushNotification as EventListener);
      window.removeEventListener('navigateToTransaction', handleNavigateToTransaction as EventListener);
      window.removeEventListener('navigateToTransfer', handleNavigateToTransfer as EventListener);
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      // 푸시 알림 서비스 초기화
      const initialized = await pushNotificationService.initialize();
      
      if (initialized) {
        // 권한 상태 확인
        const permissionStatus = pushNotificationService.constructor.getPermissionStatus();
        setIsPermissionGranted(permissionStatus === 'granted');
        
        // 저장된 알림 로드
        loadStoredNotifications();
        
        // 저장된 설정 로드
        loadStoredPreferences();
        
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  const loadStoredNotifications = () => {
    if (!userId) return;
    
    try {
      const stored = localStorage.getItem(`notifications_${userId}`);
      if (stored) {
        const parsedNotifications: StoredNotification[] = JSON.parse(stored);
        // 오래된 알림 제거 (7일 이상)
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const validNotifications = parsedNotifications.filter(
          notification => notification.receivedAt > weekAgo
        );
        setNotifications(validNotifications);
      }
    } catch (error) {
      console.error('Failed to load stored notifications:', error);
    }
  };

  const loadStoredPreferences = () => {
    if (!userId) return;
    
    try {
      const stored = localStorage.getItem(`notification_preferences_${userId}`);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load stored preferences:', error);
    }
  };

  const saveNotifications = useCallback((notifications: StoredNotification[]) => {
    if (!userId) return;
    
    try {
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }, [userId]);

  const savePreferences = useCallback((preferences: NotificationPreferences) => {
    if (!userId) return;
    
    try {
      localStorage.setItem(`notification_preferences_${userId}`, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }, [userId]);

  const shouldShowNotification = useCallback((notification: PushNotificationData) => {
    if (!preferences) return true;
    
    // 전체 알림이 비활성화된 경우
    if (!preferences.enabled) return false;
    
    // 해당 알림 유형이 비활성화된 경우
    if (!preferences.types[notification.type]) return false;
    
    // 빈도 설정 확인
    if (preferences.frequency === 'critical' && notification.priority !== 'critical') return false;
    if (preferences.frequency === 'important' && 
        notification.priority !== 'critical' && 
        notification.priority !== 'high') return false;
    
    // 조용한 시간 확인
    if (preferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const startTime = preferences.quietHours.start.split(':').map(Number);
      const endTime = preferences.quietHours.end.split(':').map(Number);
      const startMinutes = startTime[0] * 60 + startTime[1];
      const endMinutes = endTime[0] * 60 + endTime[1];
      
      const isQuietTime = startMinutes <= endMinutes
        ? currentTime >= startMinutes && currentTime <= endMinutes
        : currentTime >= startMinutes || currentTime <= endMinutes;
      
      // 조용한 시간에는 중요한 알림만 표시
      if (isQuietTime && notification.priority !== 'critical' && notification.priority !== 'high') {
        return false;
      }
    }
    
    return true;
  }, [preferences]);

  const handleIncomingNotification = useCallback((notification: PushNotificationData) => {
    if (!shouldShowNotification(notification)) return;
    
    const storedNotification: StoredNotification = {
      ...notification,
      isRead: false,
      receivedAt: Date.now()
    };
    
    // 알림 목록에 추가
    setNotifications(prev => {
      const updated = [storedNotification, ...prev].slice(0, maxNotifications);
      saveNotifications(updated);
      return updated;
    });
    
    // 인앱 알림 표시
    setCurrentNotification(notification);
  }, [shouldShowNotification, maxNotifications, saveNotifications]);

  const showNotification = useCallback((notification: PushNotificationData) => {
    handleIncomingNotification(notification);
  }, [handleIncomingNotification]);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== notificationId);
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, [saveNotifications]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  const requestPermission = useCallback(async () => {
    if (!pushNotificationService.constructor.isSupported()) {
      alert('이 브라우저는 푸시 알림을 지원하지 않습니다.');
      return;
    }
    
    setShowPermissionModal(true);
  }, []);

  const handlePermissionGranted = useCallback(async (newPreferences: NotificationPreferences) => {
    setIsPermissionGranted(true);
    setPreferences(newPreferences);
    savePreferences(newPreferences);
    setShowPermissionModal(false);
    
    // 구독 설정
    if (userId) {
      await subscribe(userId);
    }
  }, [userId, savePreferences]);

  const handlePermissionDenied = useCallback(() => {
    setIsPermissionGranted(false);
    setShowPermissionModal(false);
  }, []);

  const updatePreferences = useCallback((newPreferences: NotificationPreferences) => {
    setPreferences(newPreferences);
    savePreferences(newPreferences);
  }, [savePreferences]);

  const subscribe = useCallback(async (userId: string): Promise<boolean> => {
    if (!isPermissionGranted || !preferences) return false;
    
    try {
      const subscription = await pushNotificationService.subscribe(userId, preferences);
      return subscription !== null;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }, [isPermissionGranted, preferences]);

  const unsubscribe = useCallback(async () => {
    try {
      await pushNotificationService.unsubscribe();
      setIsPermissionGranted(false);
      setPreferences(null);
      if (userId) {
        localStorage.removeItem(`notification_preferences_${userId}`);
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
    }
  }, [userId]);

  const handleNotificationClose = useCallback(() => {
    setCurrentNotification(null);
  }, []);

  const handleNotificationAction = useCallback((actionId: string) => {
    if (!currentNotification) return;
    
    // 알림을 읽음으로 표시
    markAsRead(currentNotification.id);
    
    // 액션별 처리
    switch (actionId) {
      case 'view':
        if (currentNotification.data?.url) {
          window.location.href = currentNotification.data.url;
        }
        break;
      case 'view_transaction':
        if (currentNotification.data?.transactionId) {
          window.location.href = `/transactions/${currentNotification.data.transactionId}`;
        }
        break;
      case 'view_account':
        if (currentNotification.data?.accountNumber) {
          window.location.href = `/accounts/${currentNotification.data.accountNumber}`;
        }
        break;
      case 'quick_transfer':
        window.location.href = '/transfer';
        break;
      case 'pay_bill':
        if (currentNotification.data?.billId) {
          window.location.href = `/bills/${currentNotification.data.billId}/pay`;
        }
        break;
      default:
        // 기타 액션 처리
    }
    
    setCurrentNotification(null);
  }, [currentNotification, markAsRead]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const contextValue: NotificationContextValue = {
    notifications: notifications.map(({ isRead, receivedAt, ...notification }) => notification),
    unreadCount,
    isPermissionGranted,
    preferences,
    showNotification,
    removeNotification,
    clearAllNotifications,
    markAsRead,
    markAllAsRead,
    requestPermission,
    updatePreferences,
    subscribe,
    unsubscribe
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* 인앱 알림 표시 */}
      {currentNotification && (
        <InAppNotification
          notification={currentNotification}
          onClose={handleNotificationClose}
          onAction={handleNotificationAction}
        />
      )}
      
      {/* 권한 요청 모달 */}
      {showPermissionModal && (
        <NotificationPermissionModal
          isOpen={showPermissionModal}
          onClose={() => setShowPermissionModal(false)}
          onPermissionGranted={handlePermissionGranted}
          onPermissionDenied={handlePermissionDenied}
        />
      )}
    </NotificationContext.Provider>
  );
};

// 컨텍스트 훅
 export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;
