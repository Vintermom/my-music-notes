import type { ProductionCategory, ProductionPreset } from "../types/productionControl.types";
import { pcT } from "../i18n";

interface ProductionControlSectionProps {
  category: ProductionCategory;
  presets: ProductionPreset[];
  isSelected: (id: string) => boolean;
  onToggle: (id: string) => void;
  children?: React.ReactNode; // optional extra UI for a category (e.g. Tempo BPM control)
}

// Generic, data-driven category renderer. Uses the same option-card visual language as Voice.
export function ProductionControlSection({
  category,
  presets,
  isSelected,
  onToggle,
  children,
}: ProductionControlSectionProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        {pcT(category.labelKey)}
      </h3>
      <div className="space-y-2">
        {presets.map((preset) => {
          const selected = isSelected(preset.id);
          return (
            <button
              key={preset.id}
              onClick={() => onToggle(preset.id)}
              aria-pressed={selected}
              className={`w-full text-left rounded-lg border p-3 transition-colors ${
                selected ? "border-primary bg-accent" : "border-border bg-background hover:bg-accent"
              }`}
            >
              <span className="text-sm font-medium text-foreground">{pcT(preset.labelKey)}</span>
              <p className="text-xs text-muted-foreground mt-1">{pcT(preset.hintKey)}</p>
            </button>
          );
        })}
        {children}
      </div>
    </div>
  );
}
