/**
 * KB StarBanking 키보드 최적화 날짜 선택기
 * 완전한 키보드 네비게이션과 접근성 지원
 */

import React, { useState, useRef, useEffect, useCallback, KeyboardEvent, useMemo } from 'react';

import styled from 'styled-components';

import { globalKeyboardTrapManager } from '../core/KeyboardTrapManager';

interface KeyboardDatePickerProps {
  value?: Date;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
  locale?: 'ko' | 'en';
  format?: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD.MM.YYYY';
  showWeekNumbers?: boolean;
  onChange: (date: Date | null) => void;
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

const InputContainer = styled.div<{ hasError?: boolean; disabled?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  border: 2px solid ${props => (props.hasError ? '#e74c3c' : '#ddd')};
  border-radius: 8px;
  background: ${props => (props.disabled ? '#f5f5f5' : 'white')};
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const DateInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  font-size: 16px;
  outline: none;

  &:disabled {
    color: #999;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #999;
  }
`;

const CalendarButton = styled.button`
  padding: 8px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #666;
  font-size: 18px;

  &:hover:not(:disabled) {
    color: #007bff;
  }

  &:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
    border-radius: 4px;
  }

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
`;

const CalendarContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  background: white;
  border: 2px solid #007bff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 4px;
  min-width: 320px;
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eee;
`;

const MonthYearDisplay = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
  text-align: center;
`;

const NavButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #666;

  &:hover {
    background: #f0f0f0;
    color: #007bff;
  }

  &:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
`;

const CalendarGrid = styled.div`
  padding: 16px;
`;

const WeekHeader = styled.div`
  display: grid;
  grid-template-columns: ${props => 'repeat(7, 1fr)'};
  gap: 4px;
  margin-bottom: 8px;
`;

const WeekHeaderCell = styled.div`
  padding: 8px 4px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #666;
`;

const CalendarMonth = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const CalendarDay = styled.button<{
  isToday?: boolean;
  isSelected?: boolean;
  isOtherMonth?: boolean;
  isFocused?: boolean;
  isDisabled?: boolean;
}>`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.1s ease;

  ${props =>
    props.isDisabled &&
    `
    color: #ccc;
    cursor: not-allowed;
  `}

  ${props =>
    props.isOtherMonth &&
    !props.isDisabled &&
    `
    color: #999;
  `}
  
  ${props =>
    props.isToday &&
    !props.isSelected &&
    `
    border: 2px solid #007bff;
    font-weight: 600;
  `}
  
  ${props =>
    props.isSelected &&
    `
    background: #007bff;
    color: white;
    font-weight: 600;
  `}
  
  ${props =>
    props.isFocused &&
    `
    outline: 2px solid #007bff;
    outline-offset: 2px;
  `}
  
  &:hover:not(:disabled) {
    background: ${props => (props.isSelected ? '#0056b3' : '#f0f8ff')};
  }
`;

const QuickActions = styled.div`
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const QuickActionButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: #f0f8ff;
    border-color: #007bff;
  }

  &:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
`;

const ScreenReaderAnnouncement = styled.div`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

export const KeyboardDatePicker: React.FC<KeyboardDatePickerProps> = ({
  value,
  label,
  placeholder = 'YYYY-MM-DD',
  required = false,
  disabled = false,
  error,
  minDate,
  maxDate,
  locale = 'ko',
  format = 'YYYY-MM-DD',
  showWeekNumbers = false,
  onChange,
  className,
  'aria-describedby': ariaDescribedBy,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedDate, setFocusedDate] = useState<Date>(value || new Date());
  const [inputValue, setInputValue] = useState('');
  const [announcement, setAnnouncement] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const datePickerId = useRef(`datepicker-${Math.random().toString(36).substr(2, 9)}`);

  // 로케일 설정
  const weekDays =
    locale === 'ko'
      ? ['일', '월', '화', '수', '목', '금', '토']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthNames =
    locale === 'ko'
      ? ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
      : [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];

  // 날짜 포맷 유틸리티
  const formatDate = useCallback(
    (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      switch (format) {
        case 'MM/DD/YYYY':
          return `${month}/${day}/${year}`;
        case 'DD.MM.YYYY':
          return `${day}.${month}.${year}`;
        default:
          return `${year}-${month}-${day}`;
      }
    },
    [format]
  );

  const parseDate = useCallback(
    (dateString: string): Date | null => {
      if (!dateString) return null;

      let year: number, month: number, day: number;

      switch (format) {
        case 'MM/DD/YYYY': {
          const parts = dateString.split('/');
          if (parts.length !== 3) return null;
          month = parseInt(parts[0], 10);
          day = parseInt(parts[1], 10);
          year = parseInt(parts[2], 10);
          break;
        }
        case 'DD.MM.YYYY': {
          const parts = dateString.split('.');
          if (parts.length !== 3) return null;
          day = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          year = parseInt(parts[2], 10);
          break;
        }
        default: {
          const parts = dateString.split('-');
          if (parts.length !== 3) return null;
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          day = parseInt(parts[2], 10);
          break;
        }
      }

      if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
      if (month < 1 || month > 12) return null;
      if (day < 1 || day > 31) return null;

      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
        ? date
        : null;
    },
    [format]
  );

  // 달력 그리드 생성
  const calendarDays = useMemo(() => {
    const year = focusedDate.getFullYear();
    const month = focusedDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isDisabled: boolean;
    }> = [];

    // 이전 달의 날짜들
    const prevMonth = new Date(year, month - 1, 0);
    const daysFromPrevMonth = firstDayOfWeek;

    for (let i = daysFromPrevMonth; i > 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i + 1);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: value ? isSameDay(date, value) : false,
        isDisabled: isDateDisabled(date),
      });
    }

    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, new Date()),
        isSelected: value ? isSameDay(date, value) : false,
        isDisabled: isDateDisabled(date),
      });
    }

    // 다음 달의 날짜들로 6주 채우기
    const totalCells = 42; // 6주 × 7일
    const remainingCells = totalCells - days.length;

    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: value ? isSameDay(date, value) : false,
        isDisabled: isDateDisabled(date),
      });
    }

    return days;
  }, [focusedDate, value, minDate, maxDate]);

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  // 입력값 업데이트
  useEffect(() => {
    setInputValue(value ? formatDate(value) : '');
  }, [value, formatDate]);

  // 달력 열기/닫기
  const openCalendar = useCallback(() => {
    if (disabled) return;

    setIsOpen(true);
    setFocusedDate(value || new Date());

    if (calendarRef.current) {
      globalKeyboardTrapManager.addTrap(calendarRef.current, {
        autoFocus: true,
        escapeDeactivates: true,
        returnFocusOnDeactivate: true,
      });
    }
  }, [disabled, value]);

  const closeCalendar = useCallback(() => {
    setIsOpen(false);

    if (calendarRef.current) {
      globalKeyboardTrapManager.removeTrap(calendarRef.current);
    }

    inputRef.current?.focus();
  }, []);

  // 날짜 선택
  const selectDate = useCallback(
    (date: Date) => {
      if (isDateDisabled(date)) return;

      onChange(date);
      setInputValue(formatDate(date));
      closeCalendar();

      setAnnouncement(`${formatDate(date)} 선택됨`);
    },
    [onChange, formatDate, closeCalendar]
  );

  // 월/년 네비게이션
  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setFocusedDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  }, []);

  // 키보드 네비게이션
  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
        case 'F4':
          event.preventDefault();
          openCalendar();
          break;
        case 'Escape':
          if (isOpen) {
            event.preventDefault();
            closeCalendar();
          }
          break;
      }
    },
    [isOpen, openCalendar, closeCalendar]
  );

  const handleCalendarKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const currentIndex = calendarDays.findIndex(day => isSameDay(day.date, focusedDate));

      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          newIndex = Math.max(0, currentIndex - 1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          newIndex = Math.min(calendarDays.length - 1, currentIndex + 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          newIndex = Math.max(0, currentIndex - 7);
          break;
        case 'ArrowDown':
          event.preventDefault();
          newIndex = Math.min(calendarDays.length - 1, currentIndex + 7);
          break;
        case 'Home':
          event.preventDefault();
          newIndex = currentIndex - (currentIndex % 7);
          break;
        case 'End':
          event.preventDefault();
          newIndex = currentIndex + (6 - (currentIndex % 7));
          break;
        case 'PageUp':
          event.preventDefault();
          navigateMonth('prev');
          return;
        case 'PageDown':
          event.preventDefault();
          navigateMonth('next');
          return;
        case 'Enter':
        case ' ':
          event.preventDefault();
          selectDate(focusedDate);
          return;
        case 'Escape':
          event.preventDefault();
          closeCalendar();
          return;
      }

      if (newIndex !== currentIndex && calendarDays[newIndex]) {
        setFocusedDate(calendarDays[newIndex].date);

        const dayName = weekDays[calendarDays[newIndex].date.getDay()];
        const dateStr = formatDate(calendarDays[newIndex].date);
        setAnnouncement(`${dayName}, ${dateStr}`);
      }
    },
    [calendarDays, focusedDate, selectDate, closeCalendar, navigateMonth, weekDays, formatDate]
  );

  // 입력 처리
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setInputValue(newValue);

      const parsedDate = parseDate(newValue);
      if (parsedDate && !isDateDisabled(parsedDate)) {
        onChange(parsedDate);
        setFocusedDate(parsedDate);
      } else if (!newValue) {
        onChange(null);
      }
    },
    [parseDate, onChange]
  );

  // 빠른 액션들
  const selectToday = () => selectDate(new Date());
  const clearDate = () => {
    onChange(null);
    setInputValue('');
    closeCalendar();
  };

  return (
    <Container className={className}>
      {label && (
        <Label htmlFor={datePickerId.current} required={required}>
          {label}
        </Label>
      )}

      <InputContainer hasError={!!error} disabled={disabled}>
        <DateInput
          ref={inputRef}
          id={datePickerId.current}
          type='text'
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          aria-describedby={ariaDescribedBy}
          aria-invalid={!!error}
          aria-expanded={isOpen}
          aria-haspopup='dialog'
        />

        <CalendarButton
          type='button'
          disabled={disabled}
          onClick={openCalendar}
          aria-label='달력 열기'
        >
          📅
        </CalendarButton>
      </InputContainer>

      {isOpen && (
        <CalendarContainer
          ref={calendarRef}
          role='dialog'
          aria-modal='true'
          aria-label='날짜 선택'
          onKeyDown={handleCalendarKeyDown}
          tabIndex={-1}
        >
          <CalendarHeader>
            <NavButton type='button' onClick={() => navigateMonth('prev')} aria-label='이전 달'>
              ←
            </NavButton>

            <MonthYearDisplay>
              {monthNames[focusedDate.getMonth()]} {focusedDate.getFullYear()}
            </MonthYearDisplay>

            <NavButton type='button' onClick={() => navigateMonth('next')} aria-label='다음 달'>
              →
            </NavButton>
          </CalendarHeader>

          <CalendarGrid ref={gridRef}>
            <WeekHeader>
              {weekDays.map(day => (
                <WeekHeaderCell key={day}>{day}</WeekHeaderCell>
              ))}
            </WeekHeader>

            <CalendarMonth role='grid'>
              {calendarDays.map((dayInfo, index) => (
                <CalendarDay
                  key={index}
                  role='gridcell'
                  isToday={dayInfo.isToday}
                  isSelected={dayInfo.isSelected}
                  isOtherMonth={!dayInfo.isCurrentMonth}
                  isFocused={isSameDay(dayInfo.date, focusedDate)}
                  isDisabled={dayInfo.isDisabled}
                  onClick={() => selectDate(dayInfo.date)}
                  aria-label={`${formatDate(dayInfo.date)} ${dayInfo.isToday ? '(오늘)' : ''}`}
                  aria-selected={dayInfo.isSelected}
                  tabIndex={isSameDay(dayInfo.date, focusedDate) ? 0 : -1}
                >
                  {dayInfo.date.getDate()}
                </CalendarDay>
              ))}
            </CalendarMonth>
          </CalendarGrid>

          <QuickActions>
            <QuickActionButton onClick={selectToday}>오늘</QuickActionButton>
            <QuickActionButton onClick={clearDate}>지우기</QuickActionButton>
          </QuickActions>
        </CalendarContainer>
      )}

      {error && (
        <ErrorMessage role='alert' aria-live='polite'>
          {error}
        </ErrorMessage>
      )}

      <ScreenReaderAnnouncement aria-live='polite' aria-atomic='true'>
        {announcement}
      </ScreenReaderAnnouncement>
    </Container>
  );
};

export default KeyboardDatePicker;
