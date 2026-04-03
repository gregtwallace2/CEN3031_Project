import { useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Header from './components/Header';
import LoanDetailsForm from './components/LoanDetailsForm';
import ResultsSummaryStd from './components/ResultsSummaryStd';
import ResultsSummaryIDR from './components/ResultsSummaryIDR';
import {
  calculateStandardMonthlyPayment,
  calculateIBR10MonthlyPayment,
  calculateICRMonthlyPayment,
  calculatePAYEMonthlyPayment,
} from './utils/loanCalculations';

interface LoanResults {
  repaymentPlan: 'standard' | 'ibr' | 'icr' | 'paye';

  // standard
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  totalCost: number;

  // idr
  idrPayment: number;
}

function App() {
  const defaultMonthly = calculateStandardMonthlyPayment(10000, 5, 10);
  const defaultIDR = 0;

  const [results, setResults] = useState<LoanResults>({
    repaymentPlan: 'standard',

    monthlyPayment: defaultMonthly,
    totalPaid: 10000,
    totalInterest: defaultMonthly * 120 - 10000,
    totalCost: defaultMonthly * 120,

    idrPayment: defaultIDR,
  });

  const handleCalculate = (data: {
    principal: number;
    interestRate: number;
    loanTerm: number;
    termUnit: 'months' | 'years';
    repaymentPlan: 'standard' | 'ibr' | 'icr' | 'paye';
    income?: number;
    familySize?: number;
  }) => {
    const termMonths =
      data.termUnit === 'years' ? data.loanTerm * 12 : data.loanTerm;
    const monthlyPayment = calculateStandardMonthlyPayment(
      data.principal,
      data.interestRate,
      termMonths / 12,
    );

    let IDRPayment = 0;
    if (data.repaymentPlan !== 'standard') {
      if (!data.income)
        throw new Error('Income is missing for idr calculation');
      if (!data.familySize)
        throw new Error('Family size is missing for idr calculation');

      if (data.repaymentPlan === 'ibr') {
        IDRPayment = calculateIBR10MonthlyPayment(
          data.principal,
          data.interestRate,
          data.income,
          data.familySize,
        );
      } else if (data.repaymentPlan === 'icr') {
        IDRPayment = calculateICRMonthlyPayment(
          data.principal,
          data.interestRate,
          data.income,
          data.familySize,
        );
      } else {
        // paye
        IDRPayment = calculatePAYEMonthlyPayment(
          data.principal,
          data.interestRate,
          data.income,
          data.familySize,
        );
      }
    }

    const totalCost = monthlyPayment * termMonths;
    const totalInterest = totalCost - data.principal;

    setResults({
      repaymentPlan: data.repaymentPlan,

      monthlyPayment,
      totalPaid: data.principal,
      totalInterest,
      totalCost,

      idrPayment: IDRPayment,
    });
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
        </Paper>
      </Container>
    </Box>
  );
}

export default App;
