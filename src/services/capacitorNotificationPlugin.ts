/**
 * Capacitor Push Notification Plugin Integration
 * 
 * Capacitor를 통한 네이티브 플랫폼 푸시 알림 지원
 * - iOS/Android 호환성
 * - 네이티브 기능 통합
 * - 배터리 최적화
 * - 상태 동기화
 */

import { Capacitor } from '@capacitor/core';
import { 
  PushNotifications, 
  PushNotificationSchema,
  ActionPerformed,
  Token,
  PermissionStatus
} from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';
import { LocalNotifications } from '@capacitor/local-notifications';
import { 
  PushNotificationData, 
  NotificationPreferences,
  NotificationType,
  NotificationPriority
} from './pushNotificationService';

interface CapacitorNotificationOptions {
  enableBadge?: boolean;
  enableSound?: boolean;
  enableVibration?: boolean;
  enableAnalytics?: boolean;
  customSoundPath?: string;
}

class CapacitorNotificationPlugin {
  private isInitialized = false;
  private registrationToken: string | null = null;
  private deviceInfo: any = null;
  private options: CapacitorNotificationOptions;

  constructor(options: CapacitorNotificationOptions = {}) {
    this.options = {
      enableBadge: true,
      enableSound: true,
      enableVibration: true,
      enableAnalytics: true,
      ...options
    };
  }

  /**
   * 플러그인 초기화
   */
  async initialize(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      // 디바이스 정보 가져오기
      this.deviceInfo = await Device.getInfo();

      // 권한 요청
      const permission = await this.requestPermissions();
      if (permission.receive !== 'granted') {
        throw new Error('Push notification permission denied');
      }

      // 푸시 알림 등록
      await PushNotifications.register();

      // 이벤트 리스너 설정
      this.setupEventListeners();

      // 로컬 알림 초기화
      await this.initializeLocalNotifications();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('[CapacitorPlugin] Initialization failed:', error);
      return false;
    }
  }

  /**
   * 권한 요청
   */
  async requestPermissions(): Promise<PermissionStatus> {
    try {
      const permission = await PushNotifications.requestPermissions();
      return permission;
    } catch (error) {
      console.error('[CapacitorPlugin] Permission request failed:', error);
      throw error;
    }
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // 등록 성공
    PushNotifications.addListener('registration', (token: Token) => {
      this.registrationToken = token.value;
      this.handleRegistrationSuccess(token.value);
    });

    // 등록 실패
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('[CapacitorPlugin] Registration error:', error);
      this.handleRegistrationError(error);
    });

    // 알림 수신 (앱이 포귰그라운드에 있을 때)
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      this.handleNotificationReceived(notification);
    });

    // 알림 액션 수행
    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      this.handleNotificationAction(action);
    });
  }

  /**
   * 로컬 알림 초기화
   */
  private async initializeLocalNotifications(): Promise<void> {
    try {
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display === 'granted') {
      }
    } catch (error) {
      console.error('[CapacitorPlugin] Local notifications setup failed:', error);
    }
  }

  /**
   * 예약 로컬 알림 생성
   */
  async scheduleLocalNotification(
    notification: PushNotificationData,
    scheduleAt: Date
  ): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: parseInt(notification.id.replace(/\D/g, '')) || Date.now(),
            title: notification.title,
            body: notification.body,
            schedule: { at: scheduleAt },
            sound: this.options.enableSound ? 'default' : undefined,
            actionTypeId: notification.type,
            extra: {
              ...notification.data,
              originalNotification: notification
            },
            attachments: notification.image ? [
              {
                id: 'image',
                url: notification.image,
                options: {
                  iosUNNotificationAttachmentOptionsTypeHintKey: 'public.jpeg'
                }
              }
            ] : undefined
          }
        ]
      });
      
    } catch (error) {
      console.error('[CapacitorPlugin] Failed to schedule local notification:', error);
    }
  }

  /**
   * 로컬 알림 취소
   */
  async cancelLocalNotification(notificationId: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const id = parseInt(notificationId.replace(/\D/g, '')) || 0;
      await LocalNotifications.cancel({
        notifications: [{ id }]
      });
      
    } catch (error) {
      console.error('[CapacitorPlugin] Failed to cancel local notification:', error);
    }
  }

  /**
   * 뫬지 업데이트
   */
  async updateBadgeCount(count: number): Promise<void> {
    if (!Capacitor.isNativePlatform() || !this.options.enableBadge) return;

    try {
      // iOS에서만 작동
      if (this.deviceInfo?.platform === 'ios') {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: 999999, // 특수 ID
              title: '',
              body: '',
              schedule: { at: new Date(Date.now() + 100) }, // 직후 실행
              extra: { badgeOnly: true },
              sound: undefined
            }
          ]
        });
      }
      
    } catch (error) {
      console.error('[CapacitorPlugin] Failed to update badge count:', error);
    }
  }

  /**
   * 알림 채널 설정 (Android)
   */
  async createNotificationChannel(
    channelId: string,
    channelName: string,
    importance: 'high' | 'default' | 'low' = 'default'
  ): Promise<void> {
    if (!Capacitor.isNativePlatform() || this.deviceInfo?.platform !== 'android') return;

    try {
      // Android 알림 채널 생성
      // 실제 구현에서는 네이티브 코드에서 처리해야 함
        channelId,
        channelName,
        importance
      });
    } catch (error) {
      console.error('[CapacitorPlugin] Failed to create notification channel:', error);
    }
  }

  /**
   * 등록 성공 처리
   */
  private handleRegistrationSuccess(token: string): void {
    // 글로벌 이벤트 발송
    window.dispatchEvent(new CustomEvent('pushRegistrationSuccess', {
      detail: {
        token,
        platform: this.deviceInfo?.platform,
        deviceId: this.deviceInfo?.identifier
      }
    }));
  }

  /**
   * 등록 실패 처리
   */
  private handleRegistrationError(error: any): void {
    window.dispatchEvent(new CustomEvent('pushRegistrationError', {
      detail: { error }
    }));
  }

  /**
   * 알림 수신 처리
   */
  private handleNotificationReceived(notification: PushNotificationSchema): void {
    // 뱅킹 알림 형식으로 변환
    const bankingNotification: PushNotificationData = {
      id: notification.id || `received_${Date.now()}`,
      type: (notification.data?.type as NotificationType) || NotificationType.TRANSACTION,
      priority: (notification.data?.priority as NotificationPriority) || NotificationPriority.NORMAL,
      title: notification.title || '새로운 알림',
      body: notification.body || '',
      data: notification.data || {},
      timestamp: Date.now()
    };

    // 글로벌 이벤트 발송
    window.dispatchEvent(new CustomEvent('pushNotificationReceived', {
      detail: bankingNotification
    }));

    // 분석 데이터 기록
    if (this.options.enableAnalytics) {
      this.trackNotificationReceived(bankingNotification);
    }
  }

  /**
   * 알림 액션 처리
   */
  private handleNotificationAction(action: ActionPerformed): void {
    const { actionId, notification } = action;
    
    // 글로벌 이벤트 발송
    window.dispatchEvent(new CustomEvent('pushNotificationAction', {
      detail: {
        actionId,
        notification: notification.data,
        inputValue: action.inputValue // 텍스트 입력이 있는 경우
      }
    }));

    // 분석 데이터 기록
    if (this.options.enableAnalytics) {
      this.trackNotificationAction(notification.id || 'unknown', actionId);
    }
  }

  /**
   * 알림 수신 추적
   */
  private trackNotificationReceived(notification: PushNotificationData): void {
    const analytics = {
      notificationId: notification.id,
      type: notification.type,
      priority: notification.priority,
      receivedAt: Date.now(),
      platform: this.deviceInfo?.platform || 'unknown',
      deviceModel: this.deviceInfo?.model,
      osVersion: this.deviceInfo?.osVersion,
      appVersion: this.deviceInfo?.appVersion
    };

    // 로컬 저장
    const existingAnalytics = JSON.parse(
      localStorage.getItem('notification_analytics') || '[]'
    );
    existingAnalytics.push(analytics);
    localStorage.setItem('notification_analytics', JSON.stringify(existingAnalytics));

  }

  /**
   * 알림 액션 추적
   */
  private trackNotificationAction(notificationId: string, actionId: string): void {
    const analytics = {
      notificationId,
      actionId,
      actionTakenAt: Date.now(),
      platform: this.deviceInfo?.platform || 'unknown'
    };

    // 로컬 저장
    const existingActions = JSON.parse(
      localStorage.getItem('notification_actions') || '[]'
    );
    existingActions.push(analytics);
    localStorage.setItem('notification_actions', JSON.stringify(existingActions));

  }

  /**
   * 분석 데이터 조회
   */
  getAnalyticsData(): {
    notifications: any[];
    actions: any[];
  } {
    return {
      notifications: JSON.parse(
        localStorage.getItem('notification_analytics') || '[]'
      ),
      actions: JSON.parse(
        localStorage.getItem('notification_actions') || '[]'
      )
    };
  }

  /**
   * 분석 데이타 정리
   */
  clearAnalyticsData(): void {
    localStorage.removeItem('notification_analytics');
    localStorage.removeItem('notification_actions');
  }

  /**
   * 클리너업
   */
  async cleanup(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // 모든 리스너 제거
      await PushNotifications.removeAllListeners();
      await LocalNotifications.removeAllListeners();
      
      this.isInitialized = false;
      this.registrationToken = null;
      
    } catch (error) {
      console.error('[CapacitorPlugin] Cleanup failed:', error);
    }
  }

  /**
   * 상태 정보 반환
   */
  getStatus(): {
    isInitialized: boolean;
    registrationToken: string | null;
    deviceInfo: any;
    platform: string;
  } {
    return {
      isInitialized: this.isInitialized,
      registrationToken: this.registrationToken,
      deviceInfo: this.deviceInfo,
      platform: this.deviceInfo?.platform || 'unknown'
    };
  }

  /**
   * 테스트 알림 전송
   */
  async sendTestNotification(): Promise<void> {
    const testNotification: PushNotificationData = {
      id: `test_${Date.now()}`,
      type: NotificationType.TRANSACTION,
      priority: NotificationPriority.NORMAL,
      title: '테스트 알림',
      body: 'Capacitor 푸시 알림이 올바르게 작동하고 있습니다!',
      data: {
        testMode: true,
        platform: this.deviceInfo?.platform
      },
      timestamp: Date.now()
    };

    // 로컬 알림으로 테스트
    await this.scheduleLocalNotification(
      testNotification,
      new Date(Date.now() + 2000) // 2초 후
    );
  }
}

// 싱글톤 인스턴스
export const capacitorNotificationPlugin = new CapacitorNotificationPlugin();
export default CapacitorNotificationPlugin;
