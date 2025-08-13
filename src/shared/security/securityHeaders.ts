/**
 * Security Headers Configuration for KB StarBanking Clone
 * 
 * Provides Content Security Policy (CSP) and other security headers
 * to protect against XSS, clickjacking, and other attacks.
 */
import { safeLog } from '../../utils/errorHandler';
/**
 * Content Security Policy configuration
 */
export interface CSPConfig {
  defaultSrc: string[];
  scriptSrc: string[];
  styleSrc: string[];
  imgSrc: string[];
  connectSrc: string[];
  fontSrc: string[];
  objectSrc: string[];
  mediaSrc: string[];
  frameSrc: string[];
  childSrc: string[];
  manifestSrc: string[];
  workerSrc: string[];
  formAction: string[];
  frameAncestors: string[];
  upgradeInsecureRequests: boolean;
  blockAllMixedContent: boolean;
}
/**
 * Security headers configuration
 */
export interface SecurityHeadersConfig {
  csp: CSPConfig;
  hsts: {
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  frameOptions: 'DENY' | 'SAMEORIGIN' | string;
  contentTypeOptions: boolean;
  xssProtection: {
    enabled: boolean;
    mode: 'block' | 'report';
    reportUri?: string;
  };
  referrerPolicy: string;
  permissionsPolicy: Record<string, string[]>;
}
/**
 * Default CSP configuration for banking application
 */
const DEFAULT_CSP_CONFIG: CSPConfig = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'", // Required for React development
    "https://apis.google.com",
    "https://www.google.com"
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'", // Required for styled-components
    "https://fonts.googleapis.com"
  ],
  imgSrc: [
    "'self'",
    "data:",
    "blob:",
    "https:",
    "https://ssl.gstatic.com",
    "https://www.gstatic.com"
  ],
  connectSrc: [
    "'self'",
    "https://api.exchangerate-api.com", // External exchange rate API
    "wss://realtime.supabase.co", // Supabase realtime
    "https://*.supabase.co" // Supabase API
  ],
  fontSrc: [
    "'self'",
    "data:",
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com"
  ],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  frameSrc: ["'none'"],
  childSrc: ["'none'"],
  manifestSrc: ["'self'"],
  workerSrc: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  upgradeInsecureRequests: true,
  blockAllMixedContent: true
};
/**
 * Default security headers configuration
 */
const DEFAULT_SECURITY_HEADERS: SecurityHeadersConfig = {
  csp: DEFAULT_CSP_CONFIG,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameOptions: 'DENY',
  contentTypeOptions: true,
  xssProtection: {
    enabled: true,
    mode: 'block'
  },
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: {
    camera: ["'none'"],
    microphone: ["'none'"],
    geolocation: ["'none'"],
    gyroscope: ["'none'"],
    magnetometer: ["'none'"],
    payment: ["'self'"],
    usb: ["'none'"],
    'web-share': ["'self'"]
  }
};
/**
 * Security Headers Manager
 */
export class SecurityHeadersManager {
  private config: SecurityHeadersConfig;
  constructor(config: Partial<SecurityHeadersConfig> = {}) {
    this.config = this.mergeConfig(DEFAULT_SECURITY_HEADERS, config);
  }
  /**
   * Generate Content Security Policy string
   */
  generateCSP(): string {
    const { csp } = this.config;
    const directives: string[] = [];
    // Add all CSP directives
    if (csp.defaultSrc.length > 0) {
      directives.push(`default-src ${csp.defaultSrc.join(' ')}`);
    }
    if (csp.scriptSrc.length > 0) {
      directives.push(`script-src ${csp.scriptSrc.join(' ')}`);
    }
    if (csp.styleSrc.length > 0) {
      directives.push(`style-src ${csp.styleSrc.join(' ')}`);
    }
    if (csp.imgSrc.length > 0) {
      directives.push(`img-src ${csp.imgSrc.join(' ')}`);
    }
    if (csp.connectSrc.length > 0) {
      directives.push(`connect-src ${csp.connectSrc.join(' ')}`);
    }
    if (csp.fontSrc.length > 0) {
      directives.push(`font-src ${csp.fontSrc.join(' ')}`);
    }
    if (csp.objectSrc.length > 0) {
      directives.push(`object-src ${csp.objectSrc.join(' ')}`);
    }
    if (csp.mediaSrc.length > 0) {
      directives.push(`media-src ${csp.mediaSrc.join(' ')}`);
    }
    if (csp.frameSrc.length > 0) {
      directives.push(`frame-src ${csp.frameSrc.join(' ')}`);
    }
    if (csp.childSrc.length > 0) {
      directives.push(`child-src ${csp.childSrc.join(' ')}`);
    }
    if (csp.manifestSrc.length > 0) {
      directives.push(`manifest-src ${csp.manifestSrc.join(' ')}`);
    }
    if (csp.workerSrc.length > 0) {
      directives.push(`worker-src ${csp.workerSrc.join(' ')}`);
    }
    if (csp.formAction.length > 0) {
      directives.push(`form-action ${csp.formAction.join(' ')}`);
    }
    if (csp.frameAncestors.length > 0) {
      directives.push(`frame-ancestors ${csp.frameAncestors.join(' ')}`);
    }
    // Add boolean directives
    if (csp.upgradeInsecureRequests) {
      directives.push('upgrade-insecure-requests');
    }
    if (csp.blockAllMixedContent) {
      directives.push('block-all-mixed-content');
    }
    return directives.join('; ');
  }
  /**
   * Generate Strict-Transport-Security header
   */
  generateHSTS(): string {
    const { hsts } = this.config;
    let header = `max-age=${hsts.maxAge}`;
    if (hsts.includeSubDomains) {
      header += '; includeSubDomains';
    }
    if (hsts.preload) {
      header += '; preload';
    }
    return header;
  }
  /**
   * Generate Permissions Policy header
   */
  generatePermissionsPolicy(): string {
    const { permissionsPolicy } = this.config;
    const policies: string[] = [];
    Object.entries(permissionsPolicy).forEach(([feature, allowlist]) => {
      if (allowlist.length === 0 || (allowlist.length === 1 && allowlist[0] === "'none'")) {
        policies.push(`${feature}=()`);
      } else {
        policies.push(`${feature}=(${allowlist.join(' ')})`);
      }
    });
    return policies.join(', ');
  }
  /**
   * Get all security headers as object
   */
  getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    // Content Security Policy
    headers['Content-Security-Policy'] = this.generateCSP();
    // HTTP Strict Transport Security
    headers['Strict-Transport-Security'] = this.generateHSTS();
    // X-Frame-Options
    headers['X-Frame-Options'] = this.config.frameOptions;
    // X-Content-Type-Options
    if (this.config.contentTypeOptions) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }
    // X-XSS-Protection
    const { xssProtection } = this.config;
    if (xssProtection.enabled) {
      let value = '1';
      if (xssProtection.mode === 'block') {
        value += '; mode=block';
      }
      if (xssProtection.reportUri) {
        value += `; report=${xssProtection.reportUri}`;
      }
      headers['X-XSS-Protection'] = value;
    }
    // Referrer Policy
    headers['Referrer-Policy'] = this.config.referrerPolicy;
    // Permissions Policy
    headers['Permissions-Policy'] = this.generatePermissionsPolicy();
    return headers;
  }
  /**
   * Get headers for meta tags (HTML)
   */
  getMetaTags(): Array<{ httpEquiv?: string; name?: string; content: string }> {
    const headers = this.getHeaders();
    const metaTags: Array<{ httpEquiv?: string; name?: string; content: string }> = [];
    // Convert headers to meta tags
    Object.entries(headers).forEach(([name, content]) => {
      metaTags.push({
        httpEquiv: name,
        content
      });
    });
    return metaTags;
  }
  /**
   * Apply security headers to response (for server-side)
   */
  applyToResponse(response: any): void {
    const headers = this.getHeaders();
    Object.entries(headers).forEach(([name, value]) => {
      response.setHeader(name, value);
    });
  }
  /**
   * Validate current page against CSP
   */
  validateCSP(): boolean {
    if (typeof window === 'undefined') {
      return true; // Server-side
    }
    try {
      // Check if CSP is properly set
      const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!metaCSP) {
        safeLog('warn', 'Content Security Policy not found in meta tags');
        return false;
      }
      // Basic validation that CSP exists and is not empty
      const content = metaCSP.getAttribute('content');
      if (!content || content.trim().length === 0) {
        safeLog('warn', 'Content Security Policy is empty');
        return false;
      }
      safeLog('info', 'Content Security Policy validation passed');
      return true;
    } catch (error) {
      safeLog('error', 'CSP validation failed', error);
      return false;
    }
  }
  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SecurityHeadersConfig>): void {
    this.config = this.mergeConfig(this.config, newConfig);
    safeLog('info', 'Security headers configuration updated');
  }
  /**
   * Merge configurations
   */
  private mergeConfig(
    base: SecurityHeadersConfig,
    override: Partial<SecurityHeadersConfig>
  ): SecurityHeadersConfig {
    return {
      ...base,
      ...override,
      csp: {
        ...base.csp,
        ...override.csp
      },
      hsts: {
        ...base.hsts,
        ...override.hsts
      },
      xssProtection: {
        ...base.xssProtection,
        ...override.xssProtection
      },
      permissionsPolicy: {
        ...base.permissionsPolicy,
        ...override.permissionsPolicy
      }
    };
  }
}
/**
 * Global security headers manager instance
 */
export const securityHeaders = new SecurityHeadersManager();
/**
 * Initialize security headers based on environment
 */
export function initializeSecurityHeaders(environment: 'development' | 'production'): void {
  if (environment === 'development') {
    // More relaxed CSP for development
    securityHeaders.updateConfig({
      csp: {
        ...DEFAULT_CSP_CONFIG,
        scriptSrc: [...DEFAULT_CSP_CONFIG.scriptSrc, "'unsafe-eval'"], // Allow eval for dev tools
        connectSrc: [...DEFAULT_CSP_CONFIG.connectSrc, 'ws://localhost:*', 'http://localhost:*']
      }
    });
  }
  // Validate configuration
  securityHeaders.validateCSP();
  safeLog('info', 'Security headers initialized', { environment });
}
export default SecurityHeadersManager;