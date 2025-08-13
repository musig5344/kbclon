# KB스타뱅킹 UI 클론 프로젝트 초기 설정

이 문서는 KB스타뱅킹 UI 클론 프로젝트를 시작하기 위한 초기 설정 과정을 안내합니다.

## 1. 개발 환경 요구사항

- Node.js (v14.0.0 이상)
- npm (v6.0.0 이상) 또는 yarn (v1.22.0 이상)
- Git

## 2. 프로젝트 생성

### React 프로젝트 생성 (TypeScript 사용)

```bash
# Create React App으로 프로젝트 생성
npx create-react-app kb-starbanking-clone --template typescript

# 프로젝트 디렉토리로 이동
cd kb-starbanking-clone
```

## 3. 필수 라이브러리 설치

```bash
# 라우팅
npm install react-router-dom @types/react-router-dom

# 스타일링
npm install styled-components @types/styled-components

# Supabase
npm install @supabase/supabase-js

# PWA 지원
npm install workbox-core workbox-expiration workbox-precaching workbox-routing workbox-strategies

# 아이콘 및 UI 컴포넌트
npm install react-icons

# 상태 관리 (선택 사항)
npm install zustand
```

## 4. 프로젝트 구조 설정

다음과 같은 폴더 구조를 생성합니다:

```
kb-starbanking-clone/
├── public/
│   ├── favicon.ico
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── assets/
│   │   ├── fonts/
│   │   │   ├── kbfg_text_l.otf
│   │   │   ├── kbfg_text_m.otf
│   │   │   └── kbfg_text_b.otf
│   │   ├── icons/
│   │   └── images/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Typography.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── TabBar.tsx
│   │   └── screens/
│   │       ├── login/
│   │       ├── dashboard/
│   │       └── account/
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── AccountPage.tsx
│   ├── services/
│   │   └── supabase.ts
│   ├── styles/
│   │   ├── GlobalStyle.ts
│   │   ├── colors.ts
│   │   └── theme.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── react-app-env.d.ts
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 5. 폰트 설정

1. KB금융그룹 폰트 파일을 `src/assets/fonts/` 디렉토리에 복사합니다.

2. 글로벌 스타일에 폰트를 등록합니다:

```typescript
// src/styles/GlobalStyle.ts
import { createGlobalStyle } from 'styled-components';

import KBFGTextLightOTF from '../assets/fonts/kbfg_text_l.otf';
import KBFGTextMediumOTF from '../assets/fonts/kbfg_text_m.otf';
import KBFGTextBoldOTF from '../assets/fonts/kbfg_text_b.otf';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'KBFGText';
    src: url(${KBFGTextLightOTF}) format('opentype');
    font-weight: 300;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'KBFGText';
    src: url(${KBFGTextMediumOTF}) format('opentype');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'KBFGText';
    src: url(${KBFGTextBoldOTF}) format('opentype');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'KBFGText', sans-serif;
    font-weight: 500;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

export default GlobalStyle;
```

## 6. 색상 및 테마 설정

```typescript
// src/styles/colors.ts
export const colors = {
  kbYellow: '#FFCC00',
  kbBlack: '#000000',
  white: '#FFFFFF',
  gray100: '#F5F5F5',
  gray200: '#E0E0E0',
  gray300: '#9E9E9E',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};
```

```typescript
// src/styles/theme.ts
import { colors } from './colors';

export const theme = {
  colors,
  typography: {
    fontFamily: "'KBFGText', sans-serif",
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '20px',
      xl: '24px',
    },
    fontWeight: {
      light: 300,
      regular: 500,
      bold: 700,
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
};

export type Theme = typeof theme;
```

## 7. Supabase 설정

1. [Supabase](https://supabase.com/) 계정을 생성하고 새 프로젝트를 만듭니다.

2. 프로젝트 API 키를 가져옵니다.

3. Supabase 클라이언트를 설정합니다:

```typescript
// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

4. `.env` 파일을 프로젝트 루트 디렉토리에 생성하고 API 키를 추가합니다:

```
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 8. 라우팅 설정

```typescript
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import GlobalStyle from './styles/GlobalStyle';
import { theme } from './styles/theme';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AccountPage from './pages/AccountPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
```

## 9. PWA 설정

1. `manifest.json` 파일을 수정합니다:

```json
{
  "short_name": "KB스타뱅킹",
  "name": "KB스타뱅킹 클론",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#FFCC00",
  "background_color": "#FFFFFF"
}
```

2. 서비스 워커를 설정합니다:

```typescript
// src/serviceWorkerRegistration.ts
// PWA 서비스 워커 등록 코드 (Create React App의 PWA 템플릿에서 생성된 코드 사용)
```

## 10. 기본 컴포넌트 구현

### Button 컴포넌트

```typescript
// src/components/common/Button.tsx
import styled, { css } from 'styled-components';

type ButtonVariant = 'primary' | 'secondary' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
}

const Button = styled.button<ButtonProps>`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  ${({ variant, theme }) => {
    switch (variant) {
      case 'secondary':
        return css`
          background-color: ${theme.colors.white};
          color: ${theme.colors.kbBlack};
          border: 1px solid ${theme.colors.kbBlack};
          
          &:hover {
            background-color: ${theme.colors.gray100};
          }
        `;
      case 'text':
        return css`
          background-color: transparent;
          color: ${theme.colors.kbBlack};
          border: none;
          
          &:hover {
            background-color: ${theme.colors.gray100};
          }
        `;
      default:
        return css`
          background-color: ${theme.colors.kbYellow};
          color: ${theme.colors.kbBlack};
          border: none;
          
          &:hover {
            opacity: 0.9;
          }
        `;
    }
  }}
  
  ${({ size, theme }) => {
    switch (size) {
      case 'small':
        return css`
          font-size: ${theme.typography.fontSize.sm};
          padding: ${theme.spacing.xs} ${theme.spacing.md};
        `;
      case 'large':
        return css`
          font-size: ${theme.typography.fontSize.lg};
          padding: ${theme.spacing.md} ${theme.spacing.xl};
        `;
      default:
        return css`
          font-size: ${theme.typography.fontSize.md};
          padding: ${theme.spacing.sm} ${theme.spacing.lg};
        `;
    }
  }}
  
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
  
  ${({ disabled, theme }) => disabled && css`
    background-color: ${theme.colors.gray200};
    color: ${theme.colors.gray300};
    cursor: not-allowed;
    
    &:hover {
      opacity: 1;
      background-color: ${theme.colors.gray200};
    }
  `}
`;

Button.defaultProps = {
  variant: 'primary',
  size: 'medium',
  fullWidth: false,
  disabled: false,
};

export default Button;
```

### Input 컴포넌트

```typescript
// src/components/common/Input.tsx
import React from 'react';
import styled, { css } from 'styled-components';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const InputContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const InputLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.kbBlack};
`;

const StyledInput = styled.input<{ hasError?: boolean }>`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme, hasError }) => 
    hasError ? theme.colors.error : theme.colors.gray200};
  outline: none;
  
  &:focus {
    border-color: ${({ theme, hasError }) => 
      hasError ? theme.colors.error : theme.colors.kbYellow};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray100};
    color: ${({ theme }) => theme.colors.gray300};
  }
`;

const ErrorMessage = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  fullWidth = false, 
  ...props 
}) => {
  return (
    <InputContainer fullWidth={fullWidth}>
      {label && <InputLabel>{label}</InputLabel>}
      <StyledInput hasError={!!error} {...props} />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  );
};

export default Input;
```

## 11. 프로젝트 실행

```bash
# 개발 서버 실행
npm start
```

브라우저에서 `http://localhost:3000`으로 접속하여 프로젝트가 정상적으로 실행되는지 확인합니다.

## 12. 다음 단계

초기 설정이 완료되었습니다. 이제 다음 단계를 진행할 수 있습니다:

1. 디자인 시스템 구축 완료
2. 공통 UI 컴포넌트 개발
3. 스플래시 및 로그인 화면 구현
4. 메인 대시보드 구현

각 단계는 `IMPLEMENTATION_PLAN.md`에 자세히 설명되어 있습니다. 