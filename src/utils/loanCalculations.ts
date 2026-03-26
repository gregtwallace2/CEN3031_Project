export function calculateStandardMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  if (years <= 0) {
    throw new Error('Loan term must be greater than 0')
  }

  if (principal < 0) {
    throw new Error('Principal cannot be negative')
  }

  if (annualRate < 0) {
    throw new Error('Interest rate cannot be negative')
  }

  const n = years * 12
  const r = annualRate / 100 / 12

  if (r === 0) {
    return principal / n
  }

  return (principal * r) / (1 - Math.pow(1 + r, -n))
}