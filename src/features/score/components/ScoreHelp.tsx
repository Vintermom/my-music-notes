import { scoreT } from "../i18n";

const HINTS = ["score", "note", "rest", "chord", "lyrics", "clef", "play", "linked", "print"] as const;

/** Lightweight, collapsible hint list (same muted hint style as elsewhere in the app). */
export function ScoreHelp() {
  return (
    <section className="rounded-lg border border-border bg-muted/40 p-3">
      <dl className="grid gap-2 sm:grid-cols-2">
        {HINTS.map((h) => (
          <div key={h}>
            <dt className="text-sm font-medium text-foreground">{scoreT(`score.hint.${h}.title`)}</dt>
            <dd className="text-xs text-muted-foreground mt-0.5">{scoreT(`score.hint.${h}`)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
