// KB스타뱅킹 정확한 치수 시스템 (완전 분석 결과 기반)
export const dimensions = {
  // 기본 단위
  base: {
    minTouchTarget: 48,  // 최소 터치 영역
    defaultPadding: 16,  // 기본 패딩
    smallPadding: 8,     // 작은 패딩
    largePadding: 24,    // 큰 패딩
  },
  // 컴포넌트별 높이 (실제 앱에서 추출한 정확한 값)
  height: {
    header: 56,            // 헤더
    kbEditText: 70,        // KB 전용 입력 필드
    button: 46,            // 일반 버튼
    smallButton: 36,       // 작은 버튼
    dialogButton: 52,      // 다이얼로그 버튼
    bottomSheetButton: 60, // 바텀시트 버튼
    tab: 38,               // 탭
    loginTab: 24,          // 로그인 탭 (fragment_login_main_tab_height)
    listItem: 48,          // 기본 리스트 아이템
    listItemLarge: 64,     // 큰 리스트 아이템
    toast: 74,             // 토스트
    chip: 32,              // 칩/태그
    keypadButton: 60,      // 키패드 버튼
    // 특수 컴포넌트
    starteensButton: 36,          // 스타틴즈 로그인 버튼
    starteensKeypad: 160,         // 스타틴즈 키패드
    starteensKeypadButton: 40,    // 스타틴즈 키패드 버튼
    patternLockView: 250,         // 패턴 잠금 영역 (정사각형)
    loginBottomOther: 140,        // 로그인 기타 옵션 영역
    onestopButton: 114,           // 원스탑 서비스 버튼
    starShotSideMenu: 57,         // 사이드 메뉴
    // 메뉴 시스템
    zeroMenu: 42,          // 최상위 탭 메뉴
    oneMenuMin: 20,        // 1차 메뉴 최소 높이
    recentMenu: 30,        // 최근 사용 메뉴
    myMenu: 32,            // 내 메뉴
    searchMenu: 40,        // 검색 메뉴
  },
  // 모서리 둥글기 (Corner Radius)
  borderRadius: {
    small: 2,              // 작은 요소 (다이얼로그)
    medium: 8,             // 버튼
    large: 12,             // 카드/탭 (로그인 탭)
    xlarge: 16,            // 바텀시트
    round: 30,             // 원형 버튼 (My 메뉴, Footer 버튼)
    // 특수 값
    dialog: 2,             // 다이얼로그
    toast: 8,              // 토스트 (8dp)
    loginTab: 12,          // 로그인 탭 (fragment_login_main_tab_rounded)
    rectPinBorder: 5,      // 핀 테두리
    bottomSheet: 16,       // 바텀시트 상단 모서리
    widgetRadius: 10,      // 위젯 배경
    kbpayGuideView: 15,    // KB Pay 가이드 뷰
  },
  // 여백 표준
  spacing: {
    // 화면 레벨 여백
    screenHorizontal: 24,  // 화면 좌우 여백
    sectionGap: 16,        // 섹션 간 간격
    itemGap: 8,            // 아이템 간 간격
    // 컴포넌트 내부 패딩
    innerPadding: 12,      // 내부 패딩 (10-12dp)
    dialogPadding: 28,     // 다이얼로그 패딩 (26-28dp)
    // 특수 여백
    loginTabHorizontal: 16,     // 로그인 탭 수평 여백
    loginTabTop: 40,            // 로그인 탭 상단 여백
    commonHeaderPadding: 20,    // 공통 헤더 패딩
    baseHeaderPaddingLeft: 20,  // 베이스 헤더 왼쪽 패딩
    baseHeaderPaddingRight: 20, // 베이스 헤더 오른쪽 패딩
  },
  // 보안 키패드 관련
  keypad: {
    gridRows: 4,           // 4행
    gridCols: 3,           // 3열
    bottomSpace: 16,       // 하단 공백
    confirmButton: 60,     // 확인 버튼 높이
  },
  // 위젯 크기
  widget: {
    main: {
      iconSize: 35,        // 아이콘 크기
      textSize: 12,        // 텍스트 크기
    },
    kbPay: {
      size: 140,           // 140dp × 140dp
      imageSize: 120,      // 중앙 이미지 120dp
    },
    kbPayVertical: {
      imageRatio: 6.5,     // 상단 이미지 비율
      spaceRatio: 3.5,     // 하단 여백 비율
    },
  },
  // 카드 컴포넌트
  card: {
    liivPayMethod: {
      width: 260,          // 결제수단 카드 너비
      height: 105,         // 결제수단 카드 높이
      iconWidth: 45,       // 아이콘 너비
      iconHeight: 72,      // 아이콘 높이
      margin: 10,          // 상하 마진
    },
  },
  // 바텀시트 관련
  bottomSheet: {
    slideBarWidth: 52,     // 슬라이드 바 너비
    slideBarHeight: 4,     // 슬라이드 바 높이
    slideBarTopMargin: 8,  // 슬라이드 바 상단 마진
    topPadding: 30,        // 상단 패딩
    cornerRadius: 16,      // 상단 모서리 둥글기
  },
  // 금액 입력 바텀시트
  amountBottomSheet: {
    keypadButton: 60,      // 키패드 버튼 높이
    shortcutButton: 34,    // 금액 단축 버튼 높이
    shortcutButtonGap: 3,  // 금액 단축 버튼 간격
    confirmButtonTop: 16,  // 확인 버튼 상단 마진
  },
  // 애니메이션 관련
  animation: {
    patternNodeSize: 25,   // 패턴 노드 크기
    waveAmplitude: 10,     // 흔들림 효과 진폭 (±10dp)
  },
  // Elevation (그림자)
  elevation: {
    level0: 0,             // 그림자 없음
    level1: 1,             // 카드 기본
    level2: 3,             // 일반 컴포넌트
    level3: 6,             // FAB
    level4: 8,             // 바텀시트
    level5: 12,            // 높은 레벨
    // 특수 컴포넌트
    bottomSheet: 10,       // 바텀시트
    navigationDrawer: 10,  // 네비게이션 드로어
    fab: 6,                // 플로팅 액션 버튼
    card: 2,               // 카드 기본
    cardDrag: 5,           // 카드 드래그 시
    button: 2,             // 버튼 기본
    dialog: '0 2px 8px rgba(0, 0, 0, 0.15)', // 다이얼로그 (2dp elevation)
    toast: '0 4px 12px rgba(0, 0, 0, 0.15)',  // 토스트
    liivPayCard: 4,        // 결제수단 카드
  },
  // 프로그레스바
  progress: {
    circularSize: 100,     // 원형 프로그레스바 크기
    linearHeight: 4,       // 선형 프로그레스바 높이
  },
  // 특수 UI 요소
  special: {
    // 연락처 관련
    contactsEditTextHeight: 49,
    contactsEditTextPadding: 5,
    contactsListItemHeight: 47,
    contactsIndexWidth: 23,
    contactsIndexHeight: 355.5,
    contactsPopupIndexBoxSize: 70,
    // 인증서 관련
    certListHeight: 250,
    certListItemHeight: 90,
    certListItemBtnWidth: 41,
    certListItemBtnHeight: 18,
    // 체크박스 영역
    checkBoxAreaHeight: 40,
    checkBoxImageWidth: 42,
    checkBoxAreaMarginBottom: 32,
  },
};
// 반응형 브레이크포인트
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};
// 모바일 최적화 (720dp-xxhdpi 기준)
export const mobileOptimized = {
  simpleSendButtonHeight: 40,     // 간편송금 버튼 높이
  simpleSendLayoutHeight: 76,     // 간편송금 레이아웃 높이
  simpleSendPaddingHorizontal: 35.5, // 간편송금 패딩 수평
  loginTitleTextSize: 24,         // 로그인 타이틀 텍스트
  patternAreaPadding: 36,         // 패턴 영역 패딩
};
// 타입 정의
export type DimensionKey = keyof typeof dimensions;
export type HeightKey = keyof typeof dimensions.height;
export type SpacingKey = keyof typeof dimensions.spacing;