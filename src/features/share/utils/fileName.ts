/**
 * Share-specific safe filename helper. Never mutates the stored song title.
 */
export function safeBaseName(title?: string): string {
  const raw = (title || "").trim();
  if (!raw) return "Untitled-Song";

  const cleaned = raw
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return cleaned || "Untitled-Song";
}

export function withExtension(base: string, ext: string): string {
  return `${base}.${ext.replace(/^\./, "")}`;
}
