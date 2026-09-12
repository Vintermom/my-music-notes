import { exportNoteAsJson } from "@/storage/notesRepo";
import type { ShareNote, PreparedFile } from "../shareTypes";
import { safeBaseName, withExtension } from "../utils/fileName";

/**
 * Reuses the existing JSON export serializer AS-IS (read-only call).
 * The existing Export JSON menu item and data structure are untouched.
 */
export function prepareShareJson(note: ShareNote): PreparedFile {
  const json = exportNoteAsJson(note);
  const blob = new Blob([json], { type: "application/json" });
  const fileName = withExtension(safeBaseName(note.title), "json");
  return {
    blob,
    fileName,
    file: new File([blob], fileName, { type: "application/json" }),
  };
}
