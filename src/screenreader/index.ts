/**
 * Screen Reader Support System for KB StarBanking
 *
 * A comprehensive screen reader support system with Korean language optimization,
 * financial data accessibility, and WCAG 2.1 AA compliance.
 *
 * @example
 * ```tsx
 * import { useScreenReader, AccessibleBalance } from '@/screenreader';
 *
 * function MyComponent() {
 *   const { announce, announceBalance } = useScreenReader();
 *
 *   const handleBalanceCheck = () => {
 *     announceBalance(1500000); // "잔액 1,500,000원"
 *   };
 *
 *   return (
 *     <AccessibleBalance
 *       balance={1500000}
 *       accountName="KB국민은행 입출금통장"
 *       accountNumber="123-45-678901"
 *     />
 *   );
 * }
 * ```
 */

// Core Manager
export { ScreenReaderManager } from './core/ScreenReaderManager';
export type { AnnouncementOptions, ScreenReaderConfig } from './core/ScreenReaderManager';

// React Hooks
export {
  useScreenReader,
  useFocusAnnouncement,
  usePageAnnouncement,
  useFormValidationAnnouncement,
  useTransactionAnnouncement,
  useAuthAnnouncement,
  useNavigationAnnouncement,
  useTableAnnouncement,
} from './hooks/useScreenReader';

export type { UseScreenReaderReturn } from './hooks/useScreenReader';

// Accessible Components
export {
  AccessibleBalance,
  AccessibleTransactionList,
  AccessibleAmountInput,
  AccessibleTransferForm,
} from './components/AccessibleFinancialComponents';

// Component Props Types
export type {
  AccessibleBalanceProps,
  AccessibleTransactionListProps,
  AccessibleAmountInputProps,
  AccessibleTransferFormProps,
  Transaction,
} from './components/AccessibleFinancialComponents';

// Utility Functions
export const initializeScreenReader = () => {
  return ScreenReaderManager.getInstance();
};

// Version and metadata
export const SCREEN_READER_VERSION = '1.0.0';
export const SUPPORTED_LANGUAGES = ['ko-KR'];
export const WCAG_COMPLIANCE_LEVEL = 'AA';

/**
 * Default configuration for Korean banking applications
 */
export const DEFAULT_KOREAN_CONFIG: ScreenReaderConfig = {
  language: 'ko-KR',
  verbosityLevel: 'normal',
  enableDescriptions: true,
  enableHints: true,
  speechRate: 1.0,
  announceRoles: true,
  announceStates: true,
};

/**
 * Quick setup function for new applications
 *
 * @example
 * ```tsx
 * // In your App.tsx
 * import { setupScreenReaderForBanking } from '@/screenreader';
 *
 * function App() {
 *   useEffect(() => {
 *     setupScreenReaderForBanking();
 *   }, []);
 *
 *   return <YourApp />;
 * }
 * ```
 */
export const setupScreenReaderForBanking = (config?: Partial<ScreenReaderConfig>) => {
  const manager = ScreenReaderManager.getInstance();
  manager.updateConfig({
    ...DEFAULT_KOREAN_CONFIG,
    ...config,
  });
  return manager;
};

// Re-export types for external use
export type {
  AnnouncementOptions as ScreenReaderAnnouncementOptions,
  ScreenReaderConfig as ScreenReaderConfiguration,
} from './core/ScreenReaderManager';
