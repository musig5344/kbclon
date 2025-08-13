/**
 * Secure PIN Pad Component
 * Touch-optimized PIN entry with security features
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';

import styled from 'styled-components';

import { tokens } from '../../../styles/tokens';
import { useTouchOptimized } from '../../hooks/useTouchOptimized';
import { haptic } from '../../utils/touchOptimization';

import { RippleEffect } from './RippleEffect';
import { TouchableOpacity } from './TouchableOpacity';

// PIN pad container
const PinPadContainer = styled.div`
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  padding: 16px;
  background-color: ${tokens.colors.background.primary};
  border-radius: ${tokens.borderRadius.large};
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
`;

// PIN display
const PinDisplay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  padding: 16px;
  background-color: ${tokens.colors.background.secondary};
  border-radius: ${tokens.borderRadius.medium};
  min-height: 64px;
`;

// PIN dot
const PinDot = styled.div<{ $filled: boolean; $error?: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${props => {
    if (props.$error) return tokens.colors.error;
    if (props.$filled) return tokens.colors.brand.primary;
    return tokens.colors.border.primary;
  }};
  border: 2px solid
    ${props => {
      if (props.$error) return tokens.colors.error;
      if (props.$filled) return tokens.colors.brand.primary;
      return tokens.colors.border.primary;
    }};
  transition: all 200ms ease;
  transform: ${props => (props.$filled ? 'scale(1.1)' : 'scale(1)')};
`;

// Keypad grid
const KeypadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

// Key button
const KeyButton = styled.div<{
  $isDelete?: boolean;
  $isDisabled?: boolean;
  $isPressed?: boolean;
}>`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  color: ${props => (props.$isDisabled ? tokens.colors.text.disabled : tokens.colors.text.primary)};
  background-color: ${props => {
    if (props.$isPressed) return tokens.colors.background.tertiary;
    if (props.$isDelete) return tokens.colors.background.secondary;
    return tokens.colors.background.primary;
  }};
  border-radius: 50%;
  border: 1px solid ${tokens.colors.border.primary};
  cursor: ${props => (props.$isDisabled ? 'not-allowed' : 'pointer')};
  transition: all 150ms ease;

  &:active:not([disabled]) {
    transform: scale(0.95);
  }

  /* Delete icon */
  ${props =>
    props.$isDelete &&
    `
    font-size: 20px;
    &::before {
      content: '⌫';
    }
  `}
`;

// Biometric button
const BiometricButton = styled(TouchableOpacity)`
  width: 100%;
  padding: 16px;
  background-color: ${tokens.colors.brand.primary};
  color: white;
  border-radius: ${tokens.borderRadius.medium};
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

// Props interface
export interface SecurePinPadProps {
  onComplete: (pin: string) => void;
  onBiometric?: () => void;
  pinLength?: number;
  shuffleKeys?: boolean;
  showBiometric?: boolean;
  biometricLabel?: string;
  error?: string;
  loading?: boolean;
  maxAttempts?: number;
  onMaxAttemptsReached?: () => void;
}

// Secure PIN pad component
export const SecurePinPad: React.FC<SecurePinPadProps> = ({
  onComplete,
  onBiometric,
  pinLength = 6,
  shuffleKeys = true,
  showBiometric = false,
  biometricLabel = '생체 인증 사용',
  error,
  loading = false,
  maxAttempts = 5,
  onMaxAttemptsReached,
}) => {
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [keypadNumbers, setKeypadNumbers] = useState<number[]>([]);
  const pinRef = useRef(pin);

  // Initialize keypad numbers
  useEffect(() => {
    const numbers = Array.from({ length: 10 }, (_, i) => i);
    if (shuffleKeys) {
      // Fisher-Yates shuffle
      for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
      }
    }
    setKeypadNumbers(numbers);
  }, [shuffleKeys, attempts]); // Re-shuffle on each attempt

  // Update pin ref
  useEffect(() => {
    pinRef.current = pin;
  }, [pin]);

  // Handle number press
  const handleNumberPress = useCallback(
    (num: number) => {
      if (loading || pinRef.current.length >= pinLength) return;

      const newPin = pinRef.current + num;
      setPin(newPin);
      haptic.trigger('light');

      // Auto-submit when PIN is complete
      if (newPin.length === pinLength) {
        setTimeout(() => {
          onComplete(newPin);
        }, 100);
      }
    },
    [loading, pinLength, onComplete]
  );

  // Handle delete press
  const handleDelete = useCallback(() => {
    if (loading || pinRef.current.length === 0) return;

    setPin(prev => prev.slice(0, -1));
    haptic.trigger('light');
  }, [loading]);

  // Handle clear
  const handleClear = useCallback(() => {
    setPin('');
    haptic.trigger('warning');
  }, []);

  // Handle error
  useEffect(() => {
    if (error) {
      setIsShaking(true);
      haptic.error();

      // Clear PIN after error
      setTimeout(() => {
        setPin('');
        setIsShaking(false);

        // Track attempts
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (maxAttempts && newAttempts >= maxAttempts) {
          onMaxAttemptsReached?.();
        }
      }, 500);
    }
  }, [error, attempts, maxAttempts, onMaxAttemptsReached]);

  // Render keypad button
  const renderKeyButton = (value: number | 'delete', index: number) => {
    const isDelete = value === 'delete';
    const displayValue = isDelete ? '' : value.toString();

    return (
      <RippleEffect key={`key-${index}`} color='rgba(0, 0, 0, 0.1)' duration={400}>
        <TouchableOpacity
          onPress={() => {
            if (isDelete) {
              handleDelete();
            } else {
              handleNumberPress(value as number);
            }
          }}
          onLongPress={isDelete ? handleClear : undefined}
          activeOpacity={0.8}
          disabled={loading}
          enableHaptic={true}
          hapticStyle='light'
          style={{ width: '100%', height: '100%' }}
        >
          <KeyButton $isDelete={isDelete} $isDisabled={loading}>
            {displayValue}
          </KeyButton>
        </TouchableOpacity>
      </RippleEffect>
    );
  };

  // Create keypad layout
  const keypadLayout = [
    keypadNumbers[1],
    keypadNumbers[2],
    keypadNumbers[3],
    keypadNumbers[4],
    keypadNumbers[5],
    keypadNumbers[6],
    keypadNumbers[7],
    keypadNumbers[8],
    keypadNumbers[9],
    '',
    keypadNumbers[0],
    'delete',
  ];

  return (
    <PinPadContainer>
      {/* PIN Display */}
      <PinDisplay
        style={{
          animation: isShaking ? 'shake 0.5s' : 'none',
        }}
      >
        {Array.from({ length: pinLength }, (_, i) => (
          <PinDot key={i} $filled={i < pin.length} $error={!!error} />
        ))}
      </PinDisplay>

      {/* Error message */}
      {error && (
        <div
          style={{
            color: tokens.colors.error,
            textAlign: 'center',
            marginBottom: 16,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {/* Keypad */}
      <KeypadGrid>
        {keypadLayout.map((value, index) => {
          if (value === '') {
            return <div key={`empty-${index}`} />;
          }
          return renderKeyButton(value, index);
        })}
      </KeypadGrid>

      {/* Biometric button */}
      {showBiometric && onBiometric && (
        <BiometricButton
          onPress={onBiometric}
          disabled={loading}
          enableHaptic={true}
          hapticStyle='medium'
        >
          {biometricLabel}
        </BiometricButton>
      )}

      {/* CSS for shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-10px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(10px);
          }
        }
      `}</style>
    </PinPadContainer>
  );
};

// PIN input field component (for visible PIN entry)
const PinInputContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 32px 0;
`;

const PinInputBox = styled.input<{ $error?: boolean }>`
  width: 48px;
  height: 56px;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  border: 2px solid ${props => (props.$error ? tokens.colors.error : tokens.colors.border.primary)};
  border-radius: ${tokens.borderRadius.medium};
  background-color: ${tokens.colors.background.primary};
  color: ${tokens.colors.text.primary};
  transition: all 200ms ease;

  &:focus {
    outline: none;
    border-color: ${props => (props.$error ? tokens.colors.error : tokens.colors.brand.primary)};
    transform: scale(1.05);
  }

  &:disabled {
    background-color: ${tokens.colors.background.secondary};
    cursor: not-allowed;
  }
`;

export interface PinInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  secure?: boolean;
}

export const PinInputField: React.FC<PinInputFieldProps> = ({
  value,
  onChange,
  onComplete,
  length = 6,
  error = false,
  disabled = false,
  autoFocus = true,
  secure = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle input change
  const handleChange = useCallback(
    (index: number, inputValue: string) => {
      if (disabled) return;

      // Only allow numbers
      const numericValue = inputValue.replace(/[^0-9]/g, '');
      if (numericValue.length > 1) return;

      // Update value
      const newValue = value.split('');
      newValue[index] = numericValue;
      const joinedValue = newValue.join('').slice(0, length);

      onChange(joinedValue);

      // Move focus
      if (numericValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Check completion
      if (joinedValue.length === length && onComplete) {
        onComplete(joinedValue);
      }

      haptic.trigger('light');
    },
    [disabled, value, length, onChange, onComplete]
  );

  // Handle keydown
  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (disabled) return;

      if (e.key === 'Backspace' && !value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [disabled, value]
  );

  // Handle paste
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (disabled) return;

      e.preventDefault();
      const pastedData = e.clipboardData.getData('text/plain');
      const numericData = pastedData.replace(/[^0-9]/g, '').slice(0, length);

      onChange(numericData);

      // Focus last input or next empty
      const focusIndex = Math.min(numericData.length, length - 1);
      inputRefs.current[focusIndex]?.focus();

      if (numericData.length === length && onComplete) {
        onComplete(numericData);
      }
    },
    [disabled, length, onChange, onComplete]
  );

  return (
    <PinInputContainer>
      {Array.from({ length }, (_, index) => (
        <PinInputBox
          key={index}
          ref={el => (inputRefs.current[index] = el)}
          type={secure ? 'password' : 'text'}
          inputMode='numeric'
          pattern='[0-9]*'
          maxLength={1}
          value={value[index] || ''}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          $error={error}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
        />
      ))}
    </PinInputContainer>
  );
};

export default SecurePinPad;
