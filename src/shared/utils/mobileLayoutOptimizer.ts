/**
 * Mobile Layout Optimization System
 * Responsive touch target scaling, mobile-specific component variants
 * Density adjustments and thumb-friendly navigation zones
 */

import { 
  WCAG_TOUCH_CONSTANTS,
  TouchDensity,
} from './touchTargetOptimizer';

// Device categories based on screen size and usage patterns
export enum DeviceCategory {
  PHONE_SMALL = 'phone-small',     // < 375px width
  PHONE = 'phone',                 // 375px - 414px width
  PHONE_LARGE = 'phone-large',     // 414px - 480px width
  TABLET_SMALL = 'tablet-small',   // 480px - 768px width
  TABLET = 'tablet',               // 768px - 1024px width
  DESKTOP = 'desktop',             // > 1024px width
}

// Screen density categories
export enum ScreenDensity {
  LOW = 'low',           // < 1.5x
  STANDARD = 'standard', // 1.5x - 2x
  HIGH = 'high',         // 2x - 3x
  EXTRA_HIGH = 'extraHigh', // > 3x
}

// Usage contexts that affect touch target requirements
export enum UsageContext {
  ONE_HANDED = 'oneHanded',
  TWO_HANDED = 'twoHanded',
  THUMB_NAVIGATION = 'thumbNavigation',
  LANDSCAPE = 'landscape',
  PORTRAIT = 'portrait',
  WALKING = 'walking',
  SITTING = 'sitting',
  DRIVING = 'driving', // Voice-only recommended
}

// Breakpoints for responsive design
export const BREAKPOINTS = {
  phoneSmall: 320,
  phone: 375,
  phoneLarge: 414,
  tabletSmall: 480,
  tablet: 768,
  desktop: 1024,
  desktopLarge: 1440,
} as const;

// Touch zones based on thumb reach studies
export interface ThumbReachZones {
  easy: { width: number; height: number; bottom: number };
  comfortable: { width: number; height: number; bottom: number };
  difficult: { width: number; height: number; bottom: number };
  impossible: { width: number; height: number; bottom: number };
}

// Thumb reach zones for different device sizes (in pixels)
export const THUMB_REACH_ZONES: Record<DeviceCategory, ThumbReachZones> = {
  [DeviceCategory.PHONE_SMALL]: {
    easy: { width: 320, height: 160, bottom: 0 },
    comfortable: { width: 320, height: 240, bottom: 0 },
    difficult: { width: 320, height: 320, bottom: 0 },
    impossible: { width: 320, height: 480, bottom: 0 },
  },
  [DeviceCategory.PHONE]: {
    easy: { width: 375, height: 180, bottom: 0 },
    comfortable: { width: 375, height: 280, bottom: 0 },
    difficult: { width: 375, height: 380, bottom: 0 },
    impossible: { width: 375, height: 600, bottom: 0 },
  },
  [DeviceCategory.PHONE_LARGE]: {
    easy: { width: 414, height: 200, bottom: 0 },
    comfortable: { width: 414, height: 300, bottom: 0 },
    difficult: { width: 414, height: 420, bottom: 0 },
    impossible: { width: 414, height: 700, bottom: 0 },
  },
  [DeviceCategory.TABLET_SMALL]: {
    easy: { width: 480, height: 240, bottom: 0 },
    comfortable: { width: 480, height: 360, bottom: 0 },
    difficult: { width: 480, height: 480, bottom: 0 },
    impossible: { width: 480, height: 720, bottom: 0 },
  },
  [DeviceCategory.TABLET]: {
    easy: { width: 768, height: 300, bottom: 0 },
    comfortable: { width: 768, height: 450, bottom: 0 },
    difficult: { width: 768, height: 600, bottom: 0 },
    impossible: { width: 768, height: 1024, bottom: 0 },
  },
  [DeviceCategory.DESKTOP]: {
    easy: { width: 1024, height: 400, bottom: 0 },
    comfortable: { width: 1024, height: 600, bottom: 0 },
    difficult: { width: 1024, height: 800, bottom: 0 },
    impossible: { width: 1024, height: 1200, bottom: 0 },
  },
};

// Responsive scaling configuration
export interface ResponsiveScalingConfig {
  baseSize: number;
  scalingFactors: Record<DeviceCategory, number>;
  densityMultipliers: Record<ScreenDensity, number>;
  contextAdjustments: Record<UsageContext, number>;
}

// Default scaling configuration for touch targets
export const DEFAULT_SCALING_CONFIG: ResponsiveScalingConfig = {
  baseSize: WCAG_TOUCH_CONSTANTS.MIN_TARGET_SIZE,
  scalingFactors: {
    [DeviceCategory.PHONE_SMALL]: 1.1,
    [DeviceCategory.PHONE]: 1.0,
    [DeviceCategory.PHONE_LARGE]: 0.95,
    [DeviceCategory.TABLET_SMALL]: 0.9,
    [DeviceCategory.TABLET]: 0.85,
    [DeviceCategory.DESKTOP]: 0.8,
  },
  densityMultipliers: {
    [ScreenDensity.LOW]: 1.2,
    [ScreenDensity.STANDARD]: 1.0,
    [ScreenDensity.HIGH]: 0.9,
    [ScreenDensity.EXTRA_HIGH]: 0.85,
  },
  contextAdjustments: {
    [UsageContext.ONE_HANDED]: 1.15,
    [UsageContext.TWO_HANDED]: 1.0,
    [UsageContext.THUMB_NAVIGATION]: 1.2,
    [UsageContext.LANDSCAPE]: 0.95,
    [UsageContext.PORTRAIT]: 1.0,
    [UsageContext.WALKING]: 1.25,
    [UsageContext.SITTING]: 1.0,
    [UsageContext.DRIVING]: 1.5, // Should use voice commands
  },
};

// Mobile layout optimizer
export class MobileLayoutOptimizer {
  private currentDevice: DeviceCategory;
  private currentDensity: ScreenDensity;
  private currentContext: UsageContext[];
  private scalingConfig: ResponsiveScalingConfig;
  
  constructor(scalingConfig: Partial<ResponsiveScalingConfig> = {}) {
    this.scalingConfig = { ...DEFAULT_SCALING_CONFIG, ...scalingConfig };
    this.currentDevice = this.detectDeviceCategory();
    this.currentDensity = this.detectScreenDensity();
    this.currentContext = this.detectUsageContext();
    
    this.setupResponsiveListeners();
  }

  // Detect device category based on screen size
  private detectDeviceCategory(): DeviceCategory {
    const width = window.innerWidth;
    
    if (width < BREAKPOINTS.phone) return DeviceCategory.PHONE_SMALL;
    if (width < BREAKPOINTS.phoneLarge) return DeviceCategory.PHONE;
    if (width < BREAKPOINTS.tabletSmall) return DeviceCategory.PHONE_LARGE;
    if (width < BREAKPOINTS.tablet) return DeviceCategory.TABLET_SMALL;
    if (width < BREAKPOINTS.desktop) return DeviceCategory.TABLET;
    return DeviceCategory.DESKTOP;
  }

  // Detect screen density
  private detectScreenDensity(): ScreenDensity {
    const dpr = window.devicePixelRatio || 1;
    
    if (dpr < 1.5) return ScreenDensity.LOW;
    if (dpr < 2) return ScreenDensity.STANDARD;
    if (dpr < 3) return ScreenDensity.HIGH;
    return ScreenDensity.EXTRA_HIGH;
  }

  // Detect usage context based on device characteristics
  private detectUsageContext(): UsageContext[] {
    const contexts: UsageContext[] = [];
    
    // Orientation
    if (window.innerHeight > window.innerWidth) {
      contexts.push(UsageContext.PORTRAIT);
    } else {
      contexts.push(UsageContext.LANDSCAPE);
    }
    
    // Device size suggests usage pattern
    if (this.currentDevice === DeviceCategory.PHONE_SMALL || 
        this.currentDevice === DeviceCategory.PHONE) {
      contexts.push(UsageContext.ONE_HANDED);
      contexts.push(UsageContext.THUMB_NAVIGATION);
    } else if (this.currentDevice === DeviceCategory.PHONE_LARGE) {
      contexts.push(UsageContext.TWO_HANDED);
    }
    
    // Check for motion (walking detection)
    if ('DeviceMotionEvent' in window) {
      // This would require user permission and actual motion detection
      // For now, we'll assume sitting
      contexts.push(UsageContext.SITTING);
    }
    
    return contexts;
  }

  // Setup listeners for responsive changes
  private setupResponsiveListeners(): void {
    window.addEventListener('resize', () => {
      const newDevice = this.detectDeviceCategory();
      if (newDevice !== this.currentDevice) {
        this.currentDevice = newDevice;
        this.updateLayout();
      }
    });
    
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.currentContext = this.detectUsageContext();
        this.updateLayout();
      }, 100);
    });
  }

  // Calculate optimal touch target size
  calculateOptimalSize(baseSize?: number): number {
    const base = baseSize || this.scalingConfig.baseSize;
    
    // Apply device scaling
    let size = base * this.scalingConfig.scalingFactors[this.currentDevice];
    
    // Apply density scaling
    size *= this.scalingConfig.densityMultipliers[this.currentDensity];
    
    // Apply context adjustments (use maximum for multiple contexts)
    const contextMultiplier = Math.max(
      ...this.currentContext.map(context => 
        this.scalingConfig.contextAdjustments[context]
      )
    );
    size *= contextMultiplier;
    
    // Ensure minimum WCAG compliance
    return Math.max(Math.round(size), WCAG_TOUCH_CONSTANTS.MIN_TARGET_SIZE);
  }

  // Calculate optimal spacing
  calculateOptimalSpacing(): number {
    const baseSpacing = WCAG_TOUCH_CONSTANTS.MIN_SPACING;
    const scalingFactor = this.scalingConfig.scalingFactors[this.currentDevice];
    const densityMultiplier = this.scalingConfig.densityMultipliers[this.currentDensity];
    
    return Math.max(
      Math.round(baseSpacing * scalingFactor * densityMultiplier),
      WCAG_TOUCH_CONSTANTS.MIN_SPACING
    );
  }

  // Get thumb reach zones for current device
  getThumbReachZones(): ThumbReachZones {
    return THUMB_REACH_ZONES[this.currentDevice];
  }

  // Check if element is in thumb-friendly zone
  isInThumbFriendlyZone(element: HTMLElement, zone: 'easy' | 'comfortable' = 'comfortable'): boolean {
    const rect = element.getBoundingClientRect();
    const zones = this.getThumbReachZones();
    const targetZone = zones[zone];
    
    const elementBottom = window.innerHeight - rect.top;
    const elementCenterX = rect.left + rect.width / 2;
    
    return (
      elementBottom <= targetZone.height &&
      elementCenterX >= 0 &&
      elementCenterX <= targetZone.width
    );
  }

  // Apply mobile optimization to element
  optimizeElement(element: HTMLElement, options: {
    category?: 'primary' | 'secondary' | 'navigation' | 'input';
    forceThumbZone?: boolean;
    preserveOriginal?: boolean;
  } = {}): void {
    const { category = 'secondary', forceThumbZone = false, preserveOriginal = false } = options;
    
    // Store original values if preserving
    if (preserveOriginal) {
      element.setAttribute('data-original-size', `${element.offsetWidth}x${element.offsetHeight}`);
      element.setAttribute('data-original-margin', element.style.margin || '0');
    }
    
    // Calculate optimal dimensions
    const optimalSize = this.calculateOptimalSize();
    const optimalSpacing = this.calculateOptimalSpacing();
    
    // Apply size adjustments
    element.style.minWidth = `${optimalSize}px`;
    element.style.minHeight = `${optimalSize}px`;
    element.style.margin = `${optimalSpacing}px`;
    
    // Add responsive classes
    element.classList.add('mobile-optimized');
    element.classList.add(`device-${this.currentDevice}`);
    element.classList.add(`density-${this.currentDensity}`);
    
    // Add context classes
    this.currentContext.forEach(context => {
      element.classList.add(`context-${context}`);
    });
    
    // Move to thumb-friendly zone if requested and not already there
    if (forceThumbZone && !this.isInThumbFriendlyZone(element)) {
      this.moveToThumbZone(element);
    }
    
    // Add touch attributes
    element.setAttribute('data-touch-optimized', 'true');
    element.setAttribute('data-optimal-size', optimalSize.toString());
    element.setAttribute('data-device-category', this.currentDevice);
  }

  // Move element to thumb-friendly zone
  private moveToThumbZone(element: HTMLElement): void {
    const zones = this.getThumbReachZones();
    const rect = element.getBoundingClientRect();
    
    // Calculate position within comfortable zone
    const comfortableZone = zones.comfortable;
    const targetY = window.innerHeight - comfortableZone.height + 20; // 20px padding
    const targetX = Math.min(rect.left, comfortableZone.width - rect.width - 20);
    
    // Apply positioning
    element.style.position = 'fixed';
    element.style.bottom = '20px';
    element.style.left = `${Math.max(20, targetX)}px`;
    element.style.zIndex = '1000';
    
    element.classList.add('thumb-zone-positioned');
  }

  // Generate responsive CSS custom properties
  generateCSSCustomProperties(): Record<string, string> {
    const optimalSize = this.calculateOptimalSize();
    const optimalSpacing = this.calculateOptimalSpacing();
    const zones = this.getThumbReachZones();
    
    return {
      '--touch-target-size': `${optimalSize}px`,
      '--touch-target-spacing': `${optimalSpacing}px`,
      '--thumb-zone-easy-height': `${zones.easy.height}px`,
      '--thumb-zone-comfortable-height': `${zones.comfortable.height}px`,
      '--thumb-zone-difficult-height': `${zones.difficult.height}px`,
      '--device-category': this.currentDevice,
      '--screen-density': this.currentDensity,
      '--usage-context': this.currentContext.join(' '),
    };
  }

  // Apply CSS custom properties to document
  applyCSSCustomProperties(): void {
    const properties = this.generateCSSCustomProperties();
    
    Object.entries(properties).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
  }

  // Update layout when conditions change
  private updateLayout(): void {
    this.applyCSSCustomProperties();
    
    // Update all optimized elements
    const optimizedElements = document.querySelectorAll('[data-touch-optimized="true"]') as NodeListOf<HTMLElement>;
    
    optimizedElements.forEach(element => {
      this.optimizeElement(element, {
        preserveOriginal: element.hasAttribute('data-original-size'),
      });
    });
    
    // Dispatch custom event for components to respond
    window.dispatchEvent(new CustomEvent('mobile-layout-updated', {
      detail: {
        device: this.currentDevice,
        density: this.currentDensity,
        context: this.currentContext,
      },
    }));
  }

  // Get layout recommendations for current context
  getLayoutRecommendations(): {
    touchTargetSize: number;
    spacing: number;
    thumbZones: ThumbReachZones;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    
    // Context-specific recommendations
    if (this.currentContext.includes(UsageContext.ONE_HANDED)) {
      recommendations.push('Position primary actions in bottom third of screen');
      recommendations.push('Use bottom navigation over top navigation');
      recommendations.push('Consider floating action buttons for key actions');
    }
    
    if (this.currentContext.includes(UsageContext.WALKING)) {
      recommendations.push('Increase touch target sizes by 25%');
      recommendations.push('Use high contrast colors');
      recommendations.push('Minimize complex gestures');
    }
    
    if (this.currentDevice === DeviceCategory.PHONE_SMALL) {
      recommendations.push('Use bottom sheets instead of modals');
      recommendations.push('Minimize number of elements per row');
      recommendations.push('Consider progressive disclosure');
    }
    
    if (this.currentDensity === ScreenDensity.LOW) {
      recommendations.push('Increase touch target sizes');
      recommendations.push('Use thicker borders and outlines');
      recommendations.push('Ensure sufficient color contrast');
    }
    
    return {
      touchTargetSize: this.calculateOptimalSize(),
      spacing: this.calculateOptimalSpacing(),
      thumbZones: this.getThumbReachZones(),
      recommendations,
    };
  }

  // Audit current layout for mobile optimization
  auditMobileOptimization(): {
    totalElements: number;
    optimizedElements: number;
    thumbFriendlyElements: number;
    issues: Array<{
      element: HTMLElement;
      issue: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      recommendation: string;
    }>;
  } {
    const interactiveElements = document.querySelectorAll([
      'button',
      'input',
      'select',
      'textarea',
      'a[href]',
      '[role="button"]',
      '[onclick]',
    ].join(',')) as NodeListOf<HTMLElement>;

    const issues: any[] = [];
    let optimizedElements = 0;
    let thumbFriendlyElements = 0;

    for (const element of interactiveElements) {
      if (element.hasAttribute('data-touch-optimized')) {
        optimizedElements++;
      }
      
      if (this.isInThumbFriendlyZone(element)) {
        thumbFriendlyElements++;
      } else {
        issues.push({
          element,
          issue: 'Element not in thumb-friendly zone',
          severity: 'medium',
          recommendation: 'Move element to bottom third of screen or make it less frequently used',
        });
      }
      
      // Check size
      const rect = element.getBoundingClientRect();
      const optimalSize = this.calculateOptimalSize();
      
      if (rect.width < optimalSize || rect.height < optimalSize) {
        issues.push({
          element,
          issue: `Touch target too small: ${rect.width}×${rect.height}px`,
          severity: rect.width < 32 || rect.height < 32 ? 'critical' : 'high',
          recommendation: `Increase size to at least ${optimalSize}×${optimalSize}px`,
        });
      }
    }

    return {
      totalElements: interactiveElements.length,
      optimizedElements,
      thumbFriendlyElements,
      issues,
    };
  }
}

// Convenience utilities
export const mobileLayoutUtils = {
  optimizer: new MobileLayoutOptimizer(),

  // Quick optimization
  optimize: (element: HTMLElement, options?: any) =>
    mobileLayoutUtils.optimizer.optimizeElement(element, options),

  // Check thumb friendliness
  isThumbFriendly: (element: HTMLElement) =>
    mobileLayoutUtils.optimizer.isInThumbFriendlyZone(element),

  // Get current device info
  getDeviceInfo: () => ({
    category: mobileLayoutUtils.optimizer['currentDevice'],
    density: mobileLayoutUtils.optimizer['currentDensity'],
    context: mobileLayoutUtils.optimizer['currentContext'],
  }),

  // Initialize system
  initialize: () => {
    mobileLayoutUtils.optimizer.applyCSSCustomProperties();
    
    // Auto-optimize on load
    document.addEventListener('DOMContentLoaded', () => {
      const elements = document.querySelectorAll([
        'button',
        'input[type="button"]',
        'input[type="submit"]',
        'a[href]',
        '[role="button"]',
      ].join(',')) as NodeListOf<HTMLElement>;
      
      elements.forEach(element => {
        mobileLayoutUtils.optimize(element);
      });
    });
  },

  // Generate audit report
  audit: () => mobileLayoutUtils.optimizer.auditMobileOptimization(),

  // Get layout recommendations
  getRecommendations: () => mobileLayoutUtils.optimizer.getLayoutRecommendations(),
};

// Export types and utilities
export type {
  ResponsiveScalingConfig,
  ThumbReachZones,
};

export {
  DeviceCategory,
  ScreenDensity,
  UsageContext,
  BREAKPOINTS,
  THUMB_REACH_ZONES,
  DEFAULT_SCALING_CONFIG,
  MobileLayoutOptimizer,
  mobileLayoutUtils,
};