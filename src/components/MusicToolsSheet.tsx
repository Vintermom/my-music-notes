import { t } from "@/i18n";
import { Music, Mic, Guitar } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface MusicToolsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MusicToolsSheet({ open, onOpenChange }: MusicToolsSheetProps) {
  const handleDetectMelody = () => {
    // Placeholder for Phase 1 — no audio analysis yet
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            {t("musicTools.title")}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-2">
          {/* Detect Melody */}
          <button
            type="button"
            onClick={handleDetectMelody}
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

          {/* Detect Chords - Coming Soon */}
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
      </SheetContent>
    </Sheet>
  );
}
