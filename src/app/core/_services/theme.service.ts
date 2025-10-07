import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark';

/**
 * ThemeService - Service to manage application theme (light/dark mode)
 *
 * Features:
 * - Persistent theme storage in localStorage
 * - System theme detection
 * - Reactive theme changes with signals
 * - Automatic DOM class management
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private document = inject(DOCUMENT);

  // Default theme is dark as requested
  private readonly STORAGE_KEY = 'bikerental-theme';
  private readonly DEFAULT_THEME: Theme = 'dark';

  // Current theme signal
  private themeSignal = signal<Theme>(this.getInitialTheme());

  // Public readonly theme
  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    // Apply theme changes to DOM automatically
    effect(() => {
      this.applyTheme(this.theme());
    });
  }

  /**
   * Get initial theme from localStorage or use default
   */
  private getInitialTheme(): Theme {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.STORAGE_KEY) as Theme;
      if (stored && (stored === 'light' || stored === 'dark')) {
        return stored;
      }
    }
    return this.DEFAULT_THEME;
  }

  /**
   * Set new theme
   */
  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
    this.saveTheme(theme);
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    const newTheme = this.theme() === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Check if current theme is dark
   */
  isDark(): boolean {
    return this.theme() === 'dark';
  }

  /**
   * Check if current theme is light
   */
  isLight(): boolean {
    return this.theme() === 'light';
  }

  /**
   * Save theme to localStorage
   */
  private saveTheme(theme: Theme): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, theme);
    }
  }

  /**
   * Apply theme to DOM by managing CSS classes
   */
  private applyTheme(theme: Theme): void {
    const htmlElement = this.document.documentElement;

    // Remove all theme classes first
    htmlElement.classList.remove('light-theme', 'dark-theme');

    // Add the current theme class
    htmlElement.classList.add(`${theme}-theme`);

    // Also set data attribute for CSS selectors
    htmlElement.setAttribute('data-theme', theme);
  }
}
