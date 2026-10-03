import {
  SCORE_DATA_VERSION,
  type ScoreAccidental,
  type ScoreChord,
  type ScoreClef,
  type ScoreData,
  type ScoreDuration,
  type ScoreEvent,
  type ScoreMeasure,
  type ScoreTimeSignature,
} from "../types/score.types";
import { DURATIONS } from "./notation";

export const SCORE_CLEFS: ScoreClef[] = ["treble", "bass"];
export const SCORE_TIME_SIGNATURES: ScoreTimeSignature[] = ["2/2", "2/4", "3/4", "4/4", "5/4", "6/8", "7/8", "9/8", "12/8"];
export const SCORE_KEYS = ["C", "G", "D", "A", "E", "F", "Bb", "Eb", "Am", "Em", "Dm"];
export const SCORE_TEMPO_MIN = 30;
export const SCORE_TEMPO_MAX = 300;
const ACCIDENTALS: ScoreAccidental[] = ["natural", "sharp", "flat"];

export function isValidTimeSignature(value: unknown): value is ScoreTimeSignature {
  if (typeof value !== "string" || !/^\d{1,2}\/\d{1,2}$/.test(value)) return false;
  const [numerator, denominator] = value.split("/").map(Number);
  return numerator >= 1 && numerator <= 32 && [1, 2, 4, 8, 16].includes(denominator);
}

export function createDefaultScoreData(): ScoreData {
  return {
    version: SCORE_DATA_VERSION,
    clef: "treble",
    timeSignature: "4/4",
    keySignature: "C",
    tempo: 120,
    volume: 0.8,
    measures: [],
    chords: [],
    lyrics: "",
  };
}

function sanitizeEvent(value: unknown): ScoreEvent | null {
  if (!value || typeof value !== "object") return null;
  const e = value as Record<string, unknown>;
  if (typeof e.id !== "string" || !e.id) return null;
  const kind = e.kind === "rest" ? "rest" : "note";
  const duration = DURATIONS.includes(e.duration as ScoreDuration) ? (e.duration as ScoreDuration) : "q";
  const ev: ScoreEvent = { id: e.id, kind, duration };
  if (kind === "note") {
    ev.pitch = typeof e.pitch === "number" && Number.isFinite(e.pitch)
      ? Math.min(70, Math.max(0, Math.round(e.pitch)))
      : 34;
    if (ACCIDENTALS.includes(e.accidental as ScoreAccidental)) ev.accidental = e.accidental as ScoreAccidental;
    if (typeof e.lyric === "string" && e.lyric) ev.lyric = e.lyric.slice(0, 200);
    if (e.tie === true) ev.tie = true;
  }
  if (e.dotted === true) ev.dotted = true;
  return ev;
}

function sanitizeMeasure(value: unknown): ScoreMeasure | null {
  if (!value || typeof value !== "object") return null;
  const m = value as { id?: unknown; events?: unknown };
  if (typeof m.id !== "string") return null;
  const events = Array.isArray(m.events)
    ? m.events.map(sanitizeEvent).filter((x): x is ScoreEvent => x !== null)
    : [];
  return { id: m.id, events };
}

function sanitizeChord(value: unknown): ScoreChord | null {
  if (!value || typeof value !== "object") return null;
  const c = value as Record<string, unknown>;
  if (typeof c.id !== "string" || typeof c.symbol !== "string") return null;
  const symbol = c.symbol.trim().slice(0, 16);
  if (!symbol) return null;
  const measure = typeof c.measure === "number" ? Math.max(0, Math.floor(c.measure)) : 0;
  const offset = typeof c.offset === "number" ? Math.max(0, Math.floor(c.offset)) : 0;
  return { id: c.id, measure, offset, symbol };
}

/** Sanitize stored Score data; always returns a valid object (Phase 1 data included). */
export function sanitizeScoreData(value: unknown): ScoreData {
  const base = createDefaultScoreData();
  if (!value || typeof value !== "object") return base;
  const v = value as Record<string, unknown>;
  const tempo = typeof v.tempo === "number" && Number.isFinite(v.tempo)
    ? Math.min(SCORE_TEMPO_MAX, Math.max(SCORE_TEMPO_MIN, Math.round(v.tempo)))
    : base.tempo;
  const volume = typeof v.volume === "number" && Number.isFinite(v.volume)
    ? Math.min(1, Math.max(0, v.volume))
    : base.volume;
  return {
    version: Math.max(typeof v.version === "number" ? v.version : 0, SCORE_DATA_VERSION),
    clef: SCORE_CLEFS.includes(v.clef as ScoreClef) ? (v.clef as ScoreClef) : base.clef,
    timeSignature: isValidTimeSignature(v.timeSignature) ? v.timeSignature : base.timeSignature,
    keySignature: typeof v.keySignature === "string" && SCORE_KEYS.includes(v.keySignature)
      ? v.keySignature
      : base.keySignature,
    tempo,
    volume,
    measures: Array.isArray(v.measures)
      ? v.measures.map(sanitizeMeasure).filter((x): x is ScoreMeasure => x !== null)
      : [],
    chords: Array.isArray(v.chords)
      ? v.chords.map(sanitizeChord).filter((x): x is ScoreChord => x !== null)
      : [],
    lyrics: typeof v.lyrics === "string" ? v.lyrics.slice(0, 50000) : "",
    ...(typeof v.linkedRecordId === "string" && v.linkedRecordId ? { linkedRecordId: v.linkedRecordId } : {}),
  };
}
