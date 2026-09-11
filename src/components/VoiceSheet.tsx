import { useState, useRef, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { t } from "@/i18n";
import { voiceCategories, voiceOptions, quickVoiceControls } from "@/data/voice";
import { filterVoiceOptions, filterQuickControls } from "@/lib/voice/voiceSearch";
import { buildVoicePrompt } from "@/lib/voice/voicePrompt";
import { getVoiceHint, getOftenUsedInLabel, getQuickControlsLabel } from "@/lib/voice/voiceHints";
import { useVoiceSelection } from "@/hooks/useVoiceSelection";
import type { VoiceCategoryFilter } from "@/types/voiceOption";

interface VoiceSheetProps {
  open: boolean;
  onClose: () => void;
  onInsert: (prompt: string) => void; // receives plain text to merge into Style
}

export function VoiceSheet({ open, onClose, onInsert }: VoiceSheetProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<VoiceCategoryFilter>("All");
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const selection = useVoiceSelection();

  const visibleVoices = filterVoiceOptions(voiceOptions, search, category);
  const visibleQuickControls = category === "All" ? filterQuickControls(quickVoiceControls, search) : [];
  const previewPrompt = buildVoicePrompt(
    selection.selectedOptions,
    null,
    selection.selectedQuickControls,
    ""
  );

  const handleClose = useCallback(() => {
    setSearch("");
    setCategory("All");
    selection.clear();
    onClose();
  }, [onClose, selection]);

  const handleInsert = () => {
    if (!previewPrompt) return;
    onInsert(previewPrompt);
    handleClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <SheetContent side="bottom" className="h-[75vh] rounded-t-2xl px-4 pb-4">
        <SheetHeader className="pb-2">
          <SheetTitle>{t("voice.title")}</SheetTitle>
        </SheetHeader>

        {/* Search */}
        <Input
          placeholder={t("voice.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm mb-3"
        />

        {/* Category Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
          {voiceCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors ${
                category === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Option list */}
        <ScrollArea className="flex-1 h-[calc(75vh-260px)]" ref={scrollAreaRef}>
          <div className="space-y-4 pr-2">
            {visibleQuickControls.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {getQuickControlsLabel()}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {visibleQuickControls.map((q) => {
                    const selected = selection.isQuickSelected(q.id);
                    return (
                      <button
                        key={q.id}
                        onClick={() => selection.toggleQuick(q.id)}
                        aria-pressed={selected}
                        title={getVoiceHint(q.hint)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-secondary text-secondary-foreground hover:bg-accent"
                        }`}
                      >
                        {q.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {visibleVoices.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t("voice.optionsHeader")}</h3>
                <div className="space-y-2">
                  {visibleVoices.map((option) => {
                    const selected = selection.isVoiceSelected(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => selection.toggleVoice(option.id)}
                        aria-pressed={selected}
                        className={`w-full text-left rounded-lg border p-3 transition-colors ${
                          selected ? "border-primary bg-accent" : "border-border bg-background hover:bg-accent"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{option.label}</span>
                          <span className="text-[10px] text-muted-foreground">{option.category}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{getVoiceHint(option.hint)}</p>
                        {option.commonGenres && option.commonGenres.length > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {getOftenUsedInLabel()} {option.commonGenres.join(", ")}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {visibleVoices.length === 0 && visibleQuickControls.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">{t("voice.noResults")}</p>
            )}
          </div>
        </ScrollArea>

        {/* Selected preview + Insert */}
        <div className="pt-2 border-t border-border mt-2">
          <p className="text-xs text-muted-foreground mb-2 truncate" title={previewPrompt}>
            {previewPrompt ? `${t("voice.selected")}: ${previewPrompt}` : t("voice.nothingSelected")}
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selection.clear} disabled={!selection.hasSelection}>{t("voice.clear")}</Button>
            <Button size="sm" className="h-7 text-xs" onClick={handleInsert} disabled={!previewPrompt}>{t("voice.insert")}</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
