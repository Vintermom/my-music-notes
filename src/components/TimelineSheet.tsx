import { TimelineEntry } from "@/domain/types";
import { t } from "@/i18n";
import { Clock, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface TimelineSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createdAt: number;
  timeline: TimelineEntry[];
}

function formatDate(timestamp: number): string {
  // ISO 8601 format: YYYY-MM-DD HH:mm (no timezone in UI)
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${mins}`;
}

export function TimelineSheet({
  open,
  onOpenChange,
  createdAt,
  timeline,
}: TimelineSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[50vh] rounded-t-2xl bottom-sheet">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>{t("timeline.title")}</SheetTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100%-60px)] pb-6">
          <div className="space-y-4">
            {/* Created entry */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("timeline.created")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(createdAt)}
                </p>
              </div>
            </div>

            {/* Update entries */}
            {timeline
              .filter((entry) => entry.action === "updated")
              .slice(-20)
              .reverse()
              .map((entry, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t("timeline.updated")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(entry.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

            {timeline.filter((e) => e.action === "updated").length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("timeline.noChanges")}
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
