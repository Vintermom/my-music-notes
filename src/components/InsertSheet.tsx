import { t } from "@/i18n";
import { songSections, vocalEffects, quickInstruments } from "@/data/insertSheet";
import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface InsertSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (text: string) => void;
}

export function InsertSheet({ open, onOpenChange, onInsert }: InsertSheetProps) {
  const handleInsert = (text: string) => {
    onInsert(text);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl bottom-sheet">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>{t("insertSheet.title")}</SheetTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100%-60px)] space-y-6 pb-6">
          {/* Song Sections */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {t("insertSheet.sections")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {songSections.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleInsert(item.insertText)}
                  className="chip"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          {/* Vocal Effects */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {t("insertSheet.vocalEffects")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {vocalEffects.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleInsert(item.insertText)}
                  className="chip"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          {/* Quick Instruments */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {t("insertSheet.instruments")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {quickInstruments.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleInsert(item.insertText)}
                  className="chip"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
