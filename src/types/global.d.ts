/**
 * 전역 타입 선언
 */
// Window 객체 확장
declare global {
  interface Window {
    // PWA 관련
    deferredPrompt?: BeforeInstallPromptEvent;
    isUpdateAvailable?: Promise<boolean>;
    // 이벤트
    addEventListener(
      type: 'pwa-update-available' | 'pwa-installable' | 'pwa-installed',
      listener: (event: Event) => void
    ): void;
    removeEventListener(
      type: 'pwa-update-available' | 'pwa-installable' | 'pwa-installed',
      listener: (event: Event) => void
    ): void;
    // Android Bridge
    AndroidBridge?: {
      showToast: (message: string) => void;
      getBiometricStatus: () => string;
      authenticateBiometric: (userId: string) => void;
      getDeviceInfo: () => string;
      vibrate: (duration: number) => void;
    };
  }
  // 네비게이터 확장
  interface Navigator {
    connection?: NetworkInformation;
  }
  // 네트워크 정보
  interface NetworkInformation {
    type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
    effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
    addEventListener(type: 'change', listener: (event: Event) => void): void;
    removeEventListener(type: 'change', listener: (event: Event) => void): void;
  }
  // PWA Install Prompt Event
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
    prompt(): Promise<void>;
  }
}
// 모듈 타입 선언
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}
declare module '*.png' {
  const value: string;
  export default value;
}
declare module '*.jpg' {
  const value: string;
  export default value;
}
declare module '*.jpeg' {
  const value: string;
  export default value;
}
declare module '*.gif' {
  const value: string;
  export default value;
}
declare module '*.webp' {
  const value: string;
  export default value;
}
// CSS 모듈
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}
// JSON 모듈
declare module '*.json' {
  const value: any;
  export default value;
}
// 환경 변수 타입
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    REACT_APP_API_BASE_URL: string;
    REACT_APP_SUPABASE_URL: string;
    REACT_APP_SUPABASE_ANON_KEY: string;
    REACT_APP_ENABLE_PWA?: string;
    REACT_APP_ENABLE_ANALYTICS?: string;
    REACT_APP_ENABLE_SENTRY?: string;
    REACT_APP_SENTRY_DSN?: string;
    REACT_APP_VERSION?: string;
  }
}
// 빈 export로 모듈로 만들기
export {};