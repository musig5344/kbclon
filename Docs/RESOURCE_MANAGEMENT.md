# 📦 KB 스타뱅킹 클론 - 리소스 관리 가이드

> **825개 원본 리소스 효율적 활용을 위한 상세 가이드**

## 📊 리소스 현황 개요

### 전체 보유 리소스
- **imageorigin1/**: 503개 PNG 파일
- **imageorigin2/**: 322개 PNG 파일  
- **총 리소스**: 825개 파일
- **현재 활용률**: 약 12% (100개 내외)

### 카테고리별 분류

#### 🎯 핵심 활용 리소스 (100개)
```
KB 브랜드 관련 (10개):
├── kb_logo.png                    # KB 메인 로고
├── kb_logo2.png                   # KB 서브 로고  
├── bibi_l.png, bibi_s.png         # KB 곰돌이 마스코트
├── splash_img.png                 # 스플래시 배경
└── loading_1_01~17.png            # 17프레임 로딩 애니메이션

로그인/인증 관련 (15개):
├── icon_login.png                 # 아이디 로그인
├── icon_login_certificate.png     # 공동인증서
├── icon_login_cloud.png           # 금융인증서
├── icon_login_finger.png          # 지문 인증
├── icon_login_add.png             # 로그인 추가 옵션
└── icon_one_login.png             # 원클릭 로그인

메뉴/네비게이션 (30개):
├── icon_widget_*.png              # 위젯 아이콘들
├── icon_menu_01~05.png            # 메인 메뉴 아이콘
├── icon_transfer_*.png            # 이체 관련
├── icon_bankbook.png              # 통장/계좌
├── icon_shortcut_*.png            # 바로가기 아이콘
└── btn_navi_*.png                 # 네비게이션 버튼

UI 컴포넌트 (45개):
├── btn_*.png                      # 각종 버튼 이미지
├── icon_arrow_*.png               # 화살표 아이콘
├── icon_close*.png                # 닫기 버튼
├── icon_check*.png                # 체크박스/체크 아이콘
└── background/border 관련 이미지
```

#### ⚠️ 미활용 리소스 (725개)
```
보안키패드 (200개):
├── nf_*.png                       # 보안키패드 관련
├── nf_btn_*.png                   # 키패드 버튼
├── nf_serial_*.png                # 시리얼 넘버 키패드
└── 한글/영문/숫자 키보드 이미지들

Android 시스템 (100개):
├── abc_*.png                      # Android 기본 UI
├── common_google_*.png            # Google 관련
├── com_facebook_*.png             # Facebook SDK
└── notification_*.png             # 알림 시스템

중복/불필요 (400개):
├── 동일 기능의 다른 해상도 이미지
├── 사용하지 않는 기능의 아이콘
├── 테스트/개발용 임시 이미지
└── 기타 시스템 파일들

기타 기능 (25개):
├── 카메라/갤러리 관련
├── 지도/위치 관련  
├── QR코드/바코드 관련
└── 특수 기능 아이콘들
```

## 🔍 리소스 매핑 가이드

### 현재 정확히 매핑된 리소스
```typescript
// 현재 프로젝트에서 사용 중인 정확한 매핑
const iconMappings = {
  // 로그인 관련
  loginId: 'icon_login.png',
  loginCert: 'icon_login_certificate.png', 
  loginCloud: 'icon_login_cloud.png',
  loginFinger: 'icon_login_finger.png',
  
  // 네비게이션
  navBack: 'btn_navi_back_n.png',
  navHome: 'btn_navi_home_n.png', 
  navMenu: 'btn_navi_menu_n.png',
  
  // 메인 메뉴
  menuAccount: 'icon_bankbook.png',
  menuTransfer: 'icon_transfer_bankbook.png',
  menuCard: 'icon_card.png',
  menuProducts: 'icon_widget_product.png',
  
  // 브랜드
  kbLogo: 'kb_logo.png',
  kbBibi: 'bibi_s.png',
  splashBg: 'splash_img.png',
} as const;
```

### 개선이 필요한 리소스 교체 목록
```bash
# 현재 임시로 사용 중인 아이콘 → 원본 KB 아이콘 교체 필요

# 1. 지문 로그인 아이콘 
# 현재: 사람 실루엣 → 변경: icon_login_finger.png (실제 지문 패턴)
cp imageorigin1/icon_login_finger.png src/assets/images/icons/

# 2. 금융인증서 아이콘
# 현재: KB 텍스트 → 변경: icon_login_cloud.png (클라우드 인증서)  
cp imageorigin1/icon_login_cloud.png src/assets/images/icons/

# 3. 메뉴 아이콘들
# 현재: 빈 이미지들 → 변경: 원본 KB 메뉴 아이콘들
cp imageorigin1/icon_widget_*.png src/assets/images/menu/

# 4. 로딩 애니메이션 프레임들
# 현재: CSS 스피너 → 변경: 17프레임 원본 애니메이션
mkdir -p src/assets/images/loading/
for i in {01..17}; do
  cp imageorigin1/loading_1_$i.png src/assets/images/loading/
done
```

## 📁 리소스 디렉토리 구조

### 현재 구조
```
src/assets/images/
├── icons/                         # 아이콘 파일들
│   ├── login_*.png               # 로그인 관련 아이콘
│   ├── menu_*.png                # 메뉴 아이콘
│   └── ui_*.png                  # UI 컴포넌트 아이콘
├── backgrounds/                   # 배경 이미지
├── logos/                        # KB 로고 및 브랜드 이미지
└── loading/                      # 로딩 애니메이션 프레임
```

### 최적화된 구조 (권장)
```
src/assets/images/
├── brand/                        # KB 브랜드 관련
│   ├── logos/                   # KB 로고 (kb_logo.png 등)
│   ├── mascot/                  # 곰돌이 (bibi_*.png)
│   └── splash/                  # 스플래시 (splash_img.png)
├── auth/                         # 인증 관련
│   ├── login/                   # 로그인 (icon_login_*.png)
│   ├── biometric/               # 생체인증
│   └── certificate/             # 인증서
├── navigation/                   # 네비게이션
│   ├── tabs/                    # 탭바 아이콘
│   ├── menu/                    # 메뉴 아이콘  
│   └── buttons/                 # 네비게이션 버튼
├── ui/                          # UI 컴포넌트
│   ├── buttons/                 # 버튼 관련
│   ├── inputs/                  # 입력 필드 관련
│   ├── icons/                   # 일반 아이콘
│   └── decorations/             # 장식 요소
└── animations/                   # 애니메이션 프레임
    ├── loading/                 # 로딩 (loading_1_*.png)
    └── transitions/             # 전환 효과
```

## 🛠️ 리소스 활용 최적화

### 이미지 최적화 작업
```bash
# 1. 중복 이미지 제거 스크립트
#!/bin/bash
# find_duplicates.sh
find imageorigin1/ imageorigin2/ -name "*.png" -exec md5sum {} \; | 
sort | uniq -d -w32 | cut -c35-

# 2. 파일 크기별 정렬 (큰 파일 우선 최적화)
find . -name "*.png" -exec ls -la {} \; | sort -k5 -n -r

# 3. WebP 변환 (지원 브라우저용)
for file in *.png; do
  cwebp "$file" -o "${file%.png}.webp"
done
```

### 동적 이미지 로딩
```typescript
// src/utils/imageLoader.ts
interface ImageMap {
  [key: string]: string;
}

// 이미지 경로 매핑
const imageMap: ImageMap = {
  'kb-logo': '/assets/images/brand/logos/kb_logo.png',
  'login-id': '/assets/images/auth/login/icon_login.png',
  'login-cert': '/assets/images/auth/login/icon_login_certificate.png',
  // ... 기타 매핑
};

export const getImagePath = (key: string): string => {
  return imageMap[key] || '/assets/images/fallback.png';
};

// 이미지 프리로딩
export const preloadImages = (keys: string[]): Promise<void[]> => {
  return Promise.all(
    keys.map(key => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // 에러 시에도 resolve
        img.src = getImagePath(key);
      });
    })
  );
};
```

### 지연 로딩 구현
```typescript
// src/components/common/OptimizedImage.tsx
import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isInView ? src : undefined}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onLoad={() => setIsLoaded(true)}
      style={{
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease',
        backgroundColor: isLoaded ? 'transparent' : '#f0f0f0'
      }}
    />
  );
};
```

## 📋 리소스 작업 체크리스트

### 즉시 실행 가능한 개선 작업

#### ✅ 우선순위 1: 핵심 아이콘 교체 (5분)
- [ ] 지문 로그인: `icon_login_finger.png` 복사
- [ ] 금융인증서: `icon_login_cloud.png` 복사  
- [ ] 메뉴 아이콘들: `icon_widget_*` 시리즈 복사
- [ ] 네비게이션: `btn_navi_*` 시리즈 복사

#### ✅ 우선순위 2: 로딩 애니메이션 (2분)  
- [ ] 17프레임 이미지 복사: `loading_1_01~17.png`
- [ ] 애니메이션 컴포넌트 업데이트
- [ ] 스플래시 화면에 적용

#### ✅ 우선순위 3: 브랜드 이미지 정리 (3분)
- [ ] KB 로고 최신 버전 확인
- [ ] 곰돌이 이미지 고해상도 버전 적용
- [ ] 스플래시 배경 이미지 최적화

### 향후 개선 작업

#### 🔄 리소스 정리 및 최적화
- [ ] 중복 이미지 식별 및 제거
- [ ] 사용하지 않는 파일 정리  
- [ ] 파일 크기 최적화 (WebP 변환)
- [ ] 디렉토리 구조 재정리

#### 📱 성능 최적화
- [ ] 이미지 지연 로딩 구현
- [ ] 이미지 프리로딩 전략 수립
- [ ] 캐싱 정책 설정
- [ ] 반응형 이미지 세트 구성

## 🎯 리소스 품질 기준

### KB 브랜드 정합성
- ✅ **색상 일치**: 원본 KB 브랜드 컬러 정확히 매칭
- ✅ **해상도**: 고해상도 디스플레이 지원 (2x, 3x)
- ✅ **일관성**: 동일한 스타일과 디자인 언어 유지

### 기술적 품질
- ✅ **파일 크기**: 웹 환경에 최적화된 크기 (< 100KB 권장)
- ✅ **형식**: PNG (투명도 필요) / WebP (성능 최적화)  
- ✅ **압축**: 품질 손실 없는 최적화 적용

### 사용자 경험
- ✅ **로딩 속도**: 3초 이내 첫 화면 렌더링
- ✅ **반응성**: 터치 피드백 즉시 제공
- ✅ **접근성**: 대체 텍스트 및 고대비 지원

이 가이드를 통해 825개의 풍부한 리소스를 효율적으로 활용하여 
KB 스타뱅킹과 완전히 동일한 시각적 경험을 제공할 수 있습니다.