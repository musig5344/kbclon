/**
 * Content Security Policy (CSP) Manager for KB StarBanking
 * Implements comprehensive security headers for financial applications
 */

export interface CSPDirective {
  name: string;
  values: string[];
  description: string;
  required: boolean;
}

export interface CSPConfig {
  environment: 'development' | 'staging' | 'production';
  enforceMode: boolean;
  reportUri?: string;
  reportTo?: string;
  enableHSTS?: boolean;
  enableNonce?: boolean;
  enableHashSources?: boolean;
}

export class CSPManager {
  private config: CSPConfig;
  private nonce: string | null = null;
  private hashSources: Set<string> = new Set();

  constructor(config: CSPConfig) {
    this.config = config;
    this.generateNonce();
  }

  private generateNonce(): void {
    if (this.config.enableNonce) {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      this.nonce = btoa(String.fromCharCode(...array));
    }
  }

  public getNonce(): string | null {
    return this.nonce;
  }

  public addHashSource(script: string): void {
    if (this.config.enableHashSources) {
      const encoder = new TextEncoder();
      const data = encoder.encode(script);
      crypto.subtle.digest('SHA-256', data).then(hashBuffer => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        this.hashSources.add(`'sha256-${btoa(hashHex)}'`);
      });
    }
  }

  private getBaseDirectives(): CSPDirective[] {
    return [
      {
        name: 'default-src',
        values: ["'self'"],
        description: 'Default policy for fetching resources',
        required: true,
      },
      {
        name: 'script-src',
        values: this.getScriptSources(),
        description: 'Controls which scripts can be executed',
        required: true,
      },
      {
        name: 'style-src',
        values: this.getStyleSources(),
        description: 'Controls which stylesheets can be applied',
        required: true,
      },
      {
        name: 'img-src',
        values: this.getImageSources(),
        description: 'Controls which images can be loaded',
        required: true,
      },
      {
        name: 'connect-src',
        values: this.getConnectSources(),
        description: 'Controls which servers can be connected to',
        required: true,
      },
      {
        name: 'font-src',
        values: this.getFontSources(),
        description: 'Controls which fonts can be loaded',
        required: true,
      },
      {
        name: 'media-src',
        values: this.getMediaSources(),
        description: 'Controls which media files can be loaded',
        required: true,
      },
      {
        name: 'frame-src',
        values: this.getFrameSources(),
        description: 'Controls which frames can be embedded',
        required: true,
      },
      {
        name: 'worker-src',
        values: this.getWorkerSources(),
        description: 'Controls which workers can be created',
        required: true,
      },
      {
        name: 'manifest-src',
        values: ["'self'"],
        description: 'Controls which manifest files can be loaded',
        required: true,
      },
    ];
  }

  private getSecurityDirectives(): CSPDirective[] {
    return [
      {
        name: 'base-uri',
        values: ["'self'"],
        description: 'Restricts the base URI for relative URLs',
        required: true,
      },
      {
        name: 'form-action',
        values: this.getFormActionSources(),
        description: 'Controls which URLs can be used as form targets',
        required: true,
      },
      {
        name: 'frame-ancestors',
        values: ["'none'"],
        description: 'Controls which parents can embed this page in frames',
        required: true,
      },
      {
        name: 'object-src',
        values: ["'none'"],
        description: 'Controls which plugins can be loaded',
        required: true,
      },
      {
        name: 'upgrade-insecure-requests',
        values: [],
        description: 'Upgrades HTTP requests to HTTPS',
        required: this.config.environment === 'production',
      },
      {
        name: 'block-all-mixed-content',
        values: [],
        description: 'Blocks mixed content (HTTP on HTTPS pages)',
        required: this.config.environment === 'production',
      },
    ];
  }

  private getBankingSecurityDirectives(): CSPDirective[] {
    return [
      {
        name: 'require-trusted-types-for',
        values: ["'script'"],
        description: 'Requires Trusted Types for script execution',
        required: this.config.environment === 'production',
      },
      {
        name: 'trusted-types',
        values: ['kb-banking-policy', 'default'],
        description: 'Defines allowed Trusted Types policies',
        required: this.config.environment === 'production',
      },
    ];
  }

  private getScriptSources(): string[] {
    const sources = ["'self'"];
    
    if (this.config.enableNonce && this.nonce) {
      sources.push(`'nonce-${this.nonce}'`);
    }

    if (this.config.enableHashSources) {
      sources.push(...Array.from(this.hashSources));
    }

    // Banking specific domains
    if (this.config.environment === 'development') {
      sources.push("'unsafe-eval'"); // For development tools
      sources.push('https://localhost:*');
      sources.push('ws://localhost:*');
    }

    // CDN and third-party services
    sources.push('https://cdn.jsdelivr.net');
    sources.push('https://unpkg.com');
    
    // Analytics (if needed)
    if (this.config.environment === 'production') {
      // Add analytics domains if required
      // sources.push('https://www.google-analytics.com');
    }

    return sources;
  }

  private getStyleSources(): string[] {
    const sources = ["'self'"];

    if (this.config.enableNonce && this.nonce) {
      sources.push(`'nonce-${this.nonce}'`);
    }

    // For styled-components and CSS-in-JS
    sources.push("'unsafe-inline'"); // Note: Consider using nonces instead in production

    // Font and icon libraries
    sources.push('https://fonts.googleapis.com');
    sources.push('https://cdn.jsdelivr.net');
    sources.push('https://unpkg.com');

    return sources;
  }

  private getImageSources(): string[] {
    const sources = ["'self'", 'data:', 'blob:'];

    // KB Bank official domains
    sources.push('https://*.kbstar.com');
    sources.push('https://*.kb.co.kr');

    // CDN for images
    sources.push('https://cdn.jsdelivr.net');
    sources.push('https://unpkg.com');

    // Base64 encoded images
    sources.push('data:');

    return sources;
  }

  private getConnectSources(): string[] {
    const sources = ["'self'"];

    // API endpoints
    if (this.config.environment === 'development') {
      sources.push('http://localhost:*');
      sources.push('https://localhost:*');
      sources.push('ws://localhost:*');
      sources.push('wss://localhost:*');
    }

    // KB Bank API endpoints
    sources.push('https://api.kbstar.com');
    sources.push('https://openapi.kbstar.com');
    sources.push('https://*.kb.co.kr');

    // WebSocket connections for real-time updates
    sources.push('wss://*.kbstar.com');
    sources.push('wss://*.kb.co.kr');

    // Push notification services
    sources.push('https://fcm.googleapis.com');
    sources.push('https://android.googleapis.com');

    return sources;
  }

  private getFontSources(): string[] {
    const sources = ["'self'"];

    // Google Fonts
    sources.push('https://fonts.gstatic.com');
    sources.push('https://fonts.googleapis.com');

    // CDN fonts
    sources.push('https://cdn.jsdelivr.net');
    sources.push('https://unpkg.com');

    // Data URIs for embedded fonts
    sources.push('data:');

    return sources;
  }

  private getMediaSources(): string[] {
    const sources = ["'self'"];

    // KB Bank media domains
    sources.push('https://*.kbstar.com');
    sources.push('https://*.kb.co.kr');

    // Blob URLs for media processing
    sources.push('blob:');

    return sources;
  }

  private getFrameSources(): string[] {
    const sources: string[] = [];

    // Payment gateways (if needed)
    // sources.push('https://pg.kbstar.com');

    // Embedded maps or widgets
    // sources.push('https://maps.google.com');

    // For development only
    if (this.config.environment === 'development') {
      sources.push("'self'");
    }

    return sources.length > 0 ? sources : ["'none'"];
  }

  private getWorkerSources(): string[] {
    const sources = ["'self'"];

    // Blob URLs for Web Workers
    sources.push('blob:');

    return sources;
  }

  private getFormActionSources(): string[] {
    const sources = ["'self'"];

    // KB Bank form endpoints
    sources.push('https://*.kbstar.com');
    sources.push('https://*.kb.co.kr');

    return sources;
  }

  public generateCSPHeader(): string {
    const allDirectives = [
      ...this.getBaseDirectives(),
      ...this.getSecurityDirectives(),
      ...this.getBankingSecurityDirectives(),
    ];

    const policyParts: string[] = [];

    allDirectives.forEach(directive => {
      if (!directive.required && this.config.environment === 'development') {
        return; // Skip optional directives in development
      }

      if (directive.values.length === 0) {
        policyParts.push(directive.name);
      } else {
        policyParts.push(`${directive.name} ${directive.values.join(' ')}`);
      }
    });

    // Add report URI if configured
    if (this.config.reportUri) {
      policyParts.push(`report-uri ${this.config.reportUri}`);
    }

    if (this.config.reportTo) {
      policyParts.push(`report-to ${this.config.reportTo}`);
    }

    return policyParts.join('; ');
  }

  public generateAdditionalSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    // Strict Transport Security
    if (this.config.enableHSTS && this.config.environment === 'production') {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
    }

    // X-Content-Type-Options
    headers['X-Content-Type-Options'] = 'nosniff';

    // X-Frame-Options
    headers['X-Frame-Options'] = 'DENY';

    // X-XSS-Protection (legacy browsers)
    headers['X-XSS-Protection'] = '1; mode=block';

    // Referrer Policy
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';

    // Permissions Policy
    headers['Permissions-Policy'] = this.generatePermissionsPolicy();

    // Cross-Origin policies
    headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
    headers['Cross-Origin-Opener-Policy'] = 'same-origin';
    headers['Cross-Origin-Resource-Policy'] = 'same-origin';

    return headers;
  }

  private generatePermissionsPolicy(): string {
    const permissions = [
      'camera=()',
      'microphone=()',
      'geolocation=(self)',
      'payment=(self)',
      'usb=()',
      'bluetooth=()',
      'accelerometer=()',
      'gyroscope=()',
      'magnetometer=()',
      'ambient-light-sensor=()',
      'encrypted-media=()',
      'autoplay=()',
      'picture-in-picture=()',
      'fullscreen=(self)',
      'display-capture=()',
    ];

    return permissions.join(', ');
  }

  public getCSPReportHandler(): (report: any) => void {
    return (report: any) => {
      console.warn('CSP Violation Report:', report);
      
      // In production, send to monitoring service
      if (this.config.environment === 'production') {
        // Send to your monitoring service
        // fetch('/api/csp-violations', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(report)
        // });
      }
    };
  }

  public validateCurrentCSP(): boolean {
    try {
      const policy = this.generateCSPHeader();
      
      // Basic validation checks
      const requiredDirectives = ['default-src', 'script-src', 'style-src', 'img-src'];
      const hasAllRequired = requiredDirectives.every(directive => 
        policy.includes(directive)
      );

      if (!hasAllRequired) {
        console.error('CSP validation failed: Missing required directives');
        return false;
      }

      // Check for potentially unsafe directives
      const unsafePatterns = ["'unsafe-eval'", "'unsafe-inline'"];
      if (this.config.environment === 'production') {
        const hasUnsafe = unsafePatterns.some(pattern => policy.includes(pattern));
        if (hasUnsafe) {
          console.warn('CSP validation warning: Contains potentially unsafe directives in production');
        }
      }

      return true;
    } catch (error) {
      console.error('CSP validation error:', error);
      return false;
    }
  }

  public generateCSPForMeta(): string {
    // For meta tag usage (client-side)
    const policy = this.generateCSPHeader();
    
    if (this.config.enforceMode) {
      return policy;
    } else {
      // Report-only mode for testing
      return policy.replace(/;$/, '; report-only');
    }
  }

  public refreshNonce(): void {
    this.generateNonce();
  }

  public addTrustedType(policyName: string, policy: any): void {
    if (typeof window !== 'undefined' && 'trustedTypes' in window) {
      try {
        (window as any).trustedTypes.createPolicy(policyName, policy);
      } catch (error) {
        console.error('Failed to create Trusted Types policy:', error);
      }
    }
  }

  public createBankingTrustedTypesPolicy(): void {
    this.addTrustedType('kb-banking-policy', {
      createHTML: (input: string) => {
        // Sanitize HTML for banking app
        return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      },
      createScript: (input: string) => {
        // Only allow specific scripts
        const allowedScripts = [
          'analytics',
          'performance-monitoring',
          'error-tracking'
        ];
        
        const isAllowed = allowedScripts.some(script => input.includes(script));
        return isAllowed ? input : '';
      },
      createScriptURL: (input: string) => {
        // Only allow trusted script URLs
        const trustedDomains = [
          'https://cdn.jsdelivr.net',
          'https://unpkg.com',
          'https://*.kbstar.com'
        ];
        
        const isTrusted = trustedDomains.some(domain => 
          input.match(domain.replace('*', '.*'))
        );
        
        return isTrusted ? input : '';
      }
    });
  }
}