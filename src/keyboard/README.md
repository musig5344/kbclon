# KB StarBanking 키보드 네비게이션 시스템

KB StarBanking 앱을 위한 완전한 키보드 네비게이션 및 접근성 지원 시스템입니다.

## 📋 목차

- [개요](#개요)
- [주요 기능](#주요-기능)
- [빠른 시작](#빠른-시작)
- [아키텍처](#아키텍처)
- [컴포넌트 가이드](#컴포넌트-가이드)
- [키보드 단축키](#키보드-단축키)
- [접근성 기능](#접근성-기능)
- [API 참조](#api-참조)
- [모범 사례](#모범-사례)
- [문제 해결](#문제-해결)

## 🎯 개요

이 시스템은 KB StarBanking 앱에서 완전한 키보드 네비게이션을 제공하여 접근성을 향상시키고, 키보드 사용자의 경험을 개선합니다. WCAG 2.1 AA 준수를 목표로 설계되었습니다.

### 지원 기능

- ✅ 전역 키보드 단축키 관리
- ✅ 포커스 트랩 및 관리
- ✅ 로빙 탭인덱스
- ✅ 커맨드 팔레트 (Ctrl+K)
- ✅ 키보드 최적화 컴포넌트
- ✅ 가상 키보드 (보안 입력)
- ✅ 접근성 공지
- ✅ Vim 스타일 네비게이션 (선택사항)

## 🚀 빠른 시작

### 1. 설치 및 설정

```tsx
// App.tsx 또는 최상위 컴포넌트
import React from 'react';
import { KeyboardProvider, initializeKeyboardNavigation } from './keyboard';

// 앱 시작 시 초기화
useEffect(() => {
  initializeKeyboardNavigation({
    enableShortcuts: true,
    enableNavigation: true,
    enableTraps: true,
    enableCommandPalette: true
  });
}, []);

function App() {
  return (
    <KeyboardProvider>
      {/* 앱 컴포넌트들 */}
    </KeyboardProvider>
  );
}
```

### 2. 기본 사용법

```tsx
import { 
  useKeyboardNavigation, 
  useKeyboardShortcuts,
  KeyboardButton,
  KeyboardDropdown 
} from './keyboard';

function MyComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 키보드 네비게이션 활성화
  const { 
    navigateNext, 
    navigatePrevious, 
    currentIndex 
  } = useKeyboardNavigation(containerRef, {
    wrap: true,
    announceChanges: true
  });

  // 단축키 등록
  useKeyboardShortcuts([
    {
      id: 'my-shortcut',
      keys: ['ctrl+enter'],
      description: '확인',
      action: () => console.log('확인됨')
    }
  ]);

  return (
    <div ref={containerRef}>
      <KeyboardButton shortcut={['Ctrl', 'Enter']}>
        확인
      </KeyboardButton>
      
      <KeyboardDropdown
        options={[
          { value: '1', label: '옵션 1' },
          { value: '2', label: '옵션 2' }
        ]}
        onChange={(value) => console.log(value)}
      />
    </div>
  );
}
```

## 🏗️ 아키텍처

```
src/keyboard/
├── core/                     # 핵심 매니저들
│   ├── KeyboardShortcutManager.ts    # 전역 단축키 관리
│   ├── KeyboardNavigationManager.ts  # 포커스 네비게이션
│   └── KeyboardTrapManager.ts        # 포커스 트랩
├── components/               # 키보드 최적화 컴포넌트
│   ├── KeyboardButton.tsx
│   ├── KeyboardDropdown.tsx
│   ├── KeyboardDatePicker.tsx
│   ├── KeyboardNumberPad.tsx
│   ├── VirtualKeyboard.tsx
│   └── CommandPalette.tsx
├── hooks/                    # React 훅들
│   └── useKeyboardNavigation.ts
├── contexts/                 # React 컨텍스트
│   └── KeyboardProvider.tsx
├── utils/                    # 유틸리티 함수들
│   └── keyboardUtils.ts
├── types/                    # TypeScript 타입 정의
│   └── index.ts
└── index.ts                  # 메인 진입점
```

### 핵심 매니저들

1. **KeyboardShortcutManager**: 전역 키보드 단축키를 관리
2. **KeyboardNavigationManager**: 포커스 이동 및 네비게이션 관리
3. **KeyboardTrapManager**: 모달/다이얼로그에서 포커스 트랩 관리

## 🧩 컴포넌트 가이드

### KeyboardButton

향상된 접근성과 키보드 지원을 제공하는 버튼 컴포넌트입니다.

```tsx
<KeyboardButton
  variant="primary"
  size="large"
  shortcut={['Ctrl', 'Enter']}
  announceAction={true}
  leftIcon={<CheckIcon />}
  onClick={() => console.log('클릭됨')}
>
  확인
</KeyboardButton>
```

**주요 기능:**
- 키보드 활성화 (Enter, Space)
- 단축키 힌트 표시
- 스크린 리더 공지
- 리플 효과
- 포커스 링

### KeyboardDropdown

완전한 키보드 네비게이션이 지원되는 드롭다운 컴포넌트입니다.

```tsx
<KeyboardDropdown
  label="계좌 선택"
  options={accountOptions}
  searchable={true}
  onChange={handleAccountChange}
  placeholder="계좌를 선택하세요"
/>
```

**키보드 조작:**
- `Enter/Space`: 드롭다운 열기
- `↑/↓`: 옵션 탐색
- `Enter`: 선택
- `Esc`: 닫기
- `Home/End`: 첫번째/마지막 옵션

### KeyboardDatePicker

키보드로 조작 가능한 날짜 선택기입니다.

```tsx
<KeyboardDatePicker
  label="거래일자"
  value={selectedDate}
  onChange={setSelectedDate}
  locale="ko"
  format="YYYY-MM-DD"
/>
```

**키보드 조작:**
- `F4/↓`: 달력 열기
- `←/→/↑/↓`: 날짜 탐색
- `PageUp/PageDown`: 월 변경
- `Home/End`: 주의 시작/끝
- `Enter`: 날짜 선택

### KeyboardNumberPad

뱅킹 보안을 위한 숫자 패드 컴포넌트입니다.

```tsx
<KeyboardNumberPad
  label="이체 금액"
  maxLength={10}
  scramble={true}
  currency={true}
  onChange={setAmount}
  onComplete={handleAmountComplete}
/>
```

**보안 기능:**
- 숫자 스크램블링
- 값 마스킹 옵션
- 키보드 입력 차단
- 터치/클릭만 허용

### VirtualKeyboard

민감한 정보 입력을 위한 가상 키보드입니다.

```tsx
<VirtualKeyboard
  type="password"
  layout="banking"
  scramble={true}
  isOpen={showVirtualKeyboard}
  onClose={() => setShowVirtualKeyboard(false)}
  onComplete={handlePasswordInput}
/>
```

### CommandPalette

빠른 액션 실행을 위한 명령 팔레트입니다.

```tsx
<CommandPalette
  isOpen={showCommandPalette}
  items={commandItems}
  onExecute={executeCommand}
  onClose={() => setShowCommandPalette(false)}
  enableFuzzySearch={true}
/>
```

**기본 단축키:** `Ctrl+K`

## ⌨️ 키보드 단축키

### 전역 단축키

| 단축키 | 기능 | 설명 |
|--------|------|------|
| `Alt + H` | 홈으로 이동 | 메인 대시보드로 이동 |
| `Alt + M` | 메뉴 토글 | 네비게이션 메뉴 열기/닫기 |
| `Alt + ←` | 뒤로가기 | 이전 페이지로 이동 |
| `Ctrl + K` | 명령 팔레트 | 빠른 액션 실행 |
| `Ctrl + /` | 검색 | 검색 기능 활성화 |

### 뱅킹 단축키

| 단축키 | 기능 | 설명 |
|--------|------|------|
| `Ctrl + T` | 이체하기 | 이체 페이지로 이동 |
| `Ctrl + B` | 잔액 조회 | 계좌 잔액 확인 |
| `Ctrl + Shift + A` | 계좌 조회 | 계좌 목록 보기 |
| `Ctrl + Shift + H` | 이체 내역 | 이체 거래 내역 |

### 접근성 단축키

| 단축키 | 기능 | 설명 |
|--------|------|------|
| `Ctrl + Shift + H` | 고대비 모드 | 고대비 테마 토글 |
| `Ctrl + Shift + S` | 스크린 리더 | 스크린 리더 최적화 |
| `Ctrl + Shift + ?` | 키보드 도움말 | 단축키 도움말 표시 |

### 네비게이션 단축키

| 단축키 | 기능 | 설명 |
|--------|------|------|
| `Tab` | 다음 요소 | 다음 포커스 가능한 요소 |
| `Shift + Tab` | 이전 요소 | 이전 포커스 가능한 요소 |
| `Enter` | 활성화 | 버튼/링크 클릭 |
| `Space` | 활성화 | 버튼 클릭 (체크박스 토글) |
| `Esc` | 취소/닫기 | 모달 닫기, 작업 취소 |
| `Home` | 첫 번째 | 첫 번째 요소로 이동 |
| `End` | 마지막 | 마지막 요소로 이동 |

## ♿ 접근성 기능

### WCAG 2.1 준수

- **2.1.1 키보드**: 모든 기능을 키보드로 조작 가능
- **2.1.2 키보드 트랩 없음**: 포커스 트랩 방지
- **2.4.3 포커스 순서**: 논리적인 탭 순서
- **2.4.7 포커스 표시**: 명확한 포커스 표시
- **4.1.2 이름, 역할, 값**: 적절한 ARIA 레이블

### 스크린 리더 지원

```tsx
// 스크린 리더 공지
announceToScreenReader('계좌 이체가 완료되었습니다', 'assertive');

// 포커스 변경 공지
<KeyboardButton announceAction={true}>
  이체하기
</KeyboardButton>
```

### 고대비 모드

```css
/* 자동으로 적용되는 고대비 스타일 */
@media (prefers-contrast: high) {
  .kb-focus-visible {
    outline: 3px solid #ffff00;
    outline-offset: 2px;
  }
}
```

## 📚 API 참조

### useKeyboardNavigation

컨테이너 내에서 키보드 네비게이션을 관리하는 훅입니다.

```tsx
const {
  currentIndex,
  focusedElement,
  navigateNext,
  navigatePrevious,
  navigateFirst,
  navigateLast,
  navigateTo,
  enable,
  disable,
  refresh
} = useKeyboardNavigation(containerRef, options);
```

**옵션:**
- `mode`: 네비게이션 모드 ('normal' | 'vim' | 'accessibility')
- `wrap`: 끝에서 처음으로 순환 여부
- `skipDisabled`: 비활성화된 요소 건너뛰기
- `announceChanges`: 변경사항 스크린 리더 공지
- `onNavigate`: 네비게이션 콜백
- `onActivate`: 활성화 콜백

### useKeyboardShortcuts

키보드 단축키를 등록하고 관리하는 훅입니다.

```tsx
useKeyboardShortcuts([
  {
    id: 'save',
    keys: ['ctrl+s'],
    description: '저장',
    action: () => save(),
    context: ['form'],
    enabled: true
  }
], {
  context: ['global'],
  enabled: true
});
```

### KeyboardProvider

전역 키보드 네비게이션 상태를 제공하는 컨텍스트입니다.

```tsx
<KeyboardProvider
  initialSettings={{
    mode: 'normal',
    announceChanges: true,
    showFocusRing: true
  }}
  onSettingsChange={handleSettingsChange}
>
  <App />
</KeyboardProvider>
```

## 🎯 모범 사례

### 1. 컴포넌트 설계

```tsx
// ✅ 좋은 예: 키보드 네비게이션 고려
function CustomForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const { navigateNext } = useKeyboardNavigation(formRef);

  return (
    <form ref={formRef}>
      <KeyboardButton type="submit" shortcut={['Ctrl', 'Enter']}>
        제출
      </KeyboardButton>
    </form>
  );
}

// ❌ 나쁜 예: 키보드 접근 불가
function BadForm() {
  return (
    <div onClick={handleSubmit}>
      제출
    </div>
  );
}
```

### 2. 단축키 등록

```tsx
// ✅ 좋은 예: 설명적인 ID와 컨텍스트
useKeyboardShortcuts([
  {
    id: 'transfer-confirm',
    keys: ['ctrl+enter'],
    description: '이체 확인',
    context: ['transfer-page'],
    action: confirmTransfer
  }
]);

// ❌ 나쁜 예: 모호한 ID와 전역 등록
useKeyboardShortcuts([
  {
    id: 'action1',
    keys: ['ctrl+enter'],
    action: doSomething
  }
]);
```

### 3. 접근성 레이블

```tsx
// ✅ 좋은 예: 명확한 레이블
<KeyboardButton 
  aria-label="김철수 계좌로 100,000원 이체하기"
  announceAction={true}
>
  이체 확인
</KeyboardButton>

// ❌ 나쁜 예: 모호한 레이블
<KeyboardButton>
  확인
</KeyboardButton>
```

### 4. 로딩 상태 처리

```tsx
// ✅ 좋은 예: 로딩 중 키보드 비활성화
<KeyboardButton 
  loading={isTransferring}
  disabled={isTransferring}
  aria-busy={isTransferring}
>
  {isTransferring ? '이체 중...' : '이체하기'}
</KeyboardButton>
```

## 🐛 문제 해결

### 자주 발생하는 문제들

#### 1. 포커스가 예상대로 이동하지 않음

**원인:** DOM 구조가 변경되었거나 포커스 가능한 요소가 업데이트되지 않음

**해결방법:**
```tsx
const { refresh } = useKeyboardNavigation(containerRef);

useEffect(() => {
  // DOM 변경 후 포커스 요소 목록 갱신
  refresh();
}, [dataChanged]);
```

#### 2. 단축키가 작동하지 않음

**원인:** 입력 필드에서 단축키가 차단됨

**해결방법:**
```tsx
// allowInInputs 옵션 사용
globalKeyboardShortcutManager = new KeyboardShortcutManager({
  allowInInputs: true
});
```

#### 3. 모바일에서 키보드 네비게이션 문제

**원인:** 모바일 디바이스에서는 물리적 키보드가 없음

**해결방법:**
```tsx
// 모바일 감지 후 터치 대안 제공
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (isMobile) {
  // 스와이프 제스처나 터치 네비게이션 사용
}
```

#### 4. 성능 문제

**원인:** 너무 많은 DOM 쿼리나 이벤트 리스너

**해결방법:**
```tsx
// 디바운스 사용
const debouncedRefresh = debounce(refresh, 100);

// MutationObserver 최적화
const observer = new MutationObserver(debouncedRefresh);
```

### 디버깅 도구

개발 모드에서는 다음 도구들을 사용할 수 있습니다:

```tsx
// 브라우저 콘솔에서
window.__keyboardShortcutManager.toggleDebugMode();
window.__keyboardNavigationManager.getCurrentElement();
window.__keyboardTrapManager.getActiveTrap();
```

## 🔄 업데이트 및 유지보수

### 버전 관리

이 시스템은 시맨틱 버저닝을 따릅니다:
- **Major**: 호환성을 깨는 변경사항
- **Minor**: 새로운 기능 추가
- **Patch**: 버그 수정

### 마이그레이션 가이드

새 버전으로 업데이트할 때는 다음을 확인하세요:

1. **Breaking Changes**: CHANGELOG.md 확인
2. **API 변경사항**: 타입 정의 업데이트
3. **테스트**: 키보드 네비게이션 테스트 실행
4. **접근성 검증**: 스크린 리더 테스트

## 📞 지원

문제가 발생하거나 개선 사항이 있으면:

1. 이슈 트래커에 보고
2. 개발 팀에 문의
3. 접근성 전문가 검토 요청

---

**📄 라이선스:** MIT License  
**👥 기여자:** KB StarBanking 개발팀  
**📅 최근 업데이트:** 2025-08-01