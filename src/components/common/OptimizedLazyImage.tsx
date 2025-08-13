import React, { useState, useRef, useEffect, useCallback, useMemo, ImgHTMLAttributes } from 'react';

import styled, { css, keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

const PlaceholderContainer = styled.div<{ aspectRatio?: number }>`
  position: relative;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 468px 104px;
  animation: ${shimmer} 1.2s ease-in-out infinite;
  border-radius: 4px;
  ${props =>
    props.aspectRatio &&
    css`
      aspect-ratio: ${props.aspectRatio};
    `}
`;

const ImageContainer = styled.div<{
  isLoading: boolean;
  aspectRatio?: number;
}>`
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  ${props =>
    props.aspectRatio &&
    css`
      aspect-ratio: ${props.aspectRatio};
    `}

  ${props =>
    props.isLoading &&
    css`
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 468px 104px;
      animation: ${shimmer} 1.2s ease-in-out infinite;
    `}
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const Image = styled.img<{ isLoaded: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease-in-out;
  opacity: ${props => (props.isLoaded ? 1 : 0)};

  ${props =>
    props.isLoaded &&
    css`
      animation: ${fadeIn} 0.3s ease-in-out;
    `}
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
  color: #999;
  font-size: 12px;
  min-height: 60px;
  border: 1px solid #eee;
  border-radius: 4px;

  &::before {
    content: '🖼️';
    margin-right: 8px;
    font-size: 16px;
  }
`;

export interface OptimizedLazyImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes'> {
  /** 기본 이미지 URL */
  src: string;
  /** WebP 이미지 URL */
  webpSrc?: string;
  /** 반응형 이미지 srcSet */
  srcSet?: string;
  /** WebP srcSet */
  webpSrcSet?: string;
  /** 이미지 크기 설정 */
  sizes?: string;
  /** 대체 텍스트 */
  alt: string;
  /** 로딩 방식 */
  loading?: 'lazy' | 'eager';
  /** 가로세로 비율 (예: 16/9, 4/3) */
  aspectRatio?: number;
  /** 로딩 상태 표시 여부 */
  showLoader?: boolean;
  /** 에러 발생 시 대체 이미지 */
  fallbackSrc?: string;
  /** 이미지 로드 성공 콜백 */
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /** 이미지 로드 실패 콜백 */
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /** 고품질 이미지 프리로딩 활성화 */
  preloadHighRes?: boolean;
  /** 교차점 감지 여백 */
  rootMargin?: string;
  /** 성능 최적화 레벨 */
  optimizationLevel?: 'low' | 'medium' | 'high';
}

const OptimizedLazyImage: React.FC<OptimizedLazyImageProps> = ({
  src,
  webpSrc,
  srcSet,
  webpSrcSet,
  sizes = '100vw',
  alt,
  loading = 'lazy',
  aspectRatio,
  showLoader = true,
  fallbackSrc,
  onLoad,
  onError,
  preloadHighRes = false,
  rootMargin = '50px',
  optimizationLevel = 'medium',
  className,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(loading === 'eager');
  const [currentSrc, setCurrentSrc] = useState<string>('');

  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // WebP 지원 확인
  const supportsWebP = useMemo(() => {
    if (typeof window === 'undefined') return false;

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
  }, []);

  // 최적화된 이미지 소스 결정
  const optimizedSrc = useMemo(() => {
    if (supportsWebP && webpSrc) {
      return webpSrc;
    }
    return src;
  }, [supportsWebP, webpSrc, src]);

  const optimizedSrcSet = useMemo(() => {
    if (supportsWebP && webpSrcSet) {
      return webpSrcSet;
    }
    return srcSet;
  }, [supportsWebP, webpSrcSet, srcSet]);

  // Intersection Observer 설정
  useEffect(() => {
    if (loading === 'eager' || isVisible) return;

    const threshold =
      optimizationLevel === 'high' ? 0.1 : optimizationLevel === 'medium' ? 0.01 : 0;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observerRef.current?.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [loading, isVisible, rootMargin, optimizationLevel]);

  // 이미지 프리로딩 (고품질 모드)
  useEffect(() => {
    if (!preloadHighRes || !isVisible) return;

    const img = new (window as any).Image() as HTMLImageElement;
    img.src = optimizedSrc;
    if (optimizedSrcSet) {
      img.srcset = optimizedSrcSet;
    }
  }, [preloadHighRes, isVisible, optimizedSrc, optimizedSrcSet]);

  // 이미지 로드 핸들러
  const handleLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoading(false);
      setIsLoaded(true);
      setHasError(false);
      onLoad?.(event);
    },
    [onLoad]
  );

  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoading(false);
      setHasError(true);

      // Fallback 이미지 시도
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        setHasError(false);
        setIsLoading(true);
        return;
      }

      onError?.(event);
    },
    [onError, fallbackSrc, currentSrc]
  );

  // 현재 소스 업데이트
  useEffect(() => {
    if (isVisible && !currentSrc) {
      setCurrentSrc(optimizedSrc);
    }
  }, [isVisible, optimizedSrc, currentSrc]);

  // 에러 상태 렌더링
  if (hasError && !fallbackSrc) {
    return <ErrorContainer className={className}>이미지를 불러올 수 없습니다</ErrorContainer>;
  }

  // 로딩 상태이고 플레이스홀더 표시
  if (isLoading && showLoader && !isVisible) {
    return <PlaceholderContainer className={className} aspectRatio={aspectRatio} ref={imgRef} />;
  }

  return (
    <ImageContainer
      className={className}
      isLoading={isLoading && showLoader}
      aspectRatio={aspectRatio}
      ref={!isVisible ? imgRef : undefined}
    >
      {isVisible && (
        <picture>
          {/* WebP 소스 */}
          {supportsWebP && webpSrc && (
            <>
              {webpSrcSet ? (
                <source srcSet={webpSrcSet} sizes={sizes} type='image/webp' />
              ) : (
                <source srcSet={webpSrc} type='image/webp' />
              )}
            </>
          )}

          {/* 폴백 이미지 */}
          <Image
            ref={imgRef}
            src={currentSrc || optimizedSrc}
            srcSet={optimizedSrcSet}
            sizes={optimizedSrcSet ? sizes : undefined}
            alt={alt}
            loading={loading}
            isLoaded={isLoaded}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />
        </picture>
      )}
    </ImageContainer>
  );
};

// 성능 최적화된 메모이제이션
export default React.memo(OptimizedLazyImage, (prevProps, nextProps) => {
  // 중요한 props만 비교
  const importantProps = [
    'src',
    'webpSrc',
    'srcSet',
    'webpSrcSet',
    'alt',
    'loading',
    'aspectRatio',
    'className',
  ] as const;

  return importantProps.every(prop => prevProps[prop] === nextProps[prop]);
});

// 편의 컴포넌트들
export const LazyImage = OptimizedLazyImage;

export const EagerImage: React.FC<OptimizedLazyImageProps> = props => (
  <OptimizedLazyImage {...props} loading='eager' />
);

export const HighQualityLazyImage: React.FC<OptimizedLazyImageProps> = props => (
  <OptimizedLazyImage {...props} preloadHighRes optimizationLevel='high' />
);
