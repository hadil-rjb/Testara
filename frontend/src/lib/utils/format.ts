/**
 * Tiny string/number/date formatters used by the UI layer.
 * Keep dependency-free to stay cheap — locales come from `next-intl`
 * in components when full i18n formatting is needed.
 */

/** Extract uppercase initials from a full name. */
export function getInitials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Format an ISO date to locale short form (e.g. "14 avr. 2026"). */
export function formatDate(
  input?: string | number | Date | null,
  locale: string = 'en',
): string {
  if (!input) return '—';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Format a number with thin-space separators (e.g. 1234 → "1 234"). */
export function formatNumber(n: number, locale: string = 'en'): string {
  return n.toLocaleString(locale);
}

/** Human-friendly file size: 1536 → "1.5 KB". */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Truncate a string at `max` chars, appending an ellipsis. */
export function truncate(s: string, max = 48): string {
  if (!s) return '';
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}
