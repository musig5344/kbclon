import React, { useEffect, useState } from 'react';

import styled, { keyframes } from 'styled-components';

import { duration, easing } from '../../styles/animations';
import { dimensions } from '../../styles/dimensions';
import { tokens } from '../../styles/tokens';
import { typography } from '../../styles/typography';
interface KBToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  position?: 'top' | 'center' | 'bottom';
  isVisible: boolean;
  onClose: () => void;
}
// KB스타뱅킹 토스트 애니메이션 (실제 앱 분석 결과)
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;
const slideOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
`;
// 토스트 컨테이너
const ToastContainer = styled.div<{ $position: string; $isVisible: boolean }>`
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10001;
  pointer-events: none;
  ${props => {
    switch (props.$position) {
      case 'top':
        return 'top: 100px;';
      case 'center':
        return 'top: 50%; transform: translateX(-50%) translateY(-50%);';
      case 'bottom':
        return 'bottom: 140px;'; // 네비게이션 바 위
      default:
        return 'bottom: 140px;';
    }
  }}
  animation: ${props => (props.$isVisible ? slideIn : slideOut)} 
             ${duration.normal} 
             ${easing.easeOut};
`;
// KB스타뱅킹 토스트 메시지 (toast_background, toast_text)
const ToastMessage = styled.div<{ $type: string }>`
  background-color: ${tokens.colors.toastBackground}; // #e6696e76 (기본)
  color: ${tokens.colors.toastText}; // #ffffffff
  padding: 16px 24px;
  border-radius: ${dimensions.borderRadius.toast}px; // 8dp
  font-family: ${typography.fontFamily.kbfgTextMedium};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  text-align: center;
  box-shadow: ${dimensions.elevation.toast};
  max-width: 320px;
  min-width: 200px;
  word-break: keep-all;
  white-space: pre-wrap;
  ${props => {
    switch (props.$type) {
      case 'success':
        return `
          background-color: ${tokens.colors.successBackground};
          color: ${tokens.colors.successText};
        `;
      case 'warning':
        return `
          background-color: ${tokens.colors.warningBackground};
          color: ${tokens.colors.warningText};
        `;
      case 'error':
        return `
          background-color: ${tokens.colors.errorBackground};
          color: ${tokens.colors.errorText};
        `;
      default:
        return `
          background-color: ${tokens.colors.toastBackground};
          color: ${tokens.colors.toastText};
        `;
    }
  }}
  // 다크 모드 대응
  @media (prefers-color-scheme: dark) {
    background-color: ${tokens.colors.toastBackgroundDark};
    color: ${tokens.colors.toastTextDark};
  }
`;
// 토스트 아이콘
const ToastIcon = styled.span<{ $type: string }>`
  display: inline-block;
  margin-right: 8px;
  font-size: 16px;
  ${props => {
    switch (props.$type) {
      case 'success':
        return '&::before { content: "✓"; }';
      case 'warning':
        return '&::before { content: "⚠"; }';
      case 'error':
        return '&::before { content: "✕"; }';
      case 'info':
      default:
        return '&::before { content: "ℹ"; }';
    }
  }}
`;
const KBToast: React.FC<KBToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  position = 'bottom',
  isVisible,
  onClose,
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    } else {
      // 애니메이션 완료 후 렌더링 중단
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 650); // fade 애니메이션 시간과 동일
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);
  if (!shouldRender) {
    return null;
  }
  return (
    <ToastContainer $position={position} $isVisible={isVisible}>
      <ToastMessage $type={type}>
        <ToastIcon $type={type} />
        {message}
      </ToastMessage>
    </ToastContainer>
  );
};
// 토스트 관리자 훅
export const useToast = () => {
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      message: string;
      type: 'info' | 'success' | 'warning' | 'error';
      duration?: number;
      position?: 'top' | 'center' | 'bottom';
    }>
  >([]);
  const showToast = (
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    duration: number = 3000,
    position: 'top' | 'center' | 'bottom' = 'bottom'
  ) => {
    const id = Date.now().toString();
    const newToast = { id, message, type, duration, position };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration + 650); // 애니메이션 시간 추가
  };
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  return {
    toasts,
    showToast,
    removeToast,
    // 편의 메서드들
    showSuccess: (message: string, duration?: number) => showToast(message, 'success', duration),
    showError: (message: string, duration?: number) => showToast(message, 'error', duration),
    showWarning: (message: string, duration?: number) => showToast(message, 'warning', duration),
    showInfo: (message: string, duration?: number) => showToast(message, 'info', duration),
  };
};
// 토스트 컨테이너 컴포넌트
const ToastContainer_Global = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10001;
`;
interface ToastProviderProps {
  children: React.ReactNode;
}
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { toasts, removeToast } = useToast();
  return (
    <>
      {children}
      <ToastContainer_Global>
        {toasts.map(toast => (
          <KBToast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            position={toast.position}
            isVisible={true}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </ToastContainer_Global>
    </>
  );
};
export default KBToast;
