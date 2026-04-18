import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
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
  // Forgiveness Eligibility (including PSLF) Calculations
  let forgivenessTermYears = 25;
  const forgivenessTermYearsPSLF = 10;
  if (repaymentPlan === 'ibr') {
    forgivenessTermYears = 20;
  }

  const forgivenessDate = new Date();
  forgivenessDate.setDate(1);
  const forgivenessPSLFDate = new Date(forgivenessDate);
  forgivenessDate.setMonth(
    forgivenessDate.getMonth() + forgivenessTermYears * 12,
  );
  forgivenessPSLFDate.setMonth(
    forgivenessPSLFDate.getMonth() + forgivenessTermYearsPSLF * 12,
  );

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

      {/* Forgiveness */}
      <Divider sx={{ my: 3, borderColor: '#C7D2FE' }} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 3,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant='body2'
            sx={{ color: '#5A5A7A', fontWeight: 500, mb: 0.5 }}
          >
            Estimated eligibility for forgiveness
          </Typography>
          <Typography
            variant='h6'
            sx={{ fontWeight: 700, color: '#1A1A2E', fontSize: '1.15rem' }}
          >
            {forgivenessDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant='body2'
            sx={{ color: '#5A5A7A', fontWeight: 500, mb: 0.5 }}
          >
            Total paid before forgiveness
          </Typography>
          <Typography
            variant='h6'
            sx={{ fontWeight: 700, color: '#1A1A2E', fontSize: '1.15rem' }}
          >
            {formatCurrency(monthlyPayment * forgivenessTermYears * 12)}
          </Typography>
        </Box>
      </Box>

            <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 3,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant='body2'
            sx={{ color: '#5A5A7A', fontWeight: 500, mb: 0.5 }}
          >
            Estimated eligibility for PSLF forgiveness
          </Typography>
          <Typography
            variant='h6'
            sx={{ fontWeight: 700, color: '#1A1A2E', fontSize: '1.15rem' }}
          >
            {forgivenessPSLFDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant='body2'
            sx={{ color: '#5A5A7A', fontWeight: 500, mb: 0.5 }}
          >
            Total paid before PSLF forgiveness
          </Typography>
          <Typography
            variant='h6'
            sx={{ fontWeight: 700, color: '#1A1A2E', fontSize: '1.15rem' }}
          >
            {formatCurrency(monthlyPayment * forgivenessTermYearsPSLF * 12)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
