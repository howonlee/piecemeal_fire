import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatMonth, getCurrentMonth, getPreviousMonth, getNextMonth } from './dateHelpers';

describe('dateHelpers', () => {
  describe('formatMonth', () => {
    it('should format month correctly', () => {
      expect(formatMonth(2024, 1)).toBe('January 2024');
      expect(formatMonth(2024, 6)).toBe('June 2024');
      expect(formatMonth(2024, 12)).toBe('December 2024');
    });

    it('should handle different years', () => {
      expect(formatMonth(2023, 3)).toBe('March 2023');
      expect(formatMonth(2025, 7)).toBe('July 2025');
    });
  });

  describe('getCurrentMonth', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return current year and month', () => {
      vi.setSystemTime(new Date(2024, 0, 15)); // January 15, 2024
      const result = getCurrentMonth();
      expect(result).toEqual({ year: 2024, month: 1 });
    });

    it('should handle December correctly', () => {
      vi.setSystemTime(new Date(2024, 11, 25)); // December 25, 2024
      const result = getCurrentMonth();
      expect(result).toEqual({ year: 2024, month: 12 });
    });

    it('should handle year boundaries', () => {
      vi.setSystemTime(new Date(2025, 0, 1)); // January 1, 2025
      const result = getCurrentMonth();
      expect(result).toEqual({ year: 2025, month: 1 });
    });
  });

  describe('getPreviousMonth', () => {
    it('should get previous month within same year', () => {
      expect(getPreviousMonth(2024, 6)).toEqual({ year: 2024, month: 5 });
      expect(getPreviousMonth(2024, 12)).toEqual({ year: 2024, month: 11 });
    });

    it('should handle year boundary', () => {
      expect(getPreviousMonth(2024, 1)).toEqual({ year: 2023, month: 12 });
    });

    it('should handle multiple year boundaries', () => {
      expect(getPreviousMonth(2020, 1)).toEqual({ year: 2019, month: 12 });
    });
  });

  describe('getNextMonth', () => {
    it('should get next month within same year', () => {
      expect(getNextMonth(2024, 1)).toEqual({ year: 2024, month: 2 });
      expect(getNextMonth(2024, 6)).toEqual({ year: 2024, month: 7 });
    });

    it('should handle year boundary', () => {
      expect(getNextMonth(2024, 12)).toEqual({ year: 2025, month: 1 });
    });

    it('should handle multiple year boundaries', () => {
      expect(getNextMonth(2020, 12)).toEqual({ year: 2021, month: 1 });
    });
  });
});
