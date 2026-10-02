import { Button } from "@/components/ui/button";
import { t, type TranslationKey } from "@/i18n";
import type { HomeNoteTypeFilter } from "@/lib/homeNoteType";

interface NoteTypeFilterProps {
  value: HomeNoteTypeFilter;
  onChange: (value: HomeNoteTypeFilter) => void;
}

const filterOptions: { value: HomeNoteTypeFilter; labelKey: TranslationKey }[] = [
  { value: "all", labelKey: "home.filter.all" },
  { value: "lyrics", labelKey: "home.filter.lyrics" },
  { value: "record", labelKey: "home.filter.record" },
  { value: "score", labelKey: "home.filter.score" },
];

export function NoteTypeFilter({ value, onChange }: NoteTypeFilterProps) {
  return (
    <div
      className="grid grid-cols-4 overflow-hidden rounded-lg border border-border bg-secondary"
      role="group"
      aria-label={t("home.filter.label")}
    >
      {filterOptions.map((option) => {
        const selected = value === option.value;

        return (
          <Button
            key={option.value}
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`h-9 min-w-0 rounded-none border-0 px-1 text-xs sm:px-3 sm:text-sm ${
              selected
                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                : "bg-transparent text-secondary-foreground hover:bg-accent"
            }`}
          >
            {t(option.labelKey)}
          </Button>
        );
      })}
    </div>
  );
}
