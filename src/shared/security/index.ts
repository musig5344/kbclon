/**
 * Security Module Index for KB StarBanking Clone
 * 
 * Exports all security-related components, utilities, and configurations
 * for comprehensive protection against XSS, CSRF, and other threats.
 */
import { initializeCSRFProtection, useCSRFProtection } from './csrfProtection';
import CSRFProtection from './csrfProtection';
import { sanitizeUserInput } from './inputSanitization';
import { initializeSecurityConfig, securityConfig } from './securityConfig';
import { initializeSecurityHeaders } from './securityHeaders';

import type { Environment, SecurityLevel, SecurityConfiguration } from './securityConfig';
// CSRF Protection
export { 
  default as CSRFProtection,
  useCSRFProtection,
  withCSRFProtection,
  validateOrigin,
  initializeCSRFProtection
} from './csrfProtection';
export type { CSRFConfig } from './csrfProtection';
// Input Sanitization
export {
  default as inputSanitizer,
  InputSanitizer,
  sanitizeInput,
  sanitizeInputWithResult,
  sanitizeHtml,
  sanitizeUrl,
  sanitizeUserInput
} from './inputSanitization';
export type { SanitizationOptions, SanitizationResult } from './inputSanitization';
// Secure API Service
export {
  default as SecureApiService,
  createSecureApiService,
  DEFAULT_SECURITY_CONFIG
} from './secureApiService';
export type { SecurityConfig } from './secureApiService';
// Security Headers
export {
  default as SecurityHeadersManager,
  securityHeaders,
  initializeSecurityHeaders
} from './securityHeaders';
export type { CSPConfig, SecurityHeadersConfig } from './securityHeaders';
// Security Configuration
export {
  default as SecurityConfigManager,
  securityConfig,
  initializeSecurityConfig
} from './securityConfig';
export type { 
  Environment, 
  SecurityLevel, 
  SecurityConfiguration 
} from './securityConfig';
/**
 * Complete security initialization function
 * Call this once during app startup to initialize all security measures
 */
export function initializeSecurity(options: {
  environment?: Environment;
  securityLevel?: SecurityLevel;
  allowedOrigins?: string[];
  customConfig?: Partial<SecurityConfiguration>;
} = {}) {
  const {
    environment = 'development',
    securityLevel = 'medium',
    allowedOrigins = [],
    customConfig = {}
  } = options;
  try {
    // Initialize security configuration
    const configManager = initializeSecurityConfig(environment, securityLevel, customConfig);
    // Initialize CSRF protection
    initializeCSRFProtection({
      allowedOrigins,
      strictMode: configManager.getConfig().csrf.strictOriginValidation,
      autoInject: true
    });
    // Initialize security headers
    const headerEnvironment = environment === 'testing' ? 'development' : environment as 'development' | 'production';
    initializeSecurityHeaders(headerEnvironment);
    if (process.env.NODE_ENV === 'development') {
      console.log('Security initialized:', {
        environment,
        securityLevel,
        features: {
          csrf: configManager.getConfig().csrf.enabled,
          inputValidation: configManager.getConfig().inputValidation.enabled,
          rateLimit: configManager.getConfig().rateLimit.enabled,
          csp: configManager.getConfig().csp.enabled
        }
      });
    }
    return configManager;
  } catch (error) {
    throw error;
  }
}
/**
 * Security utilities for common tasks
 */
export const SecurityUtils = {
  /**
   * Sanitize user input with banking-grade security
   */
  sanitizeBankingInput(input: string): string {
    return sanitizeUserInput(input);
  },
  /**
   * Validate and sanitize form data
   */
  sanitizeFormData(formData: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeUserInput(value);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? sanitizeUserInput(item) : item
        );
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  },
  /**
   * Get secure headers for API requests
   */
  getSecureHeaders(): Record<string, string> {
    return {
      ...CSRFProtection.getHeaders(),
      'X-Requested-With': 'XMLHttpRequest',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
  },
  /**
   * Validate if current environment is secure for banking operations
   */
  validateSecureEnvironment(): boolean {
    if (typeof window === 'undefined') return true;
    const issues: string[] = [];
    // Check HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      issues.push('Not using HTTPS');
    }
    // Check for development tools
    if (window.console && typeof window.console.clear === 'function') {
      try {
        const start = performance.now();
        debugger; // This will pause in dev tools
        const end = performance.now();
        if (end - start > 100) {
          issues.push('Developer tools detected');
        }
      } catch {
        // Developer tools might be open
      }
    }
    // Check CSP
    const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!metaCSP) {
      issues.push('Content Security Policy not found');
    }
    if (issues.length > 0) {
      return false;
    }
    return true;
  },
  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },
  /**
   * Constant-time string comparison
   */
  constantTimeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
};
/**
 * React hook for comprehensive security
 */
export function useSecurity() {
  const csrfProtection = useCSRFProtection();
  const config = securityConfig.getConfig();
  return {
    // CSRF protection
    csrfToken: csrfProtection.token,
    csrfHeaders: csrfProtection.headers,
    csrfHiddenInput: csrfProtection.hiddenInput,
    // Configuration
    securityConfig: config,
    isFeatureEnabled: (feature: keyof typeof config.features) => 
      securityConfig.isFeatureEnabled(feature),
    // Utilities
    sanitizeInput: SecurityUtils.sanitizeBankingInput,
    sanitizeFormData: SecurityUtils.sanitizeFormData,
    getSecureHeaders: SecurityUtils.getSecureHeaders,
    validateEnvironment: SecurityUtils.validateSecureEnvironment,
    // Security status
    securityLevel: config.securityLevel,
    environment: config.environment
  };
}
const securityModule = {
  initializeSecurity,
  SecurityUtils,
  useSecurity
};
export default securityModule;