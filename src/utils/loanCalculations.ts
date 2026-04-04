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
  const paymentDate = new Date(
    Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth() + paymentOffset,
      1,
    ),
  );

  return paymentDate;
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
  termMonths: number,
): number {
  validateLoanInputs(principal, annualRate, termMonths);

  if (principal === 0) {
    return 0;
  }

  if (annualRate === 0) {
    return principal / termMonths;
  }

  const monthlyRate = annualRate / 100 / 12;

  return (
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
    (Math.pow(1 + monthlyRate, termMonths) - 1)
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
    termMonths,
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
