# 🚀 KB 스타뱅킹 클론 - 개발 가이드

> **프로젝트 확장 및 새 기능 개발을 위한 실무 가이드**

## 🎯 개발 철학 및 원칙

### 핵심 원칙
1. **원본 충실도 최우선** - 창작보다는 정확한 재현
2. **기능 완성도** - UI만이 아닌 실제 동작하는 시스템  
3. **확장 가능성** - 미래 기능 추가를 고려한 아키텍처
4. **KB 브랜드 준수** - 공식 디자인 가이드라인 엄격 적용

### 개발 우선순위
```
1. 원본 KB 앱과의 일치도 (99% 목표)
2. 핵심 기능의 완전한 동작
3. 사용자 경험 최적화
4. 성능 및 안정성
5. 확장 기능 개발
```

## 🛠️ 개발 환경 설정

### 필수 요구사항
```bash
# Node.js 버전 확인 (18+ 권장)
node --version

# npm 업데이트
npm install -g npm@latest

# 프로젝트 의존성 설치
npm install

# 개발 서버 시작
npm start
```

### 개발 도구 설정
```bash
# VS Code 확장 설치 (권장)
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension styled-components.vscode-styled-components
code --install-extension ms-vscode.vscode-json

# Git hooks 설정
npx husky install
```

### 환경변수 설정
```bash
# .env 파일 생성 (프로젝트 루트)
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
REACT_APP_ENV=development
```

## 📂 프로젝트 구조 이해

### 핵심 디렉토리 구조
```
src/
├── components/           # UI 컴포넌트 (재사용 가능)
│   ├── common/          # 공통 컴포넌트
│   │   ├── Button/      # 버튼 컴포넌트 + 스토리
│   │   ├── Input/       # 입력 필드 + 스토리  
│   │   └── Loading/     # 로딩 컴포넌트 + 스토리
│   ├── layout/          # 레이아웃 컴포넌트
│   │   ├── Header/      # 헤더 (페이지별 다양)
│   │   ├── TabBar/      # 하단 탭바
│   │   └── BottomSheet/ # 바텀시트 모달
│   └── screens/         # 화면별 특화 컴포넌트
│       ├── login/       # 로그인 화면 관련
│       ├── dashboard/   # 대시보드 관련
│       └── account/     # 계좌 관련
├── pages/               # 라우팅 페이지 (1 page = 1 route)
├── stores/              # 상태 관리 (Zustand)
├── services/            # 외부 API/서비스 연동
├── styles/              # 디자인 시스템 및 테마
├── utils/               # 공통 유틸리티 함수
├── hooks/               # 커스텀 React Hook
└── types/               # TypeScript 타입 정의
```

### 컴포넌트 구조 규칙
```typescript
// 표준 컴포넌트 구조 예시
components/common/Button/
├── index.ts             # 외부 노출 인터페이스
├── Button.tsx           # 메인 컴포넌트
├── Button.styled.ts     # 스타일 정의
├── Button.stories.tsx   # Storybook 스토리
├── Button.test.tsx      # 단위 테스트
└── types.ts             # 컴포넌트 타입 정의
```

## 🎨 디자인 시스템 활용

### 테마 시스템 사용법
```typescript
// styled-components에서 테마 사용
import styled from 'styled-components';

const StyledButton = styled.button`
  // 색상 시스템 활용
  background-color: ${({ theme }) => theme.colors.kbYellow};
  color: ${({ theme }) => theme.colors.kbBlack};
  
  // 타이포그래피 시스템 활용
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  
  // 간격 시스템 활용
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  // 모서리 반경 시스템 활용
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;
```

### 컴포넌트 변형 패턴
```typescript
// Button 컴포넌트 변형 예시
type ButtonVariant = 'primary' | 'secondary' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium', 
  ...props
}) => {
  return <StyledButton variant={variant} size={size} {...props} />;
};
```

## 🔌 백엔드 연동 패턴

### Supabase 서비스 구조
```typescript
// src/services/auth.service.ts
import { supabase } from './supabase';

export class AuthService {
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return { success: !error, error };
  }
  
  static async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
}
```

### 상태 관리 패턴 (Zustand)
```typescript
// src/stores/userStore.ts
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;
  
  // Async actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isLoading: false,
        error: null,
        
        setUser: (user) => set({ user }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        clearUser: () => set({ user: null, error: null }),
        
        login: async (email, password) => {
          set({ isLoading: true, error: null });
          
          try {
            const result = await AuthService.signIn(email, password);
            
            if (result.success) {
              set({ user: result.user, isLoading: false });
              return true;
            } else {
              set({ error: result.error, isLoading: false });
              return false;
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Login failed',
              isLoading: false 
            });
            return false;
          }
        },
        
        logout: async () => {
          await AuthService.signOut();
          get().clearUser();
        },
      }),
      {
        name: 'user-storage',
        partialize: (state) => ({ user: state.user }),
      }
    ),
    { name: 'UserStore' }
  )
);
```

## 🧩 새 기능 개발 가이드

### 1. 새 페이지 추가
```typescript
// 1단계: 페이지 컴포넌트 생성
// src/pages/NewFeaturePage.tsx
import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Header } from '../components/layout/Header';

const NewFeaturePage: React.FC = () => {
  return (
    <PageContainer>
      <Header title="새 기능" showBack />
      {/* 페이지 내용 */}
    </PageContainer>
  );
};

export default NewFeaturePage;

// 2단계: 라우트 추가  
// src/App.tsx
import NewFeaturePage from './pages/NewFeaturePage';

<Routes>
  <Route path="/new-feature" element={<NewFeaturePage />} />
</Routes>

// 3단계: 네비게이션 추가
// 메뉴나 버튼에서 navigate('/new-feature') 호출
```

### 2. 새 컴포넌트 개발
```typescript
// 1단계: 타입 정의
// src/components/common/NewComponent/types.ts
export interface NewComponentProps {
  title: string;
  description?: string;
  variant?: 'default' | 'highlighted';
  onClick?: () => void;
}

// 2단계: 스타일 정의
// src/components/common/NewComponent/NewComponent.styled.ts
import styled, { css } from 'styled-components';

export const ComponentContainer = styled.div<{ variant: string }>`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  
  ${({ variant, theme }) => variant === 'highlighted' && css`
    background-color: ${theme.colors.kbYellow};
    color: ${theme.colors.kbBlack};
  `}
`;

// 3단계: 메인 컴포넌트
// src/components/common/NewComponent/NewComponent.tsx
import React from 'react';
import { ComponentContainer } from './NewComponent.styled';
import { NewComponentProps } from './types';

export const NewComponent: React.FC<NewComponentProps> = ({
  title,
  description,
  variant = 'default',
  onClick
}) => {
  return (
    <ComponentContainer variant={variant} onClick={onClick}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </ComponentContainer>
  );
};

// 4단계: 인덱스 파일
// src/components/common/NewComponent/index.ts
export { NewComponent } from './NewComponent';
export type { NewComponentProps } from './types';
```

### 3. 새 API 서비스 추가
```typescript
// src/services/newFeature.service.ts
import { supabase } from './supabase';

export interface NewFeatureData {
  id: string;
  name: string;
  value: number;
  createdAt: string;
}

export class NewFeatureService {
  static async getAll(): Promise<NewFeatureData[]> {
    const { data, error } = await supabase
      .from('new_feature_table')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  }
  
  static async create(data: Omit<NewFeatureData, 'id' | 'createdAt'>) {
    const { data: result, error } = await supabase
      .from('new_feature_table')
      .insert([data])
      .select()
      .single();
      
    if (error) throw error;
    return result;
  }
  
  static async update(id: string, data: Partial<NewFeatureData>) {
    const { data: result, error } = await supabase
      .from('new_feature_table')
      .update(data)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return result;
  }
  
  static async delete(id: string) {
    const { error } = await supabase
      .from('new_feature_table')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
}
```

## 🎯 KB 브랜드 준수 가이드

### 색상 사용 규칙
```typescript
// ✅ 올바른 사용
const PrimaryButton = styled.button`
  background-color: ${({ theme }) => theme.colors.kbYellow};
  color: ${({ theme }) => theme.colors.kbBlack};
`;

// ❌ 잘못된 사용 - 임의 색상 사용 금지
const WrongButton = styled.button`
  background-color: #FFB300; // KB 색상이 아님
  color: #333333;             // KB 색상이 아님
`;
```

### 폰트 사용 규칙
```typescript
// ✅ 올바른 폰트 위계 사용
const Title = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};    // 700
  font-size: ${({ theme }) => theme.typography.fontSize.xl};          // 24px
`;

const Body = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};  // 500  
  font-size: ${({ theme }) => theme.typography.fontSize.md};          // 16px
`;
```

### 아이콘 사용 가이드
```typescript
// 원본 KB 아이콘 우선 사용
const iconMap = {
  login: '/assets/images/auth/icon_login.png',
  account: '/assets/images/menu/icon_bankbook.png',
  transfer: '/assets/images/menu/icon_transfer_bankbook.png',
  // KB 원본 아이콘이 없는 경우에만 대체 아이콘 사용
};

// 아이콘 컴포넌트 사용 예시
<Icon 
  src={getImagePath('login')} 
  alt="로그인" 
  size={24}
/>
```

## 🧪 테스트 및 품질 관리

### 단위 테스트 작성
```typescript
// src/components/common/Button/Button.test.tsx
import React from 'react';
import { render, fireEvent, screen } from '../../../utils/test-utils';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>클릭하세요</Button>);
    expect(screen.getByText('클릭하세요')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>클릭</Button>);
    
    fireEvent.click(screen.getByText('클릭'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('applies correct styles for primary variant', () => {
    render(<Button variant="primary">버튼</Button>);
    const button = screen.getByText('버튼');
    
    expect(button).toHaveStyle({
      backgroundColor: '#FFD338', // KB Yellow
      color: '#26282C'            // KB Black
    });
  });
});
```

### E2E 테스트 시나리오
```typescript
// cypress/integration/login.spec.ts
describe('Login Flow', () => {
  it('should complete full login process', () => {
    cy.visit('/');
    
    // 스플래시 화면 확인
    cy.get('[data-testid="splash-screen"]').should('be.visible');
    cy.wait(1000); // 스플래시 대기
    
    // 로그인 화면 이동
    cy.get('[data-testid="other-login-methods"]').click();
    
    // 바텀시트 표시 확인
    cy.get('[data-testid="login-bottom-sheet"]').should('be.visible');
    
    // 아이디 탭 선택
    cy.get('[data-testid="id-login-tab"]').click();
    
    // 로그인 폼 입력
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    
    // 대시보드 이동 확인
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="dashboard"]').should('be.visible');
  });
});
```

## 🚀 배포 및 성능 최적화

### 빌드 최적화
```bash
# 프로덕션 빌드
npm run build

# 빌드 분석
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js

# 성능 측정
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

### 성능 모니터링
```typescript
// src/utils/performance.ts
export const measurePerformance = (name: string) => {
  return {
    start: () => performance.mark(`${name}-start`),
    end: () => {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name)[0];
      console.log(`${name}: ${measure.duration}ms`);
    }
  };
};

// 사용 예시
const loginPerf = measurePerformance('login-process');
loginPerf.start();
// 로그인 로직 실행
loginPerf.end();
```

## 📋 개발 체크리스트

### 새 기능 개발 시 확인사항
- [ ] KB 브랜드 가이드라인 준수
- [ ] 원본 스타뱅킹과의 일치도 검증
- [ ] 반응형 디자인 적용
- [ ] 접근성 요구사항 충족
- [ ] 타입 안전성 확보 (TypeScript)
- [ ] 단위 테스트 작성
- [ ] 성능 영향도 측정
- [ ] 에러 처리 구현

### 코드 리뷰 포인트
- [ ] 컴포넌트 재사용성
- [ ] 상태 관리 효율성  
- [ ] API 호출 최적화
- [ ] 메모리 누수 방지
- [ ] 번들 크기 증가 최소화
- [ ] 로딩 상태 처리
- [ ] 에러 바운더리 적용

이 개발 가이드를 통해 KB 스타뱅킹 클론 프로젝트의 품질과 일관성을 유지하면서 
새로운 기능을 안전하고 효율적으로 개발할 수 있습니다.