/**
 * KB StarBanking 키보드 네비게이션 매니저
 * 포커스 관리, 탭 순서, 로빙 탭인덱스 구현
 */

import { announceFocusChange } from '../../accessibility/utils/focusManagement';
import {
  NavigationMode,
  NavigationDirection,
  KeyboardNavigationOptions,
  NavigationKeyMap,
  KeyboardNavigationState,
  RovingTabIndexManager,
  NavigationHistory
} from '../types';

export class KeyboardNavigationManager {
  private state: KeyboardNavigationState;
  private keyMap: NavigationKeyMap;
  private options: Required<KeyboardNavigationOptions>;
  private history: NavigationHistory;
  private rovingManager: RovingTabIndexManager;
  private listeners: Map<string, EventListener> = new Map();

  constructor(options: KeyboardNavigationOptions = {}) {
    this.options = {
      mode: 'normal',
      wrap: true,
      skipDisabled: true,
      announceChanges: true,
      customKeys: {},
      onNavigate: () => {},
      onActivate: () => {},
      ...options
    };

    this.keyMap = this.initializeKeyMap();
    this.state = this.initializeState();
    this.history = this.createNavigationHistory();
    this.rovingManager = this.createRovingTabIndexManager();

    this.init();
  }

  private initializeKeyMap(): NavigationKeyMap {
    const defaultKeyMap: NavigationKeyMap = {
      up: ['ArrowUp', 'k'],
      down: ['ArrowDown', 'j'],
      left: ['ArrowLeft', 'h'],
      right: ['ArrowRight', 'l'],
      first: ['Home', 'g g'],
      last: ['End', 'G'],
      activate: ['Enter', 'Space'],
      escape: ['Escape']
    };

    // Vim 모드 추가 키 매핑
    if (this.options.mode === 'vim') {
      defaultKeyMap.up.push('k');
      defaultKeyMap.down.push('j');
      defaultKeyMap.left.push('h');
      defaultKeyMap.right.push('l');
      defaultKeyMap.first.push('gg');
      defaultKeyMap.last.push('G');
    }

    // 커스텀 키 매핑 적용
    return { ...defaultKeyMap, ...this.options.customKeys };
  }

  private initializeState(): KeyboardNavigationState {
    return {
      enabled: true,
      currentElement: null,
      focusableElements: [],
      currentIndex: -1,
      mode: this.options.mode,
      trapActive: false
    };
  }

  private init(): void {
    this.updateFocusableElements();
    this.bindEventListeners();
    this.setupMutationObserver();
  }

  private bindEventListeners(): void {
    const keydownHandler = this.handleKeyDown.bind(this);
    const focusinHandler = this.handleFocusIn.bind(this);
    const focusoutHandler = this.handleFocusOut.bind(this);

    document.addEventListener('keydown', keydownHandler);
    document.addEventListener('focusin', focusinHandler);
    document.addEventListener('focusout', focusoutHandler);

    this.listeners.set('keydown', keydownHandler);
    this.listeners.set('focusin', focusinHandler);
    this.listeners.set('focusout', focusoutHandler);
  }

  private setupMutationObserver(): void {
    const observer = new MutationObserver(() => {
      this.updateFocusableElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['tabindex', 'disabled', 'aria-hidden']
    });
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.state.enabled) return;

    const direction = this.getNavigationDirection(event);
    if (!direction) return;

    event.preventDefault();
    this.navigate(direction);
  };

  private handleFocusIn = (event: FocusEvent): void => {
    const target = event.target as HTMLElement;
    if (target && this.isFocusableElement(target)) {
      this.updateCurrentElement(target);
    }
  };

  private handleFocusOut = (event: FocusEvent): void => {
    // 포커스가 완전히 벗어날 때만 처리
    setTimeout(() => {
      if (!document.activeElement || document.activeElement === document.body) {
        this.state.currentElement = null;
        this.state.currentIndex = -1;
      }
    }, 0);
  };

  private getNavigationDirection(event: KeyboardEvent): NavigationDirection | null {
    const key = event.key;
    
    for (const [direction, keys] of Object.entries(this.keyMap)) {
      if (keys.includes(key)) {
        return direction as NavigationDirection;
      }
    }

    return null;
  }

  private navigate(direction: NavigationDirection): void {
    if (this.state.focusableElements.length === 0) {
      this.updateFocusableElements();
      if (this.state.focusableElements.length === 0) return;
    }

    let nextIndex: number;

    switch (direction) {
      case 'up':
      case 'left':
        nextIndex = this.getPreviousIndex();
        break;
      case 'down':
      case 'right':
        nextIndex = this.getNextIndex();
        break;
      case 'first':
        nextIndex = 0;
        break;
      case 'last':
        nextIndex = this.state.focusableElements.length - 1;
        break;
      default:
        return;
    }

    if (nextIndex >= 0 && nextIndex < this.state.focusableElements.length) {
      const nextElement = this.state.focusableElements[nextIndex];
      this.focusElement(nextElement, direction);
    }
  }

  private getPreviousIndex(): number {
    if (this.state.currentIndex <= 0) {
      return this.options.wrap ? this.state.focusableElements.length - 1 : 0;
    }
    return this.state.currentIndex - 1;
  }

  private getNextIndex(): number {
    if (this.state.currentIndex >= this.state.focusableElements.length - 1) {
      return this.options.wrap ? 0 : this.state.focusableElements.length - 1;
    }
    return this.state.currentIndex + 1;
  }

  private focusElement(element: HTMLElement, direction?: NavigationDirection): void {
    if (!this.isFocusableElement(element)) return;

    // 로빙 탭인덱스 업데이트
    this.rovingManager.setActive(element);

    // 포커스 설정
    element.focus({ preventScroll: false });

    // 상태 업데이트
    this.updateCurrentElement(element);

    // 히스토리에 추가
    this.history.push(element);

    // 스크린 리더 공지
    if (this.options.announceChanges) {
      this.announceNavigation(element, direction);
    }

    // 콜백 실행
    if (direction) {
      this.options.onNavigate(element, direction);
    }
  }

  private updateCurrentElement(element: HTMLElement): void {
    this.state.currentElement = element;
    this.state.currentIndex = this.state.focusableElements.indexOf(element);
  }

  private updateFocusableElements(): void {
    const selector = [
      'a[href]:not([disabled])',
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]:not([contenteditable="false"])',
      'audio[controls]',
      'video[controls]',
      'details>summary:first-of-type'
    ].join(',');

    const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    
    this.state.focusableElements = elements.filter(element => {
      return this.isFocusableElement(element) && 
             (!this.options.skipDisabled || !this.isDisabled(element));
    });

    // 현재 포커스된 요소의 인덱스 업데이트
    if (this.state.currentElement) {
      this.state.currentIndex = this.state.focusableElements.indexOf(this.state.currentElement);
    }
  }

  private isFocusableElement(element: HTMLElement): boolean {
    // 숨겨진 요소 제외
    if (!this.isVisible(element)) return false;
    
    // aria-hidden 요소 제외
    if (element.getAttribute('aria-hidden') === 'true') return false;
    
    // 비활성화된 요소 제외 (옵션에 따라)
    if (this.options.skipDisabled && this.isDisabled(element)) return false;

    return true;
  }

  private isVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.visibility !== 'hidden' &&
      style.display !== 'none' &&
      style.opacity !== '0'
    );
  }

  private isDisabled(element: HTMLElement): boolean {
    return (
      element.hasAttribute('disabled') ||
      element.getAttribute('aria-disabled') === 'true' ||
      (element as any).disabled === true
    );
  }

  private announceNavigation(element: HTMLElement, direction?: NavigationDirection): void {
    const label = this.getElementLabel(element);
    const role = element.getAttribute('role') || element.tagName.toLowerCase();
    const message = `${label} ${role}${direction ? ` (${direction}으로 이동)` : ''}`;
    
    announceFocusChange(element, message);
  }

  private getElementLabel(element: HTMLElement): string {
    return (
      element.getAttribute('aria-label') ||
      element.getAttribute('title') ||
      element.textContent?.trim() ||
      element.getAttribute('alt') ||
      element.getAttribute('placeholder') ||
      '레이블 없음'
    );
  }

  private createNavigationHistory(): NavigationHistory {
    const history: HTMLElement[] = [];
    const maxHistorySize = 50;

    return {
      push: (element: HTMLElement) => {
        // 중복 제거
        const existingIndex = history.findIndex(item => item === element);
        if (existingIndex !== -1) {
          history.splice(existingIndex, 1);
        }
        
        history.push(element);
        
        // 최대 크기 제한
        if (history.length > maxHistorySize) {
          history.shift();
        }
      },
      
      pop: (): HTMLElement | null => {
        return history.pop() || null;
      },
      
      clear: () => {
        history.length = 0;
      },
      
      canGoBack: (): boolean => {
        return history.length > 1;
      },
      
      getCurrentPath: (): HTMLElement[] => {
        return [...history];
      }
    };
  }

  private createRovingTabIndexManager(): RovingTabIndexManager {
    const managedElements = new Set<HTMLElement>();
    let activeElement: HTMLElement | null = null;

    return {
      register: (element: HTMLElement) => {
        managedElements.add(element);
        element.tabIndex = activeElement === element ? 0 : -1;
      },
      
      unregister: (element: HTMLElement) => {
        managedElements.delete(element);
        if (activeElement === element) {
          activeElement = null;
        }
      },
      
      setActive: (element: HTMLElement) => {
        if (!managedElements.has(element)) return;
        
        // 이전 활성 요소의 tabIndex를 -1로 설정
        if (activeElement && managedElements.has(activeElement)) {
          activeElement.tabIndex = -1;
        }
        
        // 새 활성 요소의 tabIndex를 0으로 설정
        element.tabIndex = 0;
        activeElement = element;
      },
      
      getActive: () => activeElement,
      
      next: (): HTMLElement | null => {
        const elements = Array.from(managedElements);
        const currentIndex = activeElement ? elements.indexOf(activeElement) : -1;
        const nextIndex = (currentIndex + 1) % elements.length;
        const nextElement = elements[nextIndex] || null;
        
        if (nextElement) {
          this.setActive(nextElement);
        }
        
        return nextElement;
      },
      
      previous: (): HTMLElement | null => {
        const elements = Array.from(managedElements);
        const currentIndex = activeElement ? elements.indexOf(activeElement) : -1;
        const prevIndex = currentIndex <= 0 ? elements.length - 1 : currentIndex - 1;
        const prevElement = elements[prevIndex] || null;
        
        if (prevElement) {
          this.setActive(prevElement);
        }
        
        return prevElement;
      },
      
      first: (): HTMLElement | null => {
        const elements = Array.from(managedElements);
        const firstElement = elements[0] || null;
        
        if (firstElement) {
          this.setActive(firstElement);
        }
        
        return firstElement;
      },
      
      last: (): HTMLElement | null => {
        const elements = Array.from(managedElements);
        const lastElement = elements[elements.length - 1] || null;
        
        if (lastElement) {
          this.setActive(lastElement);
        }
        
        return lastElement;
      }
    };
  }

  // 공개 메서드들
  
  enable(): void {
    this.state.enabled = true;
  }

  disable(): void {
    this.state.enabled = false;
  }

  setMode(mode: NavigationMode): void {
    this.options.mode = mode;
    this.state.mode = mode;
    this.keyMap = this.initializeKeyMap();
  }

  getCurrentElement(): HTMLElement | null {
    return this.state.currentElement;
  }

  getFocusableElements(): HTMLElement[] {
    return [...this.state.focusableElements];
  }

  getNavigationHistory(): NavigationHistory {
    return this.history;
  }

  getRovingManager(): RovingTabIndexManager {
    return this.rovingManager;
  }

  refresh(): void {
    this.updateFocusableElements();
  }

  destroy(): void {
    // 이벤트 리스너 제거
    for (const [event, listener] of this.listeners) {
      document.removeEventListener(event, listener);
    }
    
    this.listeners.clear();
    this.history.clear();
    this.state.focusableElements.length = 0;
  }
}

// 전역 인스턴스
export const globalKeyboardNavigationManager = new KeyboardNavigationManager();

// 개발 모드에서 디버깅을 위한 전역 접근
if (process.env.NODE_ENV === 'development') {
  (window as any).__keyboardNavigationManager = globalKeyboardNavigationManager;
}