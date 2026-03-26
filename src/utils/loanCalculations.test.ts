import { describe, expect, it } from 'vitest'
import { calculateStandardMonthlyPayment } from './loanCalculations'

describe('calculateStandardMonthlyPayment', () => {
  it('calculates the standard monthly payment for a typical loan', () => {
    const result = calculateStandardMonthlyPayment(10000, 5, 10)
    expect(result).toBeCloseTo(106.07, 2)
  })

  it('calculates correctly when interest rate is zero', () => {
    const result = calculateStandardMonthlyPayment(12000, 0, 10)
    expect(result).toBeCloseTo(100, 2)
  })

  it('throws an error when years is 0', () => {
    expect(() => calculateStandardMonthlyPayment(10000, 5, 0)).toThrow(
      'Loan term must be greater than 0'
    )
  })

  it('throws an error when principal is negative', () => {
    expect(() => calculateStandardMonthlyPayment(-10000, 5, 10)).toThrow(
      'Principal cannot be negative'
    )
  })

  it('throws an error when annual rate is negative', () => {
    expect(() => calculateStandardMonthlyPayment(10000, -5, 10)).toThrow(
      'Interest rate cannot be negative'
    )
  })
})