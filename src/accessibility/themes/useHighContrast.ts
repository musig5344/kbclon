import { useState, useEffect, useCallback, useMemo } from 'react';

import { HighContrastManager, HighContrastMode, HighContrastPreferences } from './HighContrastManager';
import { HighContrastColors, highContrastThemes } from './HighContrastTheme';

export interface UseHighContrastReturn {
  mode: HighContrastMode;
  isActive: boolean;
  setMode: (mode: HighContrastMode) => void;
  toggle: () => void;
  preferences: HighContrastPreferences;
  updatePreferences: (preferences: Partial<HighContrastPreferences>) => void;
  currentTheme: HighContrastColors | null;
  isSystemSupported: boolean;
  isValidTheme: boolean;
}

export const useHighContrast = (): UseHighContrastReturn => {
  const manager = useMemo(() => HighContrastManager.getInstance(), []);
  
  const [mode, setModeState] = useState<HighContrastMode>(manager.getCurrentMode());
  const [preferences, setPreferencesState] = useState<HighContrastPreferences>(manager.getPreferences());

  useEffect(() => {
    const unsubscribe = manager.subscribe((newMode) => {
      setModeState(newMode);
      setPreferencesState(manager.getPreferences());
    });

    return unsubscribe;
  }, [manager]);

  const setMode = useCallback((newMode: HighContrastMode) => {
    manager.setMode(newMode);
  }, [manager]);

  const toggle = useCallback(() => {
    manager.toggle();
  }, [manager]);

  const updatePreferences = useCallback((newPreferences: Partial<HighContrastPreferences>) => {
    manager.updatePreferences(newPreferences);
    setPreferencesState(manager.getPreferences());
  }, [manager]);

  const isActive = mode !== 'off';

  const currentTheme = useMemo(() => {
    if (!isActive) return null;
    
    switch (mode) {
      case 'light':
        return highContrastThemes.light;
      case 'dark':
        return highContrastThemes.dark;
      case 'system':
        return highContrastThemes.system;
      default:
        return null;
    }
  }, [mode, isActive]);

  const isSystemSupported = useMemo(() => {
    return window.matchMedia && (
      window.matchMedia('(prefers-contrast: high)').matches ||
      window.matchMedia('(forced-colors: active)').matches
    );
  }, []);

  const isValidTheme = useMemo(() => {
    return manager.validateCurrentTheme();
  }, [manager, mode]);

  return {
    mode,
    isActive,
    setMode,
    toggle,
    preferences,
    updatePreferences,
    currentTheme,
    isSystemSupported,
    isValidTheme,
  };
};

// Hook for system preference detection
export const useSystemHighContrast = () => {
  const [isSystemHighContrast, setIsSystemHighContrast] = useState(false);
  const [isForcedColors, setIsForcedColors] = useState(false);

  useEffect(() => {
    if (window.matchMedia) {
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
      const forcedColorsQuery = window.matchMedia('(forced-colors: active)');
      
      setIsSystemHighContrast(highContrastQuery.matches);
      setIsForcedColors(forcedColorsQuery.matches);

      const handleHighContrastChange = (e: MediaQueryListEvent) => {
        setIsSystemHighContrast(e.matches);
      };

      const handleForcedColorsChange = (e: MediaQueryListEvent) => {
        setIsForcedColors(e.matches);
      };

      highContrastQuery.addEventListener('change', handleHighContrastChange);
      forcedColorsQuery.addEventListener('change', handleForcedColorsChange);

      return () => {
        highContrastQuery.removeEventListener('change', handleHighContrastChange);
        forcedColorsQuery.removeEventListener('change', handleForcedColorsChange);
      };
    }
  }, []);

  return {
    isSystemHighContrast,
    isForcedColors,
    isSystemSupported: window.matchMedia !== undefined,
  };
};

// Hook for high contrast color utilities
export const useHighContrastColors = () => {
  const { currentTheme, isActive } = useHighContrast();

  const getColor = useCallback((path: string): string => {
    if (!isActive || !currentTheme) return '';

    const pathParts = path.split('.');
    let current: any = currentTheme;

    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return '';
      }
    }

    return typeof current === 'string' ? current : '';
  }, [currentTheme, isActive]);

  const textColor = useCallback((level: 'primary' | 'secondary' | 'tertiary' = 'primary', size: 'normal' | 'large' | 'enhanced' = 'normal') => {
    return getColor(`text.${level}.${size}`);
  }, [getColor]);

  const backgroundColor = useCallback((level: 'primary' | 'secondary' | 'tertiary' = 'primary') => {
    return getColor(`background.${level}`);
  }, [getColor]);

  const interactiveColor = useCallback((
    type: 'primary' | 'secondary' | 'danger' = 'primary',
    property: 'background' | 'text' | 'border' | 'hover' | 'active' | 'disabled' = 'background'
  ) => {
    return getColor(`interactive.${type}.${property}`);
  }, [getColor]);

  const systemColor = useCallback((type: 'focus' | 'border' | 'divider' | 'shadow' | 'selection' | 'highlight') => {
    return getColor(`system.${type}`);
  }, [getColor]);

  const financialColor = useCallback((
    type: 'positive' | 'negative' | 'neutral' | 'balance' = 'balance',
    size: 'normal' | 'large' | 'enhanced' = 'normal'
  ) => {
    return getColor(`financial.${type}.${size}`);
  }, [getColor]);

  return {
    getColor,
    textColor,
    backgroundColor,
    interactiveColor,
    systemColor,
    financialColor,
    isActive,
    theme: currentTheme,
  };
};

// Hook for responsive high contrast behavior
export const useResponsiveHighContrast = () => {
  const { mode, setMode, isSystemSupported } = useHighContrast();
  const [preferredMode, setPreferredMode] = useState<HighContrastMode>('off');

  // Auto-adjust based on system capabilities
  useEffect(() => {
    if (isSystemSupported && mode === 'off') {
      const query = window.matchMedia('(prefers-contrast: high)');
      if (query.matches) {
        setPreferredMode('system');
      }
    }
  }, [isSystemSupported, mode]);

  const enableForLowVision = useCallback(() => {
    setMode('light');
  }, [setMode]);

  const enableForPhotosensitivity = useCallback(() => {
    setMode('dark');
  }, [setMode]);

  const enableSystemDefault = useCallback(() => {
    if (isSystemSupported) {
      setMode('system');
    } else {
      setMode('light');
    }
  }, [setMode, isSystemSupported]);

  return {
    enableForLowVision,
    enableForPhotosensitivity,
    enableSystemDefault,
    preferredMode,
    isSystemSupported,
  };
};

// Hook for high contrast form optimization
export const useHighContrastForm = () => {
  const { isActive } = useHighContrast();
  const { systemColor, interactiveColor } = useHighContrastColors();

  const getFormStyles = useCallback(() => {
    if (!isActive) return {};

    return {
      input: {
        border: `2px solid ${systemColor('border')}`,
        backgroundColor: systemColor('selection'),
        color: interactiveColor('primary', 'text'),
        padding: '12px',
      },
      inputFocus: {
        outline: `3px solid ${systemColor('focus')}`,
        outlineOffset: '2px',
        borderColor: systemColor('focus'),
      },
      inputError: {
        borderColor: systemColor('border'),
        backgroundColor: systemColor('selection'),
      },
      button: {
        backgroundColor: interactiveColor('primary', 'background'),
        color: interactiveColor('primary', 'text'),
        border: `2px solid ${interactiveColor('primary', 'border')}`,
        padding: '12px 24px',
        fontWeight: 'bold',
      },
      buttonHover: {
        backgroundColor: interactiveColor('primary', 'hover'),
      },
      buttonDisabled: {
        backgroundColor: interactiveColor('primary', 'disabled'),
        borderColor: interactiveColor('primary', 'disabled'),
      },
    };
  }, [isActive, systemColor, interactiveColor]);

  return {
    isActive,
    getFormStyles,
  };
};