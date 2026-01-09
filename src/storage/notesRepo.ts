import { 
  Note, 
  DEFAULT_NOTE, 
  SortOption, 
  STORAGE_SCHEMA_VERSION,
  FIELD_LIMITS 
} from "@/domain/types";
import { safeGet, safeSet, createBackup, getRawStorage } from "./localStorage";
import { 
  validateNotesArray, 
  validateNote, 
  isStorageCorrupted,
  truncateString 
} from "./validation";

const NOTES_KEY = "notes";

function generateId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all notes with validation and corruption handling
 */
export function getAllNotes(): Note[] {
  // Check for corruption first
  const rawData = getRawStorage(NOTES_KEY);
  if (isStorageCorrupted(rawData)) {
    console.warn("[NotesRepo] Storage corrupted, returning empty array");
    return [];
  }

  const data = safeGet<{ version?: number; notes?: unknown[] } | unknown[]>(NOTES_KEY, []);
  
  // Handle both old format (array) and new format (object with version)
  let notesData: unknown[];
  if (Array.isArray(data)) {
    notesData = data;
  } else if (data && typeof data === "object" && "notes" in data) {
    notesData = Array.isArray(data.notes) ? data.notes : [];
  } else {
    notesData = [];
  }

  return validateNotesArray(notesData);
}

/**
 * Save all notes with version
 */
function saveAllNotes(notes: Note[]): boolean {
  return safeSet(NOTES_KEY, {
    version: STORAGE_SCHEMA_VERSION,
    notes,
  });
}

export function getNoteById(id: string): Note | undefined {
  const notes = getAllNotes();
  return notes.find((n) => n.id === id);
}

export function createNote(data?: Partial<Note>): Note {
  const now = Date.now();
  
  // Apply field limits to input data
  const sanitizedData: Partial<Note> = {};
  if (data?.title) sanitizedData.title = truncateString(data.title, FIELD_LIMITS.title);
  if (data?.composer) sanitizedData.composer = truncateString(data.composer, FIELD_LIMITS.composer);
  if (data?.lyrics) sanitizedData.lyrics = truncateString(data.lyrics, FIELD_LIMITS.lyrics);
  if (data?.style) sanitizedData.style = truncateString(data.style, FIELD_LIMITS.style);
  if (data?.extraInfo) sanitizedData.extraInfo = truncateString(data.extraInfo, FIELD_LIMITS.extraInfo);
  if (data?.tags) {
    sanitizedData.tags = data.tags
      .slice(0, FIELD_LIMITS.tagsMax)
      .map((t) => truncateString(t, FIELD_LIMITS.tagSingle));
  }
  if (data?.color) sanitizedData.color = data.color;
  if (typeof data?.isPinned === "boolean") sanitizedData.isPinned = data.isPinned;

  const note: Note = {
    ...DEFAULT_NOTE,
    ...sanitizedData,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    timeline: [],
  };

  const notes = getAllNotes();
  notes.push(note);
  saveAllNotes(notes);

  return note;
}

export function updateNote(id: string, updates: Partial<Omit<Note, "id" | "createdAt">>): Note | null {
  const notes = getAllNotes();
  const index = notes.findIndex((n) => n.id === id);

  if (index === -1) return null;

  const now = Date.now();
  const currentNote = notes[index];
  
  // Keep existing timeline (no longer adding new entries)

  // Apply field limits to updates
  const sanitizedUpdates: Partial<Note> = {};
  if (updates.title !== undefined) sanitizedUpdates.title = truncateString(updates.title, FIELD_LIMITS.title);
  if (updates.composer !== undefined) sanitizedUpdates.composer = truncateString(updates.composer, FIELD_LIMITS.composer);
  if (updates.lyrics !== undefined) sanitizedUpdates.lyrics = truncateString(updates.lyrics, FIELD_LIMITS.lyrics);
  if (updates.style !== undefined) sanitizedUpdates.style = truncateString(updates.style, FIELD_LIMITS.style);
  if (updates.extraInfo !== undefined) sanitizedUpdates.extraInfo = truncateString(updates.extraInfo, FIELD_LIMITS.extraInfo);
  if (updates.tags !== undefined) {
    sanitizedUpdates.tags = updates.tags
      .slice(0, FIELD_LIMITS.tagsMax)
      .map((t) => truncateString(t, FIELD_LIMITS.tagSingle));
  }
  if (updates.color !== undefined) sanitizedUpdates.color = updates.color;
  if (typeof updates.isPinned === "boolean") sanitizedUpdates.isPinned = updates.isPinned;

  const updatedNote: Note = {
    ...currentNote,
    ...sanitizedUpdates,
    updatedAt: now,
    timeline: currentNote.timeline,
  };

  // Validate the updated note
  const validated = validateNote(updatedNote);
  if (!validated) return null;

  notes[index] = validated;
  saveAllNotes(notes);

  return validated;
}

export function deleteNote(id: string): boolean {
  const notes = getAllNotes();
  const filtered = notes.filter((n) => n.id !== id);

  if (filtered.length === notes.length) return false;

  saveAllNotes(filtered);
  return true;
}

export function duplicateNote(id: string): Note | null {
  const original = getNoteById(id);
  if (!original) return null;

  const now = Date.now();
  const duplicate: Note = {
    ...original,
    id: generateId(),
    title: original.title ? `${original.title} (copy)` : "",
    isPinned: false,
    createdAt: now,
    updatedAt: now,
    timeline: [],
  };

  const notes = getAllNotes();
  notes.push(duplicate);
  saveAllNotes(notes);

  return duplicate;
}

export function pinNote(id: string): { success: boolean; note?: Note; error?: string } {
  const notes = getAllNotes();
  const pinnedCount = notes.filter((n) => n.isPinned).length;
  const note = notes.find((n) => n.id === id);

  if (!note) return { success: false, error: "Note not found" };

  if (!note.isPinned && pinnedCount >= 6) {
    return { success: false, error: "pinLimit" };
  }

  const updated = updateNote(id, { isPinned: !note.isPinned });
  return updated ? { success: true, note: updated } : { success: false, error: "Update failed" };
}

export function sortNotes(notes: Note[], sortOption: SortOption): Note[] {
  const sorted = [...notes];

  switch (sortOption) {
    case "updatedDesc":
      sorted.sort((a, b) => b.updatedAt - a.updatedAt);
      break;
    case "createdDesc":
      sorted.sort((a, b) => b.createdAt - a.createdAt);
      break;
    case "titleAsc":
      sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      break;
  }

  return sorted;
}

export function searchNotes(notes: Note[], query: string): Note[] {
  if (!query.trim()) return notes;

  const lowerQuery = query.toLowerCase();

  return notes.filter((note) => {
    const searchable = [
      note.title,
      note.composer,
      note.lyrics,
      ...note.tags,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(lowerQuery);
  });
}

/**
 * Export note as JSON with schema version (updated format)
 */
export function exportNoteAsJson(note: Note): string {
  return JSON.stringify({
    storageVersion: STORAGE_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    note,
  }, null, 2);
}

/**
 * Generate safe filename from title (Unicode-friendly)
 */
function generateExportFilename(note: Note): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
  
  // Invalid filename characters: / \ ? % * : | " < >
  const invalidChars = /[\/\\?%*:|"<>]/g;
  
  const title = note.title?.trim();
  
  if (title && title.length > 0) {
    // Preserve Unicode, trim, replace spaces with underscores, remove invalid chars
    const safeName = title
      .replace(/\s+/g, "_")
      .replace(invalidChars, "")
      .slice(0, 100); // Reasonable length limit
    
    if (safeName.length > 0) {
      return `${safeName}_${dateStr}.json`;
    }
  }
  
  // Fallback: note_YYYY-MM-DD_shortId.json
  const shortId = note.id.slice(0, 8);
  return `note_${dateStr}_${shortId}.json`;
}

export function downloadNoteJson(note: Note): void {
  const json = exportNoteAsJson(note);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = generateExportFilename(note);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getPinnedCount(): number {
  return getAllNotes().filter((n) => n.isPinned).length;
}

/**
 * Create a backup before potentially destructive operations
 */
export function createNotesBackup(): boolean {
  return createBackup(NOTES_KEY);
}

/**
 * Get all note IDs for duplicate detection
 */
export function getAllNoteIds(): Set<string> {
  return new Set(getAllNotes().map((n) => n.id));
}
