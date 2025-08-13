// KB 스타뱅킹 원본 앱의 정확한 치수 (dimens.xml에서 추출)
export const mobileDimensions = {
  // 화면 크기 (Android 앱 기준)
  screenWidth: '360px', // Android 표준 모바일 너비 (360dp = 360px at 1x density)
  screenMaxWidth: '100vw', // 브라우저 전체 너비 사용
  screenHeight: '100vh', // 브라우저 전체 높이 사용
  screenMinWidth: '320px', // 최소 모바일 너비
  // 헤더 관련 (원본 앱에서 추출)
  headerHeight: '48px', // common_header_height
  headerPaddingStart: '24px', // common_header_padding_start
  headerPaddingEnd: '24px', // common_header_padding_end
  headerPaddingTop: '12px', // common_header_padding_top
  headerPaddingBottom: '12px', // common_header_padding_bottom
  // 로그인 관련 치수
  loginHeaderHeight: '56px', // login_header_height
  loginHeaderIconSize: '25px', // login_header_icon_width/height
  loginHeaderIconMargin: '15px', // login_header_icon_margin
  // 바텀 시트 관련
  bottomSheetElevation: '10px', // fragment_login_bottom_sheet_elevation
  bottomSheetMarginStart: '24px', // fragment_login_bottom_sheet_margin_start
  bottomSheetMarginEnd: '24px', // fragment_login_bottom_sheet_margin_end
  bottomSheetTabHeight: '38px', // tabLayout height
  bottomSheetSlideBarRadius: '4px', // fragment_login_bottom_sheet_slide_bar_radius
  // 버튼 관련
  buttonHeight: '48px', // abc_action_button_min_height_material
  buttonHeightSmall: '40px', // login_Accept_btn_height
  buttonMinWidth: '48px', // abc_action_button_min_width_material
  buttonPaddingHorizontal: '24px', // common_padding_start/end
  // 텍스트 크기 (원본 앱에서 추출)
  textSizeTitle: '20px', // abc_text_size_title_material
  textSizeSubhead: '16px', // abc_text_size_subhead_material
  textSizeBody: '14px', // abc_text_size_body_1_material
  textSizeCaption: '12px', // abc_text_size_caption_material
  textSizeButton: '14px', // abc_text_size_button_material
  // 간격 관련
  spacingXS: '4px', // _4dp
  spacingS: '8px', // standard_padding
  spacingM: '16px', // activity_horizontal_margin
  spacingL: '24px', // common_padding_start
  spacingXL: '32px',
  // 경계선
  borderRadius: '4px', // abc_control_corner_material
  borderRadiusLarge: '12px', // fragment_login_main_tab_rounded
  borderWidth: '1px',
  // 이미지 크기
  iconSizeSmall: '16px',
  iconSizeMedium: '24px', // design_navigation_icon_size
  iconSizeLarge: '32px',
  // 입력 필드
  inputHeight: '48px', // abc_action_button_min_height_material
  inputPadding: '16px',
} as const;
// 모바일 앱 컨테이너 스타일 - 완전 반응형
export const mobileStyles = {
  appContainer: `
    width: 100vw;
    max-width: 100vw;
    min-width: ${mobileDimensions.screenMinWidth};
    height: 100vh;
    min-height: 100vh;
    margin: 0;
    padding: 0;
    background-color: #FFFFFF;
    position: relative;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    /* 모바일 환경 최적화 */
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
    /* 사파리 모바일 주소창 대응 */
    min-height: 100vh;
    min-height: -webkit-fill-available;
  `,
  header: `
    height: ${mobileDimensions.headerHeight};
    padding: ${mobileDimensions.headerPaddingTop} ${mobileDimensions.headerPaddingEnd} ${mobileDimensions.headerPaddingBottom} ${mobileDimensions.headerPaddingStart};
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,
  content: `
    flex: 1;
    overflow-y: auto;
    height: calc(100vh - ${mobileDimensions.headerHeight});
  `,
  bottomSheet: `
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    z-index: 100;
  `,
  button: `
    height: ${mobileDimensions.buttonHeight};
    padding: 0 ${mobileDimensions.buttonPaddingHorizontal};
    border-radius: ${mobileDimensions.borderRadius};
    font-size: ${mobileDimensions.textSizeButton};
    font-weight: 500;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: ${mobileDimensions.buttonMinWidth};
  `,
  input: `
    height: ${mobileDimensions.inputHeight};
    padding: 0 ${mobileDimensions.inputPadding};
    border: 1px solid #EBEEF0;
    border-radius: ${mobileDimensions.borderRadius};
    font-size: ${mobileDimensions.textSizeBody};
    width: 100%;
  `,
} as const;
// 미디어 쿼리 - Android 앱 기준 반응형 디자인
export const mobileMediaQueries = {
  // 소형 모바일 (320px-359px)
  small: '@media (min-width: 320px) and (max-width: 359px)',
  // 표준 모바일 (360px-411px) - 대부분 Android 디바이스
  medium: '@media (min-width: 360px) and (max-width: 411px)',
  // 대형 모바일 (412px 이상)
  large: '@media (min-width: 412px)',
  // 모든 모바일 범위
  mobile: '@media (max-width: 768px)',
  // 최소 너비 보장
  minWidth: '@media (min-width: 320px)',
} as const; 