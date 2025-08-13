/**
 * Animation Performance Monitoring Utility
 * Tracks FPS, frame timing, and animation performance metrics
 */

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  droppedFrames: number;
  jank: number;
}

interface AnimationMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  averageFps: number;
  minFps: number;
  maxFps: number;
  droppedFrames: number;
}

class AnimationPerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private fpsHistory: number[] = [];
  private droppedFrames = 0;
  private jankCount = 0;
  private isMonitoring = false;
  private animationMetrics: Map<string, AnimationMetrics> = new Map();
  private rafId: number | null = null;
  private callbacks: ((metrics: PerformanceMetrics) => void)[] = [];

  // Start monitoring
  start(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsHistory = [];
    this.droppedFrames = 0;
    this.jankCount = 0;
    
    this.tick();
  }

  // Stop monitoring
  stop(): void {
    this.isMonitoring = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // Main tick function
  private tick = (): void => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    // Calculate FPS
    if (deltaTime > 0) {
      this.fps = Math.round(1000 / deltaTime);
      this.fpsHistory.push(this.fps);
      
      // Keep only last 60 frames for history
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }
      
      // Detect dropped frames (below 55 FPS)
      if (this.fps < 55) {
        this.droppedFrames++;
      }
      
      // Detect jank (frame time > 50ms)
      if (deltaTime > 50) {
        this.jankCount++;
      }
    }
    
    this.frameCount++;
    this.lastTime = currentTime;
    
    // Notify callbacks every 10 frames
    if (this.frameCount % 10 === 0) {
      this.notifyCallbacks();
    }
    
    this.rafId = requestAnimationFrame(this.tick);
  };

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    const avgFps = this.fpsHistory.length > 0
      ? Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length)
      : 60;
    
    return {
      fps: this.fps,
      frameTime: Math.round(1000 / this.fps),
      droppedFrames: this.droppedFrames,
      jank: this.jankCount,
    };
  }

  // Subscribe to metrics updates
  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  // Notify all subscribers
  private notifyCallbacks(): void {
    const metrics = this.getMetrics();
    this.callbacks.forEach(callback => callback(metrics));
  }

  // Track specific animation
  startAnimation(animationId: string): void {
    const startMetrics = {
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      averageFps: 0,
      minFps: Infinity,
      maxFps: 0,
      droppedFrames: 0,
    };
    
    this.animationMetrics.set(animationId, startMetrics);
  }

  // End animation tracking
  endAnimation(animationId: string): AnimationMetrics | null {
    const metrics = this.animationMetrics.get(animationId);
    if (!metrics) return null;
    
    metrics.endTime = performance.now();
    metrics.duration = metrics.endTime - metrics.startTime;
    
    // Calculate FPS metrics from history during animation
    const relevantFps = this.fpsHistory.slice(-Math.ceil(metrics.duration / 16.67));
    
    if (relevantFps.length > 0) {
      metrics.averageFps = Math.round(
        relevantFps.reduce((a, b) => a + b, 0) / relevantFps.length
      );
      metrics.minFps = Math.min(...relevantFps);
      metrics.maxFps = Math.max(...relevantFps);
      metrics.droppedFrames = relevantFps.filter(fps => fps < 55).length;
    }
    
    return metrics;
  }

  // Get animation report
  getAnimationReport(animationId: string): string {
    const metrics = this.animationMetrics.get(animationId);
    if (!metrics) return 'No metrics found for animation';
    
    return `
Animation Performance Report (${animationId}):
- Duration: ${metrics.duration.toFixed(2)}ms
- Average FPS: ${metrics.averageFps}
- Min FPS: ${metrics.minFps}
- Max FPS: ${metrics.maxFps}
- Dropped Frames: ${metrics.droppedFrames}
- Performance: ${this.getPerformanceRating(metrics.averageFps)}
    `.trim();
  }

  // Get performance rating
  private getPerformanceRating(avgFps: number): string {
    if (avgFps >= 58) return 'Excellent (60fps)';
    if (avgFps >= 50) return 'Good (50-59fps)';
    if (avgFps >= 30) return 'Fair (30-49fps)';
    return 'Poor (<30fps)';
  }

  // Reset metrics
  reset(): void {
    this.frameCount = 0;
    this.fpsHistory = [];
    this.droppedFrames = 0;
    this.jankCount = 0;
    this.animationMetrics.clear();
  }
}

// Export singleton instance
export const animationMonitor = new AnimationPerformanceMonitor();

// Performance optimization helpers
export const performanceHelpers = {
  // Check if device prefers reduced motion
  prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Check if device is low-end
  isLowEndDevice(): boolean {
    // Check for various indicators of low-end devices
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency;
    
    return (
      (memory && memory < 4) || // Less than 4GB RAM
      (cores && cores < 4) || // Less than 4 CPU cores
      !window.requestIdleCallback || // No idle callback support
      performanceHelpers.prefersReducedMotion()
    );
  },

  // Schedule animation when browser is idle
  scheduleAnimation(callback: () => void, options?: IdleRequestOptions): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback, options);
    } else {
      // Fallback for browsers without idle callback
      setTimeout(callback, 0);
    }
  },

  // Debounce animations
  debounceAnimation(
    func: (...args: any[]) => void,
    wait: number
  ): (...args: any[]) => void {
    let rafId: number | null = null;
    let lastArgs: any[] | null = null;
    
    return (...args: any[]) => {
      lastArgs = args;
      
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          func(...(lastArgs as any[]));
          rafId = null;
          lastArgs = null;
        });
      }
    };
  },

  // Throttle animations
  throttleAnimation(
    func: (...args: any[]) => void,
    limit: number
  ): (...args: any[]) => void {
    let inThrottle = false;
    
    return (...args: any[]) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        
        requestAnimationFrame(() => {
          setTimeout(() => {
            inThrottle = false;
          }, limit);
        });
      }
    };
  },
};

export default animationMonitor;