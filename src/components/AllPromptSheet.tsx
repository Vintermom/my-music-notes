import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { allPrompts } from "@/data/allPrompts";
import type { PromptCategory } from "@/types/promptPreset";

const CATEGORIES: PromptCategory[] = [
  "Pop", "Emotional", "Dance / EDM", "Chill / Indie",
  "Rock / Metal", "R&B", "Hip-Hop / Rap", "Folk",
];

interface AllPromptSheetProps {
  open: boolean;
  onClose: () => void;
  onInsert: (prompt: string) => void;
}

export function AllPromptSheet({ open, onClose, onInsert }: AllPromptSheetProps) {
  const [search, setSearch] = useState("");

  const filtered = allPrompts.filter(
    (p) =>
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.meta.toLowerCase().includes(search.toLowerCase())
  );

  const handleInsert = (prompt: string) => {
    onInsert(prompt);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="h-[75vh] rounded-t-2xl px-4 pb-4">
        <SheetHeader className="pb-2">
          <SheetTitle>Presets</SheetTitle>
        </SheetHeader>

        {/* Search */}
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm mb-3"
        />

        {/* Preset list grouped by category */}
        <ScrollArea className="flex-1 h-[calc(75vh-140px)]">
          <div className="space-y-4 pr-2">
            {CATEGORIES.map((cat) => {
              const items = filtered.filter((p) => p.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{cat}</h3>
                  <div className="space-y-2">
                    {items.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleInsert(preset.prompt)}
                        className="w-full text-left rounded-lg border border-border bg-background p-3 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{preset.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{preset.meta}</p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No presets found</p>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
