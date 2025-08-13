/**
 * Notification Permission Request Modal
 * 
 * 푸시 알림 권한 요청을 위한 모달 컴포넌트
 * - 사용자 친화적인 권한 요청
 * - 뱅킹 알림의 이점 설명
 * - 단계별 가이드
 */

import React, { useState, useEffect } from 'react';

import styled from 'styled-components';

import { pushNotificationService, NotificationPreferences, NotificationType } from '../../services/pushNotificationService';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted: (preferences: NotificationPreferences) => void;
  onPermissionDenied: () => void;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const Header = styled.div`
  padding: 24px 24px 16px;
  text-align: center;
  border-bottom: 1px solid #F0F0F0;
`;

const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #FFD338 0%, #FFCC00 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 4px 12px rgba(255, 211, 56, 0.3);
`;

const NotificationIcon = styled.div`
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #333;
  
  &::after {
    content: '🔔';
  }
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;

const Content = styled.div`
  padding: 24px;
`;

const BenefitsList = styled.div`
  margin: 20px 0;
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const BenefitIcon = styled.div`
  width: 24px;
  height: 24px;
  background: #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  margin-top: 2px;
  
  &::after {
    content: '✓';
    color: white;
    font-size: 14px;
    font-weight: bold;
  }
`;

const BenefitText = styled.div`
  flex: 1;
`;

const BenefitTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const BenefitDescription = styled.div`
  font-size: 14px;
  color: #666;
  line-height: 1.4;
`;

const PreferencesSection = styled.div`
  margin: 24px 0;
  padding: 16px;
  background: #F8F9FA;
  border-radius: 12px;
`;

const PreferencesTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px;
`;

const PreferenceItem = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  cursor: pointer;
  
  &:not(:last-child) {
    border-bottom: 1px solid #E9ECEF;
  }
`;

const PreferenceLabel = styled.div`
  flex: 1;
`;

const PreferenceName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
`;

const PreferenceDesc = styled.div`
  font-size: 12px;
  color: #666;
`;

const Switch = styled.input.attrs({ type: 'checkbox' })`
  width: 44px;
  height: 24px;
  appearance: none;
  background: #DDD;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:checked {
    background: #FFD338;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  &:checked::after {
    transform: translateX(20px);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button<{ primary?: boolean }>`
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.primary ? `
    background: #FFD338;
    color: #333;
    
    &:hover {
      background: #FFCC00;
      transform: translateY(-1px);
    }
    
    &:active {
      transform: translateY(0);
    }
  ` : `
    background: #F8F9FA;
    color: #666;
    
    &:hover {
      background: #E9ECEF;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: #F8F9FA;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #E9ECEF;
  }
  
  &::after {
    content: '×';
    font-size: 18px;
    color: #666;
  }
`;

const SecurityNote = styled.div`
  background: #E3F2FD;
  border: 1px solid #BBDEFB;
  border-radius: 8px;
  padding: 12px;
  margin: 16px 0;
  display: flex;
  align-items: flex-start;
`;

const SecurityIcon = styled.div`
  width: 20px;
  height: 20px;
  margin-right: 8px;
  margin-top: 1px;
  
  &::after {
    content: '🔒';
    font-size: 16px;
  }
`;

const SecurityText = styled.div`
  flex: 1;
  font-size: 14px;
  color: #1976D2;
  line-height: 1.4;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #DDD;
  border-top: 2px solid #FFD338;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  isOpen,
  onClose,
  onPermissionGranted,
  onPermissionDenied
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    types: {
      [NotificationType.TRANSACTION]: true,
      [NotificationType.SECURITY]: true,
      [NotificationType.BALANCE_ALERT]: true,
      [NotificationType.BILL_REMINDER]: true,
      [NotificationType.PROMOTIONAL]: false,
      [NotificationType.SYSTEM_MAINTENANCE]: true,
      [NotificationType.LOGIN_ATTEMPT]: true,
      [NotificationType.SUSPICIOUS_ACTIVITY]: true
    },
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '07:00'
    },
    sound: true,
    vibration: true,
    badge: true,
    preview: true,
    frequency: 'important'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'intro' | 'preferences'>('intro');

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep('intro');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handlePermissionRequest = async () => {
    setIsLoading(true);
    
    try {
      const permission = await pushNotificationService.requestPermission();
      
      if (permission === 'granted') {
        setCurrentStep('preferences');
      } else {
        onPermissionDenied();
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      onPermissionDenied();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (type: NotificationType, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: enabled
      }
    }));
  };

  const handleContinue = () => {
    onPermissionGranted(preferences);
  };

  if (!isOpen) return null;

  const notificationTypes = [
    {
      type: NotificationType.TRANSACTION,
      name: '거래 알림',
      description: '입출금, 이체, 결제 내역'
    },
    {
      type: NotificationType.SECURITY,
      name: '보안 알림',
      description: '로그인 시도, 비정상 활동'
    },
    {
      type: NotificationType.BALANCE_ALERT,
      name: '잔고 알림',
      description: '잔고 부족, 과다 지출'
    },
    {
      type: NotificationType.BILL_REMINDER,
      name: '청구서 알림',
      description: '공과금, 카드료 납부 리마인더'
    },
    {
      type: NotificationType.PROMOTIONAL,
      name: '홀보 알림',
      description: '특별 혜택, 이벤트 정보'
    },
    {
      type: NotificationType.SYSTEM_MAINTENANCE,
      name: '시스템 알림',
      description: '점검, 업데이트 안내'
    }
  ];

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose} />
        
        {currentStep === 'intro' ? (
          <>
            <Header>
              <IconContainer>
                <NotificationIcon />
              </IconContainer>
              <Title>실시간 뱅킹 알림</Title>
              <Subtitle>중요한 금융 정보를 놓치지 마세요</Subtitle>
            </Header>
            
            <Content>
              <BenefitsList>
                <BenefitItem>
                  <BenefitIcon />
                  <BenefitText>
                    <BenefitTitle>즉시 거래 알림</BenefitTitle>
                    <BenefitDescription>
                      입출금, 결제 내역을 실시간으로 확인하여 계좌을 안전하게 관리하세요.
                    </BenefitDescription>
                  </BenefitText>
                </BenefitItem>
                
                <BenefitItem>
                  <BenefitIcon />
                  <BenefitText>
                    <BenefitTitle>보안 위협 감지</BenefitTitle>
                    <BenefitDescription>
                      비정상적인 로그인 시도나 의심스러운 활동을 즉시 알려드립니다.
                    </BenefitDescription>
                  </BenefitText>
                </BenefitItem>
                
                <BenefitItem>
                  <BenefitIcon />
                  <BenefitText>
                    <BenefitTitle>스마트한 지출 관리</BenefitTitle>
                    <BenefitDescription>
                      자동 예산 분석과 지출 패턴 알림으로 효율적인 가계 관리를 도와드립니다.
                    </BenefitDescription>
                  </BenefitText>
                </BenefitItem>
                
                <BenefitItem>
                  <BenefitIcon />
                  <BenefitText>
                    <BenefitTitle>청구서 납부 리마인더</BenefitTitle>
                    <BenefitDescription>
                      공과금, 카드료 등 중요한 납부일을 놀치지 않도록 미리 알려드립니다.
                    </BenefitDescription>
                  </BenefitText>
                </BenefitItem>
              </BenefitsList>
              
              <SecurityNote>
                <SecurityIcon />
                <SecurityText>
                  모든 알림은 암호화되어 전송되며, 민감한 정보는 생체 인증 후에만 표시됩니다.
                </SecurityText>
              </SecurityNote>
              
              <ButtonGroup>
                <Button onClick={onClose}>나중에</Button>
                <Button primary onClick={handlePermissionRequest} disabled={isLoading}>
                  {isLoading && <LoadingSpinner />}
                  알림 허용
                </Button>
              </ButtonGroup>
            </Content>
          </>
        ) : (
          <>
            <Header>
              <IconContainer>
                <NotificationIcon />
              </IconContainer>
              <Title>알림 설정</Title>
              <Subtitle>원하는 알림 유형을 선택하세요</Subtitle>
            </Header>
            
            <Content>
              <PreferencesSection>
                <PreferencesTitle>알림 유형</PreferencesTitle>
                {notificationTypes.map(({ type, name, description }) => (
                  <PreferenceItem key={type}>
                    <PreferenceLabel>
                      <PreferenceName>{name}</PreferenceName>
                      <PreferenceDesc>{description}</PreferenceDesc>
                    </PreferenceLabel>
                    <Switch
                      checked={preferences.types[type]}
                      onChange={(e) => handlePreferenceChange(type, e.target.checked)}
                    />
                  </PreferenceItem>
                ))}
              </PreferencesSection>
              
              <SecurityNote>
                <SecurityIcon />
                <SecurityText>
                  보안 알림과 거래 알림은 계좌 보안을 위해 권장됩니다.
                </SecurityText>
              </SecurityNote>
              
              <ButtonGroup>
                <Button onClick={() => setCurrentStep('intro')}>뒤로</Button>
                <Button primary onClick={handleContinue}>
                  설정 완료
                </Button>
              </ButtonGroup>
            </Content>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default NotificationPermissionModal;
