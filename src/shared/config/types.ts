/**
 * Environment Configuration Types for KB StarBanking Clone
 * 
 * Defines all type interfaces for environment configuration management.
 * These types ensure type safety across the configuration system.
 */

/**
 * Environment types supported by the application
 */
export type Environment = 'development' | 'testing' | 'staging' | 'production';

/**
 * Configuration schema definition for validation
 * Used to define validation rules for each configuration parameter
 */
export interface ConfigSchema {
  [key: string]: {
    /** Whether this configuration parameter is required */
    required: boolean;
    /** Data type for validation */
    type: 'string' | 'number' | 'boolean' | 'url' | 'email';
    /** Default value if not provided */
    default?: any;
    /** Custom validation function */
    validation?: (value: any) => boolean;
    /** Whether this is sensitive information that should be masked */
    sensitive?: boolean;
    /** Human-readable description of the parameter */
    description?: string;
  };
}

/**
 * Complete environment configuration interface
 * Defines the structure of all configuration parameters
 */
export interface EnvironmentConfig {
  /** Application-level configuration */
  app: {
    /** Application name */
    name: string;
    /** Application version */
    version: string;
    /** Current environment */
    environment: Environment;
    /** Debug mode enabled */
    debug: boolean;
    /** Base URL for the application */
    baseUrl: string;
    /** Port number (for development) */
    port: number;
  };

  /** API communication configuration */
  api: {
    /** Base URL for API calls */
    baseUrl: string;
    /** Request timeout in milliseconds */
    timeout: number;
    /** Number of retry attempts for failed requests */
    retries: number;
    /** Rate limiting configuration */
    rateLimit: {
      /** Maximum requests per window */
      requests: number;
      /** Time window in seconds */
      window: number;
    };
  };

  /** Authentication configuration */
  auth: {
    /** Session timeout in minutes */
    sessionTimeout: number;
    /** Refresh token expiry in minutes */
    refreshTokenExpiry: number;
    /** Maximum failed login attempts */
    maxLoginAttempts: number;
    /** Account lockout duration in minutes */
    lockoutDuration: number;
  };

  /** External services configuration */
  services: {
    /** Supabase configuration */
    supabase: {
      /** Supabase project URL */
      url: string;
      /** Public anonymous key */
      anonKey: string;
      /** Service role key (optional, for server-side operations) */
      serviceRoleKey?: string;
    };
    /** Exchange rate service configuration */
    exchangeRate: {
      /** API key for exchange rate service */
      apiKey: string;
      /** Base URL for exchange rate API */
      baseUrl: string;
      /** Cache duration in minutes */
      cacheDuration: number;
    };
    /** Analytics service configuration (optional) */
    analytics?: {
      /** Tracking ID for analytics */
      trackingId: string;
      /** Whether analytics is enabled */
      enabled: boolean;
    };
  };

  /** Security configuration */
  security: {
    /** Allowed origins for CORS */
    allowedOrigins: string[];
    /** CSRF protection enabled */
    csrfEnabled: boolean;
    /** Force HTTPS only */
    httpsOnly: boolean;
    /** Security headers enabled */
    securityHeaders: boolean;
  };

  /** Feature flags */
  features: {
    /** Biometric authentication enabled */
    biometrics: boolean;
    /** Push notifications enabled */
    pushNotifications: boolean;
    /** Offline mode enabled */
    offlineMode: boolean;
    /** Dark mode enabled */
    darkMode: boolean;
    /** Analytics tracking enabled */
    analytics: boolean;
  };

  /** Logging configuration */
  logging: {
    /** Log level */
    level: 'error' | 'warn' | 'info' | 'debug';
    /** Logging enabled */
    enabled: boolean;
    /** Remote logging enabled */
    remoteLogging: boolean;
    /** Remote log endpoint (optional) */
    logEndpoint?: string;
  };
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation errors if any */
  errors: string[];
  /** Warnings if any */
  warnings: string[];
}

/**
 * Environment detection options
 */
export interface EnvironmentDetectionOptions {
  /** Override automatic environment detection */
  forceEnvironment?: Environment;
  /** Custom hostname for environment detection */
  customHostname?: string;
}

/**
 * Configuration export options
 */
export interface ConfigExportOptions {
  /** Whether to mask sensitive values */
  maskSensitive?: boolean;
  /** Whether to include default values */
  includeDefaults?: boolean;
  /** Specific keys to export (if not provided, exports all) */
  keys?: string[];
}