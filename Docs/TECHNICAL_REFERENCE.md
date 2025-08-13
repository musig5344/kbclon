# 🔧 KB 스타뱅킹 클론 - 기술 참조 문서

> **깊이 있는 개발 작업을 위한 기술 세부사항**

## 🏗️ 아키텍처 개요

### 프론트엔드 구조
```
src/
├── components/           # 재사용 가능한 UI 컴포넌트
│   ├── common/          # Button, Input, Loading, Typography
│   ├── layout/          # Header, TabBar, BottomSheet
│   ├── transfer/        # 이체 관련 컴포넌트 (새로 추가)
│   │   ├── AmountBottomSheet.tsx      # 금액 입력 모달
│   │   ├── TransferConfirmDialog.tsx  # 이체 확인 다이얼로그
│   │   └── TransferSuccessDialog.tsx  # 이체 완료 다이얼로그
│   └── screens/         # 화면별 특화 컴포넌트
│       ├── login/       # 로그인 관련 컴포넌트
│       ├── dashboard/   # 대시보드 관련 컴포넌트
│       └── account/     # 계좌 관련 컴포넌트
├── pages/               # 페이지 컴포넌트 (라우팅 단위)
├── stores/              # Zustand 상태 관리
├── services/            # 외부 서비스 연동 (Supabase)
├── styles/              # 디자인 시스템 및 테마
├── utils/               # 공통 유틸리티 함수
└── assets/              # 정적 리소스
```

## 🛠️ 핵심 기술 스택 세부사항

### React 18 구현
```typescript
// 주요 Hook 사용 패턴
import { useState, useEffect, useCallback, useMemo } from 'react';

// 성능 최적화
import { memo, lazy, Suspense } from 'react';

// 지연 로딩 예시
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
```

### TypeScript 설정
```json
// tsconfig.json 핵심 설정
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

### Styled Components 패턴
```typescript
// 테마 기반 스타일링
import styled, { css } from 'styled-components';

const StyledButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  
  ${({ variant, theme }) => variant === 'primary' && css`
    background-color: ${theme.colors.kbYellow};
    color: ${theme.colors.kbBlack};
  `}
  
  // 터치 피드백
  &:active {
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }
`;
```

## 🎨 디자인 시스템 구현

### 색상 시스템
```typescript
// src/styles/colors.ts
export const colors = {
  // KB 브랜드 색상 (정확한 원본)
  kbYellow: '#FFD338',
  kbYellowPressed: '#FFBC00', 
  kbBlack: '#26282C',
  
  // 텍스트 위계
  textPrimary: '#26282C',
  textSecondary: '#484B51', 
  textTertiary: '#696E76',
  textHint: '#C6CBD0',
  
  // 시스템 색상
  error: '#FF5858',
  success: '#08FF02',
  background: '#FFFFFF',
  border: '#EBEEF0',
  
  // 인터랙션 상태
  backgroundPressed: '#FFDB28',
  dialogBackground: '#66000000', // 40% 투명도
  toastBackground: '#CC26282C',  // 80% 투명도
} as const;

export type ColorKey = keyof typeof colors;
```

### 타이포그래피 시스템
```typescript
// src/styles/typography.ts
export const typography = {
  fontFamily: {
    primary: "'KBFGText', 'Noto Sans KR', sans-serif",
  },
  fontSize: {
    xs: '12px',    // 주석, 힌트
    sm: '14px',    // 보조 텍스트  
    md: '16px',    // 일반 텍스트
    lg: '20px',    // 섹션 제목
    xl: '24px',    // 페이지 제목
  },
  fontWeight: {
    light: 300,    // kbfg_text_l.otf
    medium: 500,   // kbfg_text_m.otf  
    bold: 700,     // kbfg_text_b.otf
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4, 
    relaxed: 1.6,
  },
} as const;
```

### 공간 시스템
```typescript
// src/styles/spacing.ts
export const spacing = {
  xs: '4px',
  sm: '8px', 
  md: '16px',   // 기본 페이지 여백
  lg: '24px',   // 섹션 간격
  xl: '32px',
  xxl: '48px',
} as const;

export const borderRadius = {
  sm: '4px',    // 입력 필드
  md: '8px',    // 기본 버튼
  lg: '12px',   // 카드
  xl: '16px',   // 계좌 카드
  full: '9999px', // 원형
} as const;
```

## 🔌 Supabase 백엔드 연동

### 클라이언트 설정
```typescript
// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 타입 안전한 인증 서비스
export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },
  
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },
  
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },
};
```

### 상태 관리 (Zustand)
```typescript
// src/stores/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

## 🎬 애니메이션 구현

### KB 로딩 애니메이션 (17프레임)
```typescript
// src/components/common/KBLoadingAnimation.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const frames = Array.from({ length: 17 }, (_, i) => 
  `/assets/images/loading/loading_1_${String(i + 1).padStart(2, '0')}.png`
);

const AnimationContainer = styled.div`
  width: 64px;
  height: 64px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

export const KBLoadingAnimation: React.FC = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 58.8); // 17프레임 / 1초 = 58.8ms per frame
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <AnimationContainer
      style={{ backgroundImage: `url(${frames[currentFrame]})` }}
    />
  );
};
```

### 바텀시트 애니메이션
```typescript
// src/components/layout/BottomSheet.tsx
import styled, { keyframes } from 'styled-components';

const slideUp = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
`;

const slideDown = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
`;

const BottomSheetContainer = styled.div<{ isVisible: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  animation: ${({ isVisible }) => isVisible ? slideUp : slideDown} 
             0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
`;
```

## 📱 반응형 및 PWA 구현

### 모바일 우선 반응형
```typescript
// src/styles/breakpoints.ts
export const breakpoints = {
  mobile: '428px',    // iPhone 14 Pro Max 기준
  tablet: '768px',
  desktop: '1024px',
} as const;

export const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  tablet: `@media (min-width: ${breakpoints.tablet})`,
  desktop: `@media (min-width: ${breakpoints.desktop})`,
} as const;

// 사용 예시
const ResponsiveContainer = styled.div`
  max-width: ${breakpoints.mobile};
  margin: 0 auto;
  
  ${mediaQueries.desktop} {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    overflow: hidden;
  }
`;
```

### PWA 매니페스트
```json
// public/manifest.json
{
  "short_name": "KB스타뱅킹",
  "name": "KB스타뱅킹 클론", 
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#FFD338",
  "background_color": "#FFFFFF",
  "orientation": "portrait"
}
```

## 🔍 성능 최적화

### 코드 스플리팅
```typescript
// 페이지 레벨 지연 로딩
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));

// 라우터에서 Suspense 적용
<Suspense fallback={<KBLoadingAnimation />}>
  <Routes>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/account" element={<AccountPage />} />
  </Routes>
</Suspense>
```

### 이미지 최적화
```typescript
// 지연 로딩 이미지 컴포넌트
import { useState, useRef, useEffect } from 'react';

export const LazyImage: React.FC<{ src: string; alt: string }> = ({ 
  src, 
  alt 
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
      onLoad={() => setIsLoaded(true)}
      style={{ 
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
    />
  );
};
```

## 🧪 테스트 설정

### Jest + Testing Library
```typescript
// src/utils/test-utils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter } from 'react-router-dom';
import { theme } from '../styles/theme';

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

---

## 🎯 최신 기술 구현 세부사항 (2025-01-22)

### 이체 시스템 아키텍처

#### 1. AmountBottomSheet 구현
```typescript
// 한글 금액 변환 알고리즘
const numberToKorean = (num: number): string => {
  const units = ['', '십', '백', '천'];
  const bigUnits = ['', '만', '억', '조'];
  const numbers = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  
  // 4자리씩 분할하여 처리
  const sections = [];
  let tempNum = num;
  
  while (tempNum > 0) {
    sections.unshift(tempNum % 10000);
    tempNum = Math.floor(tempNum / 10000);
  }
  
  // 각 섹션을 한글로 변환 후 큰 단위 추가
  let result = '';
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (section > 0) {
      result += convertSection(section) + bigUnits[sections.length - i - 1];
    }
  }
  
  return result + '원';
};
```

#### 2. 애니메이션 타이밍 최적화
```typescript
// styled-components 키프레임 애니메이션
const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const checkAnimation = keyframes`
  from { 
    transform: scale(0);
    opacity: 0;
  }
  to { 
    transform: scale(1);
    opacity: 1;
  }
`;

// 지연 애니메이션 적용
const CheckIconContainer = styled.div`
  animation: ${checkAnimation} 0.4s ease-out 0.2s both;
`;
```

#### 3. 상태 관리 플로우
```typescript
// 이체 플로우 상태 관리
const TransferPage: React.FC = () => {
  const [showAmountSheet, setShowAmountSheet] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  // 순차적 플로우 제어
  const handleAmountConfirm = (amount: number) => {
    setAmount(amount.toString());
    setShowAmountSheet(false);
  };
  
  const handleTransferConfirm = () => {
    setShowConfirmDialog(true);
  };
  
  const handleFinalConfirm = () => {
    setShowConfirmDialog(false);
    setShowSuccessDialog(true);
  };
};
```

### 모바일 최적화 기술

#### 1. Safe Area 지원
```css
/* global.css */
:root {
  --safe-area-inset-top: env(safe-area-inset-top);
  --safe-area-inset-right: env(safe-area-inset-right);
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  --safe-area-inset-left: env(safe-area-inset-left);
}

/* iOS Safari 100vh 문제 해결 */
.full-height {
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
}
```

#### 2. 터치 피드백 최적화
```typescript
// 모바일 터치 피드백
const TouchableButton = styled.button`
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  
  &:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
  
  @media (hover: hover) {
    &:hover {
      transform: scale(1.02);
    }
  }
`;
```

### XML → React 변환 패턴

#### 원본 XML 구조 분석
```xml
<!-- fragment_amount_bottom_sheet.xml -->
<LinearLayout>
  <LinearLayout android:id="@id/title_layout">
    <TextView android:text="이체 금액" />
    <ImageButton android:id="@id/close_button" />
  </LinearLayout>
  
  <LinearLayout android:id="@id/input_layout">
    <EditText android:hint="0" />
    <TextView android:text="원" />
  </LinearLayout>
  
  <GridLayout android:columnCount="3">
    <!-- 키패드 버튼들 -->
  </GridLayout>
</LinearLayout>
```

#### React 컴포넌트 변환
```typescript
// AmountBottomSheet.tsx
const AmountBottomSheet: React.FC = () => {
  return (
    <ContentLayout>
      <TitleLayout>
        <Title>이체 금액</Title>
        <CloseButton onClick={onClose}>×</CloseButton>
      </TitleLayout>
      
      <InputTextLayout>
        <InputText value={formatAmount(amount)} readOnly />
        <InputTextWon>원</InputTextWon>
      </InputTextLayout>
      
      <KeypadContainer>
        {/* 3x4 키패드 그리드 */}
        <KeypadRow>
          <KeypadButton onClick={() => handleNumberClick('1')}>1</KeypadButton>
          <KeypadButton onClick={() => handleNumberClick('2')}>2</KeypadButton>
          <KeypadButton onClick={() => handleNumberClick('3')}>3</KeypadButton>
        </KeypadRow>
        {/* ... 추가 키패드 행들 */}
      </KeypadContainer>
    </ContentLayout>
  );
};
```

### 성능 최적화 기법

#### 1. 컴포넌트 메모이제이션
```typescript
// React.memo를 활용한 불필요한 리렌더링 방지
const AmountBottomSheet = React.memo<AmountBottomSheetProps>(({
  isVisible,
  onClose,
  onConfirm
}) => {
  // 메모이제이션된 계산값
  const koreanAmount = useMemo(() => {
    return numberToKorean(parseInt(amount) || 0);
  }, [amount]);
  
  // 메모이제이션된 콜백
  const handleNumberClick = useCallback((num: string) => {
    setAmount(prev => prev + num);
  }, []);
  
  if (!isVisible) return null;
  
  return <BottomSheetContent />;
});
```

#### 2. 가상 키보드 대응
```typescript
// 모바일 가상 키보드 대응
useEffect(() => {
  const handleResize = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  window.addEventListener('resize', handleResize);
  handleResize();
  
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

## 🔧 개발 도구 설정

### ESLint + Prettier
```json
// .eslintrc.json
{
  "extends": [
    "react-app",
    "react-app/jest",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}

// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

이 기술 참조 문서는 KB 스타뱅킹 클론 프로젝트의 모든 기술적 세부사항을 포함하며, 
새로운 기능 개발이나 기존 코드 수정 시 참조할 수 있는 완전한 가이드입니다.