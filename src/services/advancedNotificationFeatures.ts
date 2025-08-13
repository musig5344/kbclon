/**
 * Advanced Notification Features
 *
 * 고급 알림 기능들
 * - 예약 알림 (Scheduled Notifications)
 * - 위치 기반 알림 (Geofencing)
 * - 리치 알림 (Rich Notifications)
 * - 알림 분석 및 추적
 */

import {
  PushNotificationData,
  NotificationType,
  NotificationPriority,
  GeofenceData,
} from './pushNotificationService';

// 예약 알림 데이터
interface ScheduledNotification {
  id: string;
  notification: PushNotificationData;
  scheduleTime: number; // timestamp
  repeat?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: number;
  };
  conditions?: {
    accountBalance?: {
      accountId: string;
      operator: 'less_than' | 'greater_than' | 'equals';
      amount: number;
    };
    transactionCount?: {
      accountId: string;
      timeframe: '1h' | '24h' | '7d' | '30d';
      operator: 'less_than' | 'greater_than' | 'equals';
      count: number;
    };
  };
  isActive: boolean;
  createdAt: number;
}

// 지오펜스 알림 데이터
interface GeofenceNotification {
  id: string;
  notification: PushNotificationData;
  geofence: GeofenceData;
  triggers: {
    onEnter: boolean;
    onExit: boolean;
    onDwell?: {
      enabled: boolean;
      duration: number; // minutes
    };
  };
  conditions?: {
    timeRange?: {
      start: string; // HH:mm
      end: string;
    };
    weekdays?: number[]; // 0-6 (Sunday-Saturday)
    accountTypes?: string[];
  };
  isActive: boolean;
  createdAt: number;
}

// 알림 분석 데이터
interface NotificationAnalytics {
  notificationId: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  sentAt: number;
  deliveredAt?: number;
  readAt?: number;
  actionTaken?: {
    actionId: string;
    timestamp: number;
  };
  dismissed?: {
    method: 'auto' | 'manual' | 'action';
    timestamp: number;
  };
  platform: 'web' | 'android' | 'ios';
  deviceInfo?: {
    userAgent?: string;
    screenSize?: string;
    timezone?: string;
  };
}

class AdvancedNotificationService {
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private geofenceNotifications: Map<string, GeofenceNotification> = new Map();
  private analytics: Map<string, NotificationAnalytics> = new Map();
  private watchId: number | null = null;
  private currentPosition: GeolocationPosition | null = null;

  constructor() {
    this.loadStoredData();
    this.startGeolocationTracking();
    this.startScheduleChecker();
  }

  /**
   * 예약 알림 생성
   */
  async scheduleNotification(
    notification: PushNotificationData,
    scheduleTime: Date,
    options?: {
      repeat?: ScheduledNotification['repeat'];
      conditions?: ScheduledNotification['conditions'];
    }
  ): Promise<string> {
    const scheduledNotification: ScheduledNotification = {
      id: `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notification,
      scheduleTime: scheduleTime.getTime(),
      repeat: options?.repeat,
      conditions: options?.conditions,
      isActive: true,
      createdAt: Date.now(),
    };

    this.scheduledNotifications.set(scheduledNotification.id, scheduledNotification);
    this.saveStoredData();

    return scheduledNotification.id;
  }

  /**
   * 지오펜스 알림 생성
   */
  async createGeofenceNotification(
    notification: PushNotificationData,
    geofence: GeofenceData,
    triggers: GeofenceNotification['triggers'],
    conditions?: GeofenceNotification['conditions']
  ): Promise<string> {
    const geofenceNotification: GeofenceNotification = {
      id: `geofence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notification,
      geofence,
      triggers,
      conditions,
      isActive: true,
      createdAt: Date.now(),
    };

    this.geofenceNotifications.set(geofenceNotification.id, geofenceNotification);
    this.saveStoredData();

    return geofenceNotification.id;
  }

  /**
   * 리치 알림 생성 (이미지, 버튼, 인터렉션 요소 포함)
   */
  createRichNotification(options: {
    title: string;
    body: string;
    imageUrl?: string;
    actions?: Array<{
      id: string;
      title: string;
      icon?: string;
      input?: boolean; // 텍스트 입력 가능
    }>;
    category?: string;
    sound?: string;
    badge?: number;
    data?: Record<string, any>;
  }): PushNotificationData {
    return {
      id: `rich_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: NotificationType.TRANSACTION, // 기본값
      priority: NotificationPriority.NORMAL,
      title: options.title,
      body: options.body,
      image: options.imageUrl,
      data: options.data || {},
      actions: options.actions?.map(action => ({
        id: action.id,
        title: action.title,
        icon: action.icon,
      })),
      sound: options.sound,
      badge: options.badge?.toString(),
      timestamp: Date.now(),
    };
  }

  /**
   * 예약된 알림 삭제
   */
  cancelScheduledNotification(id: string): boolean {
    const success = this.scheduledNotifications.delete(id);
    if (success) {
      this.saveStoredData();
    }
    return success;
  }

  /**
   * 지오펜스 알림 삭제
   */
  removeGeofenceNotification(id: string): boolean {
    const success = this.geofenceNotifications.delete(id);
    if (success) {
      this.saveStoredData();
    }
    return success;
  }

  /**
   * 예약 알림 조회
   */
  getScheduledNotifications(): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values())
      .filter(n => n.isActive)
      .sort((a, b) => a.scheduleTime - b.scheduleTime);
  }

  /**
   * 지오펜스 알림 조회
   */
  getGeofenceNotifications(): GeofenceNotification[] {
    return Array.from(this.geofenceNotifications.values())
      .filter(n => n.isActive)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * 알림 분석 데이터 기록
   */
  trackNotification(analytics: Omit<NotificationAnalytics, 'sentAt'>): void {
    const notificationAnalytics: NotificationAnalytics = {
      ...analytics,
      sentAt: Date.now(),
    };

    this.analytics.set(analytics.notificationId, notificationAnalytics);
    this.saveStoredData();

    // 서버로 분석 데이터 전송 (실제 구현에서)
    this.sendAnalyticsToServer(notificationAnalytics);
  }

  /**
   * 알림 읽음 추적
   */
  trackNotificationRead(notificationId: string): void {
    const analytics = this.analytics.get(notificationId);
    if (analytics) {
      analytics.readAt = Date.now();
      this.analytics.set(notificationId, analytics);
      this.saveStoredData();
    }
  }

  /**
   * 알림 액션 추적
   */
  trackNotificationAction(notificationId: string, actionId: string): void {
    const analytics = this.analytics.get(notificationId);
    if (analytics) {
      analytics.actionTaken = {
        actionId,
        timestamp: Date.now(),
      };
      this.analytics.set(notificationId, analytics);
      this.saveStoredData();
    }
  }

  /**
   * 알림 닷기 추적
   */
  trackNotificationDismissed(notificationId: string, method: 'auto' | 'manual' | 'action'): void {
    const analytics = this.analytics.get(notificationId);
    if (analytics) {
      analytics.dismissed = {
        method,
        timestamp: Date.now(),
      };
      this.analytics.set(notificationId, analytics);
      this.saveStoredData();
    }
  }

  /**
   * 알림 분석 데이터 조회
   */
  getNotificationAnalytics(
    userId: string,
    timeRange?: {
      start: number;
      end: number;
    }
  ): NotificationAnalytics[] {
    let analytics = Array.from(this.analytics.values()).filter(a => a.userId === userId);

    if (timeRange) {
      analytics = analytics.filter(a => a.sentAt >= timeRange.start && a.sentAt <= timeRange.end);
    }

    return analytics.sort((a, b) => b.sentAt - a.sentAt);
  }

  /**
   * 알림 통계 생성
   */
  generateNotificationStats(
    userId: string,
    timeRange?: {
      start: number;
      end: number;
    }
  ) {
    const analytics = this.getNotificationAnalytics(userId, timeRange);

    const stats = {
      total: analytics.length,
      read: analytics.filter(a => a.readAt).length,
      actionTaken: analytics.filter(a => a.actionTaken).length,
      dismissed: analytics.filter(a => a.dismissed).length,
      byType: {} as Record<NotificationType, number>,
      byPriority: {} as Record<NotificationPriority, number>,
      avgReadTime: 0, // 알림 발송부터 읽음까지 평균 시간
      avgActionTime: 0, // 알림 발송부터 액션까지 평균 시간
    };

    // 유형별 통계
    analytics.forEach(a => {
      stats.byType[a.type] = (stats.byType[a.type] || 0) + 1;
      stats.byPriority[a.priority] = (stats.byPriority[a.priority] || 0) + 1;
    });

    // 평균 읽음 시간 계산
    const readAnalytics = analytics.filter(a => a.readAt);
    if (readAnalytics.length > 0) {
      const totalReadTime = readAnalytics.reduce((sum, a) => sum + (a.readAt! - a.sentAt), 0);
      stats.avgReadTime = totalReadTime / readAnalytics.length;
    }

    // 평균 액션 시간 계산
    const actionAnalytics = analytics.filter(a => a.actionTaken);
    if (actionAnalytics.length > 0) {
      const totalActionTime = actionAnalytics.reduce(
        (sum, a) => sum + (a.actionTaken!.timestamp - a.sentAt),
        0
      );
      stats.avgActionTime = totalActionTime / actionAnalytics.length;
    }

    return stats;
  }

  /**
   * 예약 알림 처리 루프
   */
  private startScheduleChecker(): void {
    setInterval(() => {
      const now = Date.now();

      this.scheduledNotifications.forEach(async scheduled => {
        if (!scheduled.isActive || scheduled.scheduleTime > now) return;

        // 조건 확인
        if (scheduled.conditions) {
          const conditionsMet = await this.checkNotificationConditions(scheduled.conditions);
          if (!conditionsMet) return;
        }

        // 알림 전송
        this.sendNotification(scheduled.notification);

        // 반복 설정 처리
        if (scheduled.repeat) {
          this.handleRepeatSchedule(scheduled);
        } else {
          // 일회성 알림은 비활성화
          scheduled.isActive = false;
          this.saveStoredData();
        }
      });
    }, 60000); // 1분마다 확인
  }

  /**
   * 위치 추적 시작
   */
  private startGeolocationTracking(): void {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      position => {
        this.currentPosition = position;
        this.checkGeofences(position);
      },
      error => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 300000, // 5분
        timeout: 10000,
      }
    );
  }

  /**
   * 지오펜스 확인
   */
  private checkGeofences(position: GeolocationPosition): void {
    this.geofenceNotifications.forEach(async geofence => {
      if (!geofence.isActive) return;

      const distance = this.calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        geofence.geofence.latitude,
        geofence.geofence.longitude
      );

      const isInside = distance <= geofence.geofence.radius;
      const shouldTrigger = this.shouldTriggerGeofence(geofence, isInside);

      if (shouldTrigger) {
        // 조건 확인
        if (geofence.conditions) {
          const conditionsMet = await this.checkGeofenceConditions(geofence.conditions);
          if (!conditionsMet) return;
        }

        this.sendNotification(geofence.notification);
      }
    });
  }

  /**
   * 두 지점 간 거리 계산 (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // 지구 반지름 (m)
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 지오펜스 트리거 판단
   */
  private shouldTriggerGeofence(
    geofence: GeofenceNotification,
    isCurrentlyInside: boolean
  ): boolean {
    // 이전 상태를 추적해야 하지만 간단하게 구현
    // 실제 구현에서는 지오펜스 상태를 저장하고 추적해야 함

    if (geofence.triggers.onEnter && isCurrentlyInside) {
      return true;
    }

    if (geofence.triggers.onExit && !isCurrentlyInside) {
      return true;
    }

    return false;
  }

  /**
   * 알림 조건 확인
   */
  private async checkNotificationConditions(
    conditions: ScheduledNotification['conditions']
  ): Promise<boolean> {
    if (!conditions) return true;

    // 계좌 잔고 조건
    if (conditions.accountBalance) {
      const balance = await this.getAccountBalance(conditions.accountBalance.accountId);
      const { operator, amount } = conditions.accountBalance;

      switch (operator) {
        case 'less_than':
          if (balance >= amount) return false;
          break;
        case 'greater_than':
          if (balance <= amount) return false;
          break;
        case 'equals':
          if (balance !== amount) return false;
          break;
      }
    }

    // 거래 건수 조건
    if (conditions.transactionCount) {
      const count = await this.getTransactionCount(
        conditions.transactionCount.accountId,
        conditions.transactionCount.timeframe
      );
      const { operator, count: targetCount } = conditions.transactionCount;

      switch (operator) {
        case 'less_than':
          if (count >= targetCount) return false;
          break;
        case 'greater_than':
          if (count <= targetCount) return false;
          break;
        case 'equals':
          if (count !== targetCount) return false;
          break;
      }
    }

    return true;
  }

  /**
   * 지오펜스 조건 확인
   */
  private async checkGeofenceConditions(
    conditions: GeofenceNotification['conditions']
  ): Promise<boolean> {
    if (!conditions) return true;

    // 시간 범위 확인
    if (conditions.timeRange) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const startTime = conditions.timeRange.start.split(':').map(Number);
      const endTime = conditions.timeRange.end.split(':').map(Number);
      const startMinutes = startTime[0] * 60 + startTime[1];
      const endMinutes = endTime[0] * 60 + endTime[1];

      const isWithinTime =
        startMinutes <= endMinutes
          ? currentTime >= startMinutes && currentTime <= endMinutes
          : currentTime >= startMinutes || currentTime <= endMinutes;

      if (!isWithinTime) return false;
    }

    // 요일 확인
    if (conditions.weekdays) {
      const today = new Date().getDay();
      if (!conditions.weekdays.includes(today)) return false;
    }

    return true;
  }

  /**
   * 반복 예약 처리
   */
  private handleRepeatSchedule(scheduled: ScheduledNotification): void {
    if (!scheduled.repeat) return;

    const { type, interval, endDate } = scheduled.repeat;
    let nextTime = scheduled.scheduleTime;

    switch (type) {
      case 'daily':
        nextTime += interval * 24 * 60 * 60 * 1000;
        break;
      case 'weekly':
        nextTime += interval * 7 * 24 * 60 * 60 * 1000;
        break;
      case 'monthly':
        const date = new Date(nextTime);
        date.setMonth(date.getMonth() + interval);
        nextTime = date.getTime();
        break;
    }

    // 종료 날짜 확인
    if (endDate && nextTime > endDate) {
      scheduled.isActive = false;
    } else {
      scheduled.scheduleTime = nextTime;
    }

    this.saveStoredData();
  }

  /**
   * 알림 전송
   */
  private sendNotification(notification: PushNotificationData): void {
    // 글로벌 알림 이벤트 발송
    window.dispatchEvent(
      new CustomEvent('pushNotificationReceived', {
        detail: notification,
      })
    );
  }

  /**
   * 데이터 저장
   */
  private saveStoredData(): void {
    try {
      localStorage.setItem(
        'advanced_notifications',
        JSON.stringify({
          scheduled: Array.from(this.scheduledNotifications.entries()),
          geofence: Array.from(this.geofenceNotifications.entries()),
          analytics: Array.from(this.analytics.entries()),
        })
      );
    } catch (error) {
      console.error('Failed to save advanced notification data:', error);
    }
  }

  /**
   * 데이터 로드
   */
  private loadStoredData(): void {
    try {
      const stored = localStorage.getItem('advanced_notifications');
      if (stored) {
        const data = JSON.parse(stored);

        if (data.scheduled) {
          this.scheduledNotifications = new Map(data.scheduled);
        }

        if (data.geofence) {
          this.geofenceNotifications = new Map(data.geofence);
        }

        if (data.analytics) {
          this.analytics = new Map(data.analytics);
        }
      }
    } catch (error) {
      console.error('Failed to load advanced notification data:', error);
    }
  }

  /**
   * 분석 데이터 서버 전송
   */
  private async sendAnalyticsToServer(analytics: NotificationAnalytics): Promise<void> {
    try {
      // 실제 구현에서는 API 엔드포인트로 전송
      await fetch('/api/notifications/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analytics),
      });
    } catch (error) {
      console.error('Failed to send analytics to server:', error);
    }
  }

  /**
   * 계좌 잔고 조회 (목 구현)
   */
  private async getAccountBalance(accountId: string): Promise<number> {
    // 실제 구현에서는 API 호출
    return 1000000; // 예시 값
  }

  /**
   * 거래 건수 조회 (목 구현)
   */
  private async getTransactionCount(accountId: string, timeframe: string): Promise<number> {
    // 실제 구현에서는 API 호출
    return 5; // 예시 값
  }

  /**
   * 정리 메서드
   */
  cleanup(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}

// 싱글톤 인스턴스
export const advancedNotificationService = new AdvancedNotificationService();
export default AdvancedNotificationService;

// 타입 익스포트
export type { ScheduledNotification, GeofenceNotification, NotificationAnalytics };
