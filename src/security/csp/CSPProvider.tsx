import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import { CSPManager, CSPConfig } from './CSPManager';

interface CSPContextValue {
  cspManager: CSPManager;
  nonce: string | null;
  isCSPActive: boolean;
  violations: CSPViolation[];
  addTrustedScript: (script: string) => void;
  refreshNonce: () => void;
}

interface CSPViolation {
  id: string;
  timestamp: number;
  directive: string;
  blockedURI: string;
  violatedDirective: string;
  originalPolicy: string;
  sourceFile?: string;
  lineNumber?: number;
  columnNumber?: number;
}

const CSPContext = createContext<CSPContextValue | null>(null);

interface CSPProviderProps {
  children: ReactNode;
  config: CSPConfig;
}

export const CSPProvider: React.FC<CSPProviderProps> = ({ children, config }) => {
  const [cspManager] = useState(() => new CSPManager(config));
  const [nonce, setNonce] = useState<string | null>(null);
  const [isCSPActive, setIsCSPActive] = useState(false);
  const [violations, setViolations] = useState<CSPViolation[]>([]);

  useEffect(() => {
    // Initialize CSP
    initializeCSP();
    
    // Set up CSP violation reporting
    setupViolationReporting();
    
    // Create banking-specific Trusted Types policy
    cspManager.createBankingTrustedTypesPolicy();
    
    return () => {
      // Cleanup
      document.removeEventListener('securitypolicyviolation', handleCSPViolation);
    };
  }, [cspManager]);

  const initializeCSP = () => {
    try {
      // Generate CSP header
      const cspHeader = cspManager.generateCSPHeader();
      const additionalHeaders = cspManager.generateAdditionalSecurityHeaders();
      
      // Apply CSP via meta tag (for client-side applications)
      const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (existingMeta) {
        existingMeta.remove();
      }
      
      const metaCSP = document.createElement('meta');
      metaCSP.httpEquiv = 'Content-Security-Policy';
      metaCSP.content = cspHeader;
      document.head.appendChild(metaCSP);
      
      // Apply additional security headers via meta tags where possible
      Object.entries(additionalHeaders).forEach(([name, value]) => {
        if (name === 'Referrer-Policy') {
          const existing = document.querySelector('meta[name="referrer"]');
          if (existing) existing.remove();
          
          const meta = document.createElement('meta');
          meta.name = 'referrer';
          meta.content = value;
          document.head.appendChild(meta);
        }
      });
      
      // Update nonce
      setNonce(cspManager.getNonce());
      setIsCSPActive(cspManager.validateCurrentCSP());
      
      
    } catch (error) {
      console.error('Failed to initialize CSP:', error);
      setIsCSPActive(false);
    }
  };

  const setupViolationReporting = () => {
    document.addEventListener('securitypolicyviolation', handleCSPViolation);
  };

  const handleCSPViolation = (event: SecurityPolicyViolationEvent) => {
    const violation: CSPViolation = {
      id: generateViolationId(),
      timestamp: Date.now(),
      directive: event.effectiveDirective,
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber,
      columnNumber: event.columnNumber,
    };

    setViolations(prev => [...prev.slice(-99), violation]); // Keep last 100 violations

    // Log violation
    console.warn('CSP Violation detected:', violation);

    // Report to monitoring service in production
    if (config.environment === 'production') {
      reportViolationToService(violation);
    }

    // Show developer warning in development
    if (config.environment === 'development') {
      showDeveloperWarning(violation);
    }
  };

  const generateViolationId = (): string => {
    return `csp-violation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const reportViolationToService = async (violation: CSPViolation) => {
    try {
      // In a real application, send to your monitoring service
      
      // Example: send to monitoring API
      // await fetch('/api/security/csp-violations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(violation)
      // });
    } catch (error) {
      console.error('Failed to report CSP violation:', error);
    }
  };

  const showDeveloperWarning = (violation: CSPViolation) => {
    const message = `
CSP Violation Detected!
Directive: ${violation.directive}
Blocked URI: ${violation.blockedURI}
Source: ${violation.sourceFile}:${violation.lineNumber}:${violation.columnNumber}

This indicates a potential security issue or misconfiguration.
Please review your CSP settings and ensure all resources are properly whitelisted.
    `.trim();

    console.warn(message);
    
    // Show visual warning in development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const warning = document.createElement('div');
      warning.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #ff4444;
        color: white;
        padding: 10px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
        z-index: 999999;
        max-width: 300px;
        word-wrap: break-word;
      `;
      warning.textContent = `CSP Violation: ${violation.directive} - ${violation.blockedURI}`;
      
      document.body.appendChild(warning);
      
      setTimeout(() => {
        document.body.removeChild(warning);
      }, 5000);
    }
  };

  const addTrustedScript = (script: string) => {
    cspManager.addHashSource(script);
    // Regenerate CSP to include new hash
    initializeCSP();
  };

  const refreshNonce = () => {
    cspManager.refreshNonce();
    setNonce(cspManager.getNonce());
    initializeCSP();
  };

  const contextValue: CSPContextValue = {
    cspManager,
    nonce,
    isCSPActive,
    violations,
    addTrustedScript,
    refreshNonce,
  };

  return (
    <CSPContext.Provider value={contextValue}>
      {children}
    </CSPContext.Provider>
  );
};

export const useCSP = (): CSPContextValue => {
  const context = useContext(CSPContext);
  if (!context) {
    throw new Error('useCSP must be used within a CSPProvider');
  }
  return context;
};

// Hook for secure script execution
export const useSecureScript = () => {
  const { nonce, addTrustedScript } = useCSP();

  const executeSecureScript = (script: string) => {
    if (nonce) {
      const scriptElement = document.createElement('script');
      scriptElement.nonce = nonce;
      scriptElement.textContent = script;
      document.head.appendChild(scriptElement);
      return scriptElement;
    } else {
      // Fallback: add to trusted hashes
      addTrustedScript(script);
      const scriptElement = document.createElement('script');
      scriptElement.textContent = script;
      document.head.appendChild(scriptElement);
      return scriptElement;
    }
  };

  const loadSecureScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      if (nonce) {
        script.nonce = nonce;
      }
      script.src = src;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  return {
    executeSecureScript,
    loadSecureScript,
    nonce,
  };
};

// Hook for inline styles with CSP
export const useSecureStyle = () => {
  const { nonce } = useCSP();

  const addSecureStyle = (css: string, id?: string) => {
    const styleElement = document.createElement('style');
    if (id) {
      styleElement.id = id;
      // Remove existing style with same ID
      const existing = document.getElementById(id);
      if (existing) {
        existing.remove();
      }
    }
    
    if (nonce) {
      styleElement.nonce = nonce;
    }
    
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
    return styleElement;
  };

  return {
    addSecureStyle,
    nonce,
  };
};

// CSP Status Component
export const CSPStatus: React.FC<{ showDetails?: boolean }> = ({ showDetails = false }) => {
  const { isCSPActive, violations, nonce } = useCSP();

  if (!showDetails) {
    return (
      <div style={{ 
        position: 'fixed', 
        bottom: '10px', 
        left: '10px', 
        background: isCSPActive ? '#4CAF50' : '#FF5722',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999,
        display: process.env.NODE_ENV === 'development' ? 'block' : 'none'
      }}>
        CSP: {isCSPActive ? 'Active' : 'Inactive'}
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px',
      maxWidth: '400px',
      zIndex: 9999,
      display: process.env.NODE_ENV === 'development' ? 'block' : 'none'
    }}>
      <h4>CSP Status</h4>
      <p>Status: {isCSPActive ? '✅ Active' : '❌ Inactive'}</p>
      <p>Nonce: {nonce ? '✅ Generated' : '❌ None'}</p>
      <p>Violations: {violations.length}</p>
      
      {violations.length > 0 && (
        <details>
          <summary>Recent Violations ({violations.length})</summary>
          <div style={{ maxHeight: '200px', overflow: 'auto', marginTop: '8px' }}>
            {violations.slice(-5).map(violation => (
              <div key={violation.id} style={{ 
                borderBottom: '1px solid #333', 
                padding: '4px 0',
                fontSize: '10px'
              }}>
                <strong>{violation.directive}</strong><br />
                {violation.blockedURI}<br />
                <small>{new Date(violation.timestamp).toLocaleTimeString()}</small>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

// Higher-order component for CSP-protected components
export const withCSPProtection = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const CSPProtectedComponent = (props: P) => {
    const { isCSPActive } = useCSP();
    
    if (!isCSPActive) {
      console.warn(`Component ${Component.name} loaded without active CSP protection`);
    }
    
    return <Component {...props} />;
  };
  
  CSPProtectedComponent.displayName = `withCSPProtection(${Component.displayName || Component.name})`;
  
  return CSPProtectedComponent;
};