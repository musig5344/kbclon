# KB스타뱅킹 이미지 최적화 가이드

> 생성일: 2025. 8. 14. 오전 6:33:55

## 최적화 결과 요약

- WebP 변환: 2개 파일
- PNG 최적화: 74개 파일
- 반응형 이미지: 8개 생성

## 사용법

### 1. WebP 이미지 사용

```tsx
// Picture 엘리먼트로 WebP 우선 사용
<picture>
  <source
    srcSet='/assets/images/optimized/splash_background.webp'
    type='image/webp'
  />
  <img src='/assets/images/splash_background.png' alt='배경 이미지' />
</picture>
```

### 2. 반응형 이미지 사용

```tsx
<picture>
  <source
    media='(max-width: 480px)'
    srcSet='/assets/images/optimized/hero-small.webp'
    type='image/webp'
  />
  <source
    media='(max-width: 768px)'
    srcSet='/assets/images/optimized/hero-medium.webp'
    type='image/webp'
  />
  <img src='/assets/images/optimized/hero-large.webp' alt='히어로 이미지' />
</picture>
```

### 3. 아이콘 스프라이트 사용

```css
/* sprites/icons-sprite.css 임포트 */
.my-icon {
  @extend .icon-sprite;
  @extend .icon-home;
}
```

## 성능 개선 권장사항

1. **Lazy Loading**: Intersection Observer API 사용
2. **이미지 사전 로딩**: 중요한 이미지는 preload
3. **CDN 활용**: 이미지를 CDN으로 서빙
4. **압축**: Gzip/Brotli 압축 활성화
