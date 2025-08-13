/**
 * 이미지 최적화 유틸리티
 */

// WebP 지원 확인
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// 이미지 사이즈 계산
export const calculateImageSize = (containerWidth: number, devicePixelRatio: number = window.devicePixelRatio): number => {
  return Math.ceil(containerWidth * devicePixelRatio);
};

// 반응형 이미지 srcset 생성
export const generateSrcSet = (baseUrl: string, sizes: number[]): string => {
  return sizes
    .map(size => `${baseUrl}?w=${size} ${size}w`)
    .join(', ');
};

// 이미지 포맷 감지
export const detectImageFormat = (url: string): string | null => {
  const match = url.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : null;
};

// 이미지 최적화 설정
export interface ImageOptimizationConfig {
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

// 이미지 URL 최적화 (CDN 사용 시)
export const optimizeImageUrl = (url: string, config: ImageOptimizationConfig): string => {
  // CDN이 없는 경우 원본 URL 반환
  if (!url.includes('cdn.') && !url.includes('cloudinary') && !url.includes('imgix')) {
    return url;
  }

  const params = new URLSearchParams();
  
  if (config.quality) {
    params.append('q', config.quality.toString());
  }
  
  if (config.format) {
    params.append('fm', config.format);
  }
  
  if (config.width) {
    params.append('w', config.width.toString());
  }
  
  if (config.height) {
    params.append('h', config.height.toString());
  }
  
  if (config.fit) {
    params.append('fit', config.fit);
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
};

// 이미지 프리로딩
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// 여러 이미지 프리로딩
export const preloadImages = (srcs: string[]): Promise<void[]> => {
  return Promise.all(srcs.map(src => preloadImage(src)));
};

// 이미지 지연 로딩을 위한 Intersection Observer 옵션
export const lazyLoadOptions: IntersectionObserverInit = {
  root: null,
  rootMargin: '50px',
  threshold: 0.01
};

// 이미지 크기별 추천 설정
export const imageSizeRecommendations = {
  // 아이콘 (48x48 이하)
  icon: {
    maxWidth: 48,
    quality: 90,
    format: 'png' as const
  },
  // 썸네일 (150x150 이하)
  thumbnail: {
    maxWidth: 150,
    quality: 85,
    format: 'webp' as const
  },
  // 카드 이미지 (300x200)
  card: {
    maxWidth: 300,
    quality: 85,
    format: 'webp' as const
  },
  // 히어로 이미지 (전체 너비)
  hero: {
    maxWidth: 1920,
    quality: 80,
    format: 'webp' as const
  }
};

// 이미지 캐싱 헤더 생성
export const getImageCacheHeaders = (maxAge: number = 31536000): HeadersInit => {
  return {
    'Cache-Control': `public, max-age=${maxAge}, immutable`
  };
};

// Base64 이미지 크기 계산 (KB)
export const calculateBase64Size = (base64String: string): number => {
  const base64Length = base64String.length - (base64String.indexOf(',') + 1);
  const padding = (base64String.charAt(base64String.length - 2) === '=') ? 2 : ((base64String.charAt(base64String.length - 1) === '=') ? 1 : 0);
  const fileSize = base64Length * 0.75 - padding;
  return Math.round(fileSize / 1024);
};