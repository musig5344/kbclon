/**
 * KB 스타뱅킹 화면 전환 애니메이션
 * 부드러운 슬라이드 효과로 네이티브 앱과 동일한 경험 제공
 */

import React, { ReactNode } from 'react';

import { useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import styled from 'styled-components';

import { kbPageSlideIn, kbPageSlideOut, kbTimings } from '../../../styles/KBMicroDetails';

const TransitionContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const PageWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform, opacity;
  
  &.page-enter {
    animation: ${kbPageSlideIn} ${kbTimings.normal} ${kbTimings.easeOut} forwards;
    z-index: 2;
  }
  
  &.page-exit {
    animation: ${kbPageSlideOut} ${kbTimings.normal} ${kbTimings.easeIn} forwards;
    z-index: 1;
  }
  
  /* 뒤로가기 애니메이션 (반대 방향) */
  &.page-enter-back {
    animation: ${kbPageSlideOut} ${kbTimings.normal} ${kbTimings.easeOut} reverse forwards;
    z-index: 2;
  }
  
  &.page-exit-back {
    animation: ${kbPageSlideIn} ${kbTimings.normal} ${kbTimings.easeIn} reverse forwards;
    z-index: 1;
  }
`;

interface PageTransitionProps {
  children: ReactNode;
  transitionKey?: string;
  timeout?: number;
  classNames?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  transitionKey,
  timeout = 300,
  classNames = 'page'
}) => {
  const location = useLocation();
  const key = transitionKey || location.pathname;
  
  return (
    <TransitionContainer>
      <TransitionGroup component={null}>
        <CSSTransition
          key={key}
          timeout={timeout}
          classNames={classNames}
          unmountOnExit
        >
          <PageWrapper>
            {children}
          </PageWrapper>
        </CSSTransition>
      </TransitionGroup>
    </TransitionContainer>
  );
};

// 간단한 페이드 전환
const FadeWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  
  &.fade-enter {
    opacity: 0;
  }
  
  &.fade-enter-active {
    opacity: 1;
    transition: opacity ${kbTimings.fast} ${kbTimings.easeOut};
  }
  
  &.fade-exit {
    opacity: 1;
  }
  
  &.fade-exit-active {
    opacity: 0;
    transition: opacity ${kbTimings.fast} ${kbTimings.easeIn};
  }
`;

export const FadeTransition: React.FC<PageTransitionProps> = ({
  children,
  transitionKey,
  timeout = 200,
  classNames = 'fade'
}) => {
  const location = useLocation();
  const key = transitionKey || location.pathname;
  
  return (
    <TransitionContainer>
      <TransitionGroup component={null}>
        <CSSTransition
          key={key}
          timeout={timeout}
          classNames={classNames}
          unmountOnExit
        >
          <FadeWrapper>
            {children}
          </FadeWrapper>
        </CSSTransition>
      </TransitionGroup>
    </TransitionContainer>
  );
};

// 탭 전환용 애니메이션
const TabWrapper = styled.div<{ $direction: 'left' | 'right' }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  
  &.tab-enter {
    transform: translateX(${props => props.$direction === 'right' ? '100%' : '-100%'});
    opacity: 0.8;
  }
  
  &.tab-enter-active {
    transform: translateX(0);
    opacity: 1;
    transition: all ${kbTimings.fast} ${kbTimings.easeOut};
  }
  
  &.tab-exit {
    transform: translateX(0);
    opacity: 1;
  }
  
  &.tab-exit-active {
    transform: translateX(${props => props.$direction === 'right' ? '-100%' : '100%'});
    opacity: 0.8;
    transition: all ${kbTimings.fast} ${kbTimings.easeIn};
  }
`;

interface TabTransitionProps extends PageTransitionProps {
  direction?: 'left' | 'right';
}

export const TabTransition: React.FC<TabTransitionProps> = ({
  children,
  transitionKey,
  timeout = 200,
  classNames = 'tab',
  direction = 'right'
}) => {
  const key = transitionKey || Date.now().toString();
  
  return (
    <TransitionContainer>
      <TransitionGroup component={null}>
        <CSSTransition
          key={key}
          timeout={timeout}
          classNames={classNames}
          unmountOnExit
        >
          <TabWrapper $direction={direction}>
            {children}
          </TabWrapper>
        </CSSTransition>
      </TransitionGroup>
    </TransitionContainer>
  );
};