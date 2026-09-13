import type { ShareNote, PreparedFile } from "../shareTypes";
import { safeBaseName } from "../utils/fileName";

/**
 * Read-only access to existing recordings. Recording creation, storage,
 * playback and deletion are untouched. Audio is never re-encoded.
 */

function extensionFromMime(mime: string): string {
  if (mime.includes("mp4") || mime.includes("m4a")) return "m4a";
  if (mime.includes("mpeg")) return "mp3";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("wav")) return "wav";
  return "webm";
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

/** Uses the recording's real MIME type; only falls back when it is missing or not audio. */
function audioMimeOf(blob: Blob): string {
  const type = (blob.type || "").toLowerCase();
  if (type.startsWith("audio/")) return blob.type;
  if (type.startsWith("video/webm")) return "audio/webm";
  if (type.startsWith("video/mp4")) return "audio/mp4";
  return "audio/webm";
}




export function hasShareableAudio(note?: ShareNote | null): boolean {
  return !!note?.takes?.some((take) => !!take.blob);
}

export async function prepareShareAudioFiles(note: ShareNote): Promise<PreparedFile[]> {
  const takes = (note.takes || []).filter((take) => !!take.blob);
  if (takes.length === 0) return [];

  const base = safeBaseName(note.title);
  const prepared: PreparedFile[] = [];

  for (let i = 0; i < takes.length; i += 1) {
    const blob = await dataUrlToBlob(takes[i].blob);
    if (blob.size === 0) continue;
    const mime = audioMimeOf(blob);
    const ext = extensionFromMime(mime);
    const fileName = takes.length === 1
      ? `${base}.${ext}`
      : `recording-${String(i + 1).padStart(2, "0")}.${ext}`;
    prepared.push({
      blob,
      fileName,
      file: new File([blob], fileName, { type: mime }),
    });
  }

  return prepared;
}


export async function prepareActiveShareAudio(note: ShareNote): Promise<PreparedFile | null> {
  const takes = (note.takes || []).filter((take) => !!take.blob);
  if (takes.length === 0) return null;
  const active = takes.find((take) => take.id === note.activeTakeId) || takes[0];
  const blob = await dataUrlToBlob(active.blob);
  if (blob.size === 0) return null;
  const mime = audioMimeOf(blob);
  const ext = extensionFromMime(mime);
  const fileName = `${safeBaseName(note.title)}.${ext}`;
  return {
    blob,
    fileName,
    file: new File([blob], fileName, { type: mime }),
  };
}

