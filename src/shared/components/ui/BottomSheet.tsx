/**
 * KB 스타뱅킹 통합 BottomSheet 컴포넌트
 * 기본 BottomSheet + 고급 제스처 기능 통합
 */

import React, { useEffect, useRef, useState } from 'react';

import { createPortal } from 'react-dom';

import styled, { keyframes, css } from 'styled-components';

import { dimensions } from '../../../styles/dimensions';
import { tokens } from '../../../styles/tokens';
import { KBDesignSystem } from '../../../styles/tokens/kb-design-system';

// BottomSheet Props 타입 정의
export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: 'auto' | 'full' | string | number;
  title?: string;
  showHandle?: boolean;
  showSlideBar?: boolean;
  variant?: 'default' | 'kb' | 'native';
  closeOnBackdrop?: boolean;
  closeOnSwipeDown?: boolean;
  usePortal?: boolean;
}

// 애니메이션 키프레임
const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideDown = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

// 배경 오버레이
const Overlay = styled.div<{ $isOpen: boolean; $variant: string; $isClosing: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => 
    props.$variant === 'kb' || props.$variant === 'default'
      ? tokens.colors.dimmedBackground 
      : KBDesignSystem.colors.overlay.black50
  };
  z-index: ${props => 
    props.$variant === 'native' 
      ? KBDesignSystem.zIndex.modalBackdrop 
      : 1000
  };
  
  ${props => {
    if (props.$variant === 'native') {
      return `
        animation: ${props.$isClosing ? fadeOut : fadeIn} 
          ${KBDesignSystem.animation.duration.fast} 
          ${KBDesignSystem.animation.easing.easeOut};
      `;
    }
    
    return `
      opacity: ${props.$isOpen ? 1 : 0};
      visibility: ${props.$isOpen ? 'visible' : 'hidden'};
      transition: opacity 0.3s ease, visibility 0.3s ease;
    `;
  }}
  
  ${props => (props.$variant === 'kb' || props.$variant === 'default') && `
    max-width: 390px;
    margin: 0 auto;
  `}
`;

// BottomSheet 컨테이너
const BottomSheetContainer = styled.div<{ 
  $isOpen: boolean;
  $height?: string | number;
  $variant: string;
  $isClosing: boolean;
}>`
  position: fixed;
  bottom: 0;
  background-color: ${props => 
    props.$variant === 'native' 
      ? KBDesignSystem.colors.background.white 
      : tokens.colors.background.primary
  };
  overflow: hidden;
  z-index: ${props => 
    props.$variant === 'native' 
      ? KBDesignSystem.zIndex.modal 
      : 1001
  };
  
  ${props => {
    if (props.$variant === 'native') {
      return `
        left: 0;
        right: 0;
        border-radius: ${KBDesignSystem.borderRadius.modal} ${KBDesignSystem.borderRadius.modal} 0 0;
        box-shadow: ${KBDesignSystem.shadows.bottomSheet};
        padding-bottom: env(safe-area-inset-bottom);
        touch-action: pan-y;
        -webkit-overflow-scrolling: touch;
        
        animation: ${props.$isClosing ? slideDown : slideUp} 
          ${KBDesignSystem.animation.duration.normal} 
          ${KBDesignSystem.animation.easing.decelerate};
      `;
    }
    
    return `
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: 390px;
      border-radius: ${dimensions.bottomSheet.cornerRadius}px ${dimensions.bottomSheet.cornerRadius}px 0 0;
      box-shadow: 
        0px -8px 10px -5px rgba(0, 0, 0, 0.2),
        0px -16px 24px 2px rgba(0, 0, 0, 0.14),
        0px -6px 30px 5px rgba(0, 0, 0, 0.12);
      
      animation: ${props.$isOpen ? slideUp : slideDown} 0.3s ease-out;
      animation-fill-mode: forwards;
    `;
  }}
  
  /* 높이 설정 */
  ${props => {
    const height = props.$height;
    if (height === 'auto') {
      return css`
        max-height: 90vh;
      `;
    } else if (height === 'full') {
      return css`
        height: 100vh;
        padding-top: env(safe-area-inset-top);
      `;
    } else if (typeof height === 'number') {
      return css`
        height: ${height}px;
        max-height: 90vh;
      `;
    } else if (typeof height === 'string') {
      return css`
        height: ${height};
        max-height: 90vh;
      `;
    } else {
      return css`
        max-height: 90vh;
      `;
    }
  }}
`;

// 드래그 핸들/슬라이드바
const DragHandle = styled.div<{ $variant: string }>`
  display: flex;
  justify-content: center;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
  
  ${props => {
    if (props.$variant === 'native') {
      return `
        padding: ${KBDesignSystem.spacing.sm} 0;
      `;
    }
    
    return `
      padding: ${dimensions.bottomSheet.slideBarTopMargin}px 0 0;
    `;
  }}
`;

const HandleBar = styled.div<{ $variant: string }>`
  ${props => {
    if (props.$variant === 'native') {
      return `
        width: 48px;
        height: 4px;
        background-color: ${KBDesignSystem.colors.border.medium};
        border-radius: ${KBDesignSystem.borderRadius.full};
      `;
    }
    
    return `
      width: ${dimensions.bottomSheet.slideBarWidth}px;
      height: ${dimensions.bottomSheet.slideBarHeight}px;
      background-color: ${tokens.colors.border.primary};
      border-radius: 2px;
    `;
  }}
`;

// 헤더
const Header = styled.div<{ $variant: string }>`
  ${props => {
    if (props.$variant === 'native') {
      return `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: ${KBDesignSystem.spacing.base} ${KBDesignSystem.spacing.lg};
        border-bottom: 1px solid ${KBDesignSystem.colors.border.light};
      `;
    }
    
    return `
      padding: ${dimensions.bottomSheet.topPadding}px 24px 16px;
      border-bottom: 1px solid ${tokens.colors.backgroundGray2};
    `;
  }}
`;

const Title = styled.h2<{ $variant: string }>`
  margin: 0;
  color: ${props => 
    props.$variant === 'native' 
      ? KBDesignSystem.colors.text.primary 
      : tokens.colors.text.primary
  };
  
  ${props => {
    if (props.$variant === 'native') {
      return `
        font-size: ${KBDesignSystem.typography.fontSize.lg};
        font-weight: ${KBDesignSystem.typography.fontWeight.semibold};
      `;
    }
    
    return `
      font-size: 20px;
      font-family: 'KBFG-Text-Bold', sans-serif;
      font-weight: 700;
      text-align: center;
      letter-spacing: -0.02em;
    `;
  }}
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  color: ${KBDesignSystem.colors.text.secondary};
  border-radius: ${KBDesignSystem.borderRadius.full};
  transition: all ${KBDesignSystem.animation.duration.fast} ${KBDesignSystem.animation.easing.easeOut};
  
  &:hover {
    background-color: ${KBDesignSystem.colors.background.gray200};
  }
  
  &:active {
    transform: scale(0.9);
  }
`;

// 콘텐츠 영역
const Content = styled.div<{ $hasHeader: boolean; $variant: string }>`
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  
  ${props => {
    if (props.$variant === 'native' && props.$hasHeader) {
      return `
        max-height: calc(90vh - 60px);
      `;
    }
    
    return '';
  }}
`;

// X 아이콘 컴포넌트
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

// 메인 BottomSheet 컴포넌트
const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  height = 'auto',
  title,
  showHandle = true,
  showSlideBar = true,
  variant = 'default',
  closeOnBackdrop = true,
  closeOnSwipeDown = true,
  usePortal = false,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 실제 표시할 핸들 결정
  const shouldShowHandle = variant === 'native' ? showHandle : showSlideBar;
  
  // 닫기 처리
  const handleClose = () => {
    if (variant === 'native') {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, KBDesignSystem.animation.duration.normal as unknown as number);
    } else {
      onClose();
    }
  };
  
  // 배경 클릭
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      handleClose();
    }
  };
  
  // 스와이프 다운 시작
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!closeOnSwipeDown || variant !== 'native') return;
    
    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setDragStartY(startY);
    setCurrentY(0);
  };
  
  // 스와이프 중
  const handleDragMove = (e: TouchEvent | MouseEvent) => {
    if (!isDragging || !closeOnSwipeDown || variant !== 'native') return;
    
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = y - dragStartY;
    
    if (deltaY > 0) {
      setCurrentY(deltaY);
      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(${deltaY}px)`;
      }
    }
  };
  
  // 스와이프 끝
  const handleDragEnd = () => {
    if (!isDragging || !closeOnSwipeDown || variant !== 'native') return;
    
    setIsDragging(false);
    
    // 100px 이상 드래그하면 닫기
    if (currentY > 100) {
      handleClose();
    } else {
      // 원위치로 복귀
      if (containerRef.current) {
        containerRef.current.style.transition = `transform ${KBDesignSystem.animation.duration.fast} ${KBDesignSystem.animation.easing.easeOut}`;
        containerRef.current.style.transform = 'translateY(0)';
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.transition = '';
          }
        }, 150);
      }
    }
    
    setCurrentY(0);
  };
  
  // 드래그 이벤트 리스너 등록
  useEffect(() => {
    if (isDragging && variant === 'native') {
      const handleMove = (e: TouchEvent | MouseEvent) => handleDragMove(e);
      const handleEnd = () => handleDragEnd();
      
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('touchend', handleEnd);
      document.addEventListener('mouseup', handleEnd);
      
      return () => {
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('touchend', handleEnd);
        document.removeEventListener('mouseup', handleEnd);
      };
    }
    return () => {}; // Return empty cleanup function when not dragging
  }, [isDragging, dragStartY, currentY, variant]);
  
  // ESC 키 이벤트
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // 바디 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen && !isClosing) return null;
  
  const content = (
    <>
      <Overlay 
        $isOpen={isOpen} 
        $variant={variant}
        $isClosing={isClosing}
        onClick={handleOverlayClick}
      />
      <BottomSheetContainer
        ref={containerRef}
        $isOpen={isOpen}
        $height={height}
        $variant={variant}
        $isClosing={isClosing}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottomsheet-title' : undefined}
      >
        {/* 드래그 핸들/슬라이드바 */}
        {shouldShowHandle && (
          <DragHandle
            $variant={variant}
            onTouchStart={handleDragStart}
            onMouseDown={handleDragStart}
          >
            <HandleBar $variant={variant} />
          </DragHandle>
        )}
        
        {/* 헤더 */}
        {title && (
          <Header $variant={variant}>
            <Title id="bottomsheet-title" $variant={variant}>{title}</Title>
            {variant === 'native' && (
              <CloseButton onClick={handleClose} aria-label="닫기">
                <CloseIcon />
              </CloseButton>
            )}
          </Header>
        )}
        
        {/* 콘텐츠 */}
        <Content $hasHeader={Boolean(title)} $variant={variant}>
          {children}
        </Content>
      </BottomSheetContainer>
    </>
  );
  
  // Portal 사용 여부에 따라 렌더링
  if (usePortal && variant === 'native') {
    return createPortal(content, document.body);
  }
  
  return content;
};

// 기본 내보내기
export default BottomSheet;