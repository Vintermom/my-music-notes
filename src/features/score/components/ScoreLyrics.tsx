import { Button } from "@/components/ui/button";
import { Maximize2, Plus, Upload } from "lucide-react";
import { LyricsEditor } from "@/components/LyricsEditor";
import { t } from "@/i18n";
import { scoreT } from "../i18n";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onAlign: () => void;
  onReplaceAll: () => void;
  onImport: () => void;
  onInsert: () => void;
  onFullscreen?: () => void;
  fullscreen?: boolean;
}

/** Plain editable lyrics. Sections such as [Verse] stay ordinary text. */
export function ScoreLyrics({ value, onChange, onAlign, onReplaceAll, onImport, onInsert, onFullscreen, fullscreen = false }: Props) {
  const actions = (
    <>
      <Button type="button" variant="outline" size="sm" onClick={onImport}><Upload className="h-4 w-4 mr-1.5" />{scoreT("score.importLyrics")}</Button>
      <Button type="button" variant="outline" size="sm" onClick={onInsert}><Plus className="h-4 w-4 mr-1.5" />{t("editor.insertSheet")}</Button>
      <Button type="button" variant="outline" size="sm" onClick={onAlign}>{scoreT("score.alignLyrics")}</Button>
      <Button type="button" variant="ghost" size="sm" onClick={onReplaceAll}>{scoreT("score.replaceAllLyrics")}</Button>
    </>
  );

  if (fullscreen) {
    // Fullscreen: one compact action row, the editor takes the rest of the screen.
    return (
      <section className="flex h-full min-h-0 flex-col gap-2">
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        <LyricsEditor
          value={value}
          onChange={onChange}
          placeholder={scoreT("score.lyricsPlaceholder")}
          className="h-[calc(100dvh-7.5rem)] max-h-none text-base"
        />
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-foreground">{scoreT("score.lyrics")}</h2>
        {onFullscreen && (
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onFullscreen} aria-label={scoreT("score.fullscreenLyrics")}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <LyricsEditor value={value} onChange={onChange} placeholder={scoreT("score.lyricsPlaceholder")} className="min-h-[140px] text-sm" />
      <div className="flex flex-wrap items-center gap-2">
        {actions}
        <span className="text-xs text-muted-foreground">{scoreT("score.alignHint")}</span>
      </div>
    </section>
  );
}
