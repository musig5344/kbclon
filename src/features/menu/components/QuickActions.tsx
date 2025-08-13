import React from 'react';

import {
  QuickActions,
  QuickActionItem,
  QuickActionIcon,
  QuickActionText,
} from '../styles/KBMenuStyles';

// 퀵 액션 아이템 인터페이스
interface QuickActionData {
  id: string;
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
}

// QuickActions 컴포넌트 props 인터페이스
interface QuickActionsComponentProps {
  onAction?: (actionId: string) => void;
}

/**
 * KB 스타뱅킹 퀵 액션 컴포넌트
 * 고객센터, 인증/보안, 환경설정 버튼을 포함
 */
export const QuickActionsComponent: React.FC<QuickActionsComponentProps> = ({ onAction }) => {
  // 퀵 액션 데이터 배열
  const quickActions: QuickActionData[] = [
    {
      id: 'customer-center',
      text: '고객센터',
      icon: (
        <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
          <path
            d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            fill='none'
          />
        </svg>
      ),
    },
    {
      id: 'auth-security',
      text: '인증/보안',
      icon: (
        <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
          <rect
            x='3'
            y='11'
            width='18'
            height='10'
            rx='2'
            stroke='currentColor'
            strokeWidth='2'
            fill='none'
          />
          <circle cx='12' cy='16' r='1' fill='currentColor' />
          <path
            d='M7 11V7a5 5 0 0 1 10 0v4'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      ),
    },
    {
      id: 'settings',
      text: '환경설정',
      icon: (
        <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
          <circle cx='12' cy='12' r='3' stroke='currentColor' strokeWidth='2' fill='none' />
          <path
            d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.13a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            fill='none'
          />
        </svg>
      ),
    },
  ];

  const handleActionClick = (actionId: string) => {
    if (onAction) {
      onAction(actionId);
    }
  };

  return (
    <QuickActions>
      {quickActions.map(action => (
        <QuickActionItem key={action.id} onClick={() => handleActionClick(action.id)}>
          <QuickActionIcon>{action.icon}</QuickActionIcon>
          <QuickActionText>{action.text}</QuickActionText>
        </QuickActionItem>
      ))}
    </QuickActions>
  );
};
