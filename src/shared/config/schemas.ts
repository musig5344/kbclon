/**
 * Configuration Schema Definitions for KB StarBanking Clone
 * 
 * Defines validation schemas for all environment configuration parameters.
 * Each parameter specifies its type, requirements, defaults, and validation rules.
 */
import type { ConfigSchema } from './types';

/**
 * Complete configuration schema for environment variables
 * Maps environment variable names to their validation rules
 */
export const CONFIG_SCHEMA: ConfigSchema = {
  // ========================================
  // Application Configuration
  // ========================================
  'REACT_APP_NAME': {
    required: true,
    type: 'string',
    default: 'KB StarBanking Clone',
    description: 'Application name displayed in the UI'
  },
  'REACT_APP_VERSION': {
    required: true,
    type: 'string',
    default: '1.0.0',
    description: 'Application version for display and debugging'
  },
  'REACT_APP_ENVIRONMENT': {
    required: true,
    type: 'string',
    default: 'development',
    validation: (value: string) => ['development', 'testing', 'staging', 'production'].includes(value),
    description: 'Current deployment environment'
  },
  'REACT_APP_DEBUG': {
    required: false,
    type: 'boolean',
    default: false,
    description: 'Enable debug mode with detailed logging and development tools'
  },
  'REACT_APP_BASE_URL': {
    required: true,
    type: 'url',
    default: 'http://localhost:3000',
    description: 'Base URL where the application is hosted'
  },
  'REACT_APP_PORT': {
    required: false,
    type: 'number',
    default: 3000,
    description: 'Port number for local development server'
  },

  // ========================================
  // API Configuration
  // ========================================
  'REACT_APP_API_BASE_URL': {
    required: true,
    type: 'url',
    default: 'http://localhost:3001/api',
    description: 'Base URL for API endpoints'
  },
  'REACT_APP_API_TIMEOUT': {
    required: false,
    type: 'number',
    default: 10000,
    description: 'API request timeout in milliseconds'
  },
  'REACT_APP_API_RETRIES': {
    required: false,
    type: 'number',
    default: 3,
    description: 'Number of retry attempts for failed API requests'
  },
  'REACT_APP_API_RATE_LIMIT_REQUESTS': {
    required: false,
    type: 'number',
    default: 100,
    description: 'Maximum API requests per rate limit window'
  },
  'REACT_APP_API_RATE_LIMIT_WINDOW': {
    required: false,
    type: 'number',
    default: 60,
    description: 'Rate limit window duration in seconds'
  },

  // ========================================
  // Authentication Configuration
  // ========================================
  'REACT_APP_SESSION_TIMEOUT': {
    required: false,
    type: 'number',
    default: 30,
    description: 'User session timeout in minutes'
  },
  'REACT_APP_REFRESH_TOKEN_EXPIRY': {
    required: false,
    type: 'number',
    default: 1440,
    description: 'Refresh token expiry time in minutes'
  },
  'REACT_APP_MAX_LOGIN_ATTEMPTS': {
    required: false,
    type: 'number',
    default: 5,
    description: 'Maximum failed login attempts before lockout'
  },
  'REACT_APP_LOCKOUT_DURATION': {
    required: false,
    type: 'number',
    default: 15,
    description: 'Account lockout duration in minutes'
  },

  // ========================================
  // Supabase Configuration
  // ========================================
  'REACT_APP_SUPABASE_URL': {
    required: true,
    type: 'url',
    description: 'Supabase project URL for database and authentication'
  },
  'REACT_APP_SUPABASE_ANON_KEY': {
    required: true,
    type: 'string',
    sensitive: true,
    description: 'Supabase anonymous key for client-side operations'
  },
  'REACT_APP_SUPABASE_SERVICE_ROLE_KEY': {
    required: false,
    type: 'string',
    sensitive: true,
    description: 'Supabase service role key for server-side operations'
  },

  // ========================================
  // External Services Configuration
  // ========================================
  'REACT_APP_EXCHANGE_RATE_API_KEY': {
    required: false,
    type: 'string',
    sensitive: true,
    description: 'API key for exchange rate service'
  },
  'REACT_APP_EXCHANGE_RATE_BASE_URL': {
    required: false,
    type: 'url',
    default: 'https://api.exchangerate-api.com/v4',
    description: 'Base URL for exchange rate API'
  },
  'REACT_APP_EXCHANGE_RATE_CACHE_DURATION': {
    required: false,
    type: 'number',
    default: 60,
    description: 'Exchange rate cache duration in minutes'
  },
  'REACT_APP_ANALYTICS_TRACKING_ID': {
    required: false,
    type: 'string',
    description: 'Analytics service tracking ID'
  },

  // ========================================
  // Security Configuration
  // ========================================
  'REACT_APP_ALLOWED_ORIGINS': {
    required: false,
    type: 'string',
    default: '',
    description: 'Comma-separated list of allowed origins for CORS'
  },
  'REACT_APP_CSRF_ENABLED': {
    required: false,
    type: 'boolean',
    default: true,
    description: 'Enable CSRF protection'
  },
  'REACT_APP_HTTPS_ONLY': {
    required: false,
    type: 'boolean',
    default: false,
    description: 'Enforce HTTPS-only connections'
  },
  'REACT_APP_SECURITY_HEADERS': {
    required: false,
    type: 'boolean',
    default: true,
    description: 'Enable security headers'
  },

  // ========================================
  // Feature Flags
  // ========================================
  'REACT_APP_ENABLE_BIOMETRICS': {
    required: false,
    type: 'boolean',
    default: false,
    description: 'Enable biometric authentication (fingerprint, face recognition)'
  },
  'REACT_APP_ENABLE_PUSH_NOTIFICATIONS': {
    required: false,
    type: 'boolean',
    default: false,
    description: 'Enable push notifications for mobile users'
  },
  'REACT_APP_ENABLE_OFFLINE_MODE': {
    required: false,
    type: 'boolean',
    default: false,
    description: 'Enable offline mode with local data caching'
  },
  'REACT_APP_ENABLE_DARK_MODE': {
    required: false,
    type: 'boolean',
    default: true,
    description: 'Enable dark mode theme option'
  },
  'REACT_APP_ENABLE_ANALYTICS': {
    required: false,
    type: 'boolean',
    default: false,
    description: 'Enable user analytics and tracking'
  },

  // ========================================
  // Logging Configuration
  // ========================================
  'REACT_APP_LOG_LEVEL': {
    required: false,
    type: 'string',
    default: 'info',
    validation: (value: string) => ['error', 'warn', 'info', 'debug'].includes(value),
    description: 'Minimum logging level (error, warn, info, debug)'
  },
  'REACT_APP_ENABLE_LOGGING': {
    required: false,
    type: 'boolean',
    default: true,
    description: 'Enable application logging'
  },
  'REACT_APP_ENABLE_REMOTE_LOGGING': {
    required: false,
    type: 'boolean',
    default: false,
    description: 'Enable remote logging to external service'
  },
  'REACT_APP_LOG_ENDPOINT': {
    required: false,
    type: 'url',
    description: 'Endpoint URL for remote logging service'
  }
};