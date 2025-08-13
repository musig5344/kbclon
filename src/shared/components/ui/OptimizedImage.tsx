import React, { useState, useEffect, useRef } from 'react';

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
  background-color: #f5f5f5;
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

const StyledPicture = styled.picture<{ loaded: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: ${props => (props.loaded ? 1 : 0)};
    transition: opacity 0.3s ease-in-out;
  }
`;

const Placeholder = styled.div<{ placeholderColor?: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${props =>
    props.placeholderColor || 'linear-gradient(90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)'};
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

const ErrorPlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #999;
  font-size: 14px;
`;

interface OptimizedImageProps {
  src: string;
  alt: string;
  webpSrc?: string;
  thumbnailSrc?: string;
  aspectRatio?: number;
  className?: string;
  placeholderColor?: string;
  lazy?: boolean;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  fallbackText?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  webpSrc,
  thumbnailSrc,
  aspectRatio,
  className,
  placeholderColor,
  lazy = true,
  priority = false,
  onLoad,
  onError,
  sizes,
  fallbackText = '이미지를 불러올 수 없습니다',
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(!lazy);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters viewport
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazy, priority]);

  // Preload image
  useEffect(() => {
    if (!isIntersecting) return;

    const img = new Image();
    const srcToLoad = webpSrc || src;

    img.src = srcToLoad;

    img.onload = () => {
      setLoaded(true);
      onLoad?.();
    };

    img.onerror = () => {
      // If WebP fails, try fallback
      if (webpSrc && src !== webpSrc) {
        const fallbackImg = new Image();
        fallbackImg.src = src;

        fallbackImg.onload = () => {
          setLoaded(true);
          onLoad?.();
        };

        fallbackImg.onerror = () => {
          setError(true);
          onError?.();
        };
      } else {
        setError(true);
        onError?.();
      }
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, webpSrc, isIntersecting, onLoad, onError]);

  const renderImage = () => {
    if (error) {
      return <ErrorPlaceholder>{fallbackText}</ErrorPlaceholder>;
    }

    if (!isIntersecting) {
      return <Placeholder placeholderColor={placeholderColor} />;
    }

    // Use picture element for WebP support with fallback
    if (webpSrc) {
      return (
        <>
          {(!loaded || thumbnailSrc) && <Placeholder placeholderColor={placeholderColor} />}
          <StyledPicture loaded={loaded}>
            <source srcSet={webpSrc} type='image/webp' />
            <img
              ref={imageRef}
              src={src}
              alt={alt}
              loading={lazy ? 'lazy' : 'eager'}
              decoding={priority ? 'sync' : 'async'}
              sizes={sizes}
            />
          </StyledPicture>
        </>
      );
    }

    // Regular image
    return (
      <>
        {!loaded && <Placeholder placeholderColor={placeholderColor} />}
        <StyledImage
          ref={imageRef}
          src={src}
          alt={alt}
          loaded={loaded}
          loading={lazy ? 'lazy' : 'eager'}
          decoding={priority ? 'sync' : 'async'}
          sizes={sizes}
        />
      </>
    );
  };

  return (
    <ImageContainer ref={containerRef} aspectRatio={aspectRatio} className={className}>
      {renderImage()}
    </ImageContainer>
  );
};

// 자주 사용되는 이미지 크기에 대한 프리셋
export const ImagePresets = {
  thumbnail: {
    sizes: '(max-width: 768px) 100px, 150px',
    aspectRatio: 1,
  },
  card: {
    sizes: '(max-width: 768px) 100vw, 300px',
    aspectRatio: 16 / 9,
  },
  hero: {
    sizes: '100vw',
    aspectRatio: 16 / 9,
    priority: true,
  },
  icon: {
    sizes: '48px',
    aspectRatio: 1,
    lazy: false,
  },
} as const;
