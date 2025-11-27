import { Injectable } from '@angular/core';
import { enTranslations } from './translations/en';
import { esTranslations } from './translations/es';
import { frTranslations } from './translations/fr';
import { deTranslations } from './translations/de';

type TranslationResources = Record<string, Record<string, string>>;

@Injectable({ providedIn: 'root' })
export class I18nService {
  private resources: TranslationResources = {
    en: enTranslations,
    es: esTranslations,
    fr: frTranslations,
    de: deTranslations,
  };

  private currentLanguage = 'en';

  get language(): string {
    return this.currentLanguage;
  }

  setLanguage(lang: string): void {
    this.currentLanguage = lang;
  }

  addTranslations(lang: string, translations: Record<string, string>): void {
    this.resources[lang] = { ...this.resources[lang], ...translations };
  }

  t(key: string, params?: Record<string, string>): string {
    const lang = this.currentLanguage;
    let translation = this.resources[lang]?.[key] || this.resources['en']?.[key] || key;

    if (params) {
      Object.keys(params).forEach((paramKey) => {
        translation = translation.replace(`{{${paramKey}}}`, params[paramKey]);
      });
    }

    return translation;
  }
}

