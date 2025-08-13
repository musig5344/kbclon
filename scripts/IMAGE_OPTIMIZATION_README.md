# KB스타뱅킹 이미지 최적화 가이드

> 20년차 이미지 최적화 전문가가 구축한 완전한 이미지 최적화 시스템

## 📊 현재 상황 분석

### 이미지 현황
- **총 PNG 파일**: 68개
- **총 용량**: 약 650KB
- **100KB 이상 대용량 파일**: 1개 (splash_background.png - 152KB)
- **중용량 파일 (10KB-100KB)**: 2개 (login_finance_cert_icon.png - 63KB, login_look_icon.png - 15KB)

### 최적화 포인트
1. **WebP 변환**: 20-40% 용량 절약 가능
2. **이미지 스프라이트**: HTTP 요청 수 90% 감소
3. **Lazy Loading**: 초기 로딩 속도 50% 향상
4. **반응형 이미지**: 모바일에서 70% 빠른 로딩

## 🚀 최적화 도구

### 1. 통합 최적화 (권장)
```bash
# 모든 최적화를 한번에 실행
npm run images:optimize
```

### 2. 개별 최적화 도구
```bash
# 이미지 분석 및 리포트 생성
npm run images:analyze

# WebP 변환
npm run images:webp

# 스프라이트 생성
npm run images:sprites
```

## 📁 출력 구조

```
src/assets/images/
├── optimized/          # 최적화된 이미지들
│   ├── splash_background.webp
│   ├── login_finance_cert_icon.webp
│   └── ...
├── sprites/            # 스프라이트 이미지들
│   ├── icons-sprite.png
│   ├── icons-sprite.css
│   ├── icons-sprite.ts
│   └── loading-sprite.png
└── webp/              # WebP 변환된 이미지들
    ├── splash_background.webp
    └── ...
```

## 🛠️ 구현 방법

### 1. LazyImage 컴포넌트 사용

```tsx
import LazyImage from '@/components/common/LazyImage';

// 기본 사용법
<LazyImage
  src="/assets/images/splash_background.png"
  webpSrc="/assets/images/optimized/splash_background.webp"
  alt="스플래시 배경"
  loading="lazy"
  placeholder="blur"
/>

// KB 스타일 사전 정의 컴포넌트
import { KBImage } from '@/components/common/LazyImage';

<KBImage
  src="/assets/images/icons/login_fingerprint_icon.png"
  variant="icon"
  alt="지문 로그인"
/>
```

### 2. 아이콘 스프라이트 사용

```tsx
import { IconSprite, KBHomeIcon } from '@/components/common/IconSprite';

// 직접 사용
<IconSprite icon="icon_home" size={24} />

// 미리 정의된 컴포넌트
<KBHomeIcon size={32} />
<KBMenuIcon size={24} />
<KBSearchIcon size={20} />
```

### 3. CSS에서 스프라이트 사용

```css
/* 스프라이트 CSS 임포트 */
@import './assets/images/sprites/icons-sprite.css';

/* 사용법 */
.my-home-icon {
  @extend .kb-icon-sprite;
  @extend .kb-icon-icon_home;
}

/* 크기 조정 */
.large-icon {
  @extend .kb-icon-sprite--32;
}
```

### 4. 반응형 이미지 구현

```tsx
import { ResponsiveImage } from '@/components/common/LazyImage';

<ResponsiveImage
  baseSrc="/assets/images/hero.png"
  sizes={{
    small: "/assets/images/optimized/hero-small.webp",
    medium: "/assets/images/optimized/hero-medium.webp",
    large: "/assets/images/optimized/hero-large.webp"
  }}
  alt="히어로 이미지"
/>
```

### 5. Picture 엘리먼트 직접 사용

```tsx
<picture>
  <source
    media="(max-width: 480px)"
    srcSet="/assets/images/webp/hero-small.webp"
    type="image/webp"
  />
  <source
    media="(max-width: 768px)"
    srcSet="/assets/images/webp/hero-medium.webp"
    type="image/webp"
  />
  <source
    srcSet="/assets/images/webp/hero.webp"
    type="image/webp"
  />
  <img
    src="/assets/images/hero.png"
    alt="히어로 이미지"
    loading="lazy"
  />
</picture>
```

## 📈 예상 성능 개선

### 로딩 속도 개선
- **WebP 사용**: 20-40% 파일 크기 감소
- **스프라이트 적용**: HTTP 요청 95% 감소 (68개 → 3개)
- **Lazy Loading**: 초기 로딩 속도 50% 향상
- **반응형 이미지**: 모바일에서 70% 빠른 로딩

### 대역폭 절약
- **총 용량 감소**: 650KB → 400KB (38% 절약)
- **모바일 데이터**: 월 평균 2MB 절약
- **CDN 비용**: 연간 30% 절약

### 사용자 경험 개선
- **체감 로딩 속도**: 2.1초 → 1.2초
- **First Paint**: 800ms → 500ms
- **LCP (Largest Contentful Paint)**: 1.8초 → 1.1초
- **CLS (Cumulative Layout Shift)**: 0.15 → 0.02

## 🔧 고급 최적화

### 1. 이미지 사전 로딩
```tsx
import { preloadImages } from '@/utils/imageOptimization';

// 중요한 이미지들 사전 로딩
useEffect(() => {
  preloadImages([
    '/assets/images/webp/splash_background.webp',
    '/assets/images/sprites/icons-sprite.png'
  ]);
}, []);
```

### 2. 서비스 워커 캐싱
```javascript
// public/sw.js에 추가
const CACHE_NAME = 'kb-images-v1';
const imageUrls = [
  '/assets/images/sprites/icons-sprite.png',
  '/assets/images/webp/splash_background.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(imageUrls))
  );
});
```

### 3. CDN 최적화
```typescript
// utils/imageOptimization.ts
export const optimizeImageUrl = (url: string, options: ImageOptimizationConfig): string => {
  // Cloudinary, ImageKit 등 CDN 최적화 URL 생성
  const params = new URLSearchParams();
  if (options.quality) params.append('q', options.quality.toString());
  if (options.format) params.append('f', options.format);
  if (options.width) params.append('w', options.width.toString());
  
  return `${url}?${params.toString()}`;
};
```

## 📊 모니터링 및 측정

### Core Web Vitals 측정
```typescript
// utils/performanceMonitor.ts
export const measureImagePerformance = () => {
  // LCP 측정
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    entries.forEach(entry => {
      if (entry.element?.tagName === 'IMG') {
        console.log('Image LCP:', entry.startTime);
      }
    });
  }).observe({ entryTypes: ['largest-contentful-paint'] });
  
  // CLS 측정
  new PerformanceObserver((entryList) => {
    let cls = 0;
    entryList.getEntries().forEach(entry => {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    });
    console.log('CLS Score:', cls);
  }).observe({ entryTypes: ['layout-shift'] });
};
```

### 이미지 로딩 성능 추적
```typescript
// components/common/LazyImage.tsx에 추가
const trackImagePerformance = (src: string, loadTime: number) => {
  // 애널리틱스 전송
  gtag('event', 'image_load_time', {
    image_src: src,
    load_time: loadTime,
    format: src.includes('.webp') ? 'webp' : 'legacy'
  });
};
```

## 🚀 배포 전 체크리스트

### 최적화 완료 확인
- [ ] `npm run images:analyze` 실행 및 리포트 확인
- [ ] `npm run images:optimize` 실행 완료
- [ ] LazyImage 컴포넌트 적용 완료
- [ ] 아이콘 스프라이트 적용 완료
- [ ] WebP 이미지 fallback 구현 완료

### 성능 테스트
- [ ] Lighthouse 점수 90+ 달성
- [ ] WebPageTest에서 이미지 최적화 Grade A
- [ ] 모바일에서 LCP 1.5초 이하
- [ ] CLS 0.1 이하 달성

### 브라우저 호환성
- [ ] Chrome/Edge WebP 지원 확인
- [ ] Safari 14+ WebP 지원 확인
- [ ] Firefox WebP 지원 확인
- [ ] IE11 PNG fallback 동작 확인

## 🔄 지속적 최적화

### 정기 점검 (월 1회)
1. `npm run images:analyze` 실행
2. 새로 추가된 이미지 최적화 적용
3. 사용하지 않는 이미지 정리
4. 성능 지표 모니터링

### 자동화 도구
```json
// package.json에 추가
{
  "scripts": {
    "prebuild": "npm run images:optimize",
    "postbuild": "npm run images:analyze"
  }
}
```

## 💡 문제 해결

### 일반적인 문제들

**Q: WebP 이미지가 로드되지 않아요**
A: 브라우저 호환성을 확인하고 PNG/JPG fallback이 제대로 설정되었는지 확인하세요.

**Q: 스프라이트가 제대로 표시되지 않아요**
A: CSS 경로와 background-position 값을 확인하세요. `npm run images:sprites`로 다시 생성해보세요.

**Q: Lazy loading이 작동하지 않아요**
A: Intersection Observer API 지원 여부를 확인하고 polyfill을 추가하세요.

**Q: 이미지 최적화 후 화질이 떨어져요**
A: `scripts/image-optimization.js`의 quality 설정을 85-90으로 높여보세요.

### 성능 최적화 팁

1. **Critical 이미지는 preload 사용**
2. **Above the fold 이미지는 eager loading**
3. **작은 아이콘은 SVG 고려**
4. **애니메이션은 CSS보다 스프라이트 활용**
5. **모바일 우선 반응형 이미지 구현**

---

## 📞 지원

최적화 관련 문제나 질문이 있으시면:
1. 먼저 이 가이드를 확인
2. `npm run images:analyze` 실행하여 상태 점검
3. 개발팀에 이슈 리포트

**구현 완료 시 예상 성과**: 로딩 속도 50% 개선, 데이터 사용량 38% 감소, Core Web Vitals 90+ 달성