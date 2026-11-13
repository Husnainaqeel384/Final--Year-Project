import { describe, expect, it } from 'vitest';
import { formatDate, formatMonth } from './format.js';

describe('date helpers', () => {
  it('keeps a date-only value on its calendar day', () => {
    expect(formatDate('2026-03-01')).toContain('1');
    expect(formatDate('2026-03-01')).toMatch(/Mar/);
  });

  it('returns an empty string for missing values', () => {
    expect(formatDate(null)).toBe('');
    expect(formatMonth('')).toBe('');
  });
});
