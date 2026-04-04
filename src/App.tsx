import { useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Header from './components/Header';
import LoanDetailsForm from './components/LoanDetailsForm';
import ResultsSummary from './components/ResultsSummary';
import AmortizationTable from './components/AmortizationTable';
import {
  calculateStandardMonthlyPayment,
  generateAmortizationSchedule,
  type AmortizationScheduleRow,
} from './utils/loanCalculations';

interface LoanResults {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  totalCost: number;
  amortizationSchedule: AmortizationScheduleRow[];
}

interface LoanCalculationInputs {
  principal: number;
  interestRate: number;
  loanTerm: number;
  termUnit: 'months' | 'years';
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

function calculateLoanResults(
  principal: number,
  annualRate: number,
  termMonths: number,
  startMonth: string,
): LoanResults {
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
    calculateStandardMonthlyPayment(principal, annualRate, termMonths);

  return {
    monthlyPayment,
    totalPaid: principal,
    totalInterest,
    totalCost,
    amortizationSchedule,
  };
}

function App() {
  const [loanInputs, setLoanInputs] = useState<LoanCalculationInputs>({
    principal: 10000,
    interestRate: 5,
    loanTerm: 10,
    termUnit: 'years',
  });
  const [startMonth, setStartMonth] = useState(getCurrentMonthValue);

  const handleCalculate = (data: {
    principal: number;
    interestRate: number;
    loanTerm: number;
    termUnit: 'months' | 'years';
  }) => {
    setLoanInputs({
      principal: data.principal,
      interestRate: data.interestRate,
      loanTerm: data.loanTerm,
      termUnit: data.termUnit,
    });
  };

  const termMonths =
    loanInputs.termUnit === 'years'
      ? loanInputs.loanTerm * 12
      : loanInputs.loanTerm;
  const results = calculateLoanResults(
    loanInputs.principal,
    loanInputs.interestRate,
    termMonths,
    startMonth,
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
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
            {/* Left: Form */}
            <Box
              sx={{
                p: { xs: 3, sm: 4 },
                borderRight: { md: '1px solid #E2E8F0' },
                borderBottom: { xs: '1px solid #E2E8F0', md: 'none' },
              }}
            >
              <LoanDetailsForm onCalculate={handleCalculate} />
            </Box>

            {/* Right: Results */}
            <Box sx={{ p: { xs: 3, sm: 4 } }}>
              <ResultsSummary
                monthlyPayment={results.monthlyPayment}
                totalPaid={results.totalPaid}
                totalInterest={results.totalInterest}
                totalCost={results.totalCost}
              />
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
