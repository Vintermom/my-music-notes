import type { PreparedFile, ShareResult, ShareNote, ShareKind } from "./shareTypes";
import { canShareFiles, isShareCancellation } from "./utils/shareSupport";
import { prepareSharePdf } from "./exporters/sharePdfExporter";
import { prepareActiveShareAudio } from "./exporters/shareAudioExporter";
import { safeBaseName } from "./utils/fileName";
import { pickParentFolder, writeFilesToFolder } from "./utils/folderSave";

function downloadPrepared(prepared: PreparedFile): void {
  const url = URL.createObjectURL(prepared.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = prepared.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function shareOrDownload(prepared: PreparedFile, title: string): Promise<ShareResult> {
  if (canShareFiles([prepared.file])) {
    try {
      await navigator.share({ files: [prepared.file], title });
      return { status: "shared" };
    } catch (error) {
      if (isShareCancellation(error)) return { status: "cancelled" };
      // Fall through to download fallback.
    }
  }

  try {
    downloadPrepared(prepared);
    return { status: "downloaded" };
  } catch {
    return { status: "failed" };
  }
}

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
  const prepared: PreparedFile[] = [await prepareSharePdf(note)];
  const audio = await prepareActiveShareAudio(note);
  if (audio) prepared.push(audio);
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
      return shareOrDownload(await prepareSharePdf(note), title);
    }

    if (kind === "audio") {
      const audio = await prepareActiveShareAudio(note);
      if (!audio) return { status: "failed" };
      return shareOrDownload(audio, title);
    }

    if (kind === "saveFolder") {
      return saveAllToFolder(note);
    }

    // All Files: PDF plus audio when available. No JSON, no ZIP.
    return shareOrDownloadMany(await prepareSongFiles(note), title);
  } catch {
    return { status: "failed" };
  }
}
