/**
 * KB StarBanking 키보드 최적화 드롭다운 컴포넌트
 * 완전한 키보드 네비게이션 지원
 */

import React, { useState, useRef, useEffect, useCallback, KeyboardEvent, MouseEvent } from 'react';

import styled from 'styled-components';

import { globalKeyboardTrapManager } from '../core/KeyboardTrapManager';

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

interface KeyboardDropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  searchable?: boolean;
  multiSelect?: boolean;
  maxHeight?: number;
  onChange: (value: string | string[]) => void;
  onSearch?: (query: string) => void;
  className?: string;
  'aria-describedby'?: string;
}

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const Label = styled.label<{ required?: boolean }>`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;

  ${props =>
    props.required &&
    `
    &::after {
      content: ' *';
      color: #e74c3c;
    }
  `}
`;

const TriggerButton = styled.button<{ isOpen?: boolean; hasError?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${props => (props.hasError ? '#e74c3c' : '#ddd')};
  border-radius: 8px;
  background: white;
  font-size: 16px;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: #007bff;
  }

  &:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
    border-color: #007bff;
  }

  &:disabled {
    background: #f5f5f5;
    color: #999;
    cursor: not-allowed;
  }

  ${props =>
    props.isOpen &&
    `
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  `}
`;

const DropdownIcon = styled.span<{ isOpen?: boolean }>`
  transition: transform 0.2s ease;
  transform: ${props => (props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};

  &::after {
    content: '▼';
    font-size: 12px;
    color: #666;
  }
`;

const DropdownMenu = styled.div<{ maxHeight?: number }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border: 2px solid #007bff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: ${props => props.maxHeight || 300}px;
  overflow-y: auto;
  margin-top: 4px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid #eee;
  font-size: 16px;
  outline: none;

  &:focus {
    border-bottom-color: #007bff;
  }
`;

const OptionsList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const OptionItem = styled.li<{ isHighlighted?: boolean; isSelected?: boolean; disabled?: boolean }>`
  padding: 12px 16px;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.1s ease;

  ${props =>
    props.disabled &&
    `
    color: #999;
    background: #f9f9f9;
  `}

  ${props =>
    props.isSelected &&
    !props.disabled &&
    `
    background: #e3f2fd;
    color: #1976d2;
    font-weight: 500;
  `}
  
  ${props =>
    props.isHighlighted &&
    !props.disabled &&
    `
    background: #f0f8ff;
    outline: 2px solid #007bff;
    outline-offset: -2px;
  `}
  
  &:hover:not([disabled]) {
    background: #f0f8ff;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const OptionDescription = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 2px;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
`;

const ScreenReaderText = styled.span`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

export const KeyboardDropdown: React.FC<KeyboardDropdownProps> = ({
  options,
  value,
  placeholder = '선택하세요',
  label,
  disabled = false,
  error,
  required = false,
  searchable = false,
  multiSelect = false,
  maxHeight,
  onChange,
  onSearch,
  className,
  'aria-describedby': ariaDescribedBy,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>(
    multiSelect ? (Array.isArray(value) ? value : value ? [value] : []) : value ? [value] : []
  );

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const dropdownId = useRef(`dropdown-${Math.random().toString(36).substr(2, 9)}`);

  // 필터링된 옵션들
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    return options.filter(
      option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  // 선택된 옵션 표시 텍스트
  const displayText = React.useMemo(() => {
    if (selectedValues.length === 0) return placeholder;

    if (multiSelect) {
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0]);
        return option?.label || selectedValues[0];
      }
      return `${selectedValues.length}개 선택됨`;
    }

    const option = options.find(opt => opt.value === selectedValues[0]);
    return option?.label || selectedValues[0];
  }, [selectedValues, options, multiSelect, placeholder]);

  // 드롭다운 열기/닫기
  const toggleDropdown = useCallback(() => {
    if (disabled) return;

    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }, [isOpen, disabled]);

  const openDropdown = useCallback(() => {
    setIsOpen(true);
    setHighlightedIndex(
      selectedValues.length > 0
        ? filteredOptions.findIndex(opt => opt.value === selectedValues[0])
        : 0
    );

    // 키보드 트랩 활성화
    if (menuRef.current) {
      globalKeyboardTrapManager.addTrap(menuRef.current, {
        autoFocus: searchable,
        escapeDeactivates: true,
        returnFocusOnDeactivate: true,
      });
    }
  }, [filteredOptions, selectedValues, searchable]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);

    // 키보드 트랩 제거
    if (menuRef.current) {
      globalKeyboardTrapManager.removeTrap(menuRef.current);
    }

    // 포커스를 트리거로 복원
    triggerRef.current?.focus();
  }, []);

  // 옵션 선택
  const selectOption = useCallback(
    (optionValue: string) => {
      if (multiSelect) {
        const newSelection = selectedValues.includes(optionValue)
          ? selectedValues.filter(v => v !== optionValue)
          : [...selectedValues, optionValue];

        setSelectedValues(newSelection);
        onChange(newSelection);
      } else {
        setSelectedValues([optionValue]);
        onChange(optionValue);
        closeDropdown();
      }
    },
    [multiSelect, selectedValues, onChange, closeDropdown]
  );

  // 키보드 네비게이션
  const handleTriggerKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
        case ' ':
        case 'ArrowDown':
        case 'ArrowUp':
          event.preventDefault();
          if (!isOpen) {
            openDropdown();
          }
          break;
        case 'Escape':
          if (isOpen) {
            event.preventDefault();
            closeDropdown();
          }
          break;
      }
    },
    [isOpen, openDropdown, closeDropdown]
  );

  const handleMenuKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev => {
            const nextIndex = prev < filteredOptions.length - 1 ? prev + 1 : 0;
            return filteredOptions[nextIndex]?.disabled
              ? Math.min(nextIndex + 1, filteredOptions.length - 1)
              : nextIndex;
          });
          break;

        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : filteredOptions.length - 1;
            return filteredOptions[nextIndex]?.disabled ? Math.max(nextIndex - 1, 0) : nextIndex;
          });
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (highlightedIndex >= 0 && !filteredOptions[highlightedIndex]?.disabled) {
            selectOption(filteredOptions[highlightedIndex].value);
          }
          break;

        case 'Escape':
          event.preventDefault();
          closeDropdown();
          break;

        case 'Home':
          event.preventDefault();
          setHighlightedIndex(0);
          break;

        case 'End':
          event.preventDefault();
          setHighlightedIndex(filteredOptions.length - 1);
          break;
      }
    },
    [filteredOptions, highlightedIndex, selectOption, closeDropdown]
  );

  // 검색 처리
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setHighlightedIndex(0);
      onSearch?.(query);
    },
    [onSearch]
  );

  // 클릭 외부 영역 처리
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const target = event.target as HTMLElement;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, closeDropdown]);

  // 하이라이트된 옵션으로 스크롤
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [highlightedIndex, isOpen]);

  // 검색 입력에 초기 포커스
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [isOpen, searchable]);

  return (
    <Container className={className}>
      {label && (
        <Label htmlFor={dropdownId.current} required={required}>
          {label}
        </Label>
      )}

      <TriggerButton
        ref={triggerRef}
        id={dropdownId.current}
        type='button'
        disabled={disabled}
        isOpen={isOpen}
        hasError={!!error}
        onClick={toggleDropdown}
        onKeyDown={handleTriggerKeyDown}
        aria-expanded={isOpen}
        aria-haspopup='listbox'
        aria-describedby={ariaDescribedBy}
        aria-required={required}
        aria-invalid={!!error}
      >
        <span>{displayText}</span>
        <DropdownIcon isOpen={isOpen} />
      </TriggerButton>

      {isOpen && (
        <DropdownMenu
          ref={menuRef}
          maxHeight={maxHeight}
          onKeyDown={handleMenuKeyDown}
          role='listbox'
          aria-multiselectable={multiSelect}
          aria-activedescendant={
            highlightedIndex >= 0 ? `${dropdownId.current}-option-${highlightedIndex}` : undefined
          }
        >
          {searchable && (
            <SearchInput
              ref={searchRef}
              type='text'
              placeholder='검색...'
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              aria-label='옵션 검색'
            />
          )}

          <OptionsList>
            {filteredOptions.map((option, index) => (
              <OptionItem
                key={option.value}
                ref={el => (optionRefs.current[index] = el)}
                id={`${dropdownId.current}-option-${index}`}
                role='option'
                isHighlighted={index === highlightedIndex}
                isSelected={selectedValues.includes(option.value)}
                disabled={option.disabled}
                aria-selected={selectedValues.includes(option.value)}
                aria-disabled={option.disabled}
                onClick={() => !option.disabled && selectOption(option.value)}
              >
                {option.icon && <span>{option.icon}</span>}
                <div>
                  <div>{option.label}</div>
                  {option.description && (
                    <OptionDescription>{option.description}</OptionDescription>
                  )}
                </div>
                {multiSelect && selectedValues.includes(option.value) && (
                  <ScreenReaderText>(선택됨)</ScreenReaderText>
                )}
              </OptionItem>
            ))}

            {filteredOptions.length === 0 && (
              <OptionItem disabled>
                {searchQuery ? '검색 결과가 없습니다' : '옵션이 없습니다'}
              </OptionItem>
            )}
          </OptionsList>
        </DropdownMenu>
      )}

      {error && (
        <ErrorMessage role='alert' aria-live='polite'>
          {error}
        </ErrorMessage>
      )}
    </Container>
  );
};

export default KeyboardDropdown;
