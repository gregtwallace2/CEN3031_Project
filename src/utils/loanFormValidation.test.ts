import { describe, expect, it } from 'vitest';
import { DO_NOT_USE_exportForTestsOnly as funcsForTests } from './loanFormValidation';

// principal
describe('Loan Form Validation: Principal', () => {
  it('principal is valid', () => {
    const result = funcsForTests.validatePrincipal(50000);
    expect(result).toBeUndefined();
  });

  it('principal is missing', () => {
    const result = funcsForTests.validatePrincipal(undefined);
    expect(result).equals('Principal is required');
  });

  it('principal is an invalid number', () => {
    const result = funcsForTests.validatePrincipal(Math.sqrt(-1));
    expect(result).equals('Principal is required');
  });

  it('principal is 0', () => {
    const result = funcsForTests.validatePrincipal(0);
    expect(result).equals('Principal must be greater than 0');
  });

  it('principal is negative', () => {
    const result = funcsForTests.validatePrincipal(-1);
    expect(result).equals('Principal must be greater than 0');
  });

  it('principal is too big', () => {
    const result = funcsForTests.validatePrincipal(10_010_000_000);
    expect(result).equals('Principal is too large');
  });
});

// interest rate
describe('Loan Form Validation: Interest Rate', () => {
  it('interest rate is valid', () => {
    const result = funcsForTests.validateInterestRate(6);
    expect(result).toBeUndefined();
  });

  it('interest rate is missing', () => {
    const result = funcsForTests.validateInterestRate(undefined);
    expect(result).equals('Interest rate is required');
  });

  it('interest rate is an invalid number', () => {
    const result = funcsForTests.validateInterestRate(Math.sqrt(-1));
    expect(result).equals('Interest rate is required');
  });

  it('interest rate is 0', () => {
    const result = funcsForTests.validateInterestRate(0);
    expect(result).equals('Interest rate must be greater than 0');
  });

  it('interest rate is negative', () => {
    const result = funcsForTests.validateInterestRate(-1);
    expect(result).equals('Interest rate must be greater than 0');
  });

  it('interest rate is too big', () => {
    const result = funcsForTests.validateInterestRate(100);
    expect(result).equals('Interest rate must be less than 100');
  });
});

// common term test function
const testTermUnitCommon = (termUnit: 'months' | 'years') => {
  it('loan term is missing (' + termUnit + ')', () => {
    const result = funcsForTests.validateLoanTerm(undefined, termUnit);
    expect(result).equals('Loan term is required');
  });

  it('loan term unit is missing (' + termUnit + ')', () => {
    const result = funcsForTests.validateLoanTerm(40, undefined);
    expect(result).equals('Loan term is required');
  });

  it('loan term is an invalid number (' + termUnit + ')', () => {
    const result = funcsForTests.validateLoanTerm(Math.sqrt(-1), termUnit);
    expect(result).equals('Loan term is required');
  });

  it('loan term is 0 (' + termUnit + ')', () => {
    const result = funcsForTests.validateLoanTerm(0, termUnit);
    expect(result).equals('Loan term must be greater than 0');
  });

  it('loan term is negative (' + termUnit + ')', () => {
    const result = funcsForTests.validateLoanTerm(-1, termUnit);
    expect(result).equals('Loan term must be greater than 0');
  });
}

// term (years)
describe('Loan Form Validation: Loan Term (in Years)', () => {
  it('loan term is valid (years)', () => {
    const result = funcsForTests.validateLoanTerm(40, 'years');
    expect(result).toBeUndefined();
  });

  testTermUnitCommon('years');

  it('loan term is too big (years)', () => {
    const result = funcsForTests.validateLoanTerm(51, 'years');
    expect(result).equals('Loan term must be 50 years (600 months) or less');
  });
});

// term (months)
describe('Loan Form Validation: Loan Term (in Months)', () => {
  it('loan term is valid (months)', () => {
    const result = funcsForTests.validateLoanTerm(500, 'months');
    expect(result).toBeUndefined();
  });

  it('loan term is too big (months)', () => {
    const result = funcsForTests.validateLoanTerm(601, 'months');
    expect(result).equals('Loan term must be 50 years (600 months) or less');
  });
});

// income
describe('Loan Form Validation: IDR Income', () => {
  it('income is valid', () => {
    const result = funcsForTests.validateIncome(40000);
    expect(result).toBeUndefined();
  });

  it('income is missing', () => {
    const result = funcsForTests.validateIncome(undefined);
    expect(result).equals('Income is required');
  });

  it('income is an invalid number', () => {
    const result = funcsForTests.validateIncome(Math.sqrt(-1));
    expect(result).equals('Income is required');
  });

  // note: 0 is valid
  it('income is 0', () => {
    const result = funcsForTests.validateIncome(0);
    expect(result).toBeUndefined();
  });

  it('income is negative', () => {
    const result = funcsForTests.validateIncome(-1);
    expect(result).equals('Income must be greater than or equal to 0');
  });

  it('income is too big', () => {
    const result = funcsForTests.validateIncome(10_010_000_000);
    expect(result).equals('Income is too large');
  });
});

// family size
describe('Loan Form Validation: IDR Family Size', () => {
  it('family size is valid', () => {
    const result = funcsForTests.validateFamilySize(4);
    expect(result).toBeUndefined();
  });

  it('family size is missing', () => {
    const result = funcsForTests.validateFamilySize(undefined);
    expect(result).equals('Family size is required');
  });

  it('family size is an invalid number', () => {
    const result = funcsForTests.validateFamilySize(Math.sqrt(-1));
    expect(result).equals('Family size is required');
  });

  it('family size is 0', () => {
    const result = funcsForTests.validateFamilySize(0);
    expect(result).equals('Family size must be greater than 0');
  });

  it('family size is negative', () => {
    const result = funcsForTests.validateFamilySize(-1);
    expect(result).equals('Family size must be greater than 0');
  });

  it('family size is too big', () => {
    const result = funcsForTests.validateFamilySize(51);
    expect(result).equals('Family size is too large');
  });
});
