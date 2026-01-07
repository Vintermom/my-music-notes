const STORAGE_PREFIX = "mymusicnotes_";

export function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

export function safeSet<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function safeRemove(key: string): boolean {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
    return true;
  } catch {
    return false;
  }
}
