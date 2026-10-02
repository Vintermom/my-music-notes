import { useEffect, useMemo, useRef, useState } from "react";
import type { ScoreData, ScoreEvent } from "../types/score.types";
import {
  DURATION_UNITS, beatUnits, bottomLineDia, keyInfo, keySignaturePositions,
  measureCapacity, middleLineDia, pitchRange,
} from "../utils/notation";
import { ACCIDENTAL_GLYPH, NoteShape, RestShape } from "./NotationGlyphs";
import { scoreT } from "../i18n";

export type EntryMode = "note" | "rest" | "chord";
export interface ChordTarget { id?: string; measure: number; offset: number; symbol: string }

interface Props {
  score: ScoreData;
  mode: EntryMode;
  selectedId: string | null;
  playingId: string | null;
  onPlace: (measure: number, index: number, pitch: number) => void;
  onSelect: (id: string | null) => void;
  onChordTarget: (target: ChordTarget) => void;
}

// Geometry (px). Line spacing 10, so one diatonic step = 5.
const SYS_H = 160;
const CHORD_Y = 26;
const TOP = 52;
const BOTTOM = TOP + 40;
const LYRIC_Y = BOTTOM + 46;
const MIN_MEASURE_W = 170;
const PAD = 18;
const CLEF_FONT = { fontFamily: '"Noto Music", "Segoe UI Symbol", "Apple Symbols", "Bravura", serif' };

interface MeasureLayout { index: number; sys: number; x: number; w: number; virtual: boolean; header: number }

export function ScoreEditor({ score, mode, selectedId, playingId, onPlace, onSelect, onChordTarget }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(360);

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
    const headerFor = (first: boolean) => 38 + key.count * 9 + (first ? 26 : 6);
    const total = score.measures.length + 1; // trailing empty measure for input
    const result: MeasureLayout[] = [];
    let m = 0;
    let sys = 0;
    while (m < total) {
      const header = headerFor(sys === 0);
      const perSys = Math.max(1, Math.floor((width - header - 4) / MIN_MEASURE_W));
      const w = (width - header - 4) / perSys;
      for (let k = 0; k < perSys && m < total; k++, m++) {
        result.push({ index: m, sys, x: header + k * w, w, virtual: m === score.measures.length, header });
      }
      sys++;
    }
    return { measures: result, systems: sys };
  }, [score.measures.length, width, key.count]);

  const eventX = (ml: MeasureLayout, startUnits: number) => ml.x + PAD + (startUnits / cap) * (ml.w - 2 * PAD);
  const yFor = (dia: number, sys: number) => sys * SYS_H + BOTTOM - (dia - bottomDia) * 5;

  const positioned = useMemo(() => {
    const list: { ev: ScoreEvent; x: number; ml: MeasureLayout; index: number }[] = [];
    layout.measures.forEach((ml) => {
      let start = 0;
      (score.measures[ml.index]?.events || []).forEach((ev, index) => {
        list.push({ ev, x: eventX(ml, start), ml, index });
        start += DURATION_UNITS[ev.duration];
      });
    });
    return list;
  }, [layout, score.measures, cap]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const sys = Math.floor(y / SYS_H);
    const localY = y - sys * SYS_H;
    const inSys = layout.measures.filter((m) => m.sys === sys);
    if (!inSys.length) return;
    const ml = inSys.find((m) => x >= m.x && x < m.x + m.w) || inSys[0];
    const cx = Math.max(x, ml.x);

    // Chord row (or Chord mode): edit an existing chord or add a new one.
    if (mode === "chord" || localY < TOP - 12) {
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
    if (near) { onSelect(near.p.ev.id); return; }
    if (selectedId) { onSelect(null); return; }
    if (localY > LYRIC_Y - 14) return;

    const [lo, hi] = pitchRange(score.clef);
    const pitch = Math.min(hi, Math.max(lo, Math.round((BOTTOM - localY) / 5) + bottomDia));
    const index = positioned.filter((p) => p.ml.index === ml.index && p.x < cx).length;
    onPlace(ml.index, index, pitch);
  };

  const height = layout.systems * SYS_H;
  const playing = positioned.find((p) => p.ev.id === playingId);

  return (
    <section aria-label={scoreT("score.workspace")} className="rounded-lg border border-border">
      <div ref={wrapRef} className="w-full overflow-x-auto">
        <svg
          width={width}
          height={height}
          onClick={handleClick}
          className="block touch-manipulation select-none text-foreground"
          role="application"
          aria-label={scoreT("score.workspace")}
        >
          {Array.from({ length: layout.systems }).map((_, sys) => {
            const oy = sys * SYS_H;
            const sysMeasures = layout.measures.filter((m) => m.sys === sys);
            const end = sysMeasures[sysMeasures.length - 1];
            const right = end.virtual ? end.x + end.w : end.x + end.w;
            return (
              <g key={sys}>
                <g className="text-muted-foreground">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line key={i} x1={4} x2={right} y1={oy + TOP + i * 10} y2={oy + TOP + i * 10} stroke="currentColor" strokeWidth={1} />
                  ))}
                  <line x1={4} x2={4} y1={oy + TOP} y2={oy + BOTTOM} stroke="currentColor" />
                </g>
                <text
                  x={8}
                  y={score.clef === "treble" ? oy + BOTTOM + 9 : oy + BOTTOM - 7}
                  fontSize={score.clef === "treble" ? 52 : 36}
                  fill="currentColor"
                  style={CLEF_FONT}
                >
                  {score.clef === "treble" ? "𝄞" : "𝄢"}
                </text>
                {keyPositions.map((p, i) => (
                  <text key={i} x={40 + i * 9} y={yFor(p, sys) + 5} fontSize={17} fill="currentColor" textAnchor="middle">
                    {key.type === "sharp" ? "♯" : "♭"}
                  </text>
                ))}
                {sys === 0 && (
                  <g fontSize={20} fontWeight={700} fill="currentColor" textAnchor="middle">
                    <text x={sysMeasures[0].header - 16} y={oy + TOP + 18}>{score.timeSignature.split("/")[0]}</text>
                    <text x={sysMeasures[0].header - 16} y={oy + TOP + 38}>{score.timeSignature.split("/")[1]}</text>
                  </g>
                )}
                {sysMeasures.map((ml) => (
                  <g key={ml.index}>
                    <line
                      x1={ml.x + ml.w} x2={ml.x + ml.w} y1={oy + TOP} y2={oy + BOTTOM}
                      stroke="currentColor" className="text-muted-foreground"
                      strokeDasharray={ml.virtual ? "3 3" : undefined}
                    />
                    <text x={ml.x + 3} y={oy + TOP - 6} fontSize={9} className="fill-muted-foreground">{ml.index + 1}</text>
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
              <text key={c.id} x={eventX(ml, c.offset) - 4} y={ml.sys * SYS_H + CHORD_Y} fontSize={14} fontWeight={700} className="fill-primary">
                {c.symbol}
              </text>
            );
          })}

          {playing && (
            <rect
              x={playing.x - 11} y={playing.ml.sys * SYS_H + TOP - 22} width={22} height={86} rx={4}
              className="fill-primary/15"
            />
          )}

          {positioned.map(({ ev, x, ml }) => {
            const active = ev.id === selectedId || ev.id === playingId;
            const sysY = ml.sys * SYS_H;
            if (ev.kind === "rest") {
              return (
                <g key={ev.id} className={active ? "text-primary" : "text-foreground"}>
                  {ev.id === selectedId && <rect x={x - 12} y={sysY + TOP - 4} width={24} height={50} rx={4} className="fill-primary/10" />}
                  <RestShape x={x} top={sysY + TOP} duration={ev.duration} />
                </g>
              );
            }
            const dia = ev.pitch ?? middleLineDia(score.clef);
            const y = yFor(dia, ml.sys);
            const ledgers: number[] = [];
            for (let d = bottomDia - 2; d >= dia; d -= 2) ledgers.push(d);
            for (let d = bottomDia + 10; d <= dia; d += 2) ledgers.push(d);
            return (
              <g key={ev.id} className={active ? "text-primary" : "text-foreground"}>
                {ev.id === selectedId && <circle cx={x} cy={y} r={11} className="fill-primary/15" />}
                {ledgers.map((d) => (
                  <line key={d} x1={x - 10} x2={x + 10} y1={yFor(d, ml.sys)} y2={yFor(d, ml.sys)} stroke="currentColor" strokeWidth={1} />
                ))}
                {ev.accidental && (
                  <text x={x - 15} y={y + 5} fontSize={15} fill="currentColor" textAnchor="middle">{ACCIDENTAL_GLYPH[ev.accidental]}</text>
                )}
                <NoteShape x={x} y={y} duration={ev.duration} stemUp={dia < middleLineDia(score.clef)} />
                {ev.lyric && (
                  <text x={x} y={sysY + LYRIC_Y} fontSize={12} textAnchor="middle" className="fill-foreground">{ev.lyric}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
