import React, { useState, useEffect, useCallback, useMemo } from 'react';

import styled from 'styled-components';

import { exchangeRateService, CurrencyRate } from '../../../services/exchangeRate';
import {
  androidAppContainer,
  androidOptimizedButton,
} from '../../../styles/android-webview-optimizations';
import { pulse, fadeIn } from '../../../styles/animations';
import { KBDesignSystem } from '../../../styles/tokens/kb-design-system';
import { formatCurrency } from '../../../utils/textFormatter';
/**
 * KB 스타뱅킹 환율/증시 탭 컴포넌트
 * - 실시간 환율 데이터 연동
 * - 가상 증시 데이터 (30초 자동 업데이트)
 * - 매끄러운 탭 전환 애니메이션
 * - 자동 업데이트 시스템
 */
const TabSection = styled.section`
  ${androidAppContainer}
  background: ${KBDesignSystem.colors.background.white};
  padding: 0;
  border-top: 1px solid ${KBDesignSystem.colors.border.light};

  /* Android WebView 성능 최적화 */
  transform: translateZ(0);
  will-change: scroll-position;
`;
const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${KBDesignSystem.colors.border.medium};
  background: ${KBDesignSystem.colors.background.gray200};
`;
const TabButton = styled.button<{ $active: boolean }>`
  ${androidOptimizedButton}
  flex: 1;
  padding: ${KBDesignSystem.spacing.md} ${KBDesignSystem.spacing.base};
  background: ${props =>
    props.$active
      ? KBDesignSystem.colors.background.white
      : KBDesignSystem.colors.background.gray200};
  border: none;
  border-bottom: ${props =>
    props.$active ? `3px solid ${KBDesignSystem.colors.primary.yellow}` : '3px solid transparent'};
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.base};
  font-weight: ${props =>
    props.$active
      ? KBDesignSystem.typography.fontWeight.bold
      : KBDesignSystem.typography.fontWeight.medium};
  color: ${props =>
    props.$active ? KBDesignSystem.colors.text.primary : KBDesignSystem.colors.text.tertiary};
  cursor: pointer;
  transition: all ${KBDesignSystem.animation.duration.normal}
    ${KBDesignSystem.animation.easing.easeOut};
  position: relative;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  /* Android WebView 터치 최적화 */
  touch-action: manipulation;
  &:hover {
    background: ${KBDesignSystem.colors.background.white};
    color: ${KBDesignSystem.colors.text.primary};
  }
  &:active {
    transform: scale(0.98);
  }
  /* 활성 탭 하이라이트 */
  ${props =>
    props.$active &&
    `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent 0%, ${KBDesignSystem.colors.primary.yellow} 50%, transparent 100%);
    }
  `}
`;
const TabContent = styled.div`
  padding: ${KBDesignSystem.spacing.lg};
  animation: ${fadeIn} ${KBDesignSystem.animation.duration.normal} ease;
`;
// 환율 스타일
const CurrencyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${KBDesignSystem.spacing.base};
  margin-bottom: ${KBDesignSystem.spacing.base};
`;
const CurrencyItem = styled.div`
  text-align: center;
  padding: ${KBDesignSystem.spacing.md};
  background: ${KBDesignSystem.colors.background.gray100};
  border-radius: ${KBDesignSystem.borderRadius.lg};
  transition: all ${KBDesignSystem.animation.duration.normal}
    ${KBDesignSystem.animation.easing.easeOut};
  &:hover {
    background: ${KBDesignSystem.colors.background.gray200};
    transform: translateY(-1px);
  }
`;
const CurrencyFlag = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${KBDesignSystem.spacing.sm};
  margin-bottom: ${KBDesignSystem.spacing.sm};
  font-size: ${KBDesignSystem.typography.fontSize.base};
  font-weight: ${KBDesignSystem.typography.fontWeight.medium};
  color: ${KBDesignSystem.colors.text.primary};
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
`;
const CurrencyRateText = styled.div`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.lg};
  font-weight: ${KBDesignSystem.typography.fontWeight.bold};
  color: ${KBDesignSystem.colors.text.primary};
  letter-spacing: ${KBDesignSystem.typography.letterSpacing.tight};
`;
// 증시 스타일
const StockGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${KBDesignSystem.spacing.base};
`;
const StockItem = styled.div`
  text-align: center;
  padding: ${KBDesignSystem.spacing.base};
  background: ${KBDesignSystem.colors.background.gray100};
  border-radius: ${KBDesignSystem.borderRadius.lg};
  transition: all ${KBDesignSystem.animation.duration.normal}
    ${KBDesignSystem.animation.easing.easeOut};
  &:hover {
    background: ${KBDesignSystem.colors.background.gray200};
    transform: translateY(-1px);
  }
`;
const StockName = styled.div`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.base};
  font-weight: ${KBDesignSystem.typography.fontWeight.medium};
  color: ${KBDesignSystem.colors.text.secondary};
  margin-bottom: ${KBDesignSystem.spacing.sm};
`;
const StockPrice = styled.div`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.xxl};
  font-weight: ${KBDesignSystem.typography.fontWeight.bold};
  color: ${KBDesignSystem.colors.text.primary};
  margin-bottom: ${KBDesignSystem.spacing.xs};
  animation: ${pulse} 0.3s ease;
  letter-spacing: ${KBDesignSystem.typography.letterSpacing.tight};
`;
const StockChange = styled.div<{ $isUp: boolean }>`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.sm};
  font-weight: ${KBDesignSystem.typography.fontWeight.medium};
  color: ${props =>
    props.$isUp ? KBDesignSystem.colors.status.error : KBDesignSystem.colors.status.success};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${KBDesignSystem.spacing.xs};
  transition: color ${KBDesignSystem.animation.duration.normal} ease;
`;
// 업데이트 정보 바
const UpdateInfoBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${KBDesignSystem.spacing.md} ${KBDesignSystem.spacing.base};
  background: ${KBDesignSystem.colors.background.gray100};
  border-radius: ${KBDesignSystem.borderRadius.lg};
  margin-bottom: ${KBDesignSystem.spacing.lg};
  border: 1px solid ${KBDesignSystem.colors.border.light};
`;
const UpdateLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;
const UpdateTitle = styled.div`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.sm};
  font-weight: ${KBDesignSystem.typography.fontWeight.medium};
  color: ${KBDesignSystem.colors.text.secondary};
`;
const UpdateDateTime = styled.div`
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.md};
  font-weight: ${KBDesignSystem.typography.fontWeight.semibold};
  color: ${KBDesignSystem.colors.text.primary};
`;
const RefreshButton = styled.button<{ $isLoading?: boolean }>`
  ${androidOptimizedButton}
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${KBDesignSystem.spacing.xs};
  padding: ${KBDesignSystem.spacing.sm} ${KBDesignSystem.spacing.base};
  background: ${KBDesignSystem.colors.background.white};
  border: 1px solid ${KBDesignSystem.colors.border.medium};
  border-radius: ${KBDesignSystem.borderRadius.sm};
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.base};
  font-weight: ${KBDesignSystem.typography.fontWeight.medium};
  color: ${KBDesignSystem.colors.text.secondary};
  cursor: pointer;
  transition: all ${KBDesignSystem.animation.duration.fast}
    ${KBDesignSystem.animation.easing.easeOut};
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  /* Android WebView 터치 최적화 */
  touch-action: manipulation;
  will-change: transform;
  &:hover:not(:disabled) {
    background: ${KBDesignSystem.colors.background.gray100};
    border-color: ${KBDesignSystem.colors.border.dark};
    transform: translateY(-1px);
    box-shadow: ${KBDesignSystem.shadows.xs};
  }
  &:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
    box-shadow: none;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  svg {
    width: 16px;
    height: 16px;
    transition: transform ${KBDesignSystem.animation.duration.normal} ease;
    transform: ${props => (props.$isLoading ? 'rotate(360deg)' : 'rotate(0)')};
    animation: ${props => (props.$isLoading ? 'spin 1s linear infinite' : 'none')};
  }
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;
const AutoUpdateIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${KBDesignSystem.spacing.xs};
  font-family: ${KBDesignSystem.typography.fontFamily.primary};
  font-size: ${KBDesignSystem.typography.fontSize.xs};
  color: ${KBDesignSystem.colors.text.tertiary};
  margin-top: 4px;
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    background: ${KBDesignSystem.colors.status.success};
    border-radius: ${KBDesignSystem.borderRadius.full};
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;
interface StockData {
  name: string;
  price: number;
  change: number;
  percent: number;
  isUp: boolean;
}
interface FinancialTabsProps {
  className?: string;
}
export const FinancialTabs: React.FC<FinancialTabsProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<'환율' | '증시'>('환율');
  const [exchangeRates, setExchangeRates] = useState<CurrencyRate[]>([]);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [stockData, setStockData] = useState<StockData[]>([
    { name: 'KOSPI', price: 3196.05, change: 5.6, percent: 0.18, isUp: true },
    { name: 'KOSDAQ', price: 806.95, change: -2.94, percent: -0.36, isUp: false },
  ]);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [lastStockUpdateTime, setLastStockUpdateTime] = useState<string>('');
  // 환율 데이터 로드
  const loadExchangeRates = useCallback(async () => {
    if (isLoadingRates) return;
    setIsLoadingRates(true);
    try {
      const rates = await exchangeRateService.getExchangeRates();
      setExchangeRates(rates);
      setLastUpdateTime(exchangeRateService.getLastUpdateTime());
    } catch (error) {
    } finally {
      setIsLoadingRates(false);
    }
  }, [isLoadingRates]);
  // 현재 시간 가져오기
  const getCurrentTime = useCallback(() => {
    const now = new Date();
    return now.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, []);
  // 증시 데이터 업데이트 (가상)
  const updateStockData = useCallback(() => {
    setIsLoadingStock(true);
    setTimeout(() => {
      setStockData(prevData =>
        prevData.map(stock => {
          // 랜덤 변동률 (-0.5% ~ +0.5%)
          const changePercent = (Math.random() - 0.5) * 0.01;
          const newPrice = stock.price * (1 + changePercent);
          const priceChange = newPrice - stock.price;
          const isUp = priceChange >= 0;
          return {
            name: stock.name,
            price: Number(newPrice.toFixed(2)),
            change: Number(Math.abs(priceChange).toFixed(2)),
            percent: Number((Math.abs(changePercent) * 100).toFixed(2)),
            isUp,
          };
        })
      );
      setLastStockUpdateTime(getCurrentTime());
      setIsLoadingStock(false);
    }, 500);
  }, [getCurrentTime]);
  // 초기 로드 및 자동 업데이트 설정
  useEffect(() => {
    loadExchangeRates();
    setLastStockUpdateTime(getCurrentTime());
    // 5분마다 환율 업데이트
    const rateInterval = setInterval(loadExchangeRates, 5 * 60 * 1000);
    // 30초마다 증시 데이터 업데이트
    const stockInterval = setInterval(updateStockData, 30000);
    return () => {
      clearInterval(rateInterval);
      clearInterval(stockInterval);
    };
  }, [loadExchangeRates, updateStockData, getCurrentTime]);
  // 기본 환율 데이터 (로딩 중일 때)
  const defaultRates = useMemo(
    () => [
      { flag: '🇺🇸', code: 'USD', rate: 1383.2 },
      { flag: '🇯🇵', code: 'JPY', rate: 937.13 },
      { flag: '🇪🇺', code: 'EUR', rate: 1624.43 },
    ],
    []
  );
  return (
    <TabSection className={className}>
      <TabContainer>
        <TabButton $active={activeTab === '환율'} onClick={() => setActiveTab('환율')}>
          환율
        </TabButton>
        <TabButton $active={activeTab === '증시'} onClick={() => setActiveTab('증시')}>
          증시
        </TabButton>
      </TabContainer>
      <TabContent>
        {activeTab === '환율' ? (
          <>
            <UpdateInfoBar>
              <UpdateLabel>
                <UpdateTitle>매매기준율</UpdateTitle>
                <UpdateDateTime>{lastUpdateTime || getCurrentTime()}</UpdateDateTime>
                <AutoUpdateIndicator>5분마다 자동 업데이트</AutoUpdateIndicator>
              </UpdateLabel>
              <RefreshButton
                onClick={() => !isLoadingRates && loadExchangeRates()}
                $isLoading={isLoadingRates}
                disabled={isLoadingRates}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                  />
                </svg>
                {isLoadingRates ? '업데이트 중' : '새로고침'}
              </RefreshButton>
            </UpdateInfoBar>
            <CurrencyGrid>
              {(exchangeRates.length > 0 ? exchangeRates : defaultRates).map((currency, index) => (
                <CurrencyItem key={index}>
                  <CurrencyFlag>
                    {currency.flag} {currency.code}
                  </CurrencyFlag>
                  <CurrencyRateText>{formatCurrency(currency.rate)}</CurrencyRateText>
                </CurrencyItem>
              ))}
            </CurrencyGrid>
          </>
        ) : (
          <>
            <UpdateInfoBar>
              <UpdateLabel>
                <UpdateTitle>실시간 증시</UpdateTitle>
                <UpdateDateTime>{lastStockUpdateTime || getCurrentTime()}</UpdateDateTime>
                <AutoUpdateIndicator>30초마다 자동 업데이트</AutoUpdateIndicator>
              </UpdateLabel>
              <RefreshButton
                onClick={updateStockData}
                $isLoading={isLoadingStock}
                disabled={isLoadingStock}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                  />
                </svg>
                {isLoadingStock ? '업데이트 중' : '새로고침'}
              </RefreshButton>
            </UpdateInfoBar>
            <StockGrid>
              {stockData.map((stock, index) => (
                <StockItem key={index}>
                  <StockName>{stock.name}</StockName>
                  <StockPrice>{formatCurrency(stock.price)}</StockPrice>
                  <StockChange $isUp={stock.isUp}>
                    {stock.isUp ? '▲' : '▼'} {stock.change} ({stock.percent}%)
                  </StockChange>
                </StockItem>
              ))}
            </StockGrid>
          </>
        )}
      </TabContent>
    </TabSection>
  );
};
export default FinancialTabs;
