import { useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Header from './components/Header';
import LoanDetailsForm from './components/LoanDetailsForm';
import ResultsSummaryStd from './components/ResultsSummaryStd';
import ResultsSummaryIDR from './components/ResultsSummaryIDR';
import AmortizationTable from './components/AmortizationTable';
import {
  calculateStandardMonthlyPayment,
  calculateIBR10MonthlyPayment,
  calculateICRMonthlyPayment,
  calculatePAYEMonthlyPayment,
  generateAmortizationSchedule,
  type AmortizationScheduleRow,
} from './utils/loanCalculations';

interface LoanResults {
  repaymentPlan: 'standard' | 'ibr' | 'icr' | 'paye';
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  totalCost: number;
  amortizationSchedule: AmortizationScheduleRow[];
  idrPayment: number;
}

interface LoanCalculationInputs {
  principal: number;
  interestRate: number;
  loanTerm: number;
  termUnit: 'months' | 'years';
}

interface StandardLoanResults {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  totalCost: number;
  amortizationSchedule: AmortizationScheduleRow[];
}

function getCurrentMonthValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  return `${String(year)}-${month}`;
}

function parseStartMonth(startMonth: string): Date {
  const [year, month] = startMonth.split('-').map(Number);

  if (!year || !month) {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }

  return new Date(Date.UTC(year, month - 1, 1));
}

function calculateStandardLoanResults(
  principal: number,
  annualRate: number,
  termMonths: number,
  startMonth: string,
): StandardLoanResults {
  const amortizationSchedule = generateAmortizationSchedule(
    principal,
    annualRate,
    termMonths,
    parseStartMonth(startMonth),
  );
  const totalCost = amortizationSchedule.reduce(
    (sum, row) => sum + row.paymentAmount,
    0,
  );
  const totalInterest = amortizationSchedule.reduce(
    (sum, row) => sum + row.interestPaid,
    0,
  );
  const monthlyPayment =
    amortizationSchedule[0]?.paymentAmount ??
    calculateStandardMonthlyPayment(principal, annualRate, termMonths / 12);

  return {
    monthlyPayment,
    totalPaid: principal,
    totalInterest,
    totalCost,
    amortizationSchedule,
  };
}

function App() {
  const [startMonth, setStartMonth] = useState(getCurrentMonthValue);
  const [loanInputs, setLoanInputs] = useState<LoanCalculationInputs>({
    principal: 10000,
    interestRate: 5,
    loanTerm: 10,
    termUnit: 'years',
  });
  const [repaymentPlan, setRepaymentPlan] =
    useState<LoanResults['repaymentPlan']>('standard');
  const [idrPayment, setIdrPayment] = useState(0);

  const handleCalculate = (data: {
    principal: number;
    interestRate: number;
    loanTerm: number;
    termUnit: 'months' | 'years';
    repaymentPlan: 'standard' | 'ibr' | 'icr' | 'paye';
    income?: number;
    familySize?: number;
  }) => {
    let nextIDRPayment = 0;
    if (data.repaymentPlan !== 'standard') {
      if (!data.income)
        throw new Error('Income is missing for idr calculation');
      if (!data.familySize)
        throw new Error('Family size is missing for idr calculation');

      if (data.repaymentPlan === 'ibr') {
        nextIDRPayment = calculateIBR10MonthlyPayment(
          data.principal,
          data.interestRate,
          data.income,
          data.familySize,
        );
      } else if (data.repaymentPlan === 'icr') {
        nextIDRPayment = calculateICRMonthlyPayment(
          data.principal,
          data.interestRate,
          data.income,
          data.familySize,
        );
      } else {
        nextIDRPayment = calculatePAYEMonthlyPayment(
          data.principal,
          data.interestRate,
          data.income,
          data.familySize,
        );
      }
    }

    setLoanInputs({
      principal: data.principal,
      interestRate: data.interestRate,
      loanTerm: data.loanTerm,
      termUnit: data.termUnit,
    });
    setRepaymentPlan(data.repaymentPlan);
    setIdrPayment(nextIDRPayment);
  };

  const termMonths =
    loanInputs.termUnit === 'years'
      ? loanInputs.loanTerm * 12
      : loanInputs.loanTerm;
  const standardResults = calculateStandardLoanResults(
    loanInputs.principal,
    loanInputs.interestRate,
    termMonths,
    startMonth,
  );
  const results: LoanResults = {
    repaymentPlan,
    monthlyPayment: standardResults.monthlyPayment,
    totalPaid: standardResults.totalPaid,
    totalInterest: standardResults.totalInterest,
    totalCost: standardResults.totalCost,
    amortizationSchedule: standardResults.amortizationSchedule,
    idrPayment,
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      <Header />

      <Container maxWidth='lg' sx={{ py: { xs: 3, sm: 5 } }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid #E2E8F0',
            borderTop: '4px solid #0021A5',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
              minHeight: 480,
            }}
          >
            <Box
              sx={{
                p: { xs: 3, sm: 4 },
                borderRight: { md: '1px solid #E2E8F0' },
                borderBottom: { xs: '1px solid #E2E8F0', md: 'none' },
              }}
            >
              <LoanDetailsForm onCalculate={handleCalculate} />
            </Box>

            <Box sx={{ p: { xs: 3, sm: 4 } }}>
              <ResultsSummaryStd
                monthlyPayment={results.monthlyPayment}
                totalPaid={results.totalPaid}
                totalInterest={results.totalInterest}
                totalCost={results.totalCost}
              />

              {results.repaymentPlan !== 'standard' && (
                <ResultsSummaryIDR
                  repaymentPlan={results.repaymentPlan}
                  monthlyPayment={results.idrPayment}
                />
              )}
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#E2E8F0' }} />

          <Box sx={{ p: { xs: 3, sm: 4 } }}>
            <AmortizationTable
              onStartMonthChange={setStartMonth}
              rows={results.amortizationSchedule}
              startMonth={startMonth}
            />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default App;
