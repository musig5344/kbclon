import React from 'react';

import styled from 'styled-components';

import Button from '../../shared/components/ui/Button';
import { duration, easing } from '../../styles/animations';
import { dimensions } from '../../styles/dimensions';
import { tokens } from '../../styles/tokens';
// import { colors } from '../../styles/colors'; // 사용되지 않음
import { typography } from '../../styles/typography';
interface KBDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content: string;
  leftButtonText?: string;
  rightButtonText?: string;
  onLeftClick?: () => void;
  onRightClick?: () => void;
  type?: 'confirm' | 'alert' | 'warning' | 'error';
  showCloseButton?: boolean;
}
// 다이얼로그 오버레이 (dimmed_background)
const DialogOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${tokens.colors.dimmedBackground}; // #bf000000 (75% 투명도)
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  opacity: ${props => (props.$isOpen ? 1 : 0)};
  visibility: ${props => (props.$isOpen ? 'visible' : 'hidden')};
  transition:
    opacity ${duration.normal} ${easing.easeOut},
    visibility ${duration.normal} ${easing.easeOut};
  // 터치 시 닫기 방지
  touch-action: none;
`;
// KB스타뱅킹 다이얼로그 컨테이너 (MaterialCardView 스타일)
const DialogContainer = styled.div<{ $isOpen: boolean }>`
  background-color: ${tokens.colors.background.primary}; // #ffffffff
  border-radius: ${dimensions.borderRadius.dialog}px; // 2dp
  box-shadow: ${dimensions.elevation.dialog}; // 2dp elevation
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  transform: ${props => (props.$isOpen ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)')};
  opacity: ${props => (props.$isOpen ? 1 : 0)};
  transition:
    transform ${duration.normal} ${easing.easeOut},
    opacity ${duration.normal} ${easing.easeOut};
`;
// 다이얼로그 헤더
const DialogHeader = styled.div`
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid ${tokens.colors.backgroundGray2};
  position: relative;
`;
const DialogTitle = styled.h2`
  font-family: ${typography.fontFamily.kbfgTextBold};
  font-size: 18px;
  font-weight: 700;
  color: ${tokens.colors.text.primary};
  margin: 0;
  text-align: center;
  line-height: 1.4;
`;
const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${tokens.colors.text.tertiary};
  transition: all 0.2s ease;
  &:hover {
    background-color: ${tokens.colors.backgroundGray1};
    color: ${tokens.colors.text.primary};
  }
  &::before {
    content: '×';
    font-size: 24px;
    line-height: 1;
  }
`;
// 다이얼로그 본문
const DialogContent = styled.div`
  padding: 24px;
  text-align: center;
`;
const DialogText = styled.p`
  font-family: ${typography.fontFamily.kbfgTextLight};
  font-size: 16px;
  color: ${tokens.colors.text.primary};
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
`;
// 다이얼로그 버튼 영역
const DialogButtons = styled.div`
  display: flex;
  border-top: 1px solid ${tokens.colors.backgroundGray2};
`;
const DialogButtonWrapper = styled.div<{ $isLeft?: boolean }>`
  flex: 1;
  ${props =>
    !props.$isLeft &&
    `
    border-left: 1px solid ${tokens.colors.backgroundGray2};
  `}
`;
// 아이콘 컨테이너 (타입별)
const IconContainer = styled.div<{ $type: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  ${props => {
    switch (props.$type) {
      case 'warning':
        return `
          background-color: ${tokens.colors.warningLight};
          color: ${tokens.colors.warning};
        `;
      case 'error':
        return `
          background-color: ${tokens.colors.errorLight};
          color: ${tokens.colors.error};
        `;
      case 'confirm':
        return `
          background-color: ${tokens.colors.brand.light};
          color: ${tokens.colors.brand.dark};
        `;
      default:
        return `
          background-color: ${tokens.colors.backgroundGray2};
          color: ${tokens.colors.text.secondary};
        `;
    }
  }}
`;
const KBDialog: React.FC<KBDialogProps> = ({
  isOpen,
  onClose,
  title,
  content,
  leftButtonText = '취소',
  rightButtonText = '확인',
  onLeftClick,
  onRightClick,
  type = 'confirm',
  showCloseButton = false,
}) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  const handleLeftClick = () => {
    if (onLeftClick) {
      onLeftClick();
    } else {
      onClose();
    }
  };
  const handleRightClick = () => {
    if (onRightClick) {
      onRightClick();
    } else {
      onClose();
    }
  };
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      case 'confirm':
        return '?';
      default:
        return 'ℹ';
    }
  };
  const showTwoButtons = leftButtonText && rightButtonText;
  return (
    <DialogOverlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <DialogContainer $isOpen={isOpen}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {showCloseButton && <CloseButton onClick={onClose} />}
          </DialogHeader>
        )}
        <DialogContent>
          {type !== 'alert' && <IconContainer $type={type}>{getIcon()}</IconContainer>}
          <DialogText>{content}</DialogText>
        </DialogContent>
        <DialogButtons>
          {showTwoButtons ? (
            <>
              <DialogButtonWrapper $isLeft>
                <Button variant='dialog-left' onClick={handleLeftClick} fullWidth>
                  {leftButtonText}
                </Button>
              </DialogButtonWrapper>
              <DialogButtonWrapper>
                <Button variant='dialog-right' onClick={handleRightClick} fullWidth>
                  {rightButtonText}
                </Button>
              </DialogButtonWrapper>
            </>
          ) : (
            <DialogButtonWrapper>
              <Button variant='dialog-right' onClick={handleRightClick} fullWidth>
                {rightButtonText}
              </Button>
            </DialogButtonWrapper>
          )}
        </DialogButtons>
      </DialogContainer>
    </DialogOverlay>
  );
};
export default KBDialog;
