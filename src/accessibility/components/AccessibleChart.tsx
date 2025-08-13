/**
 * 접근 가능한 차트 컴포넌트
 * WCAG 2.1 차트 대체 텍스트 및 테이블 뷰 지원
 */

import React, { useState } from 'react';

import styled from 'styled-components';

import { AccessibleChartProps } from '../types';
import { generateChartDescription, announce } from '../utils/screenReader';

import { AccessibleTable } from './AccessibleTable';

interface Props extends AccessibleChartProps {
  children: React.ReactNode; // 실제 차트 컴포넌트
  className?: string;
}

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
`;

const ChartWrapper = styled.div<{ isHidden?: boolean }>`
  ${({ isHidden }) => isHidden && `
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `}
`;

const ChartHeader = styled.div`
  margin-bottom: 16px;
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 8px 0;
`;

const ChartDescription = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const ViewToggle = styled.button`
  margin: 16px 0;
  padding: 8px 16px;
  background-color: ${({ theme }) => theme.colors.buttonGrayNormal};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.buttonGrayPressed};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accentBlue};
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const ScreenReaderInfo = styled.div`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

const TableViewContainer = styled.div`
  margin-top: 16px;
`;

export const AccessibleChart: React.FC<Props> = ({
  title,
  description,
  data,
  textAlternative,
  tableView = true,
  children,
  className
}) => {
  const [showTableView, setShowTableView] = useState(false);
  const chartId = `chart-${Date.now()}`;
  const descriptionId = `${chartId}-description`;

  const toggleView = () => {
    const newView = !showTableView;
    setShowTableView(newView);
    
    announce(
      newView 
        ? '테이블 뷰로 전환되었습니다.' 
        : '차트 뷰로 전환되었습니다.'
    );
  };

  // 차트 유형 및 트렌드 분석 (실제 구현에서는 데이터 기반으로 계산)
  const chartType = '막대 그래프'; // 예시
  const dataPoints = data.length;
  const trend = 'stable' as const; // 예시

  const chartDescriptionText = generateChartDescription(
    chartType,
    dataPoints,
    trend,
    textAlternative
  );

  // 테이블 뷰를 위한 데이터 변환
  const tableHeaders = data.length > 0 ? Object.keys(data[0]) : [];
  const tableCaption = `${title} 데이터 테이블`;
  const tableSummary = `${title}의 상세 데이터를 보여주는 테이블입니다.`;

  return (
    <ChartContainer className={className}>
      <ChartHeader>
        <ChartTitle id={chartId}>{title}</ChartTitle>
        <ChartDescription id={descriptionId}>{description}</ChartDescription>
      </ChartHeader>

      {tableView && (
        <ViewToggle
          onClick={toggleView}
          aria-pressed={showTableView}
          aria-label={showTableView ? '차트 뷰로 전환' : '테이블 뷰로 전환'}
        >
          {showTableView ? '차트 보기' : '테이블로 보기'}
        </ViewToggle>
      )}

      <ChartWrapper 
        isHidden={showTableView}
        role="img"
        aria-labelledby={chartId}
        aria-describedby={descriptionId}
      >
        {children}
        <ScreenReaderInfo>{chartDescriptionText}</ScreenReaderInfo>
      </ChartWrapper>

      {showTableView && tableView && (
        <TableViewContainer>
          <AccessibleTable
            caption={tableCaption}
            summary={tableSummary}
            headers={tableHeaders}
            data={data}
            sortable={true}
          />
        </TableViewContainer>
      )}
    </ChartContainer>
  );
};

// 특정 차트 타입을 위한 래퍼 컴포넌트들

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

export const AccessibleBarChart: React.FC<{
  title: string;
  data: BarChartData[];
  children: React.ReactNode;
}> = ({ title, data, children }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  

  const textAlternative = `최대값은 ${maxValue}, 최소값은 ${minValue}입니다.`;

  return (
    <AccessibleChart
      title={title}
      description={`${data.length}개 항목의 데이터를 보여주는 막대 차트`}
      data={data}
      textAlternative={textAlternative}
      tableView={true}
    >
      {children}
    </AccessibleChart>
  );
};

interface PieChartData {
  label: string;
  value: number;
  percentage: number;
}

export const AccessiblePieChart: React.FC<{
  title: string;
  data: PieChartData[];
  children: React.ReactNode;
}> = ({ title, data, children }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  const textAlternative = data
    .map(d => `${d.label}: ${d.percentage}%`)
    .join(', ');

  return (
    <AccessibleChart
      title={title}
      description={`전체 ${total}에 대한 비율을 보여주는 원형 차트`}
      data={data}
      textAlternative={textAlternative}
      tableView={true}
    >
      {children}
    </AccessibleChart>
  );
};

interface LineChartData {
  date: string;
  value: number;
}

export const AccessibleLineChart: React.FC<{
  title: string;
  data: LineChartData[];
  children: React.ReactNode;
}> = ({ title, data, children }) => {
  const startValue = data[0]?.value || 0;
  const endValue = data[data.length - 1]?.value || 0;
  const change = endValue - startValue;
  const changePercent = startValue !== 0 ? (change / startValue * 100).toFixed(1) : 0;
  
  const trend = change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable';
  
  const textAlternative = `${data[0]?.date}부터 ${data[data.length - 1]?.date}까지 ${changePercent}% ${
    trend === 'increasing' ? '상승' : trend === 'decreasing' ? '하락' : '유지'
  }했습니다.`;

  return (
    <AccessibleChart
      title={title}
      description="시간에 따른 변화를 보여주는 선형 차트"
      data={data}
      textAlternative={textAlternative}
      tableView={true}
    >
      {children}
    </AccessibleChart>
  );
};