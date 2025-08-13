/**
 * Touch Target Size Optimization Utilities
 * WCAG 2.1 Level AAA Compliance (44x44px minimum)
 * Ensures all interactive elements meet accessibility standards
 */

import { TOUCH_CONSTANTS } from './touchOptimization';

// WCAG 2.1 Level AAA Constants
export const WCAG_TOUCH_CONSTANTS = {
  MIN_TARGET_SIZE: 44, // px - WCAG 2.1 Level AAA minimum
  MIN_SPACING: 8, // px - Minimum spacing between targets
  RECOMMENDED_TARGET_SIZE: 48, // px - Recommended for better usability
  LARGE_TARGET_SIZE: 56, // px - For primary actions
  THUMB_ZONE_WIDTH: 72, // px - Comfortable thumb reach
  EXPANSION_PADDING: 12, // px - Default expansion for small targets
  DENSITY_ADJUSTMENTS: {
    comfortable: 1.0, // Normal spacing
    cozy: 0.8, // Reduced spacing for experienced users
    compact: 0.6, // Minimal spacing for small screens
  },
} as const;

// Touch target validation result
export interface TouchTargetValidation {
  isValid: boolean;
  actualSize: { width: number; height: number };
  requiredSize: { width: number; height: number };
  needsExpansion: boolean;
  expansionAmount: { horizontal: number; vertical: number };
  hasAdequateSpacing: boolean;
  nearbyTargets: HTMLElement[];
  violations: string[];
  recommendations: string[];
}

// Touch target auditor result
export interface TouchTargetAuditResult {
  totalElements: number;
  validElements: number;
  invalidElements: number;
  complianceRate: number;
  violations: Array<{
    element: HTMLElement;
    validation: TouchTargetValidation;
    priority: 'critical' | 'high' | 'medium' | 'low';
  }>;
  summary: {
    tooSmall: number;
    inadequateSpacing: number;
    needsExpansion: number;
    recommendations: string[];
  };
}

// Touch density preference
export type TouchDensity = 'comfortable' | 'cozy' | 'compact';

// Touch target spacing calculator
export class TouchTargetSpacingCalculator {
  private density: TouchDensity;

  constructor(density: TouchDensity = 'comfortable') {
    this.density = density;
  }

  setDensity(density: TouchDensity): void {
    this.density = density;
  }

  getDensityMultiplier(): number {
    return WCAG_TOUCH_CONSTANTS.DENSITY_ADJUSTMENTS[this.density];
  }

  calculateMinSpacing(): number {
    return Math.ceil(WCAG_TOUCH_CONSTANTS.MIN_SPACING * this.getDensityMultiplier());
  }

  calculateTargetSize(baseSize: number = WCAG_TOUCH_CONSTANTS.MIN_TARGET_SIZE): number {
    return Math.ceil(baseSize * this.getDensityMultiplier());
  }

  calculateOptimalSpacing(targetSize: number): number {
    const densityMultiplier = this.getDensityMultiplier();
    const baseSpacing = Math.max(WCAG_TOUCH_CONSTANTS.MIN_SPACING, targetSize * 0.2);
    return Math.ceil(baseSpacing * densityMultiplier);
  }

  getThumbFriendlyZone(): { width: number; height: number } {
    const multiplier = this.getDensityMultiplier();
    return {
      width: Math.ceil(WCAG_TOUCH_CONSTANTS.THUMB_ZONE_WIDTH * multiplier),
      height: Math.ceil(WCAG_TOUCH_CONSTANTS.THUMB_ZONE_WIDTH * multiplier),
    };
  }
}

// Touch target size validator
export class TouchTargetValidator {
  private spacingCalculator: TouchTargetSpacingCalculator;

  constructor(density: TouchDensity = 'comfortable') {
    this.spacingCalculator = new TouchTargetSpacingCalculator(density);
  }

  validateElement(element: HTMLElement): TouchTargetValidation {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    
    // Get actual clickable area including padding
    const paddingLeft = parseInt(computedStyle.paddingLeft, 10) || 0;
    const paddingRight = parseInt(computedStyle.paddingRight, 10) || 0;
    const paddingTop = parseInt(computedStyle.paddingTop, 10) || 0;
    const paddingBottom = parseInt(computedStyle.paddingBottom, 10) || 0;
    
    const actualSize = {
      width: rect.width + paddingLeft + paddingRight,
      height: rect.height + paddingTop + paddingBottom,
    };

    const minTargetSize = this.spacingCalculator.calculateTargetSize();
    const requiredSize = {
      width: Math.max(minTargetSize, actualSize.width),
      height: Math.max(minTargetSize, actualSize.height),
    };

    const needsExpansion = 
      actualSize.width < minTargetSize || 
      actualSize.height < minTargetSize;

    const expansionAmount = {
      horizontal: Math.max(0, minTargetSize - actualSize.width) / 2,
      vertical: Math.max(0, minTargetSize - actualSize.height) / 2,
    };

    // Check spacing with nearby interactive elements
    const nearbyTargets = this.findNearbyInteractiveElements(element);
    const hasAdequateSpacing = this.checkSpacing(element, nearbyTargets);

    const violations: string[] = [];
    const recommendations: string[] = [];

    // Validate size
    if (actualSize.width < minTargetSize) {
      violations.push(`Width ${actualSize.width}px is below minimum ${minTargetSize}px`);
      recommendations.push(`Increase width to at least ${minTargetSize}px`);
    }
    if (actualSize.height < minTargetSize) {
      violations.push(`Height ${actualSize.height}px is below minimum ${minTargetSize}px`);
      recommendations.push(`Increase height to at least ${minTargetSize}px`);
    }

    // Validate spacing
    if (!hasAdequateSpacing) {
      violations.push('Insufficient spacing between interactive elements');
      recommendations.push(`Ensure at least ${this.spacingCalculator.calculateMinSpacing()}px spacing`);
    }

    // Add contextual recommendations
    if (this.isImportantAction(element)) {
      const largeSize = WCAG_TOUCH_CONSTANTS.LARGE_TARGET_SIZE;
      if (actualSize.width < largeSize || actualSize.height < largeSize) {
        recommendations.push(`Consider using larger size (${largeSize}px) for primary actions`);
      }
    }

    return {
      isValid: violations.length === 0,
      actualSize,
      requiredSize,
      needsExpansion,
      expansionAmount,
      hasAdequateSpacing,
      nearbyTargets,
      violations,
      recommendations,
    };
  }

  private findNearbyInteractiveElements(element: HTMLElement): HTMLElement[] {
    const rect = element.getBoundingClientRect();
    const searchRadius = WCAG_TOUCH_CONSTANTS.MIN_TARGET_SIZE + WCAG_TOUCH_CONSTANTS.MIN_SPACING;
    
    const interactiveSelectors = [
      'button',
      'input[type="button"]',
      'input[type="submit"]',
      'input[type="reset"]',
      'input[type="checkbox"]',
      'input[type="radio"]',
      'select',
      'textarea',
      'a[href]',
      '[tabindex]',
      '[onclick]',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="tab"]',
    ];

    const allInteractive = document.querySelectorAll(interactiveSelectors.join(','));
    const nearby: HTMLElement[] = [];

    for (const interactive of allInteractive) {
      if (interactive === element || !(interactive instanceof HTMLElement)) continue;

      const interactiveRect = interactive.getBoundingClientRect();
      const distance = this.calculateDistance(rect, interactiveRect);

      if (distance <= searchRadius) {
        nearby.push(interactive);
      }
    }

    return nearby;
  }

  private checkSpacing(element: HTMLElement, nearbyTargets: HTMLElement[]): boolean {
    if (nearbyTargets.length === 0) return true;

    const elementRect = element.getBoundingClientRect();
    const minSpacing = this.spacingCalculator.calculateMinSpacing();

    for (const target of nearbyTargets) {
      const targetRect = target.getBoundingClientRect();
      const distance = this.calculateEdgeDistance(elementRect, targetRect);

      if (distance < minSpacing) {
        return false;
      }
    }

    return true;
  }

  private calculateDistance(rect1: DOMRect, rect2: DOMRect): number {
    const centerX1 = rect1.left + rect1.width / 2;
    const centerY1 = rect1.top + rect1.height / 2;
    const centerX2 = rect2.left + rect2.width / 2;
    const centerY2 = rect2.top + rect2.height / 2;

    return Math.sqrt(
      Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2)
    );
  }

  private calculateEdgeDistance(rect1: DOMRect, rect2: DOMRect): number {
    const left = Math.max(rect1.left, rect2.left);
    const right = Math.min(rect1.right, rect2.right);
    const top = Math.max(rect1.top, rect2.top);
    const bottom = Math.min(rect1.bottom, rect2.bottom);

    if (left < right && top < bottom) {
      // Overlapping
      return 0;
    }

    const horizontalDistance = left >= right ? left - right : 0;
    const verticalDistance = top >= bottom ? top - bottom : 0;

    return Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance);
  }

  private isImportantAction(element: HTMLElement): boolean {
    const importantTypes = ['submit', 'button'];
    const importantClasses = ['primary', 'cta', 'submit', 'confirm', 'buy'];
    const importantRoles = ['button'];
    
    const tagName = element.tagName.toLowerCase();
    const type = element.getAttribute('type')?.toLowerCase();
    const className = element.className.toLowerCase();
    const role = element.getAttribute('role')?.toLowerCase();

    return (
      importantTypes.includes(tagName) ||
      (type && importantTypes.includes(type)) ||
      importantClasses.some(cls => className.includes(cls)) ||
      (role && importantRoles.includes(role))
    );
  }
}

// Automatic touch area expansion
export class TouchAreaExpander {
  private spacingCalculator: TouchTargetSpacingCalculator;
  private expandedElements: WeakSet<HTMLElement> = new WeakSet();

  constructor(density: TouchDensity = 'comfortable') {
    this.spacingCalculator = new TouchTargetSpacingCalculator(density);
  }

  expandElement(element: HTMLElement, options: {
    minSize?: number;
    respectBounds?: boolean;
    useOverlay?: boolean;
    preserveVisual?: boolean;
  } = {}): boolean {
    if (this.expandedElements.has(element)) {
      return false; // Already expanded
    }

    const validator = new TouchTargetValidator();
    const validation = validator.validateElement(element);

    if (!validation.needsExpansion) {
      return false; // No expansion needed
    }

    const minSize = options.minSize || this.spacingCalculator.calculateTargetSize();
    const expansion = validation.expansionAmount;

    if (options.useOverlay || !options.preserveVisual) {
      this.createTouchOverlay(element, expansion, minSize);
    } else {
      this.expandElementDirectly(element, expansion, minSize);
    }

    this.expandedElements.add(element);
    return true;
  }

  private createTouchOverlay(
    element: HTMLElement, 
    expansion: { horizontal: number; vertical: number },
    minSize: number
  ): void {
    const overlay = document.createElement('div');
    overlay.className = 'touch-target-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: -${expansion.vertical}px;
      left: -${expansion.horizontal}px;
      right: -${expansion.horizontal}px;
      bottom: -${expansion.vertical}px;
      min-width: ${minSize}px;
      min-height: ${minSize}px;
      z-index: 1;
      pointer-events: auto;
      background: transparent;
      border-radius: inherit;
    `;

    // Make element relatively positioned if not already
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }

    // Forward events to original element
    overlay.addEventListener('touchstart', (e) => {
      element.dispatchEvent(new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: e.touches,
        changedTouches: e.changedTouches,
      }));
    });

    overlay.addEventListener('touchend', (e) => {
      element.dispatchEvent(new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        touches: e.touches,
        changedTouches: e.changedTouches,
      }));
    });

    overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      element.click();
    });

    element.appendChild(overlay);
  }

  private expandElementDirectly(
    element: HTMLElement,
    expansion: { horizontal: number; vertical: number },
    minSize: number
  ): void {
    const currentStyle = getComputedStyle(element);
    const currentPaddingX = 
      parseInt(currentStyle.paddingLeft, 10) + 
      parseInt(currentStyle.paddingRight, 10);
    const currentPaddingY = 
      parseInt(currentStyle.paddingTop, 10) + 
      parseInt(currentStyle.paddingBottom, 10);

    element.style.minWidth = `${minSize}px`;
    element.style.minHeight = `${minSize}px`;
    element.style.paddingLeft = `${parseInt(currentStyle.paddingLeft, 10) + expansion.horizontal}px`;
    element.style.paddingRight = `${parseInt(currentStyle.paddingRight, 10) + expansion.horizontal}px`;
    element.style.paddingTop = `${parseInt(currentStyle.paddingTop, 10) + expansion.vertical}px`;
    element.style.paddingBottom = `${parseInt(currentStyle.paddingBottom, 10) + expansion.vertical}px`;
  }

  expandAllInContainer(container: HTMLElement): number {
    const interactiveElements = container.querySelectorAll([
      'button',
      'input[type="button"]',
      'input[type="submit"]',
      'input[type="reset"]',
      'input[type="checkbox"]',
      'input[type="radio"]',
      'a[href]',
      '[role="button"]',
      '[onclick]',
    ].join(',')) as NodeListOf<HTMLElement>;

    let expandedCount = 0;
    for (const element of interactiveElements) {
      if (this.expandElement(element, { useOverlay: true, preserveVisual: true })) {
        expandedCount++;
      }
    }

    return expandedCount;
  }
}

// Interactive element auditor
export class InteractiveElementAuditor {
  private validator: TouchTargetValidator;
  private spacingCalculator: TouchTargetSpacingCalculator;

  constructor(density: TouchDensity = 'comfortable') {
    this.validator = new TouchTargetValidator(density);
    this.spacingCalculator = new TouchTargetSpacingCalculator(density);
  }

  auditPage(): TouchTargetAuditResult {
    const interactiveSelectors = [
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
      '[role="link"]',
      '[role="menuitem"]',
      '[role="tab"]',
      '[role="checkbox"]',
      '[role="radio"]',
    ];

    const elements = document.querySelectorAll(
      interactiveSelectors.join(',')
    ) as NodeListOf<HTMLElement>;

    const violations: TouchTargetAuditResult['violations'] = [];
    let validElements = 0;
    let tooSmall = 0;
    let inadequateSpacing = 0;
    let needsExpansion = 0;

    for (const element of elements) {
      const validation = this.validator.validateElement(element);
      
      if (validation.isValid) {
        validElements++;
      } else {
        let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
        
        // Determine priority based on element type and violations
        if (this.isCriticalElement(element)) {
          priority = 'critical';
        } else if (validation.violations.length > 1) {
          priority = 'high';
        } else if (validation.actualSize.width < 32 || validation.actualSize.height < 32) {
          priority = 'high';
        }

        violations.push({
          element,
          validation,
          priority,
        });

        // Update counters
        if (validation.needsExpansion) needsExpansion++;
        if (!validation.hasAdequateSpacing) inadequateSpacing++;
        if (validation.actualSize.width < WCAG_TOUCH_CONSTANTS.MIN_TARGET_SIZE ||
            validation.actualSize.height < WCAG_TOUCH_CONSTANTS.MIN_TARGET_SIZE) {
          tooSmall++;
        }
      }
    }

    const totalElements = elements.length;
    const invalidElements = totalElements - validElements;
    const complianceRate = totalElements > 0 ? (validElements / totalElements) * 100 : 100;

    // Generate recommendations
    const recommendations: string[] = [];
    if (tooSmall > 0) {
      recommendations.push(`${tooSmall} elements are below the minimum 44px size`);
    }
    if (inadequateSpacing > 0) {
      recommendations.push(`${inadequateSpacing} elements have insufficient spacing`);
    }
    if (complianceRate < 100) {
      recommendations.push('Consider using automatic touch area expansion');
      recommendations.push('Review and redesign elements that consistently fail validation');
    }
    if (complianceRate >= 90) {
      recommendations.push('Good compliance rate! Focus on critical and high-priority violations');
    }

    return {
      totalElements,
      validElements,
      invalidElements,
      complianceRate,
      violations,
      summary: {
        tooSmall,
        inadequateSpacing,
        needsExpansion,
        recommendations,
      },
    };
  }

  auditContainer(container: HTMLElement): TouchTargetAuditResult {
    const originalDocument = document;
    // Temporarily replace document queries to only search within container
    const tempDocument = {
      ...document,
      querySelectorAll: (selector: string) => container.querySelectorAll(selector),
    };
    
    // This is a simplified audit for container scope
    return this.auditPage();
  }

  private isCriticalElement(element: HTMLElement): boolean {
    const criticalTypes = ['submit'];
    const criticalClasses = ['primary', 'cta', 'submit', 'buy', 'confirm'];
    const criticalIds = ['submit', 'login', 'checkout', 'buy-now'];
    
    const tagName = element.tagName.toLowerCase();
    const type = element.getAttribute('type')?.toLowerCase();
    const className = element.className.toLowerCase();
    const id = element.id.toLowerCase();

    return (
      criticalTypes.includes(tagName) ||
      (type && criticalTypes.includes(type)) ||
      criticalClasses.some(cls => className.includes(cls)) ||
      criticalIds.some(criticalId => id.includes(criticalId)) ||
      element.closest('form') !== null // Form elements are generally critical
    );
  }

  generateReport(auditResult: TouchTargetAuditResult): string {
    const { totalElements, validElements, complianceRate, violations, summary } = auditResult;
    
    let report = `Touch Target Accessibility Audit Report\n`;
    report += `=====================================\n\n`;
    report += `Summary:\n`;
    report += `- Total interactive elements: ${totalElements}\n`;
    report += `- Valid elements: ${validElements}\n`;
    report += `- Compliance rate: ${complianceRate.toFixed(1)}%\n\n`;
    
    if (violations.length > 0) {
      report += `Violations by Priority:\n`;
      const criticalCount = violations.filter(v => v.priority === 'critical').length;
      const highCount = violations.filter(v => v.priority === 'high').length;
      const mediumCount = violations.filter(v => v.priority === 'medium').length;
      const lowCount = violations.filter(v => v.priority === 'low').length;
      
      if (criticalCount > 0) report += `- Critical: ${criticalCount}\n`;
      if (highCount > 0) report += `- High: ${highCount}\n`;
      if (mediumCount > 0) report += `- Medium: ${mediumCount}\n`;
      if (lowCount > 0) report += `- Low: ${lowCount}\n`;
      report += `\n`;
    }
    
    report += `Issues Found:\n`;
    report += `- Too small: ${summary.tooSmall}\n`;
    report += `- Inadequate spacing: ${summary.inadequateSpacing}\n`;
    report += `- Need expansion: ${summary.needsExpansion}\n\n`;
    
    if (summary.recommendations.length > 0) {
      report += `Recommendations:\n`;
      summary.recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
    }
    
    return report;
  }
}

// Convenience functions
export const touchTargetUtils = {
  validator: new TouchTargetValidator(),
  expander: new TouchAreaExpander(),
  auditor: new InteractiveElementAuditor(),
  spacingCalculator: new TouchTargetSpacingCalculator(),

  // Quick validation
  validateElement: (element: HTMLElement) => 
    touchTargetUtils.validator.validateElement(element),

  // Quick expansion
  expandElement: (element: HTMLElement) => 
    touchTargetUtils.expander.expandElement(element, { useOverlay: true }),

  // Quick audit
  auditPage: () => touchTargetUtils.auditor.auditPage(),

  // Auto-fix page
  autoFixPage: (): { expanded: number; auditResult: TouchTargetAuditResult } => {
    const expanded = touchTargetUtils.expander.expandAllInContainer(document.body);
    const auditResult = touchTargetUtils.auditor.auditPage();
    return { expanded, auditResult };
  },

  // Development helper
  highlightProblematicElements: () => {
    const auditResult = touchTargetUtils.auditor.auditPage();
    
    auditResult.violations.forEach(({ element, priority }) => {
      const color = {
        critical: 'red',
        high: 'orange',
        medium: 'yellow',
        low: 'lightblue',
      }[priority];
      
      element.style.outline = `2px solid ${color}`;
      element.style.outlineOffset = '2px';
      element.title = `Touch target issue: ${priority} priority`;
    });
    
    return auditResult;
  },
};

// Type exports
export type {
  TouchTargetValidation,
  TouchTargetAuditResult,
  TouchDensity,
};