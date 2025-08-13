/**
 * ARIA 속성 및 패턴 유틸리티
 * WCAG 2.1 ARIA 모범 사례 구현
 */

import { AriaAttributes } from '../types';

/**
 * ARIA 속성 설정
 */
export function setAriaAttributes(element: HTMLElement, attributes: AriaAttributes): void {
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined) {
      element.setAttribute(key, String(value));
    } else {
      element.removeAttribute(key);
    }
  });
}

/**
 * ARIA 라이브 리전 설정
 */
export function setAriaLive(
  element: HTMLElement,
  level: 'off' | 'polite' | 'assertive' = 'polite',
  atomic: boolean = true,
  relevant: string = 'additions text'
): void {
  setAriaAttributes(element, {
    'aria-live': level,
    'aria-atomic': atomic,
    'aria-relevant': relevant,
  });
}

/**
 * ARIA 로딩 상태 설정
 */
export function setAriaLoading(element: HTMLElement, isLoading: boolean): void {
  setAriaAttributes(element, {
    'aria-busy': isLoading,
    'aria-live': isLoading ? 'polite' : undefined,
  });

  if (isLoading) {
    element.setAttribute('aria-label', '로딩 중');
  }
}

/**
 * ARIA 확장/축소 상태 설정
 */
export function setAriaExpanded(
  trigger: HTMLElement,
  content: HTMLElement,
  isExpanded: boolean
): void {
  const contentId = content.id || `content-${Date.now()}`;

  if (!content.id) {
    content.id = contentId;
  }

  setAriaAttributes(trigger, {
    'aria-expanded': isExpanded,
    'aria-controls': contentId,
  });

  setAriaAttributes(content, {
    'aria-hidden': !isExpanded,
  });
}

/**
 * ARIA 탭 패턴 구현
 */
export class AriaTabList {
  private tablist: HTMLElement;
  private tabs: HTMLElement[] = [];
  private panels: HTMLElement[] = [];
  private selectedIndex: number = 0;

  constructor(tablist: HTMLElement) {
    this.tablist = tablist;
    this.init();
  }

  private init() {
    // 탭 리스트 설정
    this.tablist.setAttribute('role', 'tablist');

    // 탭 수집
    this.tabs = Array.from(this.tablist.querySelectorAll('[role="tab"]'));

    // 패널 수집 및 설정
    this.tabs.forEach((tab, index) => {
      const panelId = tab.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;

      if (panel) {
        this.panels[index] = panel;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tab.id || `tab-${index}`);

        if (!tab.id) {
          tab.id = `tab-${index}`;
        }
      }

      // 초기 상태 설정
      this.updateTabState(index, index === this.selectedIndex);

      // 이벤트 리스너
      tab.addEventListener('click', () => this.selectTab(index));
      tab.addEventListener('keydown', e => this.handleKeyDown(e, index));
    });
  }

  private updateTabState(index: number, isSelected: boolean) {
    const tab = this.tabs[index];
    const panel = this.panels[index];

    if (tab) {
      tab.setAttribute('aria-selected', String(isSelected));
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
    }

    if (panel) {
      panel.hidden = !isSelected;
    }
  }

  private selectTab(index: number) {
    if (index < 0 || index >= this.tabs.length) return;

    // 이전 탭 비활성화
    this.updateTabState(this.selectedIndex, false);

    // 새 탭 활성화
    this.selectedIndex = index;
    this.updateTabState(index, true);

    // 포커스 이동
    this.tabs[index].focus();
  }

  private handleKeyDown(event: KeyboardEvent, currentIndex: number) {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
        newIndex = (currentIndex + 1) % this.tabs.length;
        break;
      case 'ArrowLeft':
        newIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = this.tabs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.selectTab(newIndex);
  }
}

/**
 * ARIA 아코디언 패턴 구현
 */
export class AriaAccordion {
  private container: HTMLElement;
  private headers: HTMLElement[] = [];
  private panels: HTMLElement[] = [];
  private allowMultiple: boolean;

  constructor(container: HTMLElement, allowMultiple: boolean = false) {
    this.container = container;
    this.allowMultiple = allowMultiple;
    this.init();
  }

  private init() {
    const items = this.container.querySelectorAll('.accordion-item');

    items.forEach((item, index) => {
      const header = item.querySelector('.accordion-header') as HTMLElement;
      const panel = item.querySelector('.accordion-panel') as HTMLElement;

      if (header && panel) {
        // ID 설정
        const headerId = header.id || `accordion-header-${index}`;
        const panelId = panel.id || `accordion-panel-${index}`;

        header.id = headerId;
        panel.id = panelId;

        // ARIA 속성 설정
        header.setAttribute('role', 'button');
        header.setAttribute('aria-controls', panelId);
        header.setAttribute('aria-expanded', 'false');
        header.setAttribute('tabindex', '0');

        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-labelledby', headerId);
        panel.hidden = true;

        // 배열에 추가
        this.headers.push(header);
        this.panels.push(panel);

        // 이벤트 리스너
        header.addEventListener('click', () => this.toggle(index));
        header.addEventListener('keydown', e => this.handleKeyDown(e, index));
      }
    });
  }

  private toggle(index: number) {
    const header = this.headers[index];
    const isExpanded = header.getAttribute('aria-expanded') === 'true';

    if (!this.allowMultiple && !isExpanded) {
      // 다른 모든 패널 닫기
      this.headers.forEach((_, i) => {
        if (i !== index) {
          this.close(i);
        }
      });
    }

    if (isExpanded) {
      this.close(index);
    } else {
      this.open(index);
    }
  }

  private open(index: number) {
    const header = this.headers[index];
    const panel = this.panels[index];

    header.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
  }

  private close(index: number) {
    const header = this.headers[index];
    const panel = this.panels[index];

    header.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
  }

  private handleKeyDown(event: KeyboardEvent, index: number) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggle(index);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.focusNext(index);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPrevious(index);
        break;
      case 'Home':
        event.preventDefault();
        this.headers[0].focus();
        break;
      case 'End':
        event.preventDefault();
        this.headers[this.headers.length - 1].focus();
        break;
    }
  }

  private focusNext(currentIndex: number) {
    const nextIndex = (currentIndex + 1) % this.headers.length;
    this.headers[nextIndex].focus();
  }

  private focusPrevious(currentIndex: number) {
    const prevIndex = (currentIndex - 1 + this.headers.length) % this.headers.length;
    this.headers[prevIndex].focus();
  }
}

/**
 * ARIA 모달 다이얼로그 설정
 */
export function setAriaModal(
  dialog: HTMLElement,
  options: {
    labelledBy?: string;
    describedBy?: string;
    closeButton?: HTMLElement;
  } = {}
): void {
  setAriaAttributes(dialog, {
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': options.labelledBy,
    'aria-describedby': options.describedBy,
  });

  if (options.closeButton) {
    options.closeButton.setAttribute('aria-label', '닫기');
  }
}

/**
 * ARIA 알림 메시지 설정
 */
export function setAriaAlert(
  element: HTMLElement,
  type: 'alert' | 'status' | 'log' = 'alert'
): void {
  element.setAttribute('role', type);

  if (type === 'alert') {
    element.setAttribute('aria-live', 'assertive');
  } else {
    element.setAttribute('aria-live', 'polite');
  }
}

/**
 * ARIA 진행 표시기 설정
 */
export function setAriaProgress(
  element: HTMLElement,
  value: number,
  max: number = 100,
  label?: string
): void {
  setAriaAttributes(element, {
    role: 'progressbar',
    'aria-valuenow': value,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-label': label || `진행률 ${Math.round((value / max) * 100)}%`,
  });
}

/**
 * ARIA 폼 검증 상태 설정
 */
export function setAriaInvalid(
  input: HTMLElement,
  isInvalid: boolean,
  errorMessageId?: string
): void {
  setAriaAttributes(input, {
    'aria-invalid': isInvalid,
    'aria-errormessage': isInvalid ? errorMessageId : undefined,
  });
}

/**
 * ARIA 툴팁 패턴 구현
 */
export function createAriaTooltip(trigger: HTMLElement, tooltipContent: string): HTMLElement {
  const tooltip = document.createElement('div');
  const tooltipId = `tooltip-${Date.now()}`;

  tooltip.id = tooltipId;
  tooltip.className = 'tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.textContent = tooltipContent;
  tooltip.hidden = true;

  trigger.setAttribute('aria-describedby', tooltipId);

  // 스타일 설정
  Object.assign(tooltip.style, {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '14px',
    zIndex: '1000',
    pointerEvents: 'none',
  });

  // 이벤트 핸들러
  trigger.addEventListener('mouseenter', () => {
    tooltip.hidden = false;
    positionTooltip(trigger, tooltip);
  });

  trigger.addEventListener('mouseleave', () => {
    tooltip.hidden = true;
  });

  trigger.addEventListener('focus', () => {
    tooltip.hidden = false;
    positionTooltip(trigger, tooltip);
  });

  trigger.addEventListener('blur', () => {
    tooltip.hidden = true;
  });

  document.body.appendChild(tooltip);

  return tooltip;
}

/**
 * 툴팁 위치 조정
 */
function positionTooltip(trigger: HTMLElement, tooltip: HTMLElement): void {
  const triggerRect = trigger.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  let top = triggerRect.bottom + 8;
  let left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;

  // 화면 경계 체크
  if (left < 0) left = 8;
  if (left + tooltipRect.width > window.innerWidth) {
    left = window.innerWidth - tooltipRect.width - 8;
  }

  if (top + tooltipRect.height > window.innerHeight) {
    top = triggerRect.top - tooltipRect.height - 8;
  }

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}

/**
 * ARIA 메뉴 패턴 구현
 */
export class AriaMenu {
  private menu: HTMLElement;
  private menuItems: HTMLElement[] = [];
  private _currentIndex: number = -1;

  getCurrentIndex(): number {
    return this._currentIndex;
  }

  constructor(menu: HTMLElement) {
    this.menu = menu;
    this.init();
  }

  private init() {
    this.menu.setAttribute('role', 'menu');

    this.menuItems = Array.from(this.menu.querySelectorAll('[role="menuitem"]'));

    this.menuItems.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');

      item.addEventListener('keydown', e => this.handleKeyDown(e, index));
      item.addEventListener('click', () => this.selectItem(index));
    });

    this.menu.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.close();
      }
    });
  }

  private handleKeyDown(event: KeyboardEvent, index: number) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusNext(index);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPrevious(index);
        break;
      case 'Home':
        event.preventDefault();
        this.focusItem(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusItem(this.menuItems.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectItem(index);
        break;
    }
  }

  private focusNext(currentIndex: number) {
    const nextIndex = (currentIndex + 1) % this.menuItems.length;
    this.focusItem(nextIndex);
  }

  private focusPrevious(currentIndex: number) {
    const prevIndex = (currentIndex - 1 + this.menuItems.length) % this.menuItems.length;
    this.focusItem(prevIndex);
  }

  private focusItem(index: number) {
    this.menuItems.forEach((item, i) => {
      item.setAttribute('tabindex', i === index ? '0' : '-1');
    });

    this.menuItems[index].focus();
    this._currentIndex = index;
  }

  private selectItem(index: number) {
    const item = this.menuItems[index];
    item.click();
  }

  private close() {
    this.menu.dispatchEvent(new CustomEvent('menu-close'));
  }
}
