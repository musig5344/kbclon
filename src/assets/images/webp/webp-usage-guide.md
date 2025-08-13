# WebP 이미지 사용 가이드

> 생성일: 2025. 8. 14. 오전 3:58:55
> 변환된 파일: 34개
> 절약된 용량: 69.7 KB

## 🚀 LazyImage 컴포넌트 사용법

### 기본 사용법
```tsx
import LazyImage from '@/components/common/LazyImage';

<LazyImage
  src="/assets/images/hero.png"
  webpSrc="/assets/images/webp/hero.webp"
  alt="히어로 이미지"
  loading="lazy"
/>
```

### Picture 엘리먼트 직접 사용
```tsx
<picture>
  <source srcSet="/assets/images/webp/hero.webp" type="image/webp" />
  <img src="/assets/images/hero.png" alt="히어로 이미지" />
</picture>
```

### 반응형 이미지 사용
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
  <source srcSet="/assets/images/webp/hero.webp" type="image/webp" />
  <img src="/assets/images/hero.png" alt="히어로 이미지" />
</picture>
```

## 📁 변환된 파일 목록

- **splash_background.png**
  - WebP: `src\assets\images\webp\splash_background.webp`
  - 절약: 74.45 KB (압축률 50.1%)
  - 반응형:
    - small (480px): `src\assets\images\webp\splash_background-small.webp`
    - medium (768px): `src\assets\images\webp\splash_background-medium.webp`
    - large (1200px): `src\assets\images\webp\splash_background-large.webp`

- **icons\login_finance_cert_icon.png**
  - WebP: `src\assets\images\webp\icons\login_finance_cert_icon.webp`
  - 절약: 52.45 KB (압축률 14.8%)

- **logo_kb_kookmin.png**
  - WebP: `src\assets\images\webp\logo_kb_kookmin.webp`
  - 절약: 1.33 KB (압축률 67.1%)

- **icons\icon_list_more.png**
  - WebP: `src\assets\images\webp\icons\icon_list_more.webp`
  - 절약: 475 Bytes (압축률 77.9%)

- **ic_fingerprint.png**
  - WebP: `src\assets\images\webp\ic_fingerprint.webp`
  - 절약: 440 Bytes (압축률 90.7%)

- **icons\icon_fingerprint_line.png**
  - WebP: `src\assets\images\webp\icons\icon_fingerprint_line.webp`
  - 절약: 440 Bytes (압축률 90.7%)

- **menu\icon_insurance.png**
  - WebP: `src\assets\images\webp\menu\icon_insurance.webp`
  - 절약: 430 Bytes (압축률 71.5%)

- **icons\login_id_icon.png**
  - WebP: `src\assets\images\webp\icons\login_id_icon.webp`
  - 절약: 306 Bytes (압축률 90.1%)

- **menu\icon_pension.png**
  - WebP: `src\assets\images\webp\menu\icon_pension.webp`
  - 절약: 214 Bytes (압축률 86.6%)

- **menu\icon_account.png**
  - WebP: `src\assets\images\webp\menu\icon_account.webp`
  - 절약: 49 Bytes (압축률 97.8%)

- **menu\icon_stock.png**
  - WebP: `src\assets\images\webp\menu\icon_stock.webp`
  - 절약: NaN undefined (압축률 115.2%)

- **menu\icon_product.png**
  - WebP: `src\assets\images\webp\menu\icon_product.webp`
  - 절약: NaN undefined (압축률 137.6%)

- **icons\icon_products.png**
  - WebP: `src\assets\images\webp\icons\icon_products.webp`
  - 절약: NaN undefined (압축률 137.6%)

- **icons\icon_tab_assets.png**
  - WebP: `src\assets\images\webp\icons\icon_tab_assets.webp`
  - 절약: NaN undefined (압축률 140.4%)

- **icons\icon_assets.png**
  - WebP: `src\assets\images\webp\icons\icon_assets.webp`
  - 절약: NaN undefined (압축률 140.4%)

- **menu\icon_card.png**
  - WebP: `src\assets\images\webp\menu\icon_card.webp`
  - 절약: NaN undefined (압축률 135.1%)

- **menu\icon_transfer.png**
  - WebP: `src\assets\images\webp\menu\icon_transfer.webp`
  - 절약: NaN undefined (압축률 144.3%)

- **icons\login_cert_icon.png**
  - WebP: `src\assets\images\webp\icons\login_cert_icon.webp`
  - 절약: NaN undefined (압축률 212.1%)

- **icons\login_fingerprint_icon.png**
  - WebP: `src\assets\images\webp\icons\login_fingerprint_icon.webp`
  - 절약: NaN undefined (압축률 156.2%)

- **kb_logo.png**
  - WebP: `src\assets\images\webp\kb_logo.webp`
  - 절약: NaN undefined (압축률 194.4%)

- **loading\loading_2_04.png**
  - WebP: `src\assets\images\webp\loading\loading_2_04.webp`
  - 절약: NaN undefined (압축률 164.1%)

- **loading\loading_2_01.png**
  - WebP: `src\assets\images\webp\loading\loading_2_01.webp`
  - 절약: NaN undefined (압축률 165.1%)

- **loading\loading_2_09.png**
  - WebP: `src\assets\images\webp\loading\loading_2_09.webp`
  - 절약: NaN undefined (압축률 166.1%)

- **loading\loading_2_10.png**
  - WebP: `src\assets\images\webp\loading\loading_2_10.webp`
  - 절약: NaN undefined (압축률 168.1%)

- **loading\loading_2_03.png**
  - WebP: `src\assets\images\webp\loading\loading_2_03.webp`
  - 절약: NaN undefined (압축률 169.6%)

- **loading\loading_2_16.png**
  - WebP: `src\assets\images\webp\loading\loading_2_16.webp`
  - 절약: NaN undefined (압축률 171.1%)

- **loading\loading_2_06.png**
  - WebP: `src\assets\images\webp\loading\loading_2_06.webp`
  - 절약: NaN undefined (압축률 171.1%)

- **loading\loading_2_11.png**
  - WebP: `src\assets\images\webp\loading\loading_2_11.webp`
  - 절약: NaN undefined (압축률 172.9%)

- **kb_logo_temp.png**
  - WebP: `src\assets\images\webp\kb_logo_temp.webp`
  - 절약: NaN undefined (압축률 186.3%)

- **loading\loading_2_07.png**
  - WebP: `src\assets\images\webp\loading\loading_2_07.webp`
  - 절약: NaN undefined (압축률 172.6%)

- **loading\loading_2_05.png**
  - WebP: `src\assets\images\webp\loading\loading_2_05.webp`
  - 절약: NaN undefined (압축률 175.0%)

- **loading\loading_2_02.png**
  - WebP: `src\assets\images\webp\loading\loading_2_02.webp`
  - 절약: NaN undefined (압축률 174.4%)

- **loading\loading_2_08.png**
  - WebP: `src\assets\images\webp\loading\loading_2_08.webp`
  - 절약: NaN undefined (압축률 177.9%)

- **icons\login_look_icon.png**
  - WebP: `src\assets\images\webp\icons\login_look_icon.webp`
  - 절약: NaN undefined (압축률 173.1%)

