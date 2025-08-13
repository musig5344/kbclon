// KB스타뱅킹 정확한 폰트 시스템 (완전 분석 결과 기반)
export const typography = {
  // KB 전용 폰트 패밀리
  fontFamily: {
    kbfgTextBold: 'KBFG-Text-Bold, "Noto Sans KR", sans-serif', // kbfg_text_b.otf (fontWeight: 700)
    kbfgTextMedium: 'KBFG-Text-Medium, "Noto Sans KR", sans-serif', // kbfg_text_m.otf (fontWeight: 500)
    kbfgTextLight: 'KBFG-Text-Light, "Noto Sans KR", sans-serif', // kbfg_text_l.otf (fontWeight: 400)
    robotoMedium: 'Roboto-Medium, Roboto, sans-serif', // roboto_medium.ttf (fontWeight: 700)
    robotoRegular: 'Roboto-Regular, Roboto, sans-serif', // roboto_regular.ttf (fontWeight: 400)
  },
  // 텍스트 크기 표준 (실제 앱에서 추출한 정확한 값)
  fontSize: {
    // 주요 텍스트 크기
    title: '26dp', // 타이틀
    subtitle: '20dp', // 서브타이틀
    body: '16dp', // 본문
    bodySmall: '15dp', // 작은 본문
    caption: '14dp', // 캡션
    small: '12dp', // 작은 텍스트
    tiny: '10dp', // 최소 텍스트
    // 특수 UI 텍스트
    dialogTitle: '20dp', // 다이얼로그 타이틀
    dialogButton: '18dp', // 다이얼로그 버튼
    toast: '14dp', // 토스트
    kbEditTextChar: '19dp', // KB EditText 문자 입력
    kbEditTextNumber: '21dp', // KB EditText 숫자 입력
    bottomSheetAmount: '30dp', // 바텀시트 금액 입력
    keypadButton: '24dp', // 키패드 버튼
    // 메뉴 관련
    tabText: '15dp', // 탭 텍스트
    menuText: '15dp', // 메뉴 텍스트
    subMenuText: '15dp', // 서브메뉴 텍스트
    recentMenuText: '14dp', // 최근 메뉴 텍스트
    searchMenuText: '16dp', // 검색 메뉴 텍스트
  },
  // 텍스트 스타일 프리셋
  styles: {
    // KBEditText 스타일
    kbEditTextChar: {
      fontSize: '19dp',
      fontFamily: 'KBFG-Text-Bold',
      color: '#FF26282C',
      letterSpacing: '-0.01em',
      paddingBottom: '9dp',
    },
    kbEditTextNumber: {
      fontSize: '21dp',
      fontFamily: 'Roboto-Medium',
      color: '#FF26282C',
      letterSpacing: '-0.01em',
    },
    // 다이얼로그 스타일
    dialogTitle: {
      fontSize: '20dp',
      fontFamily: 'KBFG-Text-Bold',
      color: '#FF26282C',
      letterSpacing: '-0.02em',
      lineHeight: '24dp',
    },
    dialogButton: {
      fontSize: '18dp',
      fontFamily: 'KBFG-Text-Bold',
      color: '#FF26282C',
    },
    // 토스트 스타일
    toast: {
      fontSize: '14dp',
      fontFamily: 'KBFG-Text-Light',
      color: '#FFDDE1E4',
      lineHeight: '17dp',
    },
    // 탭 스타일
    loginTab: {
      fontSize: '15dp',
      fontFamily: 'KBFG-Text-Bold',
      letterSpacing: '-0.02em',
    },
    // 메뉴 스타일
    menuItem: {
      fontSize: '15dp',
      fontFamily: 'KBFG-Text-Light',
    },
    subMenuItem: {
      fontSize: '15dp',
      fontFamily: 'KBFG-Text-Light',
      color: '#FF696E76',
    },
    // 바텀시트 스타일
    bottomSheetTitle: {
      fontSize: '20dp',
      fontFamily: 'KBFG-Text-Bold',
      color: '#FF26282C',
    },
    bottomSheetAmount: {
      fontSize: '30dp',
      fontFamily: 'Roboto-Medium',
      color: '#FF26282C',
    },
    // 키패드 스타일
    keypadButton: {
      fontSize: '24dp',
      fontFamily: 'Roboto-Medium',
      color: '#FF26282C',
    },
  },
  // 폰트 웨이트
  fontWeight: {
    light: 400, // KBFG Text Light
    medium: 500, // KBFG Text Medium
    bold: 700, // KBFG Text Bold
  },
  // 줄 간격
  lineHeight: {
    tight: '1.2',
    normal: '1.4',
    loose: '1.6',
    dialogTitle: '4dp', // 다이얼로그 타이틀 추가 줄간격
    toast: '3dp', // 토스트 줄간격
  },
  // 자간 (Letter Spacing)
  letterSpacing: {
    tight: '-0.02em', // 탭, 다이얼로그 타이틀
    normal: '-0.01em', // EditText
    none: '0em',
  },
};
// CSS-in-JS용 폰트 페이스 정의
export const fontFaces = `
  @font-face {
    font-family: 'KBFG-Text-Bold';
    src: url('./src/assets/fonts/kbfg_text_b.otf') format('opentype');
    font-weight: 700;
    font-style: normal;
  }
  @font-face {
    font-family: 'KBFG-Text-Medium';
    src: url('./src/assets/fonts/kbfg_text_m.otf') format('opentype');
    font-weight: 500;
    font-style: normal;
  }
  @font-face {
    font-family: 'KBFG-Text-Light';
    src: url('./src/assets/fonts/kbfg_text_l.otf') format('opentype');
    font-weight: 400;
    font-style: normal;
  }
`;
// 타입 정의
export type FontFamily = keyof typeof typography.fontFamily;
export type FontSize = keyof typeof typography.fontSize;
export type TextStyle = keyof typeof typography.styles;
