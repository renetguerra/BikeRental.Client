import { Injectable } from '@angular/core';

/**
 * Service to filter and handle browser extension errors
 * Prevents spam of irrelevant errors in the console during development
 */
@Injectable({
  providedIn: 'root'
})
export class ConsoleErrorFilterService {
  private readonly extensionErrorPatterns = [
    'content_script_bundle.js',
    'Attempting to use a disconnected port object',
    'Extension context invalidated',
    'chrome-extension://',
    'moz-extension://',
    'safari-extension://',
    'disconnected port object',
    'Port error: Could not establish connection',
    'Error: A listener indicated an asynchronous response by returning true'
  ];

  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;
  private isInitialized = false;

  constructor() {
    this.originalConsoleError = console.error.bind(console);
    this.originalConsoleWarn = console.warn.bind(console);
  }

  /**
   * Initialize the error filtering system
   * Should be called once during application startup
   */
  initialize(): void {
    if (this.isInitialized) {
      console.warn('ConsoleErrorFilterService is already initialized');
      return;
    }

    this.setupConsoleOverrides();
    this.setupGlobalErrorHandlers();
    this.isInitialized = true;

    console.log('🧹 Console Error Filter activated - Browser extension errors will be filtered');
  }

  /**
   * Restore original console methods and remove global handlers
   * Useful for testing or debugging
   */
  destroy(): void {
    if (!this.isInitialized) return;

    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
    this.isInitialized = false;

    console.log('Console Error Filter deactivated');
  }

  /**
   * Check if an error message should be filtered out
   */
  private shouldFilterError(message: unknown): boolean {
    const messageString = this.convertToString(message);

    return this.extensionErrorPatterns.some(pattern =>
      messageString.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Convert any value to string safely
   */
  private convertToString(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return '';

    try {
      if (typeof value === 'object' && 'message' in value) {
        return String((value as { message: unknown }).message);
      }
      return String(value);
    } catch {
      return '';
    }
  }

  /**
   * Override console methods to filter extension errors
   */
  private setupConsoleOverrides(): void {
    console.error = (...args: unknown[]) => {
      const message = args.join(' ');

      if (!this.shouldFilterError(message)) {
        this.originalConsoleError(...args);
      }
      // Extension errors are silently ignored
    };

    console.warn = (...args: unknown[]) => {
      const message = args.join(' ');

      if (!this.shouldFilterError(message)) {
        this.originalConsoleWarn(...args);
      }
      // Extension warnings are silently ignored
    };
  }

  /**
   * Setup global error handlers to catch unhandled errors
   */
  private setupGlobalErrorHandlers(): void {
    // Handle global JavaScript errors
    window.addEventListener('error', (event: ErrorEvent) => {
      if (this.shouldFilterError(event.message || event.error)) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    }, true);

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const reasonString = this.convertToString(reason);

      if (this.shouldFilterError(reasonString)) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    }, true);
  }

  /**
   * Add a new pattern to filter
   */
  addFilterPattern(pattern: string): void {
    if (!this.extensionErrorPatterns.includes(pattern)) {
      this.extensionErrorPatterns.push(pattern);
    }
  }

  /**
   * Remove a filter pattern
   */
  removeFilterPattern(pattern: string): void {
    const index = this.extensionErrorPatterns.indexOf(pattern);
    if (index > -1) {
      this.extensionErrorPatterns.splice(index, 1);
    }
  }

  /**
   * Get current filter patterns (read-only)
   */
  getFilterPatterns(): readonly string[] {
    return [...this.extensionErrorPatterns];
  }
}