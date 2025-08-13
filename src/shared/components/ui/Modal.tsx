/**
 * KB 스타뱅킹 통합 Modal 컴포넌트
 * 모든 Modal 기능을 variant로 통합
 */

import React, { useEffect } from 'react';

import styled, { keyframes, css } from 'styled-components';

import { duration, easing } from '../../../styles/animations';
import { dimensions } from '../../../styles/dimensions';
import { tokens } from '../../../styles/tokens';
import { KBDesignSystem } from '../../../styles/tokens/kb-design-system';
import { typography } from '../../../styles/typography';

// Modal Props 타입 정의
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  footerActions?: React.ReactNode;
  variant?: 'default' | 'kb' | 'dialog' | 'fullscreen';
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showBackButton?: boolean;
  onBackClick?: () => void;
  closeOnBackdrop?: boolean;
}

// 애니메이션 키프레임
const slideUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const scaleIn = keyframes`
  from {
    transform: scale(0.95) translateY(30px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
`;

const checkAnimation = keyframes`
  0% {
    stroke-dashoffset: 100;
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

// 모달 오버레이 (배경)
const ModalOverlay = styled.div<{ $isOpen: boolean; $variant: string }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => 
    props.$variant === 'kb' 
      ? tokens.colors.dimmedBackground 
      : 'rgba(0, 0, 0, 0.5)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${KBDesignSystem.zIndex.modalBackdrop};
  padding: ${props => props.$variant === 'fullscreen' ? '0' : '16px'};
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: opacity ${duration.normal} ${easing.easeOut},
              visibility ${duration.normal} ${easing.easeOut};
  
  ${props => props.$variant === 'kb' && `
    max-width: 390px;
    margin: 0 auto;
  `}
`;

// 모달 컨테이너 (카드)
const ModalContainer = styled.div<{ 
  $isOpen: boolean; 
  $variant: string;
  $size: string;
  $maxWidth?: string;
}>`
  background: ${tokens.colors.background.primary};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  
  ${props => {
    // KB 스타일 variant
    if (props.$variant === 'kb') {
      switch (props.$size) {
        case 'small':
          return `
            border-radius: ${dimensions.borderRadius.dialog}px;
            box-shadow: ${dimensions.elevation.dialog};
            max-width: 480px;
            width: 90%;
            max-height: 60vh;
            margin: 20px;
          `;
        case 'medium':
          return `
            border-radius: ${dimensions.borderRadius.medium}px;
            box-shadow: ${dimensions.elevation.bottomSheet};
            max-width: 600px;
            width: 95%;
            max-height: 80vh;
            margin: 20px;
          `;
        case 'large':
          return `
            border-radius: ${dimensions.borderRadius.medium}px;
            box-shadow: ${dimensions.elevation.bottomSheet};
            width: 95%;
            max-width: 800px;
            max-height: 90vh;
            margin: 20px;
          `;
        case 'fullscreen':
          return `
            width: 100%;
            height: 100%;
            border-radius: 0;
            margin: 0;
          `;
        default:
          return `
            border-radius: ${dimensions.borderRadius.medium}px;
            box-shadow: ${dimensions.elevation.bottomSheet};
            max-width: 600px;
            width: 95%;
            max-height: 80vh;
            margin: 20px;
          `;
      }
    }
    
    // 다이얼로그 variant
    if (props.$variant === 'dialog') {
      return `
        border-radius: 16px;
        box-shadow: ${KBDesignSystem.shadows.xl};
        padding: 24px;
        margin: 16px;
        max-width: 400px;
        width: 100%;
        animation: ${slideUp} 0.3s ease-out;
      `;
    }
    
    // Fullscreen variant
    if (props.$variant === 'fullscreen') {
      return `
        width: 100%;
        height: 100%;
        border-radius: 0;
        margin: 0;
      `;
    }
    
    // 기본 variant
    return `
      border-radius: ${tokens.borderRadius.xl};
      box-shadow: ${tokens.shadows.modal};
      max-width: ${props.$maxWidth || '90%'};
      width: 100%;
      max-height: 90vh;
    `;
  }}
  
  transform: ${props => props.$isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(30px)'};
  opacity: ${props => props.$isOpen ? 1 : 0};
  transition: transform ${duration.normal} ${easing.easeOut},
              opacity ${duration.normal} ${easing.easeOut};
  
  @media (max-width: 768px) {
    ${props => props.$variant === 'kb' && `
      width: 100%;
      height: 100%;
      border-radius: 0;
      margin: 0;
    `}
  }
`;

// 모달 헤더
const ModalHeader = styled.div<{ $variant: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  
  ${props => {
    if (props.$variant === 'kb') {
      return `
        padding: 20px 24px;
        border-bottom: 1px solid ${tokens.colors.backgroundGray2};
        background-color: ${tokens.colors.background.primary};
        min-height: 64px;
      `;
    }
    
    if (props.$variant === 'dialog') {
      return `
        padding: 0 0 ${tokens.spacing[4]} 0;
        text-align: center;
      `;
    }
    
    return `
      padding: ${tokens.spacing[6]} ${tokens.spacing[6]} ${tokens.spacing[4]};
      border-bottom: 1px solid ${tokens.colors.border.light};
    `;
  }}
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${tokens.colors.text.primary};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${tokens.colors.backgroundGray1};
  }
  
  &::before {
    content: '←';
    font-size: 18px;
    line-height: 1;
  }
`;

// 모달 제목
const ModalTitle = styled.h2<{ $variant: string }>`
  margin: 0;
  color: ${tokens.colors.text.primary};
  
  ${props => {
    if (props.$variant === 'kb') {
      return `
        font-family: ${typography.fontFamily.kbfgTextBold};
        font-size: 18px;
        font-weight: 700;
        line-height: 1.4;
      `;
    }
    
    if (props.$variant === 'dialog') {
      return `
        font-size: ${tokens.typography.fontSize.xl};
        font-weight: ${tokens.typography.fontWeight.semibold};
        text-align: center;
      `;
    }
    
    return `
      font-size: ${tokens.typography.fontSize.xl};
      font-weight: ${tokens.typography.fontWeight.semibold};
      text-align: center;
    `;
  }}
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button<{ $variant: string }>`
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  ${props => {
    if (props.$variant === 'kb') {
      return `
        color: ${tokens.colors.text.tertiary};
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
    }
    
    return `
      color: ${tokens.colors.text.secondary};
      &:hover {
        background-color: ${KBDesignSystem.colors.background.gray200};
      }
      &:active {
        transform: scale(0.9);
      }
    `;
  }}
`;

// 모달 콘텐츠
const ModalContent = styled.div<{ $variant: string }>`
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  
  ${props => {
    if (props.$variant === 'kb') {
      return `
        padding: 24px;
        &::-webkit-scrollbar {
          width: 6px;
        }
        &::-webkit-scrollbar-track {
          background: ${tokens.colors.backgroundGray1};
          border-radius: 3px;
        }
        &::-webkit-scrollbar-thumb {
          background: ${tokens.colors.border.light};
          border-radius: 3px;
          &:hover {
            background: ${tokens.colors.text.tertiary};
          }
        }
      `;
    }
    
    if (props.$variant === 'dialog') {
      return `
        padding: 0;
        text-align: center;
      `;
    }
    
    return `
      padding: ${tokens.spacing[6]};
      &::-webkit-scrollbar {
        width: 4px;
      }
      &::-webkit-scrollbar-track {
        background: ${tokens.colors.background.secondary};
        border-radius: ${tokens.borderRadius.full};
      }
      &::-webkit-scrollbar-thumb {
        background: ${tokens.colors.border.secondary};
        border-radius: ${tokens.borderRadius.full};
      }
    `;
  }}
`;

// 모달 푸터 (버튼 영역)
const ModalFooter = styled.div<{ $variant: string }>`
  flex-shrink: 0;
  
  ${props => {
    if (props.$variant === 'kb') {
      return `
        padding: 16px 24px 24px;
        border-top: 1px solid ${tokens.colors.backgroundGray2};
        background-color: ${tokens.colors.background.primary};
      `;
    }
    
    if (props.$variant === 'dialog') {
      return `
        padding: ${tokens.spacing[4]} 0 0;
        display: flex;
        gap: ${tokens.spacing[3]};
        justify-content: center;
      `;
    }
    
    return `
      padding: ${tokens.spacing[4]} ${tokens.spacing[6]} ${tokens.spacing[6]};
      border-top: 1px solid ${tokens.colors.border.light};
      display: flex;
      gap: ${tokens.spacing[3]};
    `;
  }}
`;

// X 아이콘 컴포넌트
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

// 다이얼로그 레이아웃
export const DialogContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

// 성공 체크 아이콘 애니메이션
export const AnimatedCheckIcon = styled.svg`
  width: 40px;
  height: 40px;
  
  path {
    stroke: ${tokens.colors.text.primary};
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: ${checkAnimation} 0.6s ease-out forwards;
    animation-delay: 0.2s;
  }
`;

// 스크롤 가능한 컨테이너
export const ScrollableContent = styled.div<{ $maxHeight?: string }>`
  max-height: ${props => props.$maxHeight || '300px'};
  overflow-y: auto;
  padding-right: ${tokens.spacing[2]};
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${tokens.colors.background.secondary};
    border-radius: ${tokens.borderRadius.full};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${tokens.colors.border.secondary};
    border-radius: ${tokens.borderRadius.full};
  }
`;

// 메인 Modal 컴포넌트
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  headerActions,
  footerActions,
  variant = 'default',
  size = 'medium',
  showBackButton = false,
  onBackClick,
  closeOnBackdrop = true,
}) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      onClose();
    }
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // 모달 오픈 시 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <ModalOverlay $isOpen={isOpen} $variant={variant} onClick={handleOverlayClick}>
      <ModalContainer $isOpen={isOpen} $variant={variant} $size={size}>
        {title && (
          <ModalHeader $variant={variant}>
            {variant === 'kb' ? (
              <>
                <HeaderLeft>
                  {showBackButton && (
                    <BackButton onClick={handleBackClick} />
                  )}
                  <ModalTitle $variant={variant}>{title}</ModalTitle>
                </HeaderLeft>
                <HeaderActions>
                  {headerActions}
                  <CloseButton $variant={variant} onClick={onClose}>
                    ×
                  </CloseButton>
                </HeaderActions>
              </>
            ) : (
              <>
                <ModalTitle $variant={variant}>{title}</ModalTitle>
                <CloseButton $variant={variant} onClick={onClose}>
                  <CloseIcon />
                </CloseButton>
              </>
            )}
          </ModalHeader>
        )}
        
        <ModalContent $variant={variant}>
          {children}
        </ModalContent>
        
        {footerActions && (
          <ModalFooter $variant={variant}>
            {footerActions}
          </ModalFooter>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
};

// 모달 버튼 컴포넌트
export const ModalButton = styled.button<{ $primary?: boolean; $fullWidth?: boolean }>`
  flex: ${props => props.$fullWidth ? '1' : '0 0 auto'};
  padding: ${tokens.spacing[4]} ${tokens.spacing[6]};
  border: ${props => props.$primary ? 'none' : `1px solid ${tokens.colors.border.primary}`};
  border-radius: ${tokens.borderRadius.button};
  background: ${props => props.$primary ? tokens.colors.brand.primary : tokens.colors.white};
  color: ${props => props.$primary ? tokens.colors.text.primary : tokens.colors.text.secondary};
  font-size: ${tokens.typography.fontSize.lg};
  font-weight: ${tokens.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${tokens.animation.duration.fast} ${tokens.animation.easing.easeOut};
  
  &:hover {
    background: ${props => props.$primary ? tokens.colors.brand.primaryDark : tokens.colors.background.secondary};
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

// 기본 내보내기
export default Modal;