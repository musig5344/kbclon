/**
 * KB StarBanking 키보드 네비게이션 유틸리티 함수들
 */

import { NavigationDirection, KeyboardHelpItem, BankingShortcutCategory } from '../types';

/**
 * 키 조합을 정규화된 문자열로 변환
 */
export const normalizeKeyCombo = (keys: string[]): string => {
  return keys
    .map(key => key.toLowerCase())
    .sort()
    .join('+');
};

/**
 * 키보드 이벤트에서 수정자 키들 추출
 */
export const getModifiers = (event: KeyboardEvent): string[] => {
  const modifiers: string[] = [];
  
  if (event.ctrlKey) modifiers.push('ctrl');
  if (event.altKey) modifiers.push('alt');
  if (event.shiftKey) modifiers.push('shift');
  if (event.metaKey) modifiers.push('meta');
  
  return modifiers;
};

/**
 * 키보드 이벤트를 단축키 문자열로 변환
 */
export const eventToShortcut = (event: KeyboardEvent): string => {
  const modifiers = getModifiers(event);
  const key = event.key.toLowerCase();
  
  return [...modifiers, key].join('+');
};

/**
 * 요소가 포커스 가능한지 확인
 */
export const isFocusable = (element: HTMLElement): boolean => {
  // 숨겨진 요소 체크
  if (!isVisible(element)) return false;
  
  // 비활성화된 요소 체크
  if (isDisabled(element)) return false;
  
  // aria-hidden 체크
  if (element.getAttribute('aria-hidden') === 'true') return false;
  
  // 포커스 가능한 태그들
  const focusableTags = ['a', 'button', 'input', 'textarea', 'select'];
  const tagName = element.tagName.toLowerCase();
  
  if (focusableTags.includes(tagName)) {
    return true;
  }
  
  // tabindex 체크
  const tabIndex = element.getAttribute('tabindex');
  if (tabIndex !== null && tabIndex !== '-1') {
    return true;
  }
  
  // contenteditable 체크
  if (element.contentEditable === 'true') {
    return true;
  }
  
  return false;
};

/**
 * 요소가 보이는지 확인
 */
export const isVisible = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.visibility !== 'hidden' &&
    style.display !== 'none' &&
    style.opacity !== '0'
  );
};

/**
 * 요소가 비활성화되어 있는지 확인
 */
export const isDisabled = (element: HTMLElement): boolean => {
  return (
    element.hasAttribute('disabled') ||
    element.getAttribute('aria-disabled') === 'true' ||
    (element as any).disabled === true
  );
};

/**
 * 컨테이너 내의 모든 포커스 가능한 요소들 가져오기
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
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

  const elements = Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  return elements.filter(isFocusable);
};

/**
 * 요소의 접근 가능한 이름 가져오기
 */
export const getAccessibleName = (element: HTMLElement): string => {
  // aria-label 우선
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel.trim();
  
  // aria-labelledby 참조
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    if (labelElement) {
      return labelElement.textContent?.trim() || '';
    }
  }
  
  // label 요소 (for 속성)
  const id = element.id;
  if (id) {
    const labelElement = document.querySelector(`label[for="${id}"]`);
    if (labelElement) {
      return labelElement.textContent?.trim() || '';
    }
  }
  
  // 부모 label 요소
  const parentLabel = element.closest('label');
  if (parentLabel) {
    return parentLabel.textContent?.trim() || '';
  }
  
  // title 속성
  const title = element.getAttribute('title');
  if (title) return title.trim();
  
  // alt 속성 (이미지 등)
  const alt = element.getAttribute('alt');
  if (alt) return alt.trim();
  
  // placeholder 속성
  const placeholder = element.getAttribute('placeholder');
  if (placeholder) return placeholder.trim();
  
  // 텍스트 콘텐츠
  const textContent = element.textContent?.trim();
  if (textContent) return textContent;
  
  // value 속성 (입력 요소)
  const value = (element as HTMLInputElement).value;
  if (value) return value.trim();
  
  return element.tagName.toLowerCase();
};

/**
 * 요소의 역할(role) 가져오기
 */
export const getElementRole = (element: HTMLElement): string => {
  const explicitRole = element.getAttribute('role');
  if (explicitRole) return explicitRole;
  
  // 암시적 역할
  const tagName = element.tagName.toLowerCase();
  const implicitRoles: Record<string, string> = {
    'button': 'button',
    'a': 'link',
    'input': getInputRole(element as HTMLInputElement),
    'textarea': 'textbox',
    'select': 'combobox',
    'img': 'img',
    'h1': 'heading',
    'h2': 'heading',
    'h3': 'heading',
    'h4': 'heading',
    'h5': 'heading',
    'h6': 'heading',
    'nav': 'navigation',
    'main': 'main',
    'aside': 'complementary',
    'header': 'banner',
    'footer': 'contentinfo'
  };
  
  return implicitRoles[tagName] || 'generic';
};

/**
 * 입력 요소의 역할 가져오기
 */
const getInputRole = (input: HTMLInputElement): string => {
  const type = input.type.toLowerCase();
  const roleMap: Record<string, string> = {
    'button': 'button',
    'submit': 'button',
    'reset': 'button',
    'checkbox': 'checkbox',
    'radio': 'radio',
    'range': 'slider',
    'text': 'textbox',
    'email': 'textbox',
    'password': 'textbox',
    'search': 'searchbox',
    'tel': 'textbox',
    'url': 'textbox'
  };
  
  return roleMap[type] || 'textbox';
};

/**
 * 키보드 이벤트에서 입력 중인지 확인
 */
export const isTyping = (event: KeyboardEvent): boolean => {
  const target = event.target as HTMLElement;
  
  // 입력 요소들
  const inputTags = ['input', 'textarea'];
  if (inputTags.includes(target.tagName.toLowerCase())) {
    return true;
  }
  
  // contenteditable
  if (target.contentEditable === 'true') {
    return true;
  }
  
  // 역할이 textbox인 요소
  const role = getElementRole(target);
  if (['textbox', 'searchbox'].includes(role)) {
    return true;
  }
  
  return false;
};

/**
 * 네비게이션 방향을 한국어로 변환
 */
export const getDirectionText = (direction: NavigationDirection): string => {
  const directionMap: Record<NavigationDirection, string> = {
    up: '위로',
    down: '아래로',
    left: '왼쪽으로',  
    right: '오른쪽으로',
    first: '처음으로',
    last: '마지막으로'
  };
  
  return directionMap[direction] || direction;
};

/**
 * 스크린 리더에게 메시지 공지
 */
export const announceToScreenReader = (
  message: string, 
  priority: 'polite' | 'assertive' = 'polite',
  timeout: number = 1000
): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  
  document.body.appendChild(announcement);
  
  // 약간의 지연 후 메시지 설정 (스크린 리더가 인식할 수 있도록)
  setTimeout(() => {
    announcement.textContent = message;
  }, 100);
  
  // 지정된 시간 후 제거
  setTimeout(() => {
    if (announcement.parentNode) {
      announcement.parentNode.removeChild(announcement);
    }
  }, timeout);
};

/**
 * 요소를 부드럽게 스크롤하여 표시
 */
export const scrollIntoViewSmooth = (element: HTMLElement): void => {
  if ('scrollIntoView' in element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  } else {
    // 폴백
    element.scrollIntoView();
  }
};

/**
 * 요소 간의 거리 계산 (포커스 네비게이션용)
 */
export const getElementDistance = (from: HTMLElement, to: HTMLElement): number => {
  const fromRect = from.getBoundingClientRect();
  const toRect = to.getBoundingClientRect();
  
  const fromCenter = {
    x: fromRect.left + fromRect.width / 2,
    y: fromRect.top + fromRect.height / 2
  };
  
  const toCenter = {
    x: toRect.left + toRect.width / 2,
    y: toRect.top + toRect.height / 2
  };
  
  return Math.sqrt(
    Math.pow(toCenter.x - fromCenter.x, 2) + 
    Math.pow(toCenter.y - fromCenter.y, 2)
  );
};

/**
 * 방향에 따른 다음 포커스 요소 찾기
 */
export const findNextElementInDirection = (
  current: HTMLElement,
  direction: NavigationDirection,
  candidates: HTMLElement[]
): HTMLElement | null => {
  if (candidates.length === 0) return null;
  
  const currentRect = current.getBoundingClientRect();
  const currentCenter = {
    x: currentRect.left + currentRect.width / 2,
    y: currentRect.top + currentRect.height / 2
  };
  
  const validCandidates = candidates.filter(candidate => {
    const rect = candidate.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    
    switch (direction) {
      case 'up':
        return center.y < currentCenter.y;
      case 'down':
        return center.y > currentCenter.y;
      case 'left':
        return center.x < currentCenter.x;
      case 'right':
        return center.x > currentCenter.x;
      default:
        return true;
    }
  });
  
  if (validCandidates.length === 0) return null;
  
  // 가장 가까운 요소 찾기
  return validCandidates.reduce((closest, candidate) => {
    const closestDistance = getElementDistance(current, closest);
    const candidateDistance = getElementDistance(current, candidate);
    
    return candidateDistance < closestDistance ? candidate : closest;
  });
};

/**
 * 키보드 도움말 데이터 생성
 */
export const generateKeyboardHelp = (): KeyboardHelpItem[] => {
  return [
    // 네비게이션
    {
      category: 'navigation',
      shortcut: ['Alt', 'H'],
      description: '홈으로 이동',
      context: ['global'],
      example: 'Alt + H를 눌러 메인 페이지로 이동'
    },
    {
      category: 'navigation',
      shortcut: ['Alt', 'M'],
      description: '메뉴 열기/닫기',
      context: ['global']
    },
    {
      category: 'navigation',
      shortcut: ['Alt', '←'],
      description: '뒤로가기',
      context: ['global']
    },
    
    // 계좌
    {
      category: 'accounts',
      shortcut: ['Ctrl', 'Shift', 'A'],
      description: '계좌 조회',
      context: ['global']
    },
    {
      category: 'accounts',
      shortcut: ['Ctrl', 'B'],
      description: '잔액 조회',
      context: ['global']
    },
    
    // 이체  
    {
      category: 'transfer',
      shortcut: ['Ctrl', 'T'],
      description: '이체하기',
      context: ['global']
    },
    {
      category: 'transfer',
      shortcut: ['Ctrl', 'Shift', 'H'],
      description: '이체 내역 조회',
      context: ['global']
    },
    
    // 모달/폼
    {
      category: 'modal',
      shortcut: ['Escape'],
      description: '모달창 닫기',
      context: ['modal', 'dialog']
    },
    {
      category: 'form',
      shortcut: ['Enter'],
      description: '확인/실행',
      context: ['form', 'button']
    },
    {
      category: 'form',
      shortcut: ['Tab'],
      description: '다음 필드로 이동',
      context: ['form']
    },
    {
      category: 'form',
      shortcut: ['Shift', 'Tab'],
      description: '이전 필드로 이동',
      context: ['form']
    },
    
    // 접근성
    {
      category: 'accessibility',
      shortcut: ['Ctrl', 'Shift', 'H'],
      description: '고대비 모드 토글',
      context: ['global']
    },
    {
      category: 'accessibility',
      shortcut: ['Ctrl', 'K'],
      description: '명령 팔레트 열기',
      context: ['global']
    }
  ];
};

/**
 * 디바운스 함수
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * 스로틀 함수
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};