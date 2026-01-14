import { en, type TranslationKey } from "./locales/en";
import { th } from "./locales/th";
import { sv } from "./locales/sv";
import { safeGet, safeSet } from "@/storage/localStorage";

const supportedLangs = ["en", "th", "sv"] as const;
export type SupportedLang = (typeof supportedLangs)[number];

const translations: Record<SupportedLang, Record<TranslationKey, string>> = {
  en,
  th,
  sv,
};

const LANG_KEY = "preferredLanguage";

function detectLanguage(): SupportedLang {
  // Check for stored preference first
  const stored = safeGet<SupportedLang | null>(LANG_KEY, null);
  if (stored && supportedLangs.includes(stored)) {
    return stored;
  }
  
  // Fall back to browser language detection
  const browserLang = navigator.language?.split("-")[0]?.toLowerCase();
  if (browserLang && supportedLangs.includes(browserLang as SupportedLang)) {
    return browserLang as SupportedLang;
  }
  return "en";
}

let currentLanguage: SupportedLang = detectLanguage();

export function getCurrentLang(): SupportedLang {
  return currentLanguage;
}

export function setLanguage(lang: SupportedLang): void {
  currentLanguage = lang;
  safeSet(LANG_KEY, lang);
}

export const currentLang: SupportedLang = currentLanguage;

export function t(key: TranslationKey): string {
  return translations[currentLanguage][key] || translations.en[key] || key;
}

export function getSupportedLangs(): readonly SupportedLang[] {
  return supportedLangs;
}

export type { TranslationKey };
