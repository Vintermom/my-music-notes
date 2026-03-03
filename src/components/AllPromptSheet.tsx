import { useState, useRef, useCallback } from "react";
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  const filtered = allPrompts.filter(
    (p) =>
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.meta.toLowerCase().includes(search.toLowerCase())
  );

  const handleInsert = (prompt: string) => {
    onInsert(prompt);
    setExpandedId(null);
    onClose();
  };

  const scrollToCategory = useCallback((cat: PromptCategory) => {
    const el = sectionRefs.current[cat];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) { setExpandedId(null); onClose(); } }}>
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

        {/* Tag Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => scrollToCategory(cat)}
              className="shrink-0 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-accent transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Preset list grouped by category */}
        <ScrollArea className="flex-1 h-[calc(75vh-180px)]" ref={scrollAreaRef}>
          <div className="space-y-4 pr-2">
            {CATEGORIES.map((cat) => {
              const items = filtered.filter((p) => p.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat} ref={(el) => { sectionRefs.current[cat] = el; }}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{cat}</h3>
                  <div className="space-y-2">
                    {items.map((preset) => {
                      const isExpanded = expandedId === preset.id;
                      return (
                        <div
                          key={preset.id}
                          className="w-full rounded-lg border border-border bg-background overflow-hidden transition-colors"
                        >
                          <button
                            onClick={() => toggleExpand(preset.id)}
                            className="w-full text-left p-3 hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-foreground">{preset.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{preset.meta}</p>
                          </button>
                          {isExpanded && (
                            <div className="px-3 pb-3 border-t border-border pt-2">
                              <p className="text-xs text-foreground mb-3 leading-relaxed">{preset.prompt}</p>
                              <div className="flex gap-2 justify-end">
                                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setExpandedId(null)}>Cancel</Button>
                                <Button size="sm" className="h-7 text-xs" onClick={() => handleInsert(preset.prompt)}>Insert</Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
