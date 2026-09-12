import type { PreparedFile, ShareResult, ShareNote, ShareKind } from "./shareTypes";
import { canShareFiles, isShareCancellation } from "./utils/shareSupport";
import { prepareSharePdf } from "./exporters/sharePdfExporter";
import { prepareActiveShareAudio } from "./exporters/shareAudioExporter";

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

export async function shareNoteAsset(note: ShareNote, kind: ShareKind): Promise<ShareResult> {
  try {
    const title = note.title?.trim() || "Untitled Song";

    if (kind === "pdf") {
      return shareOrDownload(prepareSharePdf(note), title);
    }

    if (kind === "audio") {
      const audio = await prepareActiveShareAudio(note);
      if (!audio) return { status: "failed" };
      return shareOrDownload(audio, title);
    }

    // All Files: PDF plus audio when available. No JSON, no ZIP.
    const prepared: PreparedFile[] = [prepareSharePdf(note)];
    const audio = await prepareActiveShareAudio(note);
    if (audio) prepared.push(audio);
    return shareOrDownloadMany(prepared, title);
  } catch {
    return { status: "failed" };
  }
}
