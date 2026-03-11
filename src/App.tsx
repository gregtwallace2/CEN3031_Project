import { useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Header from './components/Header';
import LoanDetailsForm from './components/LoanDetailsForm';
import ResultsSummary from './components/ResultsSummary';

interface LoanResults {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  totalCost: number;
}

function calculateLoan(
  principal: number,
  annualRate: number,
  termMonths: number,
): LoanResults {
  if (annualRate === 0) {
    const monthlyPayment = principal / termMonths;
    return {
      monthlyPayment,
      totalPaid: principal,
      totalInterest: 0,
      totalCost: principal,
    };
  }

  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  const totalCost = monthlyPayment * termMonths;
  const totalInterest = totalCost - principal;

  return {
    monthlyPayment,
    totalPaid: principal,
    totalInterest,
    totalCost,
  };
}

function App() {
  const [results, setResults] = useState<LoanResults>(() =>
    calculateLoan(10000, 5, 10 * 12),
  );

  const handleCalculate = (data: {
    principal: number;
    interestRate: number;
    loanTerm: number;
    termUnit: 'months' | 'years';
  }) => {
    const termMonths =
      data.termUnit === 'years' ? data.loanTerm * 12 : data.loanTerm;
    setResults(calculateLoan(data.principal, data.interestRate, termMonths));
  };

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
        </Paper>
      </Container>
    </Box>
  );
}

export default App;
