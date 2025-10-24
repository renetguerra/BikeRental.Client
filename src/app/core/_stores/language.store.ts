import { Injectable, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class LanguageStore {
  // Signal that holds the current active language
  private _activeLang = signal<string>('en');
  public readonly activeLangSignal = this._activeLang.asReadonly();

  constructor(private translocoService: TranslocoService) {
    // Synchronize the signal with Transloco's language changes
    this.translocoService.langChanges$.subscribe(lang => {
      this._activeLang.set(lang);
    });
    // Initialize the language in Transloco
    this.translocoService.setActiveLang(this._activeLang());
  }

  // Set the active language and update both Transloco and the signal
  setActiveLang(lang: string): void {
    this.translocoService.setActiveLang(lang);
    this._activeLang.set(lang);
  }

  // Get the current active language value
  getActiveLang(): string {
    return this._activeLang();
  }
}
