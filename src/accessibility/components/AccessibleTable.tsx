/**
 * 접근 가능한 데이터 테이블 컴포넌트
 * WCAG 2.1 테이블 접근성 지원
 */

import React, { useEffect, useRef } from 'react';

import styled from 'styled-components';

import { AccessibleTableProps } from '../types';
import { KeyboardNavigator } from '../utils/focusManagement';
import { announce, generateTableSummary } from '../utils/screenReader';

interface TableData {
  [key: string]: any;
}

interface Props extends AccessibleTableProps {
  data: TableData[];
  onSort?: (column: string) => void;
  onSelect?: (row: TableData) => void;
  selectedRows?: TableData[];
}

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accentBlue};
    outline-offset: 2px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Caption = styled.caption`
  padding: 12px;
  text-align: left;
  font-weight: 500;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textPrimary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Thead = styled.thead`
  background-color: ${({ theme }) => theme.colors.backgroundGray1};
`;

const Th = styled.th<{ sortable?: boolean }>`
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  white-space: nowrap;

  ${({ sortable, theme }) =>
    sortable &&
    `
    cursor: pointer;
    user-select: none;
    
    &:hover {
      background-color: ${theme.colors.backgroundGray2};
    }
    
    &:focus {
      outline: 2px solid ${theme.colors.accentBlue};
      outline-offset: -2px;
    }
  `}
`;

const Tbody = styled.tbody``;

const Tr = styled.tr<{ selectable?: boolean; selected?: boolean }>`
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};

  ${({ selectable, selected, theme }) =>
    selectable &&
    `
    cursor: pointer;
    
    &:hover {
      background-color: ${theme.colors.backgroundGray1};
    }
    
    ${
      selected &&
      `
      background-color: ${theme.colors.lightGray};
    `
    }
  `}

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accentBlue};
    outline-offset: -2px;
  }
`;

const Td = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const SortIcon = styled.span<{ direction?: 'asc' | 'desc' }>`
  margin-left: 8px;
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;

  ${({ direction }) =>
    direction === 'asc'
      ? `
    border-bottom: 6px solid currentColor;
  `
      : direction === 'desc'
        ? `
    border-top: 6px solid currentColor;
  `
        : `
    opacity: 0.3;
    border-bottom: 6px solid currentColor;
  `}
`;

const ScreenReaderOnly = styled.span`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

export const AccessibleTable: React.FC<Props> = ({
  caption,
  summary,
  headers,
  data,
  sortable = false,
  selectable = false,
  onSort,
  onSelect,
  selectedRows = [],
}) => {
  const tableRef = useRef<HTMLTableElement>(null);
  const navigatorRef = useRef<KeyboardNavigator | null>(null);
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (tableRef.current && (sortable || selectable)) {
      navigatorRef.current = new KeyboardNavigator(tableRef.current, {
        orientation: 'both',
      });
    }

    return () => {
      navigatorRef.current?.destroy();
    };
  }, [sortable, selectable]);

  useEffect(() => {
    // 테이블 요약 정보 스크린 리더 공지
    const tableSummary = generateTableSummary(data.length, headers.length, summary);
    announce(tableSummary);
  }, [data.length, headers.length, summary]);

  const handleSort = (column: string) => {
    if (!sortable || !onSort) return;

    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort(column);

    announce(
      `${column} 열을 ${newDirection === 'asc' ? '오름차순' : '내림차순'}으로 정렬했습니다.`
    );
  };

  const handleRowSelect = (row: TableData, index: number) => {
    if (!selectable || !onSelect) return;

    onSelect(row);
    const isSelected = selectedRows.includes(row);
    announce(`${index + 1}번째 행이 ${isSelected ? '선택 해제' : '선택'}되었습니다.`);
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: TableData, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowSelect(row, index);
    }
  };

  return (
    <TableContainer role='region' aria-label={caption}>
      <Table ref={tableRef}>
        <Caption>{caption}</Caption>
        {summary && <ScreenReaderOnly>{summary}</ScreenReaderOnly>}

        <Thead>
          <Tr>
            {headers.map((header, index) => (
              <Th
                key={index}
                scope='col'
                sortable={sortable}
                onClick={() => sortable && handleSort(header)}
                tabIndex={sortable ? 0 : -1}
                onKeyDown={e => {
                  if (sortable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleSort(header);
                  }
                }}
                aria-sort={
                  sortColumn === header
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
              >
                {header}
                {sortable && (
                  <SortIcon direction={sortColumn === header ? sortDirection : undefined} />
                )}
                {sortable && (
                  <ScreenReaderOnly>
                    {sortColumn === header
                      ? `${sortDirection === 'asc' ? '오름차순' : '내림차순'} 정렬됨`
                      : '정렬 가능'}
                  </ScreenReaderOnly>
                )}
              </Th>
            ))}
          </Tr>
        </Thead>

        <Tbody>
          {data.map((row, rowIndex) => {
            const isSelected = selectedRows.includes(row);

            return (
              <Tr
                key={rowIndex}
                selectable={selectable}
                selected={isSelected}
                onClick={() => handleRowSelect(row, rowIndex)}
                onKeyDown={e => handleKeyDown(e, row, rowIndex)}
                tabIndex={selectable ? 0 : -1}
                role={selectable ? 'button' : undefined}
                aria-selected={selectable ? isSelected : undefined}
                aria-label={selectable ? `${rowIndex + 1}번째 행` : undefined}
              >
                {headers.map((header, cellIndex) => (
                  <Td key={cellIndex}>
                    {cellIndex === 0 && <ScreenReaderOnly>{rowIndex + 1}번째 행:</ScreenReaderOnly>}
                    {row[header]}
                  </Td>
                ))}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
