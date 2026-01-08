import { STORAGE_SCHEMA_VERSION } from "@/domain/types";

const STORAGE_PREFIX = "mymusicnotes_";

/**
 * Check if localStorage is available
 */
function isStorageAvailable(): boolean {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safe get with corruption handling
 * Returns defaultValue if data is corrupted or missing
 */
export function safeGet<T>(key: string, defaultValue: T): T {
  if (!isStorageAvailable()) {
    console.warn("[Storage] localStorage not available, using default");
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (item === null) return defaultValue;
    
    const parsed = JSON.parse(item);
    return parsed as T;
  } catch (error) {
    // Data is corrupted - log warning but don't crash
    console.warn(`[Storage] Corrupted data for key "${key}", using default`, error);
    return defaultValue;
  }
}

/**
 * Safe set with error handling
 */
export function safeSet<T>(key: string, value: T): boolean {
  if (!isStorageAvailable()) {
    console.warn("[Storage] localStorage not available, cannot save");
    return false;
  }

  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (error) {
    // Likely quota exceeded
    console.error(`[Storage] Failed to save key "${key}"`, error);
    return false;
  }
}

/**
 * Safe remove
 */
export function safeRemove(key: string): boolean {
  if (!isStorageAvailable()) return false;

  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get raw storage value for corruption checking
 */
export function getRawStorage(key: string): string | null {
  if (!isStorageAvailable()) return null;
  
  try {
    return localStorage.getItem(STORAGE_PREFIX + key);
  } catch {
    return null;
  }
}

/**
 * Create a backup of current storage data
 */
export function createBackup(key: string): boolean {
  if (!isStorageAvailable()) return false;

  try {
    const data = localStorage.getItem(STORAGE_PREFIX + key);
    if (data) {
      localStorage.setItem(STORAGE_PREFIX + key + "_backup", data);
      localStorage.setItem(
        STORAGE_PREFIX + key + "_backup_ts",
        JSON.stringify(Date.now())
      );
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Restore from backup
 */
export function restoreFromBackup(key: string): boolean {
  if (!isStorageAvailable()) return false;

  try {
    const backup = localStorage.getItem(STORAGE_PREFIX + key + "_backup");
    if (backup) {
      localStorage.setItem(STORAGE_PREFIX + key, backup);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Get storage version for a key
 */
export function getStoredVersion(key: string): number {
  try {
    const data = safeGet<{ version?: number }>(key, { version: 0 });
    return data.version ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Check if migration is needed
 */
export function needsMigration(key: string): boolean {
  const storedVersion = getStoredVersion(key);
  return storedVersion < STORAGE_SCHEMA_VERSION;
}
