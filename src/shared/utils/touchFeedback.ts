/**
 * KB 스타뱅킹 터치 피드백 시스템
 * - Android WebView 최적화
 * - 네이티브 앱 느낌의 터치 피드백
 * - 햅틱 피드백 시뮬레이션
 * - 리플 이팩트 및 스케일 애니메이션
 */

import { css } from 'styled-components';

import { KBDesignSystem } from '../../styles/tokens/kb-design-system';

// 터치 피드백 타입 정의
export interface TouchFeedbackOptions {
  type?: 'ripple' | 'scale' | 'glow' | 'bounce' | 'press';
  intensity?: 'light' | 'medium' | 'strong';
  duration?: number;
  color?: string;
  haptic?: boolean;
  sound?: boolean;
  androidOptimized?: boolean;
}

// Android WebView 감지
const isAndroid = /Android/i.test(navigator.userAgent);
const isCapacitor = !!(window as any).Capacitor;

// 햅틱 피드백 시뮬레이션
export class HapticFeedback {
  private static instance: HapticFeedback;
  private isEnabled: boolean = true;
  private lastHapticTime: number = 0;
  private hapticThrottle: number = 50; // 50ms 최소 간격

  static getInstance(): HapticFeedback {
    if (!HapticFeedback.instance) {
      HapticFeedback.instance = new HapticFeedback();
    }
    return HapticFeedback.instance;
  }

  /**
   * 햅틱 피드백 실행
   */
  async vibrate(pattern: number | number[] = 10): Promise<void> {
    if (!this.isEnabled) return;
    
    const now = Date.now();
    if (now - this.lastHapticTime < this.hapticThrottle) return;
    
    this.lastHapticTime = now;

    try {
      // Capacitor 환경에서 네이티브 햅틱
      if (isCapacitor && (window as any).Capacitor.Plugins.Haptics) {
        const { Haptics, ImpactStyle } = (window as any).Capacitor.Plugins;
        await Haptics.impact({ style: ImpactStyle.Light });
        return;
      }

      // 웹 Vibration API
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
        return;
      }

      // Android WebView에서 JavaScript 인터페이스 사용
      if (isAndroid && (window as any).AndroidInterface?.vibrate) {
        (window as any).AndroidInterface.vibrate(Array.isArray(pattern) ? pattern[0] : pattern);
        return;
      }

    } catch (error) {
      console.warn('[HapticFeedback] 햅틱 피드백 실패:', error);
    }
  }

  /**
   * 터치 타입별 햅틱 패턴
   */
  async touchFeedback(type: 'light' | 'medium' | 'strong' | 'success' | 'error' | 'warning'): Promise<void> {
    switch (type) {
      case 'light':
        await this.vibrate(5);
        break;
      case 'medium':
        await this.vibrate(15);
        break;
      case 'strong':
        await this.vibrate(25);
        break;
      case 'success':
        await this.vibrate([10, 50, 10]);
        break;
      case 'error':
        await this.vibrate([25, 100, 25, 100, 25]);
        break;
      case 'warning':
        await this.vibrate([15, 80, 15]);
        break;
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  isHapticEnabled(): boolean {
    return this.isEnabled;
  }
}

// 햅틱 피드백 싱글톤 인스턴스
export const hapticFeedback = HapticFeedback.getInstance();

// 리플 이팩트 생성 함수
export const createRippleEffect = (
  element: HTMLElement, 
  event: MouseEvent | TouchEvent,
  options: TouchFeedbackOptions = {}
): void => {
  const { color = KBDesignSystem.colors.primary.yellowAlpha20, duration = 600 } = options;
  
  // 이미 리플이 진행 중이면 무시 (Android 성능 최적화)
  if (element.classList.contains('ripple-active') && isAndroid) return;
  
  const rect = element.getBoundingClientRect();
  const ripple = document.createElement('div');
  
  // 터치 포인트 또는 마우스 포인트 계산
  let x, y;
  if ('touches' in event) {
    const touch = event.touches[0] || event.changedTouches[0];
    x = touch.clientX - rect.left;
    y = touch.clientY - rect.top;
  } else {
    x = event.clientX - rect.left;
    y = event.clientY - rect.top;
  }
  
  // 리플 크기 계산 (요소 대각선 길이)
  const diameter = Math.max(
    Math.sqrt(x * x + y * y),
    Math.sqrt((rect.width - x) * (rect.width - x) + y * y),
    Math.sqrt(x * x + (rect.height - y) * (rect.height - y)),
    Math.sqrt((rect.width - x) * (rect.width - x) + (rect.height - y) * (rect.height - y))
  ) * 2;
  
  // 리플 요소 스타일링
  ripple.style.cssText = `
    position: absolute;
    left: ${x - diameter / 2}px;
    top: ${y - diameter / 2}px;
    width: ${diameter}px;
    height: ${diameter}px;
    background-color: ${color};
    border-radius: 50%;
    pointer-events: none;
    z-index: 1000;
    opacity: 0.6;
    transform: scale(0);
    transition: transform ${duration}ms cubic-bezier(0.25, 0.8, 0.25, 1),
                opacity ${duration}ms cubic-bezier(0.25, 0.8, 0.25, 1);
  `;
  
  element.appendChild(ripple);
  element.classList.add('ripple-active');
  
  // Android WebView 최적화: requestAnimationFrame 사용
  requestAnimationFrame(() => {
    ripple.style.transform = 'scale(1)';
    ripple.style.opacity = '0';
  });
  
  // 리플 제거
  setTimeout(() => {
    try {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
      element.classList.remove('ripple-active');
    } catch (error) {
      // 이미 제거된 경우 무시
    }
  }, duration);
};

// 스케일 피드백 애니메이션
export const createScaleFeedback = (
  element: HTMLElement,
  options: TouchFeedbackOptions = {}
): void => {
  const { intensity = 'medium', duration = 150 } = options;
  
  const scaleValues = {
    light: 0.98,
    medium: 0.95,
    strong: 0.92
  };
  
  const scale = scaleValues[intensity];
  const originalTransform = element.style.transform;
  const originalTransition = element.style.transition;
  
  // 스케일 다운
  element.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.8, 0.25, 1)`;
  element.style.transform = `${originalTransform} scale(${scale})`;
  
  // 스케일 업 (원래 크기로)
  setTimeout(() => {
    element.style.transform = originalTransform;
    
    // 애니메이션 완료 후 원래 스타일 복구
    setTimeout(() => {
      element.style.transition = originalTransition;
    }, duration);
  }, duration / 2);
};

// 글로우 이팩트
export const createGlowEffect = (
  element: HTMLElement,
  options: TouchFeedbackOptions = {}
): void => {
  const { color = KBDesignSystem.colors.primary.yellow, duration = 300 } = options;
  
  const originalBoxShadow = element.style.boxShadow;
  const glowShadow = `0 0 20px ${color}`;
  
  element.style.transition = `box-shadow ${duration}ms ease`;
  element.style.boxShadow = `${originalBoxShadow}, ${glowShadow}`;
  
  setTimeout(() => {
    element.style.boxShadow = originalBoxShadow;
    setTimeout(() => {
      element.style.transition = '';
    }, duration);
  }, duration);
};

// 통합 터치 피드백 함수
export const applyTouchFeedback = (
  element: HTMLElement,
  event: MouseEvent | TouchEvent,
  options: TouchFeedbackOptions = {}
): void => {
  const {
    type = 'ripple',
    intensity = 'medium',
    haptic = true,
    androidOptimized = true
  } = options;

  // Android WebView에서 성능 최적화
  if (androidOptimized && isAndroid) {
    // GPU 가속 활성화
    element.style.willChange = 'transform';
    setTimeout(() => {
      element.style.willChange = 'auto';
    }, 1000);
  }

  // 햅틱 피드백
  if (haptic && (isAndroid || isCapacitor)) {
    hapticFeedback.touchFeedback(intensity);
  }

  // 시각적 피드백
  switch (type) {
    case 'ripple':
      createRippleEffect(element, event, options);
      break;
    case 'scale':
      createScaleFeedback(element, options);
      break;
    case 'glow':
      createGlowEffect(element, options);
      break;
    case 'bounce':
      createScaleFeedback(element, { ...options, intensity: 'strong' });
      break;
    case 'press':
      createScaleFeedback(element, { ...options, intensity: 'light', duration: 100 });
      break;
  }
};

// CSS-in-JS 터치 피드백 믹스인
export const touchFeedbackMixin = (options: TouchFeedbackOptions = {}) => {
  const { type = 'ripple', androidOptimized = true } = options;
  
  return css`
    position: relative;
    overflow: hidden;
    cursor: pointer;
    
    /* Android WebView 최적화 */
    ${androidOptimized && isAndroid && css`
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
    `}
    
    /* 기본 터치 스타일 */
    &:active {
      ${type === 'scale' && css`
        transform: scale(0.95);
        transition: transform 150ms cubic-bezier(0.25, 0.8, 0.25, 1);
      `}
      
      ${type === 'glow' && css`
        box-shadow: 0 0 20px ${options.color || KBDesignSystem.colors.primary.yellowAlpha20};
        transition: box-shadow 200ms ease;
      `}
    }
    
    /* 포커스 상태 */
    &:focus-visible {
      outline: 2px solid ${KBDesignSystem.colors.primary.yellow};
      outline-offset: 2px;
    }
    
    /* 호버 상태 (비터치 디바이스에서만) */
    @media (hover: hover) and (pointer: fine) {
      &:hover {
        ${type !== 'ripple' && css`
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 200ms cubic-bezier(0.25, 0.8, 0.25, 1);
        `}
      }
    }
  `;
};

// React Hook 형태의 터치 피드백
export const useTouchFeedback = (options: TouchFeedbackOptions = {}) => {
  return {
    onTouchStart: (event: React.TouchEvent<HTMLElement>) => {
      applyTouchFeedback(event.currentTarget, event.nativeEvent, options);
    },
    
    onMouseDown: (event: React.MouseEvent<HTMLElement>) => {
      // 터치 디바이스에서는 마우스 이벤트 무시
      if (('ontouchstart' in window)) return;
      applyTouchFeedback(event.currentTarget, event.nativeEvent, options);
    },
    
    style: {
      position: 'relative' as const,
      overflow: 'hidden' as const,
      cursor: 'pointer' as const,
      WebkitTapHighlightColor: 'transparent',
      touchAction: 'manipulation' as const,
      userSelect: 'none' as const
    }
  };
};

// 전역 터치 피드백 설정
export class TouchFeedbackManager {
  private static instance: TouchFeedbackManager;
  private globalEnabled: boolean = true;
  private defaultOptions: TouchFeedbackOptions = {
    type: 'ripple',
    intensity: 'medium',
    haptic: isAndroid || isCapacitor,
    androidOptimized: true
  };

  static getInstance(): TouchFeedbackManager {
    if (!TouchFeedbackManager.instance) {
      TouchFeedbackManager.instance = new TouchFeedbackManager();
    }
    return TouchFeedbackManager.instance;
  }

  setGlobalEnabled(enabled: boolean): void {
    this.globalEnabled = enabled;
    hapticFeedback.setEnabled(enabled);
  }

  setDefaultOptions(options: Partial<TouchFeedbackOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  getDefaultOptions(): TouchFeedbackOptions {
    return { ...this.defaultOptions };
  }

  isEnabled(): boolean {
    return this.globalEnabled;
  }

  /**
   * 자동으로 모든 버튼에 터치 피드백 적용
   */
  initializeGlobalTouchFeedback(): void {
    if (!this.globalEnabled) return;

    const addTouchFeedbackToElement = (element: HTMLElement) => {
      if (element.dataset.touchFeedback === 'disabled') return;
      
      const options = {
        ...this.defaultOptions,
        ...JSON.parse(element.dataset.touchFeedbackOptions || '{}')
      };

      element.addEventListener('touchstart', (event) => {
        applyTouchFeedback(element, event, options);
      }, { passive: true });

      if (!('ontouchstart' in window)) {
        element.addEventListener('mousedown', (event) => {
          applyTouchFeedback(element, event, options);
        });
      }
    };

    // 기존 버튼들에 적용
    const buttons = document.querySelectorAll('button, [role="button"], .touchable');
    buttons.forEach(button => addTouchFeedbackToElement(button as HTMLElement));

    // 동적으로 추가되는 버튼들을 위한 MutationObserver
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            
            // 버튼 요소 자체인 경우
            if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button' || element.classList.contains('touchable')) {
              addTouchFeedbackToElement(element);
            }
            
            // 자식 요소 중 버튼이 있는 경우
            const childButtons = element.querySelectorAll('button, [role="button"], .touchable');
            childButtons.forEach(button => addTouchFeedbackToElement(button as HTMLElement));
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// 전역 터치 피드백 매니저 싱글톤
export const touchFeedbackManager = TouchFeedbackManager.getInstance();

// Android WebView에서 앱 로드 시 자동 초기화
if (isAndroid && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => touchFeedbackManager.initializeGlobalTouchFeedback(), 1000);
  });
} else if (isAndroid) {
  setTimeout(() => touchFeedbackManager.initializeGlobalTouchFeedback(), 1000);
}