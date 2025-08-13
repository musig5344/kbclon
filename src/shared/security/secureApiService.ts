/**
 * Secure API Service for KB StarBanking Clone
 *
 * Provides a secure wrapper around API calls with built-in:
 * - CSRF protection
 * - Input sanitization
 * - Rate limiting
 * - Request/response validation
 * - Security logging
 */
import { safeLog } from '../../utils/errorHandler';

import { CSRFProtection } from './csrfProtection';
import { inputSanitizer, SanitizationOptions } from './inputSanitization';
/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
}
/**
 * Security configuration for API requests
 */
export interface SecurityConfig {
  enableCSRF: boolean;
  enableSanitization: boolean;
  enableRateLimit: boolean;
  rateLimitConfig: RateLimitConfig;
  allowedOrigins: string[];
  sanitizationOptions: SanitizationOptions;
  validateResponses: boolean;
  logSecurityEvents: boolean;
}
/**
 * Request metadata for security tracking
 */
interface RequestMetadata {
  timestamp: number;
  endpoint: string;
  method: string;
  userAgent: string;
  origin: string;
}
/**
 * Rate limiter class
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private blockedIPs: Map<string, number> = new Map();
  isAllowed(identifier: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    // Check if IP is currently blocked
    const blockExpiry = this.blockedIPs.get(identifier);
    if (blockExpiry && now < blockExpiry) {
      return false;
    }
    // Clean expired block
    if (blockExpiry && now >= blockExpiry) {
      this.blockedIPs.delete(identifier);
    }
    // Get request history for this identifier
    const requestHistory = this.requests.get(identifier) || [];
    // Filter out requests outside the time window
    const windowStart = now - config.windowMs;
    const recentRequests = requestHistory.filter(timestamp => timestamp > windowStart);
    // Check if limit exceeded
    if (recentRequests.length >= config.maxRequests) {
      // Block the identifier
      this.blockedIPs.set(identifier, now + config.blockDurationMs);
      safeLog('warn', 'Rate limit exceeded, IP blocked', {
        identifier,
        requestCount: recentRequests.length,
        maxRequests: config.maxRequests,
      });
      return false;
    }
    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }
  getRequestCount(identifier: string, config: RateLimitConfig): number {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const requestHistory = this.requests.get(identifier) || [];
    return requestHistory.filter(timestamp => timestamp > windowStart).length;
  }
  isBlocked(identifier: string): boolean {
    const blockExpiry = this.blockedIPs.get(identifier);
    return blockExpiry ? Date.now() < blockExpiry : false;
  }
  clearHistory(): void {
    this.requests.clear();
    this.blockedIPs.clear();
  }
}
/**
 * Secure API Service class
 */
export class SecureApiService {
  private rateLimiter = new RateLimiter();
  private securityEventCount = 0;
  constructor(private config: SecurityConfig) {
    // Initialize CSRF protection if enabled
    if (config.enableCSRF) {
      CSRFProtection.getToken(); // Initialize token
    }
  }
  /**
   * Make a secure API request
   */
  async request<T = any>(
    url: string,
    options: RequestInit = {},
    metadata?: Partial<RequestMetadata>
  ): Promise<T> {
    const requestStart = Date.now();
    try {
      // Validate and prepare request
      const secureOptions = await this.prepareSecureRequest(url, options, metadata);
      // Make the request
      const response = await fetch(url, secureOptions);
      // Validate response
      await this.validateResponse(response, url);
      // Parse and return response
      const data = await this.parseResponse<T>(response);
      // Log successful request
      if (this.config.logSecurityEvents) {
        safeLog('info', 'Secure API request successful', {
          url,
          method: options.method || 'GET',
          duration: Date.now() - requestStart,
          status: response.status,
        });
      }
      return data;
    } catch (error) {
      this.handleRequestError(error, url, options);
      throw error;
    }
  }
  /**
   * Prepare secure request options
   */
  private async prepareSecureRequest(
    _url: string,
    options: RequestInit,
    metadata?: Partial<RequestMetadata>
  ): Promise<RequestInit> {
    const { method = 'GET', headers = {}, body } = options;
    const secureHeaders: Record<string, string> = { ...(headers as Record<string, string>) };
    // Get request identifier for rate limiting
    const identifier = this.getRequestIdentifier(metadata);
    // Rate limiting check
    if (this.config.enableRateLimit) {
      if (!this.rateLimiter.isAllowed(identifier, this.config.rateLimitConfig)) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
    }
    // Origin validation
    if (this.config.allowedOrigins.length > 0) {
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      if (!this.config.allowedOrigins.includes(currentOrigin)) {
        throw new Error('Request from unauthorized origin');
      }
    }
    // Add CSRF protection
    if (this.config.enableCSRF && method !== 'GET') {
      const csrfHeaders = CSRFProtection.getHeaders();
      Object.assign(secureHeaders, csrfHeaders);
    }
    // Add security headers
    secureHeaders['X-Requested-With'] = 'XMLHttpRequest';
    // Content type for JSON requests
    if (body && typeof body === 'string') {
      secureHeaders['Content-Type'] = 'application/json';
    }
    // Sanitize request body if enabled
    let sanitizedBody = body;
    if (this.config.enableSanitization && body) {
      sanitizedBody = this.sanitizeRequestBody(body);
    }
    return {
      ...options,
      method,
      headers: secureHeaders,
      body: sanitizedBody,
      credentials: 'same-origin', // Important for CSRF protection
      mode: 'cors',
      cache: 'no-cache',
    };
  }
  /**
   * Sanitize request body
   */
  private sanitizeRequestBody(body: any): any {
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        const sanitized = this.sanitizeObject(parsed);
        return JSON.stringify(sanitized);
      } catch {
        // If not JSON, sanitize as string
        return inputSanitizer.sanitize(body, this.config.sanitizationOptions).sanitized;
      }
    }
    if (typeof body === 'object') {
      return JSON.stringify(this.sanitizeObject(body));
    }
    return body;
  }
  /**
   * Recursively sanitize object properties
   */
  private sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    if (typeof obj === 'string') {
      return inputSanitizer.sanitize(obj, this.config.sanitizationOptions).sanitized;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  }
  /**
   * Validate API response
   */
  private async validateResponse(response: Response, url: string): Promise<void> {
    if (!this.config.validateResponses) {
      return;
    }
    // Check response status
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      safeLog('error', 'API request failed', {
        url,
        status: response.status,
        statusText: response.statusText,
      });
      throw error;
    }
    // Validate content type for JSON responses
    const contentType = response.headers.get('content-type');
    if (
      contentType &&
      !contentType.includes('application/json') &&
      !contentType.includes('text/')
    ) {
      safeLog('warn', 'Unexpected content type', { url, contentType });
    }
    // Check for security headers
    const securityHeaders = ['X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection'];
    securityHeaders.forEach(header => {
      if (!response.headers.get(header)) {
        safeLog('warn', `Missing security header: ${header}`, { url });
      }
    });
  }
  /**
   * Parse response with security validation
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const text = await response.text();
      // Validate JSON before parsing
      if (text.length > 10 * 1024 * 1024) {
        // 10MB limit
        throw new Error('Response too large');
      }
      try {
        const data = JSON.parse(text);
        // Sanitize response if enabled
        if (this.config.enableSanitization) {
          return this.sanitizeObject(data);
        }
        return data;
      } catch (error) {
        safeLog('error', 'Failed to parse JSON response', { error });
        throw new Error('Invalid JSON response');
      }
    }
    return response.text() as Promise<T>;
  }
  /**
   * Get request identifier for rate limiting
   */
  private getRequestIdentifier(metadata?: Partial<RequestMetadata>): string {
    if (typeof window !== 'undefined') {
      // In browser, use a combination of origin and user agent
      return `${window.location.origin}_${navigator.userAgent.slice(0, 50)}`;
    }
    return metadata?.origin || 'unknown';
  }
  /**
   * Handle request errors
   */
  private handleRequestError(error: any, url: string, options: RequestInit): void {
    this.securityEventCount++;
    safeLog('error', 'Secure API request failed', {
      error: error.message,
      url,
      method: options.method || 'GET',
      securityEventCount: this.securityEventCount,
    });
  }
  /**
   * Get security statistics
   */
  getSecurityStats() {
    return {
      securityEventCount: this.securityEventCount,
      sanitizationStats: inputSanitizer.getStats(),
      rateLimitStats: {
        // Add rate limit statistics if needed
      },
    };
  }
  /**
   * Reset security statistics
   */
  resetStats(): void {
    this.securityEventCount = 0;
    inputSanitizer.resetStats();
    this.rateLimiter.clearHistory();
  }
}
/**
 * Default security configuration
 */
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  enableCSRF: true,
  enableSanitization: true,
  enableRateLimit: true,
  rateLimitConfig: {
    maxRequests: 100, // 100 requests per window
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 5 * 60 * 1000, // 5 minute block
  },
  allowedOrigins: [], // Will be configured based on environment
  sanitizationOptions: {
    allowHtml: false,
    allowUrls: false,
    stripWhitespace: true,
    strictMode: true,
    maxLength: 10000,
    logViolations: true,
  },
  validateResponses: true,
  logSecurityEvents: true,
};
/**
 * Create a configured secure API service instance
 */
export function createSecureApiService(config: Partial<SecurityConfig> = {}): SecureApiService {
  const mergedConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };
  return new SecureApiService(mergedConfig);
}
export default SecureApiService;
