import type { ScoreChord, ScoreData, ScoreEvent, ScoreMeasure } from "../types/score.types";
import { DURATION_UNITS, measureCapacity, pitchRange, usedUnits } from "./notation";

// Pure edit helpers. Each returns new arrays, or null when the change does not fit.

export function newScoreId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function findEvent(score: ScoreData, id: string | null) {
  if (!id) return null;
  for (let m = 0; m < score.measures.length; m++) {
    const i = score.measures[m].events.findIndex((e) => e.id === id);
    if (i >= 0) return { m, i, ev: score.measures[m].events[i] };
  }
  return null;
}

export function placeEvent(score: ScoreData, mIdx: number, index: number, ev: ScoreEvent): ScoreMeasure[] | null {
  const measures = score.measures.map((m) => ({ ...m, events: [...m.events] }));
  while (measures.length <= mIdx) measures.push({ id: newScoreId("m"), events: [] });
  const target = measures[mIdx];
  if (usedUnits(target) + DURATION_UNITS[ev.duration] > measureCapacity(score.timeSignature)) return null;
  target.events.splice(Math.max(0, Math.min(index, target.events.length)), 0, ev);
  return measures;
}

export function patchEvent(score: ScoreData, id: string, patch: Partial<ScoreEvent>): ScoreMeasure[] | null {
  const found = findEvent(score, id);
  if (!found) return null;
  const next = { ...found.ev, ...patch };
  if (next.kind === "note" && typeof next.pitch === "number") {
    const [lo, hi] = pitchRange(score.clef);
    next.pitch = Math.min(hi, Math.max(lo, next.pitch));
  }
  if (!next.accidental) delete next.accidental;
  const measure = score.measures[found.m];
  const delta = DURATION_UNITS[next.duration] - DURATION_UNITS[found.ev.duration];
  if (delta > 0 && usedUnits(measure) + delta > measureCapacity(score.timeSignature)) return null;
  return score.measures.map((m, mi) =>
    mi === found.m ? { ...m, events: m.events.map((e, ei) => (ei === found.i ? next : e)) } : m
  );
}

export function moveEvent(score: ScoreData, id: string, dir: -1 | 1): ScoreMeasure[] {
  const found = findEvent(score, id);
  if (!found) return score.measures;
  const j = found.i + dir;
  const events = [...score.measures[found.m].events];
  if (j < 0 || j >= events.length) return score.measures;
  [events[found.i], events[j]] = [events[j], events[found.i]];
  return score.measures.map((m, mi) => (mi === found.m ? { ...m, events } : m));
}

export function deleteEvent(score: ScoreData, id: string): ScoreMeasure[] {
  const measures = score.measures.map((m) => ({ ...m, events: m.events.filter((e) => e.id !== id) }));
  while (measures.length && measures[measures.length - 1].events.length === 0) measures.pop();
  return measures;
}

export function upsertChord(score: ScoreData, target: { id?: string; measure: number; offset: number }, symbol: string): ScoreChord[] {
  const clean = symbol.trim().slice(0, 16);
  const others = score.chords.filter((c) => c.id !== target.id && !(c.measure === target.measure && c.offset === target.offset));
  if (!clean) return others;
  return [...others, { id: target.id || newScoreId("c"), measure: target.measure, offset: target.offset, symbol: clean }];
}

export function removeChord(score: ScoreData, id: string): ScoreChord[] {
  return score.chords.filter((c) => c.id !== id);
}

/** Split lyrics text into syllables; [Section] lines are kept as text but skipped here. */
export function lyricTokens(text: string): string[] {
  return text
    .split("\n")
    .filter((line) => !/^\s*\[.*\]\s*$/.test(line))
    .join(" ")
    .split(/\s+/)
    .flatMap((w) => w.split(/(?<=-)/))
    .filter(Boolean);
}

/** Assign lyric syllables to notes in order (rests are skipped). */
export function alignLyrics(score: ScoreData): ScoreMeasure[] {
  const tokens = lyricTokens(score.lyrics);
  let i = 0;
  return score.measures.map((m) => ({
    ...m,
    events: m.events.map((e) => {
      if (e.kind !== "note") return e;
      const lyric = tokens[i++];
      const next = { ...e };
      if (lyric) next.lyric = lyric.slice(0, 40); else delete next.lyric;
      return next;
    }),
  }));
}
