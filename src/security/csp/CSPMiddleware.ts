/**
 * CSP Middleware
 *
 * Express/서버 환경에서 CSP 헤더를 자동으로 설정하는 미들웨어
 * - 동적 nonce 생성
 * - 환경별 CSP 정책 적용
 * - 헤더 자동 설정
 * - 위반 리포팅 엔드포인트
 */

import { Request, Response, NextFunction } from 'express';

import { CSPManager, CSPConfig } from './CSPManager';

interface CSPMiddlewareOptions {
  config?: CSPConfig;
  reportOnly?: boolean;
  reportUri?: string;
  enableNonce?: boolean;
  customDirectives?: Record<string, string[]>;
}

interface CSPRequest extends Request {
  nonce?: string;
  cspManager?: CSPManager;
}

class CSPMiddleware {
  private cspManager: CSPManager;
  private options: CSPMiddlewareOptions;

  constructor(options: CSPMiddlewareOptions = {}) {
    this.options = {
      reportOnly: false,
      enableNonce: true,
      ...options,
    };

    // CSP 매니저 초기화
    this.cspManager = new CSPManager(
      options.config || {
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
        enableReporting: true,
        reportUri: options.reportUri || '/api/csp-violations',
        enableTrustedTypes: true,
      }
    );

    // 커스텀 지시어 추가
    if (options.customDirectives) {
      Object.entries(options.customDirectives).forEach(([directive, sources]) => {
        sources.forEach(source => {
          this.cspManager.addAllowedSource(directive as any, source);
        });
      });
    }
  }

  /**
   * Express 미들웨어 함수
   */
  middleware() {
    return (req: CSPRequest, res: Response, next: NextFunction) => {
      try {
        // nonce 생성 및 요청에 추가
        if (this.options.enableNonce) {
          this.cspManager.refreshNonce();
          req.nonce = this.cspManager.getNonce();
          req.cspManager = this.cspManager;
        }

        // CSP 헤더 생성
        const cspHeader = this.cspManager.generateCSPHeader();
        const additionalHeaders = this.cspManager.generateAdditionalSecurityHeaders();

        // 헤더 설정
        const headerName = this.options.reportOnly
          ? 'Content-Security-Policy-Report-Only'
          : 'Content-Security-Policy';

        res.setHeader(headerName, cspHeader);

        // 추가 보안 헤더 설정
        Object.entries(additionalHeaders).forEach(([name, value]) => {
          res.setHeader(name, value);
        });

        // 개발 환경에서 CSP 정보 로깅
        if (process.env.NODE_ENV === 'development') {
          if (req.nonce) {
          }
        }

        next();
      } catch (error) {
        console.error('[CSP Middleware] Error setting CSP headers:', error);
        next();
      }
    };
  }

  /**
   * CSP 위반 리포트 핸들러
   */
  violationReportHandler() {
    return (req: Request, res: Response) => {
      try {
        const report = req.body;

        // 리포트 로깅
        console.warn('[CSP Violation Report]:', JSON.stringify(report, null, 2));

        // 프로덕션에서는 모니터링 서비스로 전송
        if (process.env.NODE_ENV === 'production') {
          this.sendViolationToMonitoring(report);
        }

        // 개발 환경에서 상세 분석
        if (process.env.NODE_ENV === 'development') {
          this.analyzeViolation(report);
        }

        res.status(204).send();
      } catch (error) {
        console.error('[CSP Violation Handler] Error processing report:', error);
        res.status(500).json({ error: 'Failed to process violation report' });
      }
    };
  }

  /**
   * 위반 모니터링 서비스 전송
   */
  private async sendViolationToMonitoring(report: any): Promise<void> {
    try {
      // 실제 구현에서는 Sentry, DataDog 등으로 전송
      // 예시: 모니터링 API 호출
      // await fetch('https://monitoring-service.com/api/csp-violations', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${process.env.MONITORING_API_KEY}`
      //   },
      //   body: JSON.stringify({
      //     timestamp: new Date().toISOString(),
      //     report,
      //     environment: process.env.NODE_ENV,
      //     applicationName: 'kb-starbanking-clone'
      //   })
      // });
    } catch (error) {
      console.error('[CSP] Failed to send violation to monitoring:', error);
    }
  }

  /**
   * 위반 분석 (개발용)
   */
  private analyzeViolation(report: any): void {
    const violation = report['csp-report'] || report;

    console.group('[CSP Violation Analysis]');

    // 해결 제안
    const suggestions = this.generateViolationSuggestions(violation);
    if (suggestions.length > 0) {
      suggestions.forEach((suggestion, index) => {});
    }

    console.groupEnd();
  }

  /**
   * 위반 해결 제안 생성
   */
  private generateViolationSuggestions(violation: any): string[] {
    const suggestions: string[] = [];
    const directive = violation['violated-directive'];
    const blockedUri = violation['blocked-uri'];

    switch (directive) {
      case 'script-src':
        if (blockedUri === 'inline') {
          suggestions.push('Use nonce or hash for inline scripts');
          suggestions.push('Move inline scripts to external files');
        } else {
          suggestions.push(`Add '${blockedUri}' to script-src directive`);
        }
        break;

      case 'style-src':
        if (blockedUri === 'inline') {
          suggestions.push('Use nonce or hash for inline styles');
          suggestions.push('Move inline styles to external CSS files');
        } else {
          suggestions.push(`Add '${blockedUri}' to style-src directive`);
        }
        break;

      case 'img-src':
        suggestions.push(`Add '${blockedUri}' to img-src directive`);
        if (blockedUri.startsWith('data:')) {
          suggestions.push("Add 'data:' to img-src for base64 images");
        }
        break;

      case 'connect-src':
        suggestions.push(`Add '${blockedUri}' to connect-src directive`);
        suggestions.push('Check if this is a legitimate API endpoint');
        break;

      case 'font-src':
        suggestions.push(`Add '${blockedUri}' to font-src directive`);
        break;

      case 'frame-src':
        suggestions.push(`Add '${blockedUri}' to frame-src directive`);
        suggestions.push('Verify if embedding this content is secure');
        break;

      default:
        suggestions.push(`Review the ${directive} directive`);
        suggestions.push(`Consider adding '${blockedUri}' if it's trusted`);
    }

    return suggestions;
  }

  /**
   * 동적 CSP 업데이트
   */
  updateCSP(updates: Partial<CSPConfig>): void {
    this.cspManager = new CSPManager({
      ...this.cspManager.getConfig(),
      ...updates,
    });
  }

  /**
   * 허용된 소스 추가
   */
  addAllowedSource(directive: string, source: string): void {
    this.cspManager.addAllowedSource(directive as any, source);
  }

  /**
   * nonce 기반 스크립트 허용
   */
  allowScript(scriptContent: string): string {
    return this.cspManager.addHashSource(scriptContent);
  }

  /**
   * 현재 CSP 설정 조회
   */
  getCurrentCSP(): string {
    return this.cspManager.generateCSPHeader();
  }

  /**
   * CSP 검증
   */
  validateCSP(): boolean {
    return this.cspManager.validateCurrentCSP();
  }
}

// 프리셋 미들웨어 팩토리 함수들
export const createBankingCSPMiddleware = (options: Partial<CSPMiddlewareOptions> = {}) => {
  const bankingConfig: CSPConfig = {
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    enableReporting: true,
    reportUri: '/api/csp-violations',
    enableTrustedTypes: true,
    customDirectives: {
      'script-src': [
        "'self'",
        'https://apis.google.com',
        'https://www.googletagmanager.com',
        'https://connect.facebook.net',
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // styled-components 지원
        'https://fonts.googleapis.com',
      ],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'img-src': ["'self'", 'data:', 'https://*.kbstar.com', 'https://ssl.pstatic.net'],
      'connect-src': ["'self'", 'https://api.kbstar.com', 'https://analytics.google.com'],
    },
  };

  return new CSPMiddleware({
    config: bankingConfig,
    ...options,
  });
};

export const createDevelopmentCSPMiddleware = () => {
  return new CSPMiddleware({
    config: {
      environment: 'development',
      enableReporting: true,
      reportUri: '/api/csp-violations',
      enableTrustedTypes: false, // 개발 환경에서는 비활성화
    },
    reportOnly: true, // 개발 환경에서는 report-only 모드
  });
};

export const createProductionCSPMiddleware = () => {
  return new CSPMiddleware({
    config: {
      environment: 'production',
      enableReporting: true,
      reportUri: '/api/csp-violations',
      enableTrustedTypes: true,
    },
    reportOnly: false,
  });
};

export default CSPMiddleware;
export type { CSPMiddlewareOptions, CSPRequest };
