import React, { useState, useRef, useCallback, ReactNode } from 'react';

import styled, { css, keyframes } from 'styled-components';

import { tokens } from '../../styles/tokens';
import {
  useSwipeGesture,
  useTapGesture,
  useLongPressGesture,
  useAccountCardGestures,
  useTransactionGestures,
  usePINGestures,
  useMultiGesture,
} from '../hooks/useGestures';

// Gesture-enabled Account Card
interface GestureAccountCardProps {
  account: {
    id: string;
    name: string;
    number: string;
    balance: number;
    type: string;
  };
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  className?: string;
}

const swipeLeft = keyframes`
  0% { transform: translateX(0); }
  50% { transform: translateX(-20px); }
  100% { transform: translateX(0); }
`;

const swipeRight = keyframes`
  0% { transform: translateX(0); }
  50% { transform: translateX(20px); }
  100% { transform: translateX(0); }
`;

const CardContainer = styled.div<{ $isPressed: boolean; $swipeDirection?: 'left' | 'right' }>`
  position: relative;
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #FFCC00 0%, #FFB700 100%);
  color: #1a1a1a;
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  ${props => props.$isPressed && css`
    transform: scale(0.98);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `}
  
  ${props => props.$swipeDirection === 'left' && css`
    animation: ${swipeLeft} 0.3s ease;
  `}
  
  ${props => props.$swipeDirection === 'right' && css`
    animation: ${swipeRight} 0.3s ease;
  `}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  &:active::before {
    opacity: 1;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const AccountName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const AccountType = styled.span`
  font-size: 12px;
  opacity: 0.8;
`;

const AccountNumber = styled.div`
  font-size: 14px;
  opacity: 0.7;
  margin-bottom: 12px;
`;

const Balance = styled.div`
  font-size: 24px;
  font-weight: 700;
`;

const GestureHint = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  opacity: ${props => props.$visible ? 1 : 0};
  pointer-events: none;
  transition: opacity 0.2s ease;
`;

export const GestureAccountCard: React.FC<GestureAccountCardProps> = ({
  account,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  onLongPress,
  className,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | undefined>();
  const [showHint, setShowHint] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSwipeLeft = useCallback(() => {
    setSwipeDirection('left');
    setTimeout(() => setSwipeDirection(undefined), 300);
    onSwipeLeft?.();
  }, [onSwipeLeft]);

  const handleSwipeRight = useCallback(() => {
    setSwipeDirection('right');
    setTimeout(() => setSwipeDirection(undefined), 300);
    onSwipeRight?.();
  }, [onSwipeRight]);

  const handleTap = useCallback(() => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    onTap?.();
  }, [onTap]);

  const handleLongPress = useCallback(() => {
    setShowHint(true);
    setTimeout(() => setShowHint(false), 2000);
    onLongPress?.();
  }, [onLongPress]);

  useAccountCardGestures(
    handleSwipeLeft,
    handleSwipeRight,
    handleTap,
    handleLongPress,
    { element: cardRef.current }
  );

  return (
    <CardContainer
      ref={cardRef}
      className={className}
      $isPressed={isPressed}
      $swipeDirection={swipeDirection}
      data-account-id={account.id}
    >
      <CardHeader>
        <AccountName>{account.name}</AccountName>
        <AccountType>{account.type}</AccountType>
      </CardHeader>
      
      <AccountNumber>{account.number}</AccountNumber>
      
      <Balance>
        {new Intl.NumberFormat('ko-KR').format(account.balance)}원
      </Balance>
      
      <GestureHint $visible={showHint}>
        길게 눌러서 더 많은 옵션 보기
      </GestureHint>
    </CardContainer>
  );
};

// Gesture-enabled Transaction Item
interface GestureTransactionItemProps {
  transaction: {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'debit' | 'credit';
    category?: string;
  };
  onSwipeToDelete?: (id: string) => void;
  onSwipeToCategory?: (id: string) => void;
  onTap?: (id: string) => void;
  className?: string;
}

const TransactionContainer = styled.div<{ 
  $swipeOffset: number; 
  $isDeleting: boolean;
  $isPressed: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid ${tokens.colors.gray200};
  transform: translateX(${props => props.$swipeOffset}px);
  transition: transform 0.3s ease, opacity 0.3s ease;
  cursor: pointer;
  user-select: none;
  
  ${props => props.$isDeleting && css`
    opacity: 0.5;
    transform: translateX(-100%);
  `}
  
  ${props => props.$isPressed && css`
    background-color: ${tokens.colors.gray50};
  `}
`;

const ActionButton = styled.button<{ $type: 'delete' | 'category' }>`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 80px;
  border: none;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  z-index: 1;
  
  ${props => props.$type === 'delete' && css`
    right: 0;
    background-color: ${tokens.colors.error};
  `}
  
  ${props => props.$type === 'category' && css`
    left: 0;
    background-color: ${tokens.colors.info};
  `}
`;

const TransactionContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TransactionInfo = styled.div`
  flex: 1;
`;

const TransactionDate = styled.div`
  font-size: 12px;
  color: ${tokens.colors.text.secondary};
`;

const TransactionDescription = styled.div`
  font-size: 16px;
  font-weight: 500;
  margin: 4px 0;
`;

const TransactionAmount = styled.div<{ $type: 'debit' | 'credit' }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$type === 'credit' ? tokens.colors.success : tokens.colors.error};
`;

export const GestureTransactionItem: React.FC<GestureTransactionItemProps> = ({
  transaction,
  onSwipeToDelete,
  onSwipeToCategory,
  onTap,
  className,
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleSwipeToDelete = useCallback(() => {
    setIsDeleting(true);
    setTimeout(() => {
      onSwipeToDelete?.(transaction.id);
    }, 300);
  }, [onSwipeToDelete, transaction.id]);

  const handleSwipeToCategory = useCallback(() => {
    onSwipeToCategory?.(transaction.id);
  }, [onSwipeToCategory, transaction.id]);

  const handleTap = useCallback(() => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    onTap?.(transaction.id);
  }, [onTap, transaction.id]);

  useTransactionGestures(
    handleSwipeToDelete,
    handleSwipeToCategory,
    handleTap,
    { element: itemRef.current }
  );

  // Pan gesture for visual feedback
  useMultiGesture({
    pan: (event) => {
      const deltaX = event.data?.deltaX || 0;
      const maxOffset = 80;
      const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, deltaX));
      setSwipeOffset(clampedOffset);
    },
  }, { element: itemRef.current });

  return (
    <TransactionContainer
      ref={itemRef}
      className={className}
      $swipeOffset={swipeOffset}
      $isDeleting={isDeleting}
      $isPressed={isPressed}
      data-transaction-id={transaction.id}
    >
      {swipeOffset > 40 && (
        <ActionButton $type="category" onClick={() => handleSwipeToCategory()}>
          분류
        </ActionButton>
      )}
      
      {swipeOffset < -40 && (
        <ActionButton $type="delete" onClick={() => handleSwipeToDelete()}>
          삭제
        </ActionButton>
      )}
      
      <TransactionContent>
        <TransactionInfo>
          <TransactionDate>{transaction.date}</TransactionDate>
          <TransactionDescription>{transaction.description}</TransactionDescription>
        </TransactionInfo>
        
        <TransactionAmount $type={transaction.type}>
          {transaction.type === 'debit' ? '-' : '+'}
          {new Intl.NumberFormat('ko-KR').format(Math.abs(transaction.amount))}원
        </TransactionAmount>
      </TransactionContent>
    </TransactionContainer>
  );
};

// Gesture-enabled PIN Input
interface GesturePINInputProps {
  onComplete: (pin: string) => void;
  length?: number;
  secure?: boolean;
  className?: string;
}

const PINContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 24px;
`;

const PINDisplay = styled.div`
  display: flex;
  gap: 12px;
`;

const PINDot = styled.div<{ $filled: boolean; $animate: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${props => props.$filled ? tokens.colors.primary : tokens.colors.gray300};
  transition: all 0.2s ease;
  transform: ${props => props.$animate ? 'scale(1.3)' : 'scale(1)'};
`;

const PINKeypad = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 300px;
`;

const PINKey = styled.button<{ $special?: boolean; $pressed: boolean }>`
  width: 80px;
  height: 80px;
  border: 2px solid ${tokens.colors.gray300};
  border-radius: 40px;
  background-color: ${props => props.$pressed ? tokens.colors.gray200 : 'white'};
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease;
  
  ${props => props.$special && css`
    font-size: 20px;
    background-color: ${props.$pressed ? tokens.colors.gray300 : tokens.colors.gray100};
  `}
  
  &:focus {
    outline: 3px solid ${tokens.colors.primary};
    outline-offset: 2px;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

export const GesturePINInput: React.FC<GesturePINInputProps> = ({
  onComplete,
  length = 6,
  secure = true,
  className,
}) => {
  const [pin, setPin] = useState('');
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const keypadRef = useRef<HTMLDivElement>(null);

  const handleNumberInput = useCallback((number: string) => {
    if (pin.length < length) {
      const newPin = pin + number;
      setPin(newPin);
      
      // Animate the newly filled dot
      setAnimatingIndex(newPin.length - 1);
      setTimeout(() => setAnimatingIndex(null), 200);
      
      if (newPin.length === length) {
        setTimeout(() => onComplete(newPin), 100);
      }
    }
  }, [pin, length, onComplete]);

  const handleDelete = useCallback(() => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  }, [pin]);

  const handleClear = useCallback(() => {
    setPin('');
  }, []);

  usePINGestures(
    handleNumberInput,
    handleDelete,
    () => {
      if (pin.length === length) {
        onComplete(pin);
      }
    },
    { element: keypadRef.current }
  );

  const keys = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    'clear', '0', 'delete'
  ];

  return (
    <PINContainer className={className}>
      <PINDisplay>
        {Array.from({ length }).map((_, index) => (
          <PINDot
            key={index}
            $filled={index < pin.length}
            $animate={animatingIndex === index}
          />
        ))}
      </PINDisplay>
      
      <PINKeypad ref={keypadRef}>
        {keys.map((key) => {
          const isSpecial = key === 'clear' || key === 'delete';
          const displayKey = key === 'clear' ? '전체삭제' : key === 'delete' ? '⌫' : key;
          
          return (
            <PINKey
              key={key}
              $special={isSpecial}
              $pressed={pressedKey === key}
              data-number={!isSpecial ? key : undefined}
              data-action={isSpecial ? key : undefined}
              onMouseDown={() => setPressedKey(key)}
              onMouseUp={() => setPressedKey(null)}
              onMouseLeave={() => setPressedKey(null)}
              onClick={() => {
                if (key === 'clear') {
                  handleClear();
                } else if (key === 'delete') {
                  handleDelete();
                } else {
                  handleNumberInput(key);
                }
              }}
            >
              {displayKey}
            </PINKey>
          );
        })}
      </PINKeypad>
    </PINContainer>
  );
};

// Pull-to-Refresh Component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
  className?: string;
}

const RefreshContainer = styled.div<{ $pullDistance: number; $isRefreshing: boolean }>`
  position: relative;
  transform: translateY(${props => props.$pullDistance}px);
  transition: ${props => props.$isRefreshing ? 'transform 0.3s ease' : 'none'};
`;

const RefreshIndicator = styled.div<{ $visible: boolean; $isRefreshing: boolean }>`
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.2s ease;
  
  &::after {
    content: '';
    width: 24px;
    height: 24px;
    border: 2px solid ${tokens.colors.gray300};
    border-top-color: ${tokens.colors.primary};
    border-radius: 50%;
    animation: ${props => props.$isRefreshing ? 'spin 1s linear infinite' : 'none'};
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
  className,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useMultiGesture({
    'pull-to-refresh': async () => {
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      }
    },
    pan: (event) => {
      const deltaY = event.data?.deltaY || 0;
      if (deltaY > 0 && window.scrollY === 0) {
        const resistance = 1 - Math.min(deltaY / (threshold * 2), 0.8);
        setPullDistance(deltaY * resistance);
      }
    },
  }, { element: containerRef.current });

  return (
    <div className={className} data-pull-refresh>
      <RefreshIndicator 
        $visible={pullDistance > 20} 
        $isRefreshing={isRefreshing}
      />
      <RefreshContainer 
        ref={containerRef}
        $pullDistance={pullDistance} 
        $isRefreshing={isRefreshing}
      >
        {children}
      </RefreshContainer>
    </div>
  );
};