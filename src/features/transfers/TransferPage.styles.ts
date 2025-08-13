import styled from 'styled-components';

import { FormInput } from '../../shared/components';
import {
  PageContainer,
  PageContent,
  FixedBottomButtonArea,
} from '../../shared/components/layout/MobileContainer';
import {
  androidAppContainer,
  androidOptimizedScroll,
  androidOptimizedButton,
  androidOptimizedInput,
} from '../../styles/android-webview-optimizations';
import { duration, easing } from '../../styles/animations';
import { tokens } from '../../styles/tokens';

/* === 메인 컨테이너 === */
export const TransferContainer = styled(PageContainer)`
  background-color: ${tokens.colors.background.secondary};
`;

export const MainContent = styled(PageContent)`
  padding-bottom: calc(
    ${tokens.sizes.button.heightLarge} * 2 + ${tokens.sizes.navigation.height} +
      ${tokens.spacing.large}
  ); /* ButtonContainer 높이 + TabBar 높이 여유분 */
`;

/* === 이체 폼 섹션 === */
export const TransferForm = styled.div`
  background-color: ${tokens.colors.background.primary};
  padding: ${tokens.spacing[6]};
  margin-bottom: ${tokens.spacing[2]};
`;

export const InputWithButton = styled.div`
  position: relative;
`;

export const CameraButton = styled.button`
  position: absolute;
  right: ${tokens.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: ${tokens.spacing[2]};
  cursor: pointer;
  border-radius: ${tokens.borderRadius.medium};
  transition: background-color ${duration.fast} ${easing.easeInOut};

  &:hover {
    background-color: ${tokens.colors.brand.light};
  }

  &:active {
    background-color: ${tokens.colors.brand.light};
  }

  img {
    width: ${tokens.sizes.icon.medium};
    height: ${tokens.sizes.icon.medium};
  }
`;

export const AmountInput = styled(FormInput)`
  text-align: right;
  font-size: ${tokens.typography.fontSize.titleLarge};
  font-weight: ${tokens.typography.fontWeight.semibold};
  letter-spacing: ${tokens.typography.letterSpacing.titleLarge};
`;

/* === 보내는 계좌 섹션 === */
export const FromAccountSection = styled.div`
  background-color: ${tokens.colors.background.primary};
  padding: ${tokens.spacing[6]};
  margin-bottom: ${tokens.spacing[2]};
`;

export const SectionTitle = styled.h2`
  font-size: ${tokens.typography.fontSize.titleSmall};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.text.primary};
  margin: 0 0 ${tokens.spacing[4]} 0;
`;

export const AccountInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[3]};
  padding: ${tokens.spacing[4]};
  background-color: ${tokens.colors.background.secondary};
  border-radius: ${tokens.borderRadius.large};
  border: 1px solid ${tokens.colors.border.primary};
`;

export const AccountIcon = styled.div`
  width: ${tokens.sizes.button.heightMedium};
  height: ${tokens.sizes.button.heightMedium};
  background-color: #ffffff;
  border-radius: ${tokens.borderRadius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${tokens.shadows.elevation1};

  img {
    width: ${tokens.sizes.icon.medium};
    height: ${tokens.sizes.icon.medium};
    object-fit: contain;
  }
`;

export const AccountDetail = styled.div`
  flex: 1;
`;

export const AccountName = styled.div`
  font-size: ${tokens.typography.fontSize.bodyMedium};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.text.primary};
  margin-bottom: ${tokens.spacing[1]};
`;

export const AccountNumber = styled.div`
  font-size: ${tokens.typography.fontSize.bodySmall};
  color: ${tokens.colors.text.tertiary};
  font-family: ${tokens.typography.fontFamily.monospace};
`;

export const AccountBalance = styled.div`
  font-size: ${tokens.typography.fontSize.bodyLarge};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.text.primary};
`;

/* === 빠른 금액 버튼 === */
export const QuickAmountSection = styled.div`
  display: flex;
  gap: ${tokens.spacing[2]};
  margin-top: ${tokens.spacing[3]};
`;

export const QuickButton = styled.button`
  flex: 1;
  height: calc(${tokens.sizes.button.heightMedium} - ${tokens.spacing[1]});
  border: 1px solid ${tokens.colors.border.primary};
  border-radius: ${tokens.borderRadius.medium};
  background: ${tokens.colors.background.primary};
  color: ${tokens.colors.text.tertiary};
  font-size: ${tokens.typography.fontSize.bodySmall};
  font-weight: ${tokens.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${duration.fast} ${easing.easeInOut};

  &:hover {
    border-color: ${tokens.colors.brand.primary};
    color: ${tokens.colors.text.primary};
  }

  &:active {
    background-color: ${tokens.colors.brand.light};
  }
`;

/* === 이체 확인 섹션 === */
export const ConfirmSection = styled.div`
  background-color: ${tokens.colors.background.primary};
  padding: 24px;
  margin-bottom: 8px;
`;

export const ConfirmRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${tokens.spacing.medium} 0;
  border-bottom: 1px solid ${tokens.colors.border.light};

  &:last-child {
    border-bottom: none;
  }
`;

export const ConfirmLabel = styled.span`
  font-size: ${tokens.typography.fontSize.bodyMedium};
  color: ${tokens.colors.text.tertiary};
`;

export const ConfirmValue = styled.span`
  font-size: ${tokens.typography.fontSize.bodyMedium};
  color: ${tokens.colors.text.primary};
  font-weight: 600;
`;

export const TotalAmountDisplay = styled.div`
  font-size: ${tokens.typography.fontSize.headlineMedium};
  font-weight: ${tokens.typography.fontWeight.bold};
  color: ${tokens.colors.text.primary};
  text-align: center;
  margin: ${tokens.spacing.large} 0;
  padding: ${tokens.spacing.large};
  background-color: ${tokens.colors.background.secondary};
  border-radius: ${tokens.borderRadius.large};
`;

/* === 하단 버튼 === */
export const ButtonContainer = styled(FixedBottomButtonArea)`
  /* FixedBottomButtonArea 이미 필요한 스타일 포함 */
`;

export const TransferButton = styled.button`
  width: 100%;
  height: ${tokens.sizes.button.heightLarge};
  background-color: ${tokens.colors.brand.primary};
  border: none;
  border-radius: ${tokens.borderRadius.medium};
  font-size: ${tokens.typography.fontSize.bodyLarge};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.text.primary};
  cursor: pointer;

  &:hover {
    background-color: ${tokens.colors.brand.light};
  }

  &:active {
    background-color: ${tokens.colors.brand.dark};
  }

  &:disabled {
    background-color: ${tokens.colors.border.tertiary};
    color: ${tokens.colors.text.disabled};
    cursor: not-allowed;
  }
`;

/* === 완료 화면 === */
export const CompletionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: calc(${tokens.spacing.xxl} + ${tokens.spacing.medium}) ${tokens.spacing.xl};
  background-color: ${tokens.colors.background.primary};
  margin: ${tokens.spacing.xl} ${tokens.spacing.large};
  border-radius: ${tokens.borderRadius.large};
`;

export const CompletionIcon = styled.div`
  width: calc(${tokens.sizes.avatar.large} + ${tokens.spacing.medium});
  height: calc(${tokens.sizes.avatar.large} + ${tokens.spacing.medium});
  background-color: ${tokens.colors.brand.primary};
  border-radius: ${tokens.borderRadius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${tokens.spacing.large};
  font-size: ${tokens.typography.fontSize.headlineMedium};
`;

export const CompletionTitle = styled.h2`
  font-size: ${tokens.typography.fontSize.titleLarge};
  font-weight: ${tokens.typography.fontWeight.bold};
  color: ${tokens.colors.text.primary};
  margin: 0 0 ${tokens.spacing.medium} 0;
`;

export const CompletionMessage = styled.p`
  font-size: ${tokens.typography.fontSize.bodyLarge};
  color: ${tokens.colors.text.tertiary};
  margin: 0;
  line-height: 1.5;
`;

/* === 은행 선택 모달 === */
export const BankModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: ${tokens.app.maxWidth};
  height: 100vh;
  background-color: ${tokens.colors.backdrop.medium};
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  animation: overlayFadeIn 0.3s ease-out;

  @keyframes overlayFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const BankModalContainer = styled.div`
  background: white;
  width: 100%;
  max-width: ${tokens.app.maxWidth};
  max-height: 88vh;
  border-radius: ${tokens.sizes.bottomSheet.cornerRadius} ${tokens.sizes.bottomSheet.cornerRadius} 0
    0;
  padding: 0;
  display: flex;
  flex-direction: column;
  animation: modalSlideUp 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: ${tokens.shadows.elevation3};
  overflow: hidden;

  @keyframes modalSlideUp {
    from {
      transform: translateY(100%);
      opacity: 0.8;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

export const BankModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${tokens.spacing.large} ${tokens.spacing.large} ${tokens.spacing.medium};
  border-bottom: 1px solid ${tokens.colors.border.light};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: ${tokens.spacing.small};
    left: 50%;
    transform: translateX(-50%);
    width: calc(${tokens.spacing.large} + ${tokens.spacing.medium});
    height: ${tokens.spacing.micro};
    background-color: ${tokens.colors.border.light};
    border-radius: ${tokens.borderRadius.small};
  }
`;

export const BankModalTitle = styled.h3`
  font-size: ${tokens.typography.fontSize.titleLarge};
  font-weight: ${tokens.typography.fontWeight.bold};
  color: ${tokens.colors.text.primary};
  margin: 0;
  letter-spacing: ${tokens.typography.letterSpacing.titleLarge};
`;

export const BankModalCloseButton = styled.button`
  background: none;
  border: none;
  font-size: calc(${tokens.typography.fontSize.headlineMedium} + ${tokens.spacing.micro});
  color: ${tokens.colors.text.disabled};
  cursor: pointer;
  padding: ${tokens.spacing.small};
  border-radius: ${tokens.borderRadius.round};
  width: ${tokens.sizes.button.heightMedium};
  height: ${tokens.sizes.button.heightMedium};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: ${tokens.colors.text.primary};
    background: ${tokens.colors.background.secondary};
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const BankSearchContainer = styled.div`
  padding: ${tokens.spacing.medium} ${tokens.spacing.large} ${tokens.spacing.large};
  background: ${tokens.colors.background.tertiary};
`;

export const BankSearchInput = styled.input`
  width: 100%;
  height: ${tokens.sizes.input.heightLarge};
  border: 2px solid ${tokens.colors.border.primary};
  border-radius: ${tokens.borderRadius.xl};
  padding: 0 ${tokens.spacing.large};
  font-size: ${tokens.typography.fontSize.bodyLarge};
  background: white;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${tokens.colors.brand.primary};
    box-shadow: 0 0 0 3px ${tokens.colors.brand.light};
    background: white;
  }

  &::placeholder {
    color: ${tokens.colors.text.disabled};
    font-weight: 400;
  }
`;

export const BankListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background: white;
  padding: ${tokens.spacing.medium};

  &::-webkit-scrollbar {
    width: calc(${tokens.spacing.small} - ${tokens.spacing.micro});
  }

  &::-webkit-scrollbar-track {
    background: ${tokens.colors.background.secondary};
    border-radius: calc(${tokens.borderRadius.small} + 1px);
  }

  &::-webkit-scrollbar-thumb {
    background: ${tokens.colors.border.secondary};
    border-radius: calc(${tokens.borderRadius.small} + 1px);

    &:hover {
      background: ${tokens.colors.text.disabled};
    }
  }
`;

export const BankSectionTitle = styled.div`
  padding: ${tokens.spacing.medium} 0 ${tokens.spacing.medium};
  font-size: ${tokens.typography.fontSize.titleMedium};
  font-weight: ${tokens.typography.fontWeight.bold};
  color: ${tokens.colors.text.primary};
  letter-spacing: ${tokens.typography.letterSpacing.titleMedium};
  margin-bottom: ${tokens.spacing.small};

  &:first-child {
    padding-top: 0;
  }

  &:not(:first-child) {
    margin-top: ${tokens.spacing.large};
    padding-top: ${tokens.spacing.large};
    border-top: 2px solid ${tokens.colors.background.secondary};
  }
`;

export const BankItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: ${tokens.spacing.medium} ${tokens.spacing.large};
  border: none;
  border-bottom: 1px solid ${tokens.colors.border.primary};
  background: white;
  cursor: pointer;
  transition: background-color 0.1s ease;
  text-align: left;

  &:hover {
    background-color: ${tokens.colors.background.secondary};
  }

  &:active {
    background-color: ${tokens.colors.background.surfaceVariant};
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const BankName = styled.span`
  font-size: ${tokens.typography.fontSize.bodyLarge};
  color: ${tokens.colors.text.primary};
  font-weight: ${tokens.typography.fontWeight.regular};
  letter-spacing: ${tokens.typography.letterSpacing.titleMedium};
`;

export const BankSelectableInput = styled(FormInput)`
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${tokens.colors.brand.primary};
  }
`;
