import type { Note } from "@/domain/types";

export type HomeNoteType = "lyrics" | "record" | "score";
export type HomeNoteTypeFilter = "all" | HomeNoteType;

export function getHomeNoteType(note: Note): HomeNoteType {
  const futureType = (note as Note & { noteType?: unknown }).noteType;
  if (futureType === "score") return "score";
  return note.hasAudio === true ? "record" : "lyrics";
}
