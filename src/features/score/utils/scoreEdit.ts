import type { ScoreChord, ScoreData, ScoreEvent, ScoreMeasure } from "../types/score.types";
import { DURATION_UNITS, measureCapacity, usedUnits } from "./notation";

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
  if (next.kind === "note" && typeof next.pitch === "number") next.pitch = Math.min(70, Math.max(0, next.pitch));
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

export function clearMeasure(score: ScoreData, index: number): Pick<ScoreData, "measures" | "chords"> {
  return {
    measures: score.measures.map((measure, measureIndex) => (
      measureIndex === index ? { ...measure, events: [] } : measure
    )),
    chords: score.chords.filter((chord) => chord.measure !== index),
  };
}

export function deleteMeasure(score: ScoreData, index: number): Pick<ScoreData, "measures" | "chords"> {
  return {
    measures: score.measures.filter((_, measureIndex) => measureIndex !== index),
    chords: score.chords
      .filter((chord) => chord.measure !== index)
      .map((chord) => chord.measure > index ? { ...chord, measure: chord.measure - 1 } : chord),
  };
}

/** Insert a copy of a measure right after it; later measures and their chords shift forward. */
export function duplicateMeasure(score: ScoreData, index: number, withLyrics: boolean): Pick<ScoreData, "measures" | "chords"> {
  const source = score.measures[index];
  if (!source) return { measures: score.measures, chords: score.chords };
  const copy: ScoreMeasure = {
    id: newScoreId("m"),
    events: source.events.map((event) => {
      const next = { ...event, id: newScoreId("e") };
      if (!withLyrics) delete next.lyric;
      return next;
    }),
  };
  const measures = [...score.measures.slice(0, index + 1), copy, ...score.measures.slice(index + 1)];
  const shifted = score.chords.map((chord) => chord.measure > index ? { ...chord, measure: chord.measure + 1 } : chord);
  const copies = score.chords.filter((chord) => chord.measure === index).map((chord) => ({ ...chord, id: newScoreId("c"), measure: index + 1 }));
  return { measures, chords: [...shifted, ...copies] };
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

/** Fill only unassigned notes with lyrics not already represented by assigned notes. */
export function alignLyrics(score: ScoreData): ScoreMeasure[] {
  const tokens = lyricTokens(score.lyrics);
  const assigned = new Map<string, number>();
  score.measures.forEach((measure) => measure.events.forEach((event) => {
    if (event.kind === "note" && event.lyric) assigned.set(event.lyric, (assigned.get(event.lyric) || 0) + 1);
  }));
  const remaining = tokens.filter((token) => {
    const count = assigned.get(token) || 0;
    if (!count) return true;
    assigned.set(token, count - 1);
    return false;
  });
  let i = 0;
  return score.measures.map((m) => ({
    ...m,
    events: m.events.map((e) => {
      if (e.kind !== "note" || e.lyric) return e;
      const lyric = remaining[i++];
      return lyric ? { ...e, lyric: lyric.slice(0, 200) } : e;
    }),
  }));
}

/** Remove notation and mapped lyrics while preserving the master Lyrics text and metadata. */
export function clearScore(): Pick<ScoreData, "measures" | "chords"> {
  return { measures: [], chords: [] };
}

/** Explicit destructive reflow used only after the user confirms replacement. */
export function replaceAllLyrics(score: ScoreData): ScoreMeasure[] {
  const tokens = lyricTokens(score.lyrics);
  let i = 0;
  return score.measures.map((measure) => ({
    ...measure,
    events: measure.events.map((event) => {
      if (event.kind !== "note") return event;
      const lyric = tokens[i++];
      const next = { ...event };
    if (lyric) next.lyric = lyric.slice(0, 200); else delete next.lyric;
      return next;
    }),
  }));
}

/** Keep a direct correction reflected in master lyrics only when its prior token is unambiguous. */
export function syncNoteLyric(score: ScoreData, id: string, lyric: string): Pick<ScoreData, "measures" | "lyrics"> | null {
  const found = findEvent(score, id);
  if (!found || found.ev.kind !== "note") return null;
  const clean = lyric.slice(0, 200);
  const previous = found.ev.lyric || "";
  const measures = patchEvent(score, id, { lyric: clean || undefined });
  if (!measures) return null;
  if (!previous || previous === clean) return { measures, lyrics: score.lyrics };

  let replaced = false;
  const lyrics = score.lyrics.split("\n").map((line) => {
    if (replaced || /^\s*\[.*\]\s*$/.test(line)) return line;
    const words = line.split(/(\s+)/);
    const index = words.findIndex((word) => word === previous);
    if (index < 0) return line;
    words[index] = clean;
    replaced = true;
    return words.join("");
  }).join("\n");
  return { measures, lyrics };
}
