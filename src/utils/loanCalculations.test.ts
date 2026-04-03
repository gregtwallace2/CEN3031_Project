import { describe, expect, it } from 'vitest';
import {
  calculateStandardMonthlyPayment,
  calculateIBR10MonthlyPayment,
  calculateICRMonthlyPayment,
  calculatePAYEMonthlyPayment,
} from './loanCalculations';

describe('calculateStandardMonthlyPayment', () => {
  it('calculates the standard monthly payment for a typical loan', () => {
    const result = calculateStandardMonthlyPayment(10000, 5, 10);
    expect(result).toBeCloseTo(106.07, 2);
  });

  it('calculates correctly when interest rate is zero', () => {
    const result = calculateStandardMonthlyPayment(12000, 0, 10);
    expect(result).toBeCloseTo(100, 2);
  });

  it('throws an error when years is 0', () => {
    expect(() => calculateStandardMonthlyPayment(10000, 5, 0)).toThrow(
      'Loan term must be greater than 0',
    );
  });

  it('throws an error when principal is negative', () => {
    expect(() => calculateStandardMonthlyPayment(-10000, 5, 10)).toThrow(
      'Principal cannot be negative',
    );
  });

  it('throws an error when annual rate is negative', () => {
    expect(() => calculateStandardMonthlyPayment(10000, -5, 10)).toThrow(
      'Interest rate cannot be negative',
    );
  });
});

// IDR 10 Tests
describe('calculateIDR10MonthlyPayment', () => {
  // invalid inputs
  it('throws an error when principal is negative', () => {
    expect(() => calculateIBR10MonthlyPayment(-10000, 5, 40000, 2)).toThrow(
      'Principal cannot be negative',
    );
  });

  it('throws an error when annual rate is negative', () => {
    expect(() => calculateIBR10MonthlyPayment(10000, -5, 40000, 2)).toThrow(
      'Interest rate cannot be negative',
    );
  });

  it('throws an error when family size is 0', () => {
    expect(() => calculateIBR10MonthlyPayment(10000, 5, 40000, 0)).toThrow(
      'Family size must be greater than 0',
    );
  });

  it('throws an error when income is negative', () => {
    expect(() => calculateIBR10MonthlyPayment(10000, 5, -4000, 1)).toThrow(
      'Annual income must be 0 or greater',
    );
  });

  // calculation checks
  it('calculates typical idr scenario 1', () => {
    const result = calculateIBR10MonthlyPayment(10000, 5, 40000, 2);
    expect(result).toBeCloseTo(62.83, 2);
  });

  it('calculates typical idr scenario 2', () => {
    const result = calculateIBR10MonthlyPayment(40000, 6, 40000, 1);
    expect(result).toBeCloseTo(133.83, 2);
  });

  it('calculates typical idr scenario 3', () => {
    const result = calculateIBR10MonthlyPayment(30000, 2, 40000, 2);
    expect(result).toBeCloseTo(62.83, 2);
  });

  it('calculates typical idr scenario with 0 pmt', () => {
    const result = calculateIBR10MonthlyPayment(50000, 6, 15000, 4);
    expect(result).toBeCloseTo(0, 2);
  });

  it('calculates typical idr scenario with where 10yr pmt is the result anyway', () => {
    const result = calculateIBR10MonthlyPayment(10000, 5, 180000, 1);
    expect(result).toBeCloseTo(
      calculateStandardMonthlyPayment(10000, 5, 10),
      2,
    );
  });
});

// ICR Tests
describe('calculateICRMonthlyPayment', () => {
  // invalid inputs
  it('throws an error when principal is negative', () => {
    expect(() => calculateICRMonthlyPayment(-10000, 5, 40000, 2)).toThrow(
      'Principal cannot be negative',
    );
  });

  it('throws an error when annual rate is negative', () => {
    expect(() => calculateICRMonthlyPayment(10000, -5, 40000, 2)).toThrow(
      'Interest rate cannot be negative',
    );
  });

  it('throws an error when family size is 0', () => {
    expect(() => calculateICRMonthlyPayment(10000, 5, 40000, 0)).toThrow(
      'Family size must be greater than 0',
    );
  });

  it('throws an error when income is negative', () => {
    expect(() => calculateICRMonthlyPayment(10000, 5, -4000, 1)).toThrow(
      'Annual income must be 0 or greater',
    );
  });

  // calculation checks
  it('calculates typical icr scenario 1', () => {
    const result = calculateICRMonthlyPayment(100000, 5, 40000, 2);
    expect(result).toBeCloseTo(306, 2);
  });

  it('calculates typical icr scenario 2', () => {
    const result = calculateICRMonthlyPayment(40000, 6, 30000, 1);
    expect(result).toBeCloseTo(234, 2);
  });

  it('calculates typical icr scenario 3', () => {
    const result = calculateICRMonthlyPayment(80000, 7, 45000, 2);
    expect(result).toBeCloseTo(389.33, 2);
  });

  it('calculates typical icr scenario with 0 pmt', () => {
    const result = calculateICRMonthlyPayment(50000, 6, 15000, 4);
    expect(result).toBeCloseTo(0, 2);
  });

  it('calculates typical icr scenario with where 12yr pmt is the result anyway', () => {
    const result = calculateICRMonthlyPayment(10000, 5, 40000, 2);
    expect(result).toBeCloseTo(
      calculateStandardMonthlyPayment(10000, 5, 12),
      2,
    );
  });
});

// PAYE Tests
describe('calculatePAYEMonthlyPayment', () => {
  // invalid inputs
  it('throws an error when principal is negative', () => {
    expect(() => calculatePAYEMonthlyPayment(-10000, 5, 40000, 2)).toThrow(
      'Principal cannot be negative',
    );
  });

  it('throws an error when annual rate is negative', () => {
    expect(() => calculatePAYEMonthlyPayment(10000, -5, 40000, 2)).toThrow(
      'Interest rate cannot be negative',
    );
  });

  it('throws an error when family size is 0', () => {
    expect(() => calculatePAYEMonthlyPayment(10000, 5, 40000, 0)).toThrow(
      'Family size must be greater than 0',
    );
  });

  it('throws an error when income is negative', () => {
    expect(() => calculatePAYEMonthlyPayment(10000, 5, -4000, 1)).toThrow(
      'Annual income must be 0 or greater',
    );
  });

  // calculation checks
  it('calculates typical paye scenario 1', () => {
    const result = calculatePAYEMonthlyPayment(10000, 5, 40000, 2);
    expect(result).toBeCloseTo(62.83, 2);
  });

  it('calculates typical paye scenario 2', () => {
    const result = calculatePAYEMonthlyPayment(40000, 6, 40000, 1);
    expect(result).toBeCloseTo(133.83, 2);
  });

  it('calculates typical paye scenario 3', () => {
    const result = calculatePAYEMonthlyPayment(30000, 2, 40000, 2);
    expect(result).toBeCloseTo(62.83, 2);
  });

  it('calculates typical paye scenario with 0 pmt', () => {
    const result = calculatePAYEMonthlyPayment(50000, 6, 15000, 4);
    expect(result).toBeCloseTo(0, 2);
  });

  it('calculates typical paye scenario with where 10yr pmt is the result anyway', () => {
    const result = calculatePAYEMonthlyPayment(10000, 5, 180000, 1);
    expect(result).toBeCloseTo(
      calculateStandardMonthlyPayment(10000, 5, 10),
      2,
    );
  });
});
