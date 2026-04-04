export interface AmortizationScheduleRow {
  paymentNumber: number;
  paymentDate: string;
  paymentMonthLabel: string;
  paymentYear: number;
  paymentAmount: number;
  interestPaid: number;
  principalPaid: number;
  remainingBalance: number;
}

function roundToCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function validateLoanInputs(
  principal: number,
  annualRate: number,
  termMonths: number,
): void {
  if (!Number.isFinite(principal) || principal < 0) {
    throw new Error('Principal cannot be negative');
  }

  if (!Number.isFinite(annualRate) || annualRate < 0) {
    throw new Error('Interest rate cannot be negative');
  }

  if (!Number.isFinite(termMonths) || termMonths <= 0) {
    throw new Error('Loan term must be greater than 0');
  }
}

function createNormalizedUtcDate(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function getPaymentDate(startDate: Date, paymentOffset: number): Date {
  return new Date(
    Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth() + paymentOffset,
      1,
    ),
  );
}

function formatMonthYearLabel(date: Date): string {
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    year: 'numeric',
  });
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'long',
  });
}

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

export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
  startDate = new Date(),
): AmortizationScheduleRow[] {
  validateLoanInputs(principal, annualRate, termMonths);

  if (principal === 0) {
    return [];
  }

  const monthlyPayment = calculateStandardMonthlyPayment(
    principal,
    annualRate,
    termMonths / 12,
  );
  const monthlyRate = annualRate / 100 / 12;
  const normalizedStartDate = createNormalizedUtcDate(startDate);
  let remainingBalance = principal;

  return Array.from({ length: termMonths }, (_, index) => {
    const paymentNumber = index + 1;
    const paymentDate = getPaymentDate(normalizedStartDate, paymentNumber);
    const exactInterestPaid =
      monthlyRate === 0 ? 0 : remainingBalance * monthlyRate;
    const exactPrincipalPaid =
      paymentNumber === termMonths
        ? remainingBalance
        : Math.min(monthlyPayment - exactInterestPaid, remainingBalance);
    const exactPaymentAmount = exactInterestPaid + exactPrincipalPaid;

    remainingBalance = Math.max(remainingBalance - exactPrincipalPaid, 0);

    return {
      paymentNumber,
      paymentDate: formatMonthYearLabel(paymentDate),
      paymentMonthLabel: formatMonthLabel(paymentDate),
      paymentYear: paymentDate.getUTCFullYear(),
      paymentAmount: roundToCents(exactPaymentAmount),
      interestPaid: roundToCents(exactInterestPaid),
      principalPaid: roundToCents(exactPrincipalPaid),
      remainingBalance: roundToCents(remainingBalance),
    };
  });
}
