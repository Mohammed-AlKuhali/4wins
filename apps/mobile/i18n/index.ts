import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import en from './en.json';
import ar from './ar.json';
import es from './es.json';

export async function initI18n(): Promise<void> {
  const locale = Localization.getLocales()[0]?.languageTag ?? 'en';
  const lang = locale.startsWith('ar') ? 'ar' : locale.startsWith('es') ? 'es' : 'en';

  if (lang === 'ar') {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  } else {
    I18nManager.allowRTL(false);
    I18nManager.forceRTL(false);
  }

  await i18next.use(initReactI18next).init({
    lng: lang,
    fallbackLng: 'en',
    resources: { en: { translation: en }, ar: { translation: ar }, es: { translation: es } },
    interpolation: { escapeValue: false },
    saveMissing: __DEV__,
    missingKeyHandler: __DEV__
      ? (lngs, ns, key) => { throw new Error(`i18n missing key: ${key}`); }
      : undefined,
  });
}

export { i18next as i18n };
