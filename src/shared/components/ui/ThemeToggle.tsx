import React from 'react';

import styled from 'styled-components';

import { useTheme } from '../../contexts/ThemeContext';
import { colors } from '../../styles/colors';
import { dimensions } from '../../styles/dimensions';
import { tokens } from '../../styles/tokens';
import { typography } from '../../styles/typography';
interface ThemeToggleProps {
  variant?: 'switch' | 'button' | 'icon';
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}
// KB스타뱅킹 스타일 토글 스위치
const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;
const ToggleLabel = styled.span`
  font-family: ${typography.fontFamily.kbfgTextMedium};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  user-select: none;
`;
// 스위치 스타일 토글
const SwitchContainer = styled.label<{ $size: string }>`
  position: relative;
  display: inline-block;
  cursor: pointer;
  ${props => {
    const sizeMap = {
      small: { width: 40, height: 20, padding: 2 },
      medium: { width: 52, height: 28, padding: 3 },
      large: { width: 60, height: 32, padding: 4 },
    };
    const { width, height, padding } =
      sizeMap[props.$size as keyof typeof sizeMap] || sizeMap.medium;
    return `
      width: ${width}px;
      height: ${height}px;
      --toggle-padding: ${padding}px;
      --toggle-size: ${height - padding * 2}px;
    `;
  }}
`;
const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
`;
const SwitchSlider = styled.span<{ $checked: boolean }>`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50px;
  transition: all 0.3s ease;
  background-color: ${props =>
    props.$checked ? tokens.colors.brand.primary : colors.backgroundGray2};
  border: 1px solid ${props => (props.$checked ? tokens.colors.brand.primaryDark : colors.border)};
  &::before {
    position: absolute;
    content: '';
    height: var(--toggle-size);
    width: var(--toggle-size);
    left: var(--toggle-padding);
    bottom: var(--toggle-padding);
    background-color: ${({ theme }) => theme.colors.background};
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transform: translateX(
      ${props => (props.$checked ? 'calc(100% + var(--toggle-padding))' : '0')}
    );
  }
`;
// 버튼 스타일 토글
const ToggleButton = styled.button<{ $active: boolean; $size: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${dimensions.borderRadius.medium}px;
  background-color: ${props =>
    props.$active ? props.theme.tokens.colors.brand.primary : props.theme.colors.background};
  color: ${props =>
    props.$active ? props.theme.colors.textPrimary : props.theme.colors.textSecondary};
  font-family: ${typography.fontFamily.kbfgTextMedium};
  cursor: pointer;
  transition: all 0.2s ease;
  ${props => {
    const sizeMap = {
      small: { padding: '6px 12px', fontSize: '12px' },
      medium: { padding: '8px 16px', fontSize: '14px' },
      large: { padding: '12px 20px', fontSize: '16px' },
    };
    const { padding, fontSize } = sizeMap[props.$size as keyof typeof sizeMap] || sizeMap.medium;
    return `
      padding: ${padding};
      font-size: ${fontSize};
    `;
  }}
  &:hover {
    background-color: ${props =>
      props.$active ? tokens.colors.brand.primaryLight : colors.backgroundGray1};
  }
  &:active {
    transform: scale(0.98);
  }
`;
// 아이콘 전용 토글
const IconToggle = styled.button<{ $size: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;
  ${props => {
    const sizeMap = {
      small: { size: 32, fontSize: '16px' },
      medium: { size: 40, fontSize: '18px' },
      large: { size: 48, fontSize: '20px' },
    };
    const { size, fontSize } = sizeMap[props.$size as keyof typeof sizeMap] || sizeMap.medium;
    return `
      width: ${size}px;
      height: ${size}px;
      font-size: ${fontSize};
    `;
  }}
  &:hover {
    background-color: ${tokens.colors.backgroundGray1};
    color: ${tokens.colors.brand.primary};
  }
  &:active {
    transform: scale(0.95);
  }
`;
const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'switch',
  showLabel = true,
  size = 'medium',
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const renderToggle = () => {
    switch (variant) {
      case 'button':
        return (
          <ToggleButton $active={isDarkMode} $size={size} onClick={toggleTheme} type='button'>
            {isDarkMode ? '🌙' : '☀️'}
            {showLabel && (isDarkMode ? '다크 모드' : '라이트 모드')}
          </ToggleButton>
        );
      case 'icon':
        return (
          <IconToggle
            $size={size}
            onClick={toggleTheme}
            type='button'
            title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </IconToggle>
        );
      case 'switch':
      default:
        return (
          <ToggleContainer>
            {showLabel && <ToggleLabel>{isDarkMode ? '다크 모드' : '라이트 모드'}</ToggleLabel>}
            <SwitchContainer $size={size}>
              <SwitchInput type='checkbox' checked={isDarkMode} onChange={toggleTheme} />
              <SwitchSlider $checked={isDarkMode} />
            </SwitchContainer>
          </ToggleContainer>
        );
    }
  };
  return renderToggle();
};
export default ThemeToggle;
