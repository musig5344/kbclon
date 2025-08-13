import React from 'react';

import styled from 'styled-components';

import { UnifiedLoading } from './UnifiedLoading';

interface PageLoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
}

const OverlayContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
`;

const ContentWrapper = styled.div<{ $isLoading: boolean }>`
  width: 100%;
  height: 100%;
  transition: all 0.3s ease-out;
  transform-origin: top center;

  ${props =>
    props.$isLoading &&
    `
    transform: scale(0.92) translateY(20px);
    opacity: 0.6;
    filter: blur(2px);
    pointer-events: none;
  `}
`;

const LoadingOverlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: ${props => (props.$isVisible ? 'flex' : 'none')};
  z-index: 10000;
`;

export const PageLoadingOverlay: React.FC<PageLoadingOverlayProps> = ({ isLoading, children }) => {
  return (
    <OverlayContainer>
      <ContentWrapper $isLoading={isLoading}>{children}</ContentWrapper>
      <LoadingOverlay $isVisible={isLoading}>
        <UnifiedLoading isVisible={isLoading} type='overlay' variant='type1' size='medium' />
      </LoadingOverlay>
    </OverlayContainer>
  );
};
