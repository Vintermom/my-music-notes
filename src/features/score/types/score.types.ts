// Score data model (V1.5.0).
// Versioned and sanitized on load so Phase 1 notes (empty measures) keep opening.
// Future phases (linked Record, Score PDF, Audio-to-Score) extend this file only.

export const SCORE_DATA_VERSION = 2;

export type ScoreClef = "treble" | "bass";
/** Validated numerator/denominator text; presets and custom meters share the same stored shape. */
export type ScoreTimeSignature = `${number}/${number}`;

/** w = whole, h = half, q = quarter, e = eighth, s = sixteenth */
export type ScoreDuration = "w" | "h" | "q" | "e" | "s";
export type ScoreAccidental = "natural" | "sharp" | "flat";
export type ScoreEventKind = "note" | "rest";

/** One note or rest. `pitch` is a diatonic step number (C0 = 0, C4 = 28). */
export interface ScoreEvent {
  id: string;
  kind: ScoreEventKind;
  duration: ScoreDuration;
  pitch?: number;
  accidental?: ScoreAccidental;
  /** Lyric syllable shown under this note (lyrics mapping). */
  lyric?: string;
  /** Dotted value: duration × 1.5. */
  dotted?: boolean;
  /** Note is tied to the next note of the same pitch. */
  tie?: boolean;
}

export interface ScoreMeasure {
  id: string;
  events: ScoreEvent[];
}

/** Chord symbols are stored separately from notation. `offset` is in 16th units within the measure. */
export interface ScoreChord {
  id: string;
  measure: number;
  offset: number;
  symbol: string;
}

export interface ScoreData {
  version: number;
  clef: ScoreClef;
  timeSignature: ScoreTimeSignature;
  keySignature: string;
  tempo: number;
  /** Playback volume 0–1 */
  volume: number;
  measures: ScoreMeasure[];
  chords: ScoreChord[];
  /** Free, editable lyrics text (sections like [Verse] are ordinary text). */
  lyrics: string;
  /** Optional reference to an existing Record note (audio is never copied). */
  linkedRecordId?: string;
}
