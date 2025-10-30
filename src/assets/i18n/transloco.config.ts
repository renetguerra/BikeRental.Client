import { translocoConfig } from '@jsverse/transloco';

export const translocoConfiguration = translocoConfig({
  availableLangs: ['en', 'es', 'de'],
  defaultLang: 'en',
  fallbackLang: 'en',
  reRenderOnLangChange: true,
  prodMode: true
});
