import React, { useState, useRef, useEffect } from 'react';

import styled from 'styled-components';

import { supportsWebP } from '../../utils/imageOptimization';

interface LazyImageProps {
  src: string;
  webpSrc?: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  placeholder?: string;
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  srcSet?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  quality?: number;
  fill?: boolean;
}

interface ImageWrapperProps {
  width?: number | string;
  height?: number | string;
  fill?: boolean;
}

const ImageWrapper = styled.div<ImageWrapperProps>`
  position: relative;
  display: inline-block;
  overflow: hidden;
  
  /* 성능 최적화 */
  transform: translateZ(0);
  will-change: auto;
  contain: layout style;
  
  ${props => props.fill && `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100% !important;
    height: 100% !important;
  `}
  
  ${props => props.width && !props.fill && `width: ${typeof props.width === 'number' ? props.width + 'px' : props.width};`}
  ${props => props.height && !props.fill && `height: ${typeof props.height === 'number' ? props.height + 'px' : props.height};`}
`;

const StyledImage = styled.img<{ $isLoaded: boolean; $fill?: boolean }>`
  display: block;
  max-width: 100%;
  height: auto;
  
  /* 고성능 애니메이션 최적화 */
  transform: translateZ(0);
  will-change: auto;
  backface-visibility: hidden;
  
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${props => props.$isLoaded ? 1 : 0};
  transform: ${props => props.$isLoaded 
    ? 'translateZ(0) scale(1)' 
    : 'translateZ(0) scale(1.02)'
  };
  
  &:hover {
    will-change: transform;
  }
  
  ${props => props.$fill && `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  `}
`;

const PlaceholderDiv = styled.div<{ 
  $width?: number | string; 
  $height?: number | string;
  $fill?: boolean;
  $blurDataURL?: string;
}>`
  ${props => props.$fill ? `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  ` : `
    width: ${typeof props.$width === 'number' ? props.$width + 'px' : props.$width || '100%'};
    height: ${typeof props.$height === 'number' ? props.$height + 'px' : props.$height || 'auto'};
  `}
  
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  /* GPU 가속 및 성능 최적화 */
  transform: translateZ(0);
  will-change: auto;
  backface-visibility: hidden;
  contain: layout style paint;
  
  ${props => props.$blurDataURL && `
    background-image: url('${props.$blurDataURL}');
    background-size: cover;
    background-position: center;
    filter: blur(5px);
    transform: translateZ(0) scale(1.1);
  `}
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    margin: -10px 0 0 -10px;
    border: 2px solid #ddd;
    border-top: 2px solid #666;
    border-radius: 50%;
    
    /* 최적화된 로딩 스피너 애니메이션 */
    transform: translateZ(0);
    will-change: transform;
    animation: optimizedSpin 1s linear infinite;
  }
  
  @keyframes optimizedSpin {
    0% { transform: translateZ(0) rotate(0deg); }
    100% { transform: translateZ(0) rotate(360deg); }
  }
`;

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  webpSrc,
  alt,
  width,
  height,
  className,
  placeholder,
  blurDataURL,
  onLoad,
  onError,
  sizes,
  srcSet,
  loading = 'lazy',
  priority = false,
  quality = 75,
  fill = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority || loading === 'eager');
  const [webpSupported, setWebpSupported] = useState<boolean | null>(null);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // WebP 지원 확인
  useEffect(() => {
    supportsWebP().then(setWebpSupported);
  }, []);

  // Intersection Observer 설정
  useEffect(() => {
    if (priority || loading === 'eager') return () => {};

    const currentImg = imgRef.current;
    if (!currentImg) return () => {};

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    observerRef.current.observe(currentImg);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, loading]);

  // 이미지 로드 핸들러 (성능 최적화)
  const handleLoad = () => {
    // will-change 동적 관리
    if (imgRef.current) {
      imgRef.current.style.willChange = 'transform, opacity';
      
      // 애니메이션 완료 후 will-change 제거
      setTimeout(() => {
        if (imgRef.current) {
          imgRef.current.style.willChange = 'auto';
        }
      }, 300);
    }
    
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  // 최적화된 이미지 src 결정
  const getOptimizedSrc = () => {
    if (error) return src;
    
    // WebP 지원하고 webpSrc가 있으면 WebP 사용
    if (webpSupported && webpSrc) {
      return webpSrc;
    }
    
    return src;
  };

  // 이미지가 뷰포트에 들어왔고 WebP 지원 확인이 완료된 경우에만 실제 이미지 로드
  const shouldLoadImage = isInView && webpSupported !== null;

  return (
    <ImageWrapper
      width={width}
      height={height}
      fill={fill}
      className={className}
    >
      {!shouldLoadImage && (
        <PlaceholderDiv
          $width={width}
          $height={height}
          $fill={fill}
          $blurDataURL={blurDataURL}
        />
      )}
      
      {shouldLoadImage && (
        <picture>
          {/* WebP 소스 */}
          {webpSupported && webpSrc && !error && (
            <source
              srcSet={webpSrc}
              type="image/webp"
              sizes={sizes}
            />
          )}
          
          {/* 대체 이미지 */}
          <StyledImage
            ref={imgRef}
            src={getOptimizedSrc()}
            alt={alt}
            $isLoaded={isLoaded}
            $fill={fill}
            srcSet={srcSet}
            sizes={sizes}
            onLoad={handleLoad}
            onError={handleError}
            loading={loading}
            {...props}
          />
        </picture>
      )}
    </ImageWrapper>
  );
};

export default LazyImage;

// 반응형 이미지를 위한 헬퍼 컴포넌트
interface ResponsiveImageProps extends Omit<LazyImageProps, 'src' | 'srcSet' | 'sizes'> {
  baseSrc: string;
  responsiveSizes?: {
    small?: string;
    medium?: string;
    large?: string;
  };
  breakpoints?: {
    small: number;
    medium: number;
    large: number;
  };
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  baseSrc,
  sizes,
  breakpoints = { small: 480, medium: 768, large: 1200 },
  ...props
}) => {
  const generateSrcSet = () => {
    if (!sizes) return undefined;
    
    const srcSetArray = [];
    if (sizes.small) srcSetArray.push(`${sizes.small} ${breakpoints.small}w`);
    if (sizes.medium) srcSetArray.push(`${sizes.medium} ${breakpoints.medium}w`);
    if (sizes.large) srcSetArray.push(`${sizes.large} ${breakpoints.large}w`);
    
    return srcSetArray.join(', ');
  };

  const generateSizesAttr = () => {
    return `(max-width: ${breakpoints.small}px) ${breakpoints.small}px, ` +
           `(max-width: ${breakpoints.medium}px) ${breakpoints.medium}px, ` +
           `${breakpoints.large}px`;
  };

  return (
    <LazyImage
      src={baseSrc}
      srcSet={generateSrcSet()}
      sizes={generateSizesAttr()}
      {...props}
    />
  );
};

// KB 스타일링을 위한 사전 정의된 이미지 컴포넌트
interface KBImageProps extends Omit<LazyImageProps, 'webpSrc'> {
  variant?: 'icon' | 'logo' | 'hero' | 'thumbnail';
}

export const KBImage: React.FC<KBImageProps> = ({
  src,
  variant = 'thumbnail',
  quality,
  ...props
}) => {
  // variant에 따른 기본 설정
  const getVariantConfig = () => {
    switch (variant) {
      case 'icon':
        return { width: 24, height: 24, quality: 90 };
      case 'logo':
        return { width: 120, quality: 90 };
      case 'hero':
        return { width: '100%', quality: 80 };
      case 'thumbnail':
      default:
        return { width: 150, quality: 85 };
    }
  };

  const config = getVariantConfig();
  const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');

  return (
    <LazyImage
      src={src}
      webpSrc={webpSrc}
      quality={quality || config.quality}
      width={config.width}
      height={config.height}
      {...props}
    />
  );
};