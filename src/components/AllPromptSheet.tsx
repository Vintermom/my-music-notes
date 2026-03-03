import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { allPrompts } from "@/data/allPrompts";
import type { PromptCategory } from "@/types/promptPreset";

interface AllPromptSheetProps {
  open: boolean;
  onClose: () => void;
  onInsert: (prompt: string) => void;
}

export function AllPromptSheet({ open, onClose, onInsert }: AllPromptSheetProps) {
  const [category, setCategory] = useState<PromptCategory>("Viral");
  const [search, setSearch] = useState("");

  const filtered = allPrompts.filter(
    (p) =>
      p.category === category &&
      (search === "" || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleInsert = (prompt: string) => {
    onInsert(prompt);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="h-[75vh] rounded-t-2xl px-4 pb-4">
        <SheetHeader className="pb-2">
          <SheetTitle>All Prompt</SheetTitle>
        </SheetHeader>

        {/* Category tabs */}
        <div className="flex gap-2 mb-3">
          {(["Viral", "Popular"] as PromptCategory[]).map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat)}
              className="h-8 text-xs"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Search */}
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm mb-3"
        />

        {/* Preset list */}
        <ScrollArea className="flex-1 h-[calc(75vh-180px)]">
          <div className="space-y-2 pr-2">
            {filtered.map((preset) => (
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
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No presets found</p>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
