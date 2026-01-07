import { en, type TranslationKey } from "./locales/en";
// These are imported but not used at runtime yet (prepared for future)
// import { th } from "./locales/th";
// import { sv } from "./locales/sv";

// Fixed to English for now - no language switch UI
export const currentLang = "en" as const;

const translations = {
  en,
  // th,
  // sv,
} as const;

export function t(key: TranslationKey): string {
  return translations[currentLang][key] || key;
}

export type { TranslationKey };
