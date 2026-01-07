import { Settings, DEFAULT_SETTINGS } from "@/domain/types";
import { safeGet, safeSet } from "./localStorage";

const SETTINGS_KEY = "settings";

export function getSettings(): Settings {
  return safeGet(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function saveSettings(settings: Settings): boolean {
  return safeSet(SETTINGS_KEY, settings);
}

export function updateSettings(partial: Partial<Settings>): Settings {
  const current = getSettings();
  const updated = { ...current, ...partial };
  saveSettings(updated);
  return updated;
}
