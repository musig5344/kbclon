/**
 * KB 스타뱅킹 접근성 모듈
 * WCAG 2.1 AA 준수를 위한 통합 접근성 솔루션
 */

// 타입 내보내기
// manageFocusRing import
import { manageFocusRing } from './utils/focusManagement';

export * from './types';

// 유틸리티 내보내기
export * from './utils/colorContrast';
export * from './utils/focusManagement';
export * from './utils/screenReader';
export * from './utils/aria';

// 컴포넌트 내보내기
export { AccessibleFormField } from './components/AccessibleFormField';
export {
  SkipNavigation,
  AccountPageSkipLinks,
  TransferPageSkipLinks,
  MenuPageSkipLinks,
} from './components/SkipNavigation';
export { AccessibleTable } from './components/AccessibleTable';
export {
  AccessibleChart,
  AccessibleBarChart,
  AccessiblePieChart,
  AccessibleLineChart,
} from './components/AccessibleChart';
export { AccessibleAccountSelector } from './components/AccessibleAccountSelector';
export { AccessibleAmountInput } from './components/AccessibleAmountInput';
export { AccessibleDatePicker } from './components/AccessibleDatePicker';

// 훅 내보내기
export {
  useFocusTrap,
  useKeyboardNavigation,
  useAnnouncement,
  useAriaLive,
  useAccessibleLoading,
  useColorContrast,
  useFocusManagement,
  useFocusVisible,
  useAmountFormatter,
  useDateFormatter,
  useAccountNumberFormatter,
  useAccessibilitySettings,
  useSkipLink,
  useTimeoutWarning,
  useAccessibleError,
} from './hooks/useAccessibility';

// 테스팅 유틸리티 내보내기
export {
  AccessibilityValidator,
  validateAccessibility,
  validateWCAGCriteria,
} from './testing/accessibilityValidator';
export {
  KeyboardNavigationTester,
  testKeyboardNavigation,
  testFocusTrap,
} from './testing/keyboardTester';

// 전역 접근성 초기화 함수
export function initializeAccessibility() {
  // 1. 포커스 가시성 관리 활성화
  const cleanupFocusRing = manageFocusRing();

  // 2. 기본 언어 설정
  if (!document.documentElement.lang) {
    document.documentElement.lang = 'ko';
  }

  // 3. 스킵 링크 스타일 추가
  const skipLinkStyles = document.createElement('style');
  skipLinkStyles.textContent = `
    .skip-link:focus {
      position: fixed !important;
      top: 8px !important;
      left: 8px !important;
      z-index: 10000 !important;
      padding: 12px 24px !important;
      background-color: #FFD338 !important;
      color: #26282C !important;
      text-decoration: none !important;
      font-weight: 500 !important;
      border-radius: 4px !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
    }

    .sr-only {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    /* 고대비 모드 스타일 */
    @media (prefers-contrast: high) {
      * {
        outline-width: 2px !important;
      }
      
      button, 
      a, 
      input, 
      textarea, 
      select {
        border-width: 2px !important;
      }
    }

    /* 포커스 표시기 개선 */
    :focus-visible {
      outline: 2px solid #287EFF !important;
      outline-offset: 2px !important;
    }

    /* 터치 타겟 최소 크기 보장 */
    button,
    a,
    input[type="checkbox"],
    input[type="radio"],
    [role="button"],
    [role="link"] {
      min-width: 44px;
      min-height: 44px;
    }
  `;
  document.head.appendChild(skipLinkStyles);

  // 4. 모션 감소 설정 감지
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) {
    document.body.classList.add('reduce-motion');
  }

  // 5. 고대비 모드 감지
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
  if (prefersHighContrast.matches) {
    document.body.classList.add('high-contrast');
  }

  // 클린업 함수 반환
  return () => {
    cleanupFocusRing();
    skipLinkStyles.remove();
  };
}

// 접근성 검증 헬퍼
export async function runAccessibilityAudit() {
  // AccessibilityValidator import from the export above
  const { AccessibilityValidator } = await import('./testing/accessibilityValidator');
  const validator = new AccessibilityValidator();
  const result = await validator.validatePage();

  if (!result.passed) {
    console.group('🔍 접근성 검증 결과');

    if (result.errors.length > 0) {
      console.group(`❌ 오류 (${result.errors.length}개)`);
      result.errors.forEach((error: any) => {
        console.error(`[${error.severity}] ${error.message}`);
        if (error.element) {
          // Element handling if needed
        }
      });
      console.groupEnd();
    }

    if (result.warnings.length > 0) {
      console.group(`⚠️  경고 (${result.warnings.length}개)`);
      result.warnings.forEach((warning: any) => {
        console.warn(warning.message);
        if (warning.element) {
          // Element handling if needed
        }
      });
      console.groupEnd();
    }

    console.groupEnd();
  } else {
    console.log('✅ 모든 접근성 검증 통과');
  }

  return result;
}

// React 컴포넌트용 접근성 래퍼는 별도 파일로 분리 필요
// TypeScript에서는 .ts 파일에 JSX를 직접 사용할 수 없음

// 개발 환경에서 자동 검증
if (process.env.NODE_ENV === 'development') {
  // 페이지 로드 후 검증 실행
  window.addEventListener('load', () => {
    setTimeout(() => {
      runAccessibilityAudit();
    }, 2000);
  });
}
