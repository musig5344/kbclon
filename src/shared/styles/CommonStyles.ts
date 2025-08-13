/**
 * 공통 스타일 컴포넌트
 * - 중복된 스타일 컴포넌트 통합
 * - 일관된 디자인 시스템 유지
 * - 코드 재사용성 향상
 */

import styled, { css } from 'styled-components';

import { responsiveContainer, responsiveContent } from '../../styles/responsive';
import { tokens } from '../../styles/tokens';

// ============ Container Styles ============
export const PageContainer = styled.div`
  ${responsiveContainer}
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${tokens.colors.background};
`;

export const MainContent = styled.main`
  ${responsiveContent}
  flex: 1;
  padding-bottom: calc(
    ${tokens.sizes.navigation.height} + ${tokens.spacing.small} + env(safe-area-inset-bottom)
  );
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

export const Section = styled.section<{ $noPadding?: boolean }>`
  background-color: ${tokens.colors.white};
  ${props =>
    !props.$noPadding &&
    css`
      padding: ${tokens.spacing.large};
    `}
  margin-bottom: ${tokens.spacing.small};
`;

export const Card = styled.div<{ $clickable?: boolean }>`
  background-color: ${tokens.colors.white};
  border-radius: ${tokens.borderRadius.xl};
  padding: ${tokens.spacing.large};
  box-shadow: ${tokens.shadows.elevation1};
  margin-bottom: ${tokens.spacing.medium};
  transition: all 0.2s ease;

  ${props =>
    props.$clickable &&
    css`
      cursor: pointer;

      &:hover {
        transform: translateY(-${tokens.spacing.micro});
        box-shadow: ${tokens.shadows.elevation2};
      }

      &:active {
        transform: translateY(0);
        box-shadow: ${tokens.shadows.elevation1};
      }
    `}
`;

// ============ Header Styles ============
export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${tokens.spacing.medium} ${tokens.spacing.large};
  height: ${tokens.sizes.header.heightLarge};
  background-color: ${tokens.colors.white};
  border-bottom: 1px solid ${tokens.colors.background.secondary};
`;

export const HeaderButton = styled.button`
  background: none;
  border: none;
  padding: ${tokens.spacing.small};
  cursor: pointer;
  width: ${tokens.sizes.button.heightMedium};
  height: ${tokens.sizes.button.heightMedium};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${tokens.borderRadius.round};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${tokens.colors.background.secondary};
  }

  &:active {
    background-color: ${tokens.colors.background.secondary};
  }

  img {
    width: ${tokens.sizes.icon.medium};
    height: ${tokens.sizes.icon.medium};
  }
`;

export const HeaderTitle = styled.h1`
  font-size: ${tokens.typography.fontSize.titleMedium};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.textPrimary};
  margin: 0;
`;

// ============ Button Styles ============
const buttonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: ${tokens.typography.fontWeight.semibold};
  border: none;
  border-radius: ${tokens.borderRadius.large};
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ============ Button Styles - DEPRECATED ============
// These button styles are deprecated. Use @shared/components/ui/Button instead
// Keeping for backward compatibility only

export const PrimaryButton = styled.button`
  ${buttonBase}
  background-color: ${tokens.colors.primary};
  color: white;
  padding: ${tokens.spacing.medium} ${tokens.spacing.large};
  font-size: ${tokens.typography.fontSize.bodyLarge};

  &:hover:not(:disabled) {
    background-color: ${tokens.colors.primaryDark};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

export const SecondaryButton = styled.button`
  ${buttonBase}
  background-color: ${tokens.colors.background.secondary};
  color: ${tokens.colors.textPrimary};
  padding: ${tokens.spacing.medium} ${tokens.spacing.large};
  font-size: ${tokens.typography.fontSize.bodyLarge};

  &:hover:not(:disabled) {
    background-color: ${tokens.colors.border.primary};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

export const TextButton = styled.button`
  ${buttonBase}
  background-color: transparent;
  color: ${tokens.colors.primary};
  padding: ${tokens.spacing.small} ${tokens.spacing.medium};
  font-size: ${tokens.typography.fontSize.bodyMedium};

  &:hover:not(:disabled) {
    background-color: ${tokens.colors.primaryLight}20;
  }
`;

// ============ Form Styles ============
export const FormGroup = styled.div`
  margin-bottom: ${tokens.spacing.large};
`;

export const Label = styled.label<{ $required?: boolean }>`
  display: block;
  font-size: ${tokens.typography.fontSize.bodyMedium};
  font-weight: ${tokens.typography.fontWeight.medium};
  color: ${tokens.colors.textPrimary};
  margin-bottom: ${tokens.spacing.small};

  ${props =>
    props.$required &&
    css`
      &::after {
        content: ' *';
        color: ${tokens.colors.error};
      }
    `}
`;

export const Input = styled.input`
  width: 100%;
  padding: ${tokens.spacing.medium} ${tokens.spacing.medium};
  font-size: ${tokens.typography.fontSize.bodyLarge};
  border: 1px solid ${tokens.colors.border.primary};
  border-radius: ${tokens.borderRadius.large};
  background-color: ${tokens.colors.white};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${tokens.colors.primary};
  }

  &:disabled {
    background-color: ${tokens.colors.background.secondary};
    color: ${tokens.colors.textSecondary};
  }

  &::placeholder {
    color: ${tokens.colors.textTertiary};
  }
`;

export const ErrorText = styled.span`
  display: block;
  font-size: ${tokens.typography.fontSize.bodySmall};
  color: ${tokens.colors.error};
  margin-top: ${tokens.spacing.micro};
`;

export const HelperText = styled.span`
  display: block;
  font-size: ${tokens.typography.fontSize.bodySmall};
  color: ${tokens.colors.textSecondary};
  margin-top: ${tokens.spacing.micro};
`;

// ============ List Styles ============
export const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const ListItem = styled.li<{ $clickable?: boolean }>`
  padding: ${tokens.spacing.medium} ${tokens.spacing.large};
  border-bottom: 1px solid ${tokens.colors.background.secondary};
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:last-child {
    border-bottom: none;
  }

  ${props =>
    props.$clickable &&
    css`
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: ${tokens.colors.background.secondary};
      }

      &:active {
        background-color: ${tokens.colors.background.secondary};
      }
    `}
`;

// ============ Text Styles ============
export const Title = styled.h2`
  font-size: ${tokens.typography.fontSize.titleLarge};
  font-weight: ${tokens.typography.fontWeight.bold};
  color: ${tokens.colors.textPrimary};
  margin: 0 0 ${tokens.spacing.medium} 0;
`;

export const Subtitle = styled.h3`
  font-size: ${tokens.typography.fontSize.bodyLarge};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.textPrimary};
  margin: 0 0 ${tokens.spacing.medium} 0;
`;

export const Text = styled.p`
  font-size: ${tokens.typography.fontSize.bodyMedium};
  color: ${tokens.colors.textPrimary};
  line-height: 1.5;
  margin: 0;
`;

export const SmallText = styled.span`
  font-size: ${tokens.typography.fontSize.bodySmall};
  color: ${tokens.colors.textSecondary};
`;

// ============ Utility Styles ============
export const Divider = styled.hr`
  border: none;
  height: 1px;
  background-color: ${tokens.colors.background.secondary};
  margin: ${tokens.spacing.medium} 0;
`;

export const Spacer = styled.div<{ $height?: number }>`
  height: ${props => props.$height || tokens.spacing.medium};
`;

export const FlexRow = styled.div<{ $gap?: number; $align?: string; $justify?: string }>`
  display: flex;
  flex-direction: row;
  align-items: ${props => props.$align || 'center'};
  justify-content: ${props => props.$justify || 'flex-start'};
  gap: ${props => props.$gap || 0}px;
`;

export const FlexColumn = styled.div<{ $gap?: number; $align?: string }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$align || 'stretch'};
  gap: ${props => props.$gap || 0}px;
`;

// ============ Modal Styles ============
export const ModalOverlay = styled.div<{ $visible?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${tokens.colors.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: ${props => (props.$visible ? 1 : 0)};
  visibility: ${props => (props.$visible ? 'visible' : 'hidden')};
  transition:
    opacity 0.3s,
    visibility 0.3s;
`;

export const ModalContent = styled.div`
  background-color: ${tokens.colors.white};
  border-radius: ${tokens.borderRadius.xxl};
  padding: ${tokens.spacing.large};
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${tokens.shadows.elevation4};
`;

// ============ Loading Styles ============
export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${tokens.spacing.xl};
`;

export const Spinner = styled.div<{ $size?: number }>`
  width: ${props => props.$size || tokens.sizes.icon.large}px;
  height: ${props => props.$size || tokens.sizes.icon.large}px;
  border: 3px solid ${tokens.colors.border.primary};
  border-radius: ${tokens.borderRadius.round};
  border-top-color: ${tokens.colors.primary};
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// ============ Badge Styles ============
export const Badge = styled.span<{ $variant?: 'primary' | 'success' | 'warning' | 'error' }>`
  display: inline-block;
  padding: ${tokens.spacing.micro} ${tokens.spacing.small};
  font-size: ${tokens.typography.fontSize.bodySmall};
  font-weight: ${tokens.typography.fontWeight.semibold};
  border-radius: ${tokens.borderRadius.xl};

  ${props => {
    const variants = {
      primary: css`
        background-color: ${tokens.colors.primaryLight};
        color: ${tokens.colors.primary};
      `,
      success: css`
        background-color: ${tokens.colors.successLight};
        color: ${tokens.colors.success};
      `,
      warning: css`
        background-color: ${tokens.colors.warningLight};
        color: ${tokens.colors.warning};
      `,
      error: css`
        background-color: ${tokens.colors.errorLight};
        color: ${tokens.colors.error};
      `,
    };
    return variants[props.$variant || 'primary'];
  }}
`;

// Export all components
export default {
  // Containers
  PageContainer,
  MainContent,
  Section,
  Card,

  // Headers
  Header,
  HeaderButton,
  HeaderTitle,

  // Buttons
  PrimaryButton,
  SecondaryButton,
  TextButton,

  // Forms
  FormGroup,
  Label,
  Input,
  ErrorText,
  HelperText,

  // Lists
  List,
  ListItem,

  // Text
  Title,
  Subtitle,
  Text,
  SmallText,

  // Utilities
  Divider,
  Spacer,
  FlexRow,
  FlexColumn,

  // Modals
  ModalOverlay,
  ModalContent,

  // Loading
  LoadingContainer,
  Spinner,

  // Badge
  Badge,
};
