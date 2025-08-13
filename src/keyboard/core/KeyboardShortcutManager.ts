/**
 * KB StarBanking 키보드 단축키 매니저
 * 전역 키보드 단축키 관리 및 처리
 */

import {
  KeyboardShortcut,
  KeyboardShortcutManagerOptions,
  BankingKeyboardShortcuts,
  NavigationMode
} from '../types';

export class KeyboardShortcutManager {
  private shortcuts = new Map<string, KeyboardShortcut>();
  private pressedKeys = new Set<string>();
  private options: Required<KeyboardShortcutManagerOptions>;
  private enabled = true;
  private currentContext: string[] = ['global'];
  private debugMode = false;

  constructor(options: KeyboardShortcutManagerOptions = {}) {
    this.options = {
      preventDefault: true,
      enabledByDefault: true,
      allowInInputs: false,
      caseSensitive: false,
      ...options
    };

    this.init();
  }

  private init() {
    document.addEventListener('keydown', this.handleKeyDown, { capture: true });
    document.addEventListener('keyup', this.handleKeyUp, { capture: true });
    document.addEventListener('blur', this.handleBlur, { capture: true });
    
    // 페이지 가시성 변경 시 키 상태 초기화
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    // 기본 뱅킹 단축키 등록
    this.registerDefaultBankingShortcuts();
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (!this.enabled) return;

    const key = this.normalizeKey(event.key);
    this.pressedKeys.add(key);

    // 특수 키 조합 처리
    const modifiers = this.getModifiers(event);
    const keyCombo = [...modifiers, key].join('+');

    if (this.debugMode) {
    }

    // 입력 필드에서의 단축키 처리 제한
    if (!this.options.allowInInputs && this.isInputElement(event.target as HTMLElement)) {
      // ESC나 특정 네비게이션 키는 허용
      if (!this.isAllowedInInput(key)) {
        return;
      }
    }

    // 단축키 매칭 및 실행
    const matchedShortcut = this.findMatchingShortcut(keyCombo);
    if (matchedShortcut) {
      if (this.options.preventDefault || matchedShortcut.preventDefault !== false) {
        event.preventDefault();
        event.stopPropagation();
      }

      try {
        matchedShortcut.action();
        this.logShortcutUsage(matchedShortcut.id);
      } catch (error) {
        console.error('Error executing keyboard shortcut:', matchedShortcut.id, error);
      }
    }
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    const key = this.normalizeKey(event.key);
    this.pressedKeys.delete(key);
  };

  private handleBlur = () => {
    // 포커스를 잃으면 키 상태 초기화
    this.pressedKeys.clear();
  };

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.pressedKeys.clear();
    }
  };

  private normalizeKey(key: string): string {
    const keyMap: Record<string, string> = {
      ' ': 'Space',
      'Control': 'Ctrl',
      'Meta': 'Cmd',
      'ArrowUp': 'Up',
      'ArrowDown': 'Down',
      'ArrowLeft': 'Left',
      'ArrowRight': 'Right'
    };

    const normalized = keyMap[key] || key;
    return this.options.caseSensitive ? normalized : normalized.toLowerCase();
  }

  private getModifiers(event: KeyboardEvent): string[] {
    const modifiers: string[] = [];
    
    if (event.ctrlKey) modifiers.push('ctrl');
    if (event.altKey) modifiers.push('alt');
    if (event.shiftKey) modifiers.push('shift');
    if (event.metaKey) modifiers.push('cmd');

    return modifiers;
  }

  private isInputElement(element: HTMLElement): boolean {
    const inputTypes = ['input', 'textarea', 'select'];
    const tagName = element.tagName.toLowerCase();
    
    return (
      inputTypes.includes(tagName) ||
      element.contentEditable === 'true' ||
      element.hasAttribute('contenteditable')
    );
  }

  private isAllowedInInput(key: string): boolean {
    const allowedKeys = ['escape', 'tab', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12'];
    return allowedKeys.includes(key.toLowerCase());
  }

  private findMatchingShortcut(keyCombo: string): KeyboardShortcut | null {
    for (const shortcut of this.shortcuts.values()) {
      if (!shortcut.enabled) continue;
      
      // 컨텍스트 확인
      if (shortcut.context && !this.isContextMatched(shortcut.context)) {
        continue;
      }

      // 키 조합 매칭
      for (const combo of shortcut.keys) {
        if (this.matchesKeyCombo(keyCombo, combo)) {
          return shortcut;
        }
      }
    }

    return null;
  }

  private isContextMatched(requiredContexts: string[]): boolean {
    return requiredContexts.some(context => this.currentContext.includes(context));
  }

  private matchesKeyCombo(pressed: string, pattern: string): boolean {
    const normalizedPressed = pressed.toLowerCase();
    const normalizedPattern = pattern.toLowerCase();
    
    return normalizedPressed === normalizedPattern;
  }

  private logShortcutUsage(shortcutId: string) {
    // 사용 통계 로깅 (프로덕션에서는 분석 서비스로 전송)
    if (this.debugMode) {
    }
  }

  // 공개 메서드들

  register(shortcut: KeyboardShortcut): void {
    if (this.shortcuts.has(shortcut.id)) {
      console.warn(`Keyboard shortcut with id "${shortcut.id}" already exists. Overriding.`);
    }

    this.shortcuts.set(shortcut.id, {
      enabled: this.options.enabledByDefault,
      preventDefault: this.options.preventDefault,
      ...shortcut
    });

    if (this.debugMode) {
    }
  }

  unregister(id: string): boolean {
    const removed = this.shortcuts.delete(id);
    
    if (this.debugMode && removed) {
    }
    
    return removed;
  }

  enable(id?: string): void {
    if (id) {
      const shortcut = this.shortcuts.get(id);
      if (shortcut) {
        shortcut.enabled = true;
      }
    } else {
      this.enabled = true;
    }
  }

  disable(id?: string): void {
    if (id) {
      const shortcut = this.shortcuts.get(id);
      if (shortcut) {
        shortcut.enabled = false;
      }
    } else {
      this.enabled = false;
    }
  }

  setContext(context: string[]): void {
    this.currentContext = context;
    
    if (this.debugMode) {
    }
  }

  getShortcuts(context?: string): KeyboardShortcut[] {
    const shortcuts = Array.from(this.shortcuts.values());
    
    if (context) {
      return shortcuts.filter(s => 
        !s.context || s.context.includes(context)
      );
    }
    
    return shortcuts;
  }

  toggleDebugMode(): void {
    this.debugMode = !this.debugMode;
  }

  destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown, { capture: true });
    document.removeEventListener('keyup', this.handleKeyUp, { capture: true });
    document.removeEventListener('blur', this.handleBlur, { capture: true });
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    this.shortcuts.clear();
    this.pressedKeys.clear();
  }

  private registerDefaultBankingShortcuts(): void {
    const bankingShortcuts: Array<{
      id: keyof BankingKeyboardShortcuts;
      keys: string[];
      description: string;
      action: () => void;
    }> = [
      {
        id: 'home',
        keys: ['alt+h', 'alt+home'],
        description: '홈으로 이동',
        action: () => this.navigateToPage('/')
      },
      {
        id: 'menu',
        keys: ['alt+m', 'ctrl+m'],
        description: '메뉴 열기',
        action: () => this.toggleMenu()
      },
      {
        id: 'back',
        keys: ['alt+left', 'backspace'],
        description: '뒤로가기',
        action: () => this.goBack()
      },
      {
        id: 'search',
        keys: ['ctrl+k', 'ctrl+/'],
        description: '검색 또는 명령 팔레트 열기',
        action: () => this.openCommandPalette()
      },
      {
        id: 'accountInquiry',
        keys: ['ctrl+shift+a'],
        description: '계좌 조회',
        action: () => this.navigateToPage('/accounts')
      },
      {
        id: 'transfer',
        keys: ['ctrl+t'],
        description: '이체하기',
        action: () => this.navigateToPage('/transfer')
      },
      {
        id: 'balanceInquiry',
        keys: ['ctrl+b'],
        description: '잔액 조회',
        action: () => this.navigateToPage('/balance')
      },
      {
        id: 'closeModal',
        keys: ['escape'],
        description: '모달 닫기',
        action: () => this.closeCurrentModal()
      },
      {
        id: 'confirmAction',
        keys: ['enter', 'ctrl+enter'],
        description: '확인/실행',
        action: () => this.confirmCurrentAction()
      },
      {
        id: 'toggleHighContrast',
        keys: ['ctrl+shift+h'],
        description: '고대비 모드 토글',
        action: () => this.toggleHighContrast()
      }
    ];

    bankingShortcuts.forEach(shortcut => {
      this.register({
        ...shortcut,
        context: ['global']
      });
    });
  }

  // 뱅킹 액션 메서드들
  private navigateToPage(path: string): void {
    // React Router 또는 페이지 네비게이션 로직
    if (window.history) {
      window.history.pushState({}, '', path);
      // 커스텀 네비게이션 이벤트 발생
      window.dispatchEvent(new CustomEvent('keyboard-navigation', { 
        detail: { path, source: 'keyboard' }
      }));
    }
  }

  private toggleMenu(): void {
    const menuEvent = new CustomEvent('keyboard-toggle-menu');
    document.dispatchEvent(menuEvent);
  }

  private goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    }
  }

  private openCommandPalette(): void {
    const commandEvent = new CustomEvent('keyboard-open-command-palette');
    document.dispatchEvent(commandEvent);
  }

  private closeCurrentModal(): void {
    const modalEvent = new CustomEvent('keyboard-close-modal');
    document.dispatchEvent(modalEvent);
  }

  private confirmCurrentAction(): void {
    const confirmEvent = new CustomEvent('keyboard-confirm-action');
    document.dispatchEvent(confirmEvent);
  }

  private toggleHighContrast(): void {
    const contrastEvent = new CustomEvent('keyboard-toggle-contrast');
    document.dispatchEvent(contrastEvent);
  }
}

// 전역 인스턴스
export const globalKeyboardShortcutManager = new KeyboardShortcutManager({
  preventDefault: true,
  enabledByDefault: true,
  allowInInputs: false
});

// 개발 모드에서 디버깅을 위한 전역 접근
if (process.env.NODE_ENV === 'development') {
  (window as any).__keyboardShortcutManager = globalKeyboardShortcutManager;
}