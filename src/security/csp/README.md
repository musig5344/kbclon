# KB StarBanking CSP Security System

## 개요

KB StarBanking 클론을 위한 포괄적인 Content Security Policy (CSP) 보안 시스템입니다. 이 시스템은 XSS, 클릭재킹, 데이터 누출 등의 웹 보안 위협으로부터 뱅킹 애플리케이션을 보호합니다.

## 주요 기능

- 🛡️ **종합적인 CSP 보안**: XSS, 클릭재킹, 코드 주입 방어
- 🔧 **환경별 설정**: 개발/테스트/프로덕션 환경 자동 최적화
- ⚛️ **React 통합**: Hook과 컨텍스트를 통한 원활한 React 통합
- 🚀 **Express 미들웨어**: 서버 사이드 자동 헤더 설정
- 🧪 **테스트 도구**: 자동화된 보안 테스트 및 검증
- 📊 **실시간 모니터링**: CSP 위반 탐지 및 리포팅

## 빠른 시작

### 1. React 애플리케이션에서 사용

```typescript
import React from 'react';
import { CSPProvider, setupKBStarBankingCSP } from './security/csp';

// CSP 매니저 초기화
const cspManager = setupKBStarBankingCSP('production');

function App() {
  return (
    <CSPProvider config={cspManager.getConfig()}>
      <YourAppContent />
    </CSPProvider>
  );
}

// 컴포넌트에서 CSP 사용
import { useCSP, useSecureScript } from './security/csp';

function BankingComponent() {
  const { nonce, isCSPActive } = useCSP();
  const { executeSecureScript } = useSecureScript();

  const handleSecureAction = () => {
    executeSecureScript(`
      // 안전한 스크립트 실행
      console.log('Secure banking operation');
    `);
  };

  return (
    <div>
      <p>CSP Status: {isCSPActive ? 'Active' : 'Inactive'}</p>
      <button onClick={handleSecureAction}>Secure Action</button>
    </div>
  );
}
```

### 2. Express 서버에서 사용

```typescript
import express from 'express';
import { createBankingCSPMiddleware } from './security/csp';

const app = express();

// CSP 미들웨어 설정
const cspMiddleware = createBankingCSPMiddleware({
  reportUri: '/api/csp-violations'
});

app.use(cspMiddleware.middleware());

// CSP 위반 리포트 핸들러
app.post('/api/csp-violations', cspMiddleware.violationReportHandler());

app.listen(3000);
```

### 3. 자동 환경 감지 설정

```typescript
import { autoConfigureCSP, setupCSPViolationMonitoring } from './security/csp';

// 환경에 맞는 CSP 자동 설정
const cspManager = autoConfigureCSP();

// 위반 모니터링 설정
setupCSPViolationMonitoring((violation) => {
  console.warn('CSP 위반 감지:', violation);
  // 모니터링 서비스로 전송
});
```

## 환경별 설정

### 개발 환경

```typescript
import { setupDeveloperFriendlyCSP } from './security/csp';

const cspManager = setupDeveloperFriendlyCSP();
```

**특징:**
- `'unsafe-inline'`, `'unsafe-eval'` 허용 (HMR 지원)
- localhost 리소스 허용
- Report-Only 모드로 실행
- 상세한 디버깅 정보 제공

### 테스트 환경

```typescript
import { setupCSPForEnvironment } from './security/csp';

const cspManager = setupCSPForEnvironment('testing', {
  payment: true,
  authentication: true
});
```

**특징:**
- 테스트 API 엔드포인트 허용
- 중간 수준의 보안 설정
- 테스트 도구 통합

### 프로덕션 환경

```typescript
import { setupHighSecurityCSP } from './security/csp';

const cspManager = setupHighSecurityCSP();
```

**특징:**
- 최고 수준의 보안 설정
- Trusted Types 활성화
- 엄격한 소스 제한
- 실시간 위반 모니터링

## 기능별 설정

### 결제 시스템

```typescript
import { getCSPPreset } from './security/csp';

const config = getCSPPreset('production', {
  payment: true
});
```

허용되는 결제 도메인:
- `https://pay.kbstar.com`
- `https://js.tosspayments.com`
- `https://service.iamport.kr`

### 인증 시스템

```typescript
const config = getCSPPreset('production', {
  authentication: true
});
```

허용되는 인증 도메인:
- `https://auth.kbstar.com`
- `https://nice.checkplus.co.kr`
- `https://samsungpass.com`

### 분석 도구

```typescript
const config = getCSPPreset('production', {
  analytics: true
});
```

허용되는 분석 도메인:
- Google Analytics
- Facebook Pixel
- TikTok Analytics

## 보안 테스트

### 자동 보안 테스트 실행

```typescript
import { validateCSPConfig, generateCSPTestReport } from './security/csp';

async function runSecurityAudit() {
  const config = setupKBStarBankingCSP('production').getConfig();
  
  // 보안 테스트 실행
  const results = await validateCSPConfig(config);
  
  // 보고서 생성
  const report = await generateCSPTestReport(config);
  
  console.log(report);
}
```

### 수동 테스트 케이스

```typescript
import { CSPTestUtils } from './security/csp';

const testUtils = new CSPTestUtils(config);

// XSS 방어 테스트
const xssResults = await testUtils.testXSSProtection(config);

// 클릭재킹 방어 테스트
const clickjackingResults = await testUtils.testClickjackingProtection(config);
```

## 실시간 모니터링

### CSP 위반 리포팅

```typescript
import { setupCSPViolationMonitoring } from './security/csp';

setupCSPViolationMonitoring((violation) => {
  // Sentry, DataDog 등으로 전송
  sendToMonitoring({
    type: 'csp_violation',
    blockedURI: violation.blockedURI,
    violatedDirective: violation.violatedDirective,
    sourceFile: violation.sourceFile,
    lineNumber: violation.lineNumber,
    timestamp: new Date().toISOString()
  });
});
```

### 개발자 도구

React DevTools에서 CSP 상태 확인:

```typescript
import { CSPStatus } from './security/csp';

function App() {
  return (
    <>
      <YourApp />
      {process.env.NODE_ENV === 'development' && (
        <CSPStatus showDetails={true} />
      )}
    </>
  );
}
```

## 고급 사용법

### 동적 CSP 설정

```typescript
import { createDynamicCSP, BANKING_BASE_CSP } from './security/csp';

const dynamicConfig = createDynamicCSP(BANKING_BASE_CSP, {
  allowedDomains: ['api.partner.com'],
  trustedScripts: ['https://cdn.partner.com/widget.js'],
  additionalDirectives: {
    'worker-src': ['https://worker.partner.com']
  }
});
```

### 커스텀 CSP 정책

```typescript
import { CSPManager } from './security/csp';

const customConfig = {
  environment: 'production',
  enableReporting: true,
  reportUri: '/api/custom-violations',
  customDirectives: {
    'default-src': ["'none'"],
    'script-src': ["'self'", "'nonce-{nonce}'"],
    'style-src': ["'self'", "'nonce-{nonce}'"],
    // ... 기타 지시어
  }
};

const cspManager = new CSPManager(customConfig);
```

### CSP 설정 비교

```typescript
import { compareCSPConfigs } from './security/csp';

const differences = compareCSPConfigs(oldConfig, newConfig);
console.log('CSP 변경사항:', differences.differences);
```

## 문제 해결

### 일반적인 CSP 위반

1. **인라인 스크립트 오류**
   ```
   Refused to execute inline script because it violates CSP directive
   ```
   **해결:** nonce 또는 hash 사용
   ```typescript
   const { nonce } = useCSP();
   <script nonce={nonce}>/* 스크립트 */</script>
   ```

2. **외부 리소스 로딩 오류**
   ```
   Refused to load script from 'https://example.com/script.js'
   ```
   **해결:** 허용 도메인에 추가
   ```typescript
   cspManager.addAllowedSource('script-src', 'https://example.com');
   ```

3. **스타일시트 오류**
   ```
   Refused to apply inline style because it violates CSP directive
   ```
   **해결:** styled-components 설정 확인
   ```typescript
   const { addSecureStyle } = useSecureStyle();
   addSecureStyle('.my-class { color: red; }');
   ```

### 디버깅 도구

개발 환경에서 CSP 디버깅:

```typescript
// CSP 상태 확인
const csp = useCSP();
console.log('CSP Active:', csp.isCSPActive);
console.log('Current Nonce:', csp.nonce);
console.log('Violations:', csp.violations);

// 브라우저 지원 확인
import { checkBrowserCSPSupport } from './security/csp';
const support = checkBrowserCSPSupport();
console.log('Browser CSP Support:', support);
```

## 성능 최적화

### CSP 헤더 크기 최적화

```typescript
// 불필요한 지시어 제거
const optimizedConfig = {
  ...baseConfig,
  customDirectives: {
    'default-src': ["'none'"],
    'script-src': ["'self'", "'strict-dynamic'"],
    'style-src': ["'self'"],
    // 필요한 지시어만 포함
  }
};
```

### 캐싱 전략

```typescript
// CSP 매니저 인스턴스 재사용
const cspManager = setupKBStarBankingCSP('production');

// 헤더 캐싱
const cachedHeader = cspManager.generateCSPHeader();
```

## 보안 모범 사례

1. **최소 권한 원칙**: 필요한 최소한의 소스만 허용
2. **정기적인 감사**: CSP 설정 정기 검토
3. **위반 모니터링**: 실시간 위반 감지 및 대응
4. **테스트 자동화**: CI/CD 파이프라인에 보안 테스트 통합
5. **점진적 강화**: 개발 → 테스트 → 프로덕션 단계별 보안 강화

## API 참조

### CSPManager

- `generateCSPHeader()`: CSP 헤더 문자열 생성
- `addAllowedSource(directive, source)`: 허용 소스 추가
- `refreshNonce()`: 새로운 nonce 생성
- `validateCurrentCSP()`: 현재 CSP 유효성 검사

### React Hooks

- `useCSP()`: CSP 컨텍스트 접근
- `useSecureScript()`: 안전한 스크립트 실행
- `useSecureStyle()`: 안전한 스타일 추가

### 테스트 유틸리티

- `validateCSPConfig(config)`: CSP 설정 검증
- `generateCSPTestReport(config)`: 테스트 보고서 생성
- `runSecurityTestSuite(config)`: 종합 보안 테스트

## 라이선스

이 CSP 보안 시스템은 KB StarBanking 클론 프로젝트의 일부입니다.