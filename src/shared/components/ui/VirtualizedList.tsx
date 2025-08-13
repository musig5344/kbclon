import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

import styled from 'styled-components';

const VirtualContainer = styled.div<{ height: number }>`
  height: ${props => props.height}px;
  overflow-y: auto;
  position: relative;
`;

const VirtualContent = styled.div<{ totalHeight: number }>`
  height: ${props => props.totalHeight}px;
  position: relative;
`;

const VisibleWindow = styled.div<{ offsetY: number }>`
  transform: translateY(${props => props.offsetY}px);
`;

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      originalIndex: startIndex + index,
    }));
  }, [items, visibleRange]);

  const offsetY = visibleRange.startIndex * itemHeight;
  const totalHeight = items.length * itemHeight;

  return (
    <VirtualContainer
      ref={containerRef}
      height={containerHeight}
      className={className}
      onScroll={handleScroll}
    >
      <VirtualContent totalHeight={totalHeight}>
        <VisibleWindow offsetY={offsetY}>
          {visibleItems.map(({ item, originalIndex }) => renderItem(item, originalIndex))}
        </VisibleWindow>
      </VirtualContent>
    </VirtualContainer>
  );
}

export default VirtualizedList;
