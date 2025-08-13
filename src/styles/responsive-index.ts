/**
 * KB 스타뱅킹 통합 반응형 시스템 Export
 * 모든 반응형 관련 유틸리티와 컴포넌트를 한 곳에서 관리
 */

// 브레이크포인트 시스템
export {
  DEVICE_TYPES,
  BREAKPOINTS,
  PORTRAIT_HEIGHTS,
  LANDSCAPE_HEIGHTS,
  MEDIA_QUERIES,
  KB_BREAKPOINTS,
  createMediaQuery,
  getDeviceType,
  getSafeAreaDimensions,
  type DeviceType,
  type BreakpointKey,
  type MediaQueryKey
} from './breakpoints';

// 반응형 유틸리티 시스템
export {
  KB_DESIGN_TOKENS,
  getDPIScale,
  calculateResponsiveSize,
  ensureTouchTarget,
  createSafeAreaStyle,
  getResponsiveFontSize,
  getResponsiveSpacing,
  createResponsiveContainer,
  createResponsiveHeader,
  createResponsiveButton,
  createResponsiveCard,
  createResponsiveInput,
  createResponsiveText,
  createResponsiveListItem,
  createResponsiveGrid,
  createDeviceOptimizedStyle,
  createResponsiveAnimation
} from './responsive-system';

// React 훅
export {
  useResponsive,
  selectResponsiveValue,
  type ResponsiveState,
  type ResponsiveContextType
} from '../hooks/useResponsive';

// 반응형 컴포넌트들
export {
  ResponsiveHeader,
  MainHeader,
  PageHeader,
  SearchHeader,
  KBMainHeader,
  type ResponsiveHeaderProps
} from '../components/common/ResponsiveHeader';

export {
  ResponsiveList,
  ResponsiveListItem,
  AccountListItem,
  TransactionListItem,
  MenuListItem,
  type ResponsiveListProps,
  type ResponsiveListItemProps
} from '../components/common/ResponsiveList';

// 디자인 시스템 반응형 컴포넌트들
export {
  Button,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  TextButton,
  DangerButton,
  KBYellowButton,
  LoginButton,
  ConfirmButton,
  CancelButton,
  FloatingActionButton,
  type ButtonProps
} from '../components/design-system/Button';

// 기존 디자인 시스템 (반응형 업그레이드)
export {
  Typography,
  DisplayLarge,
  DisplayMedium,
  DisplaySmall,
  HeadlineLarge,
  HeadlineMedium,
  HeadlineSmall,
  TitleLarge,
  TitleMedium,
  TitleSmall,
  BodyLarge,
  BodyMedium,
  BodySmall,
  LabelLarge,
  LabelMedium,
  LabelSmall,
  PageTitle,
  SectionTitle,
  HelperText,
  ErrorText,
  Amount,
  type TypographyProps,
  type AmountProps
} from '../components/design-system/Typography';

export {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  AccountCard,
  BasicCard,
  ElevatedCard,
  OutlinedCard,
  type CardProps,
  type CardHeaderProps,
  type CardContentProps,
  type CardActionsProps,
  type AccountCardProps
} from '../components/design-system/Card';

export {
  Input,
  BasicInput,
  OutlinedInput,
  SearchInput,
  type InputProps
} from '../components/design-system/Input';

// 반응형 미디어 쿼리 헬퍼
export const createResponsiveCSS = (styles: {
  phoneSmall?: string;
  phoneMedium?: string;
  phoneLarge?: string;
  tablet7?: string;
  tablet10?: string;
  tablet12?: string;
  desktop?: string;
  default: string;
}) => {
  const {
    phoneSmall,
    phoneMedium,
    phoneLarge,
    tablet7,
    tablet10,
    tablet12,
    desktop,
    default: defaultStyle
  } = styles;

  return `
    ${defaultStyle}
    
    ${phoneSmall ? `
      ${MEDIA_QUERIES.phoneSmall} {
        ${phoneSmall}
      }
    ` : ''}
    
    ${phoneMedium ? `
      ${MEDIA_QUERIES.phoneMedium} {
        ${phoneMedium}
      }
    ` : ''}
    
    ${phoneLarge ? `
      ${MEDIA_QUERIES.phoneLarge} {
        ${phoneLarge}
      }
    ` : ''}
    
    ${tablet7 ? `
      ${MEDIA_QUERIES.tablet7} {
        ${tablet7}
      }
    ` : ''}
    
    ${tablet10 ? `
      ${MEDIA_QUERIES.tablet10} {
        ${tablet10}
      }
    ` : ''}
    
    ${tablet12 ? `
      ${MEDIA_QUERIES.tablet12} {
        ${tablet12}
      }
    ` : ''}
    
    ${desktop ? `
      ${MEDIA_QUERIES.desktop} {
        ${desktop}
      }
    ` : ''}
  `;
};

// 반응형 값 계산 헬퍼
export const responsive = {
  // 화면 크기별 값 선택
  value: selectResponsiveValue,
  
  // 폰트 크기 계산
  fontSize: (baseSize: number, width: number) => getResponsiveFontSize(baseSize, width),
  
  // 간격 계산
  spacing: (spacing: keyof typeof KB_DESIGN_TOKENS.spacing, width: number) => 
    getResponsiveSpacing(spacing, width),
  
  // 크기 계산
  size: (baseSize: number, width: number, minSize?: number, maxSize?: number) =>
    calculateResponsiveSize(baseSize, width, minSize, maxSize),
  
  // 터치 타겟 보장
  touchTarget: ensureTouchTarget,
  
  // DPI 스케일
  dpiScale: getDPIScale
};

// 디바이스 감지 헬퍼
export const device = {
  getType: getDeviceType,
  getSafeArea: getSafeAreaDimensions
};

// KB 디자인 토큰 (빠른 접근)
export const kbTokens = KB_DESIGN_TOKENS;
export const kbBreakpoints = KB_BREAKPOINTS;
export const mediaQueries = MEDIA_QUERIES;