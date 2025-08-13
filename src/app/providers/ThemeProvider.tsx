import React, { createContext, useContext, useState, useEffect } from 'react';

import { ThemeProvider as StyledThemeProvider } from 'styled-components';

import { theme as baseTheme } from '../../design-system/theme';
import { colors, tokens } from '../../design-system/tokens';
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
// KB스타뱅킹 테마 정의 (실제 앱 분석 기반)
const lightTheme = {
  ...baseTheme,
  colors: {
    // baseTheme.colors의 모든 속성을 먼저 포함
    ...baseTheme.colors,
    // 라이트 모드 특화 색상 오버라이드
    background: colors.background.primary,
    surface: colors.backgroundGray1,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    border: colors.border.primary,
  },
  tokens,
  mode: 'light',
};
const darkTheme = {
  ...baseTheme,
  colors: {
    // baseTheme.colors의 모든 속성을 먼저 포함
    ...baseTheme.colors,
    // 다크 모드 오버라이드
    background: colors.dark.bottomSheetBackground, // #FF26282C
    backgroundGray1: '#FF1C1E22', // 더 어두운 배경
    backgroundGray2: '#FF2A2D33', // 중간 배경
    surface: '#FF1C1E22',
    // 텍스트 색상
    text: colors.dark.text, // #FFEBEEF0
    textPrimary: colors.dark.text,
    textSecondary: '#FFAEB3BA', // 보조 텍스트
    textTertiary: colors.dark.inputFieldHint, // #FF6E747A
    textHint: colors.dark.inputFieldHint,
    // 구분선
    border: '#FF575B61', // picker_divider
    borderLight: '#FF454850', // 연한 구분선
    // 입력 필드
    inputBackground: '#FF1C1E22',
    inputHangulText: colors.dark.text, // #FFEBEEF0
    // 토스트
    toastBackground: colors.dark.toastBackground, // #E6696E76
    toastText: colors.toastTextDark, // #FFFFFFFF
    // 알림
    notificationStepLabel: '#FFDDE1E4', // notification_step_label
    notificationStepText: colors.dark.text, // notification_step_text
    // 기타 색상들은 라이트 모드와 동일하게 유지
    kbYellow: tokens.colors.brand.primary,
    kbYellowLight: tokens.colors.brand.primaryLight,
    kbYellowDark: tokens.colors.brand.primaryDark,
    accentBlue: colors.accentBlue,
    errorRed: colors.errorRed,
    // Dim 배경
    dimmedBackground: colors.dark.dimBackground, // #BF000000
  },
  tokens,
  mode: 'dark',
};
export type Theme = typeof lightTheme;
interface KBThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: 'light' | 'dark' | 'system';
}
export const KBThemeProvider: React.FC<KBThemeProviderProps> = ({
  children,
  initialTheme = 'system',
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  // 시스템 테마 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (initialTheme === 'system') {
        setIsDarkMode(e.matches);
      }
    };
    // 초기 테마 설정
    if (initialTheme === 'system') {
      setIsDarkMode(mediaQuery.matches);
    } else if (initialTheme === 'dark') {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
    // 시스템 테마 변경 감지
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [initialTheme]);
  // 로컬 스토리지에 테마 설정 저장
  useEffect(() => {
    localStorage.setItem('kb-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  // 페이지 로드 시 저장된 테마 복원
  useEffect(() => {
    const savedTheme = localStorage.getItem('kb-theme');
    if (savedTheme && initialTheme !== 'system') {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, [initialTheme]);
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };
  const setTheme = (isDark: boolean) => {
    setIsDarkMode(isDark);
  };
  const theme = isDarkMode ? darkTheme : lightTheme;
  // Body 클래스 설정 (CSS 변수와 연동)
  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
    // CSS 커스텀 속성 설정
    const root = document.documentElement;
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--color-kb-yellow', theme.tokens.colors.brand.primary);
  }, [isDarkMode, theme]);
  const contextValue: ThemeContextType = {
    isDarkMode,
    toggleTheme,
    setTheme,
  };
  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
// 테마 기반 스타일 헬퍼
export const themed =
  (lightValue: string, darkValue: string) =>
  ({ theme }: { theme: Theme }) =>
    theme.mode === 'dark' ? darkValue : lightValue;
// 미디어 쿼리 헬퍼
export const prefersDarkMode = '@media (prefers-color-scheme: dark)';
export const prefersLightMode = '@media (prefers-color-scheme: light)';
// 테마 전환 애니메이션을 위한 CSS
export const createGlobalThemeStyles = () => `
  * {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }
  .light-theme {
    color-scheme: light;
  }
  .dark-theme {
    color-scheme: dark;
  }
  /* 시스템 테마에 따른 자동 스타일링 */
  ${prefersDarkMode} {
    .theme-auto {
      color-scheme: dark;
    }
  }
  ${prefersLightMode} {
    .theme-auto {
      color-scheme: light;  
    }
  }
`;
