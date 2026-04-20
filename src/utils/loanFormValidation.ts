export interface FormValues {
  principal: number;
  interestRate: number;
  loanTerm: number;
  termUnit: 'months' | 'years';
  repaymentPlan: 'standard' | 'ibr' | 'icr' | 'paye';
  income?: number;
  familySize?: number;
  compareToStandard?: boolean;
}

export interface FormValuesErrors {
  principal?: string;
  interestRate?: string;
  loanTerm?: string;
  // termUnit
  // repaymentPlan
  income?: string;
  familySize?: string;
  // compareToStandard
}

// individual value error checking
// DONT EXPORT THESE

const validatePrincipal = (principal: number | undefined) => {
  if (principal === undefined || Number.isNaN(principal)) {
    return 'Principal is required';
  }

  if (principal <= 0) {
    return 'Principal must be greater than 0';
  }

  if (principal > 10_000_000_000) {
    return 'Principal is too large';
  }

  return undefined;
};

const validateInterestRate = (interestRate: number | undefined) => {
  if (interestRate === undefined || Number.isNaN(interestRate)) {
    return 'Interest rate is required';
  }

  if (interestRate <= 0) {
    return 'Interest rate must be greater than 0';
  }

  if (interestRate >= 100) {
    return 'Interest rate must be less than 100';
  }

  return undefined;
};

const validateLoanTerm = (
  termUnitQuantity: number | undefined,
  termUnit: 'months' | 'years' | undefined,
) => {
  if (
    termUnitQuantity === undefined ||
    termUnit === undefined ||
    Number.isNaN(termUnitQuantity)
  ) {
    return 'Loan term is required';
  }

  if (termUnitQuantity <= 0) {
    return 'Loan term must be greater than 0';
  }

  const termMonths =
    termUnit === 'months' ? termUnitQuantity : termUnitQuantity * 12;

  if (termMonths > 600) {
    return 'Loan term must be 50 years (600 months) or less';
  }

  return undefined;
};

const validateIncome = (income: number | undefined) => {
  if (income === undefined || Number.isNaN(income)) {
    return 'Income is required';
  }

  if (income < 0) {
    return 'Income must be greater than or equal to 0';
  }

  if (income > 10_000_000_000) {
    return 'Income is too large';
  }

  return undefined;
};

const validateFamilySize = (familySize: number | undefined) => {
  if (familySize === undefined || Number.isNaN(familySize)) {
    return 'Family size is required';
  }

  if (familySize <= 0) {
    return 'Family size must be greater than 0';
  }

  if (familySize > 50) {
    return 'Family size is too large';
  }

  return undefined;
};

// validateFormValues returns an error object containing errors (if any) for
// all form values
export const validateFormValues = (
  formValues: FormValues,
): FormValuesErrors => {
  const newErrors: FormValuesErrors = {};

  // principal
  newErrors.principal = validatePrincipal(formValues.principal);

  // interestRate
  newErrors.interestRate = validateInterestRate(formValues.interestRate);

  // loanTerm
  newErrors.loanTerm = validateLoanTerm(
    formValues.loanTerm,
    formValues.termUnit,
  );

  // idr plan -- optional values
  if (formValues.repaymentPlan !== 'standard') {
    // income
    newErrors.income = validateIncome(formValues.income);

    // familySize
    newErrors.familySize = validateFamilySize(formValues.familySize);
  }

  // any errors?
  const errCount = Object.values(newErrors).filter(
    (val) => typeof val !== 'undefined',
  ).length;

  if (errCount !== 0) {
    return newErrors;
  }

  // none
  return {};
};

// for unit tests only
export const DO_NOT_USE_exportForTestsOnly = {
  validatePrincipal,
  validateInterestRate,
  validateLoanTerm,
  validateIncome,
  validateFamilySize,
};
