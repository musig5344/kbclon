/**
 * 포커스 관리 유틸리티
 * WCAG 2.1 포커스 가시성 및 키보드 네비게이션 지원
 */

import { FocusManagementOptions, KeyboardNavigationOptions } from '../types';

/**
 * 포커스 가능한 요소 선택자
 */
const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  'details>summary:first-of-type',
  'details'
].join(',');

/**
 * 포커스 트랩 생성
 */
export class FocusTrap {
  private element: HTMLElement;
  private options: FocusManagementOptions;
  private previouslyFocusedElement: HTMLElement | null = null;
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;
  private active: boolean = false;

  constructor(element: HTMLElement, options: FocusManagementOptions = {}) {
    this.element = element;
    this.options = {
      restoreFocus: true,
      autoFocus: true,
      trapFocus: true,
      escapeDeactivates: true,
      allowOutsideClick: false,
      ...options
    };
  }

  activate() {
    if (this.active) return;

    this.active = true;
    this.previouslyFocusedElement = document.activeElement as HTMLElement;
    
    this.updateFocusableElements();
    
    if (this.options.autoFocus) {
      this.focusInitial();
    }

    if (this.options.trapFocus) {
      document.addEventListener('keydown', this.handleKeyDown);
      this.element.addEventListener('focusin', this.handleFocusIn);
    }

    if (this.options.allowOutsideClick) {
      document.addEventListener('click', this.handleOutsideClick);
    }
  }

  deactivate() {
    if (!this.active) return;

    this.active = false;

    if (this.options.trapFocus) {
      document.removeEventListener('keydown', this.handleKeyDown);
      this.element.removeEventListener('focusin', this.handleFocusIn);
    }

    if (this.options.allowOutsideClick) {
      document.removeEventListener('click', this.handleOutsideClick);
    }

    if (this.options.restoreFocus && this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
  }

  private updateFocusableElements() {
    const focusableElements = this.element.querySelectorAll(FOCUSABLE_ELEMENTS);
    const visibleElements = Array.from(focusableElements).filter(el => 
      this.isVisible(el as HTMLElement)
    ) as HTMLElement[];

    this.firstFocusableElement = visibleElements[0] || null;
    this.lastFocusableElement = visibleElements[visibleElements.length - 1] || null;
  }

  private focusInitial() {
    const { initialFocus } = this.options;
    
    if (initialFocus) {
      const element = typeof initialFocus === 'string'
        ? this.element.querySelector(initialFocus) as HTMLElement
        : initialFocus;
      
      if (element && this.isVisible(element)) {
        element.focus();
        return;
      }
    }

    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus();
    }
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      this.handleTab(event);
    } else if (event.key === 'Escape' && this.options.escapeDeactivates) {
      this.deactivate();
    }
  };

  private handleTab(event: KeyboardEvent) {
    if (!this.firstFocusableElement || !this.lastFocusableElement) return;

    if (event.shiftKey) {
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement.focus();
      }
    } else {
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement.focus();
      }
    }
  }

  private handleFocusIn = (event: FocusEvent) => {
    const target = event.target as HTMLElement;
    
    if (!this.element.contains(target)) {
      event.preventDefault();
      this.focusInitial();
    }
  };

  private handleOutsideClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    
    if (!this.element.contains(target)) {
      this.deactivate();
    }
  };

  private isVisible(element: HTMLElement): boolean {
    return !!(
      element.offsetWidth ||
      element.offsetHeight ||
      element.getClientRects().length
    );
  }
}

/**
 * 포커스 관리 유틸리티 함수들
 */

/**
 * 현재 포커스된 요소 가져오기
 */
export function getFocusedElement(): HTMLElement | null {
  return document.activeElement as HTMLElement;
}

/**
 * 요소에 포커스 설정
 */
export function setFocus(
  element: HTMLElement | string,
  options?: { preventScroll?: boolean }
): boolean {
  const el = typeof element === 'string' 
    ? document.querySelector(element) as HTMLElement
    : element;
  
  if (!el) return false;
  
  el.focus(options);
  return document.activeElement === el;
}

/**
 * 포커스 가능한 모든 요소 가져오기
 */
export function getFocusableElements(
  container: HTMLElement = document.body
): HTMLElement[] {
  const elements = container.querySelectorAll(FOCUSABLE_ELEMENTS);
  return Array.from(elements).filter(el => 
    isVisible(el as HTMLElement) && !isDisabled(el as HTMLElement)
  ) as HTMLElement[];
}

/**
 * 요소의 가시성 확인
 */
function isVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetParent !== null
  );
}

/**
 * 요소의 비활성화 상태 확인
 */
function isDisabled(element: HTMLElement): boolean {
  return (
    element.hasAttribute('disabled') ||
    element.getAttribute('aria-disabled') === 'true'
  );
}

/**
 * 키보드 네비게이션 관리
 */
export class KeyboardNavigator {
  private container: HTMLElement;
  private items: HTMLElement[] = [];
  private currentIndex: number = -1;
  private options: KeyboardNavigationOptions;

  constructor(container: HTMLElement, options: KeyboardNavigationOptions = {}) {
    this.container = container;
    this.options = {
      orientation: 'vertical',
      loop: true,
      preventScroll: false,
      ...options
    };
    
    this.init();
  }

  private init() {
    this.updateItems();
    this.container.addEventListener('keydown', this.handleKeyDown);
  }

  destroy() {
    this.container.removeEventListener('keydown', this.handleKeyDown);
  }

  updateItems() {
    this.items = getFocusableElements(this.container);
    const currentElement = document.activeElement as HTMLElement;
    this.currentIndex = this.items.indexOf(currentElement);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    const { key } = event;
    const { orientation } = this.options;
    
    let handled = false;

    switch (key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          this.next();
          handled = true;
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          this.previous();
          handled = true;
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          this.next();
          handled = true;
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          this.previous();
          handled = true;
        }
        break;
      case 'Home':
        this.first();
        handled = true;
        break;
      case 'End':
        this.last();
        handled = true;
        break;
    }

    if (handled) {
      event.preventDefault();
    }
  };

  next() {
    this.navigate(1);
  }

  previous() {
    this.navigate(-1);
  }

  first() {
    this.navigateTo(0);
  }

  last() {
    this.navigateTo(this.items.length - 1);
  }

  private navigate(direction: number) {
    if (this.items.length === 0) return;

    let newIndex = this.currentIndex + direction;

    if (this.options.loop) {
      newIndex = (newIndex + this.items.length) % this.items.length;
    } else {
      newIndex = Math.max(0, Math.min(newIndex, this.items.length - 1));
    }

    this.navigateTo(newIndex);
  }

  private navigateTo(index: number) {
    if (index < 0 || index >= this.items.length) return;

    const element = this.items[index];
    element.focus({ preventScroll: this.options.preventScroll });
    
    this.currentIndex = index;
    
    if (this.options.onNavigate) {
      this.options.onNavigate(index, element);
    }
  }
}

/**
 * 포커스 링 스타일 관리
 */
export function manageFocusRing() {
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
      target.classList.add('focus-visible');
    } else {
      target.classList.remove('focus-visible');
    }
  };
  
  const blurHandler = (event: FocusEvent) => {
    const target = event.target as HTMLElement;
    target.classList.remove('focus-visible');
  };
  
  document.addEventListener('keydown', keydownHandler, true);
  document.addEventListener('mousedown', mousedownHandler, true);
  document.addEventListener('focus', focusHandler, true);
  document.addEventListener('blur', blurHandler, true);
  
  // CSS 주입
  const style = document.createElement('style');
  style.textContent = `
    .focus-visible {
      outline: 2px solid #287EFF !important;
      outline-offset: 2px !important;
    }
    
    :focus:not(.focus-visible) {
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
}

/**
 * 스킵 링크 구현
 */
export function createSkipLink(targetId: string, text: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = `#${targetId}`;
  link.className = 'skip-link';
  link.textContent = text;
  
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.tabIndex = -1;
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  
  return link;
}

/**
 * 포커스 이동 시 스크린 리더 공지
 */
export function announceFocusChange(element: HTMLElement, message?: string) {
  const announcement = message || element.getAttribute('aria-label') || element.textContent || '';
  
  if (announcement) {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    
    document.body.appendChild(liveRegion);
    liveRegion.textContent = announcement;
    
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
  }
}