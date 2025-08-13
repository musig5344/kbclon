import React, { useState } from 'react';

import styled from 'styled-components';

import { tokens } from '../../../styles/tokens';
import { typography } from '../../../styles/typography';

// Import all feedback components
import { validateEmail, validatePassword, validateAmount } from '../../utils/validation';
import {
  ErrorHandler,
  ComponentErrorHandler,
  Toast,
  ToastProvider,
  useToast,
  Snackbar,
  useSnackbar,
  Alert,
  ErrorAlert,
  WarningAlert,
  InfoAlert,
  SuccessAlert,
  ProgressIndicator,
  LinearProgress,
  CircularProgress,
  DotsProgress,
  TransactionProgress,
  SuccessAnimation,
  TransferSuccessAnimation,
  NetworkErrorHandler,
  ValidationFeedback,
  FieldValidation,
  PasswordStrength,
  FinancialAlert,
  InsufficientBalanceAlert,
  LimitExceededAlert,
  SecurityAlert,
  MaintenanceAlert,
  FeeNoticeAlert,
  SessionHandler,
  ErrorMessageFormatter,
  ErrorCode
} from '../feedback';
import Button from '../ui/Button';

// Styled Components
const ExampleContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Section = styled.section`
  margin-bottom: 48px;
  padding: 24px;
  background-color: ${tokens.colors.white};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-family: ${typography.fontFamily.kbfgTextBold};
  font-size: 24px;
  font-weight: 700;
  color: ${tokens.colors.text.primary};
  margin: 0 0 24px 0;
`;

const SubSection = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background-color: ${tokens.colors.backgroundGray1};
  border-radius: 4px;
`;

const SubTitle = styled.h3`
  font-family: ${typography.fontFamily.kbfgTextMedium};
  font-size: 18px;
  font-weight: 600;
  color: ${tokens.colors.text.primary};
  margin: 0 0 16px 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${tokens.colors.borderGray};
  border-radius: 4px;
  font-size: 16px;
  font-family: ${typography.fontFamily.kbfgTextMedium};
  
  &:focus {
    outline: none;
    border-color: ${tokens.colors.brand.primary};
  }
`;

// Example Component
export const ErrorHandlingExample: React.FC = () => {
  // Toast
  const toast = useToast();
  
  // Snackbar
  const { snackbarState, showSnackbar, hideSnackbar } = useSnackbar();
  
  // Alerts
  const [showAlerts, setShowAlerts] = useState({
    error: false,
    warning: false,
    info: false,
    success: false
  });
  
  // Progress
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  
  // Success Animation
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  // Network Error
  const [showNetworkError, setShowNetworkError] = useState(false);
  
  // Validation
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [amount, setAmount] = useState('');
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    amount: false
  });
  
  // Financial Alerts
  const [showFinancialAlerts, setShowFinancialAlerts] = useState({
    insufficientBalance: false,
    limitExceeded: false,
    security: false,
    maintenance: false,
    feeNotice: false
  });
  
  // Error Boundary Test
  const [throwError, setThrowError] = useState(false);

  // Progress simulation
  React.useEffect(() => {
    if (showProgress && progress < 100) {
      const timer = setTimeout(() => {
        setProgress(prev => Math.min(prev + 10, 100));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showProgress, progress]);

  const ErrorComponent = () => {
    if (throwError) {
      throw new Error('This is a test error!');
    }
    return <div>Component is working normally</div>;
  };

  return (
    <ExampleContainer>
      <h1>Error Handling & Feedback UI Examples</h1>

      {/* Toast Messages */}
      <Section>
        <SectionTitle>Toast Messages</SectionTitle>
        
        <SubSection>
          <SubTitle>Different Types</SubTitle>
          <ButtonGroup>
            <Button onClick={() => toast.success('작업이 완료되었습니다!')}>
              Success Toast
            </Button>
            <Button onClick={() => toast.error('오류가 발생했습니다.')}>
              Error Toast
            </Button>
            <Button onClick={() => toast.warning('주의가 필요합니다.')}>
              Warning Toast
            </Button>
            <Button onClick={() => toast.info('알림 메시지입니다.')}>
              Info Toast
            </Button>
            <Button onClick={() => toast.loading('처리 중입니다...')}>
              Loading Toast
            </Button>
          </ButtonGroup>
        </SubSection>

        <SubSection>
          <SubTitle>Toast with Actions</SubTitle>
          <Button
            onClick={() => 
              toast.showToast({
                message: '변경사항이 있습니다.',
                type: 'warning',
                action: {
                  label: '저장',
                }
              })
            }
          >
            Toast with Action
          </Button>
        </SubSection>
      </Section>

      {/* Snackbar */}
      <Section>
        <SectionTitle>Snackbar</SectionTitle>
        
        <ButtonGroup>
          <Button onClick={() => showSnackbar('기본 스낵바 메시지')}>
            Default Snackbar
          </Button>
          <Button onClick={() => showSnackbar('성공!', 'success')}>
            Success Snackbar
          </Button>
          <Button onClick={() => showSnackbar('오류 발생', 'error')}>
            Error Snackbar
          </Button>
          <Button 
            onClick={() => 
              showSnackbar('실행 취소하시겠습니까?', 'warning', {
                label: '취소',
              })
            }
          >
            Snackbar with Action
          </Button>
        </ButtonGroup>

        <Snackbar
          open={snackbarState.open}
          message={snackbarState.message}
          severity={snackbarState.severity}
          action={snackbarState.action}
          onClose={hideSnackbar}
        />
      </Section>

      {/* Alerts */}
      <Section>
        <SectionTitle>Alert Components</SectionTitle>
        
        {showAlerts.error && (
          <ErrorAlert onClose={() => setShowAlerts(prev => ({ ...prev, error: false }))}>
            이것은 에러 알림입니다. 중요한 문제가 발생했습니다.
          </ErrorAlert>
        )}
        
        {showAlerts.warning && (
          <WarningAlert 
            title="주의 필요"
            onClose={() => setShowAlerts(prev => ({ ...prev, warning: false }))}
          >
            이체 한도가 거의 찼습니다. 남은 한도: 100,000원
          </WarningAlert>
        )}
        
        {showAlerts.info && (
          <InfoAlert onClose={() => setShowAlerts(prev => ({ ...prev, info: false }))}>
            시스템 점검이 예정되어 있습니다. 내일 00:00 ~ 00:30
          </InfoAlert>
        )}
        
        {showAlerts.success && (
          <SuccessAlert onClose={() => setShowAlerts(prev => ({ ...prev, success: false }))}>
            이체가 성공적으로 완료되었습니다!
          </SuccessAlert>
        )}
        
        <ButtonGroup>
          <Button onClick={() => setShowAlerts(prev => ({ ...prev, error: true }))}>
            Show Error Alert
          </Button>
          <Button onClick={() => setShowAlerts(prev => ({ ...prev, warning: true }))}>
            Show Warning Alert
          </Button>
          <Button onClick={() => setShowAlerts(prev => ({ ...prev, info: true }))}>
            Show Info Alert
          </Button>
          <Button onClick={() => setShowAlerts(prev => ({ ...prev, success: true }))}>
            Show Success Alert
          </Button>
        </ButtonGroup>
      </Section>

      {/* Progress Indicators */}
      <Section>
        <SectionTitle>Progress Indicators</SectionTitle>
        
        <SubSection>
          <SubTitle>Linear Progress</SubTitle>
          <LinearProgress indeterminate />
          <br />
          <LinearProgress value={progress} indeterminate={false} showLabel label="파일 업로드" />
          <br />
          <Button onClick={() => { setShowProgress(true); setProgress(0); }}>
            Start Progress
          </Button>
        </SubSection>

        <SubSection>
          <SubTitle>Circular Progress</SubTitle>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <CircularProgress size="small" />
            <CircularProgress size="medium" />
            <CircularProgress size="large" />
            <CircularProgress value={75} indeterminate={false} size="large" />
          </div>
        </SubSection>

        <SubSection>
          <SubTitle>Dots Progress</SubTitle>
          <DotsProgress />
        </SubSection>

        <SubSection>
          <SubTitle>Transaction Progress</SubTitle>
          <TransactionProgress step={3} totalSteps={5} currentStepLabel="본인 인증" />
        </SubSection>
      </Section>

      {/* Success Animations */}
      <Section>
        <SectionTitle>Success Animations</SectionTitle>
        
        <ButtonGroup>
          <Button onClick={() => setShowSuccessAnimation(true)}>
            Show Success Animation
          </Button>
          <Button onClick={() => setShowSuccessAnimation(true)}>
            Transfer Success
          </Button>
        </ButtonGroup>

        <SuccessAnimation
          show={showSuccessAnimation}
          type="checkmark"
          title="이체 완료!"
          message="100,000원이 성공적으로 이체되었습니다"
          amount="100,000원"
          onComplete={() => setShowSuccessAnimation(false)}
        />
      </Section>

      {/* Form Validation */}
      <Section>
        <SectionTitle>Form Validation</SectionTitle>
        
        <FieldValidation
          label="이메일"
          required
          error={touched.email && !validateEmail(email).isValid ? validateEmail(email).errors[0] : undefined}
          helper="example@email.com"
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
            placeholder="이메일을 입력하세요"
          />
        </FieldValidation>

        <FieldValidation
          label="비밀번호"
          required
          error={touched.password && !validatePassword(password).isValid ? validatePassword(password).errors[0] : undefined}
        >
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
            placeholder="비밀번호를 입력하세요"
          />
        </FieldValidation>
        
        {password && <PasswordStrength password={password} show={true} />}

        <FieldValidation
          label="이체 금액"
          required
          error={touched.amount && !validateAmount(amount).isValid ? validateAmount(amount).errors[0] : undefined}
          helper="최대 1억원까지 가능합니다"
        >
          <Input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, amount: true }))}
            placeholder="금액을 입력하세요"
          />
        </FieldValidation>
      </Section>

      {/* Financial Alerts */}
      <Section>
        <SectionTitle>Financial Alerts</SectionTitle>
        
        <ButtonGroup>
          <Button onClick={() => setShowFinancialAlerts(prev => ({ ...prev, insufficientBalance: true }))}>
            Insufficient Balance
          </Button>
          <Button onClick={() => setShowFinancialAlerts(prev => ({ ...prev, limitExceeded: true }))}>
            Limit Exceeded
          </Button>
          <Button onClick={() => setShowFinancialAlerts(prev => ({ ...prev, security: true }))}>
            Security Alert
          </Button>
          <Button onClick={() => setShowFinancialAlerts(prev => ({ ...prev, maintenance: true }))}>
            Maintenance Alert
          </Button>
          <Button onClick={() => setShowFinancialAlerts(prev => ({ ...prev, feeNotice: true }))}>
            Fee Notice
          </Button>
        </ButtonGroup>

        {showFinancialAlerts.insufficientBalance && (
          <InsufficientBalanceAlert
            currentBalance={50000}
            requiredAmount={100000}
            onConfirm={() => setShowFinancialAlerts(prev => ({ ...prev, insufficientBalance: false }))}
          />
        )}

        {showFinancialAlerts.limitExceeded && (
          <LimitExceededAlert
            currentLimit={5000000}
            usedLimit={5000000}
            onConfirm={() => setShowFinancialAlerts(prev => ({ ...prev, limitExceeded: false }))}
          />
        )}

        {showFinancialAlerts.security && (
          <SecurityAlert
            message="해외에서 로그인 시도가 감지되었습니다."
            onConfirm={() => setShowFinancialAlerts(prev => ({ ...prev, security: false }))}
          />
        )}

        {showFinancialAlerts.maintenance && (
          <MaintenanceAlert
            maintenanceTime="2024-01-01 00:00 ~ 00:30"
            onConfirm={() => setShowFinancialAlerts(prev => ({ ...prev, maintenance: false }))}
          />
        )}

        {showFinancialAlerts.feeNotice && (
          <FeeNoticeAlert
            fee={500}
            onConfirm={() => setShowFinancialAlerts(prev => ({ ...prev, feeNotice: false }))}
            onCancel={() => setShowFinancialAlerts(prev => ({ ...prev, feeNotice: false }))}
          />
        )}
      </Section>

      {/* Error Boundary */}
      <Section>
        <SectionTitle>Error Boundary</SectionTitle>
        
        <ComponentErrorHandler>
          <SubSection>
            <SubTitle>Component with Error Boundary</SubTitle>
            <ErrorComponent />
            <br />
            <Button onClick={() => setThrowError(!throwError)}>
              {throwError ? 'Fix Error' : 'Trigger Error'}
            </Button>
          </SubSection>
        </ComponentErrorHandler>
      </Section>

      {/* Network Error Handler */}
      <Section>
        <SectionTitle>Network Error Handler</SectionTitle>
        
        <Button onClick={() => setShowNetworkError(!showNetworkError)}>
          {showNetworkError ? 'Hide' : 'Show'} Network Error
        </Button>

        {showNetworkError && (
          <NetworkErrorHandler>
            <div>This content requires network connection</div>
          </NetworkErrorHandler>
        )}
      </Section>

      {/* Error Messages */}
      <Section>
        <SectionTitle>Error Message Mapping</SectionTitle>
        
        <SubSection>
          <SubTitle>Error Code Examples</SubTitle>
          {(['AUTH_FAILED', 'INSUFFICIENT_BALANCE', 'NETWORK_ERROR'] as ErrorCode[]).map(code => {
            const errorInfo = ErrorMessageFormatter.format(code);
            return (
              <div key={code} style={{ marginBottom: '16px' }}>
                <strong>{code}:</strong>
                <div>Title: {errorInfo.title}</div>
                <div>Message: {errorInfo.message}</div>
                {errorInfo.suggestion && <div>Suggestion: {errorInfo.suggestion}</div>}
                {errorInfo.action && <div>Action: {errorInfo.action}</div>}
              </div>
            );
          })}
        </SubSection>
      </Section>
    </ExampleContainer>
  );
};