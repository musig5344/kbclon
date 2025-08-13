/**
 * Security Configuration Management for KB StarBanking Clone
 * 
 * Centralized security configuration with environment-specific settings,
 * secure environment variable handling, and security policy management.
 */
import { safeLog } from '../../utils/errorHandler';
/**
 * Environment types
 */
export type Environment = 'development' | 'testing' | 'production';
/**
 * Security levels
 */
export type SecurityLevel = 'low' | 'medium' | 'high' | 'maximum';
/**
 * Security configuration interface
 */
export interface SecurityConfiguration {
  environment: Environment;
  securityLevel: SecurityLevel;
  // Authentication & Session
  auth: {
    sessionTimeout: number;
    maxConcurrentSessions: number;
    requireStrongPasswords: boolean;
    enableMFA: boolean;
    passwordExpiryDays: number;
    maxLoginAttempts: number;
    lockoutDurationMinutes: number;
  };
  // CSRF Protection
  csrf: {
    enabled: boolean;
    tokenLifetime: number;
    strictOriginValidation: boolean;
    allowedOrigins: string[];
  };
  // Input Validation & Sanitization
  inputValidation: {
    enabled: boolean;
    strictMode: boolean;
    maxInputLength: number;
    allowHtml: boolean;
    allowUrls: boolean;
    logViolations: boolean;
  };
  // Rate Limiting
  rateLimit: {
    enabled: boolean;
    requests: {
      general: { max: number; windowMs: number };
      auth: { max: number; windowMs: number };
      transfer: { max: number; windowMs: number };
    };
    blockDurationMs: number;
  };
  // Content Security Policy
  csp: {
    enabled: boolean;
    reportOnly: boolean;
    strictDynamic: boolean;
    requireTrustedTypes: boolean;
  };
  // API Security
  api: {
    timeout: number;
    maxRetries: number;
    validateResponses: boolean;
    encryptSensitiveData: boolean;
  };
  // Logging & Monitoring
  logging: {
    logSecurityEvents: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    maxLogSize: number;
    retentionDays: number;
  };
  // Feature Flags
  features: {
    enableBiometrics: boolean;
    enableDeviceFingerprinting: boolean;
    enableGeolocation: boolean;
    enableOfflineMode: boolean;
  };
}
/**
 * Base security configurations by level
 */
const SECURITY_LEVELS: Record<SecurityLevel, Partial<SecurityConfiguration>> = {
  low: {
    auth: {
      sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
      maxConcurrentSessions: 5,
      requireStrongPasswords: false,
      enableMFA: false,
      passwordExpiryDays: 365,
      maxLoginAttempts: 10,
      lockoutDurationMinutes: 5
    },
    csrf: {
      enabled: true,
      tokenLifetime: 2 * 60 * 60 * 1000, // 2 hours
      strictOriginValidation: false,
      allowedOrigins: []
    },
    inputValidation: {
      enabled: true,
      strictMode: false,
      maxInputLength: 10000,
      allowHtml: false,
      allowUrls: true,
      logViolations: false
    },
    rateLimit: {
      enabled: true,
      requests: {
        general: { max: 1000, windowMs: 15 * 60 * 1000 },
        auth: { max: 20, windowMs: 15 * 60 * 1000 },
        transfer: { max: 50, windowMs: 15 * 60 * 1000 }
      },
      blockDurationMs: 5 * 60 * 1000
    }
  },
  medium: {
    auth: {
      sessionTimeout: 4 * 60 * 60 * 1000, // 4 hours
      maxConcurrentSessions: 3,
      requireStrongPasswords: true,
      enableMFA: false,
      passwordExpiryDays: 180,
      maxLoginAttempts: 5,
      lockoutDurationMinutes: 15
    },
    csrf: {
      enabled: true,
      tokenLifetime: 60 * 60 * 1000, // 1 hour
      strictOriginValidation: true,
      allowedOrigins: []
    },
    inputValidation: {
      enabled: true,
      strictMode: true,
      maxInputLength: 5000,
      allowHtml: false,
      allowUrls: false,
      logViolations: true
    },
    rateLimit: {
      enabled: true,
      requests: {
        general: { max: 500, windowMs: 15 * 60 * 1000 },
        auth: { max: 10, windowMs: 15 * 60 * 1000 },
        transfer: { max: 20, windowMs: 15 * 60 * 1000 }
      },
      blockDurationMs: 15 * 60 * 1000
    }
  },
  high: {
    auth: {
      sessionTimeout: 2 * 60 * 60 * 1000, // 2 hours
      maxConcurrentSessions: 2,
      requireStrongPasswords: true,
      enableMFA: true,
      passwordExpiryDays: 90,
      maxLoginAttempts: 3,
      lockoutDurationMinutes: 30
    },
    csrf: {
      enabled: true,
      tokenLifetime: 30 * 60 * 1000, // 30 minutes
      strictOriginValidation: true,
      allowedOrigins: []
    },
    inputValidation: {
      enabled: true,
      strictMode: true,
      maxInputLength: 2000,
      allowHtml: false,
      allowUrls: false,
      logViolations: true
    },
    rateLimit: {
      enabled: true,
      requests: {
        general: { max: 200, windowMs: 15 * 60 * 1000 },
        auth: { max: 5, windowMs: 15 * 60 * 1000 },
        transfer: { max: 10, windowMs: 15 * 60 * 1000 }
      },
      blockDurationMs: 30 * 60 * 1000
    }
  },
  maximum: {
    auth: {
      sessionTimeout: 60 * 60 * 1000, // 1 hour
      maxConcurrentSessions: 1,
      requireStrongPasswords: true,
      enableMFA: true,
      passwordExpiryDays: 30,
      maxLoginAttempts: 3,
      lockoutDurationMinutes: 60
    },
    csrf: {
      enabled: true,
      tokenLifetime: 15 * 60 * 1000, // 15 minutes
      strictOriginValidation: true,
      allowedOrigins: []
    },
    inputValidation: {
      enabled: true,
      strictMode: true,
      maxInputLength: 1000,
      allowHtml: false,
      allowUrls: false,
      logViolations: true
    },
    rateLimit: {
      enabled: true,
      requests: {
        general: { max: 100, windowMs: 15 * 60 * 1000 },
        auth: { max: 3, windowMs: 15 * 60 * 1000 },
        transfer: { max: 5, windowMs: 15 * 60 * 1000 }
      },
      blockDurationMs: 60 * 60 * 1000
    }
  }
};
/**
 * Environment-specific configurations
 */
const ENVIRONMENT_CONFIGS: Record<Environment, Partial<SecurityConfiguration>> = {
  development: {
    csp: {
      enabled: true,
      reportOnly: true,
      strictDynamic: false,
      requireTrustedTypes: false
    },
    api: {
      timeout: 30000,
      maxRetries: 3,
      validateResponses: false,
      encryptSensitiveData: false
    },
    logging: {
      logSecurityEvents: true,
      logLevel: 'debug',
      maxLogSize: 10 * 1024 * 1024, // 10MB
      retentionDays: 7
    },
    features: {
      enableBiometrics: false,
      enableDeviceFingerprinting: false,
      enableGeolocation: false,
      enableOfflineMode: true
    }
  },
  testing: {
    csp: {
      enabled: true,
      reportOnly: false,
      strictDynamic: false,
      requireTrustedTypes: false
    },
    api: {
      timeout: 10000,
      maxRetries: 2,
      validateResponses: true,
      encryptSensitiveData: true
    },
    logging: {
      logSecurityEvents: true,
      logLevel: 'info',
      maxLogSize: 50 * 1024 * 1024, // 50MB
      retentionDays: 30
    },
    features: {
      enableBiometrics: true,
      enableDeviceFingerprinting: true,
      enableGeolocation: false,
      enableOfflineMode: false
    }
  },
  production: {
    csp: {
      enabled: true,
      reportOnly: false,
      strictDynamic: true,
      requireTrustedTypes: true
    },
    api: {
      timeout: 5000,
      maxRetries: 1,
      validateResponses: true,
      encryptSensitiveData: true
    },
    logging: {
      logSecurityEvents: true,
      logLevel: 'warn',
      maxLogSize: 100 * 1024 * 1024, // 100MB
      retentionDays: 90
    },
    features: {
      enableBiometrics: true,
      enableDeviceFingerprinting: true,
      enableGeolocation: true,
      enableOfflineMode: false
    }
  }
};
/**
 * Default configuration
 */
const DEFAULT_CONFIG: SecurityConfiguration = {
  environment: 'development',
  securityLevel: 'medium',
  auth: {
    sessionTimeout: 4 * 60 * 60 * 1000,
    maxConcurrentSessions: 3,
    requireStrongPasswords: true,
    enableMFA: false,
    passwordExpiryDays: 180,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15
  },
  csrf: {
    enabled: true,
    tokenLifetime: 60 * 60 * 1000,
    strictOriginValidation: true,
    allowedOrigins: []
  },
  inputValidation: {
    enabled: true,
    strictMode: true,
    maxInputLength: 5000,
    allowHtml: false,
    allowUrls: false,
    logViolations: true
  },
  rateLimit: {
    enabled: true,
    requests: {
      general: { max: 500, windowMs: 15 * 60 * 1000 },
      auth: { max: 10, windowMs: 15 * 60 * 1000 },
      transfer: { max: 20, windowMs: 15 * 60 * 1000 }
    },
    blockDurationMs: 15 * 60 * 1000
  },
  csp: {
    enabled: true,
    reportOnly: false,
    strictDynamic: false,
    requireTrustedTypes: false
  },
  api: {
    timeout: 10000,
    maxRetries: 2,
    validateResponses: true,
    encryptSensitiveData: true
  },
  logging: {
    logSecurityEvents: true,
    logLevel: 'info',
    maxLogSize: 50 * 1024 * 1024,
    retentionDays: 30
  },
  features: {
    enableBiometrics: false,
    enableDeviceFingerprinting: false,
    enableGeolocation: false,
    enableOfflineMode: false
  }
};
/**
 * Security Configuration Manager
 */
export class SecurityConfigManager {
  private config: SecurityConfiguration;
  private readonly environmentVariables: Map<string, string> = new Map();
  constructor(
    environment?: Environment,
    securityLevel?: SecurityLevel,
    customConfig?: Partial<SecurityConfiguration>
  ) {
    this.loadEnvironmentVariables();
    this.config = this.buildConfiguration(environment, securityLevel, customConfig);
    this.validateConfiguration();
  }
  /**
   * Load environment variables securely
   */
  private loadEnvironmentVariables(): void {
    // Define allowed environment variables
    const allowedEnvVars = [
      'REACT_APP_ENVIRONMENT',
      'REACT_APP_SECURITY_LEVEL',
      'REACT_APP_ALLOWED_ORIGINS',
      'REACT_APP_API_BASE_URL',
      'REACT_APP_ENABLE_LOGGING'
    ];
    allowedEnvVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        this.environmentVariables.set(varName, value);
      }
    });
    // Validate critical environment variables
    const requiredVars = ['REACT_APP_ENVIRONMENT'];
    for (const varName of requiredVars) {
      if (!this.environmentVariables.has(varName)) {
        safeLog('warn', `Required environment variable not found: ${varName}`);
      }
    }
  }
  /**
   * Build configuration from multiple sources
   */
  private buildConfiguration(
    environment?: Environment,
    securityLevel?: SecurityLevel,
    customConfig?: Partial<SecurityConfiguration>
  ): SecurityConfiguration {
    // Start with default config
    let config = { ...DEFAULT_CONFIG };
    // Apply environment from env var or parameter
    const envFromVar = this.environmentVariables.get('REACT_APP_ENVIRONMENT') as Environment;
    const finalEnvironment = environment || envFromVar || 'development';
    config.environment = finalEnvironment;
    // Apply security level from env var or parameter
    const securityFromVar = this.environmentVariables.get('REACT_APP_SECURITY_LEVEL') as SecurityLevel;
    const finalSecurityLevel = securityLevel || securityFromVar || 'medium';
    config.securityLevel = finalSecurityLevel;
    // Apply security level config
    const securityLevelConfig = SECURITY_LEVELS[finalSecurityLevel];
    config = this.deepMerge(config, securityLevelConfig);
    // Apply environment-specific config
    const environmentConfig = ENVIRONMENT_CONFIGS[finalEnvironment];
    config = this.deepMerge(config, environmentConfig);
    // Apply allowed origins from environment
    const allowedOrigins = this.environmentVariables.get('REACT_APP_ALLOWED_ORIGINS');
    if (allowedOrigins) {
      config.csrf.allowedOrigins = allowedOrigins.split(',').map(origin => origin.trim());
    }
    // Apply custom config last
    if (customConfig) {
      config = this.deepMerge(config, customConfig);
    }
    return config;
  }
  /**
   * Deep merge configurations
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
  /**
   * Validate configuration
   */
  private validateConfiguration(): void {
    const errors: string[] = [];
    // Validate session timeout
    if (this.config.auth.sessionTimeout < 5 * 60 * 1000) { // Minimum 5 minutes
      errors.push('Session timeout too short (minimum 5 minutes)');
    }
    // Validate rate limits
    if (this.config.rateLimit.requests.auth.max < 1) {
      errors.push('Auth rate limit too restrictive');
    }
    // Validate CSRF token lifetime
    if (this.config.csrf.tokenLifetime < 5 * 60 * 1000) { // Minimum 5 minutes
      errors.push('CSRF token lifetime too short (minimum 5 minutes)');
    }
    if (errors.length > 0) {
      safeLog('error', 'Security configuration validation failed', { errors });
      throw new Error(`Security configuration invalid: ${errors.join(', ')}`);
    }
    safeLog('info', 'Security configuration validated successfully', {
      environment: this.config.environment,
      securityLevel: this.config.securityLevel
    });
  }
  /**
   * Get current configuration
   */
  getConfig(): SecurityConfiguration {
    return { ...this.config };
  }
  /**
   * Get configuration for specific module
   */
  getAuthConfig() {
    return { ...this.config.auth };
  }
  getCSRFConfig() {
    return { ...this.config.csrf };
  }
  getInputValidationConfig() {
    return { ...this.config.inputValidation };
  }
  getRateLimitConfig() {
    return { ...this.config.rateLimit };
  }
  getAPIConfig() {
    return { ...this.config.api };
  }
  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: keyof SecurityConfiguration['features']): boolean {
    return this.config.features[feature];
  }
  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SecurityConfiguration>): void {
    this.config = this.deepMerge(this.config, updates);
    this.validateConfiguration();
    safeLog('info', 'Security configuration updated');
  }
  /**
   * Get environment variable
   */
  getEnvironmentVariable(name: string): string | undefined {
    return this.environmentVariables.get(name);
  }
  /**
   * Export configuration for debugging (excludes sensitive data)
   */
  exportConfig(): any {
    const { ...config } = this.config;
    return {
      ...config,
      // Remove sensitive information
      csrf: {
        ...config.csrf,
        allowedOrigins: config.csrf.allowedOrigins.map(() => '[REDACTED]')
      }
    };
  }
}
/**
 * Global security configuration instance
 */
export const securityConfig = new SecurityConfigManager();
/**
 * Initialize security configuration
 */
export function initializeSecurityConfig(
  environment?: Environment,
  securityLevel?: SecurityLevel,
  customConfig?: Partial<SecurityConfiguration>
): SecurityConfigManager {
  const manager = new SecurityConfigManager(environment, securityLevel, customConfig);
  safeLog('info', 'Security configuration initialized', {
    environment: manager.getConfig().environment,
    securityLevel: manager.getConfig().securityLevel
  });
  return manager;
}
export default SecurityConfigManager;