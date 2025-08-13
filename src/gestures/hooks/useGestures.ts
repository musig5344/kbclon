import { useEffect, useRef, useCallback } from 'react';

import {
  GestureRecognizer,
  GestureType,
  GestureEvent,
  GestureConfig,
} from '../core/GestureRecognizer';

export interface UseGesturesOptions {
  config?: Partial<GestureConfig>;
  enabled?: boolean;
  element?: HTMLElement | null;
}

export interface UseGesturesReturn {
  recognizer: GestureRecognizer | null;
  isEnabled: boolean;
  enable: () => void;
  disable: () => void;
  updateConfig: (config: Partial<GestureConfig>) => void;
}

export const useGestures = (options: UseGesturesOptions = {}): UseGesturesReturn => {
  const { config, enabled = true, element } = options;
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const isEnabledRef = useRef(enabled);

  useEffect(() => {
    if (enabled && !recognizerRef.current) {
      recognizerRef.current = new GestureRecognizer(config);
      isEnabledRef.current = true;
    } else if (!enabled && recognizerRef.current) {
      recognizerRef.current.destroy();
      recognizerRef.current = null;
      isEnabledRef.current = false;
    }

    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.destroy();
        recognizerRef.current = null;
      }
    };
  }, [enabled, config]);

  const enable = useCallback(() => {
    if (!recognizerRef.current) {
      recognizerRef.current = new GestureRecognizer(config);
      isEnabledRef.current = true;
    }
  }, [config]);

  const disable = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.destroy();
      recognizerRef.current = null;
      isEnabledRef.current = false;
    }
  }, []);

  const updateConfig = useCallback((newConfig: Partial<GestureConfig>) => {
    if (recognizerRef.current) {
      recognizerRef.current.updateConfig(newConfig);
    }
  }, []);

  return {
    recognizer: recognizerRef.current,
    isEnabled: isEnabledRef.current,
    enable,
    disable,
    updateConfig,
  };
};

// Hook for specific gesture types
export const useGesture = (
  gestureType: GestureType,
  handler: (event: GestureEvent) => void,
  options: UseGesturesOptions = {}
) => {
  const { recognizer } = useGestures(options);

  useEffect(() => {
    if (recognizer) {
      const unsubscribe = recognizer.on(gestureType, handler);
      return unsubscribe;
    }
  }, [recognizer, gestureType, handler]);

  return recognizer;
};

// Banking-specific gesture hooks
export const useSwipeGesture = (
  onSwipe: (direction: 'up' | 'down' | 'left' | 'right', event: GestureEvent) => void,
  options: UseGesturesOptions = {}
) => {
  return useGesture(
    'swipe',
    event => {
      if (event.data?.direction) {
        onSwipe(event.data.direction, event);
      }
    },
    options
  );
};

export const useTapGesture = (
  onTap: (event: GestureEvent) => void,
  options: UseGesturesOptions = {}
) => {
  return useGesture('tap', onTap, options);
};

export const useDoubleTapGesture = (
  onDoubleTap: (event: GestureEvent) => void,
  options: UseGesturesOptions = {}
) => {
  return useGesture('double-tap', onDoubleTap, options);
};

export const useLongPressGesture = (
  onLongPress: (event: GestureEvent) => void,
  options: UseGesturesOptions = {}
) => {
  return useGesture('long-press', onLongPress, options);
};

export const usePinchGesture = (
  onPinch: (scale: number, event: GestureEvent) => void,
  options: UseGesturesOptions = {}
) => {
  return useGesture(
    'pinch',
    event => {
      if (event.data?.scale) {
        onPinch(event.data.scale, event);
      }
    },
    options
  );
};

export const usePanGesture = (
  onPan: (deltaX: number, deltaY: number, event: GestureEvent) => void,
  options: UseGesturesOptions = {}
) => {
  return useGesture(
    'pan',
    event => {
      if (event.data?.deltaX !== undefined && event.data?.deltaY !== undefined) {
        onPan(event.data.deltaX, event.data.deltaY, event);
      }
    },
    options
  );
};

export const usePullToRefreshGesture = (
  onRefresh: () => void,
  options: UseGesturesOptions = {}
) => {
  return useGesture('pull-to-refresh', onRefresh, options);
};

export const useEdgeSwipeGesture = (
  onEdgeSwipe: (event: GestureEvent) => void,
  options: UseGesturesOptions = {}
) => {
  return useGesture('edge-swipe', onEdgeSwipe, options);
};

// Multi-gesture hook for complex interactions
export const useMultiGesture = (
  handlers: Partial<Record<GestureType, (event: GestureEvent) => void>>,
  options: UseGesturesOptions = {}
) => {
  const { recognizer } = useGestures(options);

  useEffect(() => {
    if (!recognizer) return;

    const unsubscribers: Array<() => void> = [];

    Object.entries(handlers).forEach(([gestureType, handler]) => {
      if (handler) {
        const unsubscribe = recognizer.on(gestureType as GestureType, handler);
        unsubscribers.push(unsubscribe);
      }
    });

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [recognizer, handlers]);

  return recognizer;
};

// Hook for banking security gestures
export const useSecureGestures = (
  onSecureAction: (action: string, event: GestureEvent) => void,
  options: UseGesturesOptions = {}
) => {
  const secureConfig: Partial<GestureConfig> = {
    security: {
      preventAccidental: true,
      requireConfirmation: ['double-tap', 'long-press'],
      sensitiveGestures: ['force-touch', 'shake'],
    },
    longPress: {
      minDuration: 800, // Longer for security
      maxDistance: 5, // More precise
      hapticFeedback: true,
    },
    doubleTap: {
      maxTimeBetween: 250, // Faster for intentional action
      maxDistance: 30,
    },
    ...options.config,
  };

  return useMultiGesture(
    {
      'double-tap': event => onSecureAction('confirm', event),
      'long-press': event => onSecureAction('authenticate', event),
      'force-touch': event => onSecureAction('force-confirm', event),
    },
    { ...options, config: secureConfig }
  );
};

// Hook for account card gestures
export const useAccountCardGestures = (
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  onTap: () => void,
  onLongPress?: () => void,
  options: UseGesturesOptions = {}
) => {
  return useMultiGesture(
    {
      swipe: event => {
        if (event.data?.direction === 'left') {
          onSwipeLeft();
        } else if (event.data?.direction === 'right') {
          onSwipeRight();
        }
      },
      tap: onTap,
      'long-press': onLongPress,
    },
    options
  );
};

// Hook for transaction list gestures
export const useTransactionGestures = (
  onSwipeToDelete: (transactionId: string) => void,
  onSwipeToCategory: (transactionId: string) => void,
  onTap: (transactionId: string) => void,
  options: UseGesturesOptions = {}
) => {
  return useMultiGesture(
    {
      swipe: event => {
        const target = event.target as HTMLElement;
        const transactionId = target.dataset.transactionId;

        if (!transactionId) return;

        if (event.data?.direction === 'left') {
          onSwipeToDelete(transactionId);
        } else if (event.data?.direction === 'right') {
          onSwipeToCategory(transactionId);
        }
      },
      tap: event => {
        const target = event.target as HTMLElement;
        const transactionId = target.dataset.transactionId;

        if (transactionId) {
          onTap(transactionId);
        }
      },
    },
    options
  );
};

// Hook for PIN input gestures
export const usePINGestures = (
  onNumberTap: (number: string) => void,
  onDelete: () => void,
  onSubmit: () => void,
  options: UseGesturesOptions = {}
) => {
  const secureConfig: Partial<GestureConfig> = {
    tap: {
      maxDuration: 150,
      maxDistance: 5,
      requirePrecision: true,
    },
    security: {
      preventAccidental: true,
      requireConfirmation: [],
      sensitiveGestures: [],
    },
    ...options.config,
  };

  return useMultiGesture(
    {
      tap: event => {
        const target = event.target as HTMLElement;

        if (target.dataset.number) {
          onNumberTap(target.dataset.number);
        } else if (target.dataset.action === 'delete') {
          onDelete();
        } else if (target.dataset.action === 'submit') {
          onSubmit();
        }
      },
      'long-press': event => {
        const target = event.target as HTMLElement;

        if (target.dataset.action === 'delete') {
          // Long press on delete to clear all
          onDelete();
        }
      },
    },
    { ...options, config: secureConfig }
  );
};

// Hook for navigation gestures
export const useNavigationGestures = (
  onBack: () => void,
  onForward?: () => void,
  onMenu?: () => void,
  options: UseGesturesOptions = {}
) => {
  return useMultiGesture(
    {
      'edge-swipe': event => {
        const touch = event.touches[0];

        if (touch.x < 20) {
          // Left edge
          onBack();
        } else if (touch.x > window.innerWidth - 20 && onForward) {
          // Right edge
          onForward();
        }
      },
      swipe: event => {
        if (event.data?.direction === 'down' && touch.y < 50 && onMenu) {
          onMenu();
        }
      },
    },
    options
  );
};

// Hook for amount input gestures
export const useAmountInputGestures = (
  onIncrease: (amount: number) => void,
  onDecrease: (amount: number) => void,
  options: UseGesturesOptions = {}
) => {
  return useMultiGesture(
    {
      swipe: event => {
        const target = event.target as HTMLElement;
        const step = parseInt(target.dataset.step || '1000', 10);

        if (event.data?.direction === 'up') {
          onIncrease(step);
        } else if (event.data?.direction === 'down') {
          onDecrease(step);
        }
      },
      pinch: event => {
        const target = event.target as HTMLElement;
        const currentAmount = parseInt(target.dataset.amount || '0', 10);
        const scale = event.data?.scale || 1;

        if (scale > 1.1) {
          onIncrease(Math.floor(currentAmount * 0.1));
        } else if (scale < 0.9) {
          onDecrease(Math.floor(currentAmount * 0.1));
        }
      },
    },
    options
  );
};
