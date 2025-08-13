/**
 * KB StarBanking 키보드 네비게이션 메인 인덱스
 * 모든 키보드 네비게이션 기능을 통합하여 제공
 */

// 타입 정의
export * from './types';

// 핵심 매니저들
export {
  KeyboardShortcutManager,
  globalKeyboardShortcutManager,
} from './core/KeyboardShortcutManager';

export {
  KeyboardNavigationManager,
  globalKeyboardNavigationManager,
} from './core/KeyboardNavigationManager';

export { KeyboardTrapManagerImpl, globalKeyboardTrapManager } from './core/KeyboardTrapManager';

// 컴포넌트들
export { default as KeyboardDropdown } from './components/KeyboardDropdown';
export { default as KeyboardDatePicker } from './components/KeyboardDatePicker';
export { default as KeyboardNumberPad } from './components/KeyboardNumberPad';
export { default as VirtualKeyboard } from './components/VirtualKeyboard';
export { default as CommandPalette } from './components/CommandPalette';

// 훅들
export {
  useKeyboardNavigation,
  useKeyboardShortcuts,
  useKeyboardTrap,
  useRovingTabIndex,
} from './hooks/useKeyboardNavigation';

// 컨텍스트 제공자
export {
  default as KeyboardProvider,
  useKeyboard,
  useKeyboardSettings,
} from './contexts/KeyboardProvider';

// 유틸리티 함수들
export * from './utils/keyboardUtils';

// 기본 설정 및 상수
export const KEYBOARD_NAVIGATION_CONFIG = {
  // 기본 키 매핑
  DEFAULT_KEY_MAP: {
    up: ['ArrowUp', 'k'],
    down: ['ArrowDown', 'j'],
    left: ['ArrowLeft', 'h'],
    right: ['ArrowRight', 'l'],
    first: ['Home', 'g g'],
    last: ['End', 'G'],
    activate: ['Enter', 'Space'],
    escape: ['Escape'],
  },

  // 뱅킹 단축키
  BANKING_SHORTCUTS: {
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

  // 접근성 설정
  ACCESSIBILITY: {
    FOCUS_RING_COLOR: '#007bff',
    FOCUS_RING_WIDTH: '2px',
    FOCUS_RING_OFFSET: '2px',
    ANNOUNCEMENT_DELAY: 100,
    TRAP_ESCAPE_KEY: true,
    AUTO_ANNOUNCE: true,
  },

  // 성능 설정
  PERFORMANCE: {
    DEBOUNCE_DELAY: 16,
    MUTATION_THROTTLE: 100,
    MAX_HISTORY_SIZE: 50,
    CACHE_SIZE: 100,
  },
} as const;

// 키보드 네비게이션 초기화 함수
export const initializeKeyboardNavigation = (options?: {
  enableShortcuts?: boolean;
  enableNavigation?: boolean;
  enableTraps?: boolean;
  enableCommandPalette?: boolean;
}) => {
  const {
    enableShortcuts = true,
    enableNavigation = true,
    enableTraps = true,
    enableCommandPalette = true,
  } = options || {};

  if (enableShortcuts) {
    globalKeyboardShortcutManager.enable();
  }

  if (enableNavigation) {
    globalKeyboardNavigationManager.enable();
  }

  if (enableTraps) {
    globalKeyboardTrapManager.activate();
  }

  if (enableCommandPalette) {
  }

  // 개발 모드에서 디버그 정보
  if (process.env.NODE_ENV === 'development') {
  }
};

// 키보드 네비게이션 정리 함수
export const cleanupKeyboardNavigation = () => {
  globalKeyboardShortcutManager.destroy();
  globalKeyboardNavigationManager.destroy();
  globalKeyboardTrapManager.destroy();
};

// 기본 내보내기 (편의성을 위해)
export default {
  // 매니저들
  shortcutManager: globalKeyboardShortcutManager,
  navigationManager: globalKeyboardNavigationManager,
  trapManager: globalKeyboardTrapManager,

  // 초기화/정리
  initialize: initializeKeyboardNavigation,
  cleanup: cleanupKeyboardNavigation,

  // 설정
  config: KEYBOARD_NAVIGATION_CONFIG,
};
