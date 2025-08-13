/**
 * Animation Helper Utilities
 * Performance-optimized helpers for 60fps animations
 */

// CSS Containment helpers
export const containment = {
  // Layout containment - prevents layout changes from affecting other elements
  layout: 'contain: layout;',
  
  // Style containment - prevents style changes from affecting other elements
  style: 'contain: style;',
  
  // Paint containment - prevents visual effects from affecting other elements
  paint: 'contain: paint;',
  
  // Size containment - element size is independent of its contents
  size: 'contain: size;',
  
  // Strict containment - all containment types except size
  strict: 'contain: layout style paint;',
  
  // Content containment - all containment types
  content: 'contain: layout style paint size;',
};

// Will-change optimization helpers
export const willChange = {
  // Apply will-change for transform animations
  transform: 'will-change: transform;',
  
  // Apply will-change for opacity animations
  opacity: 'will-change: opacity;',
  
  // Apply will-change for common animations
  common: 'will-change: transform, opacity;',
  
  // Apply will-change for scroll-linked animations
  scroll: 'will-change: transform, opacity, filter;',
  
  // Remove will-change after animation
  auto: 'will-change: auto;',
  
  // Dynamic will-change management
  manage: (property: string, duration: number = 300) => {
    return {
      onAnimationStart: (element: HTMLElement) => {
        element.style.willChange = property;
      },
      onAnimationEnd: (element: HTMLElement) => {
        setTimeout(() => {
          element.style.willChange = 'auto';
        }, duration);
      },
    };
  },
};

// GPU acceleration helpers
export const gpuAcceleration = {
  // Force GPU acceleration with 3D transform
  force3D: 'transform: translateZ(0);',
  
  // Alternative GPU acceleration
  force3DAlt: 'transform: translate3d(0, 0, 0);',
  
  // Backface visibility optimization
  backface: 'backface-visibility: hidden;',
  
  // Perspective optimization
  perspective: 'perspective: 1000px;',
  
  // Complete GPU optimization
  full: `
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
  `,
};

// Layout thrashing prevention
export const batchDOM = {
  // Batch DOM reads
  read: <T>(callback: () => T): T => {
    return callback();
  },
  
  // Batch DOM writes
  write: (callback: () => void): void => {
    requestAnimationFrame(callback);
  },
  
  // Read then write pattern
  readWrite: <T>(
    readCallback: () => T,
    writeCallback: (data: T) => void
  ): void => {
    const data = readCallback();
    requestAnimationFrame(() => writeCallback(data));
  },
  
  // Batch multiple operations
  batch: (operations: Array<{ read?: () => any; write?: (data?: any) => void }>) => {
    const reads: any[] = [];
    
    // Perform all reads first
    operations.forEach((op, index) => {
      if (op.read) {
        reads[index] = op.read();
      }
    });
    
    // Then perform all writes
    requestAnimationFrame(() => {
      operations.forEach((op, index) => {
        if (op.write) {
          op.write(reads[index]);
        }
      });
    });
  },
};

// Animation frame utilities
export const raf = {
  // Throttle function calls to animation frames
  throttle: <T extends (...args: any[]) => void>(fn: T): T => {
    let rafId: number | null = null;
    let lastArgs: any[] = [];
    
    return ((...args: any[]) => {
      lastArgs = args;
      
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          fn(...lastArgs);
          rafId = null;
        });
      }
    }) as T;
  },
  
  // Debounce function calls with animation frames
  debounce: <T extends (...args: any[]) => void>(fn: T, delay: number = 0): T => {
    let timeoutId: NodeJS.Timeout | null = null;
    let rafId: number | null = null;
    
    return ((...args: any[]) => {
      if (timeoutId) clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
      
      timeoutId = setTimeout(() => {
        rafId = requestAnimationFrame(() => {
          fn(...args);
          timeoutId = null;
          rafId = null;
        });
      }, delay);
    }) as T;
  },
  
  // Schedule multiple callbacks in sequence
  sequence: (callbacks: Array<() => void>) => {
    let index = 0;
    
    const next = () => {
      if (index < callbacks.length) {
        callbacks[index]();
        index++;
        requestAnimationFrame(next);
      }
    };
    
    requestAnimationFrame(next);
  },
};

// Transform utilities
export const transform = {
  // Parse transform string to object
  parse: (transformString: string): Record<string, string> => {
    const transforms: Record<string, string> = {};
    const regex = /(\w+)\(([^)]+)\)/g;
    let match;
    
    while ((match = regex.exec(transformString)) !== null) {
      transforms[match[1]] = match[2];
    }
    
    return transforms;
  },
  
  // Build transform string from object
  build: (transforms: Record<string, string | number>): string => {
    return Object.entries(transforms)
      .map(([key, value]) => {
        if (typeof value === 'number') {
          // Add units based on transform type
          switch (key) {
            case 'translateX':
            case 'translateY':
            case 'translateZ':
              return `${key}(${value}px)`;
            case 'rotate':
            case 'rotateX':
            case 'rotateY':
            case 'rotateZ':
              return `${key}(${value}deg)`;
            case 'scale':
            case 'scaleX':
            case 'scaleY':
            case 'scaleZ':
              return `${key}(${value})`;
            default:
              return `${key}(${value})`;
          }
        }
        return `${key}(${value})`;
      })
      .join(' ');
  },
  
  // Merge transform objects
  merge: (...transforms: Array<Record<string, string | number>>): string => {
    const merged = Object.assign({}, ...transforms);
    return transform.build(merged);
  },
  
  // Matrix decomposition for smooth interpolation
  decomposeMatrix: (matrix: string) => {
    const values = matrix.match(/matrix\((.+)\)/)?.[1].split(', ').map(Number) || [];
    
    if (values.length !== 6) return null;
    
    const [a, b, c, d, e, f] = values;
    
    const scaleX = Math.sqrt(a * a + b * b);
    const scaleY = Math.sqrt(c * c + d * d);
    const rotation = Math.atan2(b, a) * (180 / Math.PI);
    const translateX = e;
    const translateY = f;
    
    return {
      translateX,
      translateY,
      scaleX,
      scaleY,
      rotation,
    };
  },
};

// Scroll optimization utilities
export const scroll = {
  // Passive event listener options
  passive: { passive: true } as const,
  
  // Throttled scroll handler
  throttle: (handler: (event: Event) => void, delay: number = 16) => {
    let lastCall = 0;
    let timeoutId: NodeJS.Timeout | null = null;
    
    return (event: Event) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCall;
      
      if (timeSinceLastCall >= delay) {
        lastCall = now;
        handler(event);
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
          lastCall = Date.now();
          handler(event);
        }, delay - timeSinceLastCall);
      }
    };
  },
  
  // Debounced scroll handler
  debounce: (handler: (event: Event) => void, delay: number = 150) => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    return (event: Event) => {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        handler(event);
      }, delay);
    };
  },
  
  // Get scroll direction
  getDirection: (() => {
    let lastScrollTop = 0;
    
    return (): 'up' | 'down' | 'none' => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > lastScrollTop) {
        lastScrollTop = scrollTop;
        return 'down';
      } else if (scrollTop < lastScrollTop) {
        lastScrollTop = scrollTop;
        return 'up';
      }
      
      return 'none';
    };
  })(),
  
  // Check if element is in viewport
  isInViewport: (element: HTMLElement, offset: number = 0): boolean => {
    const rect = element.getBoundingClientRect();
    
    return (
      rect.top >= -offset &&
      rect.left >= -offset &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
    );
  },
};

// Performance measurement utilities
export const measure = {
  // Measure animation performance
  animation: (name: string, callback: () => void | Promise<void>) => {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    const measureName = `${name}-duration`;
    
    performance.mark(startMark);
    
    const complete = () => {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);
      
      const measure = performance.getEntriesByName(measureName)[0];
      
      if (measure) {
        
        if (measure.duration > 16.67) {
          console.warn(`Animation '${name}' exceeded 16.67ms frame budget`);
        }
      }
      
      // Cleanup
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);
    };
    
    const result = callback();
    
    if (result instanceof Promise) {
      result.then(complete);
    } else {
      complete();
    }
  },
  
  // FPS counter
  fps: () => {
    let lastTime = performance.now();
    let frames = 0;
    let fps = 0;
    
    const tick = () => {
      const currentTime = performance.now();
      frames++;
      
      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frames * 1000) / (currentTime - lastTime));
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(tick);
    };
    
    tick();
    
    return {
      get current() {
        return fps;
      },
    };
  },
};

// Cubic bezier solver for custom easing
export class CubicBezier {
  private cx: number;
  private bx: number;
  private ax: number;
  private cy: number;
  private by: number;
  private ay: number;
  
  constructor(p1x: number, p1y: number, p2x: number, p2y: number) {
    this.cx = 3.0 * p1x;
    this.bx = 3.0 * (p2x - p1x) - this.cx;
    this.ax = 1.0 - this.cx - this.bx;
    
    this.cy = 3.0 * p1y;
    this.by = 3.0 * (p2y - p1y) - this.cy;
    this.ay = 1.0 - this.cy - this.by;
  }
  
  private sampleCurveX(t: number): number {
    return ((this.ax * t + this.bx) * t + this.cx) * t;
  }
  
  private sampleCurveY(t: number): number {
    return ((this.ay * t + this.by) * t + this.cy) * t;
  }
  
  private sampleCurveDerivativeX(t: number): number {
    return (3.0 * this.ax * t + 2.0 * this.bx) * t + this.cx;
  }
  
  private solveCurveX(x: number, epsilon: number = 1e-6): number {
    let t0 = 0.0;
    let t1 = 1.0;
    let t2 = x;
    let x2: number;
    let d2: number;
    
    for (let i = 0; i < 8; i++) {
      x2 = this.sampleCurveX(t2) - x;
      if (Math.abs(x2) < epsilon) {
        return t2;
      }
      d2 = this.sampleCurveDerivativeX(t2);
      if (Math.abs(d2) < 1e-6) {
        break;
      }
      t2 = t2 - x2 / d2;
    }
    
    t2 = x;
    
    if (t2 < t0) {
      return t0;
    }
    if (t2 > t1) {
      return t1;
    }
    
    while (t0 < t1) {
      x2 = this.sampleCurveX(t2);
      if (Math.abs(x2 - x) < epsilon) {
        return t2;
      }
      if (x > x2) {
        t0 = t2;
      } else {
        t1 = t2;
      }
      t2 = (t1 - t0) * 0.5 + t0;
    }
    
    return t2;
  }
  
  solve(x: number): number {
    return this.sampleCurveY(this.solveCurveX(x));
  }
}

// Export all utilities
export default {
  containment,
  willChange,
  gpuAcceleration,
  batchDOM,
  raf,
  transform,
  scroll,
  measure,
  CubicBezier,
};