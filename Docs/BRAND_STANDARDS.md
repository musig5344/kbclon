# 🎨 KB 스타뱅킹 클론 - 브랜드 표준 가이드

> **KB 브랜드 아이덴티티 100% 준수를 위한 완전한 디자인 시스템**

## 🌟 KB 브랜드 핵심 원칙

### 브랜드 철학
> **"금융에서 생활까지, KB국민은행과 함께"**

1. **신뢰성** - 안정적이고 믿을 수 있는 금융 서비스
2. **혁신성** - 디지털 시대에 맞는 편리한 경험  
3. **친근성** - 고객에게 다가가는 따뜻한 서비스
4. **전문성** - 금융 전문가로서의 역량과 품격

## 🎨 색상 시스템 (완전 정확)

### 주요 브랜드 색상
```css
/* 메인 브랜드 컬러 */
--kb-yellow: #FFD338;           /* KB 대표 노란색 */
--kb-yellow-pressed: #FFBC00;   /* 버튼 눌림 상태 */
--kb-yellow-light: #FFCC00;     /* 배경 강조 */
--kb-black: #26282C;            /* KB 대표 검정색 */

/* 원본 colors.xml에서 추출한 정확한 색상 */
--primary-yellow: #FFD338;      /* common_yellow */
--primary-variant: #FFBC00;     /* sdk_ui_kbstar_primary_variant */
--surface-variant: #FFDB28;     /* color_main_background_click */
```

### 텍스트 색상 위계
```css
/* 텍스트 우선순위별 색상 */
--text-primary: #26282C;        /* RGB_26282c - 제목, 중요 텍스트 */
--text-secondary: #484B51;      /* RGB_484b51 - 일반 텍스트 */  
--text-tertiary: #696E76;       /* RGB_696e76 - 보조 텍스트 */
--text-hint: #C6CBD0;           /* RGB_c6cbd0 - 힌트, 플레이스홀더 */
--text-clickable: #222222;      /* color_main_text_click_02 */
--text-link: #287EFF;           /* text_guide_blue - 링크 텍스트 */
```

### 시스템 색상
```css
/* 상태 표시 색상 */
--error: #FF5858;               /* RGB_FF5858 - 오류, 경고 */
--success: #08FF02;             /* sdk_ui_kbstar_color_bright_green */
--warning: #FF9800;             /* 경고 상태 */
--info: #2196F3;                /* 정보 안내 */

/* 배경 및 구조 색상 */
--background: #FFFFFF;          /* 기본 배경 */
--surface: #F7F7F8;             /* RGB_f7f7f8 - 카드, 섹션 배경 */
--border: #EBEEF0;              /* RGB_ebeef0 - 테두리, 구분선 */
--divider: #DDE1E4;             /* button_divider - 진한 구분선 */
```

### 네비게이션 색상
```css
/* 탭 및 네비게이션 */
--tab-background: #3F4D60;      /* color_main_tab_bg */
--tab-pressed: #394759;         /* color_main_tab_bg_pressed */
--header-background: #EEEEEE;   /* color_main_header_bg */
```

### 다이얼로그 및 모달
```css
/* 모달 및 팝업 */
--dialog-background: rgba(0, 0, 0, 0.4);        /* bg_dialog */
--toast-background: rgba(38, 40, 44, 0.8);      /* toast_background */
--toast-text: #DDE1E4;                          /* toast_text */
```

## ✍️ 타이포그래피 시스템

### 폰트 패밀리
```css
/* KB 공식 폰트 (우선순위 1) */
font-family: 'KBFGText', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;

/* 폰트 웨이트 정의 */
--font-light: 300;    /* kbfg_text_l.otf */
--font-medium: 500;   /* kbfg_text_m.otf - 기본 */
--font-bold: 700;     /* kbfg_text_b.otf */
```

### 타이포그래피 스케일
```css
/* 폰트 크기 시스템 */
--font-size-xs: 12px;     /* 주석, 힌트, 작은 라벨 */
--font-size-sm: 14px;     /* 보조 텍스트, 캡션 */  
--font-size-md: 16px;     /* 본문 텍스트 (기본) */
--font-size-lg: 18px;     /* 중요 텍스트 */
--font-size-xl: 20px;     /* 섹션 제목 */
--font-size-2xl: 24px;    /* 페이지 제목 */
--font-size-3xl: 28px;    /* 큰 제목 */

/* 줄 간격 */
--line-height-tight: 1.2;   /* 제목용 */
--line-height-normal: 1.4;  /* 일반 텍스트 */
--line-height-relaxed: 1.6; /* 긴 텍스트 */
```

### 타이포그래피 적용 예시
```typescript
// 제목 (페이지 타이틀)
const PageTitle = styled.h1`
  font-family: 'KBFGText', sans-serif;
  font-weight: 700;
  font-size: 24px;
  line-height: 1.2;
  color: #26282C;
  letter-spacing: -0.02em;
`;

// 섹션 제목
const SectionTitle = styled.h2`
  font-family: 'KBFGText', sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 1.4;
  color: #26282C;
`;

// 본문 텍스트
const BodyText = styled.p`
  font-family: 'KBFGText', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.6;
  color: #26282C;
`;

// 보조 텍스트
const CaptionText = styled.span`
  font-family: 'KBFGText', sans-serif;
  font-weight: 300;
  font-size: 14px;
  line-height: 1.4;
  color: #696E76;
`;
```

## 🔲 공간 및 레이아웃 시스템

### 간격 시스템 (8pt 그리드 기반)
```css
/* 기본 간격 단위 */
--spacing-xs: 4px;      /* 최소 간격 */
--spacing-sm: 8px;      /* 작은 간격 */
--spacing-md: 16px;     /* 기본 간격 */
--spacing-lg: 24px;     /* 큰 간격 */  
--spacing-xl: 32px;     /* 섹션 간격 */
--spacing-2xl: 48px;    /* 페이지 간격 */
--spacing-3xl: 64px;    /* 특별한 간격 */
```

### 여백 적용 규칙
```css
/* 페이지 레이아웃 */
.page-container {
  padding: 0 16px;                    /* 좌우 기본 여백 */
  margin-bottom: 24px;                /* 하단 여백 */
}

/* 섹션 간격 */
.section {
  margin-bottom: 32px;                /* 섹션 간 간격 */
}

/* 컴포넌트 간격 */
.component {
  margin-bottom: 16px;                /* 컴포넌트 간 기본 간격 */
}

/* 요소 간격 */
.element {
  margin-bottom: 8px;                 /* 요소 간 최소 간격 */
}
```

### 모서리 반경 시스템
```css
/* 둥근 모서리 스케일 */
--border-radius-xs: 2px;     /* 입력 필드 */
--border-radius-sm: 4px;     /* 작은 버튼 */
--border-radius-md: 8px;     /* 기본 버튼, 카드 */
--border-radius-lg: 12px;    /* 큰 카드 */
--border-radius-xl: 16px;    /* 계좌 카드 */
--border-radius-2xl: 20px;   /* 바텀시트 */
--border-radius-full: 9999px; /* 원형 버튼 */
```

## 🔘 버튼 디자인 시스템

### 기본 버튼 (Primary)
```css
.btn-primary {
  background-color: #FFD338;          /* KB Yellow */
  color: #26282C;                     /* KB Black */
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-family: 'KBFGText', sans-serif;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: #FFBC00;          /* 호버 상태 */
}

.btn-primary:active {
  background-color: #FFBC00;          /* 눌림 상태 */
  transform: scale(0.95);             /* 터치 피드백 */
}

.btn-primary:disabled {
  background-color: #EBEEF0;          /* 비활성화 배경 */
  color: #C6CBD0;                     /* 비활성화 텍스트 */
  cursor: not-allowed;
}
```

### 보조 버튼 (Secondary)
```css
.btn-secondary {
  background-color: #FFFFFF;
  color: #26282C;
  border: 1px solid #EBEEF0;
  border-radius: 8px;
  padding: 12px 24px;
  font-family: 'KBFGText', sans-serif;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: #F7F7F8;
  border-color: #DDE1E4;
}

.btn-secondary:active {
  transform: scale(0.95);
}
```

### 텍스트 버튼 (Text)
```css
.btn-text {
  background-color: transparent;
  color: #287EFF;                     /* 링크 색상 */
  border: none;
  padding: 8px 16px;
  font-family: 'KBFGText', sans-serif;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  text-decoration: underline;
  transition: all 0.2s ease;
}

.btn-text:hover {
  color: #1E60CC;
  background-color: rgba(40, 126, 255, 0.1);
}
```

## 📱 입력 필드 디자인

### 기본 입력 필드
```css
.input-field {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #EBEEF0;
  border-radius: 4px;
  background-color: #FFFFFF;
  font-family: 'KBFGText', sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: #26282C;
  transition: all 0.2s ease;
}

.input-field::placeholder {
  color: #C6CBD0;
  font-weight: 300;
}

.input-field:focus {
  outline: none;
  border-color: #FFD338;             /* KB Yellow 포커스 */
  box-shadow: 0 0 0 3px rgba(255, 211, 56, 0.1);
}

.input-field.error {
  border-color: #FF5858;             /* 오류 상태 */
  box-shadow: 0 0 0 3px rgba(255, 88, 88, 0.1);
}

.input-field:disabled {
  background-color: #F7F7F8;
  color: #C6CBD0;
  cursor: not-allowed;
}
```

## 💳 카드 컴포넌트 디자인

### 기본 카드
```css
.card {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #EBEEF0;
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
```

### 계좌 카드 (특별 디자인)
```css
.account-card {
  background: linear-gradient(135deg, #FFD338 0%, #FFBC00 100%);
  color: #26282C;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(255, 211, 56, 0.3);
  position: relative;
  overflow: hidden;
}

.account-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
}
```

## 🎭 아이콘 사용 가이드

### 아이콘 크기 시스템
```css
/* 아이콘 크기 표준 */
--icon-xs: 16px;     /* 인라인 아이콘 */
--icon-sm: 20px;     /* 버튼 아이콘 */
--icon-md: 24px;     /* 기본 아이콘 */
--icon-lg: 32px;     /* 메뉴 아이콘 */
--icon-xl: 48px;     /* 주요 아이콘 */
--icon-2xl: 64px;    /* 로고, 일러스트 */
```

### KB 원본 아이콘 매핑
```typescript
// 정확한 KB 원본 아이콘 사용
const kbIcons = {
  // 로그인 관련
  loginId: 'icon_login.png',
  loginCert: 'icon_login_certificate.png',
  loginCloud: 'icon_login_cloud.png',
  loginFinger: 'icon_login_finger.png',
  
  // 메뉴 아이콘
  account: 'icon_bankbook.png',
  transfer: 'icon_transfer_bankbook.png',
  card: 'icon_card.png',
  products: 'icon_widget_product.png',
  search: 'icon_widget_search.png',
  
  // 네비게이션
  back: 'btn_navi_back_n.png',
  home: 'btn_navi_home_n.png',
  menu: 'btn_navi_menu_n.png',
  
  // UI 요소
  close: 'icon_close.png',
  check: 'icon_check_20.png',
  arrow: 'icon_arrow_right_white.png',
} as const;
```

### 아이콘 컴포넌트 구현
```typescript
interface IconProps {
  name: keyof typeof kbIcons;
  size?: number;
  color?: string;
  alt?: string;
}

const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color, 
  alt 
}) => {
  const src = `/assets/images/icons/${kbIcons[name]}`;
  
  return (
    <img
      src={src}
      alt={alt || name}
      width={size}
      height={size}
      style={{ 
        filter: color ? `brightness(0) saturate(100%) ${color}` : undefined 
      }}
    />
  );
};
```

## 📐 그리드 및 레이아웃

### 모바일 우선 그리드
```css
/* 기본 컨테이너 */
.container {
  max-width: 428px;                  /* iPhone 14 Pro Max 기준 */
  margin: 0 auto;
  padding: 0 16px;
}

/* 데스크톱에서 모바일 모방 */
@media (min-width: 768px) {
  .container {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    overflow: hidden;
    background: #FFFFFF;
  }
}

/* 그리드 시스템 */
.grid {
  display: grid;
  gap: 16px;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}
```

## 🎬 애니메이션 가이드

### 전환 애니메이션
```css
/* 기본 전환 */
.transition-default {
  transition: all 0.2s ease;
}

/* 페이지 전환 */
.page-enter {
  opacity: 0;
  transform: translateX(100%);
}

.page-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* 바텀시트 애니메이션 */
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.bottom-sheet {
  animation: slideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* 터치 피드백 */
.touchable:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}
```

## 📊 브랜드 품질 체크리스트

### 색상 준수 확인
- [ ] KB Yellow (#FFD338) 정확 사용
- [ ] KB Black (#26282C) 정확 사용
- [ ] 텍스트 위계 색상 올바른 적용
- [ ] 상태별 색상 정확한 매핑
- [ ] 임의 색상 사용 금지

### 타이포그래피 준수 확인
- [ ] KBFGText 폰트 우선 사용
- [ ] 폰트 웨이트 정확한 적용
- [ ] 폰트 크기 시스템 준수
- [ ] 줄 간격 표준 적용

### 레이아웃 준수 확인
- [ ] 8pt 그리드 시스템 준수
- [ ] 여백 표준 적용
- [ ] 모서리 반경 시스템 사용
- [ ] 컴포넌트 간격 표준 준수

### 인터랙션 준수 확인
- [ ] 터치 영역 최소 44px 보장
- [ ] 터치 피드백 구현
- [ ] 애니메이션 자연스러움
- [ ] 로딩 상태 표시

이 브랜드 표준 가이드를 철저히 준수하여 KB 스타뱅킹과 
구분할 수 없는 완벽한 브랜드 경험을 제공할 수 있습니다.