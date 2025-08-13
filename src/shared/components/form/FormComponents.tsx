import styled from 'styled-components';

import { tokens } from '../../../styles/tokens';
export const FormRow = styled.div<{ marginBottom?: string }>`
  margin-bottom: ${props => props.marginBottom || '24px'};
  &:last-child {
    margin-bottom: 0;
  }
`;
export const FormLabel = styled.label.attrs<{ required?: boolean }>({
  ...props => props.required && { 'aria-required': 'true' },
})<{ required?: boolean }>`
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #26282c;
  margin-bottom: 8px;
  font-family: 'KBFGText', sans-serif;
  ${props =>
    props.required &&
    `
    &::after {
      content: '*';
      color: #ff4444;
      margin-left: 4px;
      font-size: 14px;
    }
    &::before {
      content: '필수 입력 항목: ';
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `}
`;
export const FormInput = styled.input.attrs<{
  error?: boolean;
  success?: boolean;
  variant?: 'default' | 'rounded';
}>(props => ({
  'aria-invalid': props.error ? 'true' : 'false',
  'aria-describedby': props.error ? `${props.id}-error` : undefined,
}))<{
  error?: boolean;
  success?: boolean;
  variant?: 'default' | 'rounded';
}>`
  width: 100%;
  height: 48px;
  padding: 12px 16px;
  border: 1px solid ${props => (props.error ? '#ff4444' : props.success ? '#4CAF50' : '#ebeef0')};
  border-radius: ${props => (props.variant === 'rounded' ? '24px' : '8px')};
  font-size: 16px;
  font-family: 'KBFGText', sans-serif;
  background-color: ${tokens.colors.white};
  transition: border-color 0.2s ease;
  &:focus {
    outline: none;
    border-color: ${props => (props.error ? '#ff4444' : '#FFD338')};
  }
  &::placeholder {
    color: #999999;
  }
  &:disabled {
    background-color: #f5f6f8;
    color: #999999;
    cursor: not-allowed;
  }
`;
export const FormTextArea = styled.textarea<{
  error?: boolean;
  success?: boolean;
  minHeight?: string;
}>`
  width: 100%;
  min-height: ${props => props.minHeight || '100px'};
  padding: 12px 16px;
  border: 1px solid ${props => (props.error ? '#ff4444' : props.success ? '#4CAF50' : '#ebeef0')};
  border-radius: 8px;
  font-size: 16px;
  font-family: 'KBFGText', sans-serif;
  background-color: ${tokens.colors.white};
  transition: border-color 0.2s ease;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: ${props => (props.error ? '#ff4444' : '#FFD338')};
  }
  &::placeholder {
    color: #999999;
  }
  &:disabled {
    background-color: #f5f6f8;
    color: #999999;
    cursor: not-allowed;
  }
`;
export const FormSelect = styled.select<{ error?: boolean }>`
  width: 100%;
  height: 48px;
  padding: 12px 16px;
  border: 1px solid ${props => (props.error ? '#ff4444' : '#ebeef0')};
  border-radius: 8px;
  font-size: 16px;
  font-family: 'KBFGText', sans-serif;
  background-color: ${tokens.colors.white};
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  appearance: none;
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: ${props => (props.error ? '#ff4444' : '#FFD338')};
  }
  &:disabled {
    background-color: #f5f6f8;
    color: #999999;
    cursor: not-allowed;
  }
`;
export const InputWithButton = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;
export const InputButton = styled.button<{ position?: 'left' | 'right' }>`
  position: absolute;
  ${props => (props.position === 'left' ? 'left: 12px;' : 'right: 12px;')}
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666666;
  z-index: 1;
  &:hover {
    color: #333333;
  }
  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
`;
export const FormError = styled.div.attrs({
  role: 'alert',
  'aria-live': 'polite',
})`
  margin-top: 4px;
  font-size: 14px;
  color: #ff4444;
  font-family: 'KBFGText', sans-serif;
`;
export const FormSuccess = styled.div.attrs({
  role: 'status',
  'aria-live': 'polite',
})`
  margin-top: 4px;
  font-size: 14px;
  color: #4caf50;
  font-family: 'KBFGText', sans-serif;
`;
export const FormHelper = styled.div.attrs({
  role: 'note',
})`
  margin-top: 4px;
  font-size: 14px;
  color: #666666;
  font-family: 'KBFGText', sans-serif;
`;
export const FormGroup = styled.div<{ gap?: string }>`
  display: flex;
  gap: ${props => props.gap || '12px'};
  align-items: flex-start;
  > * {
    flex: 1;
  }
`;
export const RadioGroup = styled.div<{ direction?: 'row' | 'column'; gap?: string }>`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  gap: ${props => props.gap || '16px'};
  flex-wrap: wrap;
`;
export const RadioItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 16px;
  color: #26282c;
  font-family: 'KBFGText', sans-serif;
  input[type='radio'] {
    margin: 0;
    accent-color: #ffd338;
  }
`;
export const CheckboxGroup = styled.div<{ direction?: 'row' | 'column'; gap?: string }>`
  display: flex;
  flex-direction: ${props => props.direction || 'column'};
  gap: ${props => props.gap || '12px'};
`;
export const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 16px;
  color: #26282c;
  font-family: 'KBFGText', sans-serif;
  input[type='checkbox'] {
    margin: 0;
    accent-color: #ffd338;
  }
`;
export const FieldSet = styled.fieldset`
  border: 1px solid #ebeef0;
  border-radius: 8px;
  padding: 16px;
  margin: 0 0 24px 0;
  legend {
    padding: 0 8px;
    font-size: 16px;
    font-weight: 600;
    color: #26282c;
    font-family: 'KBFGText', sans-serif;
  }
`;
