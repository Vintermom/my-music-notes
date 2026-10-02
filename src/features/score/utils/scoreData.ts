import {
  SCORE_DATA_VERSION,
  type ScoreClef,
  type ScoreData,
  type ScoreTimeSignature,
} from "../types/score.types";

export const SCORE_CLEFS: ScoreClef[] = ["treble", "bass"];
export const SCORE_TIME_SIGNATURES: ScoreTimeSignature[] = ["2/4", "3/4", "4/4", "6/8"];
export const SCORE_KEYS = ["C", "G", "D", "A", "E", "F", "Bb", "Eb", "Am", "Em", "Dm"];
export const SCORE_TEMPO_MIN = 30;
export const SCORE_TEMPO_MAX = 300;

export function createDefaultScoreData(): ScoreData {
  return {
    version: SCORE_DATA_VERSION,
    clef: "treble",
    timeSignature: "4/4",
    keySignature: "C",
    tempo: 120,
    measures: [],
  };
}

/** Sanitize stored Score data; always returns a valid object. */
export function sanitizeScoreData(value: unknown): ScoreData {
  const base = createDefaultScoreData();
  if (!value || typeof value !== "object") return base;
  const v = value as Record<string, unknown>;
  const tempo = typeof v.tempo === "number" && Number.isFinite(v.tempo)
    ? Math.min(SCORE_TEMPO_MAX, Math.max(SCORE_TEMPO_MIN, Math.round(v.tempo)))
    : base.tempo;
  return {
    version: typeof v.version === "number" ? v.version : base.version,
    clef: SCORE_CLEFS.includes(v.clef as ScoreClef) ? (v.clef as ScoreClef) : base.clef,
    timeSignature: SCORE_TIME_SIGNATURES.includes(v.timeSignature as ScoreTimeSignature)
      ? (v.timeSignature as ScoreTimeSignature)
      : base.timeSignature,
    keySignature: typeof v.keySignature === "string" && SCORE_KEYS.includes(v.keySignature)
      ? v.keySignature
      : base.keySignature,
    tempo,
    measures: Array.isArray(v.measures)
      ? v.measures
          .filter((m): m is { id: string; events?: unknown } =>
            !!m && typeof m === "object" && typeof (m as { id?: unknown }).id === "string")
          .map((m) => ({ id: m.id, events: Array.isArray(m.events) ? m.events : [] }))
      : [],
  };
}
