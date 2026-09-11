import { safeGet, safeSet } from "./localStorage";

// My Styles — user-created reusable Style prompts (separate from app Presets).
// Stored locally under its own key so existing notes/settings are never touched.

export interface SavedStyle {
  id: string;
  name: string;
  prompt: string;
  createdAt: number;
  updatedAt: number;
}

interface MyStylesStorageData {
  version: number;
  styles: SavedStyle[];
}

const MY_STYLES_KEY = "myStyles";
const MY_STYLES_SCHEMA_VERSION = 1;
const MAX_NAME_LENGTH = 60;

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isSavedStyle(value: unknown): value is SavedStyle {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.prompt === "string" &&
    typeof v.createdAt === "number" &&
    typeof v.updatedAt === "number"
  );
}

export function getSavedStyles(): SavedStyle[] {
  const data = safeGet<MyStylesStorageData | null>(MY_STYLES_KEY, null);
  if (!data || !Array.isArray(data.styles)) return [];
  return data.styles.filter(isSavedStyle);
}

function persist(styles: SavedStyle[]): boolean {
  return safeSet<MyStylesStorageData>(MY_STYLES_KEY, {
    version: MY_STYLES_SCHEMA_VERSION,
    styles,
  });
}

export function sanitizeStyleName(name: string): string {
  return name.trim().slice(0, MAX_NAME_LENGTH);
}

export function addSavedStyle(name: string, prompt: string): SavedStyle | null {
  const cleanName = sanitizeStyleName(name);
  const cleanPrompt = prompt.trim();
  if (!cleanName || !cleanPrompt) return null;
  const now = Date.now();
  const style: SavedStyle = { id: generateId(), name: cleanName, prompt: cleanPrompt, createdAt: now, updatedAt: now };
  const styles = [style, ...getSavedStyles()];
  return persist(styles) ? style : null;
}

export function renameSavedStyle(id: string, name: string): boolean {
  const cleanName = sanitizeStyleName(name);
  if (!cleanName) return false;
  const styles = getSavedStyles().map((s) =>
    s.id === id ? { ...s, name: cleanName, updatedAt: Date.now() } : s
  );
  return persist(styles);
}

export function deleteSavedStyle(id: string): boolean {
  const styles = getSavedStyles().filter((s) => s.id !== id);
  return persist(styles);
}
