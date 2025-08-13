// Loading Components - Unified
export { PageLoader } from './PageLoader';
export { LazyLoadErrorBoundary } from './LazyLoadErrorBoundary';
export { SplashScreen } from './SplashScreen';
export {
  UnifiedLoading,
  LoadingScreen,
  InlineLoading,
  OverlayLoading,
  KBLoading,
} from './UnifiedLoading';
export type { UnifiedLoadingProps } from './UnifiedLoading';

// Deprecated: Use UnifiedLoading instead
// export { FinancialLoader } from './FinancialLoader'; // REMOVED
// export { KBLoadingAnimation } from './KBLoadingAnimation'; // REMOVED
// export { OptimizedLoadingAnimation } from './OptimizedLoadingAnimation'; // REMOVED

// Skeleton Components
export { Skeleton, SkeletonGroup, TextSkeleton } from './Skeleton';
export { AccountSkeleton } from './AccountSkeleton';
export { TransactionSkeleton, TransactionPageSkeleton } from './TransactionSkeleton';
export { DashboardSkeleton } from './DashboardSkeleton';
export { MenuItemSkeleton, MenuSectionSkeleton, MenuPageSkeleton } from './MenuItemSkeleton';

// UI Components - Unified and Optimized
export * from './Button';
export { Input } from './Input';
export {
  Modal,
  ModalButton,
  DialogContentLayout,
  AnimatedCheckIcon,
  ScrollableContent,
} from './Modal';
export type { ModalProps } from './Modal';
export { default as BottomSheet } from './BottomSheet';
export type { BottomSheetProps } from './BottomSheet';
export { MoreOptionsModal } from './MoreOptionsModal';
export { Typography } from './Typography';
export { PageHeader } from './PageHeader';
export { ErrorNotification } from './ErrorNotification';

// Image Components
export { OptimizedImage } from './OptimizedImage';
export { ProgressiveImage } from './ProgressiveImage';

// Route Components
export { default as ProtectedRoute } from './ProtectedRoute';
