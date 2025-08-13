/**
 * CSRF Protection System for KB StarBanking Clone
 * 
 * Implements comprehensive CSRF (Cross-Site Request Forgery) protection
 * including token generation, validation, and automatic header injection.
 */
import { safeLog } from '../../utils/errorHandler';
const CSRF_TOKEN_KEY = 'kb_csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
/**
 * Generates a cryptographically secure random token
 */
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
/**
 * Validates that a token is in the correct format
 */
function isValidTokenFormat(token: string): boolean {
  return typeof token === 'string' && 
         token.length === 64 && 
         /^[a-f0-9]+$/.test(token);
}
/**
 * CSRF Token Manager
 */
class CSRFTokenManager {
  private token: string | null = null;
  private tokenTimestamp: number = 0;
  private readonly TOKEN_LIFETIME = 60 * 60 * 1000; // 1 hour
  /**
   * Gets the current CSRF token, generating a new one if needed
   */
  getToken(): string {
    const now = Date.now();
    // Check if we need a new token
    if (!this.token || 
        !isValidTokenFormat(this.token) || 
        (now - this.tokenTimestamp) > this.TOKEN_LIFETIME) {
      this.generateNewToken();
    }
    return this.token!;
  }
  /**
   * Generates and stores a new CSRF token
   */
  private generateNewToken(): void {
    try {
      this.token = generateSecureToken();
      this.tokenTimestamp = Date.now();
      // Store in sessionStorage (not localStorage for security)
      sessionStorage.setItem(CSRF_TOKEN_KEY, JSON.stringify({
        token: this.token,
        timestamp: this.tokenTimestamp
      }));
      safeLog('info', 'CSRF token generated', { tokenLength: this.token.length });
    } catch (error) {
      safeLog('error', 'Failed to generate CSRF token', error);
      throw new Error('CSRF token generation failed');
    }
  }
  /**
   * Validates a CSRF token
   */
  validateToken(token: string): boolean {
    if (!token || !this.token) {
      return false;
    }
    // Constant-time comparison to prevent timing attacks
    if (token.length !== this.token.length) {
      return false;
    }
    let result = 0;
    for (let i = 0; i < token.length; i++) {
      result |= token.charCodeAt(i) ^ this.token.charCodeAt(i);
    }
    return result === 0;
  }
  /**
   * Clears the current token (for logout)
   */
  clearToken(): void {
    this.token = null;
    this.tokenTimestamp = 0;
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
    safeLog('info', 'CSRF token cleared');
  }
  /**
   * Restores token from storage on page load
   */
  restoreFromStorage(): void {
    try {
      const stored = sessionStorage.getItem(CSRF_TOKEN_KEY);
      if (stored) {
        const { token, timestamp } = JSON.parse(stored);
        const now = Date.now();
        // Check if stored token is still valid
        if (isValidTokenFormat(token) && 
            (now - timestamp) < this.TOKEN_LIFETIME) {
          this.token = token;
          this.tokenTimestamp = timestamp;
          safeLog('info', 'CSRF token restored from storage');
        } else {
          // Stored token is invalid or expired
          sessionStorage.removeItem(CSRF_TOKEN_KEY);
          this.generateNewToken();
        }
      }
    } catch (error) {
      safeLog('error', 'Failed to restore CSRF token', error);
      this.generateNewToken();
    }
  }
}
// Singleton instance
const csrfManager = new CSRFTokenManager();
// Initialize on module load
csrfManager.restoreFromStorage();
/**
 * Public API for CSRF protection
 */
export const CSRFProtection = {
  /**
   * Gets the current CSRF token
   */
  getToken(): string {
    return csrfManager.getToken();
  },
  /**
   * Gets CSRF headers for API requests
   */
  getHeaders(): Record<string, string> {
    return {
      [CSRF_HEADER_NAME]: csrfManager.getToken()
    };
  },
  /**
   * Validates a CSRF token
   */
  validateToken(token: string): boolean {
    return csrfManager.validateToken(token);
  },
  /**
   * Clears the CSRF token (call on logout)
   */
  clearToken(): void {
    csrfManager.clearToken();
  },
  /**
   * Gets the CSRF header name
   */
  getHeaderName(): string {
    return CSRF_HEADER_NAME;
  }
};
/**
 * React hook for CSRF protection in forms
 */
export function useCSRFProtection() {
  const token = csrfManager.getToken();
  return {
    token,
    headers: CSRFProtection.getHeaders(),
    hiddenInput: {
      type: 'hidden' as const,
      name: 'csrf_token',
      value: token
    }
  };
}
/**
 * Higher-order function to add CSRF protection to fetch requests
 */
export function withCSRFProtection<T extends (...args: any[]) => Promise<any>>(
  fetchFunction: T
): T {
  return (async (...args: any[]) => {
    const [url, options = {}, ...restArgs] = args;
    // Add CSRF headers to the request
    const csrfHeaders = CSRFProtection.getHeaders();
    const enhancedOptions = {
      ...options,
      headers: {
        ...options.headers,
        ...csrfHeaders
      }
    };
    return fetchFunction(url, enhancedOptions, ...restArgs);
  }) as T;
}
/**
 * Origin validation for additional CSRF protection
 */
export function validateOrigin(allowedOrigins: string[]): boolean {
  if (typeof window === 'undefined') {
    return true; // Server-side rendering
  }
  const currentOrigin = window.location.origin;
  const referrer = document.referrer;
  // Check current origin
  if (!allowedOrigins.includes(currentOrigin)) {
    safeLog('error', 'Invalid origin detected', { currentOrigin, allowedOrigins });
    return false;
  }
  // Check referrer if available
  if (referrer) {
    try {
      const referrerOrigin = new URL(referrer).origin;
      if (!allowedOrigins.includes(referrerOrigin)) {
        safeLog('error', 'Invalid referrer detected', { referrer, allowedOrigins });
        return false;
      }
    } catch (error) {
      safeLog('error', 'Invalid referrer URL', { referrer });
      return false;
    }
  }
  return true;
}
/**
 * Configuration for CSRF protection
 */
export interface CSRFConfig {
  allowedOrigins: string[];
  strictMode: boolean;
  autoInject: boolean;
}
/**
 * Initialize CSRF protection with configuration
 */
export function initializeCSRFProtection(config: CSRFConfig): void {
  const { allowedOrigins, strictMode } = config;
  // Validate current origin
  if (strictMode && !validateOrigin(allowedOrigins)) {
    throw new Error('CSRF protection: Invalid origin detected');
  }
  // Set up automatic token refresh
  setInterval(() => {
    csrfManager.getToken(); // This will refresh if needed
  }, 30 * 60 * 1000); // Check every 30 minutes
  safeLog('info', 'CSRF protection initialized', { 
    allowedOrigins: allowedOrigins.length,
    strictMode 
  });
}
export default CSRFProtection;