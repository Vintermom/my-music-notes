import { Note, DEFAULT_NOTE, SortOption } from "@/domain/types";
import { safeGet, safeSet } from "./localStorage";

const NOTES_KEY = "notes";

function generateId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getAllNotes(): Note[] {
  return safeGet<Note[]>(NOTES_KEY, []);
}

export function getNoteById(id: string): Note | undefined {
  const notes = getAllNotes();
  return notes.find((n) => n.id === id);
}

export function createNote(data?: Partial<Note>): Note {
  const now = Date.now();
  const note: Note = {
    ...DEFAULT_NOTE,
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    timeline: [{ timestamp: now, action: "created" }],
  };

  const notes = getAllNotes();
  notes.push(note);
  safeSet(NOTES_KEY, notes);

  return note;
}

export function updateNote(id: string, updates: Partial<Omit<Note, "id" | "createdAt">>): Note | null {
  const notes = getAllNotes();
  const index = notes.findIndex((n) => n.id === id);

  if (index === -1) return null;

  const now = Date.now();
  const currentNote = notes[index];
  const timeline = [...currentNote.timeline, { timestamp: now, action: "updated" as const }];

  // Keep only last 50 timeline entries
  if (timeline.length > 50) {
    timeline.splice(0, timeline.length - 50);
  }

  const updatedNote: Note = {
    ...currentNote,
    ...updates,
    updatedAt: now,
    timeline,
  };

  notes[index] = updatedNote;
  safeSet(NOTES_KEY, notes);

  return updatedNote;
}

export function deleteNote(id: string): boolean {
  const notes = getAllNotes();
  const filtered = notes.filter((n) => n.id !== id);

  if (filtered.length === notes.length) return false;

  safeSet(NOTES_KEY, filtered);
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
    timeline: [{ timestamp: now, action: "created" }],
  };

  const notes = getAllNotes();
  notes.push(duplicate);
  safeSet(NOTES_KEY, notes);

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

export function exportNoteAsJson(note: Note): string {
  return JSON.stringify(note, null, 2);
}

export function downloadNoteJson(note: Note): void {
  const json = exportNoteAsJson(note);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${note.title || "note"}_${note.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getPinnedCount(): number {
  return getAllNotes().filter((n) => n.isPinned).length;
}
