/**
 * KB StarBanking Notification Templates
 * 
 * 뱅킹 앱에 특화된 알림 템플릿과 타입
 * - 거래 알림
 * - 보안 알림
 * - 잔고 알림
 * - 청구서 알림
 * - 홀보 및 시스템 알림
 */

import { 
  PushNotificationData, 
  NotificationType, 
  NotificationPriority, 
  NotificationAction,
  pushNotificationService 
} from './pushNotificationService';

// 거래 알림 데이터
export interface TransactionNotificationData {
  transactionId: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment';
  accountNumber: string;
  merchantName?: string;
  location?: string;
  timestamp: number;
  balance: number;
}

// 보안 알림 데이터
export interface SecurityNotificationData {
  eventType: 'login_attempt' | 'suspicious_activity' | 'password_change' | 'device_registration';
  deviceInfo: {
    type: string;
    os: string;
    browser?: string;
    location: string;
  };
  ipAddress: string;
  timestamp: number;
  success: boolean;
}

// 잔고 알림 데이터
export interface BalanceAlertData {
  accountNumber: string;
  currentBalance: number;
  threshold: number;
  alertType: 'low_balance' | 'high_spending' | 'unusual_activity';
  period?: string; // 예: '24h', '7d', '30d'
  spentAmount?: number;
}

// 청구서 알림 데이터
export interface BillReminderData {
  billId: string;
  billType: 'utility' | 'credit_card' | 'loan' | 'insurance' | 'subscription';
  payeeName: string;
  amount: number;
  dueDate: string;
  daysBefore: number;
  autoPayEnabled: boolean;
}

class BankingNotificationTemplates {
  /**
   * 거래 알림 생성
   */
  static createTransactionNotification(
    data: TransactionNotificationData,
    userId: string
  ): PushNotificationData {
    const formatAmount = (amount: number) => 
      new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: data.currency || 'KRW'
      }).format(amount);

    const getTransactionTitle = () => {
      switch (data.type) {
        case 'deposit': return '입금 알림';
        case 'withdrawal': return '출금 알림';
        case 'transfer': return '이체 알림';
        case 'payment': return '결제 알림';
        default: return '거래 알림';
      }
    };

    const getTransactionBody = () => {
      const amountStr = formatAmount(data.amount);
      const balanceStr = formatAmount(data.balance);
      const location = data.location ? ` (거래위치: ${data.location})` : '';
      
      switch (data.type) {
        case 'deposit':
          return `${amountStr} 입금되었습니다. 잔액: ${balanceStr}`;
        case 'withdrawal':
          return `${amountStr} 출금되었습니다. 잔액: ${balanceStr}${location}`;
        case 'transfer':
          return `${amountStr} 이체가 완료되었습니다. 잔액: ${balanceStr}`;
        case 'payment':
          const merchant = data.merchantName || '가맹점';
          return `${merchant}에서 ${amountStr} 결제되었습니다. 잔액: ${balanceStr}${location}`;
        default:
          return `${amountStr} 거래가 완료되었습니다. 잔액: ${balanceStr}`;
      }
    };

    const actions: NotificationAction[] = [
      {
        id: 'view_transaction',
        title: '거래내역 보기',
        icon: '/assets/images/icon_transaction.png'
      },
      {
        id: 'view_account',
        title: '계좌내역',
        icon: '/assets/images/icon_account.png'
      }
    ];

    // 고액 거래에 대한 추가 보안
    const priority = data.amount > 1000000 ? NotificationPriority.HIGH : NotificationPriority.NORMAL;
    const requiresAuth = data.amount > 1000000 || data.type === 'withdrawal';

    return {
      id: `transaction_${data.transactionId}`,
      type: NotificationType.TRANSACTION,
      priority,
      title: getTransactionTitle(),
      body: getTransactionBody(),
      data: {
        transactionId: data.transactionId,
        accountNumber: data.accountNumber,
        type: data.type,
        amount: data.amount,
        url: `/transactions/${data.transactionId}`
      },
      requiresAuth,
      encrypted: true,
      actions,
      icon: '/assets/images/kb_logo.png',
      vibrate: [200, 100, 200],
      timestamp: data.timestamp
    };
  }

  /**
   * 보안 알림 생성
   */
  static createSecurityNotification(
    data: SecurityNotificationData,
    userId: string
  ): PushNotificationData {
    const getSecurityTitle = () => {
      switch (data.eventType) {
        case 'login_attempt': return data.success ? '로그인 성공' : '로그인 시도 감지';
        case 'suspicious_activity': return '의심스러운 활동 감지';
        case 'password_change': return '비밀번호 변경';
        case 'device_registration': return '새 기기 등록';
        default: return '보안 알림';
      }
    };

    const getSecurityBody = () => {
      const device = `${data.deviceInfo.type} (${data.deviceInfo.os})`;
      const location = data.deviceInfo.location;
      const time = new Date(data.timestamp).toLocaleString('ko-KR');

      switch (data.eventType) {
        case 'login_attempt':
          if (data.success) {
            return `${time}에 ${device}에서 로그인했습니다. 위치: ${location}`;
          } else {
            return `${time}에 ${device}에서 비정상적인 로그인 시도가 감지되었습니다. 위치: ${location}`;
          }
        case 'suspicious_activity':
          return `비정상적인 계정 접근이 감지되었습니다. 즈시 보안 설정을 확인해 주세요.`;
        case 'password_change':
          return `${time}에 비밀번호가 변경되었습니다. 본인이 아닌 경우 즐시 고객센터로 연락하세요.`;
        case 'device_registration':
          return `새로운 기기(${device})가 등록되었습니다. 본인이 아닌 경우 보안 설정을 확인해 주세요.`;
        default:
          return '보안 이벤트가 발생했습니다.';
      }
    };

    const actions: NotificationAction[] = [];
    
    if (data.eventType === 'login_attempt' && !data.success) {
      actions.push(
        {
          id: 'secure_account',
          title: '계정 보안',
          icon: '/assets/images/icon_security.png',
          requiresAuth: true
        },
        {
          id: 'contact_support',
          title: '고객센터',
          icon: '/assets/images/icon_support.png'
        }
      );
    } else if (data.eventType === 'suspicious_activity') {
      actions.push(
        {
          id: 'change_password',
          title: '비밀번호 변경',
          icon: '/assets/images/icon_password.png',
          requiresAuth: true
        },
        {
          id: 'view_security_log',
          title: '보안로그',
          icon: '/assets/images/icon_log.png',
          requiresAuth: true
        }
      );
    }

    return {
      id: `security_${Date.now()}`,
      type: NotificationType.SECURITY,
      priority: data.success ? NotificationPriority.NORMAL : NotificationPriority.CRITICAL,
      title: getSecurityTitle(),
      body: getSecurityBody(),
      data: {
        eventType: data.eventType,
        deviceInfo: data.deviceInfo,
        success: data.success,
        url: '/security/log'
      },
      requiresAuth: true,
      encrypted: true,
      actions,
      icon: '/assets/images/icon_security.png',
      vibrate: [300, 200, 300, 200, 300],
      timestamp: data.timestamp
    };
  }

  /**
   * 잔고 알림 생성
   */
  static createBalanceAlertNotification(
    data: BalanceAlertData,
    userId: string
  ): PushNotificationData {
    const formatAmount = (amount: number) => 
      new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW'
      }).format(amount);

    const getAlertTitle = () => {
      switch (data.alertType) {
        case 'low_balance': return '잔고 부족 알림';
        case 'high_spending': return '과다 지출 알림';
        case 'unusual_activity': return '비정상 거래 알림';
        default: return '잔고 알림';
      }
    };

    const getAlertBody = () => {
      const balance = formatAmount(data.currentBalance);
      const threshold = formatAmount(data.threshold);
      
      switch (data.alertType) {
        case 'low_balance':
          return `계좌 잔고가 ${balance}로 설정한 임계값(${threshold}) 이하입니다.`;
        case 'high_spending':
          const spent = formatAmount(data.spentAmount || 0);
          const period = data.period === '24h' ? '오늘' : 
                       data.period === '7d' ? '이번 주' : '이번 달';
          return `${period} 지출이 ${spent}로 많습니다. 예산 관리를 확인해 주세요.`;
        case 'unusual_activity':
          return `비정상적인 거래 패턴이 감지되었습니다. 계좌 상태를 확인해 주세요.`;
        default:
          return `계좌 잔고: ${balance}`;
      }
    };

    const actions: NotificationAction[] = [
      {
        id: 'view_account',
        title: '계좌내역',
        icon: '/assets/images/icon_account.png'
      }
    ];

    if (data.alertType === 'low_balance') {
      actions.push({
        id: 'quick_transfer',
        title: '빠른이체',
        icon: '/assets/images/icon_transfer.png',
        requiresAuth: true
      });
    }

    return {
      id: `balance_${data.accountNumber}_${Date.now()}`,
      type: NotificationType.BALANCE_ALERT,
      priority: data.alertType === 'unusual_activity' ? NotificationPriority.HIGH : NotificationPriority.NORMAL,
      title: getAlertTitle(),
      body: getAlertBody(),
      data: {
        accountNumber: data.accountNumber,
        alertType: data.alertType,
        currentBalance: data.currentBalance,
        url: `/accounts/${data.accountNumber}`
      },
      requiresAuth: data.alertType === 'unusual_activity',
      encrypted: true,
      actions,
      icon: '/assets/images/icon_balance.png',
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    };
  }

  /**
   * 청구서 리마인더 생성
   */
  static createBillReminderNotification(
    data: BillReminderData,
    userId: string
  ): PushNotificationData {
    const formatAmount = (amount: number) => 
      new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW'
      }).format(amount);

    const getBillTypeKorean = () => {
      switch (data.billType) {
        case 'utility': return '공과금';
        case 'credit_card': return '신용카드';
        case 'loan': return '대출';
        case 'insurance': return '보험';
        case 'subscription': return '구독료';
        default: return '청구서';
      }
    };

    const dueDate = new Date(data.dueDate).toLocaleDateString('ko-KR');
    const amount = formatAmount(data.amount);
    const billType = getBillTypeKorean();
    
    const title = `${billType} 납부 알림`;
    const body = data.autoPayEnabled 
      ? `${data.payeeName} ${billType} ${amount}이 ${dueDate}에 자동이체됩니다.`
      : `${data.payeeName} ${billType} ${amount}을 ${dueDate}까지 납부해 주세요. (D-${data.daysBefore})`;

    const actions: NotificationAction[] = [];
    
    if (!data.autoPayEnabled) {
      actions.push(
        {
          id: 'pay_bill',
          title: '지금 납부',
          icon: '/assets/images/icon_payment.png',
          requiresAuth: true
        },
        {
          id: 'setup_autopay',
          title: '자동이체 설정',
          icon: '/assets/images/icon_auto.png'
        }
      );
    } else {
      actions.push({
        id: 'view_autopay',
        title: '자동이체 확인',
        icon: '/assets/images/icon_auto.png'
      });
    }

    return {
      id: `bill_${data.billId}`,
      type: NotificationType.BILL_REMINDER,
      priority: data.daysBefore <= 1 ? NotificationPriority.HIGH : NotificationPriority.NORMAL,
      title,
      body,
      data: {
        billId: data.billId,
        billType: data.billType,
        payeeName: data.payeeName,
        amount: data.amount,
        dueDate: data.dueDate,
        autoPayEnabled: data.autoPayEnabled,
        url: `/bills/${data.billId}`
      },
      requiresAuth: false,
      encrypted: true,
      actions,
      icon: '/assets/images/icon_bill.png',
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    };
  }

  /**
   * 프로모션 알림 생성
   */
  static createPromotionalNotification(
    title: string,
    body: string,
    imageUrl?: string,
    actionUrl?: string
  ): PushNotificationData {
    const actions: NotificationAction[] = [
      {
        id: 'view_promotion',
        title: '자세히 보기',
        icon: '/assets/images/icon_promotion.png'
      },
      {
        id: 'dismiss',
        title: '닫기'
      }
    ];

    return {
      id: `promo_${Date.now()}`,
      type: NotificationType.PROMOTIONAL,
      priority: NotificationPriority.LOW,
      title,
      body,
      data: {
        url: actionUrl || '/promotions'
      },
      requiresAuth: false,
      encrypted: false,
      actions,
      icon: '/assets/images/kb_logo.png',
      image: imageUrl,
      vibrate: [100],
      timestamp: Date.now()
    };
  }

  /**
   * 시스템 유지보수 알림 생성
   */
  static createMaintenanceNotification(
    title: string,
    body: string,
    startTime: Date,
    endTime: Date
  ): PushNotificationData {
    const startStr = startTime.toLocaleString('ko-KR');
    const endStr = endTime.toLocaleString('ko-KR');
    
    const actions: NotificationAction[] = [
      {
        id: 'view_notice',
        title: '공지사항',
        icon: '/assets/images/icon_notice.png'
      }
    ];

    return {
      id: `maintenance_${startTime.getTime()}`,
      type: NotificationType.SYSTEM_MAINTENANCE,
      priority: NotificationPriority.HIGH,
      title,
      body: `${body}\n유지보수 시간: ${startStr} ~ ${endStr}`,
      data: {
        startTime: startTime.getTime(),
        endTime: endTime.getTime(),
        url: '/notices/maintenance'
      },
      requiresAuth: false,
      encrypted: false,
      actions,
      icon: '/assets/images/icon_maintenance.png',
      vibrate: [200, 100, 200, 100, 200],
      timestamp: Date.now()
    };
  }
}

/**
 * 뱅킹 알림 배치 서비스
 */
export class BankingNotificationBatch {
  /**
   * 일일 거래 요약 알림
   */
  static async sendDailySummary(userId: string, transactions: TransactionNotificationData[]): Promise<void> {
    if (transactions.length === 0) return;

    const totalAmount = transactions.reduce((sum, tx) => {
      return tx.type === 'deposit' ? sum + tx.amount : sum - tx.amount;
    }, 0);

    const formatAmount = (amount: number) => 
      new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW'
      }).format(Math.abs(amount));

    const title = '오늘의 거래 요약';
    const body = totalAmount >= 0 
      ? `오늘 ${transactions.length}건의 거래가 있었습니다. 순입금: ${formatAmount(totalAmount)}`
      : `오늘 ${transactions.length}건의 거래가 있었습니다. 순출금: ${formatAmount(totalAmount)}`;

    const notification: PushNotificationData = {
      id: `daily_summary_${userId}_${new Date().toISOString().split('T')[0]}`,
      type: NotificationType.TRANSACTION,
      priority: NotificationPriority.LOW,
      title,
      body,
      data: {
        type: 'daily_summary',
        transactionCount: transactions.length,
        totalAmount,
        url: '/transactions/today'
      },
      requiresAuth: false,
      encrypted: false,
      actions: [
        {
          id: 'view_transactions',
          title: '거래내역',
          icon: '/assets/images/icon_transaction.png'
        }
      ],
      icon: '/assets/images/kb_logo.png',
      timestamp: Date.now()
    };

    await pushNotificationService.sendNotification(notification, [userId]);
  }

  /**
   * 주간 지출 분석 알림
   */
  static async sendWeeklySpendingAnalysis(
    userId: string, 
    weeklySpending: number, 
    previousWeek: number,
    categories: Record<string, number>
  ): Promise<void> {
    const formatAmount = (amount: number) => 
      new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW'
      }).format(amount);

    const difference = weeklySpending - previousWeek;
    const percentChange = previousWeek > 0 ? (difference / previousWeek) * 100 : 0;
    
    const title = '주간 지출 분석';
    let body = `이번 주 지출: ${formatAmount(weeklySpending)}`;
    
    if (Math.abs(percentChange) > 5) {
      const changeStr = percentChange > 0 ? '증가' : '감소';
      body += ` (지난주 대비 ${Math.abs(percentChange).toFixed(1)}% ${changeStr})`;
    }

    const topCategory = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topCategory) {
      body += `\n최대 지출: ${topCategory[0]} ${formatAmount(topCategory[1])}`;
    }

    const notification: PushNotificationData = {
      id: `weekly_analysis_${userId}_${Date.now()}`,
      type: NotificationType.BALANCE_ALERT,
      priority: NotificationPriority.LOW,
      title,
      body,
      data: {
        type: 'weekly_analysis',
        weeklySpending,
        previousWeek,
        percentChange,
        categories,
        url: '/analytics/spending'
      },
      requiresAuth: false,
      encrypted: false,
      actions: [
        {
          id: 'view_analytics',
          title: '상세 분석',
          icon: '/assets/images/icon_analytics.png'
        },
        {
          id: 'set_budget',
          title: '예산 설정',
          icon: '/assets/images/icon_budget.png'
        }
      ],
      icon: '/assets/images/icon_analytics.png',
      timestamp: Date.now()
    };

    await pushNotificationService.sendNotification(notification, [userId]);
  }
}

export default BankingNotificationTemplates;
