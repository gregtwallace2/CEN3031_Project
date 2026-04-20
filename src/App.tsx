import { useCallback, useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Header from './components/Header';
import LoanDetailsForm from './components/LoanDetailsForm';
import { type FormValues } from './utils/loanFormValidation';
import ResultsSummaryStd from './components/ResultsSummaryStd';
import ResultsSummaryIDR from './components/ResultsSummaryIDR';
import AmortizationTable from './components/AmortizationTable';
import LoginPage from './components/LoginPage';
import SaveScenarioDialog from './components/SaveScenarioDialog';
import AccountPage from './components/AccountPage';
import { useAuth } from './auth/AuthContext';
import {
  calculateStandardMonthlyPayment,
  calculateIBR10MonthlyPayment,
  calculateICRMonthlyPayment,
  calculatePAYEMonthlyPayment,
  generateAmortizationSchedule,
  type AmortizationScheduleRow,
} from './utils/loanCalculations';
import { fetchScenarios, saveScenario, type Scenario } from './lib/scenarios';

interface LoanResults {
  repaymentPlan: 'standard' | 'ibr' | 'icr' | 'paye';
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  totalCost: number;
  amortizationSchedule: AmortizationScheduleRow[];
  idrPayment: number;

  // comparison checkbox
  compareToStandard: boolean;
  standardMonthlyPayment: number;
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

type AppView = 'calculator' | 'login' | 'account';

function App() {
  const { user } = useAuth();

  const [view, setView] = useState<AppView>('calculator');
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
  const [compareToStandard, setCompareToStandard] = useState(false);

  // Scenario state
  const [savedScenarios, setSavedScenarios] = useState<Scenario[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<FormValues | null>(
    null,
  );
  // When non-null, the form resets to these values (scenario load)
  const [formDefaults, setFormDefaults] = useState<FormValues | undefined>(
    undefined,
  );

  // Auto-dismiss the login view once the user is authenticated; restore
  // calculator view and clear cached scenarios when the user signs out.
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with external auth state
      setView((v) => (v === 'login' ? 'calculator' : v));
    } else {
      setView((v) => (v === 'account' ? 'calculator' : v));
      setSavedScenarios([]);
    }
  }, [user]);

  // Fetch scenarios whenever the user changes.
  useEffect(() => {
    if (!user) return;
    void fetchScenarios().then(({ data }) => {
      if (data) setSavedScenarios(data);
    });
  }, [user]);

  const handleCalculate = useCallback((data: FormValues) => {
    let nextIDRPayment = 0;

    if (data.repaymentPlan !== 'standard') {
      if (data.income === undefined) {
        throw new Error('Income is missing for idr calculation');
      }
      if (data.familySize === undefined) {
        throw new Error('Family size is missing for idr calculation');
      }

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
    setCompareToStandard(data.compareToStandard ?? false);
  }, []);

  // Called by LoanDetailsForm when user clicks Save.
  const handleSaveRequest = (data: FormValues) => {
    setPendingFormValues(data);
    setShowSaveDialog(true);
  };

  // Called by SaveScenarioDialog with the user-entered name.
  const handleConfirmSave = async (name: string) => {
    if (!pendingFormValues) return;

    const { data, error } = await saveScenario({
      name,
      principal: pendingFormValues.principal,
      interest_rate: pendingFormValues.interestRate,
      loan_term: pendingFormValues.loanTerm,
      term_unit: pendingFormValues.termUnit,
      repayment_plan: pendingFormValues.repaymentPlan,
      income: pendingFormValues.income ?? null,
      family_size: pendingFormValues.familySize ?? null,
    });

    if (error) throw error;
    if (data) {
      setSavedScenarios((prev) => [data, ...prev]);
    }
    setPendingFormValues(null);
  };

  // Load a scenario into the form + recalculate.
  const handleLoadScenario = (scenario: Scenario) => {
    const formValues: FormValues = {
      principal: scenario.principal,
      interestRate: scenario.interest_rate,
      loanTerm: scenario.loan_term,
      termUnit: scenario.term_unit,
      repaymentPlan: scenario.repayment_plan,
      income: scenario.income ?? undefined,
      familySize: scenario.family_size ?? undefined,
    };
    // Provide a new object reference each time so the useEffect in LoanDetailsForm fires.
    setFormDefaults({ ...formValues });
    setView('calculator');
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
    compareToStandard,
    standardMonthlyPayment: standardResults.monthlyPayment,
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      <Header
        onSignInClick={() => {
          setView('login');
        }}
        onAccountClick={() => {
          setView('account');
        }}
        savedScenarios={savedScenarios}
        onLoadScenario={handleLoadScenario}
      />

      {view === 'login' && (
        <LoginPage
          onClose={() => {
            setView('calculator');
          }}
        />
      )}

      {view === 'account' && (
        <AccountPage
          scenarios={savedScenarios}
          onBack={() => {
            setView('calculator');
          }}
          onLoad={(scenario) => {
            handleLoadScenario(scenario);
          }}
          onScenariosChange={setSavedScenarios}
        />
      )}

      {view === 'calculator' && (
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
                <LoanDetailsForm
                  onCalculate={handleCalculate}
                  onSaveRequest={handleSaveRequest}
                  defaultValues={formDefaults}
                  isLoggedIn={!!user}
                />
              </Box>

              <Box sx={{ p: { xs: 3, sm: 4 } }}>
                {(results.repaymentPlan === 'standard' ||
                  results.compareToStandard) && (
                  <ResultsSummaryStd
                    monthlyPayment={results.monthlyPayment}
                    totalPaid={results.totalPaid}
                    totalInterest={results.totalInterest}
                    totalCost={results.totalCost}
                    termMonths={termMonths}
                  />
                )}

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
      )}

      <SaveScenarioDialog
        open={showSaveDialog}
        onClose={() => {
          setShowSaveDialog(false);
          setPendingFormValues(null);
        }}
        onSave={handleConfirmSave}
      />
    </Box>
  );
}

export default App;
