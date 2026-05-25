import { useEffect, useState } from "react";
import { t } from "@/i18n";
import { toast } from "sonner";
import { Music, Mic, Guitar, ArrowLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AudioTake } from "@/domain/types";

interface MusicToolsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  takes?: AudioTake[];
}

type View = "menu" | "detectMelody";

const PLACEHOLDER_RESULT = `[Key: C major]
[Melody: C4 - D4 - E4 - G4 - E4 - D4 - C4]`;

export function MusicToolsSheet({ open, onOpenChange, takes = [] }: MusicToolsSheetProps) {
  const [view, setView] = useState<View>("menu");
  const [selectedTakeId, setSelectedTakeId] = useState<string>("");
  const [result, setResult] = useState<string>("");

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      setView("menu");
      setResult("");
      setSelectedTakeId("");
    }
  }, [open]);

  // Default selection when entering Detect Melody view
  useEffect(() => {
    if (view === "detectMelody" && takes.length > 0 && !selectedTakeId) {
      setSelectedTakeId(takes[0].id);
    }
  }, [view, takes, selectedTakeId]);

  const hasTakes = takes.length > 0;

  const handleRunDetect = () => {
    // Phase 2: placeholder preview only — no real audio analysis.
    setResult(PLACEHOLDER_RESULT);
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      toast.success(t("toast.lyricsCopied"));
    } catch {
      // ignore
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {view === "detectMelody" ? (
              <>
                <button
                  type="button"
                  onClick={() => setView("menu")}
                  className="inline-flex items-center justify-center h-7 w-7 rounded hover:bg-accent"
                  aria-label={t("musicTools.back")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <Mic className="h-4 w-4" />
                {t("musicTools.detectMelody")}
              </>
            ) : (
              <>
                <Music className="h-4 w-4" />
                {t("musicTools.title")}
              </>
            )}
          </SheetTitle>
        </SheetHeader>

        {view === "menu" && (
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => setView("detectMelody")}
              className="w-full text-left rounded-lg border border-border bg-card hover:bg-accent transition-colors p-3 flex items-start gap-3"
            >
              <Mic className="h-5 w-5 mt-0.5 text-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">
                  {t("musicTools.detectMelody")}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {t("musicTools.detectMelodyDesc")}
                </div>
              </div>
            </button>

            <div
              aria-disabled="true"
              className="w-full text-left rounded-lg border border-border bg-muted/30 p-3 flex items-start gap-3 opacity-60 cursor-not-allowed"
            >
              <Guitar className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t("musicTools.detectChords")}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide rounded px-1.5 py-0.5 bg-secondary text-secondary-foreground">
                    {t("musicTools.comingSoon")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "detectMelody" && (
          <div className="mt-4 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("musicTools.detectMelodyLongDesc")}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t("musicTools.selectRecording")}
              </label>
              {hasTakes ? (
                <Select value={selectedTakeId} onValueChange={setSelectedTakeId}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder={t("musicTools.selectRecording")} />
                  </SelectTrigger>
                  <SelectContent>
                    {takes.map((take, index) => (
                      <SelectItem key={take.id} value={take.id}>
                        {t("musicTools.recordingLabel")} {index + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-xs text-muted-foreground rounded-md border border-dashed border-border px-3 py-3 text-center">
                  {t("musicTools.noRecordings")}
                </div>
              )}
            </div>

            <Button
              type="button"
              onClick={handleRunDetect}
              disabled={!hasTakes || !selectedTakeId}
              className="w-full"
            >
              <Mic className="h-4 w-4 mr-2" />
              {t("musicTools.run")}
            </Button>

            {result && (
              <div className="space-y-2">
                <Textarea
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="text-xs font-mono min-h-[96px]"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled
                    title={t("musicTools.insertToLyrics")}
                    className="flex-1"
                  >
                    {t("musicTools.insertToLyrics")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="flex-1"
                  >
                    {t("musicTools.copy")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
