// Voice feature types (prompt-writing assistant for the Style field)

export type VoiceCategory =
  | "Tone / Body"
  | "Power / Presence"
  | "Texture"
  | "Technique"
  | "Expression / Delivery"
  | "Attack / Articulation"
  | "Extreme Voice"
  | "Production / Mix"
  | "Environment";

// "All" is a filter-only pseudo category
export type VoiceCategoryFilter = "All" | VoiceCategory;

// Localized hint. English is required; other languages are optional so more can be added later.
export type VoiceHint = { en: string } & Partial<Record<string, string>>;

export interface VoiceOption {
  id: string;
  label: string; // canonical English label
  category: VoiceCategory;
  prompt: string; // canonical English prompt text inserted into Style
  hint: VoiceHint;
  commonGenres?: string[]; // informational only — never used as a filter
  searchKeywords?: Partial<Record<string, string[]>>; // per-language keywords, e.g. { en: [...], th: [...], sv: [...] }
}

export interface EnvironmentOption {
  id: string;
  label: string;
  prompt: string;
  hint: VoiceHint;
  searchKeywords?: Partial<Record<string, string[]>>;
}

// Quick Voice Controls — shortcut chips that insert a combined prompt phrase.
export interface QuickVoiceControl {
  id: string;
  label: string;
  prompt: string;
  hint: VoiceHint;
  searchKeywords?: Partial<Record<string, string[]>>;
}
