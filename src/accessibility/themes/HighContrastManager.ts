/**
 * High Contrast Mode Manager for KB StarBanking
 * Manages high contrast theme application and user preferences
 */

import { 
  HighContrastColors, 
  highContrastThemes, 
  generateHighContrastCSS,
  validateWCAGCompliance 
} from './HighContrastTheme';

export type HighContrastMode = 'off' | 'light' | 'dark' | 'system';

export interface HighContrastPreferences {
  mode: HighContrastMode;
  autoDetect: boolean;
  customColors?: Partial<HighContrastColors>;
  announceChanges: boolean;
  enhancedFocus: boolean;
  boldText: boolean;
  largerText: boolean;
}

export class HighContrastManager {
  private static instance: HighContrastManager;
  private currentMode: HighContrastMode = 'off';
  private preferences: HighContrastPreferences;
  private styleElement: HTMLStyleElement | null = null;
  private observers: Array<(mode: HighContrastMode) => void> = [];
  private systemPreferenceQuery: MediaQueryList | null = null;

  private constructor() {
    this.preferences = {
      mode: 'off',
      autoDetect: true,
      announceChanges: true,
      enhancedFocus: true,
      boldText: false,
      largerText: false,
    };

    this.initialize();
  }

  public static getInstance(): HighContrastManager {
    if (!HighContrastManager.instance) {
      HighContrastManager.instance = new HighContrastManager();
    }
    return HighContrastManager.instance;
  }

  private initialize(): void {
    this.loadPreferences();
    this.detectSystemPreferences();
    this.setupMediaQueryListeners();
    this.applyInitialMode();
  }

  private loadPreferences(): void {
    try {
      const saved = localStorage.getItem('kb-high-contrast-preferences');
      if (saved) {
        this.preferences = { ...this.preferences, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load high contrast preferences:', error);
    }
  }

  private savePreferences(): void {
    try {
      localStorage.setItem('kb-high-contrast-preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.warn('Failed to save high contrast preferences:', error);
    }
  }

  private detectSystemPreferences(): void {
    // Check for Windows High Contrast mode
    if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
      if (this.preferences.autoDetect) {
        this.currentMode = 'system';
      }
    }

    // Check for forced-colors (Windows High Contrast)
    if (window.matchMedia && window.matchMedia('(forced-colors: active)').matches) {
      if (this.preferences.autoDetect) {
        this.currentMode = 'system';
      }
    }

    // Check for dark mode preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      if (this.preferences.autoDetect && this.currentMode === 'off') {
        this.currentMode = 'dark';
      }
    }
  }

  private setupMediaQueryListeners(): void {
    // Listen for high contrast changes
    if (window.matchMedia) {
      this.systemPreferenceQuery = window.matchMedia('(prefers-contrast: high)');
      this.systemPreferenceQuery.addEventListener('change', this.handleSystemPreferenceChange.bind(this));

      // Listen for forced colors (Windows High Contrast)
      const forcedColorsQuery = window.matchMedia('(forced-colors: active)');
      forcedColorsQuery.addEventListener('change', this.handleSystemPreferenceChange.bind(this));

      // Listen for color scheme changes
      const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      colorSchemeQuery.addEventListener('change', this.handleColorSchemeChange.bind(this));
    }
  }

  private handleSystemPreferenceChange(event: MediaQueryListEvent): void {
    if (!this.preferences.autoDetect) return;

    if (event.matches) {
      this.setMode('system');
    } else {
      this.setMode('off');
    }
  }

  private handleColorSchemeChange(event: MediaQueryListEvent): void {
    if (!this.preferences.autoDetect || this.currentMode !== 'off') return;

    if (event.matches) {
      this.setMode('dark');
    } else {
      this.setMode('light');
    }
  }

  private applyInitialMode(): void {
    if (this.preferences.mode !== 'off') {
      this.setMode(this.preferences.mode);
    }
  }

  public setMode(mode: HighContrastMode): void {
    const previousMode = this.currentMode;
    this.currentMode = mode;
    this.preferences.mode = mode;

    this.applyTheme();
    this.savePreferences();
    this.notifyObservers();

    if (this.preferences.announceChanges && previousMode !== mode) {
      this.announceChange(mode);
    }

    // Update document attribute for CSS targeting
    document.documentElement.setAttribute('data-high-contrast', mode);
    
    // Add class for additional styling
    document.body.classList.toggle('high-contrast', mode !== 'off');
    document.body.classList.toggle('high-contrast-light', mode === 'light');
    document.body.classList.toggle('high-contrast-dark', mode === 'dark');
    document.body.classList.toggle('high-contrast-system', mode === 'system');
  }

  private applyTheme(): void {
    if (this.currentMode === 'off') {
      this.removeThemeStyles();
      return;
    }

    const theme = this.getThemeForMode(this.currentMode);
    const customTheme = this.applyCustomizations(theme);
    const css = this.generateThemeCSS(customTheme);

    this.injectThemeStyles(css);
  }

  private getThemeForMode(mode: HighContrastMode): HighContrastColors {
    switch (mode) {
      case 'light':
        return highContrastThemes.light;
      case 'dark':
        return highContrastThemes.dark;
      case 'system':
        return highContrastThemes.system;
      default:
        return highContrastThemes.light;
    }
  }

  private applyCustomizations(theme: HighContrastColors): HighContrastColors {
    if (!this.preferences.customColors) {
      return theme;
    }

    // Deep merge custom colors
    return this.deepMerge(theme, this.preferences.customColors);
  }

  private deepMerge(target: any, source: any): any {
    const output = { ...target };
    
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = this.deepMerge(output[key] || {}, source[key]);
      } else {
        output[key] = source[key];
      }
    });
    
    return output;
  }

  private generateThemeCSS(theme: HighContrastColors): string {
    let css = generateHighContrastCSS(theme);

    // Add enhanced focus styles
    if (this.preferences.enhancedFocus) {
      css += `
        :focus {
          outline: 3px solid var(--hc-focus) !important;
          outline-offset: 2px !important;
          box-shadow: 0 0 0 1px var(--hc-bg-primary), 0 0 0 4px var(--hc-focus) !important;
        }
        
        :focus:not(:focus-visible) {
          outline: none !important;
          box-shadow: none !important;
        }
      `;
    }

    // Add bold text styles
    if (this.preferences.boldText) {
      css += `
        body, input, button, select, textarea {
          font-weight: bold !important;
        }
      `;
    }

    // Add larger text styles
    if (this.preferences.largerText) {
      css += `
        body {
          font-size: 1.2em !important;
          line-height: 1.6 !important;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-size: calc(var(--original-font-size, 1em) * 1.2) !important;
        }
      `;
    }

    // High contrast specific overrides
    css += `
      /* Remove transitions in high contrast mode for clarity */
      *, *::before, *::after {
        transition: none !important;
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
      }
      
      /* Ensure all borders are visible */
      button, input, select, textarea {
        border: 2px solid var(--hc-border) !important;
      }
      
      /* High contrast shadows */
      .shadow, .elevation {
        box-shadow: 2px 2px 4px var(--hc-shadow) !important;
      }
      
      /* Force background colors */
      .bg-transparent {
        background-color: var(--hc-bg-primary) !important;
      }
      
      /* Selection styles */
      ::selection {
        background-color: var(--hc-selection) !important;
        color: var(--hc-text-inverse) !important;
      }
    `;

    return css;
  }

  private injectThemeStyles(css: string): void {
    this.removeThemeStyles();

    this.styleElement = document.createElement('style');
    this.styleElement.id = 'kb-high-contrast-theme';
    this.styleElement.textContent = css;
    document.head.appendChild(this.styleElement);
  }

  private removeThemeStyles(): void {
    if (this.styleElement) {
      document.head.removeChild(this.styleElement);
      this.styleElement = null;
    }
  }

  private announceChange(mode: HighContrastMode): void {
    const messages: Record<HighContrastMode, string> = {
      off: '일반 화면 모드로 변경되었습니다',
      light: '고대비 밝은 모드로 변경되었습니다',
      dark: '고대비 어두운 모드로 변경되었습니다',
      system: '시스템 고대비 모드로 변경되었습니다',
    };

    // Create announcement element
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = messages[mode];
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  public getCurrentMode(): HighContrastMode {
    return this.currentMode;
  }

  public isActive(): boolean {
    return this.currentMode !== 'off';
  }

  public updatePreferences(preferences: Partial<HighContrastPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    this.savePreferences();
    
    // Reapply theme if active
    if (this.isActive()) {
      this.applyTheme();
    }
  }

  public getPreferences(): HighContrastPreferences {
    return { ...this.preferences };
  }

  public subscribe(observer: (mode: HighContrastMode) => void): () => void {
    this.observers.push(observer);
    
    // Return unsubscribe function
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer(this.currentMode));
  }

  public toggle(): void {
    const modes: HighContrastMode[] = ['off', 'light', 'dark', 'system'];
    const currentIndex = modes.indexOf(this.currentMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.setMode(modes[nextIndex]);
  }

  public validateCurrentTheme(): boolean {
    if (!this.isActive()) return true;

    const theme = this.getThemeForMode(this.currentMode);
    
    // Validate key color combinations
    const validations = [
      validateWCAGCompliance(theme.text.primary.normal, theme.background.primary),
      validateWCAGCompliance(theme.interactive.primary.text, theme.interactive.primary.background),
      validateWCAGCompliance(theme.text.error.normal, theme.background.primary),
      validateWCAGCompliance(theme.text.success.normal, theme.background.primary),
    ];

    return validations.every(Boolean);
  }

  public cleanup(): void {
    this.removeThemeStyles();
    
    if (this.systemPreferenceQuery) {
      this.systemPreferenceQuery.removeEventListener('change', this.handleSystemPreferenceChange);
    }
    
    this.observers = [];
    
    // Remove document attributes and classes
    document.documentElement.removeAttribute('data-high-contrast');
    document.body.classList.remove('high-contrast', 'high-contrast-light', 'high-contrast-dark', 'high-contrast-system');
  }
}