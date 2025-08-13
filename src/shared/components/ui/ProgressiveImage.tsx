import React, { useState, useEffect } from 'react';

import styled from 'styled-components';
const ImageContainer = styled.div<{ aspectRatio?: number }>`
  position: relative;
  width: 100%;
  ${props =>
    props.aspectRatio &&
    `
    padding-bottom: ${(1 / props.aspectRatio) * 100}%;
  `}
  overflow: hidden;
  background-color: #f0f0f0;
`;
const StyledImage = styled.img<{ loaded: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${props => (props.loaded ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
`;
const Placeholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: -200% center;
    }
    100% {
      background-position: 200% center;
    }
  }
`;
interface ProgressiveImageProps {
  src: string;
  alt: string;
  aspectRatio?: number;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}
export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  aspectRatio,
  className,
  onLoad,
  onError,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      setError(true);
      onError?.();
    };
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad, onError]);
  return (
    <ImageContainer aspectRatio={aspectRatio} className={className}>
      {!loaded && !error && <Placeholder />}
      {!error && <StyledImage src={src} alt={alt} loaded={loaded} />}
    </ImageContainer>
  );
};
