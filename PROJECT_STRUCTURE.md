# KB스타뱅킹 클론 프로젝트 구조 분석 문서

## 📋 프로젝트 개요

KB스타뱅킹 모바일 앱의 완전한 클론 프로젝트로, React 19와 최신 웹 기술을 활용한 PWA 애플리케이션입니다.

## 🛠 기술 스택

### Core
- **React 19.1.0** - 최신 React 기능 활용
- **TypeScript 4.9.5** - 타입 안전성
- **Styled Components 6.1.19** - CSS-in-JS
- **React Router 6.30.1** - SPA 라우팅
- **TanStack React Query 5.84.0** - 서버 상태 관리
- **Supabase** - 백엔드 서비스

### Build & Development
- **CRACO** - CRA 설정 커스터마이징
- **Terser Plugin** - 코드 압축
- **Compression Plugin** - 번들 최적화
- **ESLint & Prettier** - 코드 품질 관리

## 📁 프로젝트 구조

```
kbstarbankclone/
├── public/                    # 정적 파일
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json          # PWA 설정
│
├── src/
│   ├── accessibility/         # 접근성 기능
│   │   ├── ScreenReader.tsx
│   │   └── HighContrastMode.tsx
│   │
│   ├── app/                  # 앱 레벨 설정
│   │   ├── providers/
│   │   │   ├── QueryProvider.tsx
│   │   │   └── ThemeProvider.tsx
│   │   └── routes/
│   │       └── AppRoutes.tsx
│   │
│   ├── assets/               # 정적 자원
│   │   ├── fonts/           # KB 전용 폰트
│   │   ├── icons/           # 아이콘 컴포넌트
│   │   └── images/          # 이미지 파일
│   │
│   ├── components/          # 컴포넌트 라이브러리
│   │   ├── banking/         # 뱅킹 전용 컴포넌트
│   │   ├── common/          # 공통 UI
│   │   ├── design-system/   # 디자인 시스템
│   │   ├── kb-native/       # KB 스타일 컴포넌트
│   │   ├── mobile/          # 모바일 최적화
│   │   ├── notifications/   # 알림 시스템
│   │   ├── offline/         # 오프라인 기능
│   │   └── pwa/            # PWA 관련
│   │
│   ├── features/           # 기능별 모듈
│   │   ├── accounts/       # 계좌 관리
│   │   ├── auth/          # 인증 시스템
│   │   ├── dashboard/     # 대시보드
│   │   ├── transactions/  # 거래내역
│   │   └── transfers/     # 이체 기능
│   │
│   ├── security/          # 보안 기능
│   │   ├── csp.ts        # Content Security Policy
│   │   ├── csrf.ts       # CSRF 방어
│   │   └── xss.ts        # XSS 방어
│   │
│   ├── shared/           # 공유 리소스
│   │   ├── components/   # 공용 컴포넌트
│   │   ├── contexts/     # React Context
│   │   ├── hooks/        # 커스텀 훅
│   │   └── services/     # 공용 서비스
│   │
│   ├── styles/          # 스타일 시스템
│   │   ├── tokens/      # 디자인 토큰
│   │   └── theme/       # 테마 설정
│   │
│   ├── App.tsx          # 메인 앱 컴포넌트
│   ├── index.tsx        # 엔트리 포인트
│   └── serviceWorkerRegistration.ts  # PWA 설정
│
├── android/             # Android 빌드 설정
├── ios/                # iOS 빌드 설정
│
├── .env.example       # 환경변수 예제
├── .eslintrc.json     # ESLint 설정
├── .prettierrc        # Prettier 설정
├── craco.config.js    # CRACO 설정
├── package.json       # 프로젝트 의존성
└── tsconfig.json      # TypeScript 설정
```

## 🎯 주요 기능 모듈

### 1. 인증 시스템 (`src/features/auth/`)
- **다양한 로그인 방식**
  - ID/비밀번호 로그인
  - 지문 인증
  - 공동인증서
  - 금융인증서
- **보안 기능**
  - 세션 관리
  - 자동 로그아웃
  - 보안 키패드

### 2. 계좌 관리 (`src/features/accounts/`)
- 계좌 목록 조회
- 잔액 실시간 업데이트
- 거래내역 조회
- 계좌 상세 정보

### 3. 이체 기능 (`src/features/transfers/`)
- 즉시 이체
- 예약 이체
- 계좌번호 OCR 스캔
- 최근 이체 내역

### 4. 대시보드 (`src/features/dashboard/`)
- 총 자산 현황
- 최근 거래 요약
- 빠른 메뉴
- 이벤트/공지사항

## 🎨 디자인 시스템

### 컬러 시스템
```typescript
// src/styles/tokens/colors.ts
- Primary: #FFD338 (KB 골드)
- Secondary: #333333
- Background: #F5F5F5
- Error: #FF5252
- Success: #4CAF50
```

### 타이포그래피
```typescript
// src/styles/tokens/typography.ts
- Font Family: 'KBFG_TEXT'
- Sizes: 12px ~ 24px
- Weights: 400, 500, 700
```

### 컴포넌트 라이브러리
- `KBButton` - KB 스타일 버튼
- `KBInput` - 입력 필드
- `KBCard` - 카드 레이아웃
- `KBModal` - 모달 다이얼로그

## 🔄 라우팅 구조

```typescript
// 주요 라우트
/ - 메인 로그인 화면
/login/id - ID/비밀번호 로그인
/dashboard - 대시보드 (인증 필요)
/account - 계좌 목록
/account/:accountId - 계좌 상세
/transfer - 이체
/transactions - 거래내역
/menu - 전체 메뉴
```

## 📦 상태 관리

### 1. 서버 상태 (React Query)
- API 응답 캐싱
- 자동 재시도
- 백그라운드 동기화
- 옵티미스틱 업데이트

### 2. 전역 상태 (Context API)
- 인증 상태
- 테마 설정
- 알림 관리
- 로딩 상태

### 3. 로컬 상태 (useState/useReducer)
- 폼 상태
- UI 토글
- 임시 데이터

## 🔐 보안 기능

### 구현된 보안 기능
1. **Content Security Policy (CSP)**
   - XSS 공격 방어
   - 안전한 리소스만 로드

2. **CSRF Protection**
   - 토큰 기반 검증
   - SameSite 쿠키

3. **Input Validation**
   - 입력값 정화
   - SQL 인젝션 방어

4. **보안 키패드**
   - 가상 키보드
   - 키로거 방어

## ⚡ 성능 최적화

### 번들 최적화
- **코드 스플리팅**: 라우트별 청크 분리
- **트리 쉐이킹**: 미사용 코드 제거
- **압축**: Terser 및 Gzip 압축
- **이미지 최적화**: WebP 포맷 사용

### 런타임 최적화
- **React.memo**: 컴포넌트 메모이제이션
- **useMemo/useCallback**: 값/함수 캐싱
- **가상화**: 대량 리스트 렌더링
- **지연 로딩**: 이미지 및 컴포넌트

## 📱 모바일 최적화

### PWA 기능
- 오프라인 지원
- 앱 설치
- 푸시 알림
- 백그라운드 동기화

### Capacitor 통합
- 네이티브 기능 접근
- 카메라/갤러리
- 지오로케이션
- 생체 인증

## ♿ 접근성

### WCAG 2.1 준수
- 시맨틱 HTML
- ARIA 속성
- 키보드 네비게이션
- 스크린 리더 지원
- 고대비 모드

## 🧪 테스트 전략

### 단위 테스트
- Jest + React Testing Library
- 컴포넌트 테스트
- 유틸리티 함수 테스트

### 통합 테스트
- API 모킹
- 사용자 시나리오 테스트

### E2E 테스트 (예정)
- Cypress 또는 Playwright

## 🚀 빌드 및 배포

### 개발 환경
```bash
npm start        # 개발 서버 시작
npm run build    # 프로덕션 빌드
npm test         # 테스트 실행
npm run lint     # 린트 검사
```

### 프로덕션 빌드
```bash
npm run build:android  # Android APK 빌드
npm run build:ios      # iOS 빌드
npm run build:pwa      # PWA 빌드
```

## 📊 성능 메트릭

### 목표 성능 지표
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1
- **번들 크기**: < 500KB (gzipped)

## 🔄 향후 개선 사항

1. **테스트 커버리지 향상**
   - 현재 테스트 미구현
   - 목표: 80% 이상 커버리지

2. **국제화 (i18n)**
   - 다국어 지원
   - 지역별 통화/날짜 포맷

3. **성능 모니터링**
   - Sentry 통합
   - 실시간 에러 추적

4. **A/B 테스팅**
   - 기능 플래그
   - 사용자 세그먼트

## 📝 참고 사항

- 모든 환경변수는 `.env.example` 참조
- 개발 가이드는 `CONTRIBUTING.md` 참조
- API 문서는 `/docs/api` 디렉토리 참조

---

*마지막 업데이트: 2025년 8월 13일*