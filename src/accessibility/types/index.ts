/**
 * WCAG 2.1 AA Compliance Types
 * 국민은행 스타뱅킹 접근성 타입 정의
 */

// 색상 대비 관련 타입
export interface ColorContrastResult {
  ratio: number;
  passes: {
    aa: boolean;
    aaa: boolean;
    largeTextAA: boolean;
    largeTextAAA: boolean;
  };
  recommendation?: string;
}

// ARIA 속성 타입
export interface AriaAttributes {
  role?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-relevant'?: string;
  'aria-busy'?: boolean;
  'aria-hidden'?: boolean;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean | 'mixed';
  'aria-disabled'?: boolean;
  'aria-invalid'?: boolean | 'grammar' | 'spelling';
  'aria-required'?: boolean;
  'aria-readonly'?: boolean;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-controls'?: string;
  'aria-owns'?: string;
  'aria-flowto'?: string;
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-pressed'?: boolean | 'mixed';
  'aria-level'?: number;
  'aria-multiline'?: boolean;
  'aria-multiselectable'?: boolean;
  'aria-orientation'?: 'horizontal' | 'vertical';
  'aria-placeholder'?: string;
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  'aria-setsize'?: number;
  'aria-posinset'?: number;
  'aria-colcount'?: number;
  'aria-rowcount'?: number;
  'aria-colindex'?: number;
  'aria-rowindex'?: number;
  'aria-colspan'?: number;
  'aria-rowspan'?: number;
  'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both';
  'aria-errormessage'?: string;
  'aria-modal'?: boolean;
  'aria-keyshortcuts'?: string;
  'aria-roledescription'?: string;
}

// 포커스 관리 타입
export interface FocusManagementOptions {
  restoreFocus?: boolean;
  initialFocus?: string | HTMLElement;
  finalFocus?: string | HTMLElement;
  autoFocus?: boolean;
  trapFocus?: boolean;
  escapeDeactivates?: boolean;
  allowOutsideClick?: boolean;
}

// 스크린 리더 공지 타입
export interface ScreenReaderAnnouncement {
  message: string;
  priority?: 'polite' | 'assertive';
  clearAfter?: number;
  language?: 'ko' | 'en';
}

// 접근성 검증 결과 타입
export interface AccessibilityValidationResult {
  passed: boolean;
  errors: AccessibilityError[];
  warnings: AccessibilityWarning[];
  score: number;
}

export interface AccessibilityError {
  type: string;
  message: string;
  element?: HTMLElement;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  wcagCriteria: string[];
  howToFix: string;
}

export interface AccessibilityWarning {
  type: string;
  message: string;
  element?: HTMLElement;
  recommendation: string;
}

// 키보드 네비게이션 타입
export interface KeyboardNavigationOptions {
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
  preventScroll?: boolean;
  onNavigate?: (index: number, element: HTMLElement) => void;
}

// 접근성 테스트 결과 타입
export interface A11yTestResult {
  testName: string;
  passed: boolean;
  details: string;
  wcagReference: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
}

// 접근 가능한 폼 필드 타입
export interface AccessibleFormFieldProps {
  id: string;
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  ariaDescribedBy?: string;
}

// 접근 가능한 데이터 테이블 타입
export interface AccessibleTableProps {
  caption: string;
  summary?: string;
  headers: string[];
  sortable?: boolean;
  selectable?: boolean;
}

// 접근 가능한 차트 타입
export interface AccessibleChartProps {
  title: string;
  description: string;
  data: any[];
  textAlternative: string;
  tableView?: boolean;
}

// 날짜 선택기 접근성 타입
export interface AccessibleDatePickerProps {
  label: string;
  format?: string;
  minDate?: Date;
  maxDate?: Date;
  locale?: 'ko' | 'en';
  announceFormat?: string;
}

// 금액 입력 접근성 타입
export interface AccessibleAmountInputProps {
  label: string;
  currency?: string;
  min?: number;
  max?: number;
  announceThousands?: boolean;
  koreanNumberAnnouncement?: boolean;
}

// 스킵 네비게이션 타입
export interface SkipLinkTarget {
  id: string;
  label: string;
  element?: HTMLElement;
}

// 접근성 설정 타입
export interface AccessibilitySettings {
  highContrast: boolean;
  reduceMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  keyboardNavigation: boolean;
  screenReaderOptimized: boolean;
  colorBlindMode?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

// 언어 지원 타입
export interface LanguageSupport {
  lang: 'ko' | 'en';
  textDirection: 'ltr' | 'rtl';
  numberFormat: 'korean' | 'western';
  currencyFormat: 'symbol' | 'code' | 'name';
}

// 터치 타겟 타입
export interface TouchTargetRequirements {
  minSize: number;
  recommendedSize: number;
  spacing: number;
}

// 시간 제한 타입
export interface TimeLimitOptions {
  duration: number;
  warningTime: number;
  extendable: boolean;
  maxExtensions?: number;
  onTimeout?: () => void;
  onWarning?: (remainingTime: number) => void;
}