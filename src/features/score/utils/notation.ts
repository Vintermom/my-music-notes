import type { ScoreClef, ScoreDuration, ScoreEvent, ScoreMeasure } from "../types/score.types";

export const DURATIONS: ScoreDuration[] = ["w", "h", "q", "e", "s"];
/** Length of each value in 16th-note units. */
export const DURATION_UNITS: Record<ScoreDuration, number> = { w: 16, h: 8, q: 4, e: 2, s: 1 };

/** Real length of an event in 16th units, including the dot. */
export function eventUnits(ev: Pick<ScoreEvent, "duration" | "dotted">): number {
  return DURATION_UNITS[ev.duration] * (ev.dotted ? 1.5 : 1);
}

export function measureCapacity(timeSignature: string): number {
  const [n, d] = timeSignature.split("/").map(Number);
  return Math.round((n * 16) / d);
}

/** Beat length in 16th units (used to snap chord positions). */
export function beatUnits(timeSignature: string): number {
  const d = Number(timeSignature.split("/")[1]);
  return Math.max(1, Math.round(16 / d));
}

export function usedUnits(measure: ScoreMeasure | undefined): number {
  return (measure?.events || []).reduce((sum, e) => sum + eventUnits(e), 0);
}

const STEP_SEMITONES = [0, 2, 4, 5, 7, 9, 11];
const STEP_NAMES = ["C", "D", "E", "F", "G", "A", "B"];

/** Diatonic pitch of the bottom staff line (treble E4, bass G2). */
export function bottomLineDia(clef: ScoreClef): number {
  return clef === "treble" ? 30 : 18;
}
export function middleLineDia(clef: ScoreClef): number {
  return bottomLineDia(clef) + 4;
}
/** Allowed pitch range: three ledger lines below/above the staff. */
export function pitchRange(clef: ScoreClef): [number, number] {
  const b = bottomLineDia(clef);
  return [b - 6, b + 14];
}

export function pitchName(dia: number): string {
  return `${STEP_NAMES[((dia % 7) + 7) % 7]}${Math.floor(dia / 7)}`;
}

interface KeyInfo { type: "sharp" | "flat" | null; count: number }
export const KEY_SIGNATURES: Record<string, KeyInfo> = {
  C: { type: null, count: 0 }, Am: { type: null, count: 0 },
  G: { type: "sharp", count: 1 }, Em: { type: "sharp", count: 1 },
  D: { type: "sharp", count: 2 }, A: { type: "sharp", count: 3 }, E: { type: "sharp", count: 4 },
  F: { type: "flat", count: 1 }, Dm: { type: "flat", count: 1 },
  Bb: { type: "flat", count: 2 }, Eb: { type: "flat", count: 3 },
};
const SHARP_STEPS = [3, 0, 4, 1, 5, 2];
const FLAT_STEPS = [6, 2, 5, 1, 4, 0];
const SHARP_POS_TREBLE = [38, 35, 39, 36, 33, 37];
const FLAT_POS_TREBLE = [34, 37, 33, 36, 32, 35];

export function keyInfo(key: string): KeyInfo {
  return KEY_SIGNATURES[key] || KEY_SIGNATURES.C;
}

/** Staff positions (diatonic) for drawing the key signature. */
export function keySignaturePositions(key: string, clef: ScoreClef): number[] {
  const k = keyInfo(key);
  if (!k.type) return [];
  const list = (k.type === "sharp" ? SHARP_POS_TREBLE : FLAT_POS_TREBLE).slice(0, k.count);
  return clef === "treble" ? list : list.map((p) => p - 14);
}

function keyAlter(key: string, step: number): number {
  const k = keyInfo(key);
  if (k.type === "sharp" && SHARP_STEPS.slice(0, k.count).includes(step)) return 1;
  if (k.type === "flat" && FLAT_STEPS.slice(0, k.count).includes(step)) return -1;
  return 0;
}

export function midiFor(ev: ScoreEvent, key: string): number {
  const dia = ev.pitch ?? 34;
  const step = ((dia % 7) + 7) % 7;
  const octave = Math.floor(dia / 7);
  const alter = ev.accidental === "sharp" ? 1 : ev.accidental === "flat" ? -1 : ev.accidental === "natural" ? 0 : keyAlter(key, step);
  return 12 * (octave + 1) + STEP_SEMITONES[step] + alter;
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
