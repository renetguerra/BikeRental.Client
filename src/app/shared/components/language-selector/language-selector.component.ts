import { Component, inject, effect, signal } from '@angular/core';
import { LanguageStore } from '../../../core/_stores/language.store';
import { TranslocoModule } from '@jsverse/transloco';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [TranslocoModule, MatFormFieldModule, MatIconModule, MatSelectModule, MatOptionModule,
    MatTooltipModule, BsDropdownModule, CollapseModule],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.css']
})
export class LanguageSelectorComponent {
  public languageStore = inject(LanguageStore);

  currentLang = signal<string>(this.languageStore.getActiveLang());

  constructor() {
    this.currentLang.set(this.languageStore.getActiveLang());
    effect(() => {
      this.currentLang.set(this.languageStore.activeLangSignal());
    });
  }

  changeLang(language: string) {
    this.languageStore.setActiveLang(language);
    this.currentLang.set(language);
  }
}

