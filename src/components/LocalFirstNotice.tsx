import { useState, useEffect } from "react";
import { currentLang } from "@/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const NOTICE_DISMISSED_KEY = "mymusicnotes_localfirst_notice_dismissed";
const FIRST_SAVE_KEY = "mymusicnotes_first_save_done";

// Check if this is a first save scenario and notice should show
export function shouldShowFirstSaveNotice(): boolean {
  try {
    const dismissed = localStorage.getItem(NOTICE_DISMISSED_KEY);
    const firstSaveDone = localStorage.getItem(FIRST_SAVE_KEY);
    // Show if: first save just happened AND notice not dismissed
    return firstSaveDone === "true" && dismissed !== "true";
  } catch {
    return false;
  }
}

// Mark that first save has occurred
export function markFirstSave(): void {
  try {
    const alreadyDone = localStorage.getItem(FIRST_SAVE_KEY);
    if (!alreadyDone) {
      localStorage.setItem(FIRST_SAVE_KEY, "true");
    }
  } catch {
    // Ignore
  }
}

// Check if first save has already been done before
export function hasFirstSaveOccurred(): boolean {
  try {
    return localStorage.getItem(FIRST_SAVE_KEY) === "true";
  } catch {
    return false;
  }
}

// Translations for the notice (EN, TH, SV only)
const noticeTranslations = {
  en: {
    title: "Welcome",
    line1: "Your notes are stored locally on your device (local-first). We don't upload your content to the cloud.",
    line2: "For best safety, export a backup regularly: JSON for restoring/editing, PDF for printing.",
    dontShowAgain: "Don't show again",
    ok: "OK",
  },
  th: {
    title: "ยินดีต้อนรับ",
    line1: "ข้อมูลของคุณถูกบันทึกไว้ในอุปกรณ์นี้ (Local-first) และไม่ได้อัปโหลดขึ้นคลาวด์",
    line2: "เพื่อความปลอดภัย แนะนำให้สำรองข้อมูลเป็นประจำ:\nExport JSON สำหรับกู้คืน/แก้ไข และ Export PDF สำหรับพิมพ์",
    dontShowAgain: "ไม่ต้องแสดงอีก",
    ok: "ตกลง",
  },
  sv: {
    title: "Välkommen",
    line1: "Dina anteckningar sparas lokalt på din enhet (local-first). Vi laddar inte upp ditt innehåll till molnet.",
    line2: "För bästa säkerhet rekommenderar vi att du regelbundet exporterar en säkerhetskopia:\nJSON för återställning/redigering och PDF för utskrift.",
    dontShowAgain: "Visa inte igen",
    ok: "OK",
  },
};

type SupportedNoticeLang = keyof typeof noticeTranslations;

function getNoticeLang(): SupportedNoticeLang {
  if (currentLang === "th" || currentLang === "sv") {
    return currentLang;
  }
  return "en";
}

interface LocalFirstNoticeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocalFirstNotice({ open, onOpenChange }: LocalFirstNoticeProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem(NOTICE_DISMISSED_KEY, "true");
      } catch {
        // Ignore storage errors
      }
    }
    onOpenChange(false);
  };

  const lang = getNoticeLang();
  const texts = noticeTranslations[lang];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{texts.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-foreground">{texts.line1}</p>
          <p className="text-sm text-foreground whitespace-pre-line">{texts.line2}</p>
        </div>

        <div className="flex items-center space-x-2 pb-4">
          <Checkbox
            id="dontShowAgain"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(checked === true)}
          />
          <label
            htmlFor="dontShowAgain"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            {texts.dontShowAgain}
          </label>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleClose}>{texts.ok}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
