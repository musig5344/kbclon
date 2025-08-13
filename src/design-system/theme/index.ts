import { colors, tokens } from '../tokens';
// Legacy color compatibility layer - complete set based on error message
const legacyColors = {
  // Basic KB colors
  kbYellow: colors.brand.primary,
  kbYellowPressed: colors.brand.dark,
  kbBlack: colors.text.black,
  background: colors.background.primary,
  lightGray: colors.background.secondary,
  guideBox: colors.background.surfaceVariant,
  // Text colors
  textPrimary: colors.text.primary,
  textSecondary: colors.text.secondary,
  textTertiary: colors.text.tertiary,
  textHint: colors.text.quaternary,
  textClickable: colors.text.link,
  textBlue: colors.text.link,
  // Borders
  border: colors.border.primary,
  borderLight: colors.border.light,
  // Status colors
  error: colors.functional.error,
  success: colors.functional.success,
  warning: colors.functional.warning,
  // Additional colors from tokens
  white: colors.background.primary,
  transparent: 'transparent',
  kbYellowLight: colors.brand.light,
  kbYellowDark: colors.brand.dark,
  backgroundGray1: colors.background.secondary,
  backgroundGray2: colors.background.tertiary,
  errorRed: colors.functional.error,
  accentBlue: colors.text.link,
  successGreen: colors.functional.success,
  warningOrange: colors.functional.warning,
  divider: colors.border.primary,
  shadow: colors.shadows.low,
  overlay: colors.background.overlay,
  scrim: colors.background.scrim,
  disabled: colors.text.disabled,
  // Additional missing properties
  surfaceVariant: colors.background.surfaceVariant,
  onSurface: colors.text.primary,
  outline: colors.border.secondary,
  // More missing properties from error
  borderDark: colors.border.tertiary,
  buttonGray: colors.background.surfaceVariant,
  buttonGrayPressed: colors.background.surfaceDark,
  buttonYellow: colors.brand.primary,
  buttonYellowPressed: colors.brand.dark,
  // Additional button states
  buttonBlue: colors.text.link,
  buttonBluePressed: colors.brand.dark,
  // Surface states
  surface: colors.background.surface,
  surfaceDark: colors.background.surfaceDark,
  // Additional text states
  textDisabled: colors.text.disabled,
  // Dark theme properties
  dark: {
    background: colors.background.widget,
    text: colors.text.white,
    border: colors.border.tertiary,
  },
};
export const theme = {
  ...tokens,
  colors: legacyColors,
};
