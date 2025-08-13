# KB스타뱅킹 클론 프로젝트 최적화 종합 계획서

## 🎯 최적화 목표
- **번들 크기**: 9.2MB → 1.7MB (82% 감소)
- **초기 로딩 시간**: 8초 → 2초 (75% 개선)
- **TTI (Time to Interactive)**: 12초 → 3.5초 (70% 개선)
- **KB 원본 UI/UX 100% 유지**

## 📊 현재 상태 요약

### 주요 문제점
1. **폰트 파일**: 8.7MB (OTF 형식 3개)
2. **PWA 오버헤드**: 불필요한 오프라인 기능, 서비스 워커
3. **번들 크기**: 951KB (압축 전) / 320KB (Gzip)
4. **과도한 의존성**: Workbox(7개), Capacitor(10개)
5. **애니메이션**: PNG 프레임 29개 사용 (143KB)

## 🚀 최적화 실행 계획

### Phase 1: 긴급 최적화 (즉시 실행 가능)

#### 1.1 폰트 최적화 (최우선) - 7.3MB 절약
```bash
# OTF → WOFF2 변환
npx fonttools subset kbfg_text_l.otf --output-file=kbfg_text_l.woff2 --flavor=woff2 --unicodes=U+0020-007E,U+AC00-D7AF
npx fonttools subset kbfg_text_m.otf --output-file=kbfg_text_m.woff2 --flavor=woff2 --unicodes=U+0020-007E,U+AC00-D7AF
npx fonttools subset kbfg_text_b.otf --output-file=kbfg_text_b.woff2 --flavor=woff2 --unicodes=U+0020-007E,U+AC00-D7AF
```

**예상 결과:**
- kbfg_text_l.otf (2.86MB) → kbfg_text_l.woff2 (~400KB)
- kbfg_text_m.otf (2.82MB) → kbfg_text_m.woff2 (~400KB)
- kbfg_text_b.otf (2.84MB) → kbfg_text_b.woff2 (~400KB)

#### 1.2 PWA 코드 완전 제거 - 450KB 절약

**제거 대상 폴더:**
```
src/components/pwa/
src/components/offline/
src/core/storage/ (PWA 관련 파일)
src/core/cache/
```

**제거 대상 파일:**
```
public/sw.js
src/service-worker.ts
src/serviceWorkerRegistration.ts
src/utils/pwa.ts
src/hooks/usePWA.ts
```

**Package.json에서 제거:**
```json
// 제거할 의존성
"workbox-background-sync"
"workbox-cacheable-response"
"workbox-core"
"workbox-expiration"
"workbox-precaching"
"workbox-routing"
"workbox-strategies"
"idb"
```

#### 1.3 불필요한 Capacitor 플러그인 제거 - 100KB 절약
```bash
npm uninstall @capacitor/geolocation @capacitor/haptics @capacitor/local-notifications @capacitor/push-notifications
```

### Phase 2: 코드 최적화 (1-2주)

#### 2.1 애니메이션 최적화
```typescript
// 로딩 애니메이션 PNG → CSS 변환
const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #FFCC00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
```

#### 2.2 이미지 최적화
```bash
# PNG → WebP 변환
for file in src/assets/images/*.png; do
  cwebp -q 85 "$file" -o "${file%.png}.webp"
done
```

#### 2.3 코드 스플리팅 강화
```javascript
// craco.config.js 수정
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: 10,
        reuseExistingChunk: true,
      },
      common: {
        minChunks: 2,
        priority: 5,
        reuseExistingChunk: true,
      },
      styles: {
        name: 'styles',
        test: /\.css$/,
        chunks: 'all',
        enforce: true,
      },
    },
  },
}
```

### Phase 3: 빌드 최적화 (2-3주)

#### 3.1 Webpack 설정 최적화
```javascript
// craco.config.js 추가
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  webpack: {
    plugins: [
      new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 8192,
        minRatio: 0.8,
      }),
    ],
    configure: (webpackConfig) => {
      // Terser 추가 최적화
      webpackConfig.optimization.minimizer[0].options.terserOptions = {
        ...webpackConfig.optimization.minimizer[0].options.terserOptions,
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info'],
        },
      };
      return webpackConfig;
    },
  },
};
```

#### 3.2 동적 임포트 적용
```typescript
// 라우트별 지연 로딩
const Dashboard = lazy(() => import('./features/dashboard/DashboardPage'));
const Transfer = lazy(() => import('./features/transfers/TransferPage'));
const Account = lazy(() => import('./features/accounts/AccountPage'));
```

### Phase 4: 런타임 최적화 (3-4주)

#### 4.1 컴포넌트 메모이제이션
```typescript
// 계좌 목록 최적화
const AccountList = React.memo(({ accounts }) => {
  const sortedAccounts = useMemo(
    () => accounts.sort((a, b) => b.balance - a.balance),
    [accounts]
  );
  
  return <VirtualList items={sortedAccounts} />;
});
```

#### 4.2 가상 스크롤 구현
```typescript
// 거래내역 가상화
import { FixedSizeList } from 'react-window';

const TransactionList = ({ transactions }) => (
  <FixedSizeList
    height={600}
    itemCount={transactions.length}
    itemSize={72}
    width="100%"
  >
    {({ index, style }) => (
      <TransactionItem
        style={style}
        transaction={transactions[index]}
      />
    )}
  </FixedSizeList>
);
```

## 📋 실행 체크리스트

### 즉시 실행 (Day 1)
- [ ] 폰트 파일 WOFF2 변환
- [ ] PWA 관련 폴더 삭제
- [ ] 불필요한 npm 패키지 제거
- [ ] package-lock.json 재생성

### 1주차
- [ ] App.tsx에서 PWA Provider 제거
- [ ] 서비스 워커 파일 삭제
- [ ] 로딩 애니메이션 CSS 변환
- [ ] 이미지 WebP 변환

### 2주차
- [ ] 코드 스플리팅 구현
- [ ] 동적 임포트 적용
- [ ] React.memo 최적화
- [ ] 빌드 설정 업데이트

### 3주차
- [ ] 가상 스크롤 구현
- [ ] 성능 모니터링 도구 설치
- [ ] 번들 분석 및 추가 최적화
- [ ] 최종 테스트

## 📊 예상 성과

### 번들 크기 변화
| 항목 | 현재 | 최적화 후 | 감소율 |
|------|------|-----------|--------|
| 폰트 | 8.7MB | 1.2MB | 86% |
| 번들 | 951KB | 500KB | 47% |
| 이미지 | 500KB | 300KB | 40% |
| **총합** | **10MB** | **2MB** | **80%** |

### 성능 지표 개선
| 지표 | 현재 | 목표 | 개선율 |
|------|------|------|--------|
| FCP | 3.2s | 1.2s | 62% |
| TTI | 12s | 3.5s | 70% |
| LCP | 4.5s | 2.0s | 55% |
| CLS | 0.15 | 0.05 | 66% |

## ⚠️ 주의사항

1. **KB 디자인 유지**: 모든 최적화는 원본 UI/UX를 100% 유지
2. **점진적 적용**: 각 단계별 테스트 후 다음 단계 진행
3. **롤백 계획**: 각 변경사항 Git 커밋으로 관리
4. **모니터링**: 실사용자 성능 메트릭 지속 관찰

## 🎯 성공 기준

- [ ] 3G 네트워크에서 3초 내 인터랙션 가능
- [ ] Lighthouse 성능 점수 90점 이상
- [ ] 번들 크기 2MB 이하
- [ ] KB 원본과 시각적 차이 없음

---

*작성일: 2025년 8월 13일*
*작성자: 시니어 개발팀 (20년차 전문가 팀)*