import type { ScoreClef, ScoreData } from "../types/score.types";
import { ACCIDENTAL_GLYPH, DotShape, NoteShape, RestShape, TieShape } from "../components/NotationGlyphs";
import { LAYOUT_FONT, LAYOUT_WIDTH, layoutScore, type LaidSystem, type ScoreLayout } from "./scoreLayout";

export interface ScorePrintLabels {
  composer: string;
  key: string;
  time: string;
  tempo: string;
  style: string;
  tags: string;
  created: string;
  updated: string;
  lyrics: string;
}

export interface ScorePrintMeta {
  style: string;
  tags: string[];
  created: string;
  updated: string;
}

/** "all" = print; "shapes" = vector notation without text; "glyphs" = clef + accidentals only. */
export type SystemLayer = "all" | "shapes" | "glyphs";

interface SystemProps { system: LaidSystem; layout: ScoreLayout; clef: ScoreClef; layer?: SystemLayer }

export function ScoreSystemSvg({ system: s, layout, clef, layer = "all" }: SystemProps) {
  const shapes = layer !== "glyphs";
  const glyphs = layer !== "shapes";
  const text = layer === "all";
  const keyGlyph = layout.keyType === "sharp" ? "♯" : "♭";
  return (
    <svg className="score-system" viewBox={`0 0 ${LAYOUT_WIDTH} ${s.height}`} width="100%" color="#000" xmlns="http://www.w3.org/2000/svg">
      {shapes && [0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={4} x2={s.right} y1={s.staffTop + i * 10} y2={s.staffTop + i * 10} stroke="#000" strokeWidth={0.8} />
      ))}
      {shapes && <line x1={4} x2={4} y1={s.staffTop} y2={s.staffBottom} stroke="#000" strokeWidth={1} />}
      {glyphs && (
        <text className="clef" x={8} y={clef === "treble" ? s.staffBottom + 9 : s.staffBottom - 7} fontSize={clef === "treble" ? 52 : 36}>
          {clef === "treble" ? "𝄞" : "𝄢"}
        </text>
      )}
      {glyphs && layout.keyType !== "none" && s.keyGlyphs.map((k, i) => (
        <text key={i} x={k.x} y={k.y + 5} fontSize={17} textAnchor="middle">{keyGlyph}</text>
      ))}
      {text && s.showTime && (
        <g fontSize={20} fontWeight={700} textAnchor="middle">
          <text x={s.header - 16} y={s.staffTop + 18}>{layout.timeTop}</text>
          <text x={s.header - 16} y={s.staffTop + 38}>{layout.timeBottom}</text>
        </g>
      )}
      {s.measures.map((m) => (
        <g key={m.index}>
          {shapes && <line x1={m.x + m.width} x2={m.x + m.width} y1={s.staffTop} y2={s.staffBottom} stroke="#000" strokeWidth={m.last ? 2.5 : 1} />}
          {text && <text x={m.x + 3} y={s.numberY} fontSize={9}>{m.index + 1}</text>}
          {text && m.chords.map((c) => (
            <text key={c.id} x={c.x} y={s.chordY} fontSize={LAYOUT_FONT.chord} fontWeight={700}>{c.symbol}</text>
          ))}
          {m.events.map((le) => {
            const ev = le.event;
            if (ev.kind === "rest") return shapes ? <g key={ev.id}><RestShape x={le.x} top={s.staffTop} duration={ev.duration} />{ev.dotted && <DotShape x={le.x - 2} y={s.staffTop + 15} onLine={false} />}</g> : null;
            return (
              <g key={ev.id}>
                {shapes && le.ledgers.map((d) => <line key={d} x1={le.x - 10} x2={le.x + 10} y1={s.yFor(d)} y2={s.yFor(d)} stroke="#000" />)}
                {glyphs && ev.accidental && <text x={le.x - 15} y={le.y + 5} fontSize={15} textAnchor="middle">{ACCIDENTAL_GLYPH[ev.accidental]}</text>}
                {shapes && <NoteShape x={le.x} y={le.y} duration={ev.duration} stemUp={le.stemUp} dotted={ev.dotted} onLine={le.ledgers.includes(le.dia) || (le.y - s.staffTop) % 10 === 0} />}
                {text && ev.lyric && <text className="lyric" x={le.x} y={s.lyricY} fontSize={LAYOUT_FONT.lyric} textAnchor="middle">{ev.lyric}</text>}
              </g>
            );
          })}
        </g>
      ))}
      {shapes && s.ties.map((tie, i) => <TieShape key={`t${i}`} x1={tie.x1} x2={tie.x2} y={tie.y} below={tie.below} />)}
    </svg>
  );
}

interface Props {
  title: string;
  composer: string;
  score: ScoreData;
  labels: ScorePrintLabels;
  meta: ScorePrintMeta;
}

/** Static Score document. One SVG per staff system so pages never cut a system. */
export function ScorePrintView({ title, composer, score, labels, meta }: Props) {
  const layout = layoutScore(score);
  return (
    <div className="score-doc">
      <header className="score-head">
        <h1>{title}</h1>
        {composer && <p className="score-composer">{labels.composer}: {composer}</p>}
        <p className="score-meta">
          {labels.key}: {score.keySignature} · {labels.time}: {score.timeSignature} · {labels.tempo}: {score.tempo} BPM
        </p>
        {meta.style && <p className="score-info">{labels.style}: {meta.style}</p>}
        {meta.tags.length > 0 && <p className="score-info">{labels.tags}: {meta.tags.join(", ")}</p>}
        <p className="score-info">{labels.created}: {meta.created} · {labels.updated}: {meta.updated}</p>
      </header>
      {layout.systems.map((system, i) => (
        <ScoreSystemSvg key={i} system={system} layout={layout} clef={score.clef} />
      ))}
      {score.lyrics.trim() && (
        <section className="score-lyrics">
          <h2>{labels.lyrics}</h2>
          <div className="score-lyrics-text">{score.lyrics}</div>
        </section>
      )}
    </div>
  );
}
