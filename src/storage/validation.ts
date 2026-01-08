/**
 * Storage validation utilities for data integrity and security
 */

import { 
  Note, 
  Settings, 
  STORAGE_SCHEMA_VERSION,
  FIELD_LIMITS,
  VALID_NOTE_COLORS,
  DEFAULT_NOTE,
  DEFAULT_SETTINGS,
  NoteColor
} from "@/domain/types";

/**
 * Truncate string to max length safely
 */
export function truncateString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.slice(0, maxLength);
}

/**
 * Validate and sanitize a single note
 * Returns sanitized note or null if invalid
 */
export function validateNote(data: unknown): Note | null {
  if (!data || typeof data !== "object") return null;
  
  const note = data as Record<string, unknown>;
  
  // Required fields check
  if (typeof note.id !== "string" || !note.id) return null;
  if (typeof note.createdAt !== "number" || note.createdAt <= 0) return null;
  if (typeof note.updatedAt !== "number" || note.updatedAt <= 0) return null;
  
  // Sanitize color
  const color = VALID_NOTE_COLORS.includes(note.color as NoteColor) 
    ? (note.color as NoteColor) 
    : "default";
  
  // Sanitize tags
  let tags: string[] = [];
  if (Array.isArray(note.tags)) {
    tags = note.tags
      .filter((t): t is string => typeof t === "string")
      .map((t) => truncateString(t, FIELD_LIMITS.tagSingle))
      .slice(0, FIELD_LIMITS.tagsMax);
  }
  
  // Sanitize timeline
  let timeline: Note["timeline"] = [];
  if (Array.isArray(note.timeline)) {
    timeline = note.timeline
      .filter((t): t is { timestamp: number; action: "created" | "updated" } => 
        t && typeof t === "object" &&
        typeof t.timestamp === "number" &&
        (t.action === "created" || t.action === "updated")
      )
      .slice(-50); // Keep last 50 entries
  }
  
  return {
    id: note.id,
    title: truncateString(note.title, FIELD_LIMITS.title),
    composer: truncateString(note.composer, FIELD_LIMITS.composer),
    lyrics: truncateString(note.lyrics, FIELD_LIMITS.lyrics),
    style: truncateString(note.style, FIELD_LIMITS.style),
    extraInfo: truncateString(note.extraInfo, FIELD_LIMITS.extraInfo),
    tags,
    color,
    isPinned: typeof note.isPinned === "boolean" ? note.isPinned : false,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    timeline,
  };
}

/**
 * Validate notes array from storage
 * Returns valid notes, filters out corrupted ones
 */
export function validateNotesArray(data: unknown): Note[] {
  if (!Array.isArray(data)) return [];
  
  const validNotes: Note[] = [];
  const seenIds = new Set<string>();
  
  for (const item of data) {
    const note = validateNote(item);
    if (note && !seenIds.has(note.id)) {
      seenIds.add(note.id);
      validNotes.push(note);
    }
  }
  
  return validNotes;
}

/**
 * Validate settings object
 */
export function validateSettings(data: unknown): Settings {
  if (!data || typeof data !== "object") return { ...DEFAULT_SETTINGS };
  
  const settings = data as Record<string, unknown>;
  
  return {
    theme: ["theme-a", "theme-b", "theme-d"].includes(settings.theme as string)
      ? (settings.theme as Settings["theme"])
      : DEFAULT_SETTINGS.theme,
    defaultSort: ["updatedDesc", "createdDesc", "titleAsc"].includes(settings.defaultSort as string)
      ? (settings.defaultSort as Settings["defaultSort"])
      : DEFAULT_SETTINGS.defaultSort,
  };
}

/**
 * Check storage schema version
 */
export function getStorageVersion(data: unknown): number {
  if (data && typeof data === "object" && "version" in data) {
    const version = (data as { version: unknown }).version;
    if (typeof version === "number") return version;
  }
  return 0;
}

/**
 * Validate imported note data for import safety
 * More strict than regular validation
 */
export function validateImportedNote(data: unknown): Partial<Note> | null {
  if (!data || typeof data !== "object") return null;
  
  const note = data as Record<string, unknown>;
  
  // Don't allow importing id, createdAt, updatedAt, timeline
  // These will be regenerated
  
  const color = VALID_NOTE_COLORS.includes(note.color as NoteColor)
    ? (note.color as NoteColor)
    : "default";
  
  let tags: string[] = [];
  if (Array.isArray(note.tags)) {
    tags = note.tags
      .filter((t): t is string => typeof t === "string")
      .map((t) => truncateString(t, FIELD_LIMITS.tagSingle))
      .slice(0, FIELD_LIMITS.tagsMax);
  }
  
  return {
    title: truncateString(note.title, FIELD_LIMITS.title),
    composer: truncateString(note.composer, FIELD_LIMITS.composer),
    lyrics: truncateString(note.lyrics, FIELD_LIMITS.lyrics),
    style: truncateString(note.style, FIELD_LIMITS.style),
    extraInfo: truncateString(note.extraInfo, FIELD_LIMITS.extraInfo),
    tags,
    color,
    isPinned: false, // Always unpinned on import
  };
}

/**
 * Check if storage data is corrupted
 */
export function isStorageCorrupted(rawData: string | null): boolean {
  if (rawData === null) return false; // Empty is not corrupted
  
  try {
    JSON.parse(rawData);
    return false;
  } catch {
    return true;
  }
}
