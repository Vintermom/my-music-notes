export type NoteColor = 
  | "default" 
  | "cream" 
  | "pink" 
  | "blue" 
  | "green" 
  | "yellow" 
  | "purple" 
  | "orange";

export type SortOption = "updatedDesc" | "createdDesc" | "titleAsc";

// "system" follows OS, "theme-n" = Neutral Light (for system-light), others are manual
export type ThemeOption = "system" | "theme-n" | "theme-a" | "theme-c" | "theme-d";

// Storage schema version for migration support
export const STORAGE_SCHEMA_VERSION = 1;

// Field limits for anti-freeze protection
export const FIELD_LIMITS = {
  title: 200,
  composer: 200,
  extraInfo: 1000,
  tagSingle: 50,
  tagsMax: 20,
  lyrics: 50000, // Large but bounded
  style: 2000,
  stylePro: 1000,
} as const;

// Import/Export limits
export const IMPORT_MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3MB

// Style character limits (keep for backward compatibility)
export const STYLE_CHAR_LIMIT_FREE = FIELD_LIMITS.style;
export const STYLE_CHAR_LIMIT_PRO = FIELD_LIMITS.stylePro;

// Chord complexity levels (for Pro feature - not exposed in UI yet)
export type ChordComplexity = "simple" | "standard" | "complex" | "jazz";

export interface ChordSettings {
  complexity: ChordComplexity;
  showChordDiagrams: boolean;
}

export interface TimelineEntry {
  timestamp: number;
  action: "created" | "updated";
}

export interface Note {
  id: string;
  title: string;
  composer: string;
  lyrics: string;
  style: string;
  extraInfo: string;
  tags: string[];
  color: NoteColor;
  isPinned: boolean;
  createdAt: number;
  updatedAt: number;
  timeline: TimelineEntry[];
}

export interface Settings {
  theme: ThemeOption;
  defaultSort: SortOption;
}

// Storage wrapper with schema version
export interface StorageData {
  version: number;
  notes: Note[];
}

export interface SettingsStorageData {
  version: number;
  settings: Settings;
}

export const DEFAULT_NOTE: Omit<Note, "id" | "createdAt" | "updatedAt" | "timeline"> = {
  title: "",
  composer: "",
  lyrics: "",
  style: "",
  extraInfo: "",
  tags: [],
  color: "default",
  isPinned: false,
};

export const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  defaultSort: "updatedDesc",
};

// Valid note colors for validation
export const VALID_NOTE_COLORS: NoteColor[] = [
  "default", "cream", "pink", "blue", "green", "yellow", "purple", "orange"
];
