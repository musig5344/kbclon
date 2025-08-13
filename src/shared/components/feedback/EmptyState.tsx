/**
 * KB 스타뱅킹 빈 상태 일러스트레이션 컴포넌트
 * 데이터가 없을 때 사용자 친화적인 메시지와 일러스트 표시
 */

import React from 'react';

import styled, { keyframes } from 'styled-components';

import { kbTimings } from '../../../styles/KBMicroDetails';
import { tokens } from '../../../styles/tokens';

// 부드러운 fade in 애니메이션
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// 일러스트 float 애니메이션
const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;
  animation: ${fadeIn} ${kbTimings.normal} ${kbTimings.easeOut};
`;

const IllustrationWrapper = styled.div`
  width: 120px;
  height: 120px;
  margin-bottom: 24px;
  animation: ${float} 3s ease-in-out infinite;
`;

const EmptyStateTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${tokens.colors.text.primary};
  margin-bottom: 8px;
  letter-spacing: -0.3px;
`;

const EmptyStateMessage = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: ${tokens.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 24px;
  max-width: 280px;
`;

const EmptyStateAction = styled.button`
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
  
  &:active {
    transform: translateY(0);
  }
`;

// SVG 일러스트레이션 컴포넌트들
const NoDataIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="45" fill="#F5F5F5"/>
    <rect x="40" y="35" width="40" height="50" rx="4" fill="white" stroke="#E0E0E0" strokeWidth="2"/>
    <line x1="48" y1="45" x2="72" y2="45" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round"/>
    <line x1="48" y1="53" x2="64" y2="53" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round"/>
    <line x1="48" y1="61" x2="68" y2="61" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round"/>
    <line x1="48" y1="69" x2="60" y2="69" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="75" cy="75" r="15" fill={tokens.colors.brand.primary}/>
    <path d="M75 69V75M75 81V81.01" stroke="#1E1E1E" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const NoTransactionIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="45" fill="#F5F5F5"/>
    <rect x="30" y="40" width="60" height="40" rx="4" fill="white" stroke="#E0E0E0" strokeWidth="2"/>
    <circle cx="45" cy="60" r="8" fill={tokens.colors.brand.primary}/>
    <path d="M45 57V60L47 62" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="60" y1="52" x2="80" y2="52" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round"/>
    <line x1="60" y1="60" x2="75" y2="60" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round"/>
    <line x1="60" y1="68" x2="78" y2="68" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const NoAccountIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="45" fill="#F5F5F5"/>
    <rect x="25" y="35" width="70" height="45" rx="8" fill="white" stroke="#E0E0E0" strokeWidth="2"/>
    <circle cx="45" cy="57" r="12" fill={tokens.colors.brand.primary}/>
    <text x="45" y="62" textAnchor="middle" fill="#1E1E1E" fontSize="16" fontWeight="bold">₩</text>
    <line x1="65" y1="50" x2="85" y2="50" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round"/>
    <line x1="65" y1="58" x2="80" y2="58" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round"/>
    <line x1="65" y1="66" x2="75" y2="66" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const NoSearchResultIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="45" fill="#F5F5F5"/>
    <circle cx="55" cy="55" r="20" fill="white" stroke="#E0E0E0" strokeWidth="2"/>
    <line x1="69" y1="69" x2="80" y2="80" stroke="#E0E0E0" strokeWidth="3" strokeLinecap="round"/>
    <path d="M50 50L55 55L60 50" stroke={tokens.colors.brand.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M50 60L55 55L60 60" stroke={tokens.colors.brand.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NoNotificationIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="45" fill="#F5F5F5"/>
    <path d="M60 30C52 30 45 37 45 45V60L40 65V67.5H80V65L75 60V45C75 37 68 30 60 30Z" 
          fill="white" stroke="#E0E0E0" strokeWidth="2" strokeLinejoin="round"/>
    <circle cx="60" cy="75" r="5" fill={tokens.colors.brand.primary}/>
    <line x1="52" y1="45" x2="68" y2="45" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round"/>
    <line x1="55" y1="52" x2="65" y2="52" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const NetworkErrorIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="45" fill="#F5F5F5"/>
    <path d="M40 50C40 50 45 40 60 40C75 40 80 50 80 50" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round"/>
    <path d="M45 60C45 60 48 52 60 52C72 52 75 60 75 60" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="60" cy="70" r="4" fill="#E0E0E0"/>
    <path d="M50 40L70 60M70 40L50 60" stroke="#FF5252" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

export type EmptyStateType = 'no-data' | 'no-transaction' | 'no-account' | 'no-search' | 'no-notification' | 'network-error';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  customIllustration?: React.ReactNode;
}

const defaultMessages = {
  'no-data': {
    title: '데이터가 없습니다',
    message: '아직 표시할 데이터가 없어요.'
  },
  'no-transaction': {
    title: '거래내역이 없습니다',
    message: '선택하신 기간에 거래내역이 없어요.'
  },
  'no-account': {
    title: '등록된 계좌가 없습니다',
    message: '계좌를 등록하고 편리하게 이용하세요.'
  },
  'no-search': {
    title: '검색 결과가 없습니다',
    message: '다른 검색어로 시도해보세요.'
  },
  'no-notification': {
    title: '알림이 없습니다',
    message: '새로운 알림이 도착하면 여기에 표시됩니다.'
  },
  'network-error': {
    title: '네트워크 연결 오류',
    message: '인터넷 연결을 확인하고 다시 시도해주세요.'
  }
};

const illustrations = {
  'no-data': <NoDataIllustration />,
  'no-transaction': <NoTransactionIllustration />,
  'no-account': <NoAccountIllustration />,
  'no-search': <NoSearchResultIllustration />,
  'no-notification': <NoNotificationIllustration />,
  'network-error': <NetworkErrorIllustration />
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-data',
  title,
  message,
  actionLabel,
  onAction,
  customIllustration
}) => {
  const defaultContent = defaultMessages[type];
  
  return (
    <EmptyStateContainer>
      <IllustrationWrapper>
        {customIllustration || illustrations[type]}
      </IllustrationWrapper>
      
      <EmptyStateTitle>
        {title || defaultContent.title}
      </EmptyStateTitle>
      
      <EmptyStateMessage>
        {message || defaultContent.message}
      </EmptyStateMessage>
      
      {actionLabel && onAction && (
        <EmptyStateAction onClick={onAction}>
          {actionLabel}
        </EmptyStateAction>
      )}
    </EmptyStateContainer>
  );
};

// 미니 빈 상태 (인라인 사용)
const MiniEmptyStateContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #FAFAFA;
  border-radius: 8px;
  margin: 16px 0;
`;

const MiniEmptyStateIcon = styled.div`
  width: 40px;
  height: 40px;
  margin-right: 16px;
  opacity: 0.6;
`;

const MiniEmptyStateText = styled.div`
  font-size: 14px;
  color: ${tokens.colors.text.secondary};
`;

interface MiniEmptyStateProps {
  icon?: React.ReactNode;
  text: string;
}

export const MiniEmptyState: React.FC<MiniEmptyStateProps> = ({ icon, text }) => (
  <MiniEmptyStateContainer>
    {icon && <MiniEmptyStateIcon>{icon}</MiniEmptyStateIcon>}
    <MiniEmptyStateText>{text}</MiniEmptyStateText>
  </MiniEmptyStateContainer>
);