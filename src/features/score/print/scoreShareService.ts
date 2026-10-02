import type { Note } from "@/domain/types";
import type { PreparedFile, ShareKind, ShareResult } from "@/features/share/shareTypes";
import { canShareFiles, isShareCancellation } from "@/features/share/utils/shareSupport";
import { prepareActiveShareAudio } from "@/features/share/exporters/shareAudioExporter";
import { isValidSharePdf, isValidShareAudio, areValidShareFiles } from "@/features/share/utils/shareValidation";
import { pickParentFolder, writeFilesToFolder } from "@/features/share/utils/folderSave";
import { safeBaseName } from "@/features/share/utils/fileName";
import { prepareScorePdf } from "./scoreSharePdf";

/** Score-only Share: same Share menu and handoff rules, but the PDF is the Score document. */
function download(p: PreparedFile) {
  const url = URL.createObjectURL(p.blob);
  const a = document.createElement("a");
  a.href = url; a.download = p.fileName;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

async function shareOrDownload(prepared: PreparedFile[], title: string): Promise<ShareResult> {
  const files = prepared.map((p) => p.file);
  if (canShareFiles(files)) {
    try { await navigator.share({ files, title }); return { status: "shared" }; }
    catch (e) { if (isShareCancellation(e)) return { status: "cancelled" }; }
  }
  try { prepared.forEach(download); return { status: "downloaded" }; } catch { return { status: "failed" }; }
}

async function allFiles(note: Note): Promise<PreparedFile[]> {
  const pdf = await prepareScorePdf(note);
  if (!isValidSharePdf(pdf)) return [];
  const out = [pdf];
  const audio = await prepareActiveShareAudio(note);
  if (audio && isValidShareAudio(audio)) out.push(audio);
  return out;
}

export async function shareScoreAsset(note: Note, kind: ShareKind): Promise<ShareResult> {
  try {
    const title = note.title?.trim() || "Untitled Song";
    if (kind === "pdf") {
      const pdf = await prepareScorePdf(note);
      return isValidSharePdf(pdf) ? shareOrDownload([pdf], title) : { status: "failed" };
    }
    if (kind === "audio") {
      const audio = await prepareActiveShareAudio(note);
      return audio && isValidShareAudio(audio) ? shareOrDownload([audio], title) : { status: "failed" };
    }
    if (kind === "saveFolder") {
      const pick = await pickParentFolder();
      if (pick.status === "cancelled") return { status: "cancelled" };
      const prepared = await allFiles(note);
      if (!areValidShareFiles(prepared)) return { status: "failed" };
      if (pick.status === "picked") {
        try { await writeFilesToFolder(pick.handle, safeBaseName(note.title), prepared); return { status: "saved" }; }
        catch (e) { if (isShareCancellation(e)) return { status: "cancelled" }; }
      }
      prepared.forEach(download);
      return { status: "downloaded" };
    }
    const prepared = await allFiles(note);
    return areValidShareFiles(prepared) ? shareOrDownload(prepared, title) : { status: "failed" };
  } catch {
    return { status: "failed" };
  }
}
