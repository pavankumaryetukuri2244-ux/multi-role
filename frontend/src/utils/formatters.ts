/**
 * Date, currency, number, and relative-time formatter utilities.
 */

/**
 * Formats a Date object or ISO date string into a human-readable locale string.
 *
 * @param date - A Date object or ISO date string.
 * @param options - Optional Intl.DateTimeFormatOptions to override defaults.
 * @returns Formatted date string (default: "Jan 15, 2024" style).
 *
 * @example
 * formatDate(new Date('2024-01-15')) // "Jan 15, 2024"
 * formatDate('2024-01-15T10:30:00Z', { month: 'long' }) // "January 15, 2024"
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', options).format(d);
}

/**
 * Formats a numeric amount as a currency string.
 * Defaults to USD if no currency code is provided.
 *
 * @example
 * formatCurrency(1234.5)          // "$1,234.50"
 * formatCurrency(99.99, 'EUR')    // "€99.99"
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a number with locale-appropriate thousands separators.
 *
 * @example
 * formatNumber(1234567)   // "1,234,567"
 * formatNumber(0.5)       // "0.5"
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

/**
 * Formats a date as a human-readable relative time string.
 * Uses Intl.RelativeTimeFormat for locale-aware output.
 *
 * @returns Strings like "just now", "2 hours ago", "3 days ago", "2 months ago".
 *
 * @example
 * formatRelativeTime(new Date(Date.now() - 5000))           // "just now"
 * formatRelativeTime(new Date(Date.now() - 3 * 3600_000))   // "3 hours ago"
 * formatRelativeTime('2024-01-01T00:00:00Z')                // e.g. "5 months ago"
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffSeconds = Math.round((d.getTime() - Date.now()) / 1000);
  const absDiff = Math.abs(diffSeconds);

  // "just now" threshold: within 60 seconds
  if (absDiff < 60) {
    return 'just now';
  }

  const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'always' });

  if (absDiff < 3600) {
    const minutes = Math.round(diffSeconds / 60);
    return rtf.format(minutes, 'minute');
  }

  if (absDiff < 86_400) {
    const hours = Math.round(diffSeconds / 3600);
    return rtf.format(hours, 'hour');
  }

  if (absDiff < 2_592_000) {
    const days = Math.round(diffSeconds / 86_400);
    return rtf.format(days, 'day');
  }

  if (absDiff < 31_536_000) {
    const months = Math.round(diffSeconds / 2_592_000);
    return rtf.format(months, 'month');
  }

  const years = Math.round(diffSeconds / 31_536_000);
  return rtf.format(years, 'year');
}
