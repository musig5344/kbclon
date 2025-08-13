import React, { useCallback, ReactNode } from 'react';

import styled, { css } from 'styled-components';

import { HighContrastMode } from './HighContrastManager';
import { useHighContrast, useSystemHighContrast } from './useHighContrast';

// High Contrast Toggle Button
interface HighContrastToggleProps {
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

const ToggleButton = styled.button<{ $isActive: boolean; $compact: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => (props.$compact ? '4px' : '8px')};
  padding: ${props => (props.$compact ? '8px 12px' : '12px 16px')};
  border: 2px solid currentColor;
  border-radius: 4px;
  background-color: ${props =>
    props.$isActive ? 'var(--hc-interactive-primary-bg, #000)' : 'transparent'};
  color: ${props =>
    props.$isActive ? 'var(--hc-interactive-primary-text, #fff)' : 'currentColor'};
  font-size: ${props => (props.$compact ? '14px' : '16px')};
  font-weight: 600;
  cursor: pointer;
  transition: none; /* Disabled in high contrast mode */

  &:focus {
    outline: 3px solid var(--hc-focus, #0066cc);
    outline-offset: 2px;
  }

  &:hover {
    background-color: ${props =>
      props.$isActive
        ? 'var(--hc-interactive-primary-hover, #333)'
        : 'var(--hc-interactive-secondary-hover, #f0f0f0)'};
  }

  ${props =>
    props.$isActive &&
    css`
      border-color: var(--hc-interactive-primary-border, #000);
    `}
`;

const ToggleIcon = styled.span<{ $isActive: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${props => (props.$isActive ? 'currentColor' : 'transparent')};
  border: 2px solid currentColor;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props =>
      props.$isActive ? 'var(--hc-interactive-primary-bg, #000)' : 'currentColor'};
    transform: ${props => (props.$isActive ? 'translateX(0)' : 'translateX(-2px)')};
  }
`;

export const HighContrastToggle: React.FC<HighContrastToggleProps> = ({
  className,
  showLabel = true,
  compact = false,
}) => {
  const { isActive, toggle, mode } = useHighContrast();

  const getModeLabel = (currentMode: HighContrastMode): string => {
    switch (currentMode) {
      case 'light':
        return '고대비 밝은 모드';
      case 'dark':
        return '고대비 어두운 모드';
      case 'system':
        return '시스템 고대비 모드';
      default:
        return '일반 모드';
    }
  };

  return (
    <ToggleButton
      className={className}
      $isActive={isActive}
      $compact={compact}
      onClick={toggle}
      aria-label={`고대비 모드 ${isActive ? '끄기' : '켜기'}`}
      aria-pressed={isActive}
      title={getModeLabel(mode)}
    >
      <ToggleIcon $isActive={isActive} aria-hidden='true' />
      {showLabel && <span>{compact ? (isActive ? 'ON' : 'OFF') : getModeLabel(mode)}</span>}
    </ToggleButton>
  );
};

// High Contrast Mode Selector
interface HighContrastSelectorProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

const SelectorContainer = styled.div<{ $orientation: 'horizontal' | 'vertical' }>`
  display: flex;
  flex-direction: ${props => (props.$orientation === 'vertical' ? 'column' : 'row')};
  gap: 8px;
  padding: 16px;
  border: 2px solid var(--hc-border, currentColor);
  border-radius: 8px;
  background-color: var(--hc-bg-secondary, transparent);
`;

const SelectorTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--hc-text-primary, currentColor);
`;

const ModeOption = styled.label<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid
    ${props => (props.$isSelected ? 'var(--hc-focus, #0066cc)' : 'var(--hc-border, currentColor)')};
  border-radius: 4px;
  background-color: ${props =>
    props.$isSelected ? 'var(--hc-selection, #316ac5)' : 'transparent'};
  color: ${props =>
    props.$isSelected ? 'var(--hc-text-inverse, white)' : 'var(--hc-text-primary, currentColor)'};
  cursor: pointer;
  font-weight: ${props => (props.$isSelected ? '600' : '400')};

  &:hover {
    background-color: ${props =>
      props.$isSelected ? 'var(--hc-selection, #316ac5)' : 'var(--hc-bg-tertiary, #f0f0f0)'};
  }

  &:focus-within {
    outline: 3px solid var(--hc-focus, #0066cc);
    outline-offset: 2px;
  }
`;

const RadioInput = styled.input`
  margin: 0;
  width: 16px;
  height: 16px;
  accent-color: var(--hc-focus, #0066cc);
`;

export const HighContrastSelector: React.FC<HighContrastSelectorProps> = ({
  className,
  orientation = 'vertical',
}) => {
  const { mode, setMode } = useHighContrast();
  const { isSystemSupported } = useSystemHighContrast();

  const modes: Array<{
    value: HighContrastMode;
    label: string;
    description: string;
    disabled?: boolean;
  }> = [
    { value: 'off', label: '일반 모드', description: '기본 색상 테마 사용' },
    { value: 'light', label: '고대비 밝은 모드', description: '흰 배경에 검은 텍스트' },
    { value: 'dark', label: '고대비 어두운 모드', description: '검은 배경에 흰 텍스트' },
    {
      value: 'system',
      label: '시스템 고대비 모드',
      description: '운영체제 고대비 설정 사용',
      disabled: !isSystemSupported,
    },
  ];

  return (
    <SelectorContainer className={className} $orientation={orientation}>
      <SelectorTitle>화면 모드 선택</SelectorTitle>
      {modes.map(({ value, label, description, disabled }) => (
        <ModeOption key={value} $isSelected={mode === value}>
          <RadioInput
            type='radio'
            name='high-contrast-mode'
            value={value}
            checked={mode === value}
            disabled={disabled}
            onChange={() => !disabled && setMode(value)}
            aria-describedby={`mode-${value}-desc`}
          />
          <div>
            <div>{label}</div>
            <div id={`mode-${value}-desc`} style={{ fontSize: '12px', opacity: 0.8 }}>
              {description}
            </div>
          </div>
        </ModeOption>
      ))}
    </SelectorContainer>
  );
};

// High Contrast Settings Panel
interface HighContrastSettingsProps {
  className?: string;
  onClose?: () => void;
}

const SettingsPanel = styled.div`
  max-width: 400px;
  padding: 24px;
  border: 2px solid var(--hc-border, currentColor);
  border-radius: 8px;
  background-color: var(--hc-bg-primary, white);
  color: var(--hc-text-primary, black);
`;

const SettingsTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--hc-text-primary, currentColor);
`;

const SettingGroup = styled.div`
  margin-bottom: 24px;
`;

const SettingLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 500;
  cursor: pointer;

  &:focus-within {
    outline: 2px solid var(--hc-focus, #0066cc);
    outline-offset: 1px;
    border-radius: 2px;
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: var(--hc-focus, #0066cc);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: 2px solid currentColor;
  border-radius: 4px;
  background: transparent;
  color: currentColor;
  font-size: 18px;
  cursor: pointer;

  &:focus {
    outline: 3px solid var(--hc-focus, #0066cc);
    outline-offset: 2px;
  }

  &:hover {
    background-color: var(--hc-bg-tertiary, #f0f0f0);
  }
`;

export const HighContrastSettings: React.FC<HighContrastSettingsProps> = ({
  className,
  onClose,
}) => {
  const { preferences, updatePreferences } = useHighContrast();

  const handlePreferenceChange = useCallback(
    (key: keyof typeof preferences, value: any) => {
      updatePreferences({ [key]: value });
    },
    [updatePreferences]
  );

  return (
    <SettingsPanel className={className} style={{ position: 'relative' }}>
      {onClose && (
        <CloseButton onClick={onClose} aria-label='설정 닫기' title='설정 닫기'>
          ×
        </CloseButton>
      )}

      <SettingsTitle>고대비 모드 설정</SettingsTitle>

      <HighContrastSelector />

      <SettingGroup>
        <SettingLabel>
          <Checkbox
            type='checkbox'
            checked={preferences.autoDetect}
            onChange={e => handlePreferenceChange('autoDetect', e.target.checked)}
          />
          시스템 설정 자동 감지
        </SettingLabel>
        <div style={{ fontSize: '12px', opacity: 0.8, marginLeft: '24px' }}>
          운영체제의 고대비 모드 설정을 자동으로 적용합니다
        </div>
      </SettingGroup>

      <SettingGroup>
        <SettingLabel>
          <Checkbox
            type='checkbox'
            checked={preferences.announceChanges}
            onChange={e => handlePreferenceChange('announceChanges', e.target.checked)}
          />
          모드 변경 시 음성 안내
        </SettingLabel>
        <div style={{ fontSize: '12px', opacity: 0.8, marginLeft: '24px' }}>
          화면 모드가 변경될 때 스크린 리더로 안내합니다
        </div>
      </SettingGroup>

      <SettingGroup>
        <SettingLabel>
          <Checkbox
            type='checkbox'
            checked={preferences.enhancedFocus}
            onChange={e => handlePreferenceChange('enhancedFocus', e.target.checked)}
          />
          강화된 포커스 표시
        </SettingLabel>
        <div style={{ fontSize: '12px', opacity: 0.8, marginLeft: '24px' }}>
          포커스된 요소를 더 명확하게 표시합니다
        </div>
      </SettingGroup>

      <SettingGroup>
        <SettingLabel>
          <Checkbox
            type='checkbox'
            checked={preferences.boldText}
            onChange={e => handlePreferenceChange('boldText', e.target.checked)}
          />
          굵은 글씨 사용
        </SettingLabel>
        <div style={{ fontSize: '12px', opacity: 0.8, marginLeft: '24px' }}>
          모든 텍스트를 굵게 표시하여 가독성을 향상시킵니다
        </div>
      </SettingGroup>

      <SettingGroup>
        <SettingLabel>
          <Checkbox
            type='checkbox'
            checked={preferences.largerText}
            onChange={e => handlePreferenceChange('largerText', e.target.checked)}
          />
          큰 글씨 사용
        </SettingLabel>
        <div style={{ fontSize: '12px', opacity: 0.8, marginLeft: '24px' }}>
          텍스트 크기를 20% 크게 표시합니다
        </div>
      </SettingGroup>
    </SettingsPanel>
  );
};

// High Contrast Button Component
interface HighContrastButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button = styled.button<{
  $variant: 'primary' | 'secondary' | 'danger';
  $size: 'small' | 'medium' | 'large';
  $disabled: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid;
  border-radius: 4px;
  font-weight: 600;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: none; /* Disabled in high contrast mode */

  /* Size variants */
  ${props =>
    props.$size === 'small' &&
    css`
      padding: 8px 16px;
      font-size: 14px;
      min-height: 32px;
    `}

  ${props =>
    props.$size === 'medium' &&
    css`
      padding: 12px 24px;
      font-size: 16px;
      min-height: 44px;
    `}
  
  ${props =>
    props.$size === 'large' &&
    css`
      padding: 16px 32px;
      font-size: 18px;
      min-height: 56px;
    `}
  
  /* Color variants */
  ${props =>
    props.$variant === 'primary' &&
    css`
      background-color: var(--hc-interactive-primary-bg, #000);
      color: var(--hc-interactive-primary-text, #fff);
      border-color: var(--hc-interactive-primary-border, #000);

      &:hover:not(:disabled) {
        background-color: var(--hc-interactive-primary-hover, #333);
      }

      &:active:not(:disabled) {
        background-color: var(--hc-interactive-primary-active, #1a1a1a);
      }
    `}
  
  ${props =>
    props.$variant === 'secondary' &&
    css`
      background-color: var(--hc-interactive-secondary-bg, transparent);
      color: var(--hc-interactive-secondary-text, #000);
      border-color: var(--hc-interactive-secondary-border, #000);

      &:hover:not(:disabled) {
        background-color: var(--hc-interactive-secondary-hover, #f0f0f0);
      }

      &:active:not(:disabled) {
        background-color: var(--hc-interactive-secondary-active, #e8e8e8);
      }
    `}
  
  ${props =>
    props.$variant === 'danger' &&
    css`
      background-color: var(--hc-interactive-danger-bg, #8b0000);
      color: var(--hc-interactive-danger-text, #fff);
      border-color: var(--hc-interactive-danger-border, #8b0000);

      &:hover:not(:disabled) {
        background-color: var(--hc-interactive-danger-hover, #a00000);
      }

      &:active:not(:disabled) {
        background-color: var(--hc-interactive-danger-active, #6b0000);
      }
    `}
  
  /* Disabled state */
  ${props =>
    props.$disabled &&
    css`
      background-color: var(--hc-interactive-primary-disabled, #808080);
      color: var(--hc-text-tertiary, #404040);
      border-color: var(--hc-interactive-primary-disabled, #808080);
    `}
  
  /* Focus state */
  &:focus {
    outline: 3px solid var(--hc-focus, #0066cc);
    outline-offset: 2px;
  }
`;

export const HighContrastButton: React.FC<HighContrastButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  className,
  type = 'button',
}) => {
  return (
    <Button
      type={type}
      className={className}
      $variant={variant}
      $size={size}
      $disabled={disabled}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

// High Contrast Alert Component
interface HighContrastAlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

const Alert = styled.div<{ $type: 'info' | 'success' | 'warning' | 'error' }>`
  position: relative;
  padding: 16px;
  border: 2px solid;
  border-radius: 4px;
  font-weight: 500;

  ${props =>
    props.$type === 'info' &&
    css`
      background-color: var(--hc-bg-secondary, #f0f8ff);
      color: var(--hc-text-info, #000080);
      border-color: var(--hc-text-info, #000080);
    `}

  ${props =>
    props.$type === 'success' &&
    css`
      background-color: var(--hc-bg-secondary, #f0fff0);
      color: var(--hc-text-success, #006400);
      border-color: var(--hc-text-success, #006400);
    `}
  
  ${props =>
    props.$type === 'warning' &&
    css`
      background-color: var(--hc-bg-secondary, #fffaf0);
      color: var(--hc-text-warning, #8b4000);
      border-color: var(--hc-text-warning, #8b4000);
    `}
  
  ${props =>
    props.$type === 'error' &&
    css`
      background-color: var(--hc-bg-secondary, #fff0f0);
      color: var(--hc-text-error, #8b0000);
      border-color: var(--hc-text-error, #8b0000);
    `}
`;

const AlertTitle = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
`;

const AlertClose = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: 1px solid currentColor;
  border-radius: 2px;
  background: transparent;
  color: currentColor;
  font-size: 16px;
  cursor: pointer;

  &:focus {
    outline: 2px solid var(--hc-focus, #0066cc);
    outline-offset: 1px;
  }
`;

export const HighContrastAlert: React.FC<HighContrastAlertProps> = ({
  type,
  title,
  children,
  onClose,
  className,
}) => {
  return (
    <Alert className={className} $type={type} role='alert'>
      {onClose && (
        <AlertClose onClick={onClose} aria-label='알림 닫기' title='알림 닫기'>
          ×
        </AlertClose>
      )}
      {title && <AlertTitle>{title}</AlertTitle>}
      <div>{children}</div>
    </Alert>
  );
};
