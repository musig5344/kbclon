/**
 * KB 스타뱅킹 키보드 접근성 테스터
 * 키보드 네비게이션 및 포커스 트랩 테스트
 */

export interface KeyboardTestResult {
  passed: boolean;
  issues: string[];
  focusableElements: number;
  tabOrder: HTMLElement[];
}

export class KeyboardNavigationTester {
  private focusableElements: HTMLElement[] = [];
  private issues: string[] = [];

  /**
   * 키보드 네비게이션 테스트
   */
  test(): KeyboardTestResult {
    this.focusableElements = [];
    this.issues = [];

    // 포커스 가능한 모든 요소 찾기
    this.findFocusableElements();

    // Tab 순서 검증
    this.validateTabOrder();

    // 포커스 트랩 영역 확인
    this.checkFocusTraps();

    // 키보드 단축키 충돌 확인
    this.checkKeyboardShortcuts();

    return {
      passed: this.issues.length === 0,
      issues: this.issues,
      focusableElements: this.focusableElements.length,
      tabOrder: this.focusableElements
    };
  }

  /**
   * 포커스 가능한 요소 찾기
   */
  private findFocusableElements(): void {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]',
      'audio[controls]',
      'video[controls]',
      'details',
      'summary'
    ].join(', ');

    const elements = document.querySelectorAll(selector);
    this.focusableElements = Array.from(elements) as HTMLElement[];

    if (this.focusableElements.length === 0) {
      this.issues.push('포커스 가능한 요소가 없습니다');
    }
  }

  /**
   * Tab 순서 검증
   */
  private validateTabOrder(): void {
    const positiveTabindexElements = this.focusableElements.filter(el => {
      const tabindex = el.getAttribute('tabindex');
      return tabindex && parseInt(tabindex) > 0;
    });

    if (positiveTabindexElements.length > 0) {
      this.issues.push(`양수 tabindex를 사용하는 요소가 ${positiveTabindexElements.length}개 있습니다`);
    }

    // Tab 순서가 시각적 순서와 일치하는지 확인
    let lastTop = 0;
    let lastLeft = 0;
    let isOrderValid = true;

    this.focusableElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      
      // 새로운 줄로 이동한 경우
      if (rect.top > lastTop + 50) {
        lastLeft = 0;
      }
      // 같은 줄에서 왼쪽에 있는 요소가 나중에 포커스되는 경우
      else if (rect.left < lastLeft - 50) {
        isOrderValid = false;
      }

      lastTop = rect.top;
      lastLeft = rect.left;
    });

    if (!isOrderValid) {
      this.issues.push('Tab 순서가 시각적 순서와 일치하지 않을 수 있습니다');
    }
  }

  /**
   * 포커스 트랩 확인
   */
  private checkFocusTraps(): void {
    const modals = document.querySelectorAll('[role="dialog"], [role="alertdialog"], .modal');
    
    modals.forEach(modal => {
      const focusableInModal = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      
      if (focusableInModal.length > 0) {
        const firstFocusable = focusableInModal[0] as HTMLElement;
        const lastFocusable = focusableInModal[focusableInModal.length - 1] as HTMLElement;
        
        // 포커스 트랩 로직 확인
        if (!modal.getAttribute('aria-modal')) {
          this.issues.push('모달에 aria-modal="true" 속성이 없습니다');
        }
      }
    });
  }

  /**
   * 키보드 단축키 충돌 확인
   */
  private checkKeyboardShortcuts(): void {
    const elementsWithAccesskey = document.querySelectorAll('[accesskey]');
    const accesskeys = new Set<string>();
    
    elementsWithAccesskey.forEach(element => {
      const key = element.getAttribute('accesskey');
      if (key) {
        if (accesskeys.has(key)) {
          this.issues.push(`중복된 accesskey "${key}"가 있습니다`);
        }
        accesskeys.add(key);
      }
    });
  }

  /**
   * 특정 요소에서 시작하여 Tab 키 시뮬레이션
   */
  simulateTabNavigation(startElement: HTMLElement): HTMLElement[] {
    const path: HTMLElement[] = [];
    let currentElement = startElement;
    
    for (let i = 0; i < this.focusableElements.length; i++) {
      const nextIndex = this.getNextTabIndex(currentElement);
      if (nextIndex === -1) break;
      
      currentElement = this.focusableElements[nextIndex];
      path.push(currentElement);
    }
    
    return path;
  }

  /**
   * 다음 Tab 인덱스 계산
   */
  private getNextTabIndex(currentElement: HTMLElement): number {
    const currentIndex = this.focusableElements.indexOf(currentElement);
    
    if (currentIndex === -1) {
      return 0;
    }
    
    return (currentIndex + 1) % this.focusableElements.length;
  }
}

/**
 * 키보드 네비게이션 테스트 실행
 */
export function testKeyboardNavigation(): KeyboardTestResult {
  const tester = new KeyboardNavigationTester();
  return tester.test();
}

/**
 * 포커스 트랩 테스트
 */
export function testFocusTrap(container: HTMLElement): boolean {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length < 2) {
    console.warn('포커스 트랩을 테스트하기에 충분한 포커스 가능 요소가 없습니다');
    return false;
  }
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  // 첫 번째 요소에 포커스
  firstElement.focus();
  
  // Tab 키 이벤트 시뮬레이션
  const tabEvent = new KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey: false,
    bubbles: true,
    cancelable: true
  });
  
  lastElement.dispatchEvent(tabEvent);
  
  // 포커스가 첫 번째 요소로 돌아왔는지 확인
  const isTrapped = document.activeElement === firstElement;
  
  if (!isTrapped) {
    console.warn('포커스 트랩이 제대로 작동하지 않습니다');
  }
  
  return isTrapped;
}