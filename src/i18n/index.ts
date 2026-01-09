import { en, type TranslationKey } from "./locales/en";
import { th } from "./locales/th";
import { sv } from "./locales/sv";

const supportedLangs = ["en", "th", "sv"] as const;
type SupportedLang = (typeof supportedLangs)[number];

const translations: Record<SupportedLang, Record<TranslationKey, string>> = {
  en,
  th,
  sv,
};

function detectLanguage(): SupportedLang {
  const browserLang = navigator.language?.split("-")[0]?.toLowerCase();
  if (browserLang && supportedLangs.includes(browserLang as SupportedLang)) {
    return browserLang as SupportedLang;
  }
  return "en";
}

export const currentLang: SupportedLang = detectLanguage();

export function t(key: TranslationKey): string {
  return translations[currentLang][key] || translations.en[key] || key;
}

export type { TranslationKey };
