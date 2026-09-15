import { useCallback, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { productionCategories, productionPresets } from "../data/productionControlOptions";
import { buildProductionPrompt } from "../utils/insertProductionPrompt";
import { formatBpmPrompt, parseBpm } from "../utils/bpmFormatter";
import { matchesProductionQuery } from "../utils/productionControlSearch";
import { pcT } from "../i18n";
import { ProductionControlSection } from "./ProductionControlSection";
import { ProductionControlCategoryRow } from "./ProductionControlCategoryRow";
import { TempoControl } from "./TempoControl";
import type { ProductionCategoryFilter } from "../types/productionControl.types";

interface ProductionControlPanelProps {
  open: boolean;
  onClose: () => void;
  onInsert: (prompt: string) => void; // plain text merged into the existing Style field
}

// Multi-select Production Control panel. Same interaction pattern as Voice / Environment:
// select options → preview → Insert to Style. Selector state is never synced back from Style.
// Category + search filtering only changes what is visible — it never clears selections.
export function ProductionControlPanel({ open, onClose, onInsert }: ProductionControlPanelProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bpm, setBpm] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductionCategoryFilter>("all");

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const clear = useCallback(() => {
    setSelectedIds([]);
    setBpm("");
  }, []);

  const handleClose = useCallback(() => {
    clear();
    setSearch("");
    setCategory("all");
    onClose();
  }, [clear, onClose]);

  const selectedPresets = selectedIds
    .map((id) => productionPresets.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const parsedBpm = parseBpm(bpm);
  const previewPrompt = buildProductionPrompt(
    selectedPresets,
    parsedBpm !== null ? formatBpmPrompt(parsedBpm) : ""
  );

  const handleInsert = () => {
    if (!previewPrompt) return;
    onInsert(previewPrompt);
    handleClose();
  };

  const visibleCategories = productionCategories.filter((c) => category === "all" || c.id === category);

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <SheetContent side="bottom" className="h-[75vh] rounded-t-2xl px-4 pb-4">
        <SheetHeader className="pb-2">
          <SheetTitle>{pcT("pc.title")}</SheetTitle>
        </SheetHeader>

        {/* Search — same behavior as Voice: filters visibility only */}
        <Input
          placeholder={pcT("pc.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm mb-3"
        />

        {/* Category shortcuts — same chip row as Voice */}
        <ProductionControlCategoryRow value={category} onChange={setCategory} />

        <ScrollArea className="flex-1 h-[calc(75vh-260px)]">
          <div className="space-y-4 pr-2">
            {visibleCategories.map((cat) => {
              const visiblePresets = productionPresets.filter(
                (p) => p.category === cat.id && matchesProductionQuery(p, search)
              );
              const showTempoControl = cat.kind === "tempo" && search.trim() === "";
              if (visiblePresets.length === 0 && !showTempoControl) return null;
              return (
                <ProductionControlSection
                  key={cat.id}
                  category={cat}
                  presets={visiblePresets}
                  isSelected={(id) => selectedIds.includes(id)}
                  onToggle={toggle}
                >
                  {showTempoControl && <TempoControl value={bpm} onChange={setBpm} />}
                </ProductionControlSection>
              );
            })}
            {visibleCategories.every(
              (cat) =>
                productionPresets.filter((p) => p.category === cat.id && matchesProductionQuery(p, search)).length === 0 &&
                !(cat.kind === "tempo" && search.trim() === "")
            ) && (
              <p className="text-sm text-muted-foreground text-center py-8">{pcT("pc.noResults")}</p>
            )}
          </div>
        </ScrollArea>

        {/* Selected preview + Insert */}
        <div className="pt-2 border-t border-border mt-2">
          <p className="text-xs text-muted-foreground mb-2 truncate" title={previewPrompt}>
            {previewPrompt ? `${pcT("pc.selected")}: ${previewPrompt}` : pcT("pc.nothingSelected")}
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clear} disabled={selectedIds.length === 0 && bpm === ""}>{pcT("pc.clear")}</Button>
            <Button size="sm" className="h-7 text-xs" onClick={handleInsert} disabled={!previewPrompt}>{pcT("pc.insert")}</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
