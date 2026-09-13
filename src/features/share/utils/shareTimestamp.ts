/**
 * Local export timestamp for the Share PDF footer (Share feature only).
 * Everything is computed on the device — no server call.
 */

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Real device UTC offset at this moment, e.g. "UTC+2", "UTC-4", "UTC+5:30". */
export function localUtcOffsetLabel(date: Date = new Date()): string {
  const minutes = -date.getTimezoneOffset();
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  const hours = Math.floor(abs / 60);
  const rest = abs % 60;
  return `UTC${sign}${hours}${rest ? `:${pad(rest)}` : ""}`;
}

/** "YYYY-MM-DD HH:mm (UTC±X)" in device local time, 24-hour clock. */
export function localExportTimestamp(date: Date = new Date()): string {
  const stamp =
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    ` ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return `${stamp} (${localUtcOffsetLabel(date)})`;
}
