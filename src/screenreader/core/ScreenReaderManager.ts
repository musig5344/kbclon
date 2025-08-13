/**
 * Screen Reader Manager for KB StarBanking
 * Provides comprehensive screen reader support with Korean language optimization
 */

export interface AnnouncementOptions {
  priority: 'polite' | 'assertive' | 'off';
  interrupt?: boolean;
  delay?: number;
  language?: string;
}

export interface ScreenReaderConfig {
  language: string;
  verbosityLevel: 'minimal' | 'normal' | 'verbose';
  enableDescriptions: boolean;
  enableHints: boolean;
  speechRate: number;
  announceRoles: boolean;
  announceStates: boolean;
}

export class ScreenReaderManager {
  private static instance: ScreenReaderManager;
  private liveRegion: HTMLElement | null = null;
  private assertiveRegion: HTMLElement | null = null;
  private config: ScreenReaderConfig;
  private announceQueue: Array<{ message: string; options: AnnouncementOptions }> = [];
  private isProcessingQueue = false;

  private constructor() {
    this.config = {
      language: 'ko-KR',
      verbosityLevel: 'normal',
      enableDescriptions: true,
      enableHints: true,
      speechRate: 1.0,
      announceRoles: true,
      announceStates: true,
    };

    this.initialize();
  }

  public static getInstance(): ScreenReaderManager {
    if (!ScreenReaderManager.instance) {
      ScreenReaderManager.instance = new ScreenReaderManager();
    }
    return ScreenReaderManager.instance;
  }

  private initialize(): void {
    this.createLiveRegions();
    this.setupEventListeners();
  }

  private createLiveRegions(): void {
    // Polite live region
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.setAttribute('aria-relevant', 'text');
    this.liveRegion.className = 'sr-only';
    this.liveRegion.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    document.body.appendChild(this.liveRegion);

    // Assertive live region
    this.assertiveRegion = document.createElement('div');
    this.assertiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveRegion.setAttribute('aria-atomic', 'true');
    this.assertiveRegion.setAttribute('aria-relevant', 'text');
    this.assertiveRegion.className = 'sr-only';
    this.assertiveRegion.style.cssText = this.liveRegion.style.cssText;
    document.body.appendChild(this.assertiveRegion);
  }

  private setupEventListeners(): void {
    // Listen for focus changes to provide context
    document.addEventListener('focusin', this.handleFocusChange.bind(this));

    // Listen for route changes to announce page changes
    window.addEventListener('popstate', this.handleRouteChange.bind(this));
  }

  private handleFocusChange(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    const context = this.generateFocusContext(target);
    if (context && this.config.enableHints) {
      this.announce(context, { priority: 'polite', delay: 200 });
    }
  }

  private handleRouteChange(): void {
    const pageTitle = document.title;
    const announcement = `${pageTitle} 페이지로 이동했습니다.`;
    this.announce(announcement, { priority: 'assertive' });
  }

  private generateFocusContext(element: HTMLElement): string | null {
    const role = element.getAttribute('role');
    const ariaLabel = element.getAttribute('aria-label');
    const tagName = element.tagName.toLowerCase();

    // Generate context based on element type
    switch (tagName) {
      case 'button':
        return this.generateButtonContext(element);
      case 'input':
        return this.generateInputContext(element);
      case 'select':
        return this.generateSelectContext(element);
      case 'a':
        return this.generateLinkContext(element);
      default:
        return null;
    }
  }

  private generateButtonContext(button: HTMLElement): string {
    const text = button.textContent?.trim() || '';
    const ariaLabel = button.getAttribute('aria-label');
    const label = ariaLabel || text;

    return `${label} 버튼`;
  }

  private generateInputContext(input: HTMLInputElement): string {
    const type = input.type;
    const label = this.findInputLabel(input);
    const value = input.value;

    let context = '';

    if (label) {
      context += `${label} `;
    }

    switch (type) {
      case 'text':
        context += '텍스트 입력 필드';
        break;
      case 'password':
        context += '비밀번호 입력 필드';
        break;
      case 'email':
        context += '이메일 입력 필드';
        break;
      case 'number':
        context += '숫자 입력 필드';
        break;
      default:
        context += '입력 필드';
    }

    if (input.required) {
      context += ', 필수 항목';
    }

    if (value && type !== 'password') {
      context += `, 현재 값: ${value}`;
    }

    return context;
  }

  private generateSelectContext(select: HTMLSelectElement): string {
    const label = this.findInputLabel(select);
    const selectedOption = select.options[select.selectedIndex];
    const selectedText = selectedOption?.textContent || '';

    let context = '';

    if (label) {
      context += `${label} `;
    }

    context += '선택 상자';

    if (selectedText) {
      context += `, 현재 선택: ${selectedText}`;
    }

    context += `, ${select.options.length}개 옵션 중 ${select.selectedIndex + 1}번째`;

    return context;
  }

  private generateLinkContext(link: HTMLAnchorElement): string {
    const text = link.textContent?.trim() || '';
    const href = link.getAttribute('href');

    let context = `${text} 링크`;

    if (href && href.startsWith('http')) {
      context += ', 외부 링크';
    }

    return context;
  }

  private findInputLabel(input: HTMLElement): string | null {
    // Try aria-label first
    const ariaLabel = input.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Try aria-labelledby
    const labelledBy = input.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) return labelElement.textContent?.trim() || null;
    }

    // Try associated label element
    const id = input.getAttribute('id');
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent?.trim() || null;
    }

    // Try parent label
    const parentLabel = input.closest('label');
    if (parentLabel) {
      return parentLabel.textContent?.replace(input.textContent || '', '').trim() || null;
    }

    return null;
  }

  public announce(message: string, options: Partial<AnnouncementOptions> = {}): void {
    const fullOptions: AnnouncementOptions = {
      priority: 'polite',
      interrupt: false,
      delay: 0,
      language: this.config.language,
      ...options,
    };

    if (fullOptions.interrupt && this.isProcessingQueue) {
      this.announceQueue = [];
    }

    this.announceQueue.push({ message, options: fullOptions });
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.announceQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.announceQueue.length > 0) {
      const { message, options } = this.announceQueue.shift()!;

      if (options.delay) {
        await this.delay(options.delay);
      }

      const region = options.priority === 'assertive' ? this.assertiveRegion : this.liveRegion;

      if (region) {
        // Clear previous message
        region.textContent = '';

        // Add new message
        setTimeout(() => {
          region.textContent = this.formatMessage(message, options);
        }, 10);

        // Wait for screen reader to process
        await this.delay(100);
      }
    }

    this.isProcessingQueue = false;
  }

  private formatMessage(message: string, options: AnnouncementOptions): string {
    let formattedMessage = message;

    // Add language context if different from default
    if (options.language && options.language !== this.config.language) {
      formattedMessage = `[${options.language}] ${formattedMessage}`;
    }

    // Add verbosity based on configuration
    if (this.config.verbosityLevel === 'verbose') {
      const timestamp = new Date().toLocaleTimeString('ko-KR');
      formattedMessage = `${timestamp}. ${formattedMessage}`;
    }

    return formattedMessage;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public updateConfig(newConfig: Partial<ScreenReaderConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): ScreenReaderConfig {
    return { ...this.config };
  }

  // Banking-specific announcement helpers
  public announceBalance(amount: number, currency: string = '원'): void {
    const formattedAmount = this.formatCurrency(amount);
    this.announce(`잔액 ${formattedAmount}${currency}`, { priority: 'polite' });
  }

  public announceTransaction(type: string, amount: number, account?: string): void {
    const formattedAmount = this.formatCurrency(amount);
    let message = `${type} ${formattedAmount}원`;

    if (account) {
      message += ` ${account}`;
    }

    message += ' 완료';

    this.announce(message, { priority: 'assertive' });
  }

  public announceError(error: string, suggestion?: string): void {
    let message = `오류: ${error}`;

    if (suggestion) {
      message += `. ${suggestion}`;
    }

    this.announce(message, { priority: 'assertive' });
  }

  public announcePageLoad(title: string, mainContent?: string): void {
    let message = `${title} 페이지 로드됨`;

    if (mainContent && this.config.enableDescriptions) {
      message += `. ${mainContent}`;
    }

    this.announce(message, { priority: 'assertive' });
  }

  public announceFormValidation(field: string, error: string): void {
    const message = `${field} 필드 오류: ${error}`;
    this.announce(message, { priority: 'assertive' });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ko-KR').format(amount);
  }

  // Screen reader state management
  public isScreenReaderActive(): boolean {
    // Check if screen reader is likely active
    return (
      // Check for high contrast mode (often used with screen readers)
      window.matchMedia('(prefers-contrast: high)').matches ||
      // Check for reduced motion (often used with screen readers)
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      // Check for specific screen reader user agents
      /JAWS|NVDA|ORCA|VoiceOver|TalkBack/i.test(navigator.userAgent)
    );
  }

  public enableVerboseMode(): void {
    this.updateConfig({ verbosityLevel: 'verbose' });
    this.announce('상세 모드가 활성화되었습니다', { priority: 'polite' });
  }

  public disableVerboseMode(): void {
    this.updateConfig({ verbosityLevel: 'normal' });
    this.announce('일반 모드로 변경되었습니다', { priority: 'polite' });
  }

  public cleanup(): void {
    if (this.liveRegion) {
      document.body.removeChild(this.liveRegion);
      this.liveRegion = null;
    }

    if (this.assertiveRegion) {
      document.body.removeChild(this.assertiveRegion);
      this.assertiveRegion = null;
    }

    document.removeEventListener('focusin', this.handleFocusChange);
    window.removeEventListener('popstate', this.handleRouteChange);
  }
}
