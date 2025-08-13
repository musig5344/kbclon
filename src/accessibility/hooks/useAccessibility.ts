/**
 * 접근성 관련 React Hooks
 * WCAG 2.1 AA 준수를 위한 커스텀 훅
 */

import { useEffect, useRef, useState, useCallback } from 'react';

import {
  FocusManagementOptions,
  KeyboardNavigationOptions,
  ScreenReaderAnnouncement,
  AccessibilitySettings,
} from '../types';
import { setAriaLive, setAriaLoading } from '../utils/aria';
import { validateColorContrast, getHighContrastColor } from '../utils/colorContrast';
import {
  FocusTrap,
  KeyboardNavigator,
  manageFocusRing,
  getFocusableElements,
  setFocus,
} from '../utils/focusManagement';
import {
  announce,
  announceUrgent,
  formatAmountForScreenReader,
  formatDateForScreenReader,
  formatAccountNumberForScreenReader,
} from '../utils/screenReader';

/**
 * 포커스 트랩 훅
 */
export function useFocusTrap(isActive: boolean, options?: FocusManagementOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const focusTrapRef = useRef<FocusTrap | null>(null);

  useEffect(() => {
    if (isActive && containerRef.current) {
      focusTrapRef.current = new FocusTrap(containerRef.current, options);
      focusTrapRef.current.activate();
    } else {
      focusTrapRef.current?.deactivate();
    }

    return () => {
      focusTrapRef.current?.deactivate();
    };
  }, [isActive, options]);

  return containerRef;
}

/**
 * 키보드 네비게이션 훅
 */
export function useKeyboardNavigation(options?: KeyboardNavigationOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigatorRef = useRef<KeyboardNavigator | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      navigatorRef.current = new KeyboardNavigator(containerRef.current, options);
    }

    return () => {
      navigatorRef.current?.destroy();
    };
  }, [options]);

  const updateItems = useCallback(() => {
    navigatorRef.current?.updateItems();
  }, []);

  return { containerRef, updateItems };
}

/**
 * 스크린 리더 공지 훅
 */
export function useAnnouncement() {
  const makeAnnouncement = useCallback(
    (message: string, options?: Partial<ScreenReaderAnnouncement>) => {
      announce(message, options);
    },
    []
  );

  const makeUrgentAnnouncement = useCallback(
    (message: string, options?: Partial<ScreenReaderAnnouncement>) => {
      announceUrgent(message, options);
    },
    []
  );

  return { announce: makeAnnouncement, announceUrgent: makeUrgentAnnouncement };
}

/**
 * ARIA 라이브 리전 훅
 */
export function useAriaLive(level: 'off' | 'polite' | 'assertive' = 'polite') {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (regionRef.current) {
      setAriaLive(regionRef.current, level);
    }
  }, [level]);

  const updateContent = useCallback((content: string) => {
    if (regionRef.current) {
      regionRef.current.textContent = content;
    }
  }, []);

  return { regionRef, updateContent };
}

/**
 * 로딩 상태 접근성 훅
 */
export function useAccessibleLoading(isLoading: boolean) {
  const loadingRef = useRef<HTMLDivElement>(null);
  const { announce } = useAnnouncement();

  useEffect(() => {
    if (loadingRef.current) {
      setAriaLoading(loadingRef.current, isLoading);
    }

    if (isLoading) {
      announce('로딩 중입니다. 잠시만 기다려 주세요.');
    }
  }, [isLoading, announce]);

  return loadingRef;
}

/**
 * 색상 대비 검증 훅
 */
export function useColorContrast() {
  const [contrastErrors, setContrastErrors] = useState<string[]>([]);

  const checkContrast = useCallback(
    (foreground: string, background: string, fontSize?: number, isBold?: boolean) => {
      const result = validateColorContrast(foreground, background, fontSize, isBold);

      if (!result.passes.aa) {
        setContrastErrors(prev => [...prev, result.recommendation || '']);
      }

      return result;
    },
    []
  );

  const clearErrors = useCallback(() => {
    setContrastErrors([]);
  }, []);

  return { checkContrast, contrastErrors, clearErrors };
}

/**
 * 포커스 관리 훅
 */
export function useFocusManagement() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      setFocus(previousFocusRef.current);
    }
  }, []);

  const moveFocus = useCallback(
    (element: HTMLElement | string, options?: { preventScroll?: boolean }) => {
      return setFocus(element, options);
    },
    []
  );

  const getFocusable = useCallback((container?: HTMLElement) => {
    return getFocusableElements(container);
  }, []);

  return {
    saveFocus,
    restoreFocus,
    moveFocus,
    getFocusable,
  };
}

/**
 * 포커스 가시성 훅
 */
export function useFocusVisible() {
  useEffect(() => {
    const cleanup = manageFocusRing();
    return cleanup;
  }, []);
}

/**
 * 금액 포맷팅 훅
 */
export function useAmountFormatter() {
  const formatAmount = useCallback((amount: number | string) => {
    return formatAmountForScreenReader(amount);
  }, []);

  const formatAndAnnounce = useCallback((amount: number | string) => {
    const formatted = formatAmountForScreenReader(amount);
    announce(formatted);
    return formatted;
  }, []);

  return { formatAmount, formatAndAnnounce };
}

/**
 * 날짜 포맷팅 훅
 */
export function useDateFormatter() {
  const formatDate = useCallback((date: Date | string) => {
    return formatDateForScreenReader(date);
  }, []);

  const formatAndAnnounce = useCallback((date: Date | string) => {
    const formatted = formatDateForScreenReader(date);
    announce(formatted);
    return formatted;
  }, []);

  return { formatDate, formatAndAnnounce };
}

/**
 * 계좌번호 포맷팅 훅
 */
export function useAccountNumberFormatter() {
  const formatAccountNumber = useCallback((accountNumber: string) => {
    return formatAccountNumberForScreenReader(accountNumber);
  }, []);

  return { formatAccountNumber };
}

/**
 * 접근성 설정 훅
 */
export function useAccessibilitySettings() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    fontSize: 'medium',
    keyboardNavigation: true,
    screenReaderOptimized: false,
  });

  useEffect(() => {
    // 시스템 설정 감지
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, reduceMotion: e.matches }));
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, highContrast: e.matches }));
    };

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    // 초기 설정
    setSettings(prev => ({
      ...prev,
      reduceMotion: motionQuery.matches,
      highContrast: contrastQuery.matches,
    }));

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const getHighContrastColorValue = useCallback(
    (color: string) => {
      if (settings.highContrast) {
        return getHighContrastColor(color);
      }
      return color;
    },
    [settings.highContrast]
  );

  return { settings, updateSettings, getHighContrastColor: getHighContrastColorValue };
}

/**
 * 스킵 링크 훅
 */
export function useSkipLink() {
  const skipToMain = useCallback(() => {
    const main = document.getElementById('main-content') || document.querySelector('main');
    if (main) {
      (main as HTMLElement).tabIndex = -1;
      (main as HTMLElement).focus();
      announce('본문으로 이동했습니다.');
    }
  }, []);

  const skipToNavigation = useCallback(() => {
    const nav = document.getElementById('navigation') || document.querySelector('nav');
    if (nav) {
      (nav as HTMLElement).tabIndex = -1;
      (nav as HTMLElement).focus();
      announce('네비게이션으로 이동했습니다.');
    }
  }, []);

  return { skipToMain, skipToNavigation };
}

/**
 * 시간 제한 경고 훅
 */
export function useTimeoutWarning(
  timeoutDuration: number,
  warningTime: number = 60000 // 기본 1분 전 경고
) {
  const [timeRemaining, setTimeRemaining] = useState(timeoutDuration);
  const [isWarning, setIsWarning] = useState(false);
  const { announceUrgent } = useAnnouncement();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    // 경고 타이머
    warningRef.current = setTimeout(() => {
      setIsWarning(true);
      announceUrgent(
        `세션이 ${warningTime / 1000}초 후에 만료됩니다. 연장하시려면 활동을 계속하세요.`
      );
    }, timeoutDuration - warningTime);

    // 만료 타이머
    timeoutRef.current = setTimeout(() => {
      announceUrgent('세션이 만료되었습니다.');
    }, timeoutDuration);
  }, [timeoutDuration, warningTime, announceUrgent]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    setIsWarning(false);
    setTimeRemaining(timeoutDuration);
    startTimer();
  }, [timeoutDuration, startTimer]);

  const extendSession = useCallback(() => {
    resetTimer();
    announce('세션이 연장되었습니다.');
  }, [resetTimer]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [startTimer]);

  return { timeRemaining, isWarning, extendSession, resetTimer };
}

/**
 * 에러 메시지 접근성 훅
 */
export function useAccessibleError() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { announceUrgent } = useAnnouncement();

  const setError = useCallback(
    (fieldId: string, message: string) => {
      setErrors(prev => ({ ...prev, [fieldId]: message }));
      announceUrgent(`오류: ${message}`);
    },
    [announceUrgent]
  );

  const clearError = useCallback((fieldId: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getErrorProps = useCallback(
    (fieldId: string) => {
      const error = errors[fieldId];
      return {
        'aria-invalid': !!error,
        'aria-errormessage': error ? `${fieldId}-error` : undefined,
      };
    },
    [errors]
  );

  return { errors, setError, clearError, clearAllErrors, getErrorProps };
}
