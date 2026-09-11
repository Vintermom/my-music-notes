import { useCallback, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { t, getCurrentLang } from "@/i18n";
import {
  environmentOptions,
  OUTDOOR_CAFE_ID,
  outdoorCafeInstruments,
  buildOutdoorCafeAccompaniment,
  getOutdoorCafeInstrumentsLabel,
} from "@/data/voice";
import { getVoiceHint } from "@/lib/voice/voiceHints";
import { buildVoicePrompt } from "@/lib/voice/voicePrompt";

interface EnvironmentSheetProps {
  open: boolean;
  onClose: () => void;
  onInsert: (prompt: string) => void; // receives plain text to merge into Style
}

// Environment control — single selection only. Uses the same visual language as Voice.
export function EnvironmentSheet({ open, onClose, onInsert }: EnvironmentSheetProps) {
  const [environmentId, setEnvironmentId] = useState<string | null>(null);
  const [cafeInstrumentIds, setCafeInstrumentIds] = useState<string[]>([]);

  const selectedEnvironment = environmentOptions.find((e) => e.id === environmentId) ?? null;
  const isOutdoorCafe = environmentId === OUTDOOR_CAFE_ID;
  const accompaniment = isOutdoorCafe ? buildOutdoorCafeAccompaniment(cafeInstrumentIds) : "";
  const previewPrompt = buildVoicePrompt([], selectedEnvironment, [], accompaniment);

  const clear = useCallback(() => {
    setEnvironmentId(null);
    setCafeInstrumentIds([]);
  }, []);

  const handleClose = useCallback(() => {
    clear();
    onClose();
  }, [clear, onClose]);

  const selectEnvironment = (id: string) => {
    setEnvironmentId((prev) => (prev === id ? null : id));
    setCafeInstrumentIds([]);
  };

  const toggleCafeInstrument = (id: string) => {
    setCafeInstrumentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleInsert = () => {
    if (!previewPrompt) return;
    onInsert(previewPrompt);
    handleClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <SheetContent side="bottom" className="h-[75vh] rounded-t-2xl px-4 pb-4">
        <SheetHeader className="pb-2">
          <SheetTitle>{t("environment.title")}</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(75vh-180px)]">
          <div className="space-y-2 pr-2">
            {environmentOptions.map((env) => {
              const selected = environmentId === env.id;
              return (
                <div key={env.id} className="space-y-2">
                  <button
                    onClick={() => selectEnvironment(env.id)}
                    aria-pressed={selected}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      selected ? "border-primary bg-accent" : "border-border bg-background hover:bg-accent"
                    }`}
                  >
                    <span className="text-sm font-medium text-foreground">{env.label}</span>
                    <p className="text-xs text-muted-foreground mt-1">{getVoiceHint(env.hint)}</p>
                  </button>

                  {env.id === OUTDOOR_CAFE_ID && selected && (
                    <div className="rounded-lg border border-border bg-background p-3">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        {getOutdoorCafeInstrumentsLabel(getCurrentLang())}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {outdoorCafeInstruments.map((inst) => {
                          const instSelected = cafeInstrumentIds.includes(inst.id);
                          return (
                            <button
                              key={inst.id}
                              onClick={() => toggleCafeInstrument(inst.id)}
                              aria-pressed={instSelected}
                              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                instSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-secondary text-secondary-foreground hover:bg-accent"
                              }`}
                            >
                              {inst.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Selected preview + Insert */}
        <div className="pt-2 border-t border-border mt-2">
          <p className="text-xs text-muted-foreground mb-2 truncate" title={previewPrompt}>
            {previewPrompt ? `${t("voice.selected")}: ${previewPrompt}` : t("environment.nothingSelected")}
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clear} disabled={!environmentId}>{t("voice.clear")}</Button>
            <Button size="sm" className="h-7 text-xs" onClick={handleInsert} disabled={!previewPrompt}>{t("voice.insert")}</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
