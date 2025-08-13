/**
 * Advanced Gesture Recognition System for KB StarBanking
 * Supports various touch gestures with financial app security considerations
 */

export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
  identifier: number;
  force?: number;
}

export interface GestureEvent {
  type: GestureType;
  touches: TouchPoint[];
  startTime: number;
  endTime: number;
  duration: number;
  target?: HTMLElement;
  data?: any;
}

export type GestureType =
  | 'tap'
  | 'double-tap'
  | 'long-press'
  | 'swipe'
  | 'pinch'
  | 'rotate'
  | 'pan'
  | 'edge-swipe'
  | 'pull-to-refresh'
  | 'shake'
  | 'force-touch';

export interface GestureConfig {
  tap: {
    maxDuration: number;
    maxDistance: number;
    requirePrecision: boolean;
  };
  doubleTap: {
    maxTimeBetween: number;
    maxDistance: number;
  };
  longPress: {
    minDuration: number;
    maxDistance: number;
    hapticFeedback: boolean;
  };
  swipe: {
    minDistance: number;
    maxDuration: number;
    minVelocity: number;
    directions: ('up' | 'down' | 'left' | 'right')[];
  };
  pinch: {
    minDistance: number;
    minScale: number;
    maxScale: number;
  };
  pan: {
    minDistance: number;
    threshold: number;
  };
  edgeSwipe: {
    edgeZone: number;
    minDistance: number;
  };
  pullToRefresh: {
    threshold: number;
    maxPull: number;
    resistance: number;
  };
  security: {
    preventAccidental: boolean;
    requireConfirmation: string[];
    sensitiveGestures: string[];
  };
}

export class GestureRecognizer {
  private config: GestureConfig;
  private activeGestures: Map<string, GestureEvent> = new Map();
  private listeners: Map<GestureType, Set<(event: GestureEvent) => void>> = new Map();
  private touchHistory: TouchPoint[] = [];
  private gestureStartTime: number = 0;
  private lastTap: { time: number; position: TouchPoint } | null = null;
  private isProcessing = false;

  constructor(config?: Partial<GestureConfig>) {
    this.config = {
      tap: {
        maxDuration: 200,
        maxDistance: 10,
        requirePrecision: false,
      },
      doubleTap: {
        maxTimeBetween: 300,
        maxDistance: 50,
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
        directions: ['up', 'down', 'left', 'right'],
      },
      pinch: {
        minDistance: 20,
        minScale: 0.5,
        maxScale: 3.0,
      },
      pan: {
        minDistance: 10,
        threshold: 5,
      },
      edgeSwipe: {
        edgeZone: 20,
        minDistance: 100,
      },
      pullToRefresh: {
        threshold: 80,
        maxPull: 200,
        resistance: 0.5,
      },
      security: {
        preventAccidental: true,
        requireConfirmation: ['double-tap', 'long-press'],
        sensitiveGestures: ['force-touch', 'shake'],
      },
      ...config,
    };

    this.initialize();
  }

  private initialize(): void {
    this.setupEventListeners();
    this.setupSecurityMeasures();
  }

  private setupEventListeners(): void {
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    document.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });

    // Device motion for shake detection
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', this.handleDeviceMotion.bind(this));
    }
  }

  private setupSecurityMeasures(): void {
    // Prevent default behaviors for sensitive areas
    if (this.config.security.preventAccidental) {
      document.addEventListener('contextmenu', e => e.preventDefault());
      document.addEventListener('selectstart', e => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-sensitive]')) {
          e.preventDefault();
        }
      });
    }
  }

  private handleTouchStart(event: TouchEvent): void {
    if (this.isProcessing) return;

    const touches = this.extractTouchPoints(event);
    this.touchHistory = [...touches];
    this.gestureStartTime = Date.now();

    // Start gesture recognition based on touch count
    if (touches.length === 1) {
      this.recognizeSingleTouchGestures(touches[0], event.target as HTMLElement);
    } else if (touches.length === 2) {
      this.recognizeMultiTouchGestures(touches);
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    if (this.isProcessing) return;

    const touches = this.extractTouchPoints(event);
    const currentTime = Date.now();

    // Update touch history
    this.touchHistory.push(...touches);

    // Process ongoing gestures
    this.processOngoingGestures(touches, currentTime);

    // Prevent default for specific gestures
    if (this.shouldPreventDefault(touches)) {
      event.preventDefault();
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    if (this.isProcessing) return;

    const touches = this.extractTouchPoints(event);
    const endTime = Date.now();
    const duration = endTime - this.gestureStartTime;

    // Finalize gesture recognition
    this.finalizeGestures(touches, endTime, duration);

    // Clean up
    if (event.touches.length === 0) {
      this.cleanupAfterGesture();
    }
  }

  private handleTouchCancel(event: TouchEvent): void {
    this.cleanupAfterGesture();
  }

  private handleDeviceMotion(event: DeviceMotionEvent): void {
    // Detect shake gesture
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const magnitude = Math.sqrt(acceleration.x! ** 2 + acceleration.y! ** 2 + acceleration.z! ** 2);

    if (magnitude > 15) {
      // Shake threshold
      this.emitGesture({
        type: 'shake',
        touches: [],
        startTime: Date.now(),
        endTime: Date.now(),
        duration: 0,
        data: { magnitude },
      });
    }
  }

  private extractTouchPoints(event: TouchEvent): TouchPoint[] {
    return Array.from(event.touches).map(touch => ({
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
      identifier: touch.identifier,
      force: (touch as any).force,
    }));
  }

  private recognizeSingleTouchGestures(touch: TouchPoint, target: HTMLElement): void {
    // Check for edge swipe
    if (this.isEdgeTouch(touch)) {
      this.startEdgeSwipeRecognition(touch);
    }

    // Check for pull-to-refresh
    if (this.isPullToRefreshContext(target)) {
      this.startPullToRefreshRecognition(touch);
    }

    // Start long press timer
    setTimeout(() => {
      if (this.isLongPress(touch)) {
        this.recognizeLongPress(touch, target);
      }
    }, this.config.longPress.minDuration);
  }

  private recognizeMultiTouchGestures(touches: TouchPoint[]): void {
    if (touches.length === 2) {
      this.startPinchRotateRecognition(touches);
    }
  }

  private processOngoingGestures(touches: TouchPoint[], currentTime: number): void {
    // Process pan/swipe gestures
    if (touches.length === 1) {
      this.processPanSwipe(touches[0], currentTime);
    }

    // Process pinch/rotate gestures
    if (touches.length === 2) {
      this.processPinchRotate(touches, currentTime);
    }
  }

  private finalizeGestures(touches: TouchPoint[], endTime: number, duration: number): void {
    if (touches.length === 0) return;

    const startTouch = this.touchHistory[0];
    const endTouch = touches[0];

    // Recognize completed gestures
    if (this.isTap(startTouch, endTouch, duration)) {
      this.recognizeTap(endTouch);
    } else if (this.isSwipe(startTouch, endTouch, duration)) {
      this.recognizeSwipe(startTouch, endTouch, duration);
    }
  }

  private isTap(start: TouchPoint, end: TouchPoint, duration: number): boolean {
    const distance = this.calculateDistance(start, end);
    return duration <= this.config.tap.maxDuration && distance <= this.config.tap.maxDistance;
  }

  private isSwipe(start: TouchPoint, end: TouchPoint, duration: number): boolean {
    const distance = this.calculateDistance(start, end);
    const velocity = distance / duration;

    return (
      distance >= this.config.swipe.minDistance &&
      duration <= this.config.swipe.maxDuration &&
      velocity >= this.config.swipe.minVelocity
    );
  }

  private isLongPress(touch: TouchPoint): boolean {
    const currentTouches = this.touchHistory.filter(t => Date.now() - t.timestamp < 100);

    if (currentTouches.length === 0) return false;

    const lastTouch = currentTouches[currentTouches.length - 1];
    const distance = this.calculateDistance(touch, lastTouch);

    return distance <= this.config.longPress.maxDistance;
  }

  private isEdgeTouch(touch: TouchPoint): boolean {
    const edgeZone = this.config.edgeSwipe.edgeZone;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    return (
      touch.x <= edgeZone ||
      touch.x >= screenWidth - edgeZone ||
      touch.y <= edgeZone ||
      touch.y >= screenHeight - edgeZone
    );
  }

  private isPullToRefreshContext(target: HTMLElement): boolean {
    return target.closest('[data-pull-refresh]') !== null;
  }

  private recognizeTap(touch: TouchPoint): void {
    // Check for double tap
    if (this.lastTap) {
      const timeDiff = touch.timestamp - this.lastTap.time;
      const distance = this.calculateDistance(touch, this.lastTap.position);

      if (
        timeDiff <= this.config.doubleTap.maxTimeBetween &&
        distance <= this.config.doubleTap.maxDistance
      ) {
        this.emitGesture({
          type: 'double-tap',
          touches: [touch],
          startTime: this.lastTap.time,
          endTime: touch.timestamp,
          duration: timeDiff,
        });

        this.lastTap = null;
        return;
      }
    }

    // Single tap
    this.emitGesture({
      type: 'tap',
      touches: [touch],
      startTime: this.gestureStartTime,
      endTime: touch.timestamp,
      duration: touch.timestamp - this.gestureStartTime,
    });

    this.lastTap = { time: touch.timestamp, position: touch };
  }

  private recognizeSwipe(start: TouchPoint, end: TouchPoint, duration: number): void {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const distance = this.calculateDistance(start, end);
    const velocity = distance / duration;

    let direction: 'up' | 'down' | 'left' | 'right';

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    // Check if direction is allowed
    if (this.config.swipe.directions.includes(direction)) {
      this.emitGesture({
        type: 'swipe',
        touches: [start, end],
        startTime: this.gestureStartTime,
        endTime: end.timestamp,
        duration,
        data: { direction, distance, velocity, deltaX, deltaY },
      });
    }
  }

  private recognizeLongPress(touch: TouchPoint, target: HTMLElement): void {
    // Haptic feedback
    if (this.config.longPress.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }

    this.emitGesture({
      type: 'long-press',
      touches: [touch],
      startTime: this.gestureStartTime,
      endTime: Date.now(),
      duration: Date.now() - this.gestureStartTime,
      target,
    });
  }

  private startPinchRotateRecognition(touches: TouchPoint[]): void {
    const initialDistance = this.calculateDistance(touches[0], touches[1]);
    const initialAngle = this.calculateAngle(touches[0], touches[1]);

    this.activeGestures.set('pinch-rotate', {
      type: 'pinch',
      touches,
      startTime: this.gestureStartTime,
      endTime: 0,
      duration: 0,
      data: { initialDistance, initialAngle },
    });
  }

  private processPinchRotate(touches: TouchPoint[], currentTime: number): void {
    const activeGesture = this.activeGestures.get('pinch-rotate');
    if (!activeGesture) return;

    const currentDistance = this.calculateDistance(touches[0], touches[1]);
    const currentAngle = this.calculateAngle(touches[0], touches[1]);

    const scale = currentDistance / activeGesture.data.initialDistance;
    const rotation = currentAngle - activeGesture.data.initialAngle;

    // Determine if it's primarily pinch or rotate
    if (Math.abs(scale - 1) > 0.1) {
      this.emitGesture({
        type: 'pinch',
        touches,
        startTime: activeGesture.startTime,
        endTime: currentTime,
        duration: currentTime - activeGesture.startTime,
        data: { scale, distance: currentDistance },
      });
    }

    if (Math.abs(rotation) > 10) {
      // 10 degrees threshold
      this.emitGesture({
        type: 'rotate',
        touches,
        startTime: activeGesture.startTime,
        endTime: currentTime,
        duration: currentTime - activeGesture.startTime,
        data: { rotation, angle: currentAngle },
      });
    }
  }

  private processPanSwipe(touch: TouchPoint, currentTime: number): void {
    if (this.touchHistory.length < 2) return;

    const startTouch = this.touchHistory[0];
    const distance = this.calculateDistance(startTouch, touch);

    if (distance >= this.config.pan.minDistance) {
      const deltaX = touch.x - startTouch.x;
      const deltaY = touch.y - startTouch.y;

      this.emitGesture({
        type: 'pan',
        touches: [startTouch, touch],
        startTime: this.gestureStartTime,
        endTime: currentTime,
        duration: currentTime - this.gestureStartTime,
        data: { deltaX, deltaY, distance },
      });
    }
  }

  private startEdgeSwipeRecognition(touch: TouchPoint): void {
    this.activeGestures.set('edge-swipe', {
      type: 'edge-swipe',
      touches: [touch],
      startTime: this.gestureStartTime,
      endTime: 0,
      duration: 0,
    });
  }

  private startPullToRefreshRecognition(touch: TouchPoint): void {
    this.activeGestures.set('pull-refresh', {
      type: 'pull-to-refresh',
      touches: [touch],
      startTime: this.gestureStartTime,
      endTime: 0,
      duration: 0,
    });
  }

  private calculateDistance(p1: TouchPoint, p2: TouchPoint): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private calculateAngle(p1: TouchPoint, p2: TouchPoint): number {
    return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
  }

  private shouldPreventDefault(touches: TouchPoint[]): boolean {
    // Prevent default for specific gestures to avoid browser interference
    return (
      this.activeGestures.has('pinch-rotate') ||
      this.activeGestures.has('edge-swipe') ||
      this.activeGestures.has('pull-refresh')
    );
  }

  private cleanupAfterGesture(): void {
    this.activeGestures.clear();
    this.touchHistory = [];
    this.gestureStartTime = 0;
    this.isProcessing = false;
  }

  private emitGesture(gesture: GestureEvent): void {
    const listeners = this.listeners.get(gesture.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(gesture);
        } catch (error) {
          console.error(`Error in gesture listener for ${gesture.type}:`, error);
        }
      });
    }
  }

  public on(gestureType: GestureType, listener: (event: GestureEvent) => void): () => void {
    if (!this.listeners.has(gestureType)) {
      this.listeners.set(gestureType, new Set());
    }

    this.listeners.get(gestureType)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(gestureType)?.delete(listener);
    };
  }

  public off(gestureType: GestureType, listener: (event: GestureEvent) => void): void {
    this.listeners.get(gestureType)?.delete(listener);
  }

  public updateConfig(config: Partial<GestureConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public destroy(): void {
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('touchcancel', this.handleTouchCancel);

    if (window.DeviceMotionEvent) {
      window.removeEventListener('devicemotion', this.handleDeviceMotion);
    }

    this.listeners.clear();
    this.activeGestures.clear();
  }
}
