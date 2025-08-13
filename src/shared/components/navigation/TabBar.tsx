/**
 * KB 스타뱅킹 탭 바 컴포넌트
 * - 원본과 동일한 언더라인 슬라이드 애니메이션 구현
 * - Enhanced touch feedback with haptic patterns
 * - Android WebView 최적화 및 네이티브 앱 느낌
 */

import React, { useState, useRef, useEffect } from 'react';

import styled from 'styled-components';

import { kbTimings, kbShadows } from '../../../styles/KBMicroDetails';
import { tokens } from '../../../styles/tokens';
import { useTouchFeedback, hapticFeedback, TouchFeedbackOptions } from '../../utils/touchFeedback';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'underline' | 'segmented';
  fullWidth?: boolean;
  className?: string;
  // Enhanced touch feedback options
  touchFeedback?: Partial<TouchFeedbackOptions>;
  disableTouchFeedback?: boolean;
}

const TabContainer = styled.div<{ $fullWidth?: boolean }>`
  position: relative;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  background: white;
  border-bottom: 1px solid #f0f0f0;
`;

const TabList = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  align-items: center;
  position: relative;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  ${props =>
    props.$fullWidth &&
    `
    justify-content: space-between;
  `}
`;

const Tab = styled.button<{ $active: boolean; $fullWidth?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 16px 20px;
  background: none;
  border: none;
  font-size: 15px;
  font-weight: ${props => (props.$active ? 600 : 500)};
  color: ${props => (props.$active ? '#1e1e1e' : '#757575')};
  white-space: nowrap;
  cursor: pointer;
  transition: all ${kbTimings.fast} ${kbTimings.easeOut};
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  flex: ${props => (props.$fullWidth ? '1' : 'initial')};
  justify-content: center;

  &:hover {
    color: ${props => (props.$active ? '#1e1e1e' : '#424242')};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const TabIcon = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  opacity: ${props => (props.$active ? 1 : 0.7)};
  transition: opacity ${kbTimings.fast} ${kbTimings.easeOut};
`;

const TabBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  background: ${tokens.colors.brand.primary};
  color: #1e1e1e;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  margin-left: 4px;
`;

const Underline = styled.div<{ $width: number; $left: number }>`
  position: absolute;
  bottom: 0;
  left: ${props => props.$left}px;
  width: ${props => props.$width}px;
  height: 3px;
  background: ${tokens.colors.brand.primary};
  border-radius: 1.5px 1.5px 0 0;
  transition: all ${kbTimings.normal} cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, width;
`;

// 세그먼트 스타일 탭
const SegmentedContainer = styled.div`
  padding: 4px;
  background: #f5f5f5;
  border-radius: 12px;
  display: inline-flex;
  position: relative;
`;

const SegmentedTab = styled(Tab)`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;

  &:hover {
    background: ${props => (props.$active ? 'transparent' : 'rgba(0, 0, 0, 0.02)')};
  }
`;

const SegmentedIndicator = styled.div<{ $width: number; $left: number }>`
  position: absolute;
  top: 4px;
  left: ${props => props.$left + 4}px;
  width: ${props => props.$width}px;
  height: calc(100% - 8px);
  background: white;
  border-radius: 8px;
  box-shadow: ${kbShadows.card};
  transition: all ${kbTimings.normal} cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
`;

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'underline',
  fullWidth = false,
  className,
  touchFeedback,
  disableTouchFeedback = false,
}) => {
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Enhanced touch feedback configuration for tabs
  const defaultTouchFeedback: TouchFeedbackOptions = {
    type: variant === 'segmented' ? 'scale' : 'press',
    intensity: 'light',
    haptic: true,
    androidOptimized: true,
    color: tokens.colors.brand.primary + '20', // 20% alpha
    duration: 200,
  };

  const finalTouchFeedback = { ...defaultTouchFeedback, ...touchFeedback };

  // Enhanced touch feedback hook for tabs
  const tabTouchFeedback = useTouchFeedback(disableTouchFeedback ? undefined : finalTouchFeedback);

  useEffect(() => {
    const activeTabRef = tabRefs.current[activeTab];
    if (activeTabRef && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tabRect = activeTabRef.getBoundingClientRect();

      setIndicatorStyle({
        width: tabRect.width,
        left: tabRect.left - containerRect.left,
      });
    }
  }, [activeTab, tabs]);

  const handleTabClick = (tabId: string) => {
    if (tabId !== activeTab) {
      // Enhanced haptic feedback for tab switching
      if (!disableTouchFeedback) {
        hapticFeedback.touchFeedback('light');
      }
      onTabChange(tabId);
    }
  };

  if (variant === 'segmented') {
    return (
      <SegmentedContainer ref={containerRef} className={className}>
        <SegmentedIndicator $width={indicatorStyle.width} $left={indicatorStyle.left} />
        {tabs.map(tab => (
          <SegmentedTab
            key={tab.id}
            ref={el => {
              tabRefs.current[tab.id] = el;
            }}
            $active={activeTab === tab.id}
            onClick={() => handleTabClick(tab.id)}
            // Enhanced touch feedback integration
            {...(disableTouchFeedback ? {} : tabTouchFeedback)}
            style={{
              zIndex: 1,
              ...(!disableTouchFeedback ? tabTouchFeedback.style : {}),
            }}
          >
            {tab.icon && <TabIcon $active={activeTab === tab.id}>{tab.icon}</TabIcon>}
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <TabBadge>{tab.badge > 99 ? '99+' : tab.badge}</TabBadge>
            )}
          </SegmentedTab>
        ))}
      </SegmentedContainer>
    );
  }

  return (
    <TabContainer $fullWidth={fullWidth} className={className}>
      <TabList ref={containerRef} $fullWidth={fullWidth}>
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            ref={el => {
              tabRefs.current[tab.id] = el;
            }}
            $active={activeTab === tab.id}
            $fullWidth={fullWidth}
            onClick={() => handleTabClick(tab.id)}
            // Enhanced touch feedback integration
            {...(disableTouchFeedback ? {} : tabTouchFeedback)}
            style={!disableTouchFeedback ? tabTouchFeedback.style : {}}
          >
            {tab.icon && <TabIcon $active={activeTab === tab.id}>{tab.icon}</TabIcon>}
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <TabBadge>{tab.badge > 99 ? '99+' : tab.badge}</TabBadge>
            )}
          </Tab>
        ))}
        <Underline $width={indicatorStyle.width} $left={indicatorStyle.left} />
      </TabList>
    </TabContainer>
  );
};

// 하단 네비게이션 탭 바
const BottomTabContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.04);
  z-index: 100;
`;

const BottomTabList = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 56px;
  max-width: 430px;
  margin: 0 auto;
`;

const BottomTab = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  position: relative;

  &:active {
    transform: scale(0.96);
  }
`;

const BottomTabIcon = styled.span<{ $active: boolean }>`
  font-size: 24px;
  color: ${props => (props.$active ? tokens.colors.brand.primary : '#757575')};
  transition: color ${kbTimings.fast} ${kbTimings.easeOut};
`;

const BottomTabLabel = styled.span<{ $active: boolean }>`
  font-size: 11px;
  font-weight: ${props => (props.$active ? 600 : 500)};
  color: ${props => (props.$active ? tokens.colors.brand.primary : '#757575')};
  transition: all ${kbTimings.fast} ${kbTimings.easeOut};
`;

const BottomTabBadge = styled.span`
  position: absolute;
  top: 6px;
  right: calc(50% - 16px);
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #ff5252;
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface BottomTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  // Enhanced touch feedback options
  touchFeedback?: Partial<TouchFeedbackOptions>;
  disableTouchFeedback?: boolean;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  touchFeedback,
  disableTouchFeedback = false,
}) => {
  // Enhanced touch feedback configuration for bottom tabs
  const defaultBottomTabFeedback: TouchFeedbackOptions = {
    type: 'scale',
    intensity: 'medium',
    haptic: true,
    androidOptimized: true,
    color: tokens.colors.brand.primary + '15', // 15% alpha for bottom tabs
    duration: 250,
  };

  const finalTouchFeedback = { ...defaultBottomTabFeedback, ...touchFeedback };
  const bottomTabTouchFeedback = useTouchFeedback(
    disableTouchFeedback ? undefined : finalTouchFeedback
  );

  const handleBottomTabClick = (tabId: string) => {
    // Enhanced haptic feedback for bottom tab switching
    if (!disableTouchFeedback) {
      if (tabId === activeTab) {
        hapticFeedback.touchFeedback('light'); // Light feedback for same tab
      } else {
        hapticFeedback.touchFeedback('medium'); // Medium feedback for tab switching
      }
    }
    onTabChange(tabId);
  };

  return (
    <BottomTabContainer className={className}>
      <BottomTabList>
        {tabs.map(tab => (
          <BottomTab
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => handleBottomTabClick(tab.id)}
            // Enhanced touch feedback integration
            {...(disableTouchFeedback ? {} : bottomTabTouchFeedback)}
            style={!disableTouchFeedback ? bottomTabTouchFeedback.style : {}}
          >
            <BottomTabIcon $active={activeTab === tab.id}>{tab.icon}</BottomTabIcon>
            <BottomTabLabel $active={activeTab === tab.id}>{tab.label}</BottomTabLabel>
            {tab.badge !== undefined && tab.badge > 0 && (
              <BottomTabBadge>{tab.badge > 99 ? '99+' : tab.badge}</BottomTabBadge>
            )}
          </BottomTab>
        ))}
      </BottomTabList>
    </BottomTabContainer>
  );
};
