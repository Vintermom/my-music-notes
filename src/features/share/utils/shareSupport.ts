/**
 * Detects Web Share API capability for files. Read-only feature detection.
 */
export function canShareFiles(files: File[]): boolean {
  try {
    if (typeof navigator === "undefined") return false;
    if (typeof navigator.share !== "function") return false;
    if (typeof navigator.canShare !== "function") return false;
    return navigator.canShare({ files });
  } catch {
    return false;
  }
}

export function isShareCancellation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = (error as { name?: string }).name;
  return name === "AbortError" || name === "NotAllowedError";
}
