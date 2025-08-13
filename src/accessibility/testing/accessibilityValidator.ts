/**
 * KB 스타뱅킹 접근성 검증 도구
 * WCAG 2.1 AA 준수 검증
 */

export interface ValidationError {
  severity: 'error' | 'warning';
  message: string;
  element?: HTMLElement;
  rule?: string;
}

export interface ValidationResult {
  passed: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  score: number;
}

export class AccessibilityValidator {
  private errors: ValidationError[] = [];
  private warnings: ValidationError[] = [];

  /**
   * 페이지 전체 접근성 검증
   */
  async validatePage(): Promise<ValidationResult> {
    this.errors = [];
    this.warnings = [];

    // 1. 이미지 대체 텍스트 검증
    this.validateImages();

    // 2. 폼 레이블 검증
    this.validateForms();

    // 3. 색상 대비 검증
    this.validateColorContrast();

    // 4. 키보드 접근성 검증
    this.validateKeyboardAccess();

    // 5. ARIA 속성 검증
    this.validateARIA();

    // 6. 헤딩 구조 검증
    this.validateHeadings();

    const score = this.calculateScore();

    return {
      passed: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      score,
    };
  }

  /**
   * 이미지 대체 텍스트 검증
   */
  private validateImages(): void {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt && !img.getAttribute('role')) {
        this.errors.push({
          severity: 'error',
          message: `이미지에 대체 텍스트가 없습니다: ${img.src}`,
          element: img as HTMLElement,
          rule: 'WCAG 1.1.1',
        });
      }
    });
  }

  /**
   * 폼 레이블 검증
   */
  private validateForms(): void {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledby = input.getAttribute('aria-labelledby');

      if (!id || (!document.querySelector(`label[for="${id}"]`) && !ariaLabel && !ariaLabelledby)) {
        this.warnings.push({
          severity: 'warning',
          message: `폼 요소에 레이블이 없습니다: ${input.tagName}`,
          element: input as HTMLElement,
          rule: 'WCAG 3.3.2',
        });
      }
    });
  }

  /**
   * 색상 대비 검증
   */
  private validateColorContrast(): void {
    // 간단한 색상 대비 검증 (실제로는 더 복잡한 로직 필요)
    const texts = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    texts.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const fontSize = parseFloat(computedStyle.fontSize);

      // 작은 텍스트는 더 높은 대비 필요
      if (fontSize < 14) {
        // 실제 대비 계산 로직 필요
      }
    });
  }

  /**
   * 키보드 접근성 검증
   */
  private validateKeyboardAccess(): void {
    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]'
    );
    interactiveElements.forEach(element => {
      const tabindex = element.getAttribute('tabindex');
      if (tabindex && parseInt(tabindex) > 0) {
        this.warnings.push({
          severity: 'warning',
          message: `양수 tabindex 사용 지양: ${element.tagName}`,
          element: element as HTMLElement,
          rule: 'WCAG 2.4.3',
        });
      }
    });
  }

  /**
   * ARIA 속성 검증
   */
  private validateARIA(): void {
    const ariaElements = document.querySelectorAll('[role]');
    ariaElements.forEach(element => {
      const role = element.getAttribute('role');

      // 필수 ARIA 속성 검증
      switch (role) {
        case 'button':
          if (!element.getAttribute('aria-label') && !element.textContent?.trim()) {
            this.errors.push({
              severity: 'error',
              message: `버튼에 접근 가능한 이름이 없습니다`,
              element: element as HTMLElement,
              rule: 'WCAG 4.1.2',
            });
          }
          break;
        case 'navigation':
          if (!element.getAttribute('aria-label')) {
            this.warnings.push({
              severity: 'warning',
              message: `네비게이션에 aria-label이 없습니다`,
              element: element as HTMLElement,
              rule: 'WCAG 1.3.1',
            });
          }
          break;
      }
    });
  }

  /**
   * 헤딩 구조 검증
   */
  private validateHeadings(): void {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;

    headings.forEach(heading => {
      const level = parseInt(heading.tagName[1]);

      if (level - lastLevel > 1 && lastLevel !== 0) {
        this.warnings.push({
          severity: 'warning',
          message: `헤딩 레벨 건너뜀: ${lastLevel} → ${level}`,
          element: heading as HTMLElement,
          rule: 'WCAG 1.3.1',
        });
      }

      lastLevel = level;
    });

    // h1 태그가 여러 개인지 확인
    const h1Count = document.querySelectorAll('h1').length;
    if (h1Count > 1) {
      this.warnings.push({
        severity: 'warning',
        message: `페이지에 h1 태그가 ${h1Count}개 있습니다`,
        rule: 'WCAG 1.3.1',
      });
    }
  }

  /**
   * 점수 계산
   */
  private calculateScore(): number {
    const baseScore = 100;
    const errorPenalty = this.errors.length * 10;
    const warningPenalty = this.warnings.length * 5;

    return Math.max(0, baseScore - errorPenalty - warningPenalty);
  }
}

/**
 * 페이지 접근성 검증
 */
export async function validateAccessibility(): Promise<ValidationResult> {
  const validator = new AccessibilityValidator();
  return validator.validatePage();
}

/**
 * WCAG 기준별 검증
 */
export async function validateWCAGCriteria(criteria: string): Promise<boolean> {
  const result = await validateAccessibility();

  // 특정 기준에 대한 검증
  const relevantErrors = result.errors.filter(error => error.rule === criteria);
  const relevantWarnings = result.warnings.filter(warning => warning.rule === criteria);

  return relevantErrors.length === 0 && relevantWarnings.length === 0;
}
