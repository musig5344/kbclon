import 'styled-components';
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      // Primary KB Colors (원본 앱에서 추출)
      kbYellow: string;
      kbYellowPressed: string;
      kbBlack: string;
      // Background Colors
      background: string;
      lightGray: string;
      guideBox: string;
      // Text Colors
      textPrimary: string;
      textSecondary: string;
      textTertiary: string;
      textHint: string;
      textClickable: string;
      textBlue: string;
      // System Colors
      error: string;
      success: string;
      // Border & Divider Colors
      border: string;
      borderDark: string;
      divider: string;
      // Button Colors
      buttonGray: string;
      buttonGrayPressed: string;
      buttonYellow: string;
      buttonYellowPressed: string;
      // Background States
      backgroundPressed: string;
      backgroundClickable: string;
      // Header & Navigation
      headerBackground: string;
      tabBackground: string;
      tabBackgroundPressed: string;
      // Dialog & Modal
      dialogBackground: string;
      toastBackground: string;
      toastText: string;
      // Common Colors
      white: string;
      transparent: string;
    };
    typography: {
      fontFamily: string;
      fontSize: {
        // Material Design 텍스트 사이즈 (원본 XML 기준)
        caption: string;        // 12.0sp
        body1: string;          // 14.0sp
        body2: string;          // 14.0sp
        button: string;         // 14.0sp
        subhead: string;        // 16.0sp
        medium: string;         // 18.0sp
        title: string;          // 20.0sp
        large: string;          // 22.0sp
        headline: string;       // 24.0sp
        // 추가 앱별 사이즈
        tabText: string;        // 14.0sp
        guideText: string;      // 17.0sp
        bottomNavText: string;  // 15.0sp
      };
      fontWeight: {
        light: number;
        regular: number;
        medium: number;
        bold: number;
      };
    };
    spacing: {
      // Material Design 표준 스페이싱 (원본 XML 기준)
      xs: string;      // 4.0dip
      sm: string;      // 8.0dip
      md: string;      // 12.0dip
      lg: string;      // 16.0dip
      xl: string;      // 20.0dip
      xxl: string;     // 24.0dip
    };
    dimensions: {
      // 원본 XML에서 추출한 정확한 크기
      headerHeight: string;           // common_header_height
      headerPadding: string;          // common_header_padding
      tabLayoutHeight: string;        // tab_layout_height
      actionButtonHeight: string;     // action_button_min_height
      actionButtonWidth: string;      // action_button_min_width
      alertDialogButtonHeight: string; // alert_dialog_button_height
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    elevation: {
      // Material Design elevation 값
      low: string;     // 2dp
      medium: string;  // 4dp
      high: string;    // 8dp
      bottomSheet: string; // 10.0dip
    };
  }
} 