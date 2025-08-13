import React from 'react';

import styled, { keyframes } from 'styled-components';

import { tokens } from '../../../styles/tokens';
interface ErrorNotificationProps {
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}
const slideIn = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;
const Container = styled.div`
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 398px;
  background: #FFF5F5;
  border: 1px solid #FFCCCC;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: ${slideIn} 0.3s ease-out;
`;
const Icon = styled.div`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #E53E3E;
`;
const Content = styled.div`
  flex: 1;
`;
const ErrorMessage = styled.div`
  font-family: ${tokens.typography.fontFamily.medium};
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  line-height: 1.4;
`;
const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;
const ActionButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-family: ${tokens.typography.fontFamily.medium};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: none;
  }
`;
const RetryButton = styled(ActionButton)`
  background: #E53E3E;
  color: white;
  &:hover:not(:disabled) {
    background: #C53030;
  }
`;
const DismissButton = styled(ActionButton)`
  background: transparent;
  color: #666666;
  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.05);
  }
`;
export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onRetry,
  onDismiss
}) => {
  if (!error) return null;
  return (
    <Container>
      <Icon>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </Icon>
      <Content>
        <ErrorMessage>{error}</ErrorMessage>
        <Actions>
          {onRetry && (
            <RetryButton onClick={onRetry}>
              다시 시도
            </RetryButton>
          )}
          {onDismiss && (
            <DismissButton onClick={onDismiss}>
              닫기
            </DismissButton>
          )}
        </Actions>
      </Content>
    </Container>
  );
};