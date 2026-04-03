import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface ResultsSummaryProps {
  repaymentPlan: 'ibr' | 'icr' | 'paye';
  monthlyPayment: number;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
}

export default function ResultsSummary({
  repaymentPlan,
  monthlyPayment,
}: ResultsSummaryProps) {
  return (
    <Box
      sx={{
        backgroundColor: '#EEF2FF',
        borderRadius: 3,
        p: { xs: 3, sm: 4 },

        display: 'flex',
        flexDirection: 'column',

        mb: 1,
      }}
    >
      {/* Monthly Payment */}
      <Typography
        variant='subtitle2'
        sx={{
          fontWeight: 700,
          color: '#1A1A2E',
          fontSize: '0.95rem',
          mb: 1,
        }}
      >
        Estimated {repaymentPlan.toUpperCase()} Payment
      </Typography>
      <Typography
        variant='h3'
        sx={{
          fontWeight: 800,
          color: '#0021A5',
          fontSize: { xs: '2.2rem', sm: '2.8rem' },
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}
      >
        {formatCurrency(monthlyPayment)}
      </Typography>

      {/* TODO: Forgiveness and Other Stats */}
    </Box>
  );
}
