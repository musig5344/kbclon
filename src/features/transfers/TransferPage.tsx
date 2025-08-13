import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';

import { apiService } from '../../services/api';
import { PageHeader, FormRow, FormLabel, FormInput } from '../../shared/components';
import TabBar from '../../shared/components/layout/TabBar';
import { 
  androidAppContainer,
  androidOptimizedScroll 
} from '../../styles/android-webview-optimizations';
import { formatCurrency } from '../../utils/textFormatter';

import AmountInputSection from './components/AmountInputSection';
import BankSelectModal from './components/BankSelectModal';
import FromAccountSelector from './components/FromAccountSelector';
import TransferCompletionScreen from './components/TransferCompletionScreen';
import TransferConfirmDialog from './components/TransferConfirmDialog';
import TransferConfirmSection from './components/TransferConfirmSection';
import TransferSuccessDialog from './components/TransferSuccessDialog';
import {
  TransferContainer,
  MainContent,
  TransferForm,
  InputWithButton,
  CameraButton,
  ButtonContainer,
  TransferButton,
  BankSelectableInput
} from './TransferPage.styles';

/**
 * KB 스타뱅킹 이체 페이지 - 원본 완전 복제
 * - 원본 KB 앱과 100% 동일한 UI/UX
 * - 창작 요소 일체 제거
 * - 실제 KB 이체 화면과 동일한 구조
 */
const TransferPage: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1); // 1: 입력, 2: 확인, 3: 완료
  const [recipientBank, setRecipientBank] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankSearchTerm, setBankSearchTerm] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [, setIsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [, setAccounts] = useState<any[]>([]);
  const [, setTransferError] = useState('');
  const quickAmounts = useMemo(() => [10000, 50000, 100000, 1000000], []);
  // 스캔 결과 처리
  useEffect(() => {
    const scannedData = location.state?.scannedData;
    if (scannedData) {
      setRecipientBank(scannedData.bank || '');
      setRecipientAccount(scannedData.account || '');
      setRecipientName(scannedData.name || '');
      // 스캔 데이터 처리 후 location state 초기화
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  // 계좌 목록 가져오기
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accountList = await apiService.getAccounts();
        setAccounts(accountList);
        // 주계좌 또는 첫번째 계좌 선택
        const primaryAccount = accountList.find(acc => acc.is_primary) || accountList[0];
        setSelectedAccount(primaryAccount);
      } catch (error) {
      }
    };
    fetchAccounts();
  }, []);
  // location.state에서 fromAccount 확인
  useEffect(() => {
    const fromAccount = location.state?.fromAccount;
    if (fromAccount) {
      setSelectedAccount(fromAccount);
    }
  }, [location.state]);
  const handleBankSelect = useCallback((bankName: string) => {
    setRecipientBank(bankName);
    setShowBankModal(false);
  }, []);
  const handleBankInputClick = useCallback(() => {
    setShowBankModal(true);
  }, []);
  const handleTransferConfirm = useCallback(() => {
    setShowConfirmDialog(true);
  }, []);
  const handleFinalConfirm = async () => {
    if (!selectedAccount) {
      setTransferError('출금 계좌를 선택해주세요.');
      return;
    }
    setIsLoading(true);
    setTransferError('');
    try {
      // 백엔드 이체 요청
      const transferResult = await apiService.executeTransfer({
        from_account_id: selectedAccount.id,
        to_account_number: recipientAccount,
        to_account_name: recipientName,
        amount: parseInt(amount),
        description: memo || `${recipientName}님께 이체`,
        password: '1234' // 실제로는 사용자 입력 받아야 함
      });
      if (transferResult.status === 'success') {
        // 이체 성공 - 거래내역은 API에서 자동 생성됨
        setShowConfirmDialog(false);
        setShowSuccessDialog(true);
        // 계좌 정보 새로고침
        const updatedAccounts = await apiService.getAccounts();
        const updatedAccount = updatedAccounts.find(acc => acc.id === selectedAccount.id);
        if (updatedAccount) {
          setSelectedAccount(updatedAccount);
        }
      } else {
        setTransferError(transferResult.message);
      }
    } catch (error) {
      setTransferError('이체 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleSuccessConfirm = () => {
    setShowSuccessDialog(false);
    // 초기화
    setRecipientBank('');
    setRecipientAccount('');
    setRecipientName('');
    setAmount('');
    setMemo('');
    setStep(1);
  };
  const formatAmount = useCallback((value: string) => {
    if (!value) return '';
    return formatCurrency(parseInt(value)) + '원';
  }, []);
  const handleNext = () => {
    if (step === 1 && isFormValid) {
      setStep(2);
    } else if (step === 2) {
      handleTransferConfirm();
    } else if (step === 3) {
      handleSuccessConfirm();
    }
  };
  const isFormValid = recipientBank && recipientAccount && recipientName && amount && parseInt(amount) > 0;
  const renderContent = () => {
    if (step === 1) {
      return (
        <>
          {/* 보내는 계좌 */}
          <FromAccountSelector
            selectedAccount={selectedAccount}
            formatAmount={formatAmount}
          />
          {/* 이체 정보 입력 */}
          <TransferForm>
            <FormRow>
              <FormLabel>받는 은행</FormLabel>
              <BankSelectableInput
                type="text"
                placeholder="은행을 선택해주세요"
                value={recipientBank}
                onClick={handleBankInputClick}
                readOnly
              />
            </FormRow>
            <FormRow>
              <FormLabel>받는 계좌</FormLabel>
              <InputWithButton>
                <FormInput
                  type="text"
                  placeholder="계좌번호를 입력해주세요"
                  value={recipientAccount}
                  onChange={(e) => setRecipientAccount(e.target.value)}
                />
                <CameraButton onClick={() => navigate('/transfer/picture')}>
                  <img src="/assets/images/icon_transfer_camera.png" alt="카메라" />
                </CameraButton>
              </InputWithButton>
            </FormRow>
            <FormRow>
              <FormLabel>받는 분</FormLabel>
              <FormInput
                type="text"
                placeholder="받는 분 이름을 입력해주세요"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </FormRow>
            <AmountInputSection
              amount={amount}
              setAmount={setAmount}
              quickAmounts={quickAmounts}
              formatAmount={formatAmount}
            />
            <FormRow>
              <FormLabel>메모 (선택사항)</FormLabel>
              <FormInput
                type="text"
                placeholder="메모를 입력해주세요"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </FormRow>
          </TransferForm>
        </>
      );
    } else if (step === 2) {
      return (
        <TransferConfirmSection
          selectedAccount={selectedAccount}
          recipientBank={recipientBank}
          recipientAccount={recipientAccount}
          recipientName={recipientName}
          amount={amount}
          memo={memo}
          formatAmount={formatAmount}
        />
      );
    } else {
      return (
        <TransferCompletionScreen
          recipientName={recipientName}
          amount={amount}
          formatAmount={formatAmount}
        />
      );
    }
  };
  const getButtonText = () => {
    if (step === 1) return '다음';
    if (step === 2) return '이체하기';
    return '확인';
  };
  return (
    <TransferContainer style={{
      transform: 'translateZ(0)', // Android WebView GPU 가속
      willChange: 'scroll-position' // Android WebView 성능 최적화
    }}>
      <PageHeader title="이체" backTo="/dashboard" />
      <MainContent style={{
        touchAction: 'pan-y', // Android WebView 터치 최적화
        overscrollBehavior: 'none' // Android WebView 스크롤 최적화
      }}>
        {renderContent()}
      </MainContent>
      <ButtonContainer>
        <TransferButton
          onClick={handleNext}
          disabled={step === 1 ? !isFormValid : false}
        >
          {getButtonText()}
        </TransferButton>
      </ButtonContainer>
      {/* 은행 선택 모달 */}
      <BankSelectModal
        isVisible={showBankModal}
        onClose={() => setShowBankModal(false)}
        onSelectBank={handleBankSelect}
        searchTerm={bankSearchTerm}
        onSearchTermChange={setBankSearchTerm}
      />
      {/* 이체 확인 다이얼로그 */}
      <TransferConfirmDialog
        isVisible={showConfirmDialog}
        transferData={{
          senderAccount: selectedAccount?.account_name || 'KB국민ONE통장-보통예금',
          senderBank: 'KB국민은행',
          recipientBank,
          recipientAccount,
          recipientName,
          amount: parseInt(amount) || 0,
          fee: 0,
          memo
        }}
        onCancel={() => setShowConfirmDialog(false)}
        onConfirm={handleFinalConfirm}
      />
      {/* 이체 완료 다이얼로그 */}
      <TransferSuccessDialog
        isVisible={showSuccessDialog}
        recipientName={recipientName}
        amount={parseInt(amount) || 0}
        recipientBank={recipientBank}
        recipientAccount={recipientAccount}
        onConfirm={handleSuccessConfirm}
      />
      <TabBar />
    </TransferContainer>
  );
});

TransferPage.displayName = 'TransferPage';
export default TransferPage;