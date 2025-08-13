/**
 * 안드로이드 WebView 브릿지
 * 
 * 간단한 APK 배포를 위한 최소한의 안드로이드 연동
 */
// 안드로이드 환경 감지
export const isAndroidApp = () => {
  return /Android/i.test(navigator.userAgent) && 
         window.location.protocol === 'file:' ||
         window.location.hostname === 'localhost';
};
// 하드웨어 뒤로가기 버튼 처리
export const setupAndroidBackButton = () => {
  if (!isAndroidApp()) return;
  document.addEventListener('backbutton', (e) => {
    e.preventDefault();
    // 모달이나 팝업이 열려있으면 닫기
    const modals = document.querySelectorAll('[data-modal="true"]');
    if (modals.length > 0) {
      modals[modals.length - 1].dispatchEvent(new Event('close'));
      return;
    }
    // 홈에서는 앱 종료 확인
    if (window.location.pathname === '/dashboard' || 
        window.location.pathname === '/') {
      if (window.confirm('앱을 종료하시겠습니까?')) {
        (navigator as any).app?.exitApp();
      }
      return;
    }
    // 그 외에는 이전 페이지로
    window.history.back();
  });
};
// 안드로이드 토스트 메시지
export const showAndroidToast = (message: string) => {
  if (isAndroidApp() && (window as any).Android?.showToast) {
    (window as any).Android.showToast(message);
  } else {
    // 웹 환경에서는 일반 alert
  }
};
// 진동 피드백
export const vibrate = (duration: number = 50) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration);
  }
};
// 전체화면 모드
export const setFullScreen = (enable: boolean) => {
  if (!isAndroidApp()) return;
  if (enable) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
};
// 화면 꺼짐 방지
export const keepScreenOn = (enable: boolean) => {
  if (!isAndroidApp()) return;
  if (enable && 'wakeLock' in navigator) {
    (navigator as any).wakeLock.request('screen');
  }
};
// 앱 정보
export const getAppInfo = () => {
  return {
    version: '1.0.0',
    buildDate: new Date().toISOString(),
    platform: isAndroidApp() ? 'android' : 'web',
    userAgent: navigator.userAgent
  };
};