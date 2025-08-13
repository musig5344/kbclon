/**
 * CSRF Protection Utilities
 *
 * Cross-Site Request Forgery (CSRF) 공격 방어를 위한 유틸리티
 * - CSRF 토큰 생성 및 검증
 * - SameSite 쿠키 설정
 * - Referrer 검증
 * - 뱅킹 특화 CSRF 방어
 */

import CryptoJS from 'crypto-js';

interface CSRFTokenOptions {
  length?: number;
  expiry?: number; // milliseconds
  algorithm?: 'SHA256' | 'SHA1' | 'MD5';
  secret?: string;
}

interface CSRFValidationResult {
  isValid: boolean;
  token: string;
  errors: string[];
  warnings: string[];
  expiresAt?: number;
}

interface CSRFConfig {
  tokenName: string;
  headerName: string;
  cookieName: string;
  excludedMethods: string[];
  trustedOrigins: string[];
  sameSitePolicy: 'Strict' | 'Lax' | 'None';
  httpOnly: boolean;
  secure: boolean;
  maxAge: number;
}

class CSRFProtection {
  private config: CSRFConfig;
  private tokenStore: Map<string, { token: string; expiresAt: number; sessionId: string }> =
    new Map();
  private readonly SECRET_KEY: string;

  constructor(config?: Partial<CSRFConfig>) {
    this.config = {
      tokenName: 'csrf_token',
      headerName: 'X-CSRF-Token',
      cookieName: 'csrf_token',
      excludedMethods: ['GET', 'HEAD', 'OPTIONS', 'TRACE'],
      trustedOrigins: ['https://kbstar.com', 'https://api.kbstar.com'],
      sameSitePolicy: 'Strict',
      httpOnly: true,
      secure: true,
      maxAge: 3600000, // 1 hour
      ...config,
    };

    // 보안 시크릿 키 생성
    this.SECRET_KEY = this.generateSecretKey();
  }

  /**
   * CSRF 토큰 생성
   */
  generateToken(
    sessionId: string,
    options?: CSRFTokenOptions
  ): { token: string; expiresAt: number } {
    const opts: Required<CSRFTokenOptions> = {
      length: 32,
      expiry: this.config.maxAge,
      algorithm: 'SHA256',
      secret: this.SECRET_KEY,
      ...options,
    };

    // 기본 토큰 데이터
    const timestamp = Date.now();
    const expiresAt = timestamp + opts.expiry;
    const randomBytes = this.generateRandomString(opts.length);

    // 토큰 페이로드
    const payload = {
      sessionId,
      timestamp,
      expiresAt,
      randomBytes,
    };

    // HMAC 기반 토큰 생성
    const tokenData = JSON.stringify(payload);
    const signature = CryptoJS.HmacSHA256(tokenData, opts.secret).toString();
    const token = btoa(`${tokenData}.${signature}`);

    // 토큰 저장
    this.tokenStore.set(token, {
      token,
      expiresAt,
      sessionId,
    });

    // 만료된 토큰 정리
    this.cleanExpiredTokens();

    return { token, expiresAt };
  }

  /**
   * CSRF 토큰 검증
   */
  validateToken(
    token: string,
    sessionId: string,
    request?: {
      method?: string;
      origin?: string;
      referer?: string;
      userAgent?: string;
    }
  ): CSRFValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 기본 검증
      if (!token || typeof token !== 'string') {
        errors.push('CSRF token is missing or invalid');
        return { isValid: false, token: '', errors, warnings };
      }

      // 메서드 검증
      if (request?.method && this.config.excludedMethods.includes(request.method.toUpperCase())) {
        return { isValid: true, token, errors, warnings };
      }

      // 토큰 디코딩 및 검증
      const decodedToken = this.decodeToken(token);
      if (!decodedToken) {
        errors.push('Invalid token format');
        return { isValid: false, token, errors, warnings };
      }

      // 세션 ID 검증
      if (decodedToken.sessionId !== sessionId) {
        errors.push('Token session mismatch');
      }

      // 만료 시간 검증
      if (Date.now() > decodedToken.expiresAt) {
        errors.push('Token has expired');
      }

      // 토큰 저장소 검증
      const storedToken = this.tokenStore.get(token);
      if (!storedToken) {
        errors.push('Token not found in store');
      }

      // Origin 검증
      if (request?.origin) {
        const isValidOrigin = this.validateOrigin(request.origin);
        if (!isValidOrigin) {
          errors.push(`Invalid origin: ${request.origin}`);
        }
      }

      // Referer 검증
      if (request?.referer) {
        const isValidReferer = this.validateReferer(request.referer);
        if (!isValidReferer) {
          warnings.push(`Suspicious referer: ${request.referer}`);
        }
      }

      return {
        isValid: errors.length === 0,
        token,
        errors,
        warnings,
        expiresAt: decodedToken.expiresAt,
      };
    } catch (error) {
      errors.push(`Token validation error: ${error}`);
      return { isValid: false, token, errors, warnings };
    }
  }

  /**
   * 토큰 무효화
   */
  invalidateToken(token: string): boolean {
    return this.tokenStore.delete(token);
  }

  /**
   * 세션의 모든 토큰 무효화
   */
  invalidateSessionTokens(sessionId: string): number {
    let count = 0;
    for (const [token, data] of this.tokenStore.entries()) {
      if (data.sessionId === sessionId) {
        this.tokenStore.delete(token);
        count++;
      }
    }
    return count;
  }

  /**
   * 토큰 디코딩
   */
  private decodeToken(token: string): {
    sessionId: string;
    timestamp: number;
    expiresAt: number;
    randomBytes: string;
  } | null {
    try {
      const decoded = atob(token);
      const [tokenData, signature] = decoded.split('.');

      // 서명 검증
      const expectedSignature = CryptoJS.HmacSHA256(tokenData, this.SECRET_KEY).toString();
      if (signature !== expectedSignature) {
        console.warn('[CSRF] Token signature verification failed');
        return null;
      }

      return JSON.parse(tokenData);
    } catch (error) {
      console.warn('[CSRF] Token decoding failed:', error);
      return null;
    }
  }

  /**
   * Origin 검증
   */
  private validateOrigin(origin: string): boolean {
    try {
      const url = new URL(origin);

      // HTTPS 검증
      if (url.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
        return false;
      }

      // 신뢰할 수 있는 도메인 검증
      const domain = `${url.protocol}//${url.host}`;
      return this.config.trustedOrigins.some(trusted => {
        return domain === trusted || domain.endsWith(`.${trusted.replace(/^https?:\/\//, '')}`);
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * Referer 검증
   */
  private validateReferer(referer: string): boolean {
    try {
      const url = new URL(referer);
      return this.validateOrigin(`${url.protocol}//${url.host}`);
    } catch (error) {
      return false;
    }
  }

  /**
   * 만료된 토큰 정리
   */
  private cleanExpiredTokens(): void {
    const now = Date.now();
    for (const [token, data] of this.tokenStore.entries()) {
      if (now > data.expiresAt) {
        this.tokenStore.delete(token);
      }
    }
  }

  /**
   * 보안 시크릿 키 생성
   */
  private generateSecretKey(): string {
    // 환경 변수에서 키를 가져오거나 생성
    if (process.env.CSRF_SECRET) {
      return process.env.CSRF_SECRET;
    }

    // 런타임에 키 생성 (실제 환경에서는 고정된 키 사용 권장)
    const randomData = [
      Date.now().toString(),
      Math.random().toString(),
      navigator?.userAgent || 'server',
      window?.location?.hostname || 'localhost',
    ].join('|');

    return CryptoJS.SHA256(randomData).toString();
  }

  /**
   * 랜덤 문자열 생성
   */
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 쿠키 설정 헤더 생성
   */
  generateCookieHeader(token: string, expiresAt: number): string {
    const expires = new Date(expiresAt).toUTCString();
    const cookieOptions = [
      `${this.config.cookieName}=${token}`,
      `Expires=${expires}`,
      `Max-Age=${Math.floor((expiresAt - Date.now()) / 1000)}`,
      `SameSite=${this.config.sameSitePolicy}`,
      `Path=/`,
    ];

    if (this.config.httpOnly) {
      cookieOptions.push('HttpOnly');
    }

    if (this.config.secure) {
      cookieOptions.push('Secure');
    }

    return cookieOptions.join('; ');
  }

  /**
   * Express 미들웨어 팩토리
   */
  createExpressMiddleware() {
    return (req: any, res: any, next: any) => {
      // CSRF 토큰 생성 및 설정
      if (req.method === 'GET' && !req.session?.csrfToken) {
        const sessionId = req.sessionID || this.generateRandomString(16);
        const { token, expiresAt } = this.generateToken(sessionId);

        req.session.csrfToken = token;
        res.locals.csrfToken = token;

        // 쿠키 설정
        const cookieHeader = this.generateCookieHeader(token, expiresAt);
        res.setHeader('Set-Cookie', cookieHeader);
      }

      // CSRF 토큰 검증
      if (!this.config.excludedMethods.includes(req.method)) {
        const token =
          req.headers[this.config.headerName.toLowerCase()] ||
          req.body[this.config.tokenName] ||
          req.query[this.config.tokenName];

        const sessionId = req.sessionID || '';
        const validation = this.validateToken(token, sessionId, {
          method: req.method,
          origin: req.headers.origin,
          referer: req.headers.referer,
          userAgent: req.headers['user-agent'],
        });

        if (!validation.isValid) {
          return res.status(403).json({
            error: 'CSRF token validation failed',
            details: validation.errors,
          });
        }
      }

      next();
    };
  }

  /**
   * React Hook 용 토큰 제공자
   */
  getTokenForReact(sessionId: string): {
    token: string;
    headerName: string;
    formFieldName: string;
  } {
    const { token } = this.generateToken(sessionId);
    return {
      token,
      headerName: this.config.headerName,
      formFieldName: this.config.tokenName,
    };
  }

  /**
   * CSRF 보호 상태 확인
   */
  getProtectionStatus(): {
    activeTokens: number;
    expiredTokens: number;
    config: CSRFConfig;
    security: {
      sameSiteEnabled: boolean;
      httpsOnly: boolean;
      httpOnlyEnabled: boolean;
    };
  } {
    let expiredTokens = 0;
    const now = Date.now();

    for (const data of this.tokenStore.values()) {
      if (now > data.expiresAt) {
        expiredTokens++;
      }
    }

    return {
      activeTokens: this.tokenStore.size - expiredTokens,
      expiredTokens,
      config: this.config,
      security: {
        sameSiteEnabled: this.config.sameSitePolicy !== 'None',
        httpsOnly: this.config.secure,
        httpOnlyEnabled: this.config.httpOnly,
      },
    };
  }

  /**
   * 뱅킹 특화 CSRF 검증
   */
  validateBankingRequest(
    token: string,
    sessionId: string,
    requestData: {
      method: string;
      path: string;
      amount?: number;
      accountNumber?: string;
      origin?: string;
      userAgent?: string;
    }
  ): CSRFValidationResult & {
    bankingRisk: 'low' | 'medium' | 'high' | 'critical';
    additionalChecks: string[];
  } {
    const baseValidation = this.validateToken(token, sessionId, {
      method: requestData.method,
      origin: requestData.origin,
      userAgent: requestData.userAgent,
    });

    const additionalChecks: string[] = [];
    let bankingRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // 고위험 경로 확인
    const highRiskPaths = ['/transfer', '/payment', '/loan', '/account/close'];
    if (highRiskPaths.some(path => requestData.path.includes(path))) {
      bankingRisk = 'high';
      additionalChecks.push('High-risk banking operation');
    }

    // 큰 금액 거래 확인
    if (requestData.amount && requestData.amount > 1000000) {
      bankingRisk = 'critical';
      additionalChecks.push('Large amount transaction');
    }

    // 계좌번호 유효성 확인
    if (requestData.accountNumber) {
      const accountPattern = /^\d{3,4}-\d{2,6}-\d{6,8}$/;
      if (!accountPattern.test(requestData.accountNumber)) {
        baseValidation.warnings.push('Invalid account number format');
      }
    }

    return {
      ...baseValidation,
      bankingRisk,
      additionalChecks,
    };
  }
}

// 싱글톤 인스턴스
export const csrfProtection = new CSRFProtection();

// 유틸리티 함수들
export const generateCSRFToken = (sessionId: string, options?: CSRFTokenOptions) => {
  return csrfProtection.generateToken(sessionId, options);
};

export const validateCSRFToken = (
  token: string,
  sessionId: string,
  request?: Parameters<typeof csrfProtection.validateToken>[2]
) => {
  return csrfProtection.validateToken(token, sessionId, request);
};

export const createCSRFMiddleware = (config?: Partial<CSRFConfig>) => {
  const protection = new CSRFProtection(config);
  return protection.createExpressMiddleware();
};

export default CSRFProtection;
export type { CSRFTokenOptions, CSRFValidationResult, CSRFConfig };
