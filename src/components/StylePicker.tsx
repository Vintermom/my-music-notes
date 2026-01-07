import { useState } from "react";
import { t } from "@/i18n";
import {
  voiceTypes,
  vocalTechniques,
  moods,
  instrumentGroups,
  musicGenreGroups,
} from "@/data/style";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface StylePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedChips: string[];
  onToggleChip: (chipLabel: string) => void;
}

export function StylePicker({
  open,
  onOpenChange,
  selectedChips,
  onToggleChip,
}: StylePickerProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const isChipSelected = (label: string) => selectedChips.includes(label);

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

        <div className="overflow-y-auto h-[calc(100%-60px)] space-y-6 pb-6">
          {/* Voice Types */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {t("stylePicker.voiceType")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {voiceTypes.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onToggleChip(item.label)}
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
                  onClick={() => onToggleChip(item.label)}
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
                  onClick={() => onToggleChip(item.label)}
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
                          onClick={() => onToggleChip(item.label)}
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
                          onClick={() => onToggleChip(item.label)}
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
      </SheetContent>
    </Sheet>
  );
}
