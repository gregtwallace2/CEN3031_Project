import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import CalculateIcon from '@mui/icons-material/Calculate';

interface LoanDetailsFormProps {
  onCalculate: (data: {
    principal: number;
    interestRate: number;
    loanTerm: number;
    termUnit: 'months' | 'years';
    repaymentPlan: 'standard' | 'ibr' | 'icr' | 'paye';
    income?: number;
    familySize?: number;
  }) => void;
}

export default function LoanDetailsForm({ onCalculate }: LoanDetailsFormProps) {
  const [principal, setPrincipal] = useState('10000');
  const [interestRate, setInterestRate] = useState('5');
  const [loanTerm, setLoanTerm] = useState('10');
  const [termUnit, setTermUnit] = useState<'months' | 'years'>('years');
  const [repaymentPlan, setRepaymentPlan] = useState<
    'standard' | 'ibr' | 'icr' | 'paye'
  >('standard');
  const [income, setIncome] = useState('');
  const [familySize, setFamilySize] = useState('');

  const handleTermUnitChange = (
    _: React.MouseEvent<HTMLElement>,
    newUnit: 'months' | 'years' | null,
  ) => {
    if (newUnit !== null) {
      setTermUnit(newUnit);
    }
  };
  const handleRepaymentPlanChange = (
    _: React.MouseEvent<HTMLElement>,
    newPlan: 'standard' | 'ibr' | 'icr' | 'paye' | null,
  ) => {
    if (newPlan !== null) {
      setRepaymentPlan(newPlan);
    }
  };

  const [errors, setErrors] = useState<{
    principal?: string;
    interestRate?: string;
    loanTerm?: string;
    income?: string;
    familySize?: string;
  }>({});

  const handleCalculate = () => {
    const principalNum = parseFloat(principal.replace(/,/g, ''));
    const rateNum = parseFloat(interestRate);
    const termNum = parseFloat(loanTerm);
    const incomeNum = parseFloat(income.replace(/,/g, ''));
    const familySizeNum = parseFloat(familySize);

    const newErrors: typeof errors = {};

    if (isNaN(principalNum)) newErrors.principal = 'Principal is required';
    else if (principalNum === 0)
      newErrors.principal = 'Principal must be greater than 0';
    else if (principalNum > 10_000_000_000)
      newErrors.principal = 'Principal too large';

    if (isNaN(rateNum)) newErrors.interestRate = 'Interest rate is required';
    else if (rateNum > 100)
      newErrors.interestRate = 'Interest rate too large';

    let termValidationMonths = termNum;
    if (termUnit === 'years') termValidationMonths *= 12;

    if (isNaN(termValidationMonths))
      newErrors.loanTerm = 'Loan term is required';
    else if (termValidationMonths === 0)
      newErrors.loanTerm = 'Loan term must be greater than 0';
    else if (termValidationMonths > 600)
      newErrors.loanTerm = 'Loan term too large';

    if (repaymentPlan !== 'standard') {
      if (isNaN(incomeNum) || incomeNum === 0)
        newErrors.income = 'Income must be greater than 0';
      else if (incomeNum > 10_000_000_000)
        newErrors.income = 'Income too large';

      if (isNaN(familySizeNum) || familySizeNum < 1)
        newErrors.familySize = 'Family size must be at least 1';
      else if (familySizeNum > 50)
        newErrors.familySize = 'Family size too large';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    onCalculate({
      principal: principalNum,
      interestRate: rateNum,
      loanTerm: termNum,
      termUnit,
      repaymentPlan,
      income:
        repaymentPlan !== 'standard' && !isNaN(incomeNum)
          ? incomeNum
          : undefined,
      familySize:
        repaymentPlan !== 'standard' && !isNaN(familySizeNum)
          ? familySizeNum
          : undefined,
    });
  };

  const formatPrincipalInput = (value: string) => {
    const digits = value.replace(/[^0-9.]/g, '');
    const parts = digits.split('.');
    if (parts[0]) {
      parts[0] = Number(parts[0]).toLocaleString('en-US');
    }
    return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0] || '';
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
            setLoanTerm(e.target.value.replace(/[^0-9]/g, ''));
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
            setInterestRate(e.target.value.replace(/[^0-9.]/g, ''));
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
                const value = e.target.value.replace(/[^0-9,]/g, '');
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
                setFamilySize(e.target.value.replace(/[^0-9]/g, ''));
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
    </Box>
  );
}
