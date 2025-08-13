/**
 * CSP Test Utilities
 *
 * CSP 설정 검증 및 테스트를 위한 유틸리티 함수들
 * - CSP 정책 검증
 * - 보안 테스트 시뮬레이션
 * - 개발 도구 통합
 * - 자동화된 테스트 지원
 */

import { CSPManager, CSPConfig } from './CSPManager';

// 테스트 결과 인터페이스
interface CSPTestResult {
  passed: boolean;
  testName: string;
  description: string;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// 보안 테스트 케이스
interface SecurityTestCase {
  name: string;
  description: string;
  testType: 'script' | 'style' | 'image' | 'frame' | 'connect' | 'general';
  payload: string;
  shouldBlock: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

class CSPTestUtils {
  private cspManager: CSPManager;

  constructor(config?: CSPConfig) {
    this.cspManager = config ? new CSPManager(config) : new CSPManager();
  }

  /**
   * 종합적인 CSP 보안 테스트 실행
   */
  async runSecurityTestSuite(config: CSPConfig): Promise<CSPTestResult[]> {
    const results: CSPTestResult[] = [];

    // 기본 보안 검증
    results.push(await this.testBasicSecurity(config));

    // XSS 방어 테스트
    results.push(await this.testXSSProtection(config));

    // 데이터 누출 방지 테스트
    results.push(await this.testDataLeakProtection(config));

    // 클릭재킹 방어 테스트
    results.push(await this.testClickjackingProtection(config));

    // 스크립트 주입 방어 테스트
    results.push(await this.testScriptInjectionProtection(config));

    // 리소스 로딩 보안 테스트
    results.push(await this.testResourceLoadingSecurity(config));

    return results;
  }

  /**
   * 기본 보안 설정 검증
   */
  private async testBasicSecurity(config: CSPConfig): Promise<CSPTestResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // default-src 검증
    const defaultSrc = config.customDirectives?.['default-src'];
    if (
      !defaultSrc ||
      defaultSrc.includes("'unsafe-inline'") ||
      defaultSrc.includes("'unsafe-eval'")
    ) {
      errors.push("default-src should not include 'unsafe-inline' or 'unsafe-eval'");
    }
    if (!defaultSrc || defaultSrc.includes('*')) {
      errors.push('default-src should not use wildcard (*)');
    }

    // script-src 검증
    const scriptSrc = config.customDirectives?.['script-src'];
    if (scriptSrc?.includes("'unsafe-eval'") && config.environment === 'production') {
      errors.push("'unsafe-eval' should not be used in production");
    }
    if (scriptSrc?.includes("'unsafe-inline'") && config.environment === 'production') {
      errors.push("'unsafe-inline' should not be used in production for scripts");
    }

    // object-src 검증
    const objectSrc = config.customDirectives?.['object-src'];
    if (!objectSrc || !objectSrc.includes("'none'")) {
      warnings.push("Consider setting object-src to 'none' for better security");
    }

    // base-uri 검증
    const baseUri = config.customDirectives?.['base-uri'];
    if (!baseUri || !baseUri.includes("'self'")) {
      warnings.push("Consider restricting base-uri to 'self'");
    }

    // frame-ancestors 검증
    const frameAncestors = config.customDirectives?.['frame-ancestors'];
    if (!frameAncestors) {
      suggestions.push('Add frame-ancestors directive to prevent clickjacking');
    }

    return {
      passed: errors.length === 0,
      testName: 'Basic Security',
      description: 'Validates fundamental CSP security settings',
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * XSS 방어 테스트
   */
  private async testXSSProtection(config: CSPConfig): Promise<CSPTestResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const xssTestCases: SecurityTestCase[] = [
      {
        name: 'Inline Script XSS',
        description: 'Tests if inline scripts are blocked',
        testType: 'script',
        payload: '<script>alert("XSS")</script>',
        shouldBlock: true,
        riskLevel: 'critical',
      },
      {
        name: 'Event Handler XSS',
        description: 'Tests if event handlers are blocked',
        testType: 'script',
        payload: '<img src=x onerror="alert(\'XSS\')">',
        shouldBlock: true,
        riskLevel: 'high',
      },
      {
        name: 'JavaScript URL XSS',
        description: 'Tests if javascript: URLs are blocked',
        testType: 'script',
        payload: '<a href="javascript:alert(\'XSS\')">Click</a>',
        shouldBlock: true,
        riskLevel: 'high',
      },
    ];

    for (const testCase of xssTestCases) {
      const isBlocked = this.simulateCSPTest(config, testCase);
      if (!isBlocked && testCase.shouldBlock) {
        if (testCase.riskLevel === 'critical') {
          errors.push(`${testCase.name}: ${testCase.description} - NOT BLOCKED`);
        } else {
          warnings.push(`${testCase.name}: ${testCase.description} - NOT BLOCKED`);
        }
      }
    }

    // Trusted Types 검증
    if (config.enableTrustedTypes && config.environment === 'production') {
      const trustedTypes = config.customDirectives?.['trusted-types'];
      if (!trustedTypes) {
        warnings.push('Trusted Types enabled but no policies defined');
      }
    }

    return {
      passed: errors.length === 0,
      testName: 'XSS Protection',
      description: 'Tests Cross-Site Scripting attack prevention',
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * 데이터 누출 방지 테스트
   */
  private async testDataLeakProtection(config: CSPConfig): Promise<CSPTestResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // connect-src 검증
    const connectSrc = config.customDirectives?.['connect-src'];
    if (connectSrc?.includes('*')) {
      errors.push('connect-src should not use wildcard for data leak prevention');
    }

    // img-src 검증 (tracking pixels)
    const imgSrc = config.customDirectives?.['img-src'];
    if (imgSrc?.includes('*')) {
      warnings.push('img-src wildcard may allow tracking pixels');
    }

    // frame-src 검증
    const frameSrc = config.customDirectives?.['frame-src'];
    if (frameSrc && !frameSrc.includes("'none'") && frameSrc.includes('*')) {
      warnings.push('frame-src wildcard may allow data exfiltration');
    }

    return {
      passed: errors.length === 0,
      testName: 'Data Leak Protection',
      description: 'Tests prevention of data exfiltration',
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * 클릭재킹 방어 테스트
   */
  private async testClickjackingProtection(config: CSPConfig): Promise<CSPTestResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const frameAncestors = config.customDirectives?.['frame-ancestors'];

    if (!frameAncestors || frameAncestors.includes('*')) {
      errors.push('frame-ancestors should be set to prevent clickjacking attacks');
    }

    if (
      frameAncestors &&
      !frameAncestors.includes("'none'") &&
      !frameAncestors.includes("'self'")
    ) {
      warnings.push("Consider using frame-ancestors 'none' or 'self' for banking apps");
    }

    return {
      passed: errors.length === 0,
      testName: 'Clickjacking Protection',
      description: 'Tests prevention of clickjacking attacks',
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * 스크립트 주입 방어 테스트
   */
  private async testScriptInjectionProtection(config: CSPConfig): Promise<CSPTestResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const scriptSrc = config.customDirectives?.['script-src'];

    // 'strict-dynamic' 사용 검증
    if (
      config.environment === 'production' &&
      (!scriptSrc || !scriptSrc.includes("'strict-dynamic'"))
    ) {
      suggestions.push("Consider using 'strict-dynamic' for better script security");
    }

    // nonce 사용 검증
    if (scriptSrc && !scriptSrc.some(src => src.includes('nonce'))) {
      suggestions.push('Consider using nonce for inline scripts');
    }

    // 외부 스크립트 도메인 검증
    const externalDomains =
      scriptSrc?.filter(
        src => src.startsWith('https://') && !src.includes('self') && !src.includes('localhost')
      ) || [];

    if (externalDomains.length > 10) {
      warnings.push(`High number of external script domains (${externalDomains.length})`);
    }

    return {
      passed: errors.length === 0,
      testName: 'Script Injection Protection',
      description: 'Tests prevention of malicious script injection',
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * 리소스 로딩 보안 테스트
   */
  private async testResourceLoadingSecurity(config: CSPConfig): Promise<CSPTestResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // HTTP 리소스 검증
    const allDirectives = config.customDirectives || {};
    const httpSources: string[] = [];

    Object.entries(allDirectives).forEach(([directive, sources]) => {
      sources.forEach(source => {
        if (source.startsWith('http://') && !source.includes('localhost')) {
          httpSources.push(`${directive}: ${source}`);
        }
      });
    });

    if (httpSources.length > 0) {
      errors.push(`HTTP sources found (should use HTTPS): ${httpSources.join(', ')}`);
    }

    // data: URL 사용 검증
    const imgSrc = allDirectives['img-src'];
    if (imgSrc?.includes('data:')) {
      warnings.push('data: URLs in img-src may allow data injection');
    }

    return {
      passed: errors.length === 0,
      testName: 'Resource Loading Security',
      description: 'Tests secure resource loading policies',
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * CSP 테스트 시뮬레이션
   */
  private simulateCSPTest(config: CSPConfig, testCase: SecurityTestCase): boolean {
    // 간단한 시뮬레이션 로직
    const directives = config.customDirectives || {};

    switch (testCase.testType) {
      case 'script':
        const scriptSrc = directives['script-src'] || [];
        return !scriptSrc.includes("'unsafe-inline'") && !scriptSrc.includes("'unsafe-eval'");

      case 'style':
        const styleSrc = directives['style-src'] || [];
        return !styleSrc.includes("'unsafe-inline'");

      default:
        return true;
    }
  }

  /**
   * CSP 헤더 구문 검증
   */
  validateCSPSyntax(cspHeader: string): CSPTestResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    try {
      // 기본 구문 검증
      const directives = cspHeader
        .split(';')
        .map(d => d.trim())
        .filter(d => d);

      for (const directive of directives) {
        const [name, ...values] = directive.split(/\s+/);

        if (!name) {
          errors.push('Empty directive found');
          continue;
        }

        // 알려진 지시어 검증
        const knownDirectives = [
          'default-src',
          'script-src',
          'style-src',
          'img-src',
          'connect-src',
          'font-src',
          'object-src',
          'media-src',
          'frame-src',
          'child-src',
          'worker-src',
          'manifest-src',
          'base-uri',
          'form-action',
          'frame-ancestors',
        ];

        if (!knownDirectives.includes(name)) {
          warnings.push(`Unknown directive: ${name}`);
        }

        // 값 검증
        if (values.length === 0) {
          errors.push(`Directive ${name} has no values`);
        }

        // 따옴표 검증
        values.forEach(value => {
          if (value.startsWith("'") && !value.endsWith("'")) {
            errors.push(`Malformed quoted value: ${value}`);
          }
        });
      }
    } catch (error) {
      errors.push(`CSP parsing error: ${error}`);
    }

    return {
      passed: errors.length === 0,
      testName: 'CSP Syntax Validation',
      description: 'Validates CSP header syntax and structure',
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * 성능 영향 분석
   */
  analyzePerformanceImpact(config: CSPConfig): {
    score: number; // 1-100
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    const directives = config.customDirectives || {};

    // 과도한 도메인 확인
    Object.entries(directives).forEach(([directive, sources]) => {
      const domainCount = sources.filter(s => s.startsWith('https://')).length;
      if (domainCount > 20) {
        score -= 10;
        issues.push(`${directive} has too many domains (${domainCount})`);
        recommendations.push(`Reduce number of domains in ${directive}`);
      }
    });

    // 'unsafe-eval' 사용 확인
    const scriptSrc = directives['script-src'] || [];
    if (scriptSrc.includes("'unsafe-eval'")) {
      score -= 20;
      issues.push("'unsafe-eval' may impact performance");
      recommendations.push("Avoid 'unsafe-eval' and use secure alternatives");
    }

    return { score: Math.max(0, score), issues, recommendations };
  }

  /**
   * 호환성 검사
   */
  checkBrowserCompatibility(config: CSPConfig): {
    supported: string[];
    partialSupport: string[];
    notSupported: string[];
  } {
    const supported: string[] = [];
    const partialSupport: string[] = [];
    const notSupported: string[] = [];

    const directives = config.customDirectives || {};

    Object.keys(directives).forEach(directive => {
      switch (directive) {
        case 'default-src':
        case 'script-src':
        case 'style-src':
        case 'img-src':
          supported.push(`${directive}: All modern browsers`);
          break;

        case 'worker-src':
          partialSupport.push(`${directive}: Limited support in older browsers`);
          break;

        case 'trusted-types':
          if (config.enableTrustedTypes) {
            partialSupport.push(`${directive}: Chrome 83+, experimental in other browsers`);
          }
          break;

        default:
          supported.push(`${directive}: Most modern browsers`);
      }
    });

    return { supported, partialSupport, notSupported };
  }

  /**
   * 보고서 생성
   */
  generateTestReport(results: CSPTestResult[]): string {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    let report = `
# CSP Security Test Report

## Summary
- Total Tests: ${totalTests}
- Passed: ${passedTests}
- Failed: ${failedTests}
- Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%

## Test Results
`;

    results.forEach(result => {
      report += `
### ${result.testName} ${result.passed ? '✅' : '❌'}
${result.description}

`;

      if (result.errors.length > 0) {
        report += `**Errors:**
${result.errors.map(e => `- ${e}`).join('\n')}

`;
      }

      if (result.warnings.length > 0) {
        report += `**Warnings:**
${result.warnings.map(w => `- ${w}`).join('\n')}

`;
      }

      if (result.suggestions.length > 0) {
        report += `**Suggestions:**
${result.suggestions.map(s => `- ${s}`).join('\n')}

`;
      }
    });

    return report;
  }
}

// 유틸리티 함수들
export const validateCSPConfig = async (config: CSPConfig): Promise<CSPTestResult[]> => {
  const testUtils = new CSPTestUtils(config);
  return await testUtils.runSecurityTestSuite(config);
};

export const generateCSPTestReport = async (config: CSPConfig): Promise<string> => {
  const testUtils = new CSPTestUtils(config);
  const results = await testUtils.runSecurityTestSuite(config);
  return testUtils.generateTestReport(results);
};

export default CSPTestUtils;
export type { CSPTestResult, SecurityTestCase };
