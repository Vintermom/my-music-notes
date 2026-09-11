import type { VoiceHint } from "@/types/voiceOption";
import { getCurrentLang } from "@/i18n";

// Resolve a localized hint for the current app language, falling back to English.
export function getVoiceHint(hint: VoiceHint, lang: string = getCurrentLang()): string {
  return hint[lang] || hint.en;
}

// Localized "Often used in:" label. English label/prompt output always stay English.
const oftenUsedInLabels: Record<string, string> = {
  en: "Often used in:",
  th: "มักใช้ใน:",
  sv: "Vanligt i:",
};

export function getOftenUsedInLabel(lang: string = getCurrentLang()): string {
  return oftenUsedInLabels[lang] || oftenUsedInLabels.en;
}

// Localized header for the Quick Voice Controls section.
const quickControlsLabels: Record<string, string> = {
  en: "Quick Voice Controls",
  th: "ตัวช่วยด่วน",
  sv: "Snabbval för röst",
};

export function getQuickControlsLabel(lang: string = getCurrentLang()): string {
  return quickControlsLabels[lang] || quickControlsLabels.en;
}
