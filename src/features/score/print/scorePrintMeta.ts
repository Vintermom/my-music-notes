import type { Note } from "@/domain/types";
import { t } from "@/i18n";
import { formatDateISO } from "@/lib/dateFormat";
import { scoreT } from "../i18n";
import type { ScorePrintLabels, ScorePrintMeta } from "./ScorePrintView";

/** One source of labels and metadata for Score Print, Save as PDF and Share PDF. */
export function scorePrintLabels(): ScorePrintLabels {
  return {
    composer: scoreT("score.print.composer"),
    key: scoreT("score.key"),
    time: scoreT("score.time"),
    tempo: scoreT("score.print.tempo"),
    style: t("editor.style"),
    tags: scoreT("score.print.tags"),
    created: t("timestamp.created"),
    updated: t("timestamp.lastEdited"),
    lyrics: scoreT("score.lyrics"),
  };
}

export function scorePrintMeta(note: Note): ScorePrintMeta {
  return {
    style: (note.style || "").trim(),
    tags: note.tags || [],
    created: formatDateISO(note.createdAt),
    updated: formatDateISO(note.updatedAt),
  };
}
