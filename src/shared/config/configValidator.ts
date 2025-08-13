/**
 * Configuration Validator for KB StarBanking Clone
 * 
 * Provides runtime configuration validation, health checks,
 * and configuration recommendations for optimal security and performance.
 */
import { safeLog } from '../../utils/errorHandler';

import { EnvironmentConfig } from './environmentManager';
/**
 * Validation severity levels
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';
/**
 * Validation result interface
 */
export interface ValidationResult {
  severity: ValidationSeverity;
  category: string;
  message: string;
  recommendation?: string;
  fix?: string;
}
/**
 * Configuration health check result
 */
export interface HealthCheckResult {
  healthy: boolean;
  score: number; // 0-100
  results: ValidationResult[];
  summary: {
    errors: number;
    warnings: number;
    infos: number;
  };
}
/**
 * Configuration Validator Class
 */
export class ConfigValidator {
  private validationRules: Array<(config: EnvironmentConfig) => ValidationResult[]> = [];
  constructor() {
    this.setupValidationRules();
  }
  /**
   * Setup all validation rules
   */
  private setupValidationRules(): void {
    this.validationRules = [
      this.validateSecurity,
      this.validateAuthentication,
      this.validateAPI,
      this.validateServices,
      this.validatePerformance,
      this.validateLogging,
      this.validateFeatures,
      this.validateEnvironmentSpecific
    ];
  }
  /**
   * Validate entire configuration
   */
  validate(config: EnvironmentConfig): HealthCheckResult {
    const allResults: ValidationResult[] = [];
    // Run all validation rules
    this.validationRules.forEach(rule => {
      try {
        const results = rule(config);
        allResults.push(...results);
      } catch (error) {
        allResults.push({
          severity: 'error',
          category: 'validation',
          message: `Validation rule failed: ${error}`,
          recommendation: 'Check validation rule implementation'
        });
      }
    });
    // Calculate health score
    const summary = this.calculateSummary(allResults);
    const score = this.calculateHealthScore(summary);
    const healthy = score >= 80 && summary.errors === 0;
    return {
      healthy,
      score,
      results: allResults,
      summary
    };
  }
  /**
   * Security validation rules
   */
  private validateSecurity = (config: EnvironmentConfig): ValidationResult[] => {
    const results: ValidationResult[] = [];
    // HTTPS validation
    if (config.app.environment === 'production' && !config.security.httpsOnly) {
      results.push({
        severity: 'error',
        category: 'security',
        message: 'HTTPS is not enforced in production environment',
        recommendation: 'Enable HTTPS-only mode for production',
        fix: 'Set REACT_APP_HTTPS_ONLY=true'
      });
    }
    // CSRF validation
    if (!config.security.csrfEnabled) {
      results.push({
        severity: 'error',
        category: 'security',
        message: 'CSRF protection is disabled',
        recommendation: 'Enable CSRF protection for security',
        fix: 'Ensure CSRF is enabled in security configuration'
      });
    }
    // Allowed origins validation
    if (config.security.allowedOrigins.length === 0 && config.app.environment === 'production') {
      results.push({
        severity: 'warning',
        category: 'security',
        message: 'No allowed origins configured for production',
        recommendation: 'Configure allowed origins for CORS protection',
        fix: 'Set REACT_APP_ALLOWED_ORIGINS with comma-separated origins'
      });
    }
    // Debug mode in production
    if (config.app.debug && config.app.environment === 'production') {
      results.push({
        severity: 'error',
        category: 'security',
        message: 'Debug mode is enabled in production',
        recommendation: 'Disable debug mode in production for security',
        fix: 'Set REACT_APP_DEBUG=false'
      });
    }
    return results;
  };
  /**
   * Authentication validation rules
   */
  private validateAuthentication = (config: EnvironmentConfig): ValidationResult[] => {
    const results: ValidationResult[] = [];
    // Session timeout validation
    const minSessionTimeout = 5 * 60 * 1000; // 5 minutes
    const maxSessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    if (config.auth.sessionTimeout < minSessionTimeout) {
      results.push({
        severity: 'warning',
        category: 'authentication',
        message: 'Session timeout is very short (< 5 minutes)',
        recommendation: 'Consider increasing session timeout for better UX'
      });
    }
    if (config.auth.sessionTimeout > maxSessionTimeout) {
      results.push({
        severity: 'warning',
        category: 'authentication',
        message: 'Session timeout is very long (> 24 hours)',
        recommendation: 'Consider reducing session timeout for better security'
      });
    }
    // Max login attempts validation
    if (config.auth.maxLoginAttempts > 10) {
      results.push({
        severity: 'warning',
        category: 'authentication',
        message: 'Max login attempts is high (> 10)',
        recommendation: 'Consider reducing max login attempts to prevent brute force attacks'
      });
    }
    if (config.auth.maxLoginAttempts < 3) {
      results.push({
        severity: 'warning',
        category: 'authentication',
        message: 'Max login attempts is very low (< 3)',
        recommendation: 'Consider increasing max login attempts to prevent accidental lockouts'
      });
    }
    // Lockout duration validation
    const minLockout = 5 * 60 * 1000; // 5 minutes
    if (config.auth.lockoutDuration < minLockout) {
      results.push({
        severity: 'warning',
        category: 'authentication',
        message: 'Lockout duration is very short (< 5 minutes)',
        recommendation: 'Consider increasing lockout duration for better security'
      });
    }
    return results;
  };
  /**
   * API validation rules
   */
  private validateAPI = (config: EnvironmentConfig): ValidationResult[] => {
    const results: ValidationResult[] = [];
    // API timeout validation
    if (config.api.timeout < 1000) {
      results.push({
        severity: 'warning',
        category: 'api',
        message: 'API timeout is very short (< 1 second)',
        recommendation: 'Consider increasing API timeout to prevent premature failures'
      });
    }
    if (config.api.timeout > 30000) {
      results.push({
        severity: 'warning',
        category: 'api',
        message: 'API timeout is very long (> 30 seconds)',
        recommendation: 'Consider reducing API timeout for better user experience'
      });
    }
    // Retry validation
    if (config.api.retries > 5) {
      results.push({
        severity: 'warning',
        category: 'api',
        message: 'API retry count is high (> 5)',
        recommendation: 'High retry counts can impact performance'
      });
    }
    // Rate limiting validation
    if (config.api.rateLimit.requests > 1000) {
      results.push({
        severity: 'info',
        category: 'api',
        message: 'API rate limit is very high (> 1000/window)',
        recommendation: 'Monitor API usage to ensure this limit is appropriate'
      });
    }
    return results;
  };
  /**
   * Services validation rules
   */
  private validateServices = (config: EnvironmentConfig): ValidationResult[] => {
    const results: ValidationResult[] = [];
    // Supabase validation
    if (!config.services.supabase.url) {
      results.push({
        severity: 'error',
        category: 'services',
        message: 'Supabase URL is not configured',
        recommendation: 'Configure Supabase URL for database connectivity',
        fix: 'Set REACT_APP_SUPABASE_URL'
      });
    }
    if (!config.services.supabase.anonKey) {
      results.push({
        severity: 'error',
        category: 'services',
        message: 'Supabase anonymous key is not configured',
        recommendation: 'Configure Supabase anonymous key for authentication',
        fix: 'Set REACT_APP_SUPABASE_ANON_KEY'
      });
    }
    // Exchange rate service validation
    if (!config.services.exchangeRate.apiKey && config.app.environment === 'production') {
      results.push({
        severity: 'warning',
        category: 'services',
        message: 'Exchange rate API key is not configured',
        recommendation: 'Configure API key for exchange rate service',
        fix: 'Set REACT_APP_EXCHANGE_RATE_API_KEY'
      });
    }
    // Cache duration validation
    if (config.services.exchangeRate.cacheDuration < 60000) { // 1 minute
      results.push({
        severity: 'warning',
        category: 'services',
        message: 'Exchange rate cache duration is very short (< 1 minute)',
        recommendation: 'Consider increasing cache duration to reduce API calls'
      });
    }
    return results;
  };
  /**
   * Performance validation rules
   */
  private validatePerformance = (config: EnvironmentConfig): ValidationResult[] => {
    const results: ValidationResult[] = [];
    // Feature flag performance impact
    const heavyFeatures = ['biometrics', 'pushNotifications'];
    const enabledHeavyFeatures = heavyFeatures.filter(feature => 
      config.features[feature as keyof typeof config.features]
    );
    if (enabledHeavyFeatures.length > 2) {
      results.push({
        severity: 'info',
        category: 'performance',
        message: 'Multiple heavy features are enabled',
        recommendation: 'Monitor app performance with multiple features enabled'
      });
    }
    // Logging performance impact
    if (config.logging.level === 'debug' && config.app.environment === 'production') {
      results.push({
        severity: 'warning',
        category: 'performance',
        message: 'Debug logging is enabled in production',
        recommendation: 'Use warn or error log level in production for better performance',
        fix: 'Set REACT_APP_LOG_LEVEL=warn'
      });
    }
    return results;
  };
  /**
   * Logging validation rules
   */
  private validateLogging = (config: EnvironmentConfig): ValidationResult[] => {
    const results: ValidationResult[] = [];
    // Remote logging in production
    if (config.app.environment === 'production' && config.logging.remoteLogging && !config.logging.logEndpoint) {
      results.push({
        severity: 'warning',
        category: 'logging',
        message: 'Remote logging is enabled but no endpoint is configured',
        recommendation: 'Configure log endpoint for remote logging',
        fix: 'Set REACT_APP_LOG_ENDPOINT'
      });
    }
    // Logging disabled
    if (!config.logging.enabled) {
      results.push({
        severity: 'info',
        category: 'logging',
        message: 'Logging is disabled',
        recommendation: 'Consider enabling logging for debugging and monitoring'
      });
    }
    return results;
  };
  /**
   * Features validation rules
   */
  private validateFeatures = (config: EnvironmentConfig): ValidationResult[] => {
    const results: ValidationResult[] = [];
    // Analytics without tracking ID
    if (config.features.analytics && !config.services.analytics?.trackingId) {
      results.push({
        severity: 'warning',
        category: 'features',
        message: 'Analytics is enabled but no tracking ID is configured',
        recommendation: 'Configure analytics tracking ID or disable analytics'
      });
    }
    // Offline mode in production
    if (config.features.offlineMode && config.app.environment === 'production') {
      results.push({
        severity: 'info',
        category: 'features',
        message: 'Offline mode is enabled in production',
        recommendation: 'Ensure offline functionality is thoroughly tested'
      });
    }
    return results;
  };
  /**
   * Environment-specific validation rules
   */
  private validateEnvironmentSpecific = (config: EnvironmentConfig): ValidationResult[] => {
    const results: ValidationResult[] = [];
    switch (config.app.environment) {
      case 'production':
        // Production-specific validations
        if (config.app.baseUrl.includes('localhost')) {
          results.push({
            severity: 'error',
            category: 'environment',
            message: 'Base URL points to localhost in production',
            recommendation: 'Update base URL to production domain',
            fix: 'Set REACT_APP_BASE_URL to production URL'
          });
        }
        break;
      case 'development':
        // Development-specific validations
        if (!config.app.debug) {
          results.push({
            severity: 'info',
            category: 'environment',
            message: 'Debug mode is disabled in development',
            recommendation: 'Consider enabling debug mode for development'
          });
        }
        break;
    }
    return results;
  };
  /**
   * Calculate validation summary
   */
  private calculateSummary(results: ValidationResult[]): {
    errors: number;
    warnings: number;
    infos: number;
  } {
    return results.reduce((summary, result) => {
      switch (result.severity) {
        case 'error':
          summary.errors++;
          break;
        case 'warning':
          summary.warnings++;
          break;
        case 'info':
          summary.infos++;
          break;
      }
      return summary;
    }, { errors: 0, warnings: 0, infos: 0 });
  }
  /**
   * Calculate health score (0-100)
   */
  private calculateHealthScore(summary: { errors: number; warnings: number; infos: number }): number {
    let score = 100;
    // Deduct points for issues
    score -= summary.errors * 25; // Major issues
    score -= summary.warnings * 5; // Minor issues
    score -= summary.infos * 1; // Informational issues
    return Math.max(0, score);
  }
  /**
   * Generate configuration recommendations
   */
  generateRecommendations(config: EnvironmentConfig): string[] {
    const healthCheck = this.validate(config);
    const recommendations: string[] = [];
    // Add environment-specific recommendations
    switch (config.app.environment) {
      case 'production':
        recommendations.push(
          'Ensure all API keys are properly secured',
          'Enable monitoring and alerting',
          'Use CDN for static assets',
          'Enable compression and caching'
        );
        break;
      case 'development':
        recommendations.push(
          'Enable debug mode for easier development',
          'Use detailed logging for debugging',
          'Consider using local development databases'
        );
        break;
    }
    // Add recommendations from validation results
    healthCheck.results
      .filter(result => result.recommendation)
      .forEach(result => recommendations.push(result.recommendation!));
    return Array.from(new Set(recommendations)); // Remove duplicates
  }
  /**
   * Quick health check
   */
  quickHealthCheck(config: EnvironmentConfig): boolean {
    const healthCheck = this.validate(config);
    return healthCheck.healthy;
  }
}
/**
 * Global validator instance
 */
export const configValidator = new ConfigValidator();
/**
 * Validate configuration and log results
 */
export function validateAndLog(config: EnvironmentConfig): HealthCheckResult {
  const result = configValidator.validate(config);
  if (result.healthy) {
    safeLog('info', 'Configuration validation passed', {
      score: result.score,
      summary: result.summary
    });
  } else {
    safeLog('warn', 'Configuration validation issues found', {
      score: result.score,
      summary: result.summary,
      errors: result.results.filter(r => r.severity === 'error').length
    });
  }
  return result;
}
export default ConfigValidator;