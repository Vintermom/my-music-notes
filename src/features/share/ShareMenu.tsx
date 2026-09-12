import { FileText, Music, Package } from "lucide-react";
import { t } from "@/i18n";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { ShareKind } from "./shareTypes";

interface ShareMenuProps {
  hasAudio: boolean;
  busy: boolean;
  onSelect: (kind: ShareKind) => void;
}

export function ShareMenu({ hasAudio, busy, onSelect }: ShareMenuProps) {
  return (
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>{t("share.title")}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem disabled={busy} onClick={() => onSelect("pdf")}>
        <FileText className="h-4 w-4 mr-2" />
        {t("share.pdf")}
      </DropdownMenuItem>
      {hasAudio && (
        <DropdownMenuItem disabled={busy} onClick={() => onSelect("audio")}>
          <Music className="h-4 w-4 mr-2" />
          {t("share.audio")}
        </DropdownMenuItem>
      )}
      <DropdownMenuItem disabled={busy} onClick={() => onSelect("allFiles")}>
        <Package className="h-4 w-4 mr-2" />
        {t("share.allFiles")}
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
