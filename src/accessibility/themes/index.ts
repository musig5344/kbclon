/**
 * High Contrast Mode System for KB StarBanking
 *
 * Provides comprehensive high contrast theme support with WCAG AAA compliance,
 * system integration, and user customization options.
 *
 * @example
 * ```tsx
 * import { useHighContrast, HighContrastToggle } from '../themes';
 *
 * function App() {
 *   const { isActive, setMode } = useHighContrast();
 *
 *   return (
 *     <div>
 *       <HighContrastToggle />
 *       {isActive && <div>고대비 모드가 활성화되었습니다</div>}
 *     </div>
 *   );
 * }
 * ```
 */

// Core Manager and Types
export { HighContrastManager } from './HighContrastManager';
export type { HighContrastMode, HighContrastPreferences } from './HighContrastManager';

// Theme Definitions
export {
  highContrastLightTheme,
  highContrastDarkTheme,
  windowsHighContrastTheme,
  highContrastThemes,
  calculateContrastRatio,
  validateWCAGCompliance,
  generateHighContrastCSS,
} from './HighContrastTheme';

export type { HighContrastColors, ContrastLevel } from './HighContrastTheme';

// React Hooks
export {
  useHighContrast,
  useSystemHighContrast,
  useHighContrastColors,
  useResponsiveHighContrast,
  useHighContrastForm,
} from './useHighContrast';

export type { UseHighContrastReturn } from './useHighContrast';

// React Components
export {
  HighContrastToggle,
  HighContrastSelector,
  HighContrastSettings,
  HighContrastButton,
  HighContrastAlert,
} from './HighContrastComponents';

// Utility Functions
export const initializeHighContrast = () => {
  const { HighContrastManager } = require('./HighContrastManager');
  return HighContrastManager.getInstance();
};

export const setupHighContrastForBanking = (autoDetect: boolean = true) => {
  const { HighContrastManager } = require('./HighContrastManager');
  const manager = HighContrastManager.getInstance();
  manager.updatePreferences({
    autoDetect,
    announceChanges: true,
    enhancedFocus: true,
  });
  return manager;
};

// Constants
export const HIGH_CONTRAST_VERSION = '1.0.0';
export const WCAG_COMPLIANCE_LEVELS = ['AA', 'AAA'] as const;
export const SUPPORTED_MODES = ['off', 'light', 'dark', 'system'] as const;

// Default preferences for banking applications
export const DEFAULT_BANKING_PREFERENCES = {
  mode: 'off' as const,
  autoDetect: true,
  announceChanges: true,
  enhancedFocus: true,
  boldText: false,
  largerText: false,
};

/**
 * CSS-in-JS styled-components theme provider integration
 */
export const createHighContrastStyledTheme = (baseTheme: any) => {
  const { HighContrastManager } = require('./HighContrastManager');
  const manager = HighContrastManager.getInstance();
  const isActive = manager.isActive();

  if (!isActive) return baseTheme;

  const mode = manager.getCurrentMode();
  const { highContrastDarkTheme, windowsHighContrastTheme, highContrastLightTheme } = require('./HighContrastTheme');
  const hcTheme =
    mode === 'dark'
      ? highContrastDarkTheme
      : mode === 'system'
        ? windowsHighContrastTheme
        : highContrastLightTheme;

  return {
    ...baseTheme,
    highContrast: {
      isActive: true,
      mode,
      colors: hcTheme,
    },
  };
};

/**
 * Global CSS injection for high contrast mode
 */
export const injectHighContrastGlobalStyles = () => {
  const { HighContrastManager } = require('./HighContrastManager');
  const manager = HighContrastManager.getInstance();

  if (!manager.isActive()) return;

  const globalStyles = `
    /* High contrast global overrides */
    * {
      /* Remove all transitions and animations for clarity */
      transition: none !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
    
    /* Ensure all interactive elements have visible borders */
    button, 
    input, 
    select, 
    textarea, 
    [role="button"], 
    [role="tab"], 
    [role="menuitem"] {
      border: 2px solid var(--hc-border, currentColor) !important;
      background-color: var(--hc-bg-primary, white) !important;
      color: var(--hc-text-primary, black) !important;
    }
    
    /* Enhanced focus indicators */
    :focus {
      outline: 3px solid var(--hc-focus, #0066cc) !important;
      outline-offset: 2px !important;
      box-shadow: 0 0 0 1px var(--hc-bg-primary, white), 
                  0 0 0 4px var(--hc-focus, #0066cc) !important;
    }
    
    /* Selection styles */
    ::selection {
      background-color: var(--hc-selection, #316ac5) !important;
      color: var(--hc-text-inverse, white) !important;
    }
    
    /* Remove background images and gradients */
    * {
      background-image: none !important;
    }
    
    /* Ensure sufficient spacing */
    button, 
    [role="button"] {
      min-height: 44px !important;
      min-width: 44px !important;
    }
  `;

  const styleId = 'kb-high-contrast-global';
  let existingStyle = document.getElementById(styleId) as HTMLStyleElement;

  if (!existingStyle) {
    existingStyle = document.createElement('style');
    existingStyle.id = styleId;
    document.head.appendChild(existingStyle);
  }

  existingStyle.textContent = globalStyles;
};

// Re-export all types for convenience
export type { HighContrastColors as ThemeColors } from './HighContrastTheme';

export type { HighContrastMode as ThemeMode } from './HighContrastManager';

// Export HighContrastPreferences from the manager
export type { HighContrastPreferences as UserPreferences } from './HighContrastManager';
