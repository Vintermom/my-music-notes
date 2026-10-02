import type { ScoreData, ScoreClef, ScoreTimeSignature } from "../types/score.types";
import { SCORE_CLEFS, SCORE_KEYS, SCORE_TEMPO_MAX, SCORE_TEMPO_MIN, SCORE_TIME_SIGNATURES } from "../utils/scoreData";
import { scoreT } from "../i18n";

interface Props {
  score: ScoreData;
  onChange: (patch: Partial<ScoreData>) => void;
}

const fieldClass = "h-9 rounded-md bg-muted px-2 text-sm text-foreground border-none focus:outline-none focus:ring-1 focus:ring-ring";

/** Phase 1 toolbar area: basic score settings only. Notation tools come later. */
export function ScoreToolbar({ score, onChange }: Props) {
  return (
    <section aria-label={scoreT("score.toolbar")} className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap gap-3 items-end">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {scoreT("score.clef")}
          <select className={fieldClass} value={score.clef} onChange={(e) => onChange({ clef: e.target.value as ScoreClef })}>
            {SCORE_CLEFS.map((c) => <option key={c} value={c}>{scoreT(`score.clef.${c}`)}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {scoreT("score.time")}
          <select className={fieldClass} value={score.timeSignature} onChange={(e) => onChange({ timeSignature: e.target.value as ScoreTimeSignature })}>
            {SCORE_TIME_SIGNATURES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {scoreT("score.key")}
          <select className={fieldClass} value={score.keySignature} onChange={(e) => onChange({ keySignature: e.target.value })}>
            {SCORE_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {scoreT("score.tempo")}
          <input
            type="number"
            inputMode="numeric"
            min={SCORE_TEMPO_MIN}
            max={SCORE_TEMPO_MAX}
            className={`${fieldClass} w-24`}
            defaultValue={score.tempo}
            onBlur={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n) && n > 0) onChange({ tempo: n });
              else e.target.value = String(score.tempo);
            }}
          />
        </label>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{scoreT("score.toolbarSoon")}</p>
    </section>
  );
}
