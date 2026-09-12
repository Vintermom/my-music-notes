import type { ShareNote, PreparedFile } from "../shareTypes";
import { safeBaseName, withExtension } from "../utils/fileName";
import { buildZip, type ZipEntry } from "../utils/zipBuilder";
import { prepareSharePdf } from "./sharePdfExporter";
import { prepareShareJson } from "./shareJsonExporter";
import { prepareShareAudioFiles } from "./shareAudioExporter";

/**
 * Builds one local ZIP containing PDF + JSON, plus audio when available.
 */
export async function prepareFullSongPackage(note: ShareNote): Promise<PreparedFile> {
  const base = safeBaseName(note.title);
  const pdf = prepareSharePdf(note);
  const json = prepareShareJson(note);

  const entries: ZipEntry[] = [
    { path: withExtension(base, "pdf"), data: pdf.blob },
    { path: withExtension(base, "json"), data: json.blob },
  ];

  try {
    const audioFiles = await prepareShareAudioFiles(note);
    audioFiles.forEach((audio, index) => {
      const ext = audio.fileName.split(".").pop() || "webm";
      entries.push({
        path: `audio/recording-${String(index + 1).padStart(2, "0")}.${ext}`,
        data: audio.blob,
      });
    });
  } catch {
    // Audio is optional — the package is still produced without it.
  }

  const blob = await buildZip(entries);
  const fileName = withExtension(base, "zip");
  return {
    blob,
    fileName,
    file: new File([blob], fileName, { type: "application/zip" }),
  };
}
