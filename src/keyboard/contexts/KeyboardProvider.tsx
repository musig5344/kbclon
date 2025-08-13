/**
 * KB StarBanking 키보드 네비게이션 컨텍스트 제공자
 * 전역 키보드 네비게이션 상태 및 설정 관리
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';

import CommandPalette from '../components/CommandPalette';
import { globalKeyboardNavigationManager } from '../core/KeyboardNavigationManager';
import { globalKeyboardShortcutManager } from '../core/KeyboardShortcutManager';
import { globalKeyboardTrapManager } from '../core/KeyboardTrapManager';
import {
  KeyboardContext,
  KeyboardSettings,
  KeyboardShortcut,
  NavigationMode,
  FocusOptions,
  NavigationHistory,
  KeyboardTrapManager,
  CommandPaletteItem,
  BankingKeyboardShortcuts,
} from '../types';

interface KeyboardProviderProps {
  children: ReactNode;
  initialSettings?: Partial<KeyboardSettings>;
  onSettingsChange?: (settings: KeyboardSettings) => void;
}

// 기본 설정
const defaultSettings: KeyboardSettings = {
  enabled: true,
  mode: 'normal',
  shortcuts: {
    home: ['alt+h', 'alt+home'],
    menu: ['alt+m', 'ctrl+m'],
    back: ['alt+left', 'backspace'],
    search: ['ctrl+k', 'ctrl+/'],
    accountInquiry: ['ctrl+shift+a'],
    accountDetail: ['ctrl+shift+d'],
    transactionHistory: ['ctrl+shift+t'],
    transfer: ['ctrl+t'],
    favoriteTransfer: ['ctrl+shift+f'],
    transferHistory: ['ctrl+shift+h'],
    balanceInquiry: ['ctrl+b'],
    cardInquiry: ['ctrl+shift+c'],
    loanInquiry: ['ctrl+shift+l'],
    closeModal: ['escape'],
    confirmAction: ['enter', 'ctrl+enter'],
    cancelAction: ['escape'],
    submitForm: ['ctrl+enter'],
    resetForm: ['ctrl+r'],
    nextField: ['tab'],
    previousField: ['shift+tab'],
    toggleHighContrast: ['ctrl+shift+h'],
    toggleScreenReader: ['ctrl+shift+s'],
    toggleKeyboardHelp: ['ctrl+shift+?'],
  },
  customShortcuts: [],
  macros: [],
  vimMode: false,
  announceChanges: true,
  showFocusRing: true,
  preventTabTraps: true,
  enableCommandPalette: true,
};

// 기본 명령 팔레트 아이템들
const defaultCommandPaletteItems: CommandPaletteItem[] = [
  // 네비게이션
  {
    id: 'nav-home',
    title: '홈으로 이동',
    description: '메인 대시보드로 이동합니다',
    keywords: ['홈', 'home', '메인', '대시보드'],
    category: '네비게이션',
    shortcut: ['Alt', 'H'],
    action: () => (window.location.href = '/'),
    icon: '🏠',
  },
  {
    id: 'nav-menu',
    title: '메뉴 열기',
    description: '전체 메뉴를 열거나 닫습니다',
    keywords: ['메뉴', 'menu', '네비게이션'],
    category: '네비게이션',
    shortcut: ['Alt', 'M'],
    action: () => document.dispatchEvent(new CustomEvent('keyboard-toggle-menu')),
    icon: '📱',
  },

  // 계좌 관련
  {
    id: 'account-inquiry',
    title: '계좌 조회',
    description: '내 계좌 정보를 조회합니다',
    keywords: ['계좌', 'account', '조회', '잔액'],
    category: '계좌',
    shortcut: ['Ctrl', 'Shift', 'A'],
    action: () => (window.location.href = '/accounts'),
    icon: '💳',
  },
  {
    id: 'balance-inquiry',
    title: '잔액 조회',
    description: '계좌 잔액을 빠르게 조회합니다',
    keywords: ['잔액', 'balance', '조회'],
    category: '계좌',
    shortcut: ['Ctrl', 'B'],
    action: () => (window.location.href = '/balance'),
    icon: '💰',
  },

  // 이체 관련
  {
    id: 'transfer',
    title: '이체하기',
    description: '다른 계좌로 이체합니다',
    keywords: ['이체', 'transfer', '송금'],
    category: '이체',
    shortcut: ['Ctrl', 'T'],
    action: () => (window.location.href = '/transfer'),
    icon: '💸',
  },
  {
    id: 'transfer-history',
    title: '이체 내역',
    description: '이체 거래 내역을 조회합니다',
    keywords: ['이체', '내역', 'history', '거래'],
    category: '이체',
    shortcut: ['Ctrl', 'Shift', 'H'],
    action: () => (window.location.href = '/transfer/history'),
    icon: '📋',
  },

  // 접근성
  {
    id: 'toggle-high-contrast',
    title: '고대비 모드 토글',
    description: '고대비 모드를 켜거나 끕니다',
    keywords: ['고대비', 'contrast', '접근성', '시각'],
    category: '접근성',
    shortcut: ['Ctrl', 'Shift', 'H'],
    action: () => document.dispatchEvent(new CustomEvent('keyboard-toggle-contrast')),
    icon: '🎨',
  },
  {
    id: 'keyboard-help',
    title: '키보드 도움말',
    description: '키보드 단축키 도움말을 표시합니다',
    keywords: ['도움말', 'help', '단축키', 'shortcut'],
    category: '도움말',
    shortcut: ['Ctrl', 'Shift', '?'],
    action: () => document.dispatchEvent(new CustomEvent('keyboard-show-help')),
    icon: '❓',
  },
];

// 컨텍스트 생성
const KeyboardContext = createContext<KeyboardContext | null>(null);

export const KeyboardProvider: React.FC<KeyboardProviderProps> = ({
  children,
  initialSettings,
  onSettingsChange,
}) => {
  const [settings, setSettings] = useState<KeyboardSettings>({
    ...defaultSettings,
    ...initialSettings,
  });

  const [currentFocus, setCurrentFocus] = useState<HTMLElement | null>(null);
  const [shortcuts, setShortcuts] = useState<Map<string, KeyboardShortcut>>(new Map());
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandPaletteItems, setCommandPaletteItems] = useState<CommandPaletteItem[]>(
    defaultCommandPaletteItems
  );

  // 설정 변경 핸들러
  const updateSettings = useCallback(
    (newSettings: Partial<KeyboardSettings>) => {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      onSettingsChange?.(updatedSettings);

      // 글로벌 매니저들 업데이트
      if (newSettings.mode) {
        globalKeyboardNavigationManager.setMode(newSettings.mode);
      }

      if (newSettings.enabled !== undefined) {
        if (newSettings.enabled) {
          globalKeyboardShortcutManager.enable();
          globalKeyboardNavigationManager.enable();
        } else {
          globalKeyboardShortcutManager.disable();
          globalKeyboardNavigationManager.disable();
        }
      }
    },
    [settings, onSettingsChange]
  );

  // 단축키 등록
  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    globalKeyboardShortcutManager.register(shortcut);
    setShortcuts(prev => new Map(prev.set(shortcut.id, shortcut)));
  }, []);

  // 단축키 해제
  const unregisterShortcut = useCallback((id: string) => {
    globalKeyboardShortcutManager.unregister(id);
    setShortcuts(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  // 네비게이션 모드 설정
  const setNavigationMode = useCallback(
    (mode: NavigationMode) => {
      updateSettings({ mode });
    },
    [updateSettings]
  );

  // 포커스 관리
  const focusElement = useCallback(
    (element: HTMLElement, options: FocusOptions = {}) => {
      const {
        preventScroll = false,
        announce = true,
        addToHistory = true,
        force = false,
      } = options;

      if (!force && element === currentFocus) return;

      try {
        element.focus({ preventScroll });
        setCurrentFocus(element);

        if (addToHistory) {
          globalKeyboardNavigationManager.getNavigationHistory().push(element);
        }

        if (announce && settings.announceChanges) {
          const label =
            element.getAttribute('aria-label') ||
            element.textContent?.trim() ||
            element.tagName.toLowerCase();

          // 스크린 리더 공지
          const announcement = document.createElement('div');
          announcement.setAttribute('aria-live', 'polite');
          announcement.style.position = 'absolute';
          announcement.style.left = '-10000px';
          announcement.textContent = `${label}로 이동됨`;

          document.body.appendChild(announcement);
          setTimeout(() => document.body.removeChild(announcement), 1000);
        }
      } catch (error) {
        console.warn('Focus failed:', error);
      }
    },
    [currentFocus, settings.announceChanges]
  );

  // 명령 팔레트 열기/닫기
  const openCommandPalette = useCallback(() => {
    if (settings.enableCommandPalette) {
      setCommandPaletteOpen(true);
    }
  }, [settings.enableCommandPalette]);

  const closeCommandPalette = useCallback(() => {
    setCommandPaletteOpen(false);
  }, []);

  // 명령 실행
  const executeCommand = useCallback((item: CommandPaletteItem) => {}, []);

  // 초기 설정
  useEffect(() => {
    // 기본 단축키들 등록
    Object.entries(settings.shortcuts).forEach(([key, keyCombo]) => {
      if (keyCombo && keyCombo.length > 0) {
        registerShortcut({
          id: `banking-${key}`,
          keys: keyCombo,
          description: `뱅킹 단축키: ${key}`,
          action: () => {
            // 각 단축키별 기본 액션
            switch (key) {
              case 'search':
                openCommandPalette();
                break;
              default:
                document.dispatchEvent(new CustomEvent(`keyboard-${key}`));
            }
          },
        });
      }
    });

    // 커스텀 단축키들 등록
    settings.customShortcuts.forEach(registerShortcut);

    // 전역 이벤트 리스너
    const handleCommandPaletteToggle = () => {
      if (commandPaletteOpen) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
    };

    const handleFocusChange = (event: FocusEvent) => {
      setCurrentFocus(event.target as HTMLElement);
    };

    document.addEventListener('keyboard-open-command-palette', handleCommandPaletteToggle);
    document.addEventListener('focusin', handleFocusChange);

    // 포커스 링 관리
    if (settings.showFocusRing) {
      const cleanup = manageFocusRing();
      return () => {
        cleanup();
        document.removeEventListener('keyboard-open-command-palette', handleCommandPaletteToggle);
        document.removeEventListener('focusin', handleFocusChange);
      };
    }

    return () => {
      document.removeEventListener('keyboard-open-command-palette', handleCommandPaletteToggle);
      document.removeEventListener('focusin', handleFocusChange);
    };
  }, [settings, registerShortcut, openCommandPalette, closeCommandPalette, commandPaletteOpen]);

  // 포커스 링 관리 함수
  const manageFocusRing = useCallback(() => {
    let hadKeyboardEvent = false;

    const keydownHandler = () => {
      hadKeyboardEvent = true;
    };

    const mousedownHandler = () => {
      hadKeyboardEvent = false;
    };

    const focusHandler = (event: FocusEvent) => {
      const target = event.target as HTMLElement;

      if (hadKeyboardEvent || target.matches(':focus-visible')) {
        target.classList.add('kb-focus-visible');
      } else {
        target.classList.remove('kb-focus-visible');
      }
    };

    const blurHandler = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      target.classList.remove('kb-focus-visible');
    };

    document.addEventListener('keydown', keydownHandler, true);
    document.addEventListener('mousedown', mousedownHandler, true);
    document.addEventListener('focus', focusHandler, true);
    document.addEventListener('blur', blurHandler, true);

    // CSS 스타일 주입
    const style = document.createElement('style');
    style.textContent = `
      .kb-focus-visible {
        outline: 2px solid #007bff !important;
        outline-offset: 2px !important;
        border-radius: 4px;
      }
      
      :focus:not(.kb-focus-visible) {
        outline: none;
      }
      
      @media (prefers-reduced-motion: reduce) {
        * {
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('keydown', keydownHandler, true);
      document.removeEventListener('mousedown', mousedownHandler, true);
      document.removeEventListener('focus', focusHandler, true);
      document.removeEventListener('blur', blurHandler, true);
      style.remove();
    };
  }, []);

  // 컨텍스트 값
  const contextValue: KeyboardContext = {
    currentFocus,
    navigationMode: settings.mode,
    shortcuts,
    history: globalKeyboardNavigationManager.getNavigationHistory(),
    trapManager: globalKeyboardTrapManager,
    settings,
    registerShortcut,
    unregisterShortcut,
    setNavigationMode,
    focusElement,
  };

  return (
    <KeyboardContext.Provider value={contextValue}>
      {children}

      {/* 명령 팔레트 */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        items={commandPaletteItems}
        onClose={closeCommandPalette}
        onExecute={executeCommand}
        placeholder='명령어를 검색하세요... (예: 이체하기, 계좌조회)'
        maxResults={20}
        enableFuzzySearch={true}
        showCategories={true}
        showShortcuts={true}
        theme='light'
      />
    </KeyboardContext.Provider>
  );
};

// 훅 함수
export const useKeyboard = (): KeyboardContext => {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error('useKeyboard must be used within a KeyboardProvider');
  }
  return context;
};

// 설정 훅
export const useKeyboardSettings = () => {
  const context = useKeyboard();

  return {
    settings: context.settings,
    updateSettings: (newSettings: Partial<KeyboardSettings>) => {
      // 컨텍스트를 통해 설정 업데이트
    },
    resetSettings: () => {
      // 기본 설정으로 리셋
    },
  };
};

export default KeyboardProvider;
