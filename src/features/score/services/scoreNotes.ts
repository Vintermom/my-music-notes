import type { Note } from "@/domain/types";
import { createDefaultScoreData } from "../utils/scoreData";

/** Initial data for a new Score note, passed to the existing createNote. */
export function newScoreNoteData(): Partial<Note> {
  return { noteType: "score", score: createDefaultScoreData() };
}

export function isScoreNote(note: Pick<Note, "noteType"> | null | undefined): boolean {
  return note?.noteType === "score";
}

export function scoreRoute(id: string): string {
  return `/score/${id}`;
}
