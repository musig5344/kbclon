// Legacy colors compatibility layer
// This file provides backward compatibility for components using old color syntax
import { colors as tokenColors } from '.';
// Create a flat color object for backward compatibility
export const colors = {
  // Basic colors
  white: tokenColors.white,
  black: tokenColors.black,
  background: tokenColors.background.primary,
  backgroundGray1: tokenColors.backgroundGray1,
  backgroundGray2: tokenColors.backgroundGray2,
  // Text colors
  textPrimary: tokenColors.text.primary,
  textSecondary: tokenColors.text.secondary,
  textTertiary: tokenColors.text.tertiary,
  textHint: tokenColors.text.quaternary,
  // Border colors
  border: tokenColors.border.primary,
  // Brand colors
  kbYellow: tokenColors.brand.primary,
  // Additional colors used in components
  lightGray: tokenColors.lightGray,
  success: tokenColors.functional.success,
  error: tokenColors.functional.error,
  warning: tokenColors.functional.warning,
  accentBlue: tokenColors.accentBlue,
  errorRed: tokenColors.errorRed,
  // Button colors
  buttonGrayNormal: tokenColors.buttonGrayNormal,
  buttonGrayPressed: tokenColors.buttonGrayPressed,
  buttonYellowNormal: tokenColors.buttonYellowNormal,
  buttonYellowPressed: tokenColors.buttonYellowPressed,
};
export default colors;