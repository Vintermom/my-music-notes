// Score data model (V1.5.0 Phase 1 foundation).
// Kept versioned so future phases (notation, chords, lyrics under notes,
// playback, linked Record, Score PDF) can extend it without migrations.

export const SCORE_DATA_VERSION = 1;

export type ScoreClef = "treble" | "bass";
export type ScoreTimeSignature = "2/4" | "3/4" | "4/4" | "6/8";

/** Placeholder for future notation content (notes/rests/chords/lyrics). */
export interface ScoreMeasure {
  id: string;
  events: unknown[];
}

export interface ScoreData {
  version: number;
  clef: ScoreClef;
  timeSignature: ScoreTimeSignature;
  keySignature: string;
  tempo: number;
  measures: ScoreMeasure[];
}
