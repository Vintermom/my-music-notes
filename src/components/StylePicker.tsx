import { useEffect, useState } from "react";
import { t } from "@/i18n";
import {
  voiceTypes,
  vocalTechniques,
  moods,
  instrumentGroups,
  musicGenreGroups,
} from "@/data/style";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface StylePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertChips: (chipLabels: string[]) => void;
}

export function StylePicker({
  open,
  onOpenChange,
  onInsertChips,
}: StylePickerProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  // Temporary local selection — discarded when the sheet closes without Insert.
  const [tempSelected, setTempSelected] = useState<string[]>([]);

  useEffect(() => {
    if (!open) setTempSelected([]);
  }, [open]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleTempChip = (label: string) => {
    setTempSelected((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isChipSelected = (label: string) => tempSelected.includes(label);

  const handleInsert = () => {
    if (tempSelected.length === 0) return;
    onInsertChips(tempSelected);
    onOpenChange(false);
  };

  const preview = tempSelected.join(", ");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl bottom-sheet">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>{t("stylePicker.title")}</SheetTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100%-130px)] space-y-6 pb-6">
          {/* Voice Types */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {t("stylePicker.voiceType")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {voiceTypes.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleTempChip(item.label)}
                  className={`chip ${isChipSelected(item.label) ? "chip-selected" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          {/* Vocal Techniques */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {t("stylePicker.vocalTechniques")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {vocalTechniques.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleTempChip(item.label)}
                  className={`chip ${isChipSelected(item.label) ? "chip-selected" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          {/* Mood */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {t("stylePicker.mood")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {moods.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleTempChip(item.label)}
                  className={`chip ${isChipSelected(item.label) ? "chip-selected" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          {/* Instruments */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {t("stylePicker.instruments")}
            </h3>
            <div className="space-y-3">
              {instrumentGroups.map((group) => (
                <div key={group.id} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleGroup(`inst-${group.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="text-sm font-medium">{group.label}</span>
                    {expandedGroups.includes(`inst-${group.id}`) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {expandedGroups.includes(`inst-${group.id}`) && (
                    <div className="p-3 flex flex-wrap gap-2">
                      {group.instruments.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleTempChip(item.label)}
                          className={`chip ${isChipSelected(item.label) ? "chip-selected" : ""}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Music Genres */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {t("stylePicker.musicGenres")}
            </h3>
            <div className="space-y-3">
              {musicGenreGroups.map((group) => (
                <div key={group.id} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleGroup(`genre-${group.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="text-sm font-medium">{group.label}</span>
                    {expandedGroups.includes(`genre-${group.id}`) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {expandedGroups.includes(`genre-${group.id}`) && (
                    <div className="p-3 flex flex-wrap gap-2">
                      {group.genres.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleTempChip(item.label)}
                          className={`chip ${isChipSelected(item.label) ? "chip-selected" : ""}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Selected preview + actions (same pattern as Voice) */}
        <div className="pt-2 border-t border-border mt-2">
          <p className="text-xs text-muted-foreground mb-2 truncate" title={preview}>
            {preview ? `${t("voice.selected")}: ${preview}` : t("voice.nothingSelected")}
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setTempSelected([])} disabled={tempSelected.length === 0}>{t("voice.clear")}</Button>
            <Button size="sm" className="h-7 text-xs" onClick={handleInsert} disabled={tempSelected.length === 0}>{t("voice.insert")}</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
