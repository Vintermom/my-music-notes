import { en, type TranslationKey } from "./locales/en";
import { th } from "./locales/th";
import { sv } from "./locales/sv";
import { ko } from "./locales/ko";
import { ja } from "./locales/ja";
import { ar } from "./locales/ar";
import { safeGet, safeSet } from "@/storage/localStorage";

const supportedLangs = ["en", "th", "sv", "ko", "ja", "ar"] as const;
export type SupportedLang = (typeof supportedLangs)[number];

// Languages that use RTL direction
const rtlLangs: SupportedLang[] = ["ar"];

const translations: Record<SupportedLang, Record<TranslationKey, string>> = {
  en,
  th,
  sv,
  ko,
  ja,
  ar,
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

// Check if user has a manual language preference (not auto/system)
export function hasManualLanguagePreference(): boolean {
  const stored = safeGet<SupportedLang | null>(LANG_KEY, null);
  return stored !== null && supportedLangs.includes(stored);
}

// Clear manual language preference (revert to auto/system)
export function clearLanguagePreference(): void {
  safeSet(LANG_KEY, null);
  currentLanguage = detectLanguage();
  applyTextDirection();
}

export function setLanguage(lang: SupportedLang): void {
  currentLanguage = lang;
  safeSet(LANG_KEY, lang);
  applyTextDirection();
}

// Check if current language is RTL
export function isRTL(): boolean {
  return rtlLangs.includes(currentLanguage);
}

// Apply text direction to document
export function applyTextDirection(): void {
  const dir = isRTL() ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = currentLanguage;
}

// Initialize direction on load
applyTextDirection();

export const currentLang: SupportedLang = currentLanguage;

export function t(key: TranslationKey): string {
  return translations[currentLanguage][key] || translations.en[key] || key;
}

export function getSupportedLangs(): readonly SupportedLang[] {
  return supportedLangs;
}

export type { TranslationKey };
