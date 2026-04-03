export function calculateStandardMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number,
): number {
  if (years <= 0) {
    throw new Error('Loan term must be greater than 0');
  }

  if (principal < 0) {
    throw new Error('Principal cannot be negative');
  }

  if (annualRate < 0) {
    throw new Error('Interest rate cannot be negative');
  }

  const n = years * 12;
  const r = annualRate / 100 / 12;

  if (r === 0) {
    return principal / n;
  }

  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

// Federal poverty income (2026)
const basePovertyLevel = 15_960;
const basePovertyDependentIncrement = 5_680;

// IBR10: 10% of discretionary income (income - 150% poverty threshold), with max at 10 yr standard pmt
export function calculateIBR10MonthlyPayment(
  principal: number,
  annualRate: number,
  annualIncome: number,
  familySize: number,
): number {
  // pmt is capped at this upper bound (no bound checks on these vars as they are checked in std function)
  const standard10YrMonthlyPmt = calculateStandardMonthlyPayment(
    principal,
    annualRate,
    10,
  );

  if (annualIncome < 0) {
    throw new Error('Annual income must be 0 or greater');
  }

  if (familySize <= 0) {
    throw new Error('Family size must be greater than 0');
  }

  // calculate
  const discretionaryIncome =
    annualIncome -
    1.5 * (basePovertyLevel + (familySize - 1) * basePovertyDependentIncrement);
  const ibr10Pmt = (0.1 * discretionaryIncome) / 12;

  if (ibr10Pmt <= 0) return 0;

  return Math.min(ibr10Pmt, standard10YrMonthlyPmt);
}

// ICR: 20% of discretionary income (income - 225% poverty threshold), with max at 12 yr standard pmt
export function calculateICRMonthlyPayment(
  principal: number,
  annualRate: number,
  annualIncome: number,
  familySize: number,
): number {
  // pmt is capped at this upper bound (no bound checks on these vars as they are checked in std function)
  const standard12YrMonthlyPmt = calculateStandardMonthlyPayment(
    principal,
    annualRate,
    12,
  );

  if (annualIncome < 0) {
    throw new Error('Annual income must be 0 or greater');
  }

  if (familySize <= 0) {
    throw new Error('Family size must be greater than 0');
  }

  // calculate
  const discretionaryIncome =
    annualIncome -
    (basePovertyLevel + (familySize - 1) * basePovertyDependentIncrement);
  const icrPmt = (0.2 * discretionaryIncome) / 12;

  if (icrPmt <= 0) return 0;

  return Math.min(icrPmt, standard12YrMonthlyPmt);
}

// PAYE: Paye is effectively now the same as IBR10
export function calculatePAYEMonthlyPayment(
  principal: number,
  annualRate: number,
  annualIncome: number,
  familySize: number,
): number {
  return calculateIBR10MonthlyPayment(
    principal,
    annualRate,
    annualIncome,
    familySize,
  );
}
