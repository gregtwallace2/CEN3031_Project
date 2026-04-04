import { describe, expect, it } from 'vitest';
import {
  calculateStandardMonthlyPayment,
  generateAmortizationSchedule,
} from './loanCalculations';

describe('calculateStandardMonthlyPayment', () => {
  it('calculates the standard monthly payment for a typical loan', () => {
    const result = calculateStandardMonthlyPayment(10000, 5, 120);
    expect(result).toBeCloseTo(106.07, 2);
  });

  it('calculates correctly when interest rate is zero', () => {
    const result = calculateStandardMonthlyPayment(12000, 0, 120);
    expect(result).toBeCloseTo(100, 2);
  });

  it('throws an error when loan term is 0', () => {
    expect(() => calculateStandardMonthlyPayment(10000, 5, 0)).toThrow(
      'Loan term must be greater than 0',
    );
  });

  it('throws an error when principal is negative', () => {
    expect(() => calculateStandardMonthlyPayment(-10000, 5, 120)).toThrow(
      'Principal cannot be negative',
    );
  });

  it('throws an error when annual rate is negative', () => {
    expect(() => calculateStandardMonthlyPayment(10000, -5, 120)).toThrow(
      'Interest rate cannot be negative',
    );
  });
});

describe('generateAmortizationSchedule', () => {
  it('creates one row per monthly payment', () => {
    const schedule = generateAmortizationSchedule(
      10000,
      5,
      120,
      new Date(Date.UTC(2026, 0, 15)),
    );

    expect(schedule).toHaveLength(120);
  });

  it('starts payments in the month after the selected start month', () => {
    const schedule = generateAmortizationSchedule(
      1000,
      0,
      3,
      new Date(Date.UTC(2026, 3, 15)),
    );

    expect(schedule[0]?.paymentDate).toBe('May 2026');
    expect(schedule[0]?.paymentMonthLabel).toBe('May');
    expect(schedule[1]?.paymentDate).toBe('Jun 2026');
    expect(schedule[2]?.paymentDate).toBe('Jul 2026');
  });

  it('groups rows under the correct payment year', () => {
    const schedule = generateAmortizationSchedule(
      1000,
      0,
      3,
      new Date(Date.UTC(2026, 11, 1)),
    );

    expect(schedule[0]?.paymentYear).toBe(2027);
    expect(schedule[1]?.paymentYear).toBe(2027);
    expect(schedule[2]?.paymentYear).toBe(2027);
  });

  it('splits each payment into principal and interest', () => {
    const schedule = generateAmortizationSchedule(
      10000,
      5,
      120,
      new Date(Date.UTC(2026, 0, 15)),
    );

    expect(schedule[0]?.paymentAmount).toBeCloseTo(106.07, 2);
    expect(schedule[0]?.interestPaid).toBeCloseTo(41.67, 2);
    expect(schedule[0]?.principalPaid).toBeCloseTo(64.4, 2);
    expect(schedule[0]?.remainingBalance).toBeCloseTo(9935.6, 2);
  });

  it('pays the loan down to exactly zero without going negative', () => {
    const schedule = generateAmortizationSchedule(
      10000,
      5,
      120,
      new Date(Date.UTC(2026, 0, 15)),
    );

    const lastPayment = schedule.at(-1);
    const hasNegativeBalance = schedule.some((row) => row.remainingBalance < 0);

    expect(lastPayment?.remainingBalance).toBe(0);
    expect(hasNegativeBalance).toBe(false);
  });

  it('handles zero-interest loans with principal-only payments', () => {
    const schedule = generateAmortizationSchedule(
      1200,
      0,
      12,
      new Date(Date.UTC(2026, 0, 15)),
    );

    expect(schedule[0]?.paymentAmount).toBe(100);
    expect(schedule[0]?.interestPaid).toBe(0);
    expect(schedule[0]?.principalPaid).toBe(100);
    expect(schedule.at(-1)?.remainingBalance).toBe(0);
  });
});
