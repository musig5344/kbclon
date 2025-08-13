/**
 * Comprehensive Gesture Recognition System for KB StarBanking
 *
 * A modern, secure, and performant gesture system designed specifically for financial applications.
 * Supports all common mobile gestures with banking-specific security considerations.
 *
 * @example
 * ```tsx
 * import { useSwipeGesture, GestureAccountCard } from '@/gestures';
 *
 * function AccountScreen() {
 *   useSwipeGesture((direction) => {
 *     if (direction === 'left') {
 *       navigateToNextAccount();
 *     }
 *   });
 *
 *   return (
 *     <GestureAccountCard
 *       account={accountData}
 *       onSwipeLeft={() => showQuickActions()}
 *       onLongPress={() => showAccountOptions()}
 *     />
 *   );
 * }
 * ```
 */

// Core Gesture System
export { GestureRecognizer } from './core/GestureRecognizer';
export type {
  GestureType,
  GestureEvent,
  GestureConfig,
  TouchPoint,
} from './core/GestureRecognizer';

// React Hooks
export {
  useGestures,
  useGesture,
  useSwipeGesture,
  useTapGesture,
  useDoubleTapGesture,
  useLongPressGesture,
  usePinchGesture,
  usePanGesture,
  usePullToRefreshGesture,
  useEdgeSwipeGesture,
  useMultiGesture,
  useSecureGestures,
  useAccountCardGestures,
  useTransactionGestures,
  usePINGestures,
  useNavigationGestures,
  useAmountInputGestures,
} from './hooks/useGestures';

export type { UseGesturesOptions, UseGesturesReturn } from './hooks/useGestures';

// React Components
export {
  GestureAccountCard,
  GestureTransactionItem,
  GesturePINInput,
  PullToRefresh,
} from './components/GestureComponents';

// Utility Functions
export const initializeGestureSystem = (config?: Partial<GestureConfig>) => {
  return new GestureRecognizer(config);
};

// Banking-specific gesture configurations
export const BANKING_GESTURE_CONFIG: Partial<GestureConfig> = {
  security: {
    preventAccidental: true,
    requireConfirmation: ['double-tap', 'long-press'],
    sensitiveGestures: ['force-touch', 'shake'],
  },
  tap: {
    maxDuration: 200,
    maxDistance: 10,
    requirePrecision: false,
  },
  longPress: {
    minDuration: 500,
    maxDistance: 10,
    hapticFeedback: true,
  },
  swipe: {
    minDistance: 50,
    maxDuration: 300,
    minVelocity: 0.3,
    directions: ['left', 'right', 'up', 'down'],
  },
  doubleTap: {
    maxTimeBetween: 300,
    maxDistance: 50,
  },
};

// Secure transaction gesture configuration
export const SECURE_TRANSACTION_CONFIG: Partial<GestureConfig> = {
  ...BANKING_GESTURE_CONFIG,
  security: {
    preventAccidental: true,
    requireConfirmation: ['double-tap', 'long-press', 'force-touch'],
    sensitiveGestures: ['shake', 'force-touch'],
  },
  longPress: {
    minDuration: 800, // Longer for security
    maxDistance: 5, // More precise
    hapticFeedback: true,
  },
  tap: {
    maxDuration: 150,
    maxDistance: 5,
    requirePrecision: true,
  },
};

// PIN input specific configuration
export const PIN_INPUT_CONFIG: Partial<GestureConfig> = {
  tap: {
    maxDuration: 150,
    maxDistance: 5,
    requirePrecision: true,
  },
  longPress: {
    minDuration: 600,
    maxDistance: 5,
    hapticFeedback: true,
  },
  security: {
    preventAccidental: true,
    requireConfirmation: [],
    sensitiveGestures: [],
  },
};

// Navigation gesture configuration
export const NAVIGATION_CONFIG: Partial<GestureConfig> = {
  edgeSwipe: {
    edgeZone: 20,
    minDistance: 100,
  },
  swipe: {
    minDistance: 30,
    maxDuration: 250,
    minVelocity: 0.5,
    directions: ['left', 'right'],
  },
};

/**
 * Quick setup for banking applications
 */
export const setupBankingGestures = (element?: HTMLElement) => {
  const recognizer = new GestureRecognizer(BANKING_GESTURE_CONFIG);

  // Add banking-specific event listeners
  recognizer.on('shake', () => {
    console.warn('Shake gesture detected - potential security concern');
  });

  recognizer.on('force-touch', event => {});

  return recognizer;
};

/**
 * Gesture system constants
 */
export const GESTURE_CONSTANTS = {
  MIN_TOUCH_TARGET: 44, // px - WCAG guideline
  EDGE_SWIPE_ZONE: 20, // px - Edge detection zone
  HAPTIC_DURATION: 50, // ms - Haptic feedback duration
  MAX_GESTURE_TIME: 2000, // ms - Maximum gesture duration
  DOUBLE_TAP_INTERVAL: 300, // ms - Maximum time between taps
  LONG_PRESS_DURATION: 500, // ms - Minimum long press duration
  SWIPE_THRESHOLD: 50, // px - Minimum swipe distance
  PINCH_THRESHOLD: 20, // px - Minimum pinch distance
};

/**
 * Accessibility helpers
 */
export const ACCESSIBILITY_CONFIG: Partial<GestureConfig> = {
  tap: {
    maxDuration: 300, // Longer for users with motor difficulties
    maxDistance: 20, // More tolerance
    requirePrecision: false,
  },
  longPress: {
    minDuration: 800, // Longer to prevent accidental activation
    maxDistance: 20, // More tolerance
    hapticFeedback: true,
  },
  swipe: {
    minDistance: 30, // Shorter for easier activation
    maxDuration: 500, // Longer for slower gestures
    minVelocity: 0.2, // Lower velocity requirement
    directions: ['left', 'right', 'up', 'down'],
  },
};

/**
 * Development utilities
 */
export const enableGestureDebugging = (recognizer: GestureRecognizer) => {
  if (process.env.NODE_ENV === 'development') {
    Object.values(['tap', 'swipe', 'long-press', 'pinch', 'pan'] as GestureType[]).forEach(
      gestureType => {
        recognizer.on(gestureType, event => {});
      }
    );
  }
};

/**
 * Performance monitoring
 */
export const createGesturePerformanceMonitor = () => {
  const metrics = {
    gestureCount: 0,
    averageResponseTime: 0,
    responseTime: [] as number[],
  };

  return {
    recordGesture: (startTime: number) => {
      const responseTime = Date.now() - startTime;
      metrics.gestureCount++;
      metrics.responseTime.push(responseTime);

      if (metrics.responseTime.length > 100) {
        metrics.responseTime = metrics.responseTime.slice(-100);
      }

      metrics.averageResponseTime =
        metrics.responseTime.reduce((a, b) => a + b, 0) / metrics.responseTime.length;
    },
    getMetrics: () => ({ ...metrics }),
    reset: () => {
      metrics.gestureCount = 0;
      metrics.averageResponseTime = 0;
      metrics.responseTime = [];
    },
  };
};

// Version information
export const GESTURE_SYSTEM_VERSION = '1.0.0';
export const SUPPORTED_GESTURES = [
  'tap',
  'double-tap',
  'long-press',
  'swipe',
  'pinch',
  'rotate',
  'pan',
  'edge-swipe',
  'pull-to-refresh',
  'shake',
  'force-touch',
] as const;

// Re-export types for convenience
export type {
  GestureType as SupportedGesture,
  GestureEvent as GestureEventData,
  GestureConfig as GestureSettings,
} from './core/GestureRecognizer';
