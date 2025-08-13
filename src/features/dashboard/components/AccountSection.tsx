import React, { useMemo, useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import kbLogo from '../../../assets/images/icon_poup_kb_logo.png';
import { KBCard } from '../../../components/kb-native';
import { Account } from '../../../services/api';
import { Button } from '../../../shared/components/ui/Button/Button';
import { KBLoading } from '../../../shared/components/ui/UnifiedLoading';
import { 
  androidAppContainer,
  androidOptimizedScroll,
  androidOptimizedButton 
} from '../../../styles/android-webview-optimizations';
import { fadeInUp, staggerDelay, respectMotionPreference, smoothTransition } from '../../../styles/animations';
import { KBDesignSystem } from '../../../styles/tokens/kb-design-system';
import { formatCurrency as formatCurrencyUtil } from '../../../utils/textFormatter';
/**
 * KB 스타뱅킹 계좌 섹션 컴포넌트
 * - 원본 앱과 100% 동일한 레이아웃 및 스타일링
 * - 반응형 폰트 크기 시스템 (잔액 자릿수에 따른 동적 조정)
 * - 고성능 최적화 (React.memo, useMemo 활용)
 */
const AccountBannerSection = styled.section`
  ${androidAppContainer}
  background: ${KBDesignSystem.colors.background.white};
  padding: 0;
  
  /* Android WebView 성능 최적화 */
  transform: translateZ(0);
  will-change: scroll-position;
`;
const AccountBannerWrapper = styled.div`
  background: ${KBDesignSystem.colors.background.gray100};
  padding: ${KBDesignSystem.spacing.lg} ${KBDesignSystem.spacing.lg};
  position: relative;
`;
const AccountBanner = styled.div`
  background: ${KBDesignSystem.colors.background.white};
  border-radius: ${KBDesignSystem.borderRadius.card};
  padding: ${KBDesignSystem.spacing.lg} ${KBDesignSystem.spacing.lg};
  box-shadow: ${KBDesignSystem.shadows.card};
  position: relative;
  min-height: 180px;
  overflow: hidden;
  /* 미세한 border highlight */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: ${KBDesignSystem.borderRadius.card};
    border: 1px solid rgba(255, 255, 255, 0.8);
    pointer-events: none;
  }
  /* 모바일 최적화 */
  @media (max-width: 480px) {
    padding: ${KBDesignSystem.spacing.base} ${KBDesignSystem.spacing.base};
    min-height: 160px;
  }
  @media (max-width: 320px) {
    padding: ${KBDesignSystem.spacing.md} ${KBDesignSystem.spacing.sm};
    min-height: 150px;
  }
`;
const KBLogoCircle = styled.div`
  width: 48px;
  height: 48px;
  background: ${KBDesignSystem.colors.background.white};
  border-radius: ${KBDesignSystem.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: ${KBDesignSystem.shadows.sm};
  transition: all ${KBDesignSystem.animation.duration.normal} ${KBDesignSystem.animation.easing.easeOut};
  position: relative;
  /* 내부 하이라이트 */
  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    height: 16px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%);
    border-radius: 50%;
  }
  img {
    width: 28px;
    height: 28px;
    object-fit: contain;
    position: relative;
    z-index: 1;
  }
`;
const AccountRow = styled.div<{ $animationIndex?: number }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;
  transition: all ${KBDesignSystem.animation.duration.normal} ${KBDesignSystem.animation.easing.easeOut};
  padding: ${KBDesignSystem.spacing.base};
  margin: -${KBDesignSystem.spacing.xs};
  border-radius: ${KBDesignSystem.borderRadius.lg};
  min-height: 100px;
  position: relative;
  
  /* Android WebView 터치 최적화 */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  /* 스태거 애니메이션 */
  animation: ${fadeInUp} 0.5s ease-out forwards;
  ${props => props.$animationIndex && staggerDelay(props.$animationIndex, 0.1)}
  opacity: 0;
  transform: translate3d(0, 30px, 0);
  ${respectMotionPreference}
  ${smoothTransition}
  &:first-child {
    margin-bottom: ${KBDesignSystem.spacing.base};
  }
  &:hover {
    background-color: ${KBDesignSystem.colors.primary.yellowAlpha10};
    transform: translate3d(0, -2px, 0);
    /* KB 로고 회전 효과 */
    ${KBLogoCircle} {
      transform: rotate(5deg);
    }
  }
  &:active {
    transform: translate3d(0, 0, 0);
    transition: all ${KBDesignSystem.animation.duration.fast} ${KBDesignSystem.animation.easing.easeOut};
  }
  /* 레스폰시브 처리 */
  @media (max-width: 480px) {
    padding: ${KBDesignSystem.spacing.sm};
    min-height: 90px;
  }
`;
const AccountLeft = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${KBDesignSystem.spacing.sm};
  width: 100%;
`;
const AccountInfo = styled.div`
  text-align: left;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: ${KBDesignSystem.spacing.xs};
`;
const AccountName = styled.div`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.md};
  font-weight: ${KBDesignSystem.typography.fontWeight.medium};
  color: ${KBDesignSystem.colors.text.primary};
  letter-spacing: ${KBDesignSystem.typography.letterSpacing.tight};
  line-height: ${KBDesignSystem.typography.lineHeight.tight};
  @media (max-width: 480px) {
    font-size: ${KBDesignSystem.typography.fontSize.base};
  }
`;
const AccountNumber = styled.div`
  font-family: ${KBDesignSystem.typography.fontFamily.mono};
  font-size: ${KBDesignSystem.typography.fontSize.sm};
  font-weight: ${KBDesignSystem.typography.fontWeight.regular};
  color: ${KBDesignSystem.colors.text.secondary};
  letter-spacing: 0.5px;
  line-height: ${KBDesignSystem.typography.lineHeight.normal};
  white-space: nowrap;
  @media (max-width: 480px) {
    font-size: ${KBDesignSystem.typography.fontSize.xs};
  }
`;
const AccountBalance = styled.div`
  position: absolute;
  bottom: ${KBDesignSystem.spacing.base};
  right: ${KBDesignSystem.spacing.base};
  text-align: right;
  
  @media (max-width: 480px) {
    bottom: ${KBDesignSystem.spacing.sm};
    right: ${KBDesignSystem.spacing.sm};
  }
`;
const BalanceAmount = styled.div<{ $amount: number }>`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${props => {
    const amountStr = props.$amount.toString().replace(/,/g, '');
    const digitCount = amountStr.length;
    // 자릿수에 따른 동적 폰트 사이즈
    if (digitCount >= 11) return KBDesignSystem.typography.fontSize.md;
    if (digitCount >= 10) return KBDesignSystem.typography.fontSize.lg;
    if (digitCount >= 9) return KBDesignSystem.typography.fontSize.xl;
    if (digitCount >= 8) return KBDesignSystem.typography.fontSize.xxl;
    if (digitCount >= 7) return KBDesignSystem.typography.fontSize.xxxl;
    return KBDesignSystem.typography.fontSize.xxxxl;
  }};
  font-weight: ${KBDesignSystem.typography.fontWeight.bold};
  color: ${KBDesignSystem.colors.text.primary};
  letter-spacing: ${KBDesignSystem.typography.letterSpacing.tight};
  line-height: ${KBDesignSystem.typography.lineHeight.tight};
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  max-width: 100%;
  word-break: keep-all;
  /* 모바일 최적화 */
  @media (max-width: 480px) {
    font-size: ${props => {
      const amountStr = props.$amount.toString().replace(/,/g, '');
      const digitCount = amountStr.length;
      if (digitCount >= 11) return KBDesignSystem.typography.fontSize.sm;
      if (digitCount >= 10) return KBDesignSystem.typography.fontSize.base;
      if (digitCount >= 9) return KBDesignSystem.typography.fontSize.md;
      if (digitCount >= 8) return KBDesignSystem.typography.fontSize.lg;
      if (digitCount >= 7) return KBDesignSystem.typography.fontSize.xl;
      return KBDesignSystem.typography.fontSize.xxl;
    }};
  }
  @media (max-width: 320px) {
    font-size: ${props => {
      const amountStr = props.$amount.toString().replace(/,/g, '');
      const digitCount = amountStr.length;
      if (digitCount >= 11) return KBDesignSystem.typography.fontSize.xs;
      if (digitCount >= 10) return KBDesignSystem.typography.fontSize.sm;
      if (digitCount >= 9) return KBDesignSystem.typography.fontSize.base;
      if (digitCount >= 8) return KBDesignSystem.typography.fontSize.md;
      if (digitCount >= 7) return KBDesignSystem.typography.fontSize.lg;
      return KBDesignSystem.typography.fontSize.xl;
    }};
  }
`;
const BalanceWon = styled.span<{ $amount: number }>`
  font-size: ${props => {
    const amountStr = props.$amount.toString().replace(/,/g, '');
    const digitCount = amountStr.length;
    // 숫자 크기에 비례하여 '원' 크기 조정
    if (digitCount >= 11) return KBDesignSystem.typography.fontSize.xs;
    if (digitCount >= 10) return KBDesignSystem.typography.fontSize.sm;
    if (digitCount >= 9) return KBDesignSystem.typography.fontSize.base;
    if (digitCount >= 8) return KBDesignSystem.typography.fontSize.base;
    if (digitCount >= 7) return KBDesignSystem.typography.fontSize.md;
    return KBDesignSystem.typography.fontSize.lg;
  }};
  font-weight: ${KBDesignSystem.typography.fontWeight.medium};
  margin-left: ${KBDesignSystem.spacing.xxs};
  color: ${KBDesignSystem.colors.text.primary};
  @media (max-width: 480px) {
    font-size: ${props => {
      const amountStr = props.$amount.toString().replace(/,/g, '');
      const digitCount = amountStr.length;
      if (digitCount >= 11) return KBDesignSystem.typography.fontSize.xxs;
      if (digitCount >= 10) return KBDesignSystem.typography.fontSize.xs;
      if (digitCount >= 9) return KBDesignSystem.typography.fontSize.xs;
      if (digitCount >= 8) return KBDesignSystem.typography.fontSize.sm;
      if (digitCount >= 7) return KBDesignSystem.typography.fontSize.sm;
      return KBDesignSystem.typography.fontSize.base;
    }};
  }
  @media (max-width: 320px) {
    font-size: ${props => {
      const amountStr = props.$amount.toString().replace(/,/g, '');
      const digitCount = amountStr.length;
      if (digitCount >= 11) return KBDesignSystem.typography.fontSize.xxxs;
      if (digitCount >= 10) return KBDesignSystem.typography.fontSize.xxs;
      if (digitCount >= 9) return KBDesignSystem.typography.fontSize.xxs;
      if (digitCount >= 8) return KBDesignSystem.typography.fontSize.xs;
      if (digitCount >= 7) return KBDesignSystem.typography.fontSize.xs;
      return KBDesignSystem.typography.fontSize.sm;
    }};
  }
`;
const TotalAccountButton = styled.button`
  ${androidOptimizedButton}
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${KBDesignSystem.colors.background.gray200};
  border: none;
  border-radius: ${KBDesignSystem.borderRadius.button};
  padding: ${KBDesignSystem.spacing.md} ${KBDesignSystem.spacing.lg};
  text-decoration: none;
  color: ${KBDesignSystem.colors.text.secondary};
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.base};
  font-weight: ${KBDesignSystem.typography.fontWeight.medium};
  transition: all ${KBDesignSystem.animation.duration.normal} ${KBDesignSystem.animation.easing.easeOut};
  margin-top: ${KBDesignSystem.spacing.md};
  letter-spacing: ${KBDesignSystem.typography.letterSpacing.tight};
  box-shadow: none;
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  cursor: pointer;
  width: 100%;
  
  /* Android WebView 최적화 강화 */
  will-change: transform;
  backface-visibility: hidden;
  /* 버튼 하이라이트 효과 */
  &::before {
    content: '';
    position: absolute;
    top: 1px;
    left: 1px;
    right: 1px;
    height: 50%;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
    border-radius: ${KBDesignSystem.borderRadius.button};
  }
  &:hover {
    background: ${KBDesignSystem.colors.primary.yellowDark};
    transform: translateY(-2px);
    box-shadow: ${KBDesignSystem.shadows.lg};
  }
  &:active {
    transform: translateY(0) scale(0.98);
    box-shadow: ${KBDesignSystem.shadows.sm};
    transition: all ${KBDesignSystem.animation.duration.fast} ${KBDesignSystem.animation.easing.easeOut};
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;
const AccountPagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${KBDesignSystem.spacing.md};
  padding: 0 ${KBDesignSystem.spacing.lg};
`;

const PaginationText = styled.div`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.sm};
  color: ${KBDesignSystem.colors.text.secondary};
  font-weight: ${KBDesignSystem.typography.fontWeight.medium};
`;

const ViewAllButton = styled.button`
  ${androidOptimizedButton}
  background: none;
  border: none;
  color: ${KBDesignSystem.colors.text.secondary};
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.sm};
  font-weight: ${KBDesignSystem.typography.fontWeight.medium};
  padding: ${KBDesignSystem.spacing.xs} ${KBDesignSystem.spacing.sm};
  border-radius: ${KBDesignSystem.borderRadius.sm};
  cursor: pointer;
  transition: all ${KBDesignSystem.animation.duration.fast} ease;
  
  &:hover {
    background: ${KBDesignSystem.colors.background.gray100};
  }
`;
interface AccountSectionProps {
  accounts: Account[];
  className?: string;
}
export const AccountSection: React.FC<AccountSectionProps> = React.memo(({ 
  accounts, 
  className 
}) => {
  const navigate = useNavigate();
  const [isTransferLoading, setIsTransferLoading] = useState(false);
  
  // 최대 2개 계좌만 표시 (성능 최적화)
  const displayedAccounts = useMemo(() => {
    return accounts.slice(0, 2);
  }, [accounts]);
  // 잔액 포맷팅 함수 (메모이제이션)
  const formatCurrency = useMemo(() => {
    return (amount: number) => {
      if (!amount || amount < 0) return '0';
      return formatCurrencyUtil(amount);
    };
  }, []);

  // 이체 버튼 클릭 핸들러 - 실제 KB 스타뱅킹과 유사한 로딩 경험
  const handleTransferClick = () => {
    setIsTransferLoading(true);
    // 자연스러운 로딩 시간 (실제 뱅킹 앱과 유사)
    setTimeout(() => {
      navigate('/transfer');
      setIsTransferLoading(false);
    }, 1200);
  };
  return (
    <>
      {isTransferLoading && (
        <KBLoading 
          isVisible={true} 
          type="fullscreen" 
          variant="type1" 
          size="large" 
          message="이체 서비스를 준비하고 있습니다"
        />
      )}
      <AccountBannerSection className={className}>
        <AccountBannerWrapper>
          <AccountBanner>
          {displayedAccounts.map((account, index) => (
            <AccountRow 
              key={account.id} 
              $animationIndex={index}
              as={Link}
              to={`/account/${account.id}`}
            >
              <AccountLeft>
                <KBLogoCircle>
                  <img src={kbLogo} alt="KB" />
                </KBLogoCircle>
                <AccountInfo>
                  <AccountName>{account.account_name}</AccountName>
                  <AccountNumber>{account.account_number}</AccountNumber>
                </AccountInfo>
              </AccountLeft>
              <AccountBalance>
                <BalanceAmount $amount={account.balance}>
                  {formatCurrency(account.balance)}
                  <BalanceWon $amount={account.balance}>원</BalanceWon>
                </BalanceAmount>
              </AccountBalance>
            </AccountRow>
          ))}
          <TotalAccountButton>
            총금계좌등록
          </TotalAccountButton>
        </AccountBanner>
        <AccountPagination>
          <PaginationText>1 / 3</PaginationText>
          <ViewAllButton onClick={() => navigate('/account')}>
            전체계좌 보기
          </ViewAllButton>
        </AccountPagination>
      </AccountBannerWrapper>
    </AccountBannerSection>
    </>
  );
});
AccountSection.displayName = 'AccountSection';
export default AccountSection;