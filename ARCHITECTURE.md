# KB 스타뱅킹 클론 - 아키텍처 문서

## 📋 개요

이 문서는 KB 스타뱅킹 클론 프로젝트의 전체 구조와 아키텍처 원칙을 설명합니다.

## 🏗️ 프로젝트 구조

### 폴더 구조 개선 결과 (2025년 1월)

```
src/
├── app/                    # 앱 설정 및 프로바이더
│   ├── providers/         # React Query, Theme 등 글로벌 프로바이더
│   └── routes/           # 라우팅 설정
├── features/             # 기능별 모듈 구성
│   ├── auth/            # 인증 관련 기능
│   ├── accounts/        # 계좌 관련 기능  
│   ├── transactions/    # 거래내역 기능
│   ├── transfers/       # 이체 기능
│   ├── dashboard/       # 대시보드 기능
│   └── menu/           # 메뉴 기능
├── shared/              # 공유 컴포넌트 및 유틸리티
│   ├── components/     # 재사용 가능한 UI 컴포넌트
│   ├── hooks/         # 커스텀 훅
│   ├── utils/         # 유틸리티 함수
│   ├── services/      # API 서비스
│   ├── types/         # 공통 타입 정의
│   └── constants/     # 상수
├── components/          # 레거시 컴포넌트 (점진적 마이그레이션 중)
├── styles/             # 글로벌 스타일 및 테마
├── assets/            # 이미지, 폰트 등 정적 자원
├── utils/             # 글로벌 유틸리티 (shared/utils로 마이그레이션 중)
└── types/             # 글로벌 타입 정의
```

## 🎯 아키텍처 원칙

### 1. Feature-Driven Development
- 각 기능은 독립적인 폴더에서 관리
- 기능별로 components, hooks, services, types 포함
- 기능 간 의존성 최소화

### 2. 계층형 구조
```
Feature/
├── components/        # UI 컴포넌트
├── hooks/            # 비즈니스 로직 훅
├── services/         # API 호출 로직
├── types/           # 타입 정의
├── utils/           # 기능별 유틸리티
└── styles/          # 기능별 스타일
```

### 3. 컴포넌트 분류

#### Shared Components (공통 컴포넌트)
- **UI Components**: Button, Modal, Input 등 기본 UI 요소
- **Layout Components**: Header, Container, PageWrapper 등
- **Animation Components**: Loading, Transition 등
- **Form Components**: 폼 관련 공통 컴포넌트

#### Feature Components (기능별 컴포넌트)
- 특정 기능에서만 사용되는 컴포넌트
- 비즈니스 로직이 포함된 컴포넌트

## 📦 컴포넌트 통합 결과

### 중복 제거된 컴포넌트들

#### 1. Button 컴포넌트 통합
**통합 전:**
- `shared/components/ui/Button/` ✅ (메인)
- `shared/components/ui/CommonButtons.tsx` ❌ (제거됨)
- `shared/components/ui/EnhancedButton.tsx` ❌ (제거됨)
- `components/kb-native/KBButton.tsx` (특수 목적으로 유지)

**통합 후:**
- `@shared/components/ui/Button` - 모든 버튼 요구사항을 충족하는 통합 컴포넌트

#### 2. Loading 컴포넌트 통합
**통합 전:**
- `shared/components/ui/UnifiedLoading.tsx` ✅ (메인)
- `shared/components/ui/KBLoadingAnimation.tsx` ❌ (제거됨)
- `shared/components/ui/OptimizedLoadingAnimation.tsx` ❌ (제거됨)
- `shared/components/ui/FinancialLoader.tsx` ❌ (제거됨)
- `shared/components/loading/OptimizedLoading.tsx` ❌ (제거됨)

**통합 후:**
- `@shared/components/ui/UnifiedLoading` - 모든 로딩 UI를 담당하는 통합 컴포넌트

#### 3. Modal 컴포넌트 통합
**통합 전:**
- `shared/components/ui/Modal.tsx` (기본 구현)
- `shared/components/ui/CommonModal.tsx` ✅ (완성도 높음)

**통합 후:**
- `@shared/components/ui/Modal` - 더 완성도 높은 CommonModal로 대체

## 🔗 Import 경로 규칙

### Alias 설정 (craco.config.js)
```javascript
{
  '@app': 'src/app',
  '@features': 'src/features', 
  '@shared': 'src/shared',
  '@components': 'src/components',
  '@styles': 'src/styles',
  '@assets': 'src/assets',
  '@utils': 'src/utils',
  '@types': 'src/types',
  '@config': 'src/config'
}
```

### Import 우선순위
1. **절대 경로 (Alias) 사용 권장**
   ```typescript
   import { Button } from '@shared/components/ui/Button';
   import { useAuth } from '@features/auth/hooks/useAuth';
   ```

2. **상대 경로는 최소화**
   ```typescript
   // 같은 폴더 내에서만 사용
   import { LoginForm } from './LoginForm';
   ```

### Import 순서 규칙
```typescript
// 1. React 및 외부 라이브러리
import React from 'react';
import styled from 'styled-components';

// 2. 절대 경로 import (알파벳 순)
import { Button } from '@shared/components/ui/Button';
import { useAuth } from '@features/auth/hooks/useAuth';

// 3. 상대 경로 import
import { LoginForm } from './LoginForm';
import { styles } from './styles';
```

## 🚫 Deprecated 컴포넌트

### 사용하지 말아야 할 컴포넌트들
```typescript
// ❌ 사용 금지 - 제거된 컴포넌트들
import { CommonButtons } from '@shared/components/ui/CommonButtons'; // 제거됨
import { EnhancedButton } from '@shared/components/ui/EnhancedButton'; // 제거됨
import { KBLoadingAnimation } from '@shared/components/ui/KBLoadingAnimation'; // 제거됨
import { OptimizedLoadingAnimation } from '@shared/components/ui/OptimizedLoadingAnimation'; // 제거됨

// ✅ 대신 사용할 컴포넌트들
import { Button, PrimaryButton, SecondaryButton } from '@shared/components/ui/Button';
import { KBLoading, UnifiedLoading } from '@shared/components/ui/UnifiedLoading';
```

## 🔄 마이그레이션 가이드

### Button 컴포넌트 마이그레이션
```typescript
// Before (제거된 컴포넌트)
import { PrimaryButton } from '@shared/components/ui/CommonButtons';

// After (통합된 컴포넌트)
import { PrimaryButton } from '@shared/components/ui/Button';
// 또는
import { Button } from '@shared/components/ui/Button';
<Button variant="primary">확인</Button>
```

### Loading 컴포넌트 마이그레이션
```typescript
// Before (제거된 컴포넌트)
import { KBLoadingAnimation } from '@shared/components/ui/KBLoadingAnimation';

// After (통합된 컴포넌트)
import { KBLoading } from '@shared/components/ui/UnifiedLoading';
<KBLoading isVisible={true} message="로딩 중..." />
```

## 📁 폴더별 역할 정의

### `/src/features/`
- **목적**: 비즈니스 기능별 모듈화
- **구조**: 각 기능은 독립적인 폴더로 구성
- **예시**: auth, accounts, transactions, transfers
- **규칙**: 기능 간 직접적인 의존성 금지, shared를 통해서만 공유

### `/src/shared/`
- **목적**: 여러 기능에서 공통으로 사용하는 요소들
- **포함**: components, hooks, utils, services, types
- **규칙**: 비즈니스 로직 배제, 순수한 재사용 가능한 요소만 포함

### `/src/components/` (레거시)
- **목적**: 기존 컴포넌트들의 임시 보관
- **상태**: 점진적으로 shared 또는 features로 마이그레이션 중
- **규칙**: 새로운 컴포넌트는 여기에 추가하지 말 것

### `/src/styles/`
- **목적**: 글로벌 스타일, 테마, 디자인 토큰
- **포함**: GlobalStyle, theme, tokens, animations
- **규칙**: 컴포넌트별 스타일은 해당 컴포넌트와 함께 위치

## 🎨 네이밍 컨벤션

### 파일 네이밍
- **컴포넌트**: PascalCase (예: `LoginForm.tsx`)
- **훅**: camelCase, use 접두사 (예: `useAuth.ts`)
- **유틸리티**: camelCase (예: `formatCurrency.ts`)
- **타입**: PascalCase, .types 접미사 (예: `auth.types.ts`)
- **스타일**: PascalCase, .styles 접미사 (예: `LoginForm.styles.ts`)

### 컴포넌트 네이밍
- **페이지 컴포넌트**: Page 접미사 (예: `DashboardPage`)
- **모달 컴포넌트**: Modal 접미사 (예: `LoginModal`)
- **섹션 컴포넌트**: Section 접미사 (예: `AccountSection`)

### 폴더 네이밍
- **기능 폴더**: kebab-case (예: `auth`, `account-transfer`)
- **컴포넌트 폴더**: kebab-case (예: `ui`, `layout`)

## 🔍 코드 품질 가이드라인

### TypeScript 사용 원칙
1. **엄격한 타입 정의**: any 타입 사용 금지
2. **Interface 우선**: type보다 interface 선호
3. **제네릭 활용**: 재사용 가능한 컴포넌트에서 제네릭 사용

### 컴포넌트 작성 원칙
1. **Single Responsibility**: 하나의 책임만 가지도록 설계
2. **Composition over Inheritance**: 합성을 통한 재사용
3. **Props Drilling 방지**: Context API 또는 상태 관리 라이브러리 사용

### 성능 최적화
1. **React.memo 활용**: 불필요한 리렌더링 방지
2. **useMemo/useCallback**: expensive 연산과 함수 메모이제이션
3. **Lazy Loading**: 큰 컴포넌트들의 지연 로딩

## 🔧 개발 도구 설정

### 필수 VS Code 확장
- TypeScript Hero
- Auto Rename Tag
- Prettier
- ESLint
- Styled Components

### 권장 설정
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

## 📈 향후 개선 계획

### 단기 목표
1. [ ] 모든 레거시 컴포넌트를 새 구조로 마이그레이션
2. [ ] 순환 참조 완전 제거
3. [ ] 타입 정의 표준화

### 중기 목표
1. [ ] Micro Frontend 아키텍처 도입 검토
2. [ ] 컴포넌트 라이브러리 분리
3. [ ] 자동화된 아키텍처 검증 도구 도입

### 장기 목표
1. [ ] Server-Side Rendering (SSR) 도입
2. [ ] Progressive Web App (PWA) 완전 구현
3. [ ] 크로스 플랫폼 확장 (React Native)

---

**최종 업데이트**: 2025년 1월 13일  
**작성자**: Claude Code (Senior Software Architect)  
**문서 버전**: 1.0