import { describe, it, expect } from 'vitest';
import { MONTHS, nextMonth } from '../months';

describe('MONTHS', () => {
  it('lists all twelve months by full name', () => {
    expect(MONTHS).toHaveLength(12);
    expect(MONTHS[0]).toBe('January');
    expect(MONTHS[11]).toBe('December');
  });
});

describe('nextMonth', () => {
  it('returns the month after the given date', () => {
    expect(nextMonth(new Date(2026, 8, 5))).toBe('2026-10');
  });

  it('zero-pads single-digit months', () => {
    expect(nextMonth(new Date(2026, 0, 31))).toBe('2026-02');
  });

  it('rolls the year over from December', () => {
    expect(nextMonth(new Date(2026, 11, 15))).toBe('2027-01');
  });

  it('handles a short following month without spilling into the one after', () => {
    // 31 Jan + 1 month must be February, not March.
    expect(nextMonth(new Date(2026, 0, 31))).toBe('2026-02');
  });
});
