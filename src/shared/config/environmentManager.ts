/**
 * Environment Manager for KB StarBanking Clone
 * 
 * Provides secure environment variable handling, configuration validation,
 * and environment-specific settings management.
 */
import { safeLog } from '../../utils/errorHandler';

import { CONFIG_SCHEMA } from './schemas';

import type { 
  Environment, 
  ConfigSchema, 
  EnvironmentConfig,
  ValidationResult 
} from './types';
/**
 * Environment Manager Class
 */
export class EnvironmentManager {
  private config: EnvironmentConfig;
  private validationErrors: string[] = [];
  private environment: Environment;
  constructor() {
    this.environment = this.detectEnvironment();
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }
  /**
   * Detect current environment
   */
  private detectEnvironment(): Environment {
    // Check environment variable first
    const envVar = process.env.REACT_APP_ENVIRONMENT as Environment;
    if (envVar && ['development', 'testing', 'staging', 'production'].includes(envVar)) {
      return envVar;
    }
    // Detect from hostname or other indicators
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
      } else if (hostname.includes('test') || hostname.includes('staging')) {
        return 'testing';
      } else if (hostname.includes('stage')) {
        return 'staging';
      } else {
        return 'production';
      }
    }
    return 'development';
  }
  /**
   * Load configuration from environment variables
   */
  private loadConfiguration(): EnvironmentConfig {
    const config: any = {};
    // Process each configuration key
    Object.entries(CONFIG_SCHEMA).forEach(([key, schema]) => {
      const envValue = process.env[key];
      let value: any;
      if (envValue !== undefined) {
        // Parse environment value based on type
        value = this.parseEnvironmentValue(envValue, schema.type);
      } else if (schema.default !== undefined) {
        // Use default value
        value = schema.default;
      } else if (schema.required) {
        // Required value is missing
        this.validationErrors.push(`Required environment variable missing: ${key}`);
        value = null;
      }
      // Set value in config using dot notation
      this.setNestedValue(config, this.envKeyToConfigPath(key), value);
    });
    return this.buildConfigObject(config);
  }
  /**
   * Parse environment value based on expected type
   */
  private parseEnvironmentValue(value: string, type: string): any {
    switch (type) {
      case 'boolean':
        return value.toLowerCase() === 'true';
      case 'number':
        return parseInt(value, 10);
      case 'url':
        return value;
      case 'email':
        return value;
      case 'string':
      default:
        return value;
    }
  }
  /**
   * Convert environment key to config path
   */
  private envKeyToConfigPath(key: string): string {
    // Remove REACT_APP_ prefix and convert to nested path
    const cleanKey = key.replace('REACT_APP_', '').toLowerCase();
    // Map environment keys to config structure
    const keyMappings: Record<string, string> = {
      'name': 'app.name',
      'version': 'app.version',
      'environment': 'app.environment',
      'debug': 'app.debug',
      'base_url': 'app.baseUrl',
      'port': 'app.port',
      'api_base_url': 'api.baseUrl',
      'api_timeout': 'api.timeout',
      'api_retries': 'api.retries',
      'supabase_url': 'services.supabase.url',
      'supabase_anon_key': 'services.supabase.anonKey',
      'supabase_service_role_key': 'services.supabase.serviceRoleKey',
      'exchange_rate_api_key': 'services.exchangeRate.apiKey',
      'exchange_rate_base_url': 'services.exchangeRate.baseUrl',
      'allowed_origins': 'security.allowedOrigins',
      'https_only': 'security.httpsOnly',
      'enable_biometrics': 'features.biometrics',
      'enable_push_notifications': 'features.pushNotifications',
      'enable_offline_mode': 'features.offlineMode',
      'enable_analytics': 'features.analytics',
      'log_level': 'logging.level',
      'enable_logging': 'logging.enabled',
      'log_endpoint': 'logging.logEndpoint'
    };
    return keyMappings[cleanKey] || cleanKey;
  }
  /**
   * Set nested value in object using dot notation
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
  }
  /**
   * Build final configuration object with defaults
   */
  private buildConfigObject(rawConfig: any): EnvironmentConfig {
    // Parse allowed origins
    const allowedOrigins = rawConfig.security?.allowedOrigins 
      ? rawConfig.security.allowedOrigins.split(',').map((origin: string) => origin.trim())
      : [];
    return {
      app: {
        name: rawConfig.app?.name || 'KB StarBanking Clone',
        version: rawConfig.app?.version || '1.0.0',
        environment: this.environment,
        debug: rawConfig.app?.debug || this.environment === 'development',
        baseUrl: rawConfig.app?.baseUrl || 'http://localhost:3000',
        port: rawConfig.app?.port || 3000
      },
      api: {
        baseUrl: rawConfig.api?.baseUrl || 'http://localhost:3001/api',
        timeout: rawConfig.api?.timeout || 10000,
        retries: rawConfig.api?.retries || 3,
        rateLimit: {
          requests: 100,
          window: 15 * 60 * 1000
        }
      },
      auth: {
        sessionTimeout: 4 * 60 * 60 * 1000, // 4 hours
        refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000 // 15 minutes
      },
      services: {
        supabase: {
          url: rawConfig.services?.supabase?.url || '',
          anonKey: rawConfig.services?.supabase?.anonKey || '',
          serviceRoleKey: rawConfig.services?.supabase?.serviceRoleKey
        },
        exchangeRate: {
          apiKey: rawConfig.services?.exchangeRate?.apiKey || '',
          baseUrl: rawConfig.services?.exchangeRate?.baseUrl || 'https://api.exchangerate-api.com/v4',
          cacheDuration: 5 * 60 * 1000 // 5 minutes
        },
        analytics: {
          trackingId: '',
          enabled: rawConfig.features?.analytics || false
        }
      },
      security: {
        allowedOrigins,
        csrfEnabled: true,
        httpsOnly: rawConfig.security?.httpsOnly || this.environment === 'production',
        securityHeaders: true
      },
      features: {
        biometrics: rawConfig.features?.biometrics || false,
        pushNotifications: rawConfig.features?.pushNotifications || false,
        offlineMode: rawConfig.features?.offlineMode || false,
        darkMode: true,
        analytics: rawConfig.features?.analytics || false
      },
      logging: {
        level: rawConfig.logging?.level || (this.environment === 'production' ? 'warn' : 'info'),
        enabled: rawConfig.logging?.enabled !== false,
        remoteLogging: this.environment === 'production',
        logEndpoint: rawConfig.logging?.logEndpoint
      }
    };
  }
  /**
   * Validate configuration
   */
  private validateConfiguration(): void {
    // Validate required values
    Object.entries(CONFIG_SCHEMA).forEach(([key, schema]) => {
      if (schema.required) {
        const configPath = this.envKeyToConfigPath(key);
        const value = this.getNestedValue(this.config, configPath);
        if (value === null || value === undefined || value === '') {
          this.validationErrors.push(`Required configuration missing: ${configPath} (${key})`);
        }
      }
    });
    // Validate URLs
    this.validateUrl('app.baseUrl', this.config.app.baseUrl);
    this.validateUrl('api.baseUrl', this.config.api.baseUrl);
    this.validateUrl('services.supabase.url', this.config.services.supabase.url);
    // Validate security settings
    if (this.environment === 'production') {
      if (!this.config.security.httpsOnly) {
        this.validationErrors.push('HTTPS must be enabled in production');
      }
      if (this.config.app.debug) {
        this.validationErrors.push('Debug mode must be disabled in production');
      }
    }
    // Log validation results
    if (this.validationErrors.length > 0) {
      safeLog('error', 'Configuration validation failed', {
        errors: this.validationErrors,
        environment: this.environment
      });
    } else {
      safeLog('info', 'Configuration validation passed', {
        environment: this.environment,
        features: Object.keys(this.config.features).filter(key => 
          this.config.features[key as keyof typeof this.config.features]
        )
      });
    }
  }
  /**
   * Validate URL format
   */
  private validateUrl(path: string, url: string): void {
    if (!url) return;
    try {
      new URL(url);
    } catch {
      this.validationErrors.push(`Invalid URL format: ${path} = ${url}`);
    }
  }
  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  /**
   * Get current configuration
   */
  getConfig(): EnvironmentConfig {
    return { ...this.config };
  }
  /**
   * Get specific configuration section
   */
  getAppConfig() {
    return { ...this.config.app };
  }
  getApiConfig() {
    return { ...this.config.api };
  }
  getAuthConfig() {
    return { ...this.config.auth };
  }
  getServicesConfig() {
    return { ...this.config.services };
  }
  getSecurityConfig() {
    return { ...this.config.security };
  }
  getFeaturesConfig() {
    return { ...this.config.features };
  }
  getLoggingConfig() {
    return { ...this.config.logging };
  }
  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: keyof EnvironmentConfig['features']): boolean {
    return this.config.features[feature];
  }
  /**
   * Get current environment
   */
  getEnvironment(): Environment {
    return this.environment;
  }
  /**
   * Check if development mode
   */
  isDevelopment(): boolean {
    return this.environment === 'development';
  }
  /**
   * Check if production mode
   */
  isProduction(): boolean {
    return this.environment === 'production';
  }
  /**
   * Get validation errors
   */
  getValidationErrors(): string[] {
    return [...this.validationErrors];
  }
  /**
   * Check if configuration is valid
   */
  isValid(): boolean {
    return this.validationErrors.length === 0;
  }
  /**
   * Export configuration for debugging (sensitive data redacted)
   */
  exportConfig(): any {
    const config = JSON.parse(JSON.stringify(this.config));
    // Redact sensitive information
    if (config.services?.supabase?.anonKey) {
      config.services.supabase.anonKey = '[REDACTED]';
    }
    if (config.services?.supabase?.serviceRoleKey) {
      config.services.supabase.serviceRoleKey = '[REDACTED]';
    }
    if (config.services?.exchangeRate?.apiKey) {
      config.services.exchangeRate.apiKey = '[REDACTED]';
    }
    return config;
  }
}
/**
 * Global environment manager instance
 */
export const environmentManager = new EnvironmentManager();
/**
 * Export convenience functions
 */
export const getConfig = () => environmentManager.getConfig();
export const getEnvironment = () => environmentManager.getEnvironment();
export const isFeatureEnabled = (feature: keyof EnvironmentConfig['features']) => 
  environmentManager.isFeatureEnabled(feature);
export const isDevelopment = () => environmentManager.isDevelopment();
export const isProduction = () => environmentManager.isProduction();
export default EnvironmentManager;