/**
 * KB 스타뱅킹 에러 메시지 디자인 컴포넌트
 * 사용자 친화적이고 명확한 에러 피드백 제공
 */

import React, { useEffect, useState } from 'react';

import styled, { keyframes, css } from 'styled-components';

import { kbTimings, kbShadows } from '../../../styles/KBMicroDetails';
import { tokens } from '../../../styles/tokens';

import { MicroVibration } from './MicroVibration';

// 에러 메시지 타입
export type ErrorType = 'error' | 'warning' | 'info' | 'success';

// 슬라이드 인 애니메이션
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

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// 아이콘 회전 애니메이션
const iconPulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
`;

// 에러 타입별 색상
const errorColors = {
  error: {
    background: '#FFF5F5',
    border: '#FFE0E0',
    text: '#D32F2F',
    icon: '#F44336',
  },
  warning: {
    background: '#FFFAF0',
    border: '#FFE5B4',
    text: '#F57C00',
    icon: '#FF9800',
  },
  info: {
    background: '#F0F7FF',
    border: '#D0E5FF',
    text: '#1976D2',
    icon: '#2196F3',
  },
  success: {
    background: '#F0FFF4',
    border: '#D0F5E0',
    text: '#388E3C',
    icon: '#4CAF50',
  },
};

// 토스트 메시지 컨테이너
const ToastContainer = styled.div<{ $type: ErrorType; $isVisible: boolean }>`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 350px;
  width: calc(100% - 40px);
  padding: 16px;
  background: ${props => errorColors[props.$type].background};
  border: 1px solid ${props => errorColors[props.$type].border};
  border-radius: 12px;
  box-shadow: ${kbShadows.floating};
  display: flex;
  align-items: flex-start;
  gap: 12px;
  z-index: 1000;
  animation: ${props => (props.$isVisible ? slideIn : '')} ${kbTimings.normal} ${kbTimings.easeOut};
  opacity: ${props => (props.$isVisible ? 1 : 0)};
  transition: opacity ${kbTimings.fast} ${kbTimings.easeIn};
`;

const ToastIcon = styled.div<{ $type: ErrorType }>`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: ${props => errorColors[props.$type].icon};
  animation: ${iconPulse} 1s ease-in-out;
`;

const ToastContent = styled.div`
  flex: 1;
`;

const ToastTitle = styled.div<{ $type: ErrorType }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => errorColors[props.$type].text};
  margin-bottom: 4px;
  letter-spacing: -0.2px;
`;

const ToastMessage = styled.div`
  font-size: 13px;
  font-weight: 400;
  color: #666;
  line-height: 1.5;
`;

const ToastClose = styled.button`
  width: 20px;
  height: 20px;
  padding: 0;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all ${kbTimings.fast} ${kbTimings.easeOut};

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #666;
  }
`;

// 인라인 에러 메시지
const InlineErrorContainer = styled.div<{ $type: ErrorType }>`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: ${props => errorColors[props.$type].background};
  border: 1px solid ${props => errorColors[props.$type].border};
  border-radius: 8px;
  margin: 8px 0;
  animation: ${fadeIn} ${kbTimings.fast} ${kbTimings.easeOut};
`;

const InlineErrorIcon = styled.div<{ $type: ErrorType }>`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: ${props => errorColors[props.$type].icon};
`;

const InlineErrorText = styled.div<{ $type: ErrorType }>`
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: ${props => errorColors[props.$type].text};
  line-height: 1.4;
`;

// 필드 에러 메시지
const FieldErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 12px;
  color: #d32f2f;
  animation: ${fadeIn} ${kbTimings.fast} ${kbTimings.easeOut};
`;

// 에러 아이콘 SVG 컴포넌트
const ErrorIcon = () => (
  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
    <path d='M12 7V12' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
    <circle cx='12' cy='16' r='1' fill='currentColor' />
  </svg>
);

const WarningIcon = () => (
  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path d='M12 3L2 21H22L12 3Z' stroke='currentColor' strokeWidth='2' strokeLinejoin='round' />
    <path d='M12 9V14' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
    <circle cx='12' cy='17' r='1' fill='currentColor' />
  </svg>
);

const InfoIcon = () => (
  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
    <path d='M12 11V16' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
    <circle cx='12' cy='8' r='1' fill='currentColor' />
  </svg>
);

const SuccessIcon = () => (
  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
    <path
      d='M8 12L11 15L16 9'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const CloseIcon = () => (
  <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path d='M12 4L4 12M4 4L12 12' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
  </svg>
);

const icons = {
  error: <ErrorIcon />,
  warning: <WarningIcon />,
  info: <InfoIcon />,
  success: <SuccessIcon />,
};

// 토스트 메시지 컴포넌트
interface ToastMessageProps {
  type?: ErrorType;
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

export const ToastMessage: React.FC<ToastMessageProps> = ({
  type = 'error',
  title,
  message,
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  return (
    <MicroVibration trigger={true} intensity={type === 'error' ? 'error' : 'soft'}>
      <ToastContainer $type={type} $isVisible={isVisible}>
        <ToastIcon $type={type}>{icons[type]}</ToastIcon>
        <ToastContent>
          {title && <ToastTitle $type={type}>{title}</ToastTitle>}
          <ToastMessage>{message}</ToastMessage>
        </ToastContent>
        <ToastClose onClick={handleClose}>
          <CloseIcon />
        </ToastClose>
      </ToastContainer>
    </MicroVibration>
  );
};

// 인라인 에러 메시지 컴포넌트
interface InlineErrorProps {
  type?: ErrorType;
  message: string;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({ type = 'error', message, className }) => (
  <InlineErrorContainer $type={type} className={className}>
    <InlineErrorIcon $type={type}>
      {type === 'error' ? '⚠️' : type === 'warning' ? '⚡' : type === 'info' ? 'ℹ️' : '✓'}
    </InlineErrorIcon>
    <InlineErrorText $type={type}>{message}</InlineErrorText>
  </InlineErrorContainer>
);

// 필드 에러 메시지 컴포넌트
interface FieldErrorProps {
  message: string;
  className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ message, className }) => (
  <FieldErrorMessage className={className}>
    <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='6' cy='6' r='5' stroke='currentColor' strokeWidth='1.5' />
      <path d='M6 3.5V6' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
      <circle cx='6' cy='8' r='0.5' fill='currentColor' />
    </svg>
    {message}
  </FieldErrorMessage>
);

// 에러 페이지 컴포넌트
const ErrorPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
  text-align: center;
`;

const ErrorPageIcon = styled.div`
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  color: #ff5252;
`;

const ErrorPageTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${tokens.colors.text.primary};
  margin-bottom: 12px;
`;

const ErrorPageMessage = styled.p`
  font-size: 14px;
  color: ${tokens.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 24px;
  max-width: 300px;
`;

const ErrorPageAction = styled.button`
  padding: 12px 24px;
  background: ${tokens.colors.brand.primary};
  color: ${tokens.colors.text.primary};
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all ${kbTimings.fast} ${kbTimings.easeOut};

  &:hover {
    background: ${tokens.colors.brand.dark};
    transform: translateY(-1px);
  }
`;

interface ErrorPageProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  title = '오류가 발생했습니다',
  message = '잠시 후 다시 시도해주세요.',
  actionLabel = '다시 시도',
  onAction,
}) => (
  <ErrorPageContainer>
    <ErrorPageIcon>
      <svg
        width='80'
        height='80'
        viewBox='0 0 80 80'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <circle cx='40' cy='40' r='35' stroke='currentColor' strokeWidth='3' />
        <path d='M40 25V45' stroke='currentColor' strokeWidth='3' strokeLinecap='round' />
        <circle cx='40' cy='55' r='3' fill='currentColor' />
      </svg>
    </ErrorPageIcon>
    <ErrorPageTitle>{title}</ErrorPageTitle>
    <ErrorPageMessage>{message}</ErrorPageMessage>
    {actionLabel && onAction && <ErrorPageAction onClick={onAction}>{actionLabel}</ErrorPageAction>}
  </ErrorPageContainer>
);
