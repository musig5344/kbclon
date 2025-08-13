/**
 * Advanced Input Sanitization System for KB StarBanking Clone
 * 
 * Provides comprehensive input sanitization to prevent XSS attacks,
 * injection vulnerabilities, and other security threats.
 */
import { safeLog } from '../../utils/errorHandler';
/**
 * Dangerous patterns that should be removed or escaped
 */
const DANGEROUS_PATTERNS = {
  // XSS vectors
  SCRIPT_TAGS: /<script[^>]*>.*?<\/script>/gis,
  EVENT_HANDLERS: /on\w+\s*=\s*["']?[^"']*["']?/gi,
  JAVASCRIPT_PROTOCOL: /javascript:\s*/gi,
  VBSCRIPT_PROTOCOL: /vbscript:\s*/gi,
  DATA_URLS: /data:\s*text\/html/gi,
  // HTML tags that can be dangerous
  IFRAME_TAGS: /<iframe[^>]*>.*?<\/iframe>/gis,
  OBJECT_TAGS: /<object[^>]*>.*?<\/object>/gis,
  EMBED_TAGS: /<embed[^>]*>.*?<\/embed>/gis,
  FORM_TAGS: /<form[^>]*>.*?<\/form>/gis,
  // SQL injection patterns
  SQL_KEYWORDS: /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|TRUNCATE|GRANT|REVOKE)\b/gi,
  SQL_OPERATORS: /(\b(OR|AND|WHERE|FROM|JOIN|HAVING|GROUP BY|ORDER BY)\b|['";]|--|\/\*|\*\/|#)/gi,
  // Path traversal
  PATH_TRAVERSAL: /\.\.[/\\]/g,
  // Command injection
  COMMAND_INJECTION: /[;&|`$(){}[\]]/g
};
/**
 * Characters that need HTML encoding
 */
const HTML_ENCODE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};
/**
 * URL encoding map for special characters
 */
const URL_ENCODE_MAP: Record<string, string> = {
  ' ': '%20',
  '!': '%21',
  '"': '%22',
  '#': '%23',
  '$': '%24',
  '%': '%25',
  '&': '%26',
  "'": '%27',
  '(': '%28',
  ')': '%29',
  '*': '%2A',
  '+': '%2B',
  ',': '%2C',
  '/': '%2F',
  ':': '%3A',
  ';': '%3B',
  '<': '%3C',
  '=': '%3D',
  '>': '%3E',
  '?': '%3F',
  '@': '%40',
  '[': '%5B',
  '\\': '%5C',
  ']': '%5D',
  '^': '%5E',
  '`': '%60',
  '{': '%7B',
  '|': '%7C',
  '}': '%7D',
  '~': '%7E'
};
/**
 * Sanitization options
 */
export interface SanitizationOptions {
  allowHtml?: boolean;
  allowUrls?: boolean;
  maxLength?: number;
  stripWhitespace?: boolean;
  logViolations?: boolean;
  strictMode?: boolean;
}
/**
 * Sanitization result
 */
export interface SanitizationResult {
  sanitized: string;
  violations: string[];
  modified: boolean;
}
/**
 * Input Sanitizer Class
 */
export class InputSanitizer {
  private static instance: InputSanitizer;
  private violationCount = 0;
  static getInstance(): InputSanitizer {
    if (!InputSanitizer.instance) {
      InputSanitizer.instance = new InputSanitizer();
    }
    return InputSanitizer.instance;
  }
  /**
   * Main sanitization method
   */
  sanitize(input: any, options: SanitizationOptions = {}): SanitizationResult {
    // Convert to string if not already
    const stringInput = this.toString(input);
    if (!stringInput) {
      return {
        sanitized: '',
        violations: [],
        modified: false
      };
    }
    const {
      allowHtml = false,
      allowUrls = true,
      maxLength = 10000,
      stripWhitespace = false,
      logViolations = true,
      strictMode = false
    } = options;
    let sanitized = stringInput;
    const violations: string[] = [];
    let modified = false;
    // Length check
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
      violations.push('Input truncated due to length limit');
      modified = true;
    }
    // Whitespace handling
    if (stripWhitespace) {
      const original = sanitized;
      sanitized = sanitized.trim().replace(/\s+/g, ' ');
      if (original !== sanitized) {
        modified = true;
      }
    }
    // XSS protection
    const xssResult = this.removeXSSVectors(sanitized, allowHtml, strictMode);
    sanitized = xssResult.cleaned;
    violations.push(...xssResult.violations);
    if (xssResult.modified) modified = true;
    // SQL injection protection
    const sqlResult = this.removeSQLInjection(sanitized, strictMode);
    sanitized = sqlResult.cleaned;
    violations.push(...sqlResult.violations);
    if (sqlResult.modified) modified = true;
    // URL validation
    if (!allowUrls) {
      const urlResult = this.removeURLs(sanitized);
      sanitized = urlResult.cleaned;
      violations.push(...urlResult.violations);
      if (urlResult.modified) modified = true;
    }
    // Path traversal protection
    const pathResult = this.removePathTraversal(sanitized);
    sanitized = pathResult.cleaned;
    violations.push(...pathResult.violations);
    if (pathResult.modified) modified = true;
    // Command injection protection
    const cmdResult = this.removeCommandInjection(sanitized, strictMode);
    sanitized = cmdResult.cleaned;
    violations.push(...cmdResult.violations);
    if (cmdResult.modified) modified = true;
    // Log violations if enabled
    if (logViolations && violations.length > 0) {
      this.violationCount++;
      safeLog('warn', 'Input sanitization violations detected', {
        violations,
        originalLength: stringInput.length,
        sanitizedLength: sanitized.length,
        violationCount: this.violationCount
      });
    }
    return {
      sanitized,
      violations,
      modified
    };
  }
  /**
   * Convert any input to string safely
   */
  private toString(input: any): string {
    if (input === null || input === undefined) {
      return '';
    }
    if (typeof input === 'string') {
      return input;
    }
    if (typeof input === 'number' || typeof input === 'boolean') {
      return String(input);
    }
    if (typeof input === 'object') {
      try {
        return JSON.stringify(input);
      } catch {
        return '[Object]';
      }
    }
    return String(input);
  }
  /**
   * Remove XSS vectors
   */
  private removeXSSVectors(input: string, allowHtml: boolean, strictMode: boolean): {
    cleaned: string;
    violations: string[];
    modified: boolean;
  } {
    let cleaned = input;
    const violations: string[] = [];
    let modified = false;
    // Remove dangerous patterns
    Object.entries(DANGEROUS_PATTERNS).forEach(([name, pattern]) => {
      if (name.includes('SCRIPT') || name.includes('EVENT') || name.includes('PROTOCOL')) {
        const matches = cleaned.match(pattern);
        if (matches) {
          cleaned = cleaned.replace(pattern, '');
          violations.push(`Removed ${name}: ${matches.length} instances`);
          modified = true;
        }
      }
    });
    // HTML encoding if HTML is not allowed
    if (!allowHtml || strictMode) {
      const original = cleaned;
      cleaned = this.htmlEncode(cleaned);
      if (original !== cleaned) {
        violations.push('HTML entities encoded');
        modified = true;
      }
    }
    return { cleaned, violations, modified };
  }
  /**
   * Remove SQL injection vectors
   */
  private removeSQLInjection(input: string, strictMode: boolean): {
    cleaned: string;
    violations: string[];
    modified: boolean;
  } {
    let cleaned = input;
    const violations: string[] = [];
    let modified = false;
    // Check for SQL keywords
    const sqlKeywordMatches = cleaned.match(DANGEROUS_PATTERNS.SQL_KEYWORDS);
    if (sqlKeywordMatches) {
      if (strictMode) {
        cleaned = cleaned.replace(DANGEROUS_PATTERNS.SQL_KEYWORDS, '***');
        violations.push(`Removed SQL keywords: ${sqlKeywordMatches.length} instances`);
        modified = true;
      } else {
        violations.push(`SQL keywords detected: ${sqlKeywordMatches.join(', ')}`);
      }
    }
    // Check for SQL operators
    const sqlOperatorMatches = cleaned.match(DANGEROUS_PATTERNS.SQL_OPERATORS);
    if (sqlOperatorMatches) {
      cleaned = cleaned.replace(DANGEROUS_PATTERNS.SQL_OPERATORS, '');
      violations.push(`Removed SQL operators: ${sqlOperatorMatches.length} instances`);
      modified = true;
    }
    return { cleaned, violations, modified };
  }
  /**
   * Remove URLs
   */
  private removeURLs(input: string): {
    cleaned: string;
    violations: string[];
    modified: boolean;
  } {
    const urlPattern = /https?:\/\/[^\s]+|www\.[^\s]+/gi;
    const matches = input.match(urlPattern);
    if (matches) {
      return {
        cleaned: input.replace(urlPattern, '[URL_REMOVED]'),
        violations: [`Removed URLs: ${matches.length} instances`],
        modified: true
      };
    }
    return { cleaned: input, violations: [], modified: false };
  }
  /**
   * Remove path traversal
   */
  private removePathTraversal(input: string): {
    cleaned: string;
    violations: string[];
    modified: boolean;
  } {
    const matches = input.match(DANGEROUS_PATTERNS.PATH_TRAVERSAL);
    if (matches) {
      return {
        cleaned: input.replace(DANGEROUS_PATTERNS.PATH_TRAVERSAL, ''),
        violations: [`Removed path traversal: ${matches.length} instances`],
        modified: true
      };
    }
    return { cleaned: input, violations: [], modified: false };
  }
  /**
   * Remove command injection vectors
   */
  private removeCommandInjection(input: string, strictMode: boolean): {
    cleaned: string;
    violations: string[];
    modified: boolean;
  } {
    if (!strictMode) {
      return { cleaned: input, violations: [], modified: false };
    }
    const matches = input.match(DANGEROUS_PATTERNS.COMMAND_INJECTION);
    if (matches) {
      return {
        cleaned: input.replace(DANGEROUS_PATTERNS.COMMAND_INJECTION, ''),
        violations: [`Removed command injection chars: ${matches.length} instances`],
        modified: true
      };
    }
    return { cleaned: input, violations: [], modified: false };
  }
  /**
   * HTML encode dangerous characters
   */
  private htmlEncode(input: string): string {
    return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENCODE_MAP[char] || char);
  }
  /**
   * URL encode string
   */
  urlEncode(input: string): string {
    return input.replace(/[^A-Za-z0-9\-_.~]/g, (char) => {
      return URL_ENCODE_MAP[char] || encodeURIComponent(char);
    });
  }
  /**
   * Get sanitization statistics
   */
  getStats(): { violationCount: number } {
    return { violationCount: this.violationCount };
  }
  /**
   * Reset statistics
   */
  resetStats(): void {
    this.violationCount = 0;
  }
}
// Export singleton instance
export const inputSanitizer = InputSanitizer.getInstance();
/**
 * Convenience functions
 */
export function sanitizeInput(input: any, options?: SanitizationOptions): string {
  return inputSanitizer.sanitize(input, options).sanitized;
}
export function sanitizeInputWithResult(input: any, options?: SanitizationOptions): SanitizationResult {
  return inputSanitizer.sanitize(input, options);
}
export function sanitizeHtml(input: string): string {
  return inputSanitizer.sanitize(input, { allowHtml: false, strictMode: true }).sanitized;
}
export function sanitizeUrl(input: string): string {
  return inputSanitizer.urlEncode(input);
}
export function sanitizeUserInput(input: string): string {
  return inputSanitizer.sanitize(input, {
    allowHtml: false,
    allowUrls: false,
    stripWhitespace: true,
    strictMode: true,
    maxLength: 1000
  }).sanitized;
}
export default inputSanitizer;