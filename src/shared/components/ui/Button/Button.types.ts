import { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * 터치 피드백 옵션 (KBButton 통합)
 */
export interface TouchFeedbackOptions {
  type?: 'ripple' | 'scale' | 'glow' | 'bounce' | 'press';
  intensity?: 'light' | 'medium' | 'strong';
  duration?: number;
  color?: string;
  haptic?: boolean;
  sound?: boolean;
  androidOptimized?: boolean;
}

/**
 * Button 컴포넌트 변형 타입 (KBButton variants 통합)
 */
export type ButtonVariant = 
  | 'primary'          // 주요 액션 버튼 (노란색)
  | 'secondary'        // 보조 액션 버튼
  | 'outline'          // 외곽선 버튼
  | 'text'             // 텍스트 버튼
  | 'dialog-left'      // 다이얼로그 왼쪽 버튼 (회색)
  | 'dialog-right'     // 다이얼로그 오른쪽 버튼 (노란색)
  | 'ghost'            // 투명 배경 버튼 (KBButton에서 추가)
  | 'native-primary'   // KB 네이티브 스타일 주 버튼
  | 'native-secondary' // KB 네이티브 스타일 보조 버튼
  | 'native-ghost';    // KB 네이티브 스타일 ghost 버튼
/**
 * Button 컴포넌트 크기 타입 (KBButton 통합)
 */
export type ButtonSize = 
  | 'small'            // 작은 버튼 (40px)
  | 'medium'           // 중간 버튼 (48px, 기본값)
  | 'large'            // 큰 버튼 (56px)
  | 'xl'               // 특대 버튼 (64px)
  | 'full'             // 전체 높이 버튼 (KBButton에서 추가)
  | 'dialog'           // 다이얼로그용 버튼
  | 'bottomsheet'      // 바텀시트용 버튼
  | 'keypad';          // 키패드 버튼 (원형)
/**
 * Button 컴포넌트 Props (KBButton 기능 통합)
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼 변형 */
  variant?: ButtonVariant;
  /** 버튼 크기 */
  size?: ButtonSize;
  /** 전체 너비 사용 여부 */
  fullWidth?: boolean;
  /** 로딩 상태 */
  loading?: boolean;
  /** 눌린 상태 (토글 버튼용) */
  pressed?: boolean;
  /** 왼쪽 아이콘 */
  leftIcon?: ReactNode;
  /** 오른쪽 아이콘 */
  rightIcon?: ReactNode;
  /** 아이콘 (KBButton 호환성) */
  icon?: ReactNode;
  /** Ripple 효과 사용 여부 */
  ripple?: boolean;
  /** 터치 피드백 옵션 (KBButton 통합) */
  touchFeedback?: Partial<TouchFeedbackOptions>;
  /** 터치 피드백 비활성화 여부 (KBButton 통합) */
  disableTouchFeedback?: boolean;
  /** 접근성 라벨 */
  'aria-label'?: string;
  /** 접근성 설명 */
  'aria-describedby'?: string;
}
/**
 * 버튼 그룹 Props
 */
export interface ButtonGroupProps {
  /** 자식 요소들 */
  children: ReactNode;
  /** 그룹 방향 */
  direction?: 'horizontal' | 'vertical';
  /** 버튼 간격 */
  gap?: number;
  /** 전체 너비 사용 */
  fullWidth?: boolean;
}
