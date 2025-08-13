import React from 'react';

import styled from 'styled-components';

import { 
  androidOptimizedButton, 
  androidOptimizedScroll 
} from '../../../styles/android-webview-optimizations';
import { fadeIn } from '../../../styles/animations';
import { formatCurrency } from '../../../utils/textFormatter';
/**
 * KB 스타뱅킹 이체 확인 다이얼로그 - 원본 XML 완전 복제
 * 원본: dialog_alert_success.xml
 * - Material Card 기반 다이얼로그
 * - 두 개 버튼 레이아웃 (취소/확인)
 */
const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40px 20px;
  
  /* Android WebView 터치 최적화 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
`;
const MaterialCardView = styled.div`
  background: #ffffff;
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  animation: ${fadeIn} 0.2s ease-out;
`;
const DialogContentLayout = styled.div`
  background: #ffffff;
  padding: 24px 24px 20px;
`;
const DialogTitle = styled.h2`
  font-size: 20px;
  color: #26282c;
  font-family: 'KBFGText', sans-serif;
  font-weight: bold;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 16px 0;
`;
const ScrollContainer = styled.div`
  ${androidOptimizedScroll}
  max-height: 300px;
  overflow-y: auto;
  
  /* Android WebView 스크롤 최적화 */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
`;
const TransferInfo = styled.div`
  margin: 16px 0;
`;
const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 16px;
  color: #26282c;
`;
const InfoLabel = styled.span`
  color: #666;
  font-weight: 400;
`;
const InfoValue = styled.span`
  font-weight: 500;
  text-align: right;
`;
const TotalAmount = styled.div`
  text-align: center;
  margin: 24px 0;
  padding: 16px;
  background: #f7f7f8;
  border-radius: 8px;
`;
const TotalAmountText = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #26282c;
  margin-bottom: 4px;
`;
const TotalAmountLabel = styled.div`
  font-size: 14px;
  color: #666;
`;
const ButtonLayout = styled.div`
  display: flex;
  height: 56px;
`;
const DialogButton = styled.button<{ variant: 'left' | 'right' }>`
  ${androidOptimizedButton}
  flex: 1;
  height: 100%;
  border: none;
  font-size: 18px;
  color: #26282c;
  font-family: 'KBFGText', sans-serif;
  font-weight: bold;
  line-height: 1.17;
  letter-spacing: -0.02em;
  cursor: pointer;
  
  /* Android WebView 터치 최적화 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  will-change: transform;
  ${props => props.variant === 'left' ? `
    background: #f5f5f5;
    border-top: 1px solid #eee;
    &:hover {
      background: #eee;
    }
    &:active {
      background: #ddd;
    }
  ` : `
    background: #ffd338;
    border-top: 1px solid #ffd338;
    &:hover {
      background: #ffda48;
    }
    &:active {
      background: #ffcf28;
    }
  `}
`;
interface TransferData {
  senderAccount: string;
  senderBank: string;
  recipientBank: string;
  recipientAccount: string;
  recipientName: string;
  amount: number;
  fee: number;
  memo?: string;
}
interface TransferConfirmDialogProps {
  isVisible: boolean;
  transferData: TransferData;
  onCancel: () => void;
  onConfirm: () => void;
}
const TransferConfirmDialog: React.FC<TransferConfirmDialogProps> = ({
  isVisible,
  transferData,
  onCancel,
  onConfirm
}) => {
  if (!isVisible) return null;
  const formatAmount = (amount: number): string => {
    return formatCurrency(amount) + '원';
  };
  const totalAmount = transferData.amount + transferData.fee;
  return (
    <DialogOverlay onClick={onCancel}>
      <MaterialCardView onClick={(e) => e.stopPropagation()}>
        <DialogContentLayout>
          <DialogTitle>이체 정보 확인</DialogTitle>
          <ScrollContainer>
            <TransferInfo>
              <InfoRow>
                <InfoLabel>보내는 계좌</InfoLabel>
                <InfoValue>{transferData.senderBank}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>받는 은행</InfoLabel>
                <InfoValue>{transferData.recipientBank}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>받는 계좌</InfoLabel>
                <InfoValue>{transferData.recipientAccount}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>받는 분</InfoLabel>
                <InfoValue>{transferData.recipientName}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>이체 금액</InfoLabel>
                <InfoValue>{formatAmount(transferData.amount)}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>이체 수수료</InfoLabel>
                <InfoValue>{formatAmount(transferData.fee)}</InfoValue>
              </InfoRow>
              {transferData.memo && (
                <InfoRow>
                  <InfoLabel>메모 (선택사항)</InfoLabel>
                  <InfoValue>{transferData.memo}</InfoValue>
                </InfoRow>
              )}
            </TransferInfo>
            <TotalAmount>
              <TotalAmountText>총 {formatAmount(totalAmount)}</TotalAmountText>
              <TotalAmountLabel>이체 금액 + 수수료</TotalAmountLabel>
            </TotalAmount>
          </ScrollContainer>
        </DialogContentLayout>
        <ButtonLayout>
          <DialogButton variant="left" onClick={onCancel}>
            취소
          </DialogButton>
          <DialogButton variant="right" onClick={onConfirm}>
            이체하기
          </DialogButton>
        </ButtonLayout>
      </MaterialCardView>
    </DialogOverlay>
  );
};
export default TransferConfirmDialog;