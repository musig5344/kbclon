/**
 * KB StarBanking 키보드 네비게이션 React 훅
 * 컴포넌트에서 쉽게 사용할 수 있는 키보드 네비게이션 기능
 */

import { useEffect, useRef, useCallback, useState, MutableRefObject } from 'react';

import { globalKeyboardNavigationManager } from '../core/KeyboardNavigationManager';
import { globalKeyboardShortcutManager } from '../core/KeyboardShortcutManager';
import {
  KeyboardNavigationOptions,
  NavigationDirection,
  KeyboardShortcut,
  NavigationMode,
} from '../types';

interface UseKeyboardNavigationResult {
  // 상태
  currentIndex: number;
  focusedElement: HTMLElement | null;
  isEnabled: boolean;

  // 네비게이션 메서드
  navigateNext: () => void;
  navigatePrevious: () => void;
  navigateFirst: () => void;
  navigateLast: () => void;
  navigateTo: (index: number) => void;

  // 제어 메서드
  enable: () => void;
  disable: () => void;
  refresh: () => void;
  setMode: (mode: NavigationMode) => void;

  // 포커스 관리
  focusElement: (element: HTMLElement) => void;
  getCurrentElement: () => HTMLElement | null;
  getFocusableElements: () => HTMLElement[];
}

export const useKeyboardNavigation = (
  containerRef: MutableRefObject<HTMLElement | null>,
  options: KeyboardNavigationOptions = {}
): UseKeyboardNavigationResult => {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  // 포커스 가능한 요소들 업데이트
  const updateFocusableElements = useCallback(() => {
    if (!containerRef.current) return;

    const selector = [
      'a[href]:not([disabled])',
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]:not([contenteditable="false"])',
    ].join(',');

    const elements = Array.from(containerRef.current.querySelectorAll(selector)) as HTMLElement[];
    const visibleElements = elements.filter(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);

      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        el.getAttribute('aria-hidden') !== 'true'
      );
    });

    setFocusableElements(visibleElements);

    // 현재 포커스된 요소의 인덱스 업데이트
    const currentElement = document.activeElement as HTMLElement;
    if (currentElement && visibleElements.includes(currentElement)) {
      setCurrentIndex(visibleElements.indexOf(currentElement));
      setFocusedElement(currentElement);
    }
  }, [containerRef]);

  // 네비게이션 메서드들
  const navigateTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= focusableElements.length) return;

      const element = focusableElements[index];
      element.focus();
      setCurrentIndex(index);
      setFocusedElement(element);

      optionsRef.current.onNavigate?.(element, 'first' as NavigationDirection);
    },
    [focusableElements]
  );

  const navigateNext = useCallback(() => {
    if (focusableElements.length === 0) return;

    let nextIndex = currentIndex + 1;

    if (optionsRef.current.wrap) {
      nextIndex = nextIndex >= focusableElements.length ? 0 : nextIndex;
    } else {
      nextIndex = Math.min(nextIndex, focusableElements.length - 1);
    }

    navigateTo(nextIndex);
  }, [currentIndex, focusableElements.length, navigateTo]);

  const navigatePrevious = useCallback(() => {
    if (focusableElements.length === 0) return;

    let prevIndex = currentIndex - 1;

    if (optionsRef.current.wrap) {
      prevIndex = prevIndex < 0 ? focusableElements.length - 1 : prevIndex;
    } else {
      prevIndex = Math.max(prevIndex, 0);
    }

    navigateTo(prevIndex);
  }, [currentIndex, focusableElements.length, navigateTo]);

  const navigateFirst = useCallback(() => {
    navigateTo(0);
  }, [navigateTo]);

  const navigateLast = useCallback(() => {
    navigateTo(focusableElements.length - 1);
  }, [navigateTo, focusableElements.length]);

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return;

      const { mode = 'normal' } = optionsRef.current;

      let handled = false;

      switch (event.key) {
        case 'ArrowDown':
          if (mode === 'normal' || mode === 'accessibility') {
            event.preventDefault();
            navigateNext();
            handled = true;
          }
          break;

        case 'ArrowUp':
          if (mode === 'normal' || mode === 'accessibility') {
            event.preventDefault();
            navigatePrevious();
            handled = true;
          }
          break;

        case 'ArrowRight':
          if (mode === 'normal' || mode === 'accessibility') {
            event.preventDefault();
            navigateNext();
            handled = true;
          }
          break;

        case 'ArrowLeft':
          if (mode === 'normal' || mode === 'accessibility') {
            event.preventDefault();
            navigatePrevious();
            handled = true;
          }
          break;

        case 'Home':
          event.preventDefault();
          navigateFirst();
          handled = true;
          break;

        case 'End':
          event.preventDefault();
          navigateLast();
          handled = true;
          break;

        case 'Enter':
        case ' ':
          if (focusedElement) {
            optionsRef.current.onActivate?.(focusedElement);
          }
          break;
      }

      // Vim 모드 키바인딩
      if (mode === 'vim') {
        switch (event.key.toLowerCase()) {
          case 'j':
            event.preventDefault();
            navigateNext();
            handled = true;
            break;
          case 'k':
            event.preventDefault();
            navigatePrevious();
            handled = true;
            break;
          case 'g':
            if (event.shiftKey) {
              event.preventDefault();
              navigateLast();
              handled = true;
            } else {
              // TODO: 'gg' 처리
            }
            break;
        }
      }
    },
    [isEnabled, focusedElement, navigateNext, navigatePrevious, navigateFirst, navigateLast]
  );

  // 포커스 이벤트 핸들러
  const handleFocusIn = useCallback(
    (event: FocusEvent) => {
      const target = event.target as HTMLElement;

      if (containerRef.current?.contains(target)) {
        const index = focusableElements.indexOf(target);
        if (index !== -1) {
          setCurrentIndex(index);
          setFocusedElement(target);
        }
      }
    },
    [focusableElements, containerRef]
  );

  // 제어 메서드들
  const enable = useCallback(() => {
    setIsEnabled(true);
  }, []);

  const disable = useCallback(() => {
    setIsEnabled(false);
  }, []);

  const refresh = useCallback(() => {
    updateFocusableElements();
  }, [updateFocusableElements]);

  const setMode = useCallback((mode: NavigationMode) => {
    globalKeyboardNavigationManager.setMode(mode);
  }, []);

  const focusElement = useCallback(
    (element: HTMLElement) => {
      const index = focusableElements.indexOf(element);
      if (index !== -1) {
        navigateTo(index);
      }
    },
    [focusableElements, navigateTo]
  );

  const getCurrentElement = useCallback(() => {
    return focusedElement;
  }, [focusedElement]);

  const getFocusableElements = useCallback(() => {
    return [...focusableElements];
  }, [focusableElements]);

  // 이벤트 리스너 설정
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // MutationObserver로 DOM 변경 감지
    const observer = new MutationObserver(() => {
      updateFocusableElements();
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'tabindex', 'aria-hidden'],
    });

    // 이벤트 리스너 등록
    container.addEventListener('keydown', handleKeyDown as any);
    container.addEventListener('focusin', handleFocusIn);

    // 초기 업데이트
    updateFocusableElements();

    return () => {
      observer.disconnect();
      container.removeEventListener('keydown', handleKeyDown as any);
      container.removeEventListener('focusin', handleFocusIn);
    };
  }, [containerRef, handleKeyDown, handleFocusIn, updateFocusableElements]);

  return {
    // 상태
    currentIndex,
    focusedElement,
    isEnabled,

    // 네비게이션 메서드
    navigateNext,
    navigatePrevious,
    navigateFirst,
    navigateLast,
    navigateTo,

    // 제어 메서드
    enable,
    disable,
    refresh,
    setMode,

    // 포커스 관리
    focusElement,
    getCurrentElement,
    getFocusableElements,
  };
};

// 키보드 단축키 훅
interface UseKeyboardShortcutsOptions {
  context?: string[];
  enabled?: boolean;
}

export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) => {
  const { context = ['global'], enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    // 단축키 등록
    const registeredIds: string[] = [];

    shortcuts.forEach(shortcut => {
      const shortcutWithContext = {
        ...shortcut,
        context,
        enabled,
      };

      globalKeyboardShortcutManager.register(shortcutWithContext);
      registeredIds.push(shortcut.id);
    });

    return () => {
      // 정리
      registeredIds.forEach(id => {
        globalKeyboardShortcutManager.unregister(id);
      });
    };
  }, [shortcuts, context, enabled]);

  return {
    enable: () => {
      shortcuts.forEach(shortcut => {
        globalKeyboardShortcutManager.enable(shortcut.id);
      });
    },
    disable: () => {
      shortcuts.forEach(shortcut => {
        globalKeyboardShortcutManager.disable(shortcut.id);
      });
    },
  };
};

// 키보드 트랩 훅
export const useKeyboardTrap = (
  elementRef: MutableRefObject<HTMLElement | null>,
  active: boolean = true
) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !active) return;

    globalKeyboardNavigationManager.getRovingManager().register(element);

    return () => {
      if (element) {
        globalKeyboardNavigationManager.getRovingManager().unregister(element);
      }
    };
  }, [elementRef, active]);

  return {
    activate: () => {
      const element = elementRef.current;
      if (element) {
        globalKeyboardNavigationManager.getRovingManager().setActive(element);
      }
    },
  };
};

// 로빙 탭인덱스 훅
export const useRovingTabIndex = (
  elementsRef: MutableRefObject<HTMLElement[]>,
  initialIndex: number = 0
) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    const elements = elementsRef.current;
    if (!elements.length) return;

    elements.forEach((element, index) => {
      if (element) {
        element.tabIndex = index === activeIndex ? 0 : -1;
      }
    });
  }, [elementsRef, activeIndex]);

  const setActive = useCallback(
    (index: number) => {
      if (index >= 0 && index < elementsRef.current.length) {
        setActiveIndex(index);
        elementsRef.current[index]?.focus();
      }
    },
    [elementsRef]
  );

  const next = useCallback(() => {
    const nextIndex = (activeIndex + 1) % elementsRef.current.length;
    setActive(nextIndex);
  }, [activeIndex, elementsRef, setActive]);

  const previous = useCallback(() => {
    const prevIndex = activeIndex > 0 ? activeIndex - 1 : elementsRef.current.length - 1;
    setActive(prevIndex);
  }, [activeIndex, elementsRef, setActive]);

  return {
    activeIndex,
    setActive,
    next,
    previous,
  };
};
