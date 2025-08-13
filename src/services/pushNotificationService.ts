/**
 * KB StarBanking Push Notification Service
 * 
 * 금융 앱을 위한 포괄적인 푸시 알림 서비스
 * - VAPID 키 기반 웹 푸시
 * - 금융 데이터 암호화
 * - 크로스 플랫폼 지원
 * - 뱅킹 특화 알림 타입
 */

import { Capacitor } from '@capacitor/core';

// 푸시 알림 타입 정의
export enum NotificationType {
  TRANSACTION = 'transaction',
  SECURITY = 'security',
  BALANCE_ALERT = 'balance_alert',
  BILL_REMINDER = 'bill_reminder',
  PROMOTIONAL = 'promotional',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  LOGIN_ATTEMPT = 'login_attempt',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface PushNotificationData {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  data?: Record<string, any>;
  requiresAuth?: boolean;
  encrypted?: boolean;
  actions?: NotificationAction[];
  icon?: string;
  badge?: string;
  image?: string;
  sound?: string;
  vibrate?: number[];
  timestamp?: number;
  expiresAt?: number;
  geofence?: GeofenceData;
}

export interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
  requiresAuth?: boolean;
  destructive?: boolean;
}

export interface GeofenceData {
  latitude: number;
  longitude: number;
  radius: number; // meters
  action: 'enter' | 'exit';
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  platform: 'web' | 'android' | 'ios';
  deviceId: string;
  userId: string;
  preferences: NotificationPreferences;
}

export interface NotificationPreferences {
  enabled: boolean;
  types: {
    [key in NotificationType]: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;
  };
  sound: boolean;
  vibration: boolean;
  badge: boolean;
  preview: boolean; // Show content in notification
  frequency: 'all' | 'important' | 'critical';
}

class PushNotificationService {
  private vapidPublicKey: string;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private isInitialized = false;
  private encryptionKey: CryptoKey | null = null;

  constructor() {
    // VAPID 공개 키 (실제 환경에서는 환경변수로 관리)
    this.vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY || 
      'BIl-qDyKaWqY5D7Qw_0gGpIyUkTGFzJ8ZIWu2TQfCm3gGDzF5_6vRzLWJmXQpDcF';
  }

  /**
   * 푸시 알림 서비스 초기화
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // 암호화 키 생성
      await this.generateEncryptionKey();

      // 플랫폼별 초기화
      if (Capacitor.isNativePlatform()) {
        await this.initializeNative();
      } else {
        await this.initializeWeb();
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('[PushService] Initialization failed:', error);
      return false;
    }
  }

  /**
   * 웹 환경 초기화
   */
  private async initializeWeb(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    // 서비스 워커 등록
    this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
    
    // 서비스 워커 준비 대기
    await navigator.serviceWorker.ready;

  }

  /**
   * 네이티브 환경 초기화
   */
  private async initializeNative(): Promise<void> {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    
    // 권한 요청
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') {
      throw new Error('Push notification permission denied');
    }

    // 등록
    await PushNotifications.register();

    // 이벤트 리스너 설정
    this.setupNativeListeners();

  }

  /**
   * 네이티브 이벤트 리스너 설정
   */
  private async setupNativeListeners(): Promise<void> {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    // 등록 성공
    PushNotifications.addListener('registration', (token) => {
      this.handleRegistrationToken(token.value);
    });

    // 등록 오류
    PushNotifications.addListener('registrationError', (error) => {
      console.error('[PushService] Registration error:', error);
    });

    // 알림 수신
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      this.handleIncomingNotification(notification as any);
    });

    // 알림 클릭
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      this.handleNotificationAction(action as any);
    });
  }

  /**
   * 암호화 키 생성
   */
  private async generateEncryptionKey(): Promise<void> {
    try {
      this.encryptionKey = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        false, // extractable
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('[PushService] Failed to generate encryption key:', error);
    }
  }

  /**
   * 푸시 알림 권한 요청
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (Capacitor.isNativePlatform()) {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const permission = await PushNotifications.requestPermissions();
      return permission.receive === 'granted' ? 'granted' : 'denied';
    } else {
      return await Notification.requestPermission();
    }
  }

  /**
   * 푸시 구독 생성
   */
  async subscribe(userId: string, preferences: NotificationPreferences): Promise<PushSubscriptionData | null> {
    try {
      if (Capacitor.isNativePlatform()) {
        return await this.subscribeNative(userId, preferences);
      } else {
        return await this.subscribeWeb(userId, preferences);
      }
    } catch (error) {
      console.error('[PushService] Subscription failed:', error);
      return null;
    }
  }

  /**
   * 웹 푸시 구독
   */
  private async subscribeWeb(userId: string, preferences: NotificationPreferences): Promise<PushSubscriptionData | null> {
    if (!this.serviceWorkerRegistration) {
      throw new Error('Service worker not registered');
    }

    // VAPID 키를 Uint8Array로 변환
    const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);

    // 푸시 구독 생성
    this.subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });

    // 구독 데이터 생성
    const subscriptionData: PushSubscriptionData = {
      endpoint: this.subscription.endpoint,
      keys: {
        p256dh: this.arrayBufferToBase64(this.subscription.getKey('p256dh')!),
        auth: this.arrayBufferToBase64(this.subscription.getKey('auth')!)
      },
      platform: 'web',
      deviceId: await this.generateDeviceId(),
      userId,
      preferences
    };

    // 서버에 구독 정보 전송
    await this.sendSubscriptionToServer(subscriptionData);

    return subscriptionData;
  }

  /**
   * 네이티브 푸시 구독
   */
  private async subscribeNative(userId: string, preferences: NotificationPreferences): Promise<PushSubscriptionData | null> {
    // 네이티브 플랫폼에서는 이미 초기화 시 등록됨
    const deviceId = await this.generateDeviceId();
    
    const subscriptionData: PushSubscriptionData = {
      endpoint: '', // 네이티브에서는 토큰 사용
      keys: {
        p256dh: '',
        auth: ''
      },
      platform: Capacitor.getPlatform() as 'android' | 'ios',
      deviceId,
      userId,
      preferences
    };

    return subscriptionData;
  }

  /**
   * 등록 토큰 처리
   */
  private async handleRegistrationToken(token: string): Promise<void> {
    // 토큰을 서버에 전송하여 저장
    // 실제 구현에서는 API 호출
  }

  /**
   * 푸시 구독 해제
   */
  async unsubscribe(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        const { PushNotifications } = await import('@capacitor/push-notifications');
        await PushNotifications.removeAllListeners();
      } else if (this.subscription) {
        await this.subscription.unsubscribe();
        this.subscription = null;
      }

      // 서버에서 구독 정보 제거
      await this.removeSubscriptionFromServer();

      return true;
    } catch (error) {
      console.error('[PushService] Unsubscribe failed:', error);
      return false;
    }
  }

  /**
   * 알림 전송 (서버 사이드에서 사용)
   */
  async sendNotification(notification: PushNotificationData, targetUsers: string[]): Promise<boolean> {
    try {
      // 민감한 데이터 암호화
      if (notification.encrypted && notification.data) {
        notification.data = await this.encryptData(notification.data);
      }

      // 서버 API 호출
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          notification,
          targetUsers,
          timestamp: Date.now()
        })
      });

      return response.ok;
    } catch (error) {
      console.error('[PushService] Send notification failed:', error);
      return false;
    }
  }

  /**
   * 들어오는 알림 처리
   */
  private async handleIncomingNotification(notification: any): Promise<void> {

    // 암호화된 데이터 복호화
    if (notification.data?.encrypted) {
      notification.data = await this.decryptData(notification.data);
    }

    // 생체 인증이 필요한 알림인지 확인
    if (notification.data?.requiresAuth) {
      const authenticated = await this.requestBiometricAuth();
      if (!authenticated) {
        // 인증 실패 시 제한된 정보만 표시
        notification.body = '민감한 알림이 도착했습니다. 앱에서 확인하세요.';
        notification.data = {};
      }
    }

    // 알림 표시 (웹에서만 필요, 네이티브는 자동 표시)
    if (!Capacitor.isNativePlatform()) {
      await this.showWebNotification(notification);
    }

    // 앱에 알림 전달
    this.notifyApp(notification);
  }

  /**
   * 웹 알림 표시
   */
  private async showWebNotification(notification: any): Promise<void> {
    if (!this.serviceWorkerRegistration) return;

    const options: NotificationOptions = {
      body: notification.body,
      icon: notification.icon || '/assets/images/kb_logo.png',
      badge: notification.badge || '/assets/images/kb_logo.png',
      image: notification.image,
      tag: notification.tag || 'kb-banking',
      requireInteraction: notification.priority === NotificationPriority.CRITICAL,
      silent: false,
      vibrate: notification.vibrate || [200, 100, 200],
      data: notification.data,
      actions: notification.actions?.map((action: NotificationAction) => ({
        action: action.id,
        title: action.title,
        icon: action.icon
      })) || []
    };

    await this.serviceWorkerRegistration.showNotification(notification.title, options);
  }

  /**
   * 알림 액션 처리
   */
  private async handleNotificationAction(action: any): Promise<void> {

    const { actionId, notification } = action;
    const notificationData = notification.data || {};

    // 생체 인증이 필요한 액션인지 확인
    if (notificationData.requiresAuth) {
      const authenticated = await this.requestBiometricAuth();
      if (!authenticated) {
        return;
      }
    }

    // 액션별 처리
    switch (actionId) {
      case 'view_transaction':
        this.navigateToTransaction(notificationData.transactionId);
        break;
      case 'quick_transfer':
        this.navigateToTransfer();
        break;
      case 'dismiss':
        // 알림 닫기만
        break;
      default:
        // 기본 앱 열기
        this.openApp();
    }

    // 액션 통계 기록
    this.trackNotificationAction(actionId, notificationData.type);
  }

  /**
   * 생체 인증 요청
   */
  private async requestBiometricAuth(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        const { BiometricAuth } = await import('@capacitor-community/biometric-auth');
        const result = await BiometricAuth.authenticate({
          reason: '민감한 알림을 확인하려면 인증이 필요합니다.',
          title: '생체 인증',
          subtitle: 'KB스타뱅킹',
          description: '지문 또는 얼굴 인식으로 인증하세요.'
        });
        return result.isAuthenticated;
      } else {
        // 웹에서는 Web Authentication API 사용
        if ('credentials' in navigator) {
          try {
            await navigator.credentials.get({
              publicKey: {
                challenge: new Uint8Array(32),
                timeout: 60000,
                userVerification: 'required'
              }
            });
            return true;
          } catch {
            return false;
          }
        }
        return true; // 웹에서는 일단 통과
      }
    } catch (error) {
      console.error('[PushService] Biometric auth failed:', error);
      return false;
    }
  }

  /**
   * 데이터 암호화
   */
  private async encryptData(data: Record<string, any>): Promise<Record<string, any>> {
    if (!this.encryptionKey) return data;

    try {
      const jsonString = JSON.stringify(data);
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(jsonString);
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey,
        dataBuffer
      );

      return {
        encrypted: true,
        data: this.arrayBufferToBase64(encryptedBuffer),
        iv: this.arrayBufferToBase64(iv)
      };
    } catch (error) {
      console.error('[PushService] Encryption failed:', error);
      return data;
    }
  }

  /**
   * 데이터 복호화
   */
  private async decryptData(encryptedData: Record<string, any>): Promise<Record<string, any>> {
    if (!this.encryptionKey || !encryptedData.encrypted) return encryptedData;

    try {
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedData.data);
      const iv = this.base64ToArrayBuffer(encryptedData.iv);

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey,
        encryptedBuffer
      );

      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decryptedBuffer);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('[PushService] Decryption failed:', error);
      return {};
    }
  }

  /**
   * 앱에 알림 전달
   */
  private notifyApp(notification: any): void {
    // CustomEvent를 통해 앱에 알림 전달
    window.dispatchEvent(new CustomEvent('pushNotificationReceived', {
      detail: notification
    }));
  }

  /**
   * 네비게이션 처리
   */
  private navigateToTransaction(transactionId: string): void {
    window.dispatchEvent(new CustomEvent('navigateToTransaction', {
      detail: { transactionId }
    }));
  }

  private navigateToTransfer(): void {
    window.dispatchEvent(new CustomEvent('navigateToTransfer'));
  }

  private openApp(): void {
    if (Capacitor.isNativePlatform()) {
      // 네이티브에서는 앱이 자동으로 포그라운드로 옴
    } else {
      window.focus();
    }
  }

  /**
   * 알림 액션 통계 기록
   */
  private trackNotificationAction(actionId: string, notificationType: string): void {
    // 분석을 위한 이벤트 기록
    // 실제 구현에서는 분석 서비스로 전송
  }

  /**
   * 유틸리티 메서드들
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const buffer = new ArrayBuffer(binaryString.length);
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return buffer;
  }

  private async generateDeviceId(): Promise<string> {
    // 디바이스 고유 ID 생성
    if (Capacitor.isNativePlatform()) {
      const { Device } = await import('@capacitor/device');
      const info = await Device.getId();
      return info.identifier;
    } else {
      // 웹에서는 브라우저 기반 ID 생성
      return 'web-' + Math.random().toString(36).substr(2, 9);
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscriptionData): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('[PushService] Failed to send subscription to server:', error);
    }
  }

  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      await fetch('/api/push/unsubscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
    } catch (error) {
      console.error('[PushService] Failed to remove subscription from server:', error);
    }
  }

  private getAuthToken(): string {
    // 실제 구현에서는 인증 토큰 반환
    return localStorage.getItem('auth_token') || '';
  }

  /**
   * 푸시 알림 지원 여부 확인
   */
  static isSupported(): boolean {
    if (Capacitor.isNativePlatform()) {
      return true; // 네이티브는 항상 지원
    }
    
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window;
  }

  /**
   * 현재 권한 상태 확인
   */
  static getPermissionStatus(): NotificationPermission {
    if (Capacitor.isNativePlatform()) {
      // 네이티브에서는 별도 확인 필요
      return 'default';
    }
    
    return Notification.permission;
  }
}

// 싱글톤 인스턴스
export const pushNotificationService = new PushNotificationService();
export default PushNotificationService;
