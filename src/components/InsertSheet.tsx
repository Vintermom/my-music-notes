import { useState } from "react";
import { t } from "@/i18n";
import { songSections, vocalEffects, quickInstruments } from "@/data/insertSheet";
import { X, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface InsertSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (text: string) => void;
}

export function InsertSheet({ open, onOpenChange, onInsert }: InsertSheetProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedVocalEffect, setSelectedVocalEffect] = useState<string | null>(null);

  const resetSelections = () => {
    setSelectedSection(null);
    setSelectedInstruments([]);
    setSelectedVocalEffect(null);
  };

  const handleClose = () => {
    resetSelections();
    onOpenChange(false);
  };

  const toggleInstrument = (instrument: string) => {
    setSelectedInstruments((prev) =>
      prev.includes(instrument)
        ? prev.filter((i) => i !== instrument)
        : [...prev, instrument]
    );
  };

  const handleInsert = () => {
    if (!selectedSection) return;

    // Build structured format: [Section Instrument, Instrument (VocalEffect)]
    let result = `[${selectedSection}`;
    
    if (selectedInstruments.length > 0) {
      result += " " + selectedInstruments.join(", ");
    }
    
    if (selectedVocalEffect) {
      result += ` (${selectedVocalEffect})`;
    }
    
    result += "]";
    
    onInsert(result);
    resetSelections();
    onOpenChange(false);
  };

  const canInsert = selectedSection !== null;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose(); else onOpenChange(o); }}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl bottom-sheet">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>{t("insertSheet.title")}</SheetTitle>
            <div className="flex items-center gap-2">
              {canInsert && (
                <Button size="sm" onClick={handleInsert} className="gap-1">
                  <Check className="h-4 w-4" />
                  {t("insertSheet.insert")}
                </Button>
              )}
              <button
                onClick={handleClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          {/* Preview of structured insert */}
          {canInsert && (
            <div className="mt-2 p-2 bg-muted rounded-lg text-sm font-mono">
              [{selectedSection}
              {selectedInstruments.length > 0 && ` ${selectedInstruments.join(", ")}`}
              {selectedVocalEffect && ` (${selectedVocalEffect})`}]
            </div>
          )}
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100%-80px)] space-y-6 pb-6">
          {/* Song Sections - Required first pick */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {t("insertSheet.sections")} <span className="text-destructive">*</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {songSections.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedSection(
                    selectedSection === item.label ? null : item.label
                  )}
                  className={`chip ${selectedSection === item.label ? "chip-selected" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          {/* Quick Instruments - Optional, multi-select */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {t("insertSheet.instruments")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {quickInstruments.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleInstrument(item.label)}
                  className={`chip ${selectedInstruments.includes(item.label) ? "chip-selected" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          {/* Vocal Effects - Optional, single select */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {t("insertSheet.vocalEffects")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {vocalEffects.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedVocalEffect(
                    selectedVocalEffect === item.label ? null : item.label
                  )}
                  className={`chip ${selectedVocalEffect === item.label ? "chip-selected" : ""}`}
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
