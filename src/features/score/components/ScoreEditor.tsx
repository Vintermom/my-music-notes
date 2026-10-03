import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { ScoreData, ScoreEvent } from "../types/score.types";
import {
  eventUnits, beatUnits, bottomLineDia, keyInfo, keySignaturePositions,
  measureCapacity, middleLineDia, pitchRange,
} from "../utils/notation";
import { ACCIDENTAL_GLYPH, DotShape, NoteShape, RestShape, TieShape } from "./NotationGlyphs";
import { tieCompatible } from "../utils/scoreEdit";
import { scoreT } from "../i18n";

export type EntryMode = "note" | "rest" | "chord";
export interface ChordTarget { id?: string; measure: number; offset: number; symbol: string }

interface Props {
  score: ScoreData;
  mode: EntryMode;
  selectedId: string | null;
  hasSelection?: boolean;
  playingId: string | null;
  onPlace: (measure: number, index: number, pitch: number) => void;
  onSelect: (id: string | null) => void;
  onChordTarget: (target: ChordTarget) => void;
  onMeasureMenu: (measure: number) => void;
  staffActions?: ReactNode;
  staffHelp?: ReactNode;
  /** Inline per-note lyric editing under the selected note. */
  onLyricChange?: (id: string, lyric: string) => void;
  /** Returns the next note id to edit after Enter, or null. */
  onLyricNext?: (id: string) => string | null;
}

// Geometry (px). Line spacing 10, so one diatonic step = 5.
const SYS_H = 160;
const CHORD_Y = 26;
const TOP = 52;
const BOTTOM = TOP + 40;
const LYRIC_Y = BOTTOM + 46;
const MOBILE_TOP_COMPACT = 42;
const MOBILE_LYRIC_GAP = 30;
const MOBILE_BOTTOM_GAP = 20;
const MIN_MEASURE_W = 170;
const PAD = 18;
const CLEF_FONT = { fontFamily: '"Noto Music", "Segoe UI Symbol", "Apple Symbols", "Bravura", serif' };

interface MeasureLayout { index: number; sys: number; x: number; w: number; virtual: boolean; header: number }
interface SystemGeometry { offset: number; top: number; bottom: number; chordY: number; lyricY: number; height: number }

export function ScoreEditor({ score, mode, selectedId, hasSelection = false, playingId, onPlace, onSelect, onChordTarget, onMeasureMenu, staffActions, staffHelp, onLyricChange, onLyricNext }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const lyricRef = useRef<HTMLInputElement>(null);
  const [width, setWidth] = useState(360);
  const [focusLyricId, setFocusLyricId] = useState<string | null>(null);

  useEffect(() => {
    if (!focusLyricId || focusLyricId !== selectedId) return;
    const el = lyricRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.select();
    // Keep the note and its field visible above the on-screen keyboard.
    const keep = () => el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
    keep();
    const timer = window.setTimeout(keep, 350);
    return () => window.clearTimeout(timer);
  }, [focusLyricId, selectedId]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(Math.max(300, Math.floor(el.clientWidth))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cap = measureCapacity(score.timeSignature);
  const bottomDia = bottomLineDia(score.clef);
  const key = keyInfo(score.keySignature);
  const keyPositions = keySignaturePositions(score.keySignature, score.clef);

  const layout = useMemo(() => {
    const headerFor = (first: boolean) => 46 + key.count * 9 + (first ? 26 : 6);
    const total = score.measures.length + 1; // trailing empty measure for input
    const result: MeasureLayout[] = [];
    let m = 0;
    let sys = 0;
    while (m < total) {
      const header = headerFor(sys === 0);
      const available = Math.max(MIN_MEASURE_W, width - header - 4);
      let x = header;
      let used = 0;
      while (m < total) {
        const measure = score.measures[m];
        const events = measure?.events || [];
        const chordChars = score.chords
          .filter((chord) => chord.measure === m)
          .reduce((sum, chord) => sum + chord.symbol.length, 0);
        const unitWidth = events.reduce((largest, event) => {
          const glyphWidth = Math.max(28, (event.lyric?.length || 0) * 7 + 12, event.accidental ? 36 : 28) + (event.dotted ? 8 : 0);
          return Math.max(largest, glyphWidth / eventUnits(event));
        }, 0);
        const chordWidth = Math.min(120, chordChars * 7);
        const contentWidth = PAD * 2 + cap * unitWidth + chordWidth;
        const desired = Math.max(MIN_MEASURE_W, contentWidth);
        const remaining = available - used;
        if (used > 0 && desired > remaining) break;
        const measureWidth = used === 0 && desired > available ? desired : Math.min(desired, remaining);
        result.push({ index: m, sys, x, w: measureWidth, virtual: m === score.measures.length, header });
        x += measureWidth;
        used += measureWidth;
        m++;
        if (used >= available || m >= total) break;
      }
      sys++;
    }
    const renderWidth = Math.max(width, ...result.map((measure) => measure.x + measure.w + 4));
    return { measures: result, systems: sys, renderWidth };
  }, [score.measures, score.chords, width, key.count, cap]);

  const systemGeometry = useMemo(() => {
    let offset = 0;
    return Array.from({ length: layout.systems }, (_, sys): SystemGeometry => {
      if (width >= 768) return { offset: sys * SYS_H, top: TOP, bottom: BOTTOM, chordY: CHORD_Y, lyricY: LYRIC_Y, height: SYS_H };
      const measureIndexes = new Set(layout.measures.filter((measure) => measure.sys === sys).map((measure) => measure.index));
      const hasChords = score.chords.some((chord) => measureIndexes.has(chord.measure));
      const hasLyrics = score.measures.some((measure, index) => measureIndexes.has(index) && measure.events.some((event) => event.kind === "note" && (event.lyric || event.id === selectedId)));
      const top = hasChords ? TOP : MOBILE_TOP_COMPACT;
      const bottom = top + 40;
      const lyricY = bottom + MOBILE_LYRIC_GAP;
      const height = hasLyrics ? lyricY + MOBILE_BOTTOM_GAP : bottom + MOBILE_BOTTOM_GAP;
      const geometry = { offset, top, bottom, chordY: hasChords ? CHORD_Y : top - 26, lyricY, height };
      offset += height;
      return geometry;
    });
  }, [layout.measures, layout.systems, score.chords, score.measures, selectedId, width]);

  const eventX = (ml: MeasureLayout, startUnits: number) => ml.x + PAD + (startUnits / cap) * (ml.w - 2 * PAD);
  const yFor = (dia: number, sys: number) => {
    const geometry = systemGeometry[sys];
    return (geometry?.offset ?? sys * SYS_H) + (geometry?.bottom ?? BOTTOM) - (dia - bottomDia) * 5;
  };

  const positioned = useMemo(() => {
    const list: { ev: ScoreEvent; x: number; ml: MeasureLayout; index: number }[] = [];
    layout.measures.forEach((ml) => {
      let start = 0;
      (score.measures[ml.index]?.events || []).forEach((ev, index) => {
        list.push({ ev, x: eventX(ml, start), ml, index });
        start += eventUnits(ev);
      });
    });
    return list;
  }, [layout, score.measures, cap]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const sys = systemGeometry.findIndex((geometry) => y >= geometry.offset && y < geometry.offset + geometry.height);
    if (sys < 0) return;
    const geometry = systemGeometry[sys];
    const localY = y - geometry.offset;
    const inSys = layout.measures.filter((m) => m.sys === sys);
    if (!inSys.length) return;
    const ml = inSys.find((m) => x >= m.x && x < m.x + m.w) || inSys[0];
    const cx = Math.max(x, ml.x);

    // Chord row (or Chord mode): edit an existing chord or add a new one.
    if (mode === "chord" || localY < geometry.top - 12) {
      if (ml.virtual && mode !== "chord") return;
      const hit = score.chords.find((c) => c.measure === ml.index && Math.abs(eventX(ml, c.offset) - cx) < 22);
      if (hit) { onChordTarget({ ...hit }); return; }
      const bu = beatUnits(score.timeSignature);
      const frac = (cx - ml.x - PAD) / (ml.w - 2 * PAD);
      const offset = Math.min(cap - bu, Math.max(0, Math.round((frac * cap) / bu) * bu));
      onChordTarget({ measure: ml.index, offset, symbol: "" });
      return;
    }

    // Tap on a note/rest selects it.
    const near = positioned
      .filter((p) => p.ml.index === ml.index)
      .map((p) => ({ p, d: Math.abs(p.x - cx) }))
      .filter((o) => o.d < 13)
      .sort((a, b) => a.d - b.d)[0];
    if (near) {
      onSelect(near.p.ev.id);
      setFocusLyricId(near.p.ev.kind === "note" && localY > geometry.lyricY - 20 ? near.p.ev.id : null);
      return;
    }
    setFocusLyricId(null);
    if (hasSelection || selectedId) { onSelect(null); return; }
    if (localY > geometry.lyricY - 14) return;

    const [lo, hi] = pitchRange(score.clef);
    const pitch = Math.min(hi, Math.max(lo, Math.round((geometry.bottom - localY) / 5) + bottomDia));
    const index = positioned.filter((p) => p.ml.index === ml.index && p.x < cx).length;
    onPlace(ml.index, index, pitch);
  };

  const lastGeometry = systemGeometry[systemGeometry.length - 1];
  const height = lastGeometry ? lastGeometry.offset + lastGeometry.height : 0;
  const playing = positioned.find((p) => p.ev.id === playingId);
  const selectedPos = positioned.find((p) => p.ev.id === selectedId && p.ev.kind === "note");
  const ties: ReactNode[] = [];
  positioned.forEach((p, i) => {
    const next = positioned[i + 1];
    if (!p.ev.tie || !next || !tieCompatible(score, p.ev, next.ev)) return;
    const dia = p.ev.pitch ?? middleLineDia(score.clef);
    const below = dia < middleLineDia(score.clef);
    const y = yFor(dia, p.ml.sys);
    if (next.ml.sys === p.ml.sys) {
      ties.push(<TieShape key={p.ev.id} x1={p.x + 7} x2={next.x - 7} y={y} below={below} />);
    } else {
      const end = layout.measures.filter((m) => m.sys === p.ml.sys).pop();
      ties.push(<TieShape key={p.ev.id} x1={p.x + 7} x2={(end ? end.x + end.w : p.x + 30) - 2} y={y} below={below} />);
      ties.push(<TieShape key={`${p.ev.id}-b`} x1={next.ml.header - 4} x2={next.x - 7} y={yFor(dia, next.ml.sys)} below={below} />);
    }
  });

  return (
    <section dir="ltr" aria-label={scoreT("score.workspace")} className="relative rounded-lg border border-border">
      {staffActions && <div className="absolute right-2 top-2 z-[1] flex items-center gap-1 rounded-md bg-background/90 shadow-sm backdrop-blur-sm">{staffActions}</div>}
      <div ref={wrapRef} className="w-full overflow-x-auto">
        <div className="relative" style={{ width: layout.renderWidth }}>
        <svg
          width={layout.renderWidth}
          height={height}
          onClick={handleClick}
          className="block touch-manipulation select-none text-foreground"
          role="application"
          aria-label={scoreT("score.workspace")}
        >
          {Array.from({ length: layout.systems }).map((_, sys) => {
            const geometry = systemGeometry[sys];
            const oy = geometry.offset;
            const sysMeasures = layout.measures.filter((m) => m.sys === sys);
            const end = sysMeasures[sysMeasures.length - 1];
            const right = end.virtual ? end.x + end.w : end.x + end.w;
            return (
              <g key={sys} data-score-system={sys} data-score-system-height={geometry.height}>
                <g className="text-muted-foreground">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line key={i} x1={4} x2={right} y1={oy + geometry.top + i * 10} y2={oy + geometry.top + i * 10} stroke="currentColor" strokeWidth={1} />
                  ))}
                  <line x1={4} x2={4} y1={oy + geometry.top} y2={oy + geometry.bottom} stroke="currentColor" />
                </g>
                <text
                  x={8}
                  y={score.clef === "treble" ? oy + geometry.bottom + 9 : oy + geometry.bottom - 7}
                  fontSize={score.clef === "treble" ? 52 : 36}
                  fill="currentColor"
                  style={CLEF_FONT}
                >
                  {score.clef === "treble" ? "𝄞" : "𝄢"}
                </text>
                {keyPositions.map((p, i) => (
                  <text key={i} x={48 + i * 9} y={yFor(p, sys) + 5} fontSize={17} fill="currentColor" textAnchor="middle">
                    {key.type === "sharp" ? "♯" : "♭"}
                  </text>
                ))}
                {sys === 0 && (
                  <g fontSize={20} fontWeight={700} fill="currentColor" textAnchor="middle">
                    <text x={sysMeasures[0].header - 16} y={oy + geometry.top + 18}>{score.timeSignature.split("/")[0]}</text>
                    <text x={sysMeasures[0].header - 16} y={oy + geometry.top + 38}>{score.timeSignature.split("/")[1]}</text>
                  </g>
                )}
                {sysMeasures.map((ml) => (
                  <g key={ml.index}>
                    <line
                      x1={ml.x + ml.w} x2={ml.x + ml.w} y1={oy + geometry.top} y2={oy + geometry.bottom}
                      stroke="currentColor" className="text-muted-foreground"
                      strokeDasharray={ml.virtual ? "3 3" : undefined}
                    />
                    {ml.virtual ? (
                      <text x={ml.x + 3} y={oy + geometry.top - 6} fontSize={9} className="fill-muted-foreground">{ml.index + 1}</text>
                    ) : (
                      <g
                        className="cursor-pointer text-muted-foreground"
                        onClick={(event) => { event.stopPropagation(); onMeasureMenu(ml.index); }}
                        role="button" tabIndex={0}
                        aria-label={scoreT("score.measureMenu").replace("{number}", String(ml.index + 1))}
                        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onMeasureMenu(ml.index); } }}
                      >
                        <rect x={ml.x} y={oy + geometry.top - 27} width={30} height={24} rx={4} fill="currentColor" opacity={0.08} />
                        <text x={ml.x + 7} y={oy + geometry.top - 10} fontSize={10} fill="currentColor">{ml.index + 1} ⋯</text>
                      </g>
                    )}
                  </g>
                ))}
              </g>
            );
          })}

          {/* Chord symbols (separate from notation data) */}
          {score.chords.map((c) => {
            const ml = layout.measures.find((m) => m.index === c.measure);
            if (!ml) return null;
            return (
              <text key={c.id} x={eventX(ml, c.offset) - 4} y={systemGeometry[ml.sys].offset + systemGeometry[ml.sys].chordY} fontSize={14} fontWeight={700} className="fill-primary">
                {c.symbol}
              </text>
            );
          })}

          {playing && (
            <rect
              x={playing.x - 11} y={systemGeometry[playing.ml.sys].offset + systemGeometry[playing.ml.sys].top - 22} width={22} height={86} rx={4}
              className="fill-primary/15"
            />
          )}

          {positioned.map(({ ev, x, ml }) => {
            const active = ev.id === selectedId || ev.id === playingId;
            const geometry = systemGeometry[ml.sys];
            const sysY = geometry.offset;
            if (ev.kind === "rest") {
              return (
                <g key={ev.id} className={active ? "text-primary" : "text-foreground"}>
                  {ev.id === selectedId && <rect x={x - 12} y={sysY + geometry.top - 4} width={24} height={50} rx={4} className="fill-primary/10" />}
                  <RestShape x={x} top={sysY + geometry.top} duration={ev.duration} />
                  {ev.dotted && <DotShape x={x - 2} y={sysY + geometry.top + 15} onLine={false} />}
                </g>
              );
            }
            const dia = ev.pitch ?? middleLineDia(score.clef);
            const y = yFor(dia, ml.sys);
            const ledgers: number[] = [];
            for (let d = bottomDia - 2; d >= dia; d -= 2) ledgers.push(d);
            for (let d = bottomDia + 10; d <= dia; d += 2) ledgers.push(d);
            return (
              <g key={ev.id} data-score-event={ev.id} className={active ? "text-primary" : "text-foreground"}>
                {ev.id === selectedId && <circle cx={x} cy={y} r={11} className="fill-primary/15" />}
                {ledgers.map((d) => (
                  <line key={d} x1={x - 10} x2={x + 10} y1={yFor(d, ml.sys)} y2={yFor(d, ml.sys)} stroke="currentColor" strokeWidth={1} />
                ))}
                {ev.accidental && (
                  <text x={x - 15} y={y + 5} fontSize={15} fill="currentColor" textAnchor="middle">{ACCIDENTAL_GLYPH[ev.accidental]}</text>
                )}
                <NoteShape x={x} y={y} duration={ev.duration} stemUp={dia < middleLineDia(score.clef)} dotted={ev.dotted} onLine={(dia - bottomDia) % 2 === 0} />
                {ev.lyric && ev.id !== selectedPos?.ev.id && (
                    <text data-score-lyric x={x} y={sysY + geometry.lyricY} fontSize={12} textAnchor="middle" className="fill-foreground">{ev.lyric}</text>
                )}
              </g>
            );
          })}
          {ties}
        </svg>
        {selectedPos && onLyricChange && (
          <input
            ref={lyricRef}
            data-score-inline-lyric
            value={selectedPos.ev.lyric || ""}
            maxLength={200}
            enterKeyHint="next"
            placeholder={scoreT("score.lyricShort")}
            aria-label={scoreT("score.lyric")}
            onChange={(event) => onLyricChange(selectedPos.ev.id, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || (event.key === "Tab" && !event.shiftKey)) {
                event.preventDefault();
                const next = onLyricNext?.(selectedPos.ev.id) ?? null;
                setFocusLyricId(next);
                if (!next) event.currentTarget.blur();
              } else if (event.key === "Escape") {
                event.currentTarget.blur();
              }
            }}
            className="absolute h-6 rounded border border-primary bg-background px-1 text-center text-xs text-foreground shadow-sm outline-none focus:ring-2 focus:ring-primary/40"
            style={{
              width: Math.max(64, (selectedPos.ev.lyric?.length || 0) * 8 + 24),
              left: selectedPos.x - Math.max(64, (selectedPos.ev.lyric?.length || 0) * 8 + 24) / 2,
              top: systemGeometry[selectedPos.ml.sys].offset + systemGeometry[selectedPos.ml.sys].lyricY - 16,
            }}
          />
        )}
        </div>
      </div>
      {staffHelp}
    </section>
  );
}
