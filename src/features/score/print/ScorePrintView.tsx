import type { ScoreData, ScoreEvent } from "../types/score.types";
import {
  DURATION_UNITS, bottomLineDia, keyInfo, keySignaturePositions, measureCapacity, middleLineDia,
} from "../utils/notation";
import { ACCIDENTAL_GLYPH, NoteShape, RestShape } from "../components/NotationGlyphs";

// Static, print-only rendering. One SVG per staff system so pages never cut a system.
const W = 680;
const SYS_H = 150;
const CHORD_Y = 24;
const TOP = 48;
const BOTTOM = TOP + 40;
const LYRIC_Y = BOTTOM + 44;
const PER_SYS = 4;
const PAD = 16;

export interface ScorePrintLabels {
  composer: string;
  key: string;
  time: string;
  tempo: string;
}

interface Props {
  title: string;
  composer: string;
  score: ScoreData;
  labels: ScorePrintLabels;
}

export function ScorePrintView({ title, composer, score, labels }: Props) {
  const cap = measureCapacity(score.timeSignature);
  const bottomDia = bottomLineDia(score.clef);
  const key = keyInfo(score.keySignature);
  const keyPos = keySignaturePositions(score.keySignature, score.clef);
  const measures = score.measures.length ? score.measures : [{ id: "empty", events: [] as ScoreEvent[] }];
  const systems: number[][] = [];
  for (let i = 0; i < measures.length; i += PER_SYS) {
    systems.push(Array.from({ length: Math.min(PER_SYS, measures.length - i) }, (_, k) => i + k));
  }
  const [tsTop, tsBottom] = score.timeSignature.split("/");

  return (
    <div className="score-doc">
      <header className="score-head">
        <h1>{title}</h1>
        {composer && <p className="score-composer">{labels.composer}: {composer}</p>}
        <p className="score-meta">
          {labels.key}: {score.keySignature} · {labels.time}: {score.timeSignature} · {labels.tempo}: ♩ = {score.tempo}
        </p>
      </header>
      {systems.map((idxs, sys) => {
        const header = 46 + key.count * 9 + (sys === 0 ? 26 : 6);
        const mw = (W - header - 4) / PER_SYS;
        const right = header + idxs.length * mw;
        const yFor = (dia: number) => BOTTOM - (dia - bottomDia) * 5;
        return (
          <svg key={sys} className="score-system" viewBox={`0 0 ${W} ${SYS_H}`} width="100%" xmlns="http://www.w3.org/2000/svg">
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={4} x2={right} y1={TOP + i * 10} y2={TOP + i * 10} stroke="#000" strokeWidth={0.8} />
            ))}
            <line x1={4} x2={4} y1={TOP} y2={BOTTOM} stroke="#000" />
            <text className="clef" x={8} y={score.clef === "treble" ? BOTTOM + 9 : BOTTOM - 7} fontSize={score.clef === "treble" ? 52 : 36}>
              {score.clef === "treble" ? "𝄞" : "𝄢"}
            </text>
            {keyPos.map((p, i) => (
              <text key={i} x={48 + i * 9} y={yFor(p) + 5} fontSize={17} textAnchor="middle">{key.type === "sharp" ? "♯" : "♭"}</text>
            ))}
            {sys === 0 && (
              <g fontSize={20} fontWeight={700} textAnchor="middle">
                <text x={header - 16} y={TOP + 18}>{tsTop}</text>
                <text x={header - 16} y={TOP + 38}>{tsBottom}</text>
              </g>
            )}
            {idxs.map((mi, k) => {
              const mx = header + k * mw;
              const ex = (u: number) => mx + PAD + (u / cap) * (mw - 2 * PAD);
              let start = 0;
              return (
                <g key={mi}>
                  <line x1={mx + mw} x2={mx + mw} y1={TOP} y2={BOTTOM} stroke="#000" strokeWidth={mi === measures.length - 1 ? 2.5 : 1} />
                  <text x={mx + 3} y={TOP - 6} fontSize={9}>{mi + 1}</text>
                  {score.chords.filter((c) => c.measure === mi).map((c) => (
                    <text key={c.id} x={ex(c.offset) - 4} y={CHORD_Y} fontSize={14} fontWeight={700}>{c.symbol}</text>
                  ))}
                  {measures[mi].events.map((ev) => {
                    const x = ex(start);
                    start += DURATION_UNITS[ev.duration];
                    if (ev.kind === "rest") return <g key={ev.id}><RestShape x={x} top={TOP} duration={ev.duration} /></g>;
                    const dia = ev.pitch ?? middleLineDia(score.clef);
                    const y = yFor(dia);
                    const ledgers: number[] = [];
                    for (let d = bottomDia - 2; d >= dia; d -= 2) ledgers.push(d);
                    for (let d = bottomDia + 10; d <= dia; d += 2) ledgers.push(d);
                    return (
                      <g key={ev.id}>
                        {ledgers.map((d) => <line key={d} x1={x - 10} x2={x + 10} y1={yFor(d)} y2={yFor(d)} stroke="#000" />)}
                        {ev.accidental && <text x={x - 15} y={y + 5} fontSize={15} textAnchor="middle">{ACCIDENTAL_GLYPH[ev.accidental]}</text>}
                        <NoteShape x={x} y={y} duration={ev.duration} stemUp={dia < middleLineDia(score.clef)} />
                        {ev.lyric && <text className="lyric" x={x} y={LYRIC_Y} fontSize={12} textAnchor="middle">{ev.lyric}</text>}
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        );
      })}
    </div>
  );
}
