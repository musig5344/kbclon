/**
 * 접근 가능한 날짜 선택 컴포넌트
 * WCAG 2.1 날짜 입력 및 키보드 네비게이션 지원
 */

import React, { useState, useRef, useEffect } from 'react';

import styled from 'styled-components';

import { AccessibleDatePickerProps } from '../types';
import { FocusTrap } from '../utils/focusManagement';
import { announce, formatDateForScreenReader } from '../utils/screenReader';

interface Props extends AccessibleDatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  error?: string;
  className?: string;
}

const Container = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  height: 48px;
  padding: 0 48px 0 16px;
  border: 1px solid
    ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.border)};
  border-radius: 4px;
  font-size: 16px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;

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
`;

const CalendarIcon = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accentBlue};
    outline-offset: 2px;
  }
`;

const CalendarPopup = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 1000;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  min-width: 280px;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const MonthYear = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const NavigationButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textPrimary};
  border-radius: 4px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundGray1};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accentBlue};
    outline-offset: -2px;
  }
`;

const WeekDays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
`;

const WeekDay = styled.div`
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 4px;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const DayButton = styled.button<{
  isSelected?: boolean;
  isToday?: boolean;
  isOutsideMonth?: boolean;
  isDisabled?: boolean;
}>`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  background-color: ${({ theme, isSelected, isToday }) =>
    isSelected ? theme.colors.accentBlue : isToday ? theme.colors.backgroundGray1 : 'transparent'};
  color: ${({ theme, isSelected, isOutsideMonth, isDisabled }) =>
    isDisabled
      ? theme.colors.textTertiary
      : isSelected
        ? theme.colors.white
        : isOutsideMonth
          ? theme.colors.textTertiary
          : theme.colors.textPrimary};

  ${({ isToday, isSelected, theme }) =>
    isToday &&
    !isSelected &&
    `
    border: 1px solid ${theme.colors.accentBlue};
  `}

  &:hover:not(:disabled) {
    background-color: ${({ theme, isSelected }) =>
      isSelected ? theme.colors.accentBlue : theme.colors.backgroundGray1};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accentBlue};
    outline-offset: -2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const ErrorMessage = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.error};
  font-weight: 500;
`;

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
const months = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
];

export const AccessibleDatePicker: React.FC<Props> = ({
  label,
  value,
  onChange,
  format = 'YYYY-MM-DD',
  minDate,
  maxDate,
  error,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const focusTrapRef = useRef<FocusTrap | null>(null);
  const inputId = `date-picker-${Date.now()}`;
  const errorId = `${inputId}-error`;

  useEffect(() => {
    if (isOpen && calendarRef.current) {
      focusTrapRef.current = new FocusTrap(calendarRef.current, {
        initialFocus: '.selected-day, .today-day, [role="gridcell"] button',
        escapeDeactivates: true,
      });
      focusTrapRef.current.activate();
    } else {
      focusTrapRef.current?.deactivate();
    }

    return () => {
      focusTrapRef.current?.deactivate();
    };
  }, [isOpen]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return format.replace('YYYY', String(year)).replace('MM', month).replace('DD', day);
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // 이전 달의 날짜들
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // 현재 달의 날짜들
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // 다음 달의 날짜들
    const remainingDays = 42 - days.length; // 6주 * 7일
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return;

    onChange(date);
    setIsOpen(false);

    const dateText = formatDateForScreenReader(date);
    announce(`${dateText}이 선택되었습니다.`);
  };

  const handleMonthChange = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);

    const monthYear = `${newMonth.getFullYear()}년 ${months[newMonth.getMonth()]}`;
    announce(`${monthYear}로 이동했습니다.`);
  };

  const handleKeyDown = (e: React.KeyboardEvent, date: Date) => {
    const key = e.key;
    let newDate: Date | null = null;

    switch (key) {
      case 'ArrowLeft':
        newDate = new Date(date);
        newDate.setDate(date.getDate() - 1);
        break;
      case 'ArrowRight':
        newDate = new Date(date);
        newDate.setDate(date.getDate() + 1);
        break;
      case 'ArrowUp':
        newDate = new Date(date);
        newDate.setDate(date.getDate() - 7);
        break;
      case 'ArrowDown':
        newDate = new Date(date);
        newDate.setDate(date.getDate() + 7);
        break;
      case 'Home':
        newDate = new Date(date);
        newDate.setDate(1);
        break;
      case 'End':
        newDate = new Date(date);
        newDate.setMonth(date.getMonth() + 1, 0);
        break;
      case 'PageUp':
        e.preventDefault();
        handleMonthChange(-1);
        return;
      case 'PageDown':
        e.preventDefault();
        handleMonthChange(1);
        return;
    }

    if (newDate) {
      e.preventDefault();

      // 월이 변경되면 캘린더도 변경
      if (newDate.getMonth() !== currentMonth.getMonth()) {
        setCurrentMonth(newDate);
      }

      // 포커스 이동
      const newDateString = formatDate(newDate);
      const button = calendarRef.current?.querySelector(
        `[data-date="${newDateString}"]`
      ) as HTMLElement;
      button?.focus();
    }
  };

  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Container ref={containerRef} className={className}>
      <Label htmlFor={inputId}>{label}</Label>

      <InputWrapper>
        <Input
          id={inputId}
          type='text'
          value={value ? formatDate(value) : ''}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          hasError={!!error}
          aria-invalid={!!error}
          aria-errormessage={error ? errorId : undefined}
          aria-haspopup='dialog'
          aria-expanded={isOpen}
          aria-describedby={value ? `${inputId}-description` : undefined}
        />
        <CalendarIcon type='button' onClick={() => setIsOpen(!isOpen)} aria-label='날짜 선택 열기'>
          📅
        </CalendarIcon>
        {value && (
          <span id={`${inputId}-description`} className='sr-only'>
            선택된 날짜: {formatDateForScreenReader(value)}
          </span>
        )}
      </InputWrapper>

      <CalendarPopup
        ref={calendarRef}
        isOpen={isOpen}
        role='dialog'
        aria-label='날짜 선택'
        aria-modal='true'
      >
        <CalendarHeader>
          <NavigationButton
            type='button'
            onClick={() => handleMonthChange(-1)}
            aria-label='이전 달'
          >
            ←
          </NavigationButton>
          <MonthYear>
            {currentMonth.getFullYear()}년 {months[currentMonth.getMonth()]}
          </MonthYear>
          <NavigationButton type='button' onClick={() => handleMonthChange(1)} aria-label='다음 달'>
            →
          </NavigationButton>
        </CalendarHeader>

        <WeekDays>
          {weekDays.map(day => (
            <WeekDay key={day} aria-label={`${day}요일`}>
              {day}
            </WeekDay>
          ))}
        </WeekDays>

        <DaysGrid role='grid' aria-label='날짜 선택'>
          {days.map((date, index) => {
            const isSelected = value && date.toDateString() === value.toDateString();
            const isToday = date.toDateString() === today.toDateString();
            const isOutsideMonth = date.getMonth() !== currentMonth.getMonth();
            const isDisabled = isDateDisabled(date);
            const dateString = formatDate(date);

            return (
              <div key={index} role='gridcell'>
                <DayButton
                  type='button'
                  onClick={() => handleDateSelect(date)}
                  onKeyDown={e => handleKeyDown(e, date)}
                  isSelected={isSelected}
                  isToday={isToday}
                  isOutsideMonth={isOutsideMonth}
                  isDisabled={isDisabled}
                  disabled={isDisabled}
                  className={isSelected ? 'selected-day' : isToday ? 'today-day' : ''}
                  data-date={dateString}
                  aria-label={formatDateForScreenReader(date)}
                  aria-selected={isSelected}
                  aria-current={isToday ? 'date' : undefined}
                >
                  {date.getDate()}
                </DayButton>
              </div>
            );
          })}
        </DaysGrid>
      </CalendarPopup>

      {error && (
        <ErrorMessage id={errorId} role='alert'>
          {error}
        </ErrorMessage>
      )}
    </Container>
  );
};
