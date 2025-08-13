/**
 * KB StarBanking 키보드 네비게이션 시스템 타입 정의
 * 종합적인 키보드 네비게이션 및 단축키 지원
 */

// 키보드 단축키 정의
export interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  action: () => void;
  enabled?: boolean;
  context?: string[];
  preventDefault?: boolean;
}

// 키보드 단축키 매니저 옵션
export interface KeyboardShortcutManagerOptions {
  preventDefault?: boolean;
  enabledByDefault?: boolean;
  allowInInputs?: boolean;
  caseSensitive?: boolean;
}

// 키보드 네비게이션 모드
export type NavigationMode = 'normal' | 'vim' | 'accessibility' | 'custom';

// 키보드 네비게이션 방향
export type NavigationDirection = 'up' | 'down' | 'left' | 'right' | 'first' | 'last';

// 키보드 네비게이션 옵션
export interface KeyboardNavigationOptions {
  mode?: NavigationMode;
  wrap?: boolean;
  skipDisabled?: boolean;
  announceChanges?: boolean;
  customKeys?: Partial<NavigationKeyMap>;
  onNavigate?: (element: HTMLElement, direction: NavigationDirection) => void;
  onActivate?: (element: HTMLElement) => void;
}

// 네비게이션 키 매핑
export interface NavigationKeyMap {
  up: string[];
  down: string[];
  left: string[];
  right: string[];
  first: string[];
  last: string[];
  activate: string[];
  escape: string[];
}

// 키보드 트랩 관리자
export interface KeyboardTrapManager {
  activate: () => void;
  deactivate: () => void;
  isActive: boolean;
  addTrap: (element: HTMLElement, options?: KeyboardTrapOptions) => void;
  removeTrap: (element: HTMLElement) => void;
}

// 키보드 트랩 옵션
export interface KeyboardTrapOptions {
  autoFocus?: boolean;
  restoreFocus?: boolean;
  allowOutsideClick?: boolean;
  escapeDeactivates?: boolean;
  returnFocusOnDeactivate?: boolean;
}

// 로빙 탭인덱스 관리자
export interface RovingTabIndexManager {
  register: (element: HTMLElement) => void;
  unregister: (element: HTMLElement) => void;
  setActive: (element: HTMLElement) => void;
  getActive: () => HTMLElement | null;
  next: () => HTMLElement | null;
  previous: () => HTMLElement | null;
  first: () => HTMLElement | null;
  last: () => HTMLElement | null;
}

// 네비게이션 히스토리
export interface NavigationHistory {
  push: (element: HTMLElement) => void;
  pop: () => HTMLElement | null;
  clear: () => void;
  canGoBack: () => boolean;
  getCurrentPath: () => HTMLElement[];
}

// 커맨드 팔레트 항목
export interface CommandPaletteItem {
  id: string;
  title: string;
  description?: string;
  keywords: string[];
  category?: string;
  shortcut?: string[];
  action: () => void | Promise<void>;
  icon?: string;
  enabled?: boolean;
}

// 커맨드 팔레트 옵션
export interface CommandPaletteOptions {
  placeholder?: string;
  maxResults?: number;
  enableFuzzySearch?: boolean;
  showCategories?: boolean;
  showShortcuts?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

// 가상 키보드 옵션
export interface VirtualKeyboardOptions {
  type: 'numeric' | 'password' | 'text' | 'custom';
  layout: 'standard' | 'secure' | 'banking';
  scramble?: boolean;
  maxLength?: number;
  onInput?: (value: string) => void;
  onComplete?: (value: string) => void;
}

// 키보드 매크로
export interface KeyboardMacro {
  id: string;
  name: string;
  sequence: MacroAction[];
  enabled: boolean;
  trigger?: string[];
}

// 매크로 액션
export interface MacroAction {
  type: 'key' | 'click' | 'focus' | 'type' | 'wait';
  target?: string | HTMLElement;
  value?: string;
  delay?: number;
}

// 뱅킹 단축키 카테고리
export type BankingShortcutCategory =
  | 'navigation'
  | 'accounts'
  | 'transfer'
  | 'inquiry'
  | 'menu'
  | 'modal'
  | 'form'
  | 'accessibility';

// 뱅킹 특화 단축키
export interface BankingKeyboardShortcuts {
  // 네비게이션
  home: string[];
  menu: string[];
  back: string[];
  search: string[];

  // 계좌 관련
  accountInquiry: string[];
  accountDetail: string[];
  transactionHistory: string[];

  // 이체 관련
  transfer: string[];
  favoriteTransfer: string[];
  transferHistory: string[];

  // 조회 관련
  balanceInquiry: string[];
  cardInquiry: string[];
  loanInquiry: string[];

  // 모달/다이얼로그
  closeModal: string[];
  confirmAction: string[];
  cancelAction: string[];

  // 폼 관련
  submitForm: string[];
  resetForm: string[];
  nextField: string[];
  previousField: string[];

  // 접근성
  toggleHighContrast: string[];
  toggleScreenReader: string[];
  toggleKeyboardHelp: string[];
}

// 키보드 도움말 항목
export interface KeyboardHelpItem {
  category: BankingShortcutCategory;
  shortcut: string[];
  description: string;
  context?: string[];
  example?: string;
}

// 키보드 설정
export interface KeyboardSettings {
  enabled: boolean;
  mode: NavigationMode;
  shortcuts: Partial<BankingKeyboardShortcuts>;
  customShortcuts: KeyboardShortcut[];
  macros: KeyboardMacro[];
  vimMode: boolean;
  announceChanges: boolean;
  showFocusRing: boolean;
  preventTabTraps: boolean;
  enableCommandPalette: boolean;
}

// 키보드 이벤트 핸들러
export interface KeyboardEventHandler {
  onKeyDown?: (event: KeyboardEvent) => boolean | void;
  onKeyUp?: (event: KeyboardEvent) => boolean | void;
  onKeyPress?: (event: KeyboardEvent) => boolean | void;
}

// 키보드 컨텍스트
export interface KeyboardContext {
  currentFocus: HTMLElement | null;
  navigationMode: NavigationMode;
  shortcuts: Map<string, KeyboardShortcut>;
  history: NavigationHistory;
  trapManager: KeyboardTrapManager;
  settings: KeyboardSettings;
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (id: string) => void;
  setNavigationMode: (mode: NavigationMode) => void;
  focusElement: (element: HTMLElement, options?: FocusOptions) => void;
}

// 포커스 관리 옵션
export interface FocusOptions {
  preventScroll?: boolean;
  announce?: boolean;
  addToHistory?: boolean;
  force?: boolean;
}

// 키보드 네비게이션 상태
export interface KeyboardNavigationState {
  enabled: boolean;
  currentElement: HTMLElement | null;
  focusableElements: HTMLElement[];
  currentIndex: number;
  mode: NavigationMode;
  trapActive: boolean;
}

// 접근성 키보드 기능
export interface AccessibilityKeyboardFeatures {
  skipLinks: boolean;
  headingNavigation: boolean;
  landmarkNavigation: boolean;
  focusIndicator: boolean;
  announcements: boolean;
  highContrastMode: boolean;
}

// 모바일 키보드 지원
export interface MobileKeyboardSupport {
  virtualKeyboard: boolean;
  swipeGestures: boolean;
  voiceOver: boolean;
  talkBack: boolean;
  switchControl: boolean;
}

// 키보드 네비게이션 성능 메트릭
export interface KeyboardNavigationMetrics {
  totalShortcuts: number;
  activeShortcuts: number;
  averageResponseTime: number;
  errorRate: number;
  usageFrequency: Map<string, number>;
}

// 키보드 네비게이션 디버그 정보
export interface KeyboardNavigationDebugInfo {
  currentFocus: string;
  focusHistory: string[];
  activeShortcuts: string[];
  activeTraps: string[];
  performanceMetrics: KeyboardNavigationMetrics;
}
