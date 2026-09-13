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

/** True when the browser exposes the Web Share API at all (files may still be unsupported). */
export function hasWebShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

/** Multi-file share: every file must be accepted together by canShare(). */
export function canShareMultipleFiles(files: File[]): boolean {
  if (files.length < 2) return false;
  return canShareFiles(files);
}

/**
 * Folder / file-system capability (File System Access API directory picker).
 * Requires a secure context; the user still has to approve the location.
 */
export function supportsFolderSave(): boolean {
  try {
    if (typeof window === "undefined") return false;
    if (!window.isSecureContext) return false;
    return typeof (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker === "function";
  } catch {
    return false;
  }
}

export function isShareCancellation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = (error as { name?: string }).name;
  return name === "AbortError" || name === "NotAllowedError";
}
