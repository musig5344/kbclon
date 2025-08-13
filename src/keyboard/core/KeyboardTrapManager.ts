/**
 * KB StarBanking 키보드 트랩 매니저
 * 모달, 다이얼로그, 드롭다운에서 포커스 트랩 관리
 */

import { getFocusableElements } from '../../accessibility/utils/focusManagement';
import { KeyboardTrapManager, KeyboardTrapOptions } from '../types';

interface TrapInstance {
  element: HTMLElement;
  options: Required<KeyboardTrapOptions>;
  previousFocus: HTMLElement | null;
  firstFocusable: HTMLElement | null;
  lastFocusable: HTMLElement | null;
  active: boolean;
  listeners: Map<string, EventListener>;
}

export class KeyboardTrapManagerImpl implements KeyboardTrapManager {
  private traps = new Map<HTMLElement, TrapInstance>();
  private activeTrap: TrapInstance | null = null;
  private isActive = false;

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;

    // 모든 활성 트랩 비활성화
    for (const trap of this.traps.values()) {
      if (trap.active) {
        this.deactivateTrap(trap);
      }
    }
  }

  addTrap(element: HTMLElement, options: KeyboardTrapOptions = {}): void {
    if (this.traps.has(element)) {
      console.warn('Keyboard trap already exists for element:', element);
      return;
    }

    const trapOptions: Required<KeyboardTrapOptions> = {
      autoFocus: true,
      restoreFocus: true,
      allowOutsideClick: false,
      escapeDeactivates: true,
      returnFocusOnDeactivate: true,
      ...options,
    };

    const trap: TrapInstance = {
      element,
      options: trapOptions,
      previousFocus: null,
      firstFocusable: null,
      lastFocusable: null,
      active: false,
      listeners: new Map(),
    };

    this.traps.set(element, trap);
    this.activateTrap(trap);
  }

  removeTrap(element: HTMLElement): void {
    const trap = this.traps.get(element);
    if (!trap) return;

    if (trap.active) {
      this.deactivateTrap(trap);
    }

    this.traps.delete(element);
  }

  get isActive(): boolean {
    return this.isActive;
  }

  private activateTrap(trap: TrapInstance): void {
    if (trap.active || !this.isActive) return;

    // 이전 활성 트랩 비활성화
    if (this.activeTrap && this.activeTrap !== trap) {
      this.deactivateTrap(this.activeTrap);
    }

    trap.active = true;
    this.activeTrap = trap;

    // 현재 포커스 저장
    trap.previousFocus = document.activeElement as HTMLElement;

    // 포커스 가능한 요소들 업데이트
    this.updateFocusableElements(trap);

    // 이벤트 리스너 등록
    this.bindTrapListeners(trap);

    // 초기 포커스 설정
    if (trap.options.autoFocus) {
      this.setInitialFocus(trap);
    }

    // 트랩이 활성화됨을 알림
    this.announceTrapActivation(trap);
  }

  private deactivateTrap(trap: TrapInstance): void {
    if (!trap.active) return;

    trap.active = false;

    // 이벤트 리스너 제거
    this.unbindTrapListeners(trap);

    // 포커스 복원
    if (trap.options.returnFocusOnDeactivate && trap.previousFocus) {
      try {
        trap.previousFocus.focus();
      } catch (error) {
        console.warn('Failed to restore focus:', error);
      }
    }

    // 활성 트랩 해제
    if (this.activeTrap === trap) {
      this.activeTrap = null;
    }

    // 트랩이 비활성화됨을 알림
    this.announceTrapDeactivation(trap);
  }

  private updateFocusableElements(trap: TrapInstance): void {
    const focusableElements = getFocusableElements(trap.element);

    trap.firstFocusable = focusableElements[0] || null;
    trap.lastFocusable = focusableElements[focusableElements.length - 1] || null;
  }

  private bindTrapListeners(trap: TrapInstance): void {
    const keydownHandler = this.createKeydownHandler(trap);
    const focusinHandler = this.createFocusinHandler(trap);
    const clickHandler = this.createClickHandler(trap);

    document.addEventListener('keydown', keydownHandler, { capture: true });
    document.addEventListener('focusin', focusinHandler, { capture: true });

    if (trap.options.allowOutsideClick) {
      document.addEventListener('click', clickHandler, { capture: true });
    }

    trap.listeners.set('keydown', keydownHandler);
    trap.listeners.set('focusin', focusinHandler);
    if (clickHandler) {
      trap.listeners.set('click', clickHandler);
    }
  }

  private unbindTrapListeners(trap: TrapInstance): void {
    for (const [event, listener] of trap.listeners) {
      document.removeEventListener(event, listener, { capture: true });
    }
    trap.listeners.clear();
  }

  private createKeydownHandler(trap: TrapInstance): EventListener {
    return (event: Event) => {
      const keyEvent = event as KeyboardEvent;

      if (!trap.active) return;

      // ESC 키 처리
      if (keyEvent.key === 'Escape' && trap.options.escapeDeactivates) {
        event.preventDefault();
        this.deactivateTrap(trap);
        return;
      }

      // Tab 키 트랩 처리
      if (keyEvent.key === 'Tab') {
        this.handleTabKey(keyEvent, trap);
      }
    };
  }

  private createFocusinHandler(trap: TrapInstance): EventListener {
    return (event: Event) => {
      if (!trap.active) return;

      const target = event.target as HTMLElement;

      // 트랩 내부 요소면 허용
      if (trap.element.contains(target)) {
        return;
      }

      // 트랩 외부로 포커스가 이동했을 때
      event.preventDefault();
      event.stopImmediatePropagation();

      // 첫 번째 포커스 가능한 요소로 이동
      if (trap.firstFocusable) {
        trap.firstFocusable.focus();
      }
    };
  }

  private createClickHandler(trap: TrapInstance): EventListener | null {
    if (!trap.options.allowOutsideClick) return null;

    return (event: Event) => {
      if (!trap.active) return;

      const target = event.target as HTMLElement;

      // 트랩 외부 클릭 시 트랩 비활성화
      if (!trap.element.contains(target)) {
        this.deactivateTrap(trap);
      }
    };
  }

  private handleTabKey(event: KeyboardEvent, trap: TrapInstance): void {
    if (!trap.firstFocusable || !trap.lastFocusable) {
      event.preventDefault();
      return;
    }

    const currentFocus = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      // Shift + Tab (역방향)
      if (currentFocus === trap.firstFocusable) {
        event.preventDefault();
        trap.lastFocusable.focus();
      }
    } else {
      // Tab (정방향)
      if (currentFocus === trap.lastFocusable) {
        event.preventDefault();
        trap.firstFocusable.focus();
      }
    }
  }

  private setInitialFocus(trap: TrapInstance): void {
    // 자동 포커스 요소 찾기
    const autoFocusElement = trap.element.querySelector('[autofocus]') as HTMLElement;
    if (autoFocusElement && this.isFocusable(autoFocusElement)) {
      autoFocusElement.focus();
      return;
    }

    // 첫 번째 포커스 가능한 요소로 포커스
    if (trap.firstFocusable) {
      trap.firstFocusable.focus();
      return;
    }

    // 트랩 요소 자체에 포커스 (마지막 수단)
    if (this.isFocusable(trap.element)) {
      trap.element.focus();
    } else {
      // 포커스 가능하도록 만들고 포커스
      trap.element.tabIndex = -1;
      trap.element.focus();
    }
  }

  private isFocusable(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);

    return (
      !element.hasAttribute('disabled') &&
      element.getAttribute('aria-disabled') !== 'true' &&
      style.visibility !== 'hidden' &&
      style.display !== 'none' &&
      element.offsetParent !== null
    );
  }

  private announceTrapActivation(trap: TrapInstance): void {
    const message =
      trap.element.getAttribute('aria-label') ||
      trap.element.getAttribute('role') ||
      '다이얼로그가 열렸습니다. ESC 키를 눌러 닫을 수 있습니다.';

    this.announceToScreenReader(message);
  }

  private announceTrapDeactivation(trap: TrapInstance): void {
    const message = '다이얼로그가 닫혔습니다.';
    this.announceToScreenReader(message);
  }

  private announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcement.textContent = message;

    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 1000);
  }

  // 공개 메서드들

  getActiveTrap(): HTMLElement | null {
    return this.activeTrap?.element || null;
  }

  getAllTraps(): HTMLElement[] {
    return Array.from(this.traps.keys());
  }

  isTrapActive(element: HTMLElement): boolean {
    const trap = this.traps.get(element);
    return trap?.active || false;
  }

  refreshTrap(element: HTMLElement): void {
    const trap = this.traps.get(element);
    if (trap && trap.active) {
      this.updateFocusableElements(trap);
    }
  }

  refreshAllTraps(): void {
    for (const trap of this.traps.values()) {
      if (trap.active) {
        this.updateFocusableElements(trap);
      }
    }
  }

  destroy(): void {
    this.deactivate();
    this.traps.clear();
  }
}

// 전역 인스턴스
export const globalKeyboardTrapManager = new KeyboardTrapManagerImpl();

// 개발 모드에서 디버깅을 위한 전역 접근
if (process.env.NODE_ENV === 'development') {
  (window as any).__keyboardTrapManager = globalKeyboardTrapManager;
}
