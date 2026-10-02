import type { ScoreAccidental, ScoreDuration } from "../types/score.types";
import { DURATIONS } from "../utils/notation";
import { ACCIDENTAL_GLYPH, DurationIcon } from "./NotationGlyphs";
import type { EntryMode } from "./ScoreEditor";
import { scoreT } from "../i18n";
import { cn } from "@/lib/utils";

interface Props {
  mode: EntryMode;
  duration: ScoreDuration;
  accidental: ScoreAccidental | null;
  onMode: (m: EntryMode) => void;
  onDuration: (d: ScoreDuration) => void;
  onAccidental: (a: ScoreAccidental | null) => void;
}

const chip = "h-10 min-w-10 px-2 rounded-md text-sm flex items-center justify-center transition-colors";
const on = "bg-primary text-primary-foreground";
const off = "bg-muted text-foreground hover:bg-muted/70";

/** Compact note/rest/chord entry toolbar. */
export function ScoreEntryToolbar({ mode, duration, accidental, onMode, onDuration, onAccidental }: Props) {
  const modes: EntryMode[] = ["note", "rest", "chord"];
  return (
    <section aria-label={scoreT("score.toolbar")} className="rounded-lg border border-border p-2 space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {modes.map((m) => (
          <button key={m} type="button" aria-pressed={mode === m} onClick={() => onMode(m)} className={cn(chip, "px-3", mode === m ? on : off)}>
            {scoreT(`score.mode.${m}`)}
          </button>
        ))}
        {mode !== "chord" && (
          <>
            <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
            {DURATIONS.map((d) => (
              <button
                key={d} type="button" aria-pressed={duration === d} onClick={() => onDuration(d)}
                aria-label={scoreT(`score.dur.${d}`)} title={scoreT(`score.dur.${d}`)}
                className={cn(chip, duration === d ? on : off)}
              >
                <DurationIcon duration={d} rest={mode === "rest"} />
              </button>
            ))}
          </>
        )}
        {mode === "note" && (
          <>
            <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
            {(["natural", "sharp", "flat"] as ScoreAccidental[]).map((a) => (
              <button
                key={a} type="button" aria-pressed={accidental === a}
                onClick={() => onAccidental(accidental === a ? null : a)}
                aria-label={scoreT(`score.acc.${a}`)} title={scoreT(`score.acc.${a}`)}
                className={cn(chip, "text-lg", accidental === a ? on : off)}
              >
                {ACCIDENTAL_GLYPH[a]}
              </button>
            ))}
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground px-1">
        {mode === "chord" ? scoreT("score.chordHint") : scoreT("score.entryHint")}
      </p>
    </section>
  );
}
