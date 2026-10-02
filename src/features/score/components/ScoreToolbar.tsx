import type { ScoreData, ScoreClef, ScoreTimeSignature } from "../types/score.types";
import { useEffect, useState } from "react";
import { SCORE_CLEFS, SCORE_KEYS, SCORE_TEMPO_MAX, SCORE_TEMPO_MIN, SCORE_TIME_SIGNATURES, isValidTimeSignature } from "../utils/scoreData";
import { scoreT } from "../i18n";

interface Props {
  score: ScoreData;
  onChange: (patch: Partial<ScoreData>) => void;
}

const fieldClass = "h-9 rounded-md bg-muted px-2 text-sm text-foreground border-none focus:outline-none focus:ring-1 focus:ring-ring";

/** Phase 1 toolbar area: basic score settings only. Notation tools come later. */
export function ScoreToolbar({ score, onChange }: Props) {
  const isPreset = SCORE_TIME_SIGNATURES.includes(score.timeSignature);
  const [custom, setCustom] = useState(!isPreset);
  const [numerator, denominator] = score.timeSignature.split("/");
  useEffect(() => setCustom(!SCORE_TIME_SIGNATURES.includes(score.timeSignature)), [score.timeSignature]);

  const setCustomPart = (nextNumerator: string, nextDenominator: string) => {
    const next = `${nextNumerator}/${nextDenominator}`;
    if (isValidTimeSignature(next)) onChange({ timeSignature: next });
  };

  return (
    <section aria-label={scoreT("score.settings")} className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap gap-3 items-end">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {scoreT("score.clef")}
          <select className={fieldClass} value={score.clef} onChange={(e) => onChange({ clef: e.target.value as ScoreClef })}>
            {SCORE_CLEFS.map((c) => <option key={c} value={c}>{scoreT(`score.clef.${c}`)}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {scoreT("score.time")}
          <select
            className={fieldClass}
            value={custom ? "custom" : score.timeSignature}
            onChange={(e) => {
              if (e.target.value === "custom") setCustom(true);
              else { setCustom(false); onChange({ timeSignature: e.target.value as ScoreTimeSignature }); }
            }}
          >
            {SCORE_TIME_SIGNATURES.map((s) => <option key={s} value={s}>{s}</option>)}
            <option value="custom">{scoreT("score.time.custom")}</option>
          </select>
        </label>
        {custom && (
          <div className="flex items-end gap-1" aria-label={scoreT("score.time.custom")}>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              {scoreT("score.time.numerator")}
              <input type="number" inputMode="numeric" min={1} max={32} value={numerator} onChange={(e) => setCustomPart(e.target.value, denominator)} className={`${fieldClass} w-16`} />
            </label>
            <span className="h-9 py-2 text-foreground">/</span>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              {scoreT("score.time.denominator")}
              <select value={denominator} onChange={(e) => setCustomPart(numerator, e.target.value)} className={`${fieldClass} w-16`}>
                {[1, 2, 4, 8, 16].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          </div>
        )}
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
            key={score.tempo}
            defaultValue={score.tempo}
            onBlur={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n) && n > 0) onChange({ tempo: n });
              else e.target.value = String(score.tempo);
            }}
          />
        </label>
      </div>
    </section>
  );
}
