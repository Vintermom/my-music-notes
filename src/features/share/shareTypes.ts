import type { Note } from "@/domain/types";

export type ShareKind = "pdf" | "audio" | "allFiles" | "saveFolder";

export interface PreparedFile {
  file: File;
  blob: Blob;
  fileName: string;
}

export interface ShareResult {
  status: "shared" | "downloaded" | "saved" | "cancelled" | "failed";
}

export type ShareNote = Note;
