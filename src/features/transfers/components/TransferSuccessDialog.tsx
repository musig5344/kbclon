import React from 'react';

import styled from 'styled-components';

import { fadeIn, scaleIn } from '../../../styles/animations';
import { formatCurrency } from '../../../utils/textFormatter';
/**
 * KB 스타뱅킹 이체 완료 다이얼로그 - 원본 XML 완전 복제
 * 원본: dialog_alert_success.xml + 이체 완료 화면 스타일
 * - 중앙 체크 아이콘과 완료 메시지
 * - 단일 확인 버튼
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
  padding: 40px 24px 30px;
  text-align: center;
`;
const CheckIconContainer = styled.div`
  width: 80px;
  height: 80px;
  background: #ffd338;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  animation: ${scaleIn} 0.4s ease-out 0.2s both;
`;
const CheckIcon = styled.div`
  font-size: 36px;
  color: #26282c;
  font-weight: bold;
  &::before {
    content: '✓';
  }
`;
const DialogTitle = styled.h2`
  font-size: 24px;
  color: #26282c;
  font-family: 'KBFGText', sans-serif;
  font-weight: bold;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 16px 0;
`;
const DialogMessage = styled.p`
  font-size: 16px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 32px 0;
`;
const TransferDetails = styled.div`
  background: #f7f7f8;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  text-align: left;
`;
const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
`;
const DetailLabel = styled.span`
  font-size: 14px;
  color: #666;
`;
const DetailValue = styled.span`
  font-size: 14px;
  color: #26282c;
  font-weight: 500;
`;
const AmountHighlight = styled.span`
  font-size: 18px;
  color: #26282c;
  font-weight: bold;
`;
const ButtonLayout = styled.div`
  display: flex;
  height: 56px;
`;
const ConfirmButton = styled.button`
  flex: 1;
  height: 100%;
  border: none;
  background: #ffd338;
  font-size: 18px;
  color: #26282c;
  font-family: 'KBFGText', sans-serif;
  font-weight: bold;
  line-height: 1.17;
  letter-spacing: -0.02em;
  cursor: pointer;
  border-top: 1px solid #ffd338;
  &:hover {
    background: #ffda48;
  }
  &:active {
    background: #ffcf28;
  }
`;
interface TransferSuccessDialogProps {
  isVisible: boolean;
  recipientName: string;
  amount: number;
  recipientBank: string;
  recipientAccount: string;
  onConfirm: () => void;
}
const TransferSuccessDialog: React.FC<TransferSuccessDialogProps> = ({
  isVisible,
  recipientName,
  amount,
  recipientBank,
  recipientAccount,
  onConfirm,
}) => {
  if (!isVisible) return null;
  const formatAmount = (amount: number): string => {
    return formatCurrency(amount) + '원';
  };
  const getCurrentDateTime = (): string => {
    const now = new Date();
    return now.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };
  return (
    <DialogOverlay onClick={onConfirm}>
      <MaterialCardView onClick={e => e.stopPropagation()}>
        <DialogContentLayout>
          <CheckIconContainer>
            <CheckIcon />
          </CheckIconContainer>
          <DialogTitle>이체 완료</DialogTitle>
          <DialogMessage>
            {recipientName}님에게 {formatAmount(amount)}을<br />
            성공적으로 이체했습니다.
          </DialogMessage>
          <TransferDetails>
            <DetailRow>
              <DetailLabel>받는 분</DetailLabel>
              <DetailValue>{recipientName}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>받는 계좌</DetailLabel>
              <DetailValue>
                {recipientBank} {recipientAccount}
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>이체 금액</DetailLabel>
              <AmountHighlight>{formatAmount(amount)}</AmountHighlight>
            </DetailRow>
            <DetailRow>
              <DetailLabel>이체 일시</DetailLabel>
              <DetailValue>{getCurrentDateTime()}</DetailValue>
            </DetailRow>
          </TransferDetails>
        </DialogContentLayout>
        <ButtonLayout>
          <ConfirmButton onClick={onConfirm}>확인</ConfirmButton>
        </ButtonLayout>
      </MaterialCardView>
    </DialogOverlay>
  );
};
export default TransferSuccessDialog;
