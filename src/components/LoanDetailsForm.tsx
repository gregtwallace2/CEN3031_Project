import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import CalculateIcon from '@mui/icons-material/Calculate';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import type { FormValues, FormValuesErrors } from '@/utils/loanFormValidation';
import { validateFormValues } from '@/utils/loanFormValidation';

interface LoanDetailsFormProps {
  onCalculate: (data: FormValues) => void;
  /** Called when the user clicks Save. The current form values are passed in. */
  onSaveRequest?: (data: FormValues) => void;
  /** When provided, the form resets to these values (used for scenario loading). */
  defaultValues?: FormValues;
  isLoggedIn?: boolean;
}

function formatPrincipalInput(value: string): string {
  const digits = value.replaceAll(/[^0-9.]/g, '');
  const parts = digits.split('.');
  if (parts[0]) {
    parts[0] = Number(parts[0]).toLocaleString('en-US');
  }
  return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0] || '';
}

export default function LoanDetailsForm({
  onCalculate,
  onSaveRequest,
  defaultValues,
  isLoggedIn = false,
}: Readonly<LoanDetailsFormProps>) {
  const [principal, setPrincipal] = useState('10,000');
  const [interestRate, setInterestRate] = useState('5');
  const [loanTerm, setLoanTerm] = useState('10');
  const [termUnit, setTermUnit] = useState<'months' | 'years'>('years');
  const [repaymentPlan, setRepaymentPlan] = useState<
    'standard' | 'ibr' | 'icr' | 'paye'
  >('standard');
  const [income, setIncome] = useState('');
  const [familySize, setFamilySize] = useState('');
  const [compareToStandard, setCompareToStandard] = useState(false);

  const [errors, setErrors] = useState<FormValuesErrors>({});

  // Track the last loaded defaultValues token so we don't re-apply on re-renders.
  const lastLoadedRef = useRef<FormValues | undefined>(undefined);

  useEffect(() => {
    if (!defaultValues || defaultValues === lastLoadedRef.current) return;
    lastLoadedRef.current = defaultValues;

    /* eslint-disable react-hooks/set-state-in-effect --
       Syncing internal form fields with externally-provided default values
       when a scenario is loaded from outside the component. */
    setPrincipal(formatPrincipalInput(String(defaultValues.principal)));
    setInterestRate(String(defaultValues.interestRate));
    setLoanTerm(String(defaultValues.loanTerm));
    setTermUnit(defaultValues.termUnit);
    setRepaymentPlan(defaultValues.repaymentPlan);
    setIncome(defaultValues.income ? String(defaultValues.income) : '');
    setFamilySize(defaultValues.familySize ? String(defaultValues.familySize) : '');
    setErrors({});
    /* eslint-enable react-hooks/set-state-in-effect */

    // Trigger calculation automatically when a scenario is loaded.
    onCalculate(defaultValues);
  }, [defaultValues, onCalculate]);

  const handleTermUnitChange = (
    _: React.MouseEvent<HTMLElement>,
    newUnit: 'months' | 'years' | null,
  ) => {
    if (newUnit) {
      setTermUnit(newUnit);
    }
  };

  const handleRepaymentPlanChange = (
  _: React.MouseEvent<HTMLElement>,
  newPlan: 'standard' | 'ibr' | 'icr' | 'paye' | null,
) => {
  if (newPlan) {
    setRepaymentPlan(newPlan);
    if (newPlan === 'standard') {
      setCompareToStandard(false);
    }
  }
};

  const buildFormValues = (): FormValues | null => {
    // build values
    const principalNum = Number.parseFloat(principal.replaceAll(',', ''));
    const rateNum = Number.parseFloat(interestRate);
    const termNum = Number.parseFloat(loanTerm);
    const incomeNum = Number.parseFloat(income.replaceAll(',', ''));
    const familySizeNum = Number.parseFloat(familySize);

    const values = {
      principal: principalNum,
      interestRate: rateNum,
      loanTerm: termNum,
      termUnit,
      repaymentPlan,
      income:
        repaymentPlan !== 'standard' && !Number.isNaN(incomeNum) ? incomeNum : undefined,
      familySize:
        repaymentPlan !== 'standard' && !Number.isNaN(familySizeNum)
          ? familySizeNum
          : undefined,
      compareToStandard,
    };

    // validate
    const newErrors = validateFormValues(values);

    // error(s)
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return null;
    }

    // ok
    setErrors({});
    return values;
  };

  const handleCalculate = () => {
    const values = buildFormValues();
    if (values) onCalculate(values);
  };

  const handleSave = () => {
    const values = buildFormValues();
    if (values && onSaveRequest) onSaveRequest(values);
  };

  const handlePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrincipal(formatPrincipalInput(e.target.value));
  };

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          color: 'text.primary',
          fontSize: '1.1rem',
          fontWeight: 700,
        }}
      >
        Loan Details
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="body2"
          sx={{ mb: 0.75, fontWeight: 600, color: 'text.primary' }}
        >
          Loan amount
        </Typography>
        <TextField
          fullWidth
          value={principal}
          onChange={handlePrincipalChange}
          placeholder="10,000"
          error={!!errors.principal}
          helperText={errors.principal}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ color: '#5A5A7A', fontWeight: 600 }}>
                    $
                  </Typography>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '1.05rem',
            },
          }}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="body2"
          sx={{ mb: 0.75, fontWeight: 600, color: 'text.primary' }}
        >
          Loan term
        </Typography>
        <TextField
          fullWidth
          value={loanTerm}
          onChange={(e) => {
            setLoanTerm(e.target.value.replaceAll(/\D/g, ''));
          }}
          placeholder="10"
          error={!!errors.loanTerm}
          helperText={errors.loanTerm}
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              fontSize: '1.05rem',
            },
          }}
        />
        <ToggleButtonGroup
          value={termUnit}
          exclusive
          onChange={handleTermUnitChange}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              px: 2.5,
              py: 0.75,
              borderRadius: '20px !important',
              border: '1.5px solid #D0D5DD !important',
              color: '#5A5A7A',
              '&.Mui-selected': {
                backgroundColor: '#0021A5',
                color: '#FFFFFF',
                borderColor: '#0021A5 !important',
                '&:hover': {
                  backgroundColor: '#001573',
                },
              },
              '&:hover': {
                backgroundColor: '#F0F2F5',
              },
            },
            gap: 1,
          }}
        >
          <ToggleButton value="months">Months</ToggleButton>
          <ToggleButton value="years">Years</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="body2"
          sx={{ mb: 0.75, fontWeight: 600, color: 'text.primary' }}
        >
          Repayment plan
        </Typography>
        <ToggleButtonGroup
          value={repaymentPlan}
          exclusive
          onChange={handleRepaymentPlanChange}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              px: 2.5,
              py: 0.75,
              borderRadius: '20px !important',
              border: '1.5px solid #D0D5DD !important',
              color: '#5A5A7A',
              '&.Mui-selected': {
                backgroundColor: '#0021A5',
                color: '#FFFFFF',
                borderColor: '#0021A5 !important',
                '&:hover': {
                  backgroundColor: '#001573',
                },
              },
              '&:hover': {
                backgroundColor: '#F0F2F5',
              },
            },
            gap: 1,
          }}
        >
          <ToggleButton value="standard">Standard</ToggleButton>
          <ToggleButton value="ibr">IBR</ToggleButton>
          <ToggleButton value="icr">ICR</ToggleButton>
          <ToggleButton value="paye">PAYE</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {/* Compare to Standard Checkbox */}
      {repaymentPlan !== 'standard' && (
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={compareToStandard}
              onChange={(e) => {
                setCompareToStandard(e.target.checked);
              }}
              sx={{
                color: '#0021A5',
                '&.Mui-checked': {
                  color: '#0021A5',
                },
              }}
            />
          }
          label="Compare income plan to standard"
          sx={{
              ml: 0,
              '& .MuiFormControlLabel-label': {
                fontWeight: 600,
                color: '#1A1A2E',
                fontSize: '0.95rem',
              },
            }}
          />
        </Box>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="body2"
          sx={{ mb: 0.75, fontWeight: 600, color: 'text.primary' }}
        >
          Interest rate
        </Typography>
        <TextField
          fullWidth
          value={interestRate}
          onChange={(e) => {
            setInterestRate(e.target.value.replaceAll(/[^0-9.]/g, ''));
          }}
          placeholder="5.0"
          error={!!errors.interestRate}
          helperText={errors.interestRate}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Typography sx={{ color: '#5A5A7A', fontWeight: 600 }}>
                    %
                  </Typography>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '1.05rem',
            },
          }}
        />
      </Box>
    


      {repaymentPlan !== 'standard' && (
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 3 }}>
        <Typography
          variant="body2"
          sx={{ mb: 0.75, fontWeight: 600, color: 'text.primary' }}
        >
          Annual income
        </Typography>
        <TextField
          fullWidth
          value={income}
          onChange={(e) => {
            const value = e.target.value.replaceAll(/[^0-9,]/g, '');
            setIncome(value);
          }}
          placeholder="50000"
          error={!!errors.income}
          helperText={errors.income}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ color: '#5A5A7A', fontWeight: 600 }}>
                    $
                  </Typography>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '1.05rem',
            },
          }}
        />
      </Box>
      
      {/* Family Size */}
      <Box>
        <Typography
          variant="body2"
          sx={{ mb: 0.75, fontWeight: 600, color: 'text.primary' }}
        >
          Family size
        </Typography>
        <TextField
          fullWidth
          value={familySize}
          onChange={(e) => {
            setFamilySize(e.target.value.replaceAll(/\D/g, ''));
          }}
          placeholder="1"
          error={!!errors.familySize}
          helperText={errors.familySize}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '1.05rem',
            },
          }}
        />
      </Box>
    </Box>
  )}
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleCalculate}
          startIcon={<CalculateIcon />}
          sx={{
            py: 1.5,
            fontSize: '1.05rem',
            fontWeight: 700,
            borderRadius: '10px',
            boxShadow: '0 4px 14px rgba(0, 33, 165, 0.3)',
            background: 'linear-gradient(135deg, #0021A5 0%, #0033CC 100%)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(0, 33, 165, 0.4)',
              background: 'linear-gradient(135deg, #001573 0%, #0021A5 100%)',
            },
          }}
        >
          Calculate
        </Button>

        {isLoggedIn && onSaveRequest && (
          <Button
            variant="outlined"
            size="large"
            onClick={handleSave}
            startIcon={<BookmarkIcon />}
            aria-label="Save scenario"
            sx={{
              py: 1.5,
              px: 2.5,
              fontWeight: 700,
              borderRadius: '10px',
              borderColor: '#0021A5',
              color: '#0021A5',
              whiteSpace: 'nowrap',
              '&:hover': {
                backgroundColor: '#EEF2FF',
                borderColor: '#001573',
              },
            }}
          >
            Save
          </Button>
        )}
      </Box>
    </Box>
  );
}
