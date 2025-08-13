/**
 * Scroll-Optimized List Component
 * Implements virtual scrolling and optimized animations for smooth 60fps scrolling
 */

import React, { useRef, useState, useEffect, useCallback, ReactNode } from 'react';

import styled from 'styled-components';

import { useScrollAnimation, useParallax } from '../../hooks/useAnimation';
import { scroll, raf, containment, gpuAcceleration } from '../../utils/animationHelpers';
import { animationMonitor, performanceHelpers } from '../../utils/animationPerformance';

import { useFlipGroup } from './FlipAnimation';
import { FadeTransition, SlideTransition } from './OptimizedTransition';

// Types
interface ScrollOptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  overscan?: number;
  enableAnimations?: boolean;
  enableParallax?: boolean;
  onScroll?: (scrollTop: number) => void;
  className?: string;
}

interface VirtualizedItem {
  index: number;
  offset: number;
  height: number;
}

// Styled components
const ScrollContainer = styled.div`
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  ${containment.strict}
  ${gpuAcceleration.full}
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
`;

const ScrollContent = styled.div<{ $height: number }>`
  height: ${props => props.$height}px;
  position: relative;
`;

const VirtualItem = styled.div<{ $offset: number; $height: number }>`
  position: absolute;
  top: ${props => props.$offset}px;
  left: 0;
  right: 0;
  height: ${props => props.$height}px;
  ${containment.layout}
`;

const AnimatedItem = styled.div`
  ${gpuAcceleration.force3D}
`;

// Virtualized list implementation
function ScrollOptimizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 3,
  enableAnimations = true,
  enableParallax = false,
  onScroll,
  className,
}: ScrollOptimizedListProps<T>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const animationIdRef = useRef<string>('');

  // Calculate item heights and positions
  const getItemHeight = useCallback(
    (index: number): number => {
      return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
    },
    [itemHeight]
  );

  // Calculate total height and item offsets
  const { totalHeight, itemOffsets } = React.useMemo(() => {
    let total = 0;
    const offsets: number[] = [];

    for (let i = 0; i < items.length; i++) {
      offsets.push(total);
      total += getItemHeight(i);
    }

    return { totalHeight: total, itemOffsets: offsets };
  }, [items.length, getItemHeight]);

  // Calculate visible items
  const visibleItems = React.useMemo((): VirtualizedItem[] => {
    const startIndex = Math.max(
      0,
      itemOffsets.findIndex(
        offset => offset + getItemHeight(itemOffsets.indexOf(offset)) > scrollTop
      ) - overscan
    );

    const endIndex = Math.min(
      items.length - 1,
      itemOffsets.findIndex(offset => offset > scrollTop + containerHeight) + overscan
    );

    const visible: VirtualizedItem[] = [];

    for (let i = startIndex; i <= endIndex && i < items.length; i++) {
      visible.push({
        index: i,
        offset: itemOffsets[i],
        height: getItemHeight(i),
      });
    }

    return visible;
  }, [scrollTop, containerHeight, itemOffsets, items.length, overscan, getItemHeight]);

  // Optimized scroll handler
  const handleScroll = useCallback(
    raf.throttle((event: React.UIEvent<HTMLDivElement>) => {
      const target = event.target as HTMLDivElement;
      const newScrollTop = target.scrollTop;

      setScrollTop(newScrollTop);
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set scrolling to false after scroll ends
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);

        // End performance monitoring
        if (animationIdRef.current) {
          const metrics = animationMonitor.endAnimation(animationIdRef.current);
          if (metrics && metrics.averageFps < 55) {
            console.warn('Scroll performance below 60fps:', metrics);
          }
          animationIdRef.current = '';
        }
      }, 150);

      // Start performance monitoring for new scroll
      if (!animationIdRef.current) {
        animationIdRef.current = `scroll-${Date.now()}`;
        animationMonitor.startAnimation(animationIdRef.current);
      }

      onScroll?.(newScrollTop);
    }),
    [onScroll]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <ScrollContainer
      ref={scrollContainerRef}
      onScroll={handleScroll}
      style={{ height: containerHeight }}
      className={className}
    >
      <ScrollContent $height={totalHeight}>
        {visibleItems.map(({ index, offset, height }) => (
          <VirtualItem key={index} $offset={offset} $height={height}>
            {enableAnimations ? (
              <AnimatedListItem
                index={index}
                isScrolling={isScrolling}
                enableParallax={enableParallax}
              >
                {renderItem(items[index], index)}
              </AnimatedListItem>
            ) : (
              renderItem(items[index], index)
            )}
          </VirtualItem>
        ))}
      </ScrollContent>
    </ScrollContainer>
  );
}

// Animated list item component
interface AnimatedListItemProps {
  children: ReactNode;
  index: number;
  isScrolling: boolean;
  enableParallax: boolean;
}

const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
  index,
  isScrolling,
  enableParallax,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const { value: animationValue } = useScrollAnimation(itemRef, {
    threshold: 0.1,
    triggerOnce: true,
    duration: 400,
    delay: Math.min(index * 50, 200), // Stagger effect
  });

  const parallax = useParallax(itemRef, {
    speed: 0.1,
    disabled: !enableParallax || performanceHelpers.prefersReducedMotion(),
  });

  return (
    <AnimatedItem
      ref={itemRef}
      style={{
        opacity: animationValue,
        transform: `translateY(${(1 - animationValue) * 20}px) ${enableParallax ? parallax.style.transform : ''}`,
      }}
    >
      {children}
    </AnimatedItem>
  );
};

// Optimized infinite scroll hook
interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
}

export const useInfiniteScroll = (
  ref: React.RefObject<HTMLElement>,
  options: UseInfiniteScrollOptions
) => {
  const { threshold = 0.8, rootMargin = '100px', onLoadMore, hasMore } = options;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!ref.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading) {
          setIsLoading(true);

          try {
            await onLoadMore();
          } finally {
            setIsLoading(false);
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    ref.current.appendChild(sentinel);
    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, [ref, threshold, rootMargin, onLoadMore, hasMore, isLoading]);

  return { isLoading };
};

// Optimized sortable list component
interface SortableListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  onReorder: (items: T[]) => void;
  itemHeight: number;
  containerHeight: number;
}

export function SortableList<T>({
  items,
  renderItem,
  onReorder,
  itemHeight,
  containerHeight,
}: SortableListProps<T>) {
  const { register, flip } = useFlipGroup({
    duration: 300,
    stagger: 50,
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      setTargetIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && targetIndex !== null) {
      const newItems = [...items];
      const [draggedItem] = newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, draggedItem);

      flip(() => {
        onReorder(newItems);
      });
    }

    setDraggedIndex(null);
    setTargetIndex(null);
  };

  return (
    <ScrollOptimizedList
      items={items}
      renderItem={(item, index) => (
        <div
          {...register(String(index))}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={() => handleDragOver(index)}
          onDragEnd={handleDragEnd}
          style={{
            opacity: draggedIndex === index ? 0.5 : 1,
            cursor: 'move',
          }}
        >
          {renderItem(item, index)}
        </div>
      )}
      itemHeight={itemHeight}
      containerHeight={containerHeight}
      enableAnimations
    />
  );
}

// Export components and hooks
export default ScrollOptimizedList;
export { AnimatedListItem, SortableList };
