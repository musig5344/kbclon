/**
 * 스크린 리더 지원 유틸리티
 * WCAG 2.1 스크린 리더 공지 및 한국어 지원
 */

import { ScreenReaderAnnouncement } from '../types';

/**
 * 라이브 리전 생성 및 관리
 */
class LiveRegionManager {
  private static instance: LiveRegionManager;
  private politeRegion: HTMLElement | null = null;
  private assertiveRegion: HTMLElement | null = null;
  private announceQueue: ScreenReaderAnnouncement[] = [];
  private isProcessing: boolean = false;

  private constructor() {
    this.createRegions();
  }

  static getInstance(): LiveRegionManager {
    if (!LiveRegionManager.instance) {
      LiveRegionManager.instance = new LiveRegionManager();
    }
    return LiveRegionManager.instance;
  }

  private createRegions() {
    // Polite region 생성
    this.politeRegion = document.createElement('div');
    this.politeRegion.setAttribute('aria-live', 'polite');
    this.politeRegion.setAttribute('aria-atomic', 'true');
    this.politeRegion.className = 'sr-only';
    this.applyScreenReaderOnlyStyles(this.politeRegion);
    
    // Assertive region 생성
    this.assertiveRegion = document.createElement('div');
    this.assertiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveRegion.setAttribute('aria-atomic', 'true');
    this.assertiveRegion.className = 'sr-only';
    this.applyScreenReaderOnlyStyles(this.assertiveRegion);
    
    // DOM에 추가
    document.body.appendChild(this.politeRegion);
    document.body.appendChild(this.assertiveRegion);
  }

  private applyScreenReaderOnlyStyles(element: HTMLElement) {
    Object.assign(element.style, {
      position: 'absolute',
      left: '-10000px',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0'
    });
  }

  announce(announcement: ScreenReaderAnnouncement) {
    this.announceQueue.push(announcement);
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing || this.announceQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.announceQueue.length > 0) {
      const announcement = this.announceQueue.shift();
      if (announcement) {
        await this.makeAnnouncement(announcement);
      }
    }
    
    this.isProcessing = false;
  }

  private async makeAnnouncement(announcement: ScreenReaderAnnouncement) {
    const region = announcement.priority === 'assertive' 
      ? this.assertiveRegion 
      : this.politeRegion;
    
    if (!region) return;
    
    // 언어 설정
    if (announcement.language) {
      region.setAttribute('lang', announcement.language);
    }
    
    // 공지 설정
    region.textContent = announcement.message;
    
    // 지정된 시간 후 클리어
    if (announcement.clearAfter) {
      setTimeout(() => {
        region.textContent = '';
      }, announcement.clearAfter);
    }
    
    // 다음 공지를 위한 짧은 대기
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  destroy() {
    this.politeRegion?.remove();
    this.assertiveRegion?.remove();
    this.announceQueue = [];
  }
}

/**
 * 스크린 리더 공지 함수
 */
export function announce(
  message: string,
  options: Partial<ScreenReaderAnnouncement> = {}
): void {
  const manager = LiveRegionManager.getInstance();
  manager.announce({
    message,
    priority: 'polite',
    clearAfter: 5000,
    language: 'ko',
    ...options
  });
}

/**
 * 긴급 스크린 리더 공지
 */
export function announceUrgent(
  message: string,
  options: Partial<ScreenReaderAnnouncement> = {}
): void {
  announce(message, { ...options, priority: 'assertive' });
}

/**
 * 금액 한국어 읽기 변환
 */
export function formatAmountForScreenReader(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
  
  if (isNaN(numAmount)) return '0원';
  
  const units = ['', '만', '억', '조'];
  const numbers = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  
  let result = '';
  let unitIndex = 0;
  let tempAmount = Math.abs(numAmount);
  
  while (tempAmount > 0 && unitIndex < units.length) {
    const part = tempAmount % 10000;
    if (part > 0) {
      const partStr = part.toString().split('').map(digit => numbers[parseInt(digit)]).join('');
      result = partStr + units[unitIndex] + ' ' + result;
    }
    tempAmount = Math.floor(tempAmount / 10000);
    unitIndex++;
  }
  
  if (result === '') result = '영';
  
  return (numAmount < 0 ? '마이너스 ' : '') + result.trim() + '원';
}

/**
 * 날짜 한국어 읽기 변환
 */
export function formatDateForScreenReader(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '유효하지 않은 날짜';
  
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const weekday = weekdays[dateObj.getDay()];
  
  return `${year}년 ${month}월 ${day}일 ${weekday}`;
}

/**
 * 시간 한국어 읽기 변환
 */
export function formatTimeForScreenReader(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '유효하지 않은 시간';
  
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const period = hours < 12 ? '오전' : '오후';
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${period} ${hour12}시 ${minutes}분`;
}

/**
 * 계좌번호 읽기 변환
 */
export function formatAccountNumberForScreenReader(accountNumber: string): string {
  // 숫자를 하나씩 읽도록 변환
  return accountNumber.split('').join(' ');
}

/**
 * 퍼센트 읽기 변환
 */
export function formatPercentForScreenReader(percent: number | string): string {
  const numPercent = typeof percent === 'string' ? parseFloat(percent) : percent;
  
  if (isNaN(numPercent)) return '0 퍼센트';
  
  return `${numPercent} 퍼센트`;
}

/**
 * 상태 메시지 공지
 */
export function announceStatus(status: 'loading' | 'success' | 'error' | 'warning', customMessage?: string) {
  const messages = {
    loading: '처리 중입니다. 잠시만 기다려 주세요.',
    success: '성공적으로 완료되었습니다.',
    error: '오류가 발생했습니다. 다시 시도해 주세요.',
    warning: '주의가 필요합니다.'
  };
  
  const message = customMessage || messages[status];
  announce(message, { priority: status === 'error' ? 'assertive' : 'polite' });
}

/**
 * 페이지 변경 공지
 */
export function announcePageChange(pageName: string, additionalInfo?: string) {
  let message = `${pageName} 페이지로 이동했습니다.`;
  
  if (additionalInfo) {
    message += ` ${additionalInfo}`;
  }
  
  announce(message);
}

/**
 * 폼 검증 메시지 공지
 */
export function announceFormValidation(fieldName: string, error?: string) {
  if (error) {
    announceUrgent(`${fieldName}: ${error}`);
  } else {
    announce(`${fieldName}: 올바른 입력입니다.`);
  }
}

/**
 * 거래 결과 공지
 */
export function announceTransactionResult(
  type: 'transfer' | 'deposit' | 'withdrawal',
  amount: number,
  success: boolean,
  details?: string
) {
  const typeText = {
    transfer: '이체',
    deposit: '입금',
    withdrawal: '출금'
  }[type];
  
  const amountText = formatAmountForScreenReader(amount);
  
  if (success) {
    let message = `${amountText} ${typeText}가 완료되었습니다.`;
    if (details) message += ` ${details}`;
    announce(message);
  } else {
    announceUrgent(`${typeText}에 실패했습니다. ${details || '다시 시도해 주세요.'}`);
  }
}

/**
 * 테이블 요약 정보 생성
 */
export function generateTableSummary(
  rowCount: number,
  columnCount: number,
  additionalInfo?: string
): string {
  let summary = `${rowCount}개의 행과 ${columnCount}개의 열로 구성된 테이블입니다.`;
  
  if (additionalInfo) {
    summary += ` ${additionalInfo}`;
  }
  
  return summary;
}

/**
 * 차트 대체 텍스트 생성
 */
export function generateChartDescription(
  chartType: string,
  dataPoints: number,
  trend?: 'increasing' | 'decreasing' | 'stable',
  details?: string
): string {
  const trendText = {
    increasing: '증가하는',
    decreasing: '감소하는',
    stable: '안정적인'
  }[trend || 'stable'];
  
  let description = `${dataPoints}개의 데이터 포인트를 가진 ${chartType} 차트입니다. `;
  description += `전체적으로 ${trendText} 추세를 보입니다.`;
  
  if (details) {
    description += ` ${details}`;
  }
  
  return description;
}

/**
 * 스크린 리더 전용 텍스트 요소 생성
 */
export function createScreenReaderText(text: string): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'sr-only';
  span.textContent = text;
  
  Object.assign(span.style, {
    position: 'absolute',
    left: '-10000px',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0'
  });
  
  return span;
}

/**
 * ARIA 라벨 업데이트
 */
export function updateAriaLabel(element: HTMLElement, label: string) {
  element.setAttribute('aria-label', label);
}

/**
 * ARIA 설명 업데이트
 */
export function updateAriaDescription(element: HTMLElement, description: string) {
  const descId = `desc-${Date.now()}`;
  
  let descElement = document.getElementById(descId);
  if (!descElement) {
    descElement = createScreenReaderText(description);
    descElement.id = descId;
    document.body.appendChild(descElement);
  } else {
    descElement.textContent = description;
  }
  
  element.setAttribute('aria-describedby', descId);
}