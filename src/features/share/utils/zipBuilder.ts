import JSZip from "jszip";

export interface ZipEntry {
  path: string;
  data: Blob | string;
}

/**
 * Builds a ZIP archive entirely in the browser. No network access.
 */
export async function buildZip(entries: ZipEntry[]): Promise<Blob> {
  const zip = new JSZip();
  entries.forEach((entry) => {
    zip.file(entry.path, entry.data);
  });
  return zip.generateAsync({ type: "blob" });
}
