import type { ScoreData, ScoreEvent } from "../types/score.types";
import {
  DURATION_UNITS, bottomLineDia, keyInfo, keySignaturePositions, measureCapacity, middleLineDia,
} from "../utils/notation";

/**
 * Score output layout (Print, Save as PDF and Share PDF all use this).
 * Computed directly from Score data — never from the editor screen.
 * Units: 1 staff space = 10 units; a system is LAYOUT_WIDTH units wide.
 */
export const LAYOUT_WIDTH = 640;
const LYRIC_SIZE = 12;
const CHORD_SIZE = 14;
const MEASURE_PAD = 14;
const MIN_MEASURE = 90;
const BASE_SLOT: Record<ScoreEvent["duration"], number> = { w: 40, h: 34, q: 28, e: 24, s: 22 };
const LAST_SYSTEM_MIN_FILL = 0.6;

export interface LaidEvent { event: ScoreEvent; x: number; y: number; dia: number; stemUp: boolean; ledgers: number[] }
export interface LaidChord { id: string; x: number; symbol: string }
export interface LaidMeasure { index: number; x: number; width: number; events: LaidEvent[]; chords: LaidChord[]; last: boolean }
export interface LaidSystem {
  height: number;
  staffTop: number;
  staffBottom: number;
  chordY: number;
  lyricY: number;
  numberY: number;
  right: number;
  header: number;
  showTime: boolean;
  keyGlyphs: { x: number; y: number }[];
  measures: LaidMeasure[];
  yFor: (dia: number) => number;
}
export interface ScoreLayout { systems: LaidSystem[]; keyType: "sharp" | "flat" | "none"; timeTop: string; timeBottom: string }

let measureCtx: CanvasRenderingContext2D | null | undefined;
/** Text width in layout units; canvas when available plus a safety margin, script-aware estimate otherwise. */
export function textWidth(text: string, size: number, bold = false): number {
  if (!text) return 0;
  if (measureCtx === undefined) {
    try { measureCtx = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : null; } catch { measureCtx = null; }
  }
  let estimate = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if ((cp >= 0x0e31 && cp <= 0x0e3a) || (cp >= 0x0e47 && cp <= 0x0e4e) || (cp >= 0x0300 && cp <= 0x036f)) continue; // combining marks
    estimate += cp >= 0x1100 && (cp <= 0x11ff || (cp >= 0x2e80 && cp <= 0xd7ff) || (cp >= 0xf900 && cp <= 0xffdc)) ? size : size * 0.6;
  }
  if (measureCtx) {
    measureCtx.font = `${bold ? "700 " : ""}${size}px "Noto Sans", "Segoe UI", sans-serif`;
    return Math.max(measureCtx.measureText(text).width * 1.08, estimate * 0.85);
  }
  return estimate;
}

function slotWidth(ev: ScoreEvent): number {
  let w = BASE_SLOT[ev.duration];
  if (ev.kind === "note" && ev.accidental) w += 12;
  if (ev.kind === "note" && ev.lyric) w = Math.max(w, textWidth(ev.lyric, LYRIC_SIZE) + 10 + (ev.accidental ? 12 : 0));
  return w;
}

interface MeasurePlan { index: number; slots: number[]; starts: number[]; min: number }

function planMeasure(score: ScoreData, mi: number, events: ScoreEvent[]): MeasurePlan {
  const slots = events.map(slotWidth);
  const starts: number[] = [];
  let u = 0;
  for (const ev of events) { starts.push(u); u += DURATION_UNITS[ev.duration]; }
  // Chords must not collide: each chord needs room until the next chord.
  const chords = score.chords.filter((c) => c.measure === mi).sort((a, b) => a.offset - b.offset);
  let chordMin = 0;
  chords.forEach((c, k) => {
    const w = textWidth(c.symbol, CHORD_SIZE, true) + 10;
    if (!events.length) { chordMin += w; return; }
    const next = chords[k + 1];
    let from = 0;
    for (let i = 0; i < starts.length; i++) if (starts[i] <= c.offset) from = i;
    let to = slots.length;
    if (next) for (let i = 0; i < starts.length; i++) if (starts[i] >= next.offset) { to = i; break; }
    const span = slots.slice(from, Math.max(to, from + 1)).reduce((a, b) => a + b, 0);
    if (span < w) slots[from] += w - span;
  });
  const content = slots.reduce((a, b) => a + b, 0);
  return { index: mi, slots, starts, min: Math.max(MIN_MEASURE, content + 2 * MEASURE_PAD, chordMin + 2 * MEASURE_PAD) };
}

export function layoutScore(score: ScoreData): ScoreLayout {
  const cap = measureCapacity(score.timeSignature);
  const bottomDia = bottomLineDia(score.clef);
  const midDia = middleLineDia(score.clef);
  const key = keyInfo(score.keySignature);
  const keyPos = keySignaturePositions(score.keySignature, score.clef);
  const measures = score.measures.length ? score.measures : [{ id: "empty", events: [] as ScoreEvent[] }];
  const plans = measures.map((m, i) => planMeasure(score, i, m.events));
  const headerFor = (first: boolean) => 44 + key.count * 10 + (first ? 30 : 8);

  // Greedy line breaking: measures flow onto a new system instead of shrinking.
  const groups: MeasurePlan[][] = [];
  let cur: MeasurePlan[] = [];
  let used = headerFor(true);
  for (const p of plans) {
    if (cur.length && used + p.min > LAYOUT_WIDTH) {
      groups.push(cur);
      cur = [];
      used = headerFor(false);
    }
    cur.push(p);
    used += p.min;
  }
  if (cur.length) groups.push(cur);

  const factors: number[] = [];
  const systems = groups.map((group, gi) => {
    const header = headerFor(gi === 0);
    const avail = LAYOUT_WIDTH - header - 2;
    const minSum = group.reduce((a, p) => a + p.min, 0);
    let factor = avail / minSum; // stretch to the full printable width
    const isLast = gi === groups.length - 1 && groups.length > 1;
    if (isLast && minSum / avail < LAST_SYSTEM_MIN_FILL) {
      const avg = factors.length ? factors.reduce((a, b) => a + b, 0) / factors.length : 1;
      factor = Math.min(factor, Math.max(1, avg));
    }
    factors.push(factor);

    // Vertical extents of notation relative to the staff top (0..40).
    const yRel = (dia: number) => 40 - (dia - bottomDia) * 5;
    let minY = 0, maxY = 40;
    for (const p of group) for (const ev of measures[p.index].events) {
      if (ev.kind !== "note") continue;
      const dia = ev.pitch ?? midDia;
      const y = yRel(dia);
      const up = dia < midDia;
      minY = Math.min(minY, up ? y - 34 : y - 7);
      maxY = Math.max(maxY, up ? y + 7 : y + 34);
    }
    const hasChords = group.some((p) => score.chords.some((c) => c.measure === p.index));
    const hasLyrics = group.some((p) => measures[p.index].events.some((e) => e.kind === "note" && e.lyric));
    const numberY = 12;
    const chordY = hasChords ? numberY + 20 : numberY;
    const staffTop = Math.max(chordY + 14, numberY + 8) - minY;
    const lyricY = staffTop + maxY + 20;
    const height = (hasLyrics ? lyricY + 10 : staffTop + maxY + 10);
    const yFor = (dia: number) => staffTop + yRel(dia);

    let mx = header;
    const laid: LaidMeasure[] = group.map((p) => {
      const width = p.min * factor;
      const contentScale = (width - 2 * MEASURE_PAD) / Math.max(1, p.slots.reduce((a, b) => a + b, 0));
      const evs = measures[p.index].events;
      let x = mx + MEASURE_PAD;
      const xs: number[] = [];
      const events: LaidEvent[] = evs.map((ev, i) => {
        const slot = p.slots[i] * (evs.length ? contentScale : 1);
        const accShift = ev.kind === "note" && ev.accidental ? 12 * Math.min(1, contentScale) : 0;
        const cx = x + accShift + Math.min(slot - accShift, BASE_SLOT[ev.duration]) / 2;
        xs.push(x);
        x += slot;
        const dia = ev.pitch ?? midDia;
        const ledgers: number[] = [];
        if (ev.kind === "note") {
          for (let d = bottomDia - 2; d >= dia; d -= 2) ledgers.push(d);
          for (let d = bottomDia + 10; d <= dia; d += 2) ledgers.push(d);
        }
        return { event: ev, x: ev.kind === "note" && ev.lyric ? Math.max(cx, xs[i] + accShift + textWidth(ev.lyric, LYRIC_SIZE) / 2 + 5) : cx, y: yFor(dia), dia, stemUp: dia < midDia, ledgers };
      });
      const chords = score.chords.filter((c) => c.measure === p.index).sort((a, b) => a.offset - b.offset).map((c, k, all) => {
        let cx: number;
        if (!events.length) {
          const before = all.slice(0, k).reduce((a, o) => a + textWidth(o.symbol, CHORD_SIZE, true) + 10, 0);
          cx = mx + MEASURE_PAD + before;
        } else {
          let i = 0;
          for (let j = 0; j < p.starts.length; j++) if (p.starts[j] <= c.offset) i = j;
          cx = c.offset === p.starts[i] ? events[i].x - 6 : mx + MEASURE_PAD + (c.offset / cap) * (width - 2 * MEASURE_PAD);
        }
        return { id: c.id, x: cx, symbol: c.symbol };
      });
      const m: LaidMeasure = { index: p.index, x: mx, width, events, chords, last: p.index === measures.length - 1 };
      mx += width;
      return m;
    });

    const sys: LaidSystem = {
      height, staffTop, staffBottom: staffTop + 40, chordY, lyricY, numberY: staffTop - 6, right: mx, header,
      showTime: gi === 0,
      keyGlyphs: keyPos.map((d, i) => ({ x: 48 + i * 10, y: yFor(d) })),
      measures: laid, yFor,
    };
    return sys;
  });

  const [timeTop, timeBottom] = score.timeSignature.split("/");
  return { systems, keyType: key.count === 0 ? "none" : key.type === "sharp" ? "sharp" : "flat", timeTop, timeBottom };
}

export const LAYOUT_FONT = { lyric: LYRIC_SIZE, chord: CHORD_SIZE };
