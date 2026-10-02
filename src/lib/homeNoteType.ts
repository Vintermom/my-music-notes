import type { Note } from "@/domain/types";

export type HomeNoteType = "lyrics" | "record" | "score";
export type HomeNoteTypeFilter = "all" | HomeNoteType;

export function getHomeNoteType(note: Note): HomeNoteType {
  return note.hasAudio === true ? "record" : "lyrics";
}
