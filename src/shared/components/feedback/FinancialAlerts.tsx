import React from 'react';

import styled, { keyframes, css } from 'styled-components';

import { dimensions } from '../../../styles/dimensions';
import { tokens } from '../../../styles/tokens';
import { typography } from '../../../styles/typography';
import { formatAmount } from '../../utils/validation';
import Button from '../ui/Button';

interface FinancialAlertProps {
  type: 'insufficient-balance' | 'limit-exceeded' | 'security' | 'maintenance' | 'fee-notice';
  title?: string;
  message?: string;
  details?: {
    currentBalance?: number;
    requiredAmount?: number;
    currentLimit?: number;
    usedLimit?: number;
    fee?: number;
    maintenanceTime?: string;
  };
  onConfirm?: () => void;
  onCancel?: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

// Animations
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

const attention = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const AlertOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const AlertContainer = styled.div<{ $type: string }>`
  background-color: ${tokens.colors.white};
  border-radius: ${dimensions.borderRadius.large}px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 420px;
  width: 100%;
  overflow: hidden;
  animation: ${slideUp} 0.3s ease-out;
  
  ${props => props.$type === 'security' && css`
    animation: ${attention} 0.5s ease-out;
  `}
`;

const AlertHeader = styled.div<{ $type: string }>`
  padding: 24px 24px 16px;
  text-align: center;
  
  ${props => {
    const headerColors = {
      'insufficient-balance': '#fef2f2',
      'limit-exceeded': '#fffbeb',
      'security': '#fee2e2',
      'maintenance': '#eff6ff',
      'fee-notice': '#f0f9ff'
    };
    
    return css`
      background-color: ${headerColors[props.$type] || '#f9fafb'};
    `;
  }}
`;

const AlertIcon = styled.div<{ $type: string }>`
  width: 60px;
  height: 60px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  ${props => {
    const iconStyles = {
      'insufficient-balance': {
        bg: '#fee2e2',
        color: '#dc2626'
      },
      'limit-exceeded': {
        bg: '#fef3c7',
        color: '#f59e0b'
      },
      'security': {
        bg: '#fee2e2',
        color: '#dc2626'
      },
      'maintenance': {
        bg: '#dbeafe',
        color: '#3b82f6'
      },
      'fee-notice': {
        bg: '#e0f2fe',
        color: '#0ea5e9'
      }
    };
    
    const style = iconStyles[props.$type] || iconStyles['fee-notice'];
    
    return css`
      background-color: ${style.bg};
      color: ${style.color};
    `;
  }}
`;

const AlertTitle = styled.h3`
  font-family: ${typography.fontFamily.kbfgTextBold};
  font-size: 20px;
  font-weight: 700;
  color: ${tokens.colors.text.primary};
  margin: 0;
  line-height: 1.3;
`;

const AlertBody = styled.div`
  padding: 0 24px 24px;
`;

const AlertMessage = styled.p`
  font-family: ${typography.fontFamily.kbfgTextLight};
  font-size: 16px;
  color: ${tokens.colors.text.secondary};
  margin: 0 0 20px 0;
  line-height: 1.5;
  text-align: center;
`;

const AlertDetails = styled.div`
  background-color: ${tokens.colors.backgroundGray1};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  font-family: ${typography.fontFamily.kbfgTextMedium};
  font-size: 14px;
  color: ${tokens.colors.text.tertiary};
`;

const DetailValue = styled.span<{ $highlight?: boolean }>`
  font-family: ${typography.fontFamily.kbfgTextBold};
  font-size: 16px;
  color: ${props => props.$highlight ? '#dc2626' : tokens.colors.text.primary};
`;

const AlertActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

// Icons
const getAlertIcon = (type: string) => {
  switch (type) {
    case 'insufficient-balance':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
      );
    case 'limit-exceeded':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
      );
    case 'security':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
      );
    case 'maintenance':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
        </svg>
      );
    case 'fee-notice':
    default:
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      );
  }
};

// Alert configurations
const getAlertConfig = (type: string) => {
  switch (type) {
    case 'insufficient-balance':
      return {
        defaultTitle: '잔액이 부족합니다',
        defaultMessage: '계좌 잔액이 거래 금액보다 적습니다.'
      };
    case 'limit-exceeded':
      return {
        defaultTitle: '이체 한도 초과',
        defaultMessage: '일일 이체 한도를 초과했습니다.'
      };
    case 'security':
      return {
        defaultTitle: '보안 경고',
        defaultMessage: '비정상적인 활동이 감지되었습니다.'
      };
    case 'maintenance':
      return {
        defaultTitle: '시스템 점검 안내',
        defaultMessage: '서비스 점검 중입니다.'
      };
    case 'fee-notice':
      return {
        defaultTitle: '수수료 안내',
        defaultMessage: '이체 수수료가 부과됩니다.'
      };
    default:
      return {
        defaultTitle: '알림',
        defaultMessage: ''
      };
  }
};

// Financial Alert Component
export const FinancialAlert: React.FC<FinancialAlertProps> = ({
  type,
  title,
  message,
  details,
  onConfirm,
  onCancel,
  onAction,
  actionLabel
}) => {
  const config = getAlertConfig(type);
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;

  return (
    <AlertOverlay onClick={onCancel}>
      <AlertContainer $type={type} onClick={e => e.stopPropagation()}>
        <AlertHeader $type={type}>
          <AlertIcon $type={type}>
            {getAlertIcon(type)}
          </AlertIcon>
          <AlertTitle>{displayTitle}</AlertTitle>
        </AlertHeader>

        <AlertBody>
          <AlertMessage>{displayMessage}</AlertMessage>

          {details && (
            <AlertDetails>
              {type === 'insufficient-balance' && (
                <>
                  {details.currentBalance !== undefined && (
                    <DetailRow>
                      <DetailLabel>현재 잔액</DetailLabel>
                      <DetailValue>
                        {formatAmount(details.currentBalance)}원
                      </DetailValue>
                    </DetailRow>
                  )}
                  {details.requiredAmount !== undefined && (
                    <DetailRow>
                      <DetailLabel>필요 금액</DetailLabel>
                      <DetailValue $highlight>
                        {formatAmount(details.requiredAmount)}원
                      </DetailValue>
                    </DetailRow>
                  )}
                </>
              )}

              {type === 'limit-exceeded' && (
                <>
                  {details.currentLimit !== undefined && (
                    <DetailRow>
                      <DetailLabel>일일 한도</DetailLabel>
                      <DetailValue>
                        {formatAmount(details.currentLimit)}원
                      </DetailValue>
                    </DetailRow>
                  )}
                  {details.usedLimit !== undefined && (
                    <DetailRow>
                      <DetailLabel>사용 금액</DetailLabel>
                      <DetailValue $highlight>
                        {formatAmount(details.usedLimit)}원
                      </DetailValue>
                    </DetailRow>
                  )}
                </>
              )}

              {type === 'fee-notice' && details.fee !== undefined && (
                <DetailRow>
                  <DetailLabel>이체 수수료</DetailLabel>
                  <DetailValue>
                    {formatAmount(details.fee)}원
                  </DetailValue>
                </DetailRow>
              )}

              {type === 'maintenance' && details.maintenanceTime && (
                <DetailRow>
                  <DetailLabel>점검 시간</DetailLabel>
                  <DetailValue>{details.maintenanceTime}</DetailValue>
                </DetailRow>
              )}
            </AlertDetails>
          )}

          <AlertActions>
            {onAction && actionLabel && (
              <Button
                variant="primary"
                size="medium"
                onClick={onAction}
                fullWidth
              >
                {actionLabel}
              </Button>
            )}

            {onConfirm && (
              <Button
                variant={onAction ? 'secondary' : 'primary'}
                size="medium"
                onClick={onConfirm}
                fullWidth
              >
                확인
              </Button>
            )}

            {onCancel && (
              <Button
                variant="secondary"
                size="medium"
                onClick={onCancel}
                fullWidth
              >
                취소
              </Button>
            )}
          </AlertActions>
        </AlertBody>
      </AlertContainer>
    </AlertOverlay>
  );
};

// Specialized financial alerts
export const InsufficientBalanceAlert: React.FC<{
  currentBalance: number;
  requiredAmount: number;
  onConfirm: () => void;
  onTopUp?: () => void;
}> = ({ currentBalance, requiredAmount, onConfirm, onTopUp }) => (
  <FinancialAlert
    type="insufficient-balance"
    details={{ currentBalance, requiredAmount }}
    onConfirm={onConfirm}
    onAction={onTopUp}
    actionLabel={onTopUp ? '충전하기' : undefined}
  />
);

export const LimitExceededAlert: React.FC<{
  currentLimit: number;
  usedLimit: number;
  onConfirm: () => void;
  onRequestIncrease?: () => void;
}> = ({ currentLimit, usedLimit, onConfirm, onRequestIncrease }) => (
  <FinancialAlert
    type="limit-exceeded"
    details={{ currentLimit, usedLimit }}
    onConfirm={onConfirm}
    onAction={onRequestIncrease}
    actionLabel={onRequestIncrease ? '한도 증액 신청' : undefined}
  />
);

export const SecurityAlert: React.FC<{
  message: string;
  onConfirm: () => void;
  onReportIssue?: () => void;
}> = ({ message, onConfirm, onReportIssue }) => (
  <FinancialAlert
    type="security"
    message={message}
    onConfirm={onConfirm}
    onAction={onReportIssue}
    actionLabel={onReportIssue ? '신고하기' : undefined}
  />
);

export const MaintenanceAlert: React.FC<{
  maintenanceTime: string;
  onConfirm: () => void;
}> = ({ maintenanceTime, onConfirm }) => (
  <FinancialAlert
    type="maintenance"
    details={{ maintenanceTime }}
    onConfirm={onConfirm}
  />
);

export const FeeNoticeAlert: React.FC<{
  fee: number;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ fee, onConfirm, onCancel }) => (
  <FinancialAlert
    type="fee-notice"
    details={{ fee }}
    onConfirm={onConfirm}
    onCancel={onCancel}
  />
);