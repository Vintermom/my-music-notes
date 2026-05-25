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
import { detectMelody } from "@/lib/melodyDetection";

interface MusicToolsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  takes?: AudioTake[];
  onInsert?: (text: string) => void;
}

type View = "menu" | "detectMelody";

const NOTE_LINE_LIMIT = 16; // wrap melody into readable line

export function MusicToolsSheet({ open, onOpenChange, takes = [], onInsert }: MusicToolsSheetProps) {
  const [view, setView] = useState<View>("menu");
  const [selectedTakeId, setSelectedTakeId] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      setView("menu");
      setResult("");
      setSelectedTakeId("");
      setAnalyzing(false);
    }
  }, [open]);

  // Default selection when entering Detect Melody view
  useEffect(() => {
    if (view === "detectMelody" && takes.length > 0 && !selectedTakeId) {
      setSelectedTakeId(takes[0].id);
    }
  }, [view, takes, selectedTakeId]);

  const hasTakes = takes.length > 0;
  const selectedTake = takes.find((t) => t.id === selectedTakeId);

  const formatResult = (notes: string[], key: string | null): string => {
    const keyLine = `[Key: ${key ?? t("musicTools.keyUnknown")}]`;
    if (notes.length === 0) return t("musicTools.noMelody");
    // Wrap long melodies for readability
    const lines: string[] = [];
    for (let i = 0; i < notes.length; i += NOTE_LINE_LIMIT) {
      lines.push(notes.slice(i, i + NOTE_LINE_LIMIT).join(" - "));
    }
    return `${keyLine}\n[Melody: ${lines.join("\n         ")}]`;
  };

  const handleRunDetect = async () => {
    if (!selectedTake?.blob) return;
    setAnalyzing(true);
    setResult("");
    try {
      const { notes, key } = await detectMelody(selectedTake.blob);
      if (notes.length === 0) {
        setResult(t("musicTools.noMelody"));
      } else {
        setResult(formatResult(notes, key));
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error("[MusicTools] detectMelody failed", err);
      setResult(t("musicTools.analysisError"));
    } finally {
      setAnalyzing(false);
    }
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

  // Insert to Lyrics intentionally disabled (reverted pending fix)
  const handleInsertToLyrics = () => {
    // no-op
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
              disabled={!hasTakes || !selectedTakeId || analyzing}
              className="w-full"
            >
              <Mic className="h-4 w-4 mr-2" />
              {analyzing ? t("musicTools.analyzing") : t("musicTools.run")}
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
                    disabled={!result}
                    onClick={handleInsertToLyrics}
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
