import { useState } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { t } from "@/i18n";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ShareMenu } from "./ShareMenu";
import { shareNoteAsset } from "./shareService";
import { hasShareableAudio } from "./exporters/shareAudioExporter";
import type { ShareKind, ShareNote } from "./shareTypes";

interface ShareButtonProps {
  note: ShareNote;
}

/**
 * Additive Share entry point for the song editor header.
 * Does not touch existing export, print, record or storage behavior.
 */
export function ShareButton({ note }: ShareButtonProps) {
  const [busy, setBusy] = useState(false);
  const hasAudio = hasShareableAudio(note);

  const handleSelect = async (kind: ShareKind) => {
    if (busy) return;
    setBusy(true);
    const pending = toast.loading(t("share.preparing"));
    try {
      const result = await shareNoteAsset(note, kind);
      toast.dismiss(pending);
      if (result.status === "shared") toast.success(t("share.shared"));
      else if (result.status === "downloaded") toast.success(t("share.downloaded"));
      else if (result.status === "saved") toast.success(t("share.savedToFolder"));
      else if (result.status === "failed") {
        toast.error(kind === "audio" && !hasAudio ? t("share.noAudio") : t("share.failed"));
      }
      // "cancelled" is a normal user action — stay silent.
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
        <Button variant="ghost" size="icon" aria-label={t("share.button")}>
          <Share2 className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <ShareMenu hasAudio={hasAudio} busy={busy} onSelect={handleSelect} />
    </DropdownMenu>
  );
}
