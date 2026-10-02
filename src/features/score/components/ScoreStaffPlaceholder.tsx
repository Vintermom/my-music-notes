import type { ScoreClef } from "../types/score.types";
import { scoreT } from "../i18n";

interface Props {
  clef: ScoreClef;
  timeSignature: string;
}

/** Empty staff work area. Future notation editor renders here. */
export function ScoreStaffPlaceholder({ clef, timeSignature }: Props) {
  const [top, bottom] = timeSignature.split("/");
  return (
    <section aria-label={scoreT("score.workspace")} className="rounded-lg border border-border p-4">
      <h2 className="text-sm font-medium text-foreground mb-3">{scoreT("score.workspace")}</h2>
      <svg viewBox="0 0 600 80" className="w-full h-20 text-muted-foreground" role="img" aria-label={scoreT("score.workspaceEmpty")}>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="0" x2="600" y1={20 + i * 10} y2={20 + i * 10} stroke="currentColor" strokeWidth="1" />
        ))}
        <text x="8" y={clef === "treble" ? 58 : 50} fontSize={clef === "treble" ? 52 : 34} fill="currentColor">
          {clef === "treble" ? "𝄞" : "𝄢"}
        </text>
        <text x="52" y="38" fontSize="18" fontWeight="700" fill="currentColor">{top}</text>
        <text x="52" y="58" fontSize="18" fontWeight="700" fill="currentColor">{bottom}</text>
        <line x1="599" x2="599" y1="20" y2="60" stroke="currentColor" strokeWidth="1" />
      </svg>
      <p className="mt-2 text-sm text-muted-foreground text-center">{scoreT("score.workspaceEmpty")}</p>
    </section>
  );
}
