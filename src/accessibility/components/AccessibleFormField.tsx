/**
 * 접근 가능한 폼 필드 컴포넌트
 * WCAG 2.1 레이블, 오류 메시지, 도움말 텍스트 지원
 */

import React, { useId, forwardRef, InputHTMLAttributes } from 'react';

import styled from 'styled-components';

import { AccessibleFormFieldProps } from '../types';
import { setAriaInvalid } from '../utils/aria';
import { announceFormValidation } from '../utils/screenReader';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>, AccessibleFormFieldProps {
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormFieldContainer = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label<{ required?: boolean }>`
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};

  ${({ required, theme }) => required && `
    &::after {
      content: ' *';
      color: ${theme.colors.error};
    }
  `}
`;

const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid ${({ theme, hasError }) => 
    hasError ? theme.colors.error : theme.colors.border};
  border-radius: 4px;
  font-size: 16px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: all 0.2s ease;

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accentBlue};
    outline-offset: 2px;
    border-color: ${({ theme }) => theme.colors.accentBlue};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.backgroundGray1};
    color: ${({ theme }) => theme.colors.textTertiary};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textHint};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const HelperText = styled.span`
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ErrorMessage = styled.span`
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error};
  font-weight: 500;
`;

const VisuallyHidden = styled.span`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

export const AccessibleFormField = forwardRef<HTMLInputElement, Props>(
  ({ 
    id,
    label, 
    error, 
    helperText, 
    required, 
    ariaDescribedBy,
    type = 'text',
    value,
    onChange,
    ...inputProps 
  }, ref) => {
    const generatedId = useId();
    const fieldId = id || generatedId;
    const errorId = `${fieldId}-error`;
    const helperId = `${fieldId}-helper`;
    
    const describedBy = [
      error && errorId,
      helperText && helperId,
      ariaDescribedBy
    ].filter(Boolean).join(' ');

    React.useEffect(() => {
      if (error) {
        announceFormValidation(label, error);
      }
    }, [error, label]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      }
      
      // 실시간 검증 피드백
      const input = e.target;
      if (input.validity.valid) {
        setAriaInvalid(input, false);
      }
    };

    return (
      <FormFieldContainer>
        <Label htmlFor={fieldId} required={required}>
          {label}
          {required && <VisuallyHidden> (필수)</VisuallyHidden>}
        </Label>
        
        <Input
          ref={ref}
          id={fieldId}
          type={type}
          value={value}
          onChange={handleChange}
          hasError={!!error}
          aria-invalid={!!error}
          aria-errormessage={error ? errorId : undefined}
          aria-describedby={describedBy || undefined}
          aria-required={required}
          {...inputProps}
        />
        
        {error && (
          <ErrorMessage id={errorId} role="alert">
            {error}
          </ErrorMessage>
        )}
        
        {helperText && !error && (
          <HelperText id={helperId}>
            {helperText}
          </HelperText>
        )}
      </FormFieldContainer>
    );
  }
);

AccessibleFormField.displayName = 'AccessibleFormField';