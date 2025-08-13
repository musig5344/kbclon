import React from 'react';

import styled, { keyframes, css } from 'styled-components';

import { tokens } from '../../../styles/tokens';
import { typography } from '../../../styles/typography';
import { ValidationResult } from '../../utils/validation';

interface ValidationFeedbackProps {
  validation?: ValidationResult;
  touched?: boolean;
  showSuccess?: boolean;
  inline?: boolean;
  className?: string;
}

interface FieldValidationProps {
  label: string;
  required?: boolean;
  error?: string;
  success?: boolean;
  helper?: string;
  children: React.ReactNode;
  className?: string;
}

// Animations
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
`;

// Styled Components
const FeedbackContainer = styled.div<{ $inline?: boolean }>`
  margin-top: ${props => (props.$inline ? '0' : '4px')};
  display: ${props => (props.$inline ? 'inline-flex' : 'block')};
  align-items: center;
  gap: 4px;
`;

const FeedbackMessage = styled.div<{ $type: 'error' | 'success' | 'helper' }>`
  font-family: ${typography.fontFamily.kbfgTextLight};
  font-size: 12px;
  line-height: 1.4;
  animation: ${slideIn} 0.2s ease-out;

  ${props => {
    switch (props.$type) {
      case 'error':
        return css`
          color: #dc2626;
        `;
      case 'success':
        return css`
          color: #16a34a;
        `;
      case 'helper':
        return css`
          color: ${tokens.colors.text.tertiary};
        `;
    }
  }}
`;

const FeedbackIcon = styled.span<{ $type: 'error' | 'success' }>`
  display: inline-flex;
  width: 16px;
  height: 16px;
  flex-shrink: 0;

  svg {
    width: 100%;
    height: 100%;
  }
`;

const ErrorList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const ErrorItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`;

// Field Validation Container
const FieldContainer = styled.div`
  margin-bottom: 20px;
`;

const FieldLabel = styled.label<{ $hasError?: boolean }>`
  display: block;
  font-family: ${typography.fontFamily.kbfgTextMedium};
  font-size: 14px;
  font-weight: 500;
  color: ${tokens.colors.text.primary};
  margin-bottom: 8px;

  ${props =>
    props.$hasError &&
    css`
      color: #dc2626;
    `}
`;

const RequiredMark = styled.span`
  color: #dc2626;
  margin-left: 2px;
`;

const InputWrapper = styled.div<{ $hasError?: boolean; $success?: boolean }>`
  position: relative;

  ${props =>
    props.$hasError &&
    css`
      animation: ${shake} 0.3s ease-out;

      input,
      textarea,
      select {
        border-color: #dc2626;

        &:focus {
          border-color: #dc2626;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }
      }
    `}

  ${props =>
    props.$success &&
    css`
      input,
      textarea,
      select {
        border-color: #16a34a;

        &:focus {
          border-color: #16a34a;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
        }
      }
    `}
`;

const ValidationIcon = styled.div<{ $type: 'error' | 'success' }>`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;

  ${props =>
    props.$type === 'error' &&
    css`
      color: #dc2626;
    `}

  ${props =>
    props.$type === 'success' &&
    css`
      color: #16a34a;
    `}
`;

// Icons
const ErrorIcon = () => (
  <svg viewBox='0 0 16 16' fill='currentColor'>
    <path
      fillRule='evenodd'
      d='M8 15A7 7 0 108 1a7 7 0 000 14zm0-1A6 6 0 118 2a6 6 0 010 12zm-.707-9.293a1 1 0 011.414 0L10 6l-1.293 1.293a1 1 0 01-1.414-1.414L8.586 5 7.293 3.707a1 1 0 010-1.414zM6 9a1 1 0 011-1h2a1 1 0 110 2H7a1 1 0 01-1-1z'
      clipRule='evenodd'
    />
  </svg>
);

const SuccessIcon = () => (
  <svg viewBox='0 0 16 16' fill='currentColor'>
    <path
      fillRule='evenodd'
      d='M8 15A7 7 0 108 1a7 7 0 000 14zm0-1A6 6 0 118 2a6 6 0 010 12zm3.707-8.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L7 9.586l3.293-3.293a1 1 0 011.414 0z'
      clipRule='evenodd'
    />
  </svg>
);

// Validation Feedback Component
export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  validation,
  touched,
  showSuccess = false,
  inline = false,
  className,
}) => {
  if (!touched || !validation) return null;

  const hasErrors = !validation.isValid && validation.errors.length > 0;
  const isSuccess = validation.isValid && showSuccess;

  if (!hasErrors && !isSuccess) return null;

  return (
    <FeedbackContainer $inline={inline} className={className}>
      {hasErrors && (
        <>
          {inline ? (
            <FeedbackMessage $type='error'>
              <FeedbackIcon $type='error'>
                <ErrorIcon />
              </FeedbackIcon>
              {validation.errors[0]}
            </FeedbackMessage>
          ) : (
            <ErrorList>
              {validation.errors.map((error, index) => (
                <ErrorItem key={index}>
                  <FeedbackIcon $type='error'>
                    <ErrorIcon />
                  </FeedbackIcon>
                  <FeedbackMessage $type='error'>{error}</FeedbackMessage>
                </ErrorItem>
              ))}
            </ErrorList>
          )}
        </>
      )}

      {isSuccess && (
        <FeedbackMessage $type='success'>
          <FeedbackIcon $type='success'>
            <SuccessIcon />
          </FeedbackIcon>
          올바르게 입력되었습니다
        </FeedbackMessage>
      )}
    </FeedbackContainer>
  );
};

// Field Validation Component
export const FieldValidation: React.FC<FieldValidationProps> = ({
  label,
  required = false,
  error,
  success = false,
  helper,
  children,
  className,
}) => {
  const hasError = !!error;

  return (
    <FieldContainer className={className}>
      <FieldLabel $hasError={hasError}>
        {label}
        {required && <RequiredMark>*</RequiredMark>}
      </FieldLabel>

      <InputWrapper $hasError={hasError} $success={success && !hasError}>
        {children}

        {(hasError || success) && (
          <ValidationIcon $type={hasError ? 'error' : 'success'}>
            {hasError ? <ErrorIcon /> : <SuccessIcon />}
          </ValidationIcon>
        )}
      </InputWrapper>

      {hasError && (
        <FeedbackContainer>
          <FeedbackMessage $type='error'>
            <FeedbackIcon $type='error'>
              <ErrorIcon />
            </FeedbackIcon>
            {error}
          </FeedbackMessage>
        </FeedbackContainer>
      )}

      {!hasError && helper && (
        <FeedbackContainer>
          <FeedbackMessage $type='helper'>{helper}</FeedbackMessage>
        </FeedbackContainer>
      )}
    </FieldContainer>
  );
};

// Inline validation for real-time feedback
export const InlineValidation: React.FC<{
  isValid?: boolean;
  message?: string;
  show?: boolean;
}> = ({ isValid, message, show }) => {
  if (!show || !message) return null;

  return (
    <FeedbackContainer $inline>
      <FeedbackIcon $type={isValid ? 'success' : 'error'}>
        {isValid ? <SuccessIcon /> : <ErrorIcon />}
      </FeedbackIcon>
      <FeedbackMessage $type={isValid ? 'success' : 'error'}>{message}</FeedbackMessage>
    </FeedbackContainer>
  );
};

// Password strength indicator
export const PasswordStrength: React.FC<{
  password: string;
  show?: boolean;
}> = ({ password, show }) => {
  if (!show || !password) return null;

  const getStrength = (pwd: string): { level: number; label: string; color: string } => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*]/.test(pwd)) strength++;

    if (strength <= 2) return { level: 1, label: '약함', color: '#dc2626' };
    if (strength <= 3) return { level: 2, label: '보통', color: '#f59e0b' };
    if (strength <= 4) return { level: 3, label: '강함', color: '#3b82f6' };
    return { level: 4, label: '매우 강함', color: '#16a34a' };
  };

  const strength = getStrength(password);

  const StrengthContainer = styled.div`
    margin-top: 8px;
  `;

  const StrengthBar = styled.div`
    display: flex;
    gap: 4px;
    margin-bottom: 4px;
  `;

  const StrengthSegment = styled.div<{ $active: boolean; $color: string }>`
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background-color: ${props => (props.$active ? props.$color : tokens.colors.backgroundGray2)};
    transition: background-color 0.3s ease;
  `;

  const StrengthLabel = styled.div<{ $color: string }>`
    font-family: ${typography.fontFamily.kbfgTextLight};
    font-size: 12px;
    color: ${props => props.$color};
  `;

  return (
    <StrengthContainer>
      <StrengthBar>
        {[1, 2, 3, 4].map(level => (
          <StrengthSegment key={level} $active={level <= strength.level} $color={strength.color} />
        ))}
      </StrengthBar>
      <StrengthLabel $color={strength.color}>비밀번호 강도: {strength.label}</StrengthLabel>
    </StrengthContainer>
  );
};
