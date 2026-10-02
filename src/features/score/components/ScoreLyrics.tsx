import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { scoreT } from "../i18n";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onAlign: () => void;
}

/** Plain editable lyrics. Sections such as [Verse] stay ordinary text. */
export function ScoreLyrics({ value, onChange, onAlign }: Props) {
  return (
    <section className="rounded-lg border border-border p-3 space-y-2">
      <h2 className="text-sm font-medium text-foreground">{scoreT("score.lyrics")}</h2>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={scoreT("score.lyricsPlaceholder")}
        aria-label={scoreT("score.lyrics")}
        className="min-h-[140px] text-sm"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onAlign}>{scoreT("score.alignLyrics")}</Button>
        <span className="text-xs text-muted-foreground">{scoreT("score.alignHint")}</span>
      </div>
    </section>
  );
}
