/**
 * KB StarBanking 가상 키보드 컴포넌트
 * 보안이 중요한 뱅킹 정보 입력을 위한 가상 키보드
 */

import React, { useState, useRef, useEffect, useCallback, KeyboardEvent, useMemo } from 'react';

import styled from 'styled-components';

import { globalKeyboardTrapManager } from '../core/KeyboardTrapManager';
import { VirtualKeyboardOptions } from '../types';

interface VirtualKeyboardProps extends VirtualKeyboardOptions {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: ${props => (props.isOpen ? 'flex' : 'none')};
  align-items: flex-end;
  justify-content: center;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 0;
    align-items: flex-end;
  }
`;

const KeyboardContainer = styled.div<{ type: string }>`
  background: white;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.2);
  padding: 20px;
  width: 100%;
  max-width: ${props => (props.type === 'numeric' ? '400px' : '800px')};
  max-height: 80vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    border-radius: 16px 16px 0 0;
    max-width: 100%;
    padding: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: #f8f9fa;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;

  &:hover {
    background: #e9ecef;
    color: #333;
  }

  &:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }
`;

const Display = styled.div<{ secured?: boolean }>`
  width: 100%;
  padding: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: #f8f9fa;
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 20px;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', monospace;
  letter-spacing: ${props => (props.secured ? '4px' : '2px')};
  color: #333;
`;

const KeyboardGrid = styled.div<{ layout: string }>`
  display: grid;
  gap: 8px;

  ${props => {
    switch (props.layout) {
      case 'numeric':
        return 'grid-template-columns: repeat(3, 1fr);';
      case 'standard':
        return `
          grid-template-areas:
            "q w e r t y u i o p"
            "a s d f g h j k l del"
            "shift z x c v b n m enter"
            "space space space space space space space space space space";
          grid-template-columns: repeat(10, 1fr);
        `;
      case 'banking':
        return 'grid-template-columns: repeat(4, 1fr);';
      default:
        return 'grid-template-columns: repeat(3, 1fr);';
    }
  }}
`;

const Key = styled.button<{
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  gridArea?: string;
  isActive?: boolean;
}>`
  height: ${props => {
    switch (props.size) {
      case 'small':
        return '40px';
      case 'large':
        return '60px';
      default:
        return '50px';
    }
  }};
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: ${props => (props.size === 'small' ? '14px' : '16px')};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  user-select: none;

  ${props => props.gridArea && `grid-area: ${props.gridArea};`}

  ${props =>
    props.isActive &&
    `
    background: #e3f2fd;
    border-color: #1976d2;
    transform: scale(0.95);
  `}
  
  &:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #007bff;
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0) scale(0.95);
  }

  &:focus {
    outline: 3px solid #007bff;
    outline-offset: 2px;
    border-color: #007bff;
  }

  &:disabled {
    background: #f5f5f5;
    color: #ccc;
    cursor: not-allowed;
    border-color: #eee;
  }

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #007bff;
          color: white;
          border-color: #0056b3;
          
          &:hover:not(:disabled) {
            background: #0056b3;
          }
        `;
      case 'secondary':
        return `
          background: #6c757d;
          color: white;
          border-color: #545b62;
          
          &:hover:not(:disabled) {
            background: #545b62;
          }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          border-color: #c82333;
          
          &:hover:not(:disabled) {
            background: #c82333;
          }
        `;
      case 'success':
        return `
          background: #28a745;
          color: white;
          border-color: #1e7e34;
          
          &:hover:not(:disabled) {
            background: #1e7e34;
          }
        `;
      default:
        return '';
    }
  }}
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: space-between;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #007bff;
          color: white;
          border-color: #0056b3;
          
          &:hover:not(:disabled) {
            background: #0056b3;
          }
        `;
      case 'secondary':
        return `
          background: #6c757d;
          color: white;
          border-color: #545b62;
          
          &:hover:not(:disabled) {
            background: #545b62;
          }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          border-color: #c82333;
          
          &:hover:not(:disabled) {
            background: #c82333;
          }
        `;
      default:
        return '';
    }
  }}
`;

const SecurityNotice = styled.div`
  font-size: 12px;
  color: #666;
  text-align: center;
  margin-top: 12px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #17a2b8;
`;

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  type = 'numeric',
  layout = 'standard',
  scramble = false,
  maxLength,
  onInput,
  onComplete,
  isOpen,
  onClose,
  className,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [capsLock, setCapsLock] = useState(false);
  const [shift, setShift] = useState(false);

  const keyboardRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  // 키 레이아웃 생성
  const keyLayout = useMemo(() => {
    switch (type) {
      case 'numeric': {
        const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

        if (scramble) {
          // 숫자 스크램블
          const shuffled = [...numbers];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          return [
            ...shuffled.slice(0, 9),
            { key: 'clear', label: '지우기', variant: 'danger' as const },
            shuffled[9],
            { key: 'backspace', label: '⌫', variant: 'secondary' as const },
          ];
        }

        return [
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          { key: 'clear', label: '지우기', variant: 'danger' as const },
          '0',
          { key: 'backspace', label: '⌫', variant: 'secondary' as const },
        ];
      }

      case 'password': {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        const shuffled = scramble
          ? chars.split('').sort(() => Math.random() - 0.5)
          : chars.split('');

        return [
          ...shuffled.slice(0, 36),
          { key: 'shift', label: '⇧', variant: 'secondary' as const },
          { key: 'caps', label: '⇪', variant: 'secondary' as const },
          { key: 'backspace', label: '⌫', variant: 'secondary' as const },
          { key: 'clear', label: '지우기', variant: 'danger' as const },
        ];
      }

      case 'custom':
      case 'text':
      default: {
        const qwerty = [
          ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
          ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
          ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
        ];

        if (layout === 'banking') {
          // 뱅킹 특화 레이아웃
          return [
            '1',
            '2',
            '3',
            { key: 'backspace', label: '⌫', variant: 'secondary' as const },
            '4',
            '5',
            '6',
            { key: 'clear', label: '지우기', variant: 'danger' as const },
            '7',
            '8',
            '9',
            { key: 'space', label: '공백', variant: 'secondary' as const },
            '*',
            '0',
            '#',
            { key: 'enter', label: '확인', variant: 'primary' as const },
          ];
        }

        return qwerty.flat();
      }
    }
  }, [type, layout, scramble]);

  // 키 입력 처리
  const handleKeyPress = useCallback(
    (key: string | { key: string; label: string; variant?: string }) => {
      const keyValue = typeof key === 'string' ? key : key.key;

      setActiveKey(keyValue);
      setTimeout(() => setActiveKey(null), 150);

      switch (keyValue) {
        case 'backspace':
          if (inputValue.length > 0) {
            const newValue = inputValue.slice(0, -1);
            setInputValue(newValue);
            onInput?.(newValue);
          }
          break;

        case 'clear':
          setInputValue('');
          onInput?.('');
          break;

        case 'enter':
          if (inputValue && onComplete) {
            onComplete(inputValue);
          }
          break;

        case 'space':
          if (!maxLength || inputValue.length < maxLength) {
            const newValue = inputValue + ' ';
            setInputValue(newValue);
            onInput?.(newValue);
          }
          break;

        case 'shift':
          setShift(!shift);
          break;

        case 'caps':
          setCapsLock(!capsLock);
          setShift(false);
          break;

        default:
          if (!maxLength || inputValue.length < maxLength) {
            let char = typeof key === 'string' ? key : keyValue;

            if (shift || capsLock) {
              char = char.toUpperCase();
            }

            const newValue = inputValue + char;
            setInputValue(newValue);
            onInput?.(newValue);

            // Shift는 한 번 누르면 해제
            if (shift && !capsLock) {
              setShift(false);
            }
          }
          break;
      }
    },
    [inputValue, maxLength, onInput, onComplete, shift, capsLock]
  );

  // 실제 키보드 입력 비활성화
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    event.preventDefault();
  }, []);

  // 키보드 트랩 설정
  useEffect(() => {
    if (isOpen && keyboardRef.current) {
      globalKeyboardTrapManager.addTrap(keyboardRef.current, {
        autoFocus: true,
        escapeDeactivates: true,
        returnFocusOnDeactivate: true,
      });

      return () => {
        if (keyboardRef.current) {
          globalKeyboardTrapManager.removeTrap(keyboardRef.current);
        }
      };
    }
  }, [isOpen]);

  // 완료 처리
  const handleComplete = () => {
    if (onComplete && inputValue) {
      onComplete(inputValue);
    }
    onClose();
  };

  // 취소 처리
  const handleCancel = () => {
    setInputValue('');
    onClose();
  };

  // 표시 값 (보안 타입인 경우 마스킹)
  const displayValue = useMemo(() => {
    if (type === 'password') {
      return '●'.repeat(inputValue.length);
    }
    return inputValue || '입력을 시작하세요';
  }, [inputValue, type]);

  if (!isOpen) return null;

  return (
    <Overlay isOpen={isOpen} onClick={onClose}>
      <KeyboardContainer
        ref={keyboardRef}
        type={type}
        className={className}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <Header>
          <Title>
            {type === 'numeric' && '숫자 입력'}
            {type === 'password' && '비밀번호 입력'}
            {type === 'text' && '텍스트 입력'}
            {type === 'custom' && '보안 입력'}
          </Title>
          <CloseButton onClick={onClose} aria-label='키보드 닫기'>
            ✕
          </CloseButton>
        </Header>

        <Display ref={displayRef} secured={type === 'password'} aria-live='polite'>
          {displayValue}
        </Display>

        <KeyboardGrid layout={layout}>
          {keyLayout.map((key, index) => {
            const keyData = typeof key === 'string' ? { key, label: key } : key;
            const isSpecialKey = ['backspace', 'clear', 'enter', 'shift', 'caps', 'space'].includes(
              keyData.key
            );

            return (
              <Key
                key={`${keyData.key}-${index}`}
                variant={keyData.variant}
                size={isSpecialKey ? 'medium' : 'medium'}
                isActive={activeKey === keyData.key}
                onClick={() => handleKeyPress(key)}
                aria-label={
                  keyData.key === 'backspace'
                    ? '지우기'
                    : keyData.key === 'clear'
                      ? '전체 지우기'
                      : keyData.key === 'enter'
                        ? '입력 완료'
                        : keyData.key === 'space'
                          ? '공백'
                          : keyData.label
                }
              >
                {keyData.key === 'shift' && shift
                  ? '⇧'
                  : keyData.key === 'caps' && capsLock
                    ? '⇪'
                    : keyData.label}
              </Key>
            );
          })}
        </KeyboardGrid>

        <Actions>
          <ActionButton variant='secondary' onClick={handleCancel}>
            취소
          </ActionButton>
          <ActionButton variant='primary' onClick={handleComplete} disabled={!inputValue}>
            완료
          </ActionButton>
        </Actions>

        <SecurityNotice>🔒 보안을 위해 가상 키보드를 사용하여 입력하세요</SecurityNotice>
      </KeyboardContainer>
    </Overlay>
  );
};

export default VirtualKeyboard;
