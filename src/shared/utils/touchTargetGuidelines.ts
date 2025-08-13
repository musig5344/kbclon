/**
 * Touch Target Guidelines Implementation
 * WCAG 2.1 Level AAA Compliance System
 * Implements comprehensive touch target standards for financial applications
 */

import { 
  WCAG_TOUCH_CONSTANTS,
  TouchDensity,
  touchTargetUtils,
  TouchTargetValidator,
  TouchAreaExpander,
} from './touchTargetOptimizer';

// Touch feedback types for different interactions
export enum TouchFeedbackType {
  TAP = 'tap',
  LONG_PRESS = 'longPress',
  SWIPE = 'swipe',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  NAVIGATION = 'navigation',
  FINANCIAL_ACTION = 'financialAction',
}

// Security levels for financial interactions
export enum SecurityLevel {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Touch target categories with specific requirements
export interface TouchTargetCategory {
  minSize: number;
  recommendedSize: number;
  minSpacing: number;
  feedback: TouchFeedbackType[];
  securityLevel: SecurityLevel;
  accessibilityFeatures: string[];
}

// Predefined touch target categories for financial apps
export const TOUCH_TARGET_CATEGORIES: Record<string, TouchTargetCategory> = {
  // Primary action buttons (login, submit, confirm)
  primary: {
    minSize: WCAG_TOUCH_CONSTANTS.LARGE_TARGET_SIZE,
    recommendedSize: 60,
    minSpacing: 12,
    feedback: [TouchFeedbackType.TAP, TouchFeedbackType.SUCCESS],
    securityLevel: SecurityLevel.HIGH,
    accessibilityFeatures: ['haptic', 'audio', 'visual', 'voice-control'],
  },
  
  // Secondary actions (cancel, back, options)
  secondary: {
    minSize: WCAG_TOUCH_CONSTANTS.MIN_TARGET_SIZE,
    recommendedSize: WCAG_TOUCH_CONSTANTS.RECOMMENDED_TARGET_SIZE,
    minSpacing: WCAG_TOUCH_CONSTANTS.MIN_SPACING,
    feedback: [TouchFeedbackType.TAP],
    securityLevel: SecurityLevel.LOW,
    accessibilityFeatures: ['haptic', 'visual', 'voice-control'],
  },
  
  // Financial transaction buttons (transfer, payment)
  financial: {
    minSize: WCAG_TOUCH_CONSTANTS.LARGE_TARGET_SIZE,
    recommendedSize: 64,
    minSpacing: 16,
    feedback: [TouchFeedbackType.TAP, TouchFeedbackType.FINANCIAL_ACTION, TouchFeedbackType.SUCCESS],
    securityLevel: SecurityLevel.CRITICAL,
    accessibilityFeatures: ['haptic', 'audio', 'visual', 'voice-control', 'double-confirmation'],
  },
  
  // Navigation elements (tabs, menu items)
  navigation: {
    minSize: WCAG_TOUCH_CONSTANTS.MIN_TARGET_SIZE,
    recommendedSize: WCAG_TOUCH_CONSTANTS.RECOMMENDED_TARGET_SIZE,
    minSpacing: WCAG_TOUCH_CONSTANTS.MIN_SPACING,
    feedback: [TouchFeedbackType.NAVIGATION],
    securityLevel: SecurityLevel.LOW,
    accessibilityFeatures: ['haptic', 'visual'],
  },
  
  // Form inputs (text fields, dropdowns)
  input: {
    minSize: WCAG_TOUCH_CONSTANTS.RECOMMENDED_TARGET_SIZE,
    recommendedSize: 52,
    minSpacing: 10,
    feedback: [TouchFeedbackType.TAP],
    securityLevel: SecurityLevel.MEDIUM,
    accessibilityFeatures: ['haptic', 'visual', 'voice-control', 'screen-reader'],
  },
  
  // Toggle controls (switches, checkboxes)
  toggle: {
    minSize: WCAG_TOUCH_CONSTANTS.MIN_TARGET_SIZE,
    recommendedSize: WCAG_TOUCH_CONSTANTS.RECOMMENDED_TARGET_SIZE,
    minSpacing: WCAG_TOUCH_CONSTANTS.MIN_SPACING,
    feedback: [TouchFeedbackType.TAP],
    securityLevel: SecurityLevel.MEDIUM,
    accessibilityFeatures: ['haptic', 'visual', 'audio'],
  },
  
  // Critical destructive actions (delete, reset)
  destructive: {
    minSize: WCAG_TOUCH_CONSTANTS.LARGE_TARGET_SIZE,
    recommendedSize: 56,
    minSpacing: 16,
    feedback: [TouchFeedbackType.WARNING, TouchFeedbackType.LONG_PRESS],
    securityLevel: SecurityLevel.HIGH,
    accessibilityFeatures: ['haptic', 'audio', 'visual', 'double-confirmation'],
  },
  
  // Quick access buttons (favorites, shortcuts)
  quickAccess: {
    minSize: WCAG_TOUCH_CONSTANTS.MIN_TARGET_SIZE,
    recommendedSize: WCAG_TOUCH_CONSTANTS.RECOMMENDED_TARGET_SIZE,
    minSpacing: WCAG_TOUCH_CONSTANTS.MIN_SPACING,
    feedback: [TouchFeedbackType.TAP],
    securityLevel: SecurityLevel.LOW,
    accessibilityFeatures: ['haptic', 'visual'],
  },
} as const;

// Touch feedback configuration
export interface TouchFeedbackConfig {
  haptic: {
    enabled: boolean;
    patterns: Record<TouchFeedbackType, number[]>;
  };
  visual: {
    enabled: boolean;
    ripple: boolean;
    highlight: boolean;
    animations: boolean;
  };
  audio: {
    enabled: boolean;
    sounds: Record<TouchFeedbackType, string>;
  };
}

// Default feedback configuration
export const DEFAULT_FEEDBACK_CONFIG: TouchFeedbackConfig = {
  haptic: {
    enabled: true,
    patterns: {
      [TouchFeedbackType.TAP]: [10],
      [TouchFeedbackType.LONG_PRESS]: [20],
      [TouchFeedbackType.SWIPE]: [5],
      [TouchFeedbackType.SUCCESS]: [10, 10, 10],
      [TouchFeedbackType.WARNING]: [20, 10, 20],
      [TouchFeedbackType.ERROR]: [50, 10, 50, 10, 50],
      [TouchFeedbackType.NAVIGATION]: [8],
      [TouchFeedbackType.FINANCIAL_ACTION]: [15, 15, 15],
    },
  },
  visual: {
    enabled: true,
    ripple: true,
    highlight: true,
    animations: true,
  },
  audio: {
    enabled: false, // Default disabled for financial apps
    sounds: {
      [TouchFeedbackType.TAP]: '/sounds/tap.wav',
      [TouchFeedbackType.LONG_PRESS]: '/sounds/long-press.wav',
      [TouchFeedbackType.SWIPE]: '/sounds/swipe.wav',
      [TouchFeedbackType.SUCCESS]: '/sounds/success.wav',
      [TouchFeedbackType.WARNING]: '/sounds/warning.wav',
      [TouchFeedbackType.ERROR]: '/sounds/error.wav',
      [TouchFeedbackType.NAVIGATION]: '/sounds/navigation.wav',
      [TouchFeedbackType.FINANCIAL_ACTION]: '/sounds/financial.wav',
    },
  },
};

// Touch target guidelines enforcer
export class TouchTargetGuidelinesEnforcer {
  private validator: TouchTargetValidator;
  private expander: TouchAreaExpander;
  private feedbackConfig: TouchFeedbackConfig;
  private density: TouchDensity;
  private enforcementMode: 'strict' | 'lenient' | 'development';

  constructor(
    density: TouchDensity = 'comfortable',
    feedbackConfig: Partial<TouchFeedbackConfig> = {},
    enforcementMode: 'strict' | 'lenient' | 'development' = 'strict'
  ) {
    this.validator = new TouchTargetValidator(density);
    this.expander = new TouchAreaExpander(density);
    this.feedbackConfig = { ...DEFAULT_FEEDBACK_CONFIG, ...feedbackConfig };
    this.density = density;
    this.enforcementMode = enforcementMode;
  }

  // Apply category-specific requirements to element
  applyCategory(element: HTMLElement, category: keyof typeof TOUCH_TARGET_CATEGORIES): boolean {
    const categoryConfig = TOUCH_TARGET_CATEGORIES[category];
    if (!categoryConfig) {
      console.warn(`Unknown touch target category: ${category}`);
      return false;
    }

    // Set minimum size
    this.enforceMinimumSize(element, categoryConfig.minSize);
    
    // Apply spacing requirements
    this.enforceSpacing(element, categoryConfig.minSpacing);
    
    // Configure feedback
    this.configureFeedback(element, categoryConfig.feedback, categoryConfig.securityLevel);
    
    // Add accessibility attributes
    this.addAccessibilityFeatures(element, categoryConfig.accessibilityFeatures);
    
    // Add category class for styling
    element.classList.add(`touch-target-${category}`);
    element.setAttribute('data-touch-category', category);
    element.setAttribute('data-security-level', categoryConfig.securityLevel);

    return true;
  }

  // Enforce minimum size requirements
  private enforceMinimumSize(element: HTMLElement, minSize: number): void {
    const currentStyle = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    // Check if element meets minimum size
    if (rect.width < minSize || rect.height < minSize) {
      if (this.enforcementMode === 'strict') {
        // Use touch area expansion for strict mode
        this.expander.expandElement(element, {
          minSize,
          useOverlay: true,
          preserveVisual: true,
        });
      } else {
        // Apply direct styling for lenient mode
        element.style.minWidth = `${minSize}px`;
        element.style.minHeight = `${minSize}px`;
      }
    }
  }

  // Enforce spacing requirements
  private enforceSpacing(element: HTMLElement, minSpacing: number): void {
    const nearbyElements = this.findNearbyInteractiveElements(element);
    
    for (const nearby of nearbyElements) {
      const distance = this.calculateElementDistance(element, nearby);
      
      if (distance < minSpacing) {
        if (this.enforcementMode === 'development') {
          console.warn(`Insufficient spacing between elements: ${distance}px < ${minSpacing}px`);
          this.highlightSpacingIssue(element, nearby);
        } else {
          // Add margin to ensure proper spacing
          const adjustment = Math.ceil((minSpacing - distance) / 2);
          element.style.margin = `${adjustment}px`;
        }
      }
    }
  }

  // Configure touch feedback
  private configureFeedback(
    element: HTMLElement, 
    feedbackTypes: TouchFeedbackType[], 
    securityLevel: SecurityLevel
  ): void {
    element.setAttribute('data-feedback-types', feedbackTypes.join(','));
    element.setAttribute('data-security-level', securityLevel);
    
    // Add event listeners for feedback
    element.addEventListener('touchstart', (e) => {
      this.triggerFeedback(feedbackTypes, securityLevel);
    });
    
    // Add visual feedback classes
    if (this.feedbackConfig.visual.enabled) {
      element.classList.add('touch-feedback-enabled');
      
      if (this.feedbackConfig.visual.ripple) {
        element.classList.add('ripple-effect');
      }
    }
  }

  // Add accessibility features
  private addAccessibilityFeatures(element: HTMLElement, features: string[]): void {
    features.forEach(feature => {
      switch (feature) {
        case 'voice-control':
          if (!element.getAttribute('aria-label') && !element.textContent?.trim()) {
            element.setAttribute('aria-label', 'Interactive element');
          }
          break;
          
        case 'screen-reader':
          element.setAttribute('role', element.getAttribute('role') || 'button');
          break;
          
        case 'double-confirmation':
          element.setAttribute('data-requires-confirmation', 'true');
          break;
          
        case 'haptic':
          element.setAttribute('data-haptic-enabled', 'true');
          break;
          
        case 'audio':
          element.setAttribute('data-audio-feedback', 'true');
          break;
      }
    });
  }

  // Trigger appropriate feedback
  private triggerFeedback(feedbackTypes: TouchFeedbackType[], securityLevel: SecurityLevel): void {
    feedbackTypes.forEach(type => {
      if (this.feedbackConfig.haptic.enabled) {
        this.triggerHapticFeedback(type, securityLevel);
      }
      
      if (this.feedbackConfig.audio.enabled) {
        this.triggerAudioFeedback(type);
      }
    });
  }

  // Trigger haptic feedback
  private triggerHapticFeedback(type: TouchFeedbackType, securityLevel: SecurityLevel): void {
    const pattern = this.feedbackConfig.haptic.patterns[type];
    if (pattern && 'vibrate' in navigator) {
      // Adjust intensity based on security level
      let adjustedPattern = pattern;
      
      if (securityLevel === SecurityLevel.CRITICAL) {
        adjustedPattern = pattern.map(duration => duration * 1.5);
      } else if (securityLevel === SecurityLevel.HIGH) {
        adjustedPattern = pattern.map(duration => duration * 1.2);
      }
      
      navigator.vibrate(adjustedPattern);
    }
  }

  // Trigger audio feedback
  private triggerAudioFeedback(type: TouchFeedbackType): void {
    const soundUrl = this.feedbackConfig.audio.sounds[type];
    if (soundUrl) {
      const audio = new Audio(soundUrl);
      audio.volume = 0.3; // Keep volume low for financial apps
      audio.play().catch(() => {
        // Audio play failed - ignore silently
      });
    }
  }

  // Find nearby interactive elements
  private findNearbyInteractiveElements(element: HTMLElement): HTMLElement[] {
    const rect = element.getBoundingClientRect();
    const searchRadius = 100; // px
    
    const interactiveElements = document.querySelectorAll([
      'button',
      'input',
      'select',
      'textarea',
      'a[href]',
      '[tabindex]',
      '[onclick]',
      '[role="button"]',
    ].join(',')) as NodeListOf<HTMLElement>;
    
    const nearby: HTMLElement[] = [];
    
    for (const interactive of interactiveElements) {
      if (interactive === element) continue;
      
      const distance = this.calculateElementDistance(element, interactive);
      if (distance <= searchRadius) {
        nearby.push(interactive);
      }
    }
    
    return nearby;
  }

  // Calculate distance between element centers
  private calculateElementDistance(element1: HTMLElement, element2: HTMLElement): number {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    
    const centerX1 = rect1.left + rect1.width / 2;
    const centerY1 = rect1.top + rect1.height / 2;
    const centerX2 = rect2.left + rect2.width / 2;
    const centerY2 = rect2.top + rect2.height / 2;
    
    return Math.sqrt(
      Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2)
    );
  }

  // Highlight spacing issues (development mode)
  private highlightSpacingIssue(element1: HTMLElement, element2: HTMLElement): void {
    const highlightStyle = '2px dashed red';
    element1.style.outline = highlightStyle;
    element2.style.outline = highlightStyle;
    
    setTimeout(() => {
      element1.style.outline = '';
      element2.style.outline = '';
    }, 3000);
  }

  // Enforce guidelines on entire page
  enforcePageGuidelines(): {
    processed: number;
    violations: number;
    autoFixed: number;
  } {
    const interactiveElements = document.querySelectorAll([
      'button',
      'input[type="button"]',
      'input[type="submit"]',
      'input[type="reset"]',
      'input[type="checkbox"]',
      'input[type="radio"]',
      'select',
      'textarea',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[onclick]',
      '[role="button"]',
    ].join(',')) as NodeListOf<HTMLElement>;

    let processed = 0;
    let violations = 0;
    let autoFixed = 0;

    for (const element of interactiveElements) {
      processed++;
      
      // Determine category based on element characteristics
      const category = this.determineElementCategory(element);
      
      // Apply category requirements
      const hadViolations = !this.validator.validateElement(element).isValid;
      if (hadViolations) violations++;
      
      if (this.applyCategory(element, category)) {
        if (hadViolations) autoFixed++;
      }
    }

    return { processed, violations, autoFixed };
  }

  // Determine appropriate category for element
  private determineElementCategory(element: HTMLElement): keyof typeof TOUCH_TARGET_CATEGORIES {
    const tagName = element.tagName.toLowerCase();
    const type = element.getAttribute('type')?.toLowerCase();
    const className = element.className.toLowerCase();
    const role = element.getAttribute('role')?.toLowerCase();
    const id = element.id.toLowerCase();

    // Financial actions
    if (
      className.includes('transfer') ||
      className.includes('payment') ||
      className.includes('buy') ||
      className.includes('sell') ||
      id.includes('transfer') ||
      id.includes('payment')
    ) {
      return 'financial';
    }

    // Primary actions
    if (
      type === 'submit' ||
      className.includes('primary') ||
      className.includes('cta') ||
      className.includes('login') ||
      id.includes('submit') ||
      id.includes('login')
    ) {
      return 'primary';
    }

    // Destructive actions
    if (
      className.includes('delete') ||
      className.includes('remove') ||
      className.includes('danger') ||
      className.includes('destructive') ||
      id.includes('delete')
    ) {
      return 'destructive';
    }

    // Navigation
    if (
      tagName === 'a' ||
      role === 'tab' ||
      className.includes('nav') ||
      className.includes('menu') ||
      element.closest('nav') !== null
    ) {
      return 'navigation';
    }

    // Form inputs
    if (
      ['input', 'select', 'textarea'].includes(tagName) ||
      type === 'checkbox' ||
      type === 'radio'
    ) {
      return type === 'checkbox' || type === 'radio' ? 'toggle' : 'input';
    }

    // Default to secondary
    return 'secondary';
  }
}

// Utility functions for easy integration
export const touchGuidelines = {
  enforcer: new TouchTargetGuidelinesEnforcer(),

  // Quick category application
  applyCategory: (element: HTMLElement, category: keyof typeof TOUCH_TARGET_CATEGORIES) =>
    touchGuidelines.enforcer.applyCategory(element, category),

  // Auto-categorize and apply guidelines
  autoApply: (element: HTMLElement) => {
    const category = touchGuidelines.enforcer['determineElementCategory'](element);
    return touchGuidelines.enforcer.applyCategory(element, category);
  },

  // Enforce guidelines on entire page
  enforcePage: () => touchGuidelines.enforcer.enforcePageGuidelines(),

  // Initialize guidelines system
  initialize: (
    density: TouchDensity = 'comfortable',
    feedbackConfig: Partial<TouchFeedbackConfig> = {},
    enforcementMode: 'strict' | 'lenient' | 'development' = 'strict'
  ) => {
    touchGuidelines.enforcer = new TouchTargetGuidelinesEnforcer(
      density,
      feedbackConfig,
      enforcementMode
    );

    // Auto-apply guidelines when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        touchGuidelines.enforcePage();
      });
    } else {
      touchGuidelines.enforcePage();
    }

    // Apply guidelines to dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            // Check if it's an interactive element
            if (element.matches([
              'button',
              'input',
              'select',
              'textarea',
              'a[href]',
              '[tabindex]',
              '[onclick]',
              '[role="button"]',
            ].join(','))) {
              touchGuidelines.autoApply(element as HTMLElement);
            }

            // Check children
            const interactiveChildren = element.querySelectorAll([
              'button',
              'input',
              'select',
              'textarea',
              'a[href]',
              '[tabindex]',
              '[onclick]',
              '[role="button"]',
            ].join(',')) as NodeListOf<HTMLElement>;

            for (const child of interactiveChildren) {
              touchGuidelines.autoApply(child);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return observer;
  },
};

// Export types and constants
export type {
  TouchFeedbackConfig,
  TouchTargetCategory,
};

export {
  TOUCH_TARGET_CATEGORIES,
  DEFAULT_FEEDBACK_CONFIG,
  TouchTargetGuidelinesEnforcer,
};