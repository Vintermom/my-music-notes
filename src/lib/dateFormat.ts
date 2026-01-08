import { format } from "date-fns";

/**
 * Format timestamp to ISO 8601 display format: YYYY-MM-DD HH:mm
 * Timezone is stored internally but not displayed in UI
 */
export function formatDateISO(timestamp: number): string {
  return format(new Date(timestamp), "yyyy-MM-dd HH:mm");
}

/**
 * Format current date/time to ISO 8601 display format
 */
export function formatNowISO(): string {
  return formatDateISO(Date.now());
}
