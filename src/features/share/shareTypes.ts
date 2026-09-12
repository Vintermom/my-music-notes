import type { Note } from "@/domain/types";

export type ShareKind = "pdf" | "audio" | "allFiles";

export interface PreparedFile {
  file: File;
  blob: Blob;
  fileName: string;
}

export interface ShareResult {
  status: "shared" | "downloaded" | "cancelled" | "failed";
}

export type ShareNote = Note;
