import type { PreparedFile } from "../shareTypes";
import { supportsFolderSave, isShareCancellation } from "./shareSupport";

/**
 * Save All to Folder (Share feature only).
 *
 * Uses the browser's user-approved directory picker when available. The user
 * explicitly chooses the location; the app never writes anywhere silently.
 * When the platform has no folder capability the caller falls back to
 * separate downloads (never ZIP, never a server).
 */

interface WritableLike {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
}

interface FileHandleLike {
  createWritable(): Promise<WritableLike>;
}

export interface DirectoryHandleLike {
  name: string;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<DirectoryHandleLike>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileHandleLike>;
}

type DirectoryPickerFn = (options?: {
  mode?: "read" | "readwrite";
  startIn?: string;
  id?: string;
}) => Promise<DirectoryHandleLike>;

export type FolderPickResult =
  | { status: "picked"; handle: DirectoryHandleLike }
  | { status: "cancelled" }
  | { status: "unsupported" };

/**
 * Asks the user to choose a parent folder. Must be called directly from the
 * user's tap (before any slow file preparation) so the browser accepts it.
 */
export async function pickParentFolder(): Promise<FolderPickResult> {
  if (!supportsFolderSave()) return { status: "unsupported" };
  const picker = (window as unknown as { showDirectoryPicker?: DirectoryPickerFn }).showDirectoryPicker;
  if (typeof picker !== "function") return { status: "unsupported" };

  try {
    const handle = await picker.call(window, { mode: "readwrite", id: "mymunotes-share" });
    return { status: "picked", handle };
  } catch (error) {
    if (isShareCancellation(error)) return { status: "cancelled" };
    // SecurityError (embedded/cross-origin context), TypeError, etc. → treat as unsupported.
    return { status: "unsupported" };
  }
}

/**
 * Creates `<folderName>/` inside the chosen parent folder and writes every
 * prepared file into it. Existing files with the same name are overwritten.
 */
export async function writeFilesToFolder(
  parent: DirectoryHandleLike,
  folderName: string,
  files: PreparedFile[]
): Promise<void> {
  const songFolder = await parent.getDirectoryHandle(folderName, { create: true });
  for (const prepared of files) {
    const fileHandle = await songFolder.getFileHandle(prepared.fileName, { create: true });
    const writable = await fileHandle.createWritable();
    try {
      await writable.write(prepared.blob);
    } finally {
      await writable.close();
    }
  }
}
