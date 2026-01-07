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

export type ThemeOption = "theme-a" | "theme-b" | "theme-d";

// Style character limits
export const STYLE_CHAR_LIMIT_FREE = 500;
export const STYLE_CHAR_LIMIT_PRO = 1000;

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
  theme: "theme-a",
  defaultSort: "updatedDesc",
};
