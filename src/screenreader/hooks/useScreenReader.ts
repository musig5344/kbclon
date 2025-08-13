import { useCallback, useEffect, useRef } from 'react';

import { ScreenReaderManager, AnnouncementOptions, ScreenReaderConfig } from '../core/ScreenReaderManager';

export interface UseScreenReaderReturn {
  announce: (message: string, options?: Partial<AnnouncementOptions>) => void;
  announceBalance: (amount: number, currency?: string) => void;
  announceTransaction: (type: string, amount: number, account?: string) => void;
  announceError: (error: string, suggestion?: string) => void;
  announcePageLoad: (title: string, mainContent?: string) => void;
  announceFormValidation: (field: string, error: string) => void;
  updateConfig: (config: Partial<ScreenReaderConfig>) => void;
  isActive: boolean;
}

export const useScreenReader = (): UseScreenReaderReturn => {
  const screenReaderRef = useRef(ScreenReaderManager.getInstance());
  const screenReader = screenReaderRef.current;

  const announce = useCallback((message: string, options?: Partial<AnnouncementOptions>) => {
    screenReader.announce(message, options);
  }, [screenReader]);

  const announceBalance = useCallback((amount: number, currency?: string) => {
    screenReader.announceBalance(amount, currency);
  }, [screenReader]);

  const announceTransaction = useCallback((type: string, amount: number, account?: string) => {
    screenReader.announceTransaction(type, amount, account);
  }, [screenReader]);

  const announceError = useCallback((error: string, suggestion?: string) => {
    screenReader.announceError(error, suggestion);
  }, [screenReader]);

  const announcePageLoad = useCallback((title: string, mainContent?: string) => {
    screenReader.announcePageLoad(title, mainContent);
  }, [screenReader]);

  const announceFormValidation = useCallback((field: string, error: string) => {
    screenReader.announceFormValidation(field, error);
  }, [screenReader]);

  const updateConfig = useCallback((config: Partial<ScreenReaderConfig>) => {
    screenReader.updateConfig(config);
  }, [screenReader]);

  const isActive = screenReader.isScreenReaderActive();

  return {
    announce,
    announceBalance,
    announceTransaction,
    announceError,
    announcePageLoad,
    announceFormValidation,
    updateConfig,
    isActive,
  };
};

// Hook for managing focus announcements
export const useFocusAnnouncement = (element: HTMLElement | null, message?: string) => {
  const { announce } = useScreenReader();

  useEffect(() => {
    if (!element || !message) return;

    const handleFocus = () => {
      announce(message, { priority: 'polite' });
    };

    element.addEventListener('focus', handleFocus);
    return () => element.removeEventListener('focus', handleFocus);
  }, [element, message, announce]);
};

// Hook for page load announcements
export const usePageAnnouncement = (title: string, mainContent?: string) => {
  const { announcePageLoad } = useScreenReader();

  useEffect(() => {
    const timer = setTimeout(() => {
      announcePageLoad(title, mainContent);
    }, 500); // Small delay to let page settle

    return () => clearTimeout(timer);
  }, [title, mainContent, announcePageLoad]);
};

// Hook for form validation announcements
export const useFormValidationAnnouncement = () => {
  const { announceFormValidation } = useScreenReader();

  const announceFieldError = useCallback((fieldName: string, error: string) => {
    announceFormValidation(fieldName, error);
  }, [announceFormValidation]);

  return { announceFieldError };
};

// Hook for transaction announcements
export const useTransactionAnnouncement = () => {
  const { announceTransaction, announceBalance, announceError } = useScreenReader();

  const announceTransferStart = useCallback((amount: number, fromAccount: string, toAccount: string) => {
    const formattedAmount = new Intl.NumberFormat('ko-KR').format(amount);
    const message = `${fromAccount}에서 ${toAccount}로 ${formattedAmount}원 이체를 시작합니다`;
    announceTransaction('이체 시작', amount, `${fromAccount}에서 ${toAccount}로`);
  }, [announceTransaction]);

  const announceTransferComplete = useCallback((amount: number, fromAccount: string, toAccount: string) => {
    announceTransaction('이체', amount, `${fromAccount}에서 ${toAccount}로`);
  }, [announceTransaction]);

  const announceTransferError = useCallback((error: string) => {
    announceError(`이체 실패: ${error}`, '다시 시도하거나 고객센터에 문의하세요');
  }, [announceError]);

  const announceBalanceInquiry = useCallback((balance: number, accountName: string) => {
    const message = `${accountName} 계좌의 현재 잔액`;
    announceBalance(balance);
  }, [announceBalance]);

  return {
    announceTransferStart,
    announceTransferComplete,
    announceTransferError,
    announceBalanceInquiry,
  };
};

// Hook for login/authentication announcements
export const useAuthAnnouncement = () => {
  const { announce, announceError } = useScreenReader();

  const announceLoginStart = useCallback(() => {
    announce('로그인을 시도하고 있습니다', { priority: 'polite' });
  }, [announce]);

  const announceLoginSuccess = useCallback((userName?: string) => {
    const message = userName ? `${userName}님, 로그인되었습니다` : '로그인되었습니다';
    announce(message, { priority: 'assertive' });
  }, [announce]);

  const announceLoginError = useCallback((error: string) => {
    announceError(`로그인 실패: ${error}`, '아이디와 비밀번호를 확인하고 다시 시도하세요');
  }, [announceError]);

  const announceBiometricPrompt = useCallback((type: '지문' | '얼굴' | '패턴') => {
    announce(`${type} 인증을 진행해주세요`, { priority: 'assertive' });
  }, [announce]);

  const announceSecurityCheck = useCallback(() => {
    announce('보안 검사를 진행하고 있습니다', { priority: 'polite' });
  }, [announce]);

  return {
    announceLoginStart,
    announceLoginSuccess,
    announceLoginError,
    announceBiometricPrompt,
    announceSecurityCheck,
  };
};

// Hook for navigation announcements
export const useNavigationAnnouncement = () => {
  const { announce } = useScreenReader();

  const announcePageChange = useCallback((pageName: string, breadcrumb?: string[]) => {
    let message = `${pageName} 페이지`;
    
    if (breadcrumb && breadcrumb.length > 0) {
      message += `. 현재 위치: ${breadcrumb.join(' > ')}`;
    }
    
    announce(message, { priority: 'assertive' });
  }, [announce]);

  const announceTabChange = useCallback((tabName: string, tabIndex: number, totalTabs: number) => {
    const message = `${tabName} 탭, ${totalTabs}개 탭 중 ${tabIndex + 1}번째`;
    announce(message, { priority: 'polite' });
  }, [announce]);

  const announceMenuOpen = useCallback((menuName: string, itemCount?: number) => {
    let message = `${menuName} 메뉴가 열렸습니다`;
    
    if (itemCount) {
      message += `. ${itemCount}개 항목`;
    }
    
    announce(message, { priority: 'polite' });
  }, [announce]);

  const announceMenuClose = useCallback((menuName: string) => {
    announce(`${menuName} 메뉴가 닫혔습니다`, { priority: 'polite' });
  }, [announce]);

  return {
    announcePageChange,
    announceTabChange,
    announceMenuOpen,
    announceMenuClose,
  };
};

// Hook for data table announcements
export const useTableAnnouncement = () => {
  const { announce } = useScreenReader();

  const announceTableInfo = useCallback((rows: number, columns: number, caption?: string) => {
    let message = `표 정보: ${rows}행 ${columns}열`;
    
    if (caption) {
      message = `${caption}. ${message}`;
    }
    
    announce(message, { priority: 'polite' });
  }, [announce]);

  const announceCellNavigation = useCallback((
    cellContent: string,
    rowIndex: number,
    columnIndex: number,
    rowHeader?: string,
    columnHeader?: string
  ) => {
    let message = '';
    
    if (columnHeader) {
      message += `${columnHeader} 열, `;
    }
    
    if (rowHeader) {
      message += `${rowHeader} 행, `;
    } else {
      message += `${rowIndex + 1}행 ${columnIndex + 1}열, `;
    }
    
    message += cellContent;
    
    announce(message, { priority: 'polite' });
  }, [announce]);

  const announceSortChange = useCallback((column: string, direction: 'ascending' | 'descending') => {
    const directionText = direction === 'ascending' ? '오름차순' : '내림차순';
    announce(`${column} 열이 ${directionText}으로 정렬되었습니다`, { priority: 'polite' });
  }, [announce]);

  return {
    announceTableInfo,
    announceCellNavigation,
    announceSortChange,
  };
};