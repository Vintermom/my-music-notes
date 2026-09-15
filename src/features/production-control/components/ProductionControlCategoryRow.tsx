import type { ProductionCategoryFilter } from "../types/productionControl.types";
import { productionCategories } from "../data/productionControlOptions";
import { pcT } from "../i18n";

interface ProductionControlCategoryRowProps {
  value: ProductionCategoryFilter;
  onChange: (value: ProductionCategoryFilter) => void;
}

// Category shortcut row — same chip pattern as the Voice category row:
// horizontally scrollable, shrink-0 pills, primary active state.
// The chips are rendered from productionCategories (data/config), never hardcoded.
export function ProductionControlCategoryRow({ value, onChange }: ProductionControlCategoryRowProps) {
  const chips: { id: ProductionCategoryFilter; labelKey: string }[] = [
    { id: "all", labelKey: "pc.category.all" },
    ...productionCategories.map((c) => ({ id: c.id as ProductionCategoryFilter, labelKey: c.labelKey })),
  ];

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
      {chips.map((chip) => (
        <button
          key={chip.id}
          onClick={() => onChange(chip.id)}
          aria-pressed={value === chip.id}
          className={`shrink-0 rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors ${
            value === chip.id
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
        >
          {pcT(chip.labelKey)}
        </button>
      ))}
    </div>
  );
}
