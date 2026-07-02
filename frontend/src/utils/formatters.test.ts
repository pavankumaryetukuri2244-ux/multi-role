import { describe, it, expect } from 'vitest';
import { formatDate, formatCurrency, formatNumber, formatRelativeTime } from './formatters';

describe('formatDate', () => {
  it('formats a Date object', () => {
    const result = formatDate(new Date('2024-01-15T00:00:00.000Z'));
    // The exact string depends on the timezone of the runner; just verify structure.
    expect(result).toMatch(/\d{4}/); // contains a year
    expect(result).toMatch(/15/);    // contains the day
  });

  it('formats an ISO date string', () => {
    const result = formatDate('2024-06-01T00:00:00.000Z');
    expect(result).toMatch(/2024/);
  });

  it('produces a short-month format by default (e.g. "Jan")', () => {
    // Default options: { year: 'numeric', month: 'short', day: 'numeric' }
    const result = formatDate(new Date(2024, 0, 20)); // month is 0-indexed
    expect(result).toContain('Jan');
    expect(result).toContain('2024');
    expect(result).toContain('20');
  });

  it('accepts custom options to produce a long-month format', () => {
    const result = formatDate(new Date(2024, 0, 20), { year: 'numeric', month: 'long', day: 'numeric' });
    expect(result).toContain('January');
    expect(result).toContain('2024');
    expect(result).toContain('20');
  });
});

describe('formatRelativeTime', () => {
  it('returns "just now" for a date within 60 seconds', () => {
    const recent = new Date(Date.now() - 10_000); // 10 seconds ago
    expect(formatRelativeTime(recent)).toBe('just now');
  });

  it('returns minutes ago for dates 1–59 minutes ago', () => {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60_000);
    expect(formatRelativeTime(twoMinutesAgo)).toMatch(/2 minutes ago/);
  });

  it('returns hours ago for dates 1–23 hours ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3_600_000);
    expect(formatRelativeTime(threeHoursAgo)).toMatch(/3 hours ago/);
  });

  it('returns days ago for dates 1–29 days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000);
    expect(formatRelativeTime(threeDaysAgo)).toMatch(/3 days ago/);
  });

  it('accepts an ISO date string', () => {
    const recentStr = new Date(Date.now() - 5_000).toISOString();
    expect(formatRelativeTime(recentStr)).toBe('just now');
  });
});

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    const result = formatCurrency(1234.5);
    expect(result).toBe('$1,234.50');
  });

  it('formats EUR when specified', () => {
    const result = formatCurrency(99.99, 'EUR');
    expect(result).toContain('99.99');
    expect(result).toContain('€');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats negative amounts', () => {
    const result = formatCurrency(-50);
    expect(result).toContain('50.00');
  });

  it('always shows 2 decimal places', () => {
    expect(formatCurrency(100)).toBe('$100.00');
    expect(formatCurrency(1.1)).toBe('$1.10');
  });
});

describe('formatNumber', () => {
  it('adds thousands separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('handles numbers less than 1000 with no separator', () => {
    expect(formatNumber(999)).toBe('999');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('handles decimal values', () => {
    const result = formatNumber(0.5);
    expect(result).toContain('0.5');
  });

  it('handles negative numbers', () => {
    const result = formatNumber(-1000);
    expect(result).toContain('1,000');
  });
});
