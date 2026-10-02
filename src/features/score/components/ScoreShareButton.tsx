import { useState } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { t } from "@/i18n";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Note } from "@/domain/types";
import { ShareMenu } from "@/features/share/ShareMenu";
import { hasShareableAudio } from "@/features/share/exporters/shareAudioExporter";
import type { ShareKind } from "@/features/share/shareTypes";

/** Same Share icon + menu as other notes; the PDF is the Score document layout. */
export function ScoreShareButton({ note, beforeShare }: { note: Note; beforeShare?: () => Note | null | undefined }) {
  const [busy, setBusy] = useState(false);
  const hasAudio = hasShareableAudio(note);

  const handleSelect = async (kind: ShareKind) => {
    if (busy) return;
    setBusy(true);
    const pending = toast.loading(t("share.preparing"));
    try {
      const current = beforeShare?.() || note;
      const { shareScoreAsset } = await import("../print/scoreShareService");
      const result = await shareScoreAsset(current, kind);
      toast.dismiss(pending);
      if (result.status === "shared") toast.success(t("share.shared"));
      else if (result.status === "downloaded") toast.success(t("share.downloaded"));
      else if (result.status === "saved") toast.success(t("share.savedToFolder"));
      else if (result.status === "failed") toast.error(kind === "audio" && !hasAudio ? t("share.noAudio") : t("share.failed"));
    } catch {
      toast.dismiss(pending);
      toast.error(t("share.failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("share.button")}><Share2 className="h-5 w-5" /></Button>
      </DropdownMenuTrigger>
      <ShareMenu hasAudio={hasAudio} busy={busy} onSelect={handleSelect} />
    </DropdownMenu>
  );
}
