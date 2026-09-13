import type { PreparedFile, ShareResult, ShareNote, ShareKind } from "./shareTypes";
import { canShareFiles, isShareCancellation } from "./utils/shareSupport";
import { prepareSharePdf } from "./exporters/sharePdfExporter";
import { prepareActiveShareAudio } from "./exporters/shareAudioExporter";
import { safeBaseName } from "./utils/fileName";
import { pickParentFolder, writeFilesToFolder } from "./utils/folderSave";
import { isValidSharePdf, isValidShareAudio, areValidShareFiles } from "./utils/shareValidation";

/**
 * Downloads a prepared file. The object URL is revoked only after the download
 * has been handed to the browser, never while the data is still in use.
 */
function downloadPrepared(prepared: PreparedFile): void {
  const url = URL.createObjectURL(prepared.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = prepared.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/**
 * Hands fully-built File objects to the native Share Sheet. Files are already
 * complete and validated by the caller; nothing is released until
 * navigator.share() has resolved, rejected or been cancelled.
 */
async function shareOrDownloadMany(prepared: PreparedFile[], title: string): Promise<ShareResult> {
  const files = prepared.map((p) => p.file);

  if (canShareFiles(files)) {
    try {
      await navigator.share({ files, title });
      return { status: "shared" };
    } catch (error) {
      if (isShareCancellation(error)) return { status: "cancelled" };
      // Fall through to download fallback.
    }
  }

  try {
    prepared.forEach(downloadPrepared);
    return { status: "downloaded" };
  } catch {
    return { status: "failed" };
  }
}

/** PDF plus the current recording when one exists. No JSON, no ZIP. */
async function prepareSongFiles(note: ShareNote): Promise<PreparedFile[]> {
  const pdf = await prepareSharePdf(note);
  if (!isValidSharePdf(pdf)) return [];

  const prepared: PreparedFile[] = [pdf];
  const audio = await prepareActiveShareAudio(note);
  if (audio && isValidShareAudio(audio)) prepared.push(audio);
  return prepared;
}

/**
 * Save All to Folder: user picks a location first (while the tap is still
 * fresh), then `<Song-Title>/` is created with the PDF + audio inside.
 * Falls back to separate downloads when folder access is unavailable.
 */
async function saveAllToFolder(note: ShareNote): Promise<ShareResult> {
  const pick = await pickParentFolder();
  if (pick.status === "cancelled") return { status: "cancelled" };

  const prepared = await prepareSongFiles(note);
  if (!areValidShareFiles(prepared)) return { status: "failed" };

  if (pick.status === "picked") {
    try {
      await writeFilesToFolder(pick.handle, safeBaseName(note.title), prepared);
      return { status: "saved" };
    } catch (error) {
      if (isShareCancellation(error)) return { status: "cancelled" };
      // Permission denied or write error → fall back to separate downloads.
    }
  }

  try {
    prepared.forEach(downloadPrepared);
    return { status: "downloaded" };
  } catch {
    return { status: "failed" };
  }
}

export async function shareNoteAsset(note: ShareNote, kind: ShareKind): Promise<ShareResult> {
  try {
    const title = note.title?.trim() || "Untitled Song";

    if (kind === "pdf") {
      const pdf = await prepareSharePdf(note);
      if (!isValidSharePdf(pdf)) return { status: "failed" };
      return shareOrDownloadMany([pdf], title);
    }

    if (kind === "audio") {
      const audio = await prepareActiveShareAudio(note);
      if (!audio || !isValidShareAudio(audio)) return { status: "failed" };
      return shareOrDownloadMany([audio], title);
    }

    if (kind === "saveFolder") {
      return saveAllToFolder(note);
    }

    // All Files: PDF plus audio when available. No JSON, no ZIP.
    const prepared = await prepareSongFiles(note);
    if (!areValidShareFiles(prepared)) return { status: "failed" };
    return shareOrDownloadMany(prepared, title);
  } catch {
    return { status: "failed" };
  }
}
