import type { PreparedFile } from "../shareTypes";

/**
 * Validates prepared Share files before they are handed to the native Share
 * Sheet. Prevents empty/placeholder attachments (the cause of empty Sha*.tmp
 * files in mail clients). Read-only: never touches song data.
 */

const AUDIO_EXTENSIONS = ["m4a", "mp3", "ogg", "wav", "webm", "aac", "mp4"];

function extensionOf(fileName: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(fileName.trim());
  return match ? match[1].toLowerCase() : "";
}

function logValidation(prepared: PreparedFile, ok: boolean): void {
  if (import.meta.env.DEV) {
    // Metadata only — never any user content.
    console.log(
      `Share validation: name=${prepared.fileName} type=${prepared.file.type} size=${prepared.file.size} valid=${ok}`
    );
  }
}

function baseValid(prepared: PreparedFile | null | undefined): prepared is PreparedFile {
  if (!prepared) return false;
  if (!(prepared.file instanceof File)) return false;
  if (!(prepared.blob instanceof Blob)) return false;
  if (prepared.file.size <= 0 || prepared.blob.size <= 0) return false;
  if (!prepared.fileName || prepared.fileName !== prepared.file.name) return false;
  return true;
}

export function isValidSharePdf(prepared: PreparedFile | null | undefined): boolean {
  const ok =
    baseValid(prepared) &&
    extensionOf(prepared.fileName) === "pdf" &&
    prepared.file.type === "application/pdf";
  if (prepared) logValidation(prepared, ok);
  return ok;
}

export function isValidShareAudio(prepared: PreparedFile | null | undefined): boolean {
  const ok =
    baseValid(prepared) &&
    AUDIO_EXTENSIONS.includes(extensionOf(prepared.fileName)) &&
    prepared.file.type.startsWith("audio/");
  if (prepared) logValidation(prepared, ok);
  return ok;
}

/** Every file must independently be a real, non-empty file with a name. */
export function areValidShareFiles(prepared: PreparedFile[]): boolean {
  if (prepared.length === 0) return false;
  return prepared.every((item) => {
    const ok = baseValid(item) && !!item.file.type && extensionOf(item.fileName).length > 0;
    logValidation(item, ok);
    return ok;
  });
}
