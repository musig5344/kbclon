/**
 * Notification Components Export
 *
 * 알림 관련 모든 컴포넌트와 서비스를 내보내는 인덱스
 */

// Components
export { default as NotificationProvider, useNotifications } from './NotificationProvider';
export { default as NotificationPermissionModal } from './NotificationPermissionModal';
export { default as NotificationSettings } from './NotificationSettings';
export { default as InAppNotification } from './InAppNotification';
export { default as NotificationList } from './NotificationList';

// Services
export { default as PushNotificationService } from '../../services/pushNotificationService';
export { pushNotificationService } from '../../services/pushNotificationService';
export { default as BankingNotificationTemplates } from '../../services/bankingNotifications';
export { BankingNotificationBatch } from '../../services/bankingNotifications';
export { default as AdvancedNotificationService } from '../../services/advancedNotificationFeatures';
export { advancedNotificationService } from '../../services/advancedNotificationFeatures';
export { default as CapacitorNotificationPlugin } from '../../services/capacitorNotificationPlugin';
export { capacitorNotificationPlugin } from '../../services/capacitorNotificationPlugin';

// Types
export type {
  PushNotificationData,
  NotificationPreferences,
  NotificationAction,
  GeofenceData,
  PushSubscriptionData,
  NotificationType,
  NotificationPriority,
} from '../../services/pushNotificationService';

export type {
  TransactionNotificationData,
  SecurityNotificationData,
  BalanceAlertData,
  BillReminderData,
} from '../../services/bankingNotifications';

export type {
  ScheduledNotification,
  GeofenceNotification,
  NotificationAnalytics,
} from '../../services/advancedNotificationFeatures';
