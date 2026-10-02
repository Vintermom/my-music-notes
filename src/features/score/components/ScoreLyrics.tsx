import { Button } from "@/components/ui/button";
import { Maximize2, Upload } from "lucide-react";
import { LyricsEditor } from "@/components/LyricsEditor";
import { scoreT } from "../i18n";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onAlign: () => void;
  onReplaceAll: () => void;
  onImport: () => void;
  onFullscreen?: () => void;
  fullscreen?: boolean;
}

/** Plain editable lyrics. Sections such as [Verse] stay ordinary text. */
export function ScoreLyrics({ value, onChange, onAlign, onReplaceAll, onImport, onFullscreen, fullscreen = false }: Props) {
  return (
    <section className={fullscreen ? "flex h-full min-h-0 flex-col gap-2" : "rounded-lg border border-border p-3 space-y-2"}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-foreground">{scoreT("score.lyrics")}</h2>
        {!fullscreen && onFullscreen && (
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onFullscreen} aria-label={scoreT("score.fullscreenLyrics")}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <LyricsEditor
        value={value}
        onChange={onChange}
        placeholder={scoreT("score.lyricsPlaceholder")}
        className={fullscreen ? "flex-1 min-h-0" : "min-h-[140px] text-sm"}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onImport}><Upload className="h-4 w-4 mr-1.5" />{scoreT("score.importLyrics")}</Button>
        <Button type="button" variant="outline" size="sm" onClick={onAlign}>{scoreT("score.alignLyrics")}</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onReplaceAll}>{scoreT("score.replaceAllLyrics")}</Button>
        <span className="text-xs text-muted-foreground">{scoreT("score.alignHint")}</span>
      </div>
    </section>
  );
}
