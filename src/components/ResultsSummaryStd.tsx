import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

interface ResultsSummaryProps {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  totalCost: number;
  termMonths: number;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
}

export default function ResultsSummary({
  monthlyPayment,
  totalPaid,
  totalInterest,
  totalCost,
  termMonths,
}: ResultsSummaryProps) {
  const principalPercent =
    totalCost > 0 ? Math.round((totalPaid / totalCost) * 100) : 0;
  const interestPercent = 100 - principalPercent;

  //Loan Repayment Date Calculations
  const today = new Date();
  const endDate = new Date(today);

  const targetMonth = endDate.getMonth() + termMonths;
  endDate.setMonth(targetMonth);

  // Check for month overflow
  if (endDate.getDate() !== today.getDate()) {
    endDate.setDate(0); // go to last day of previous month
  }

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
        Estimated Standard Payment
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

      <Divider sx={{ my: 3, borderColor: '#C7D2FE' }} />

      {/* Summary Stats */}
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
            Total loan amount paid
          </Typography>
          <Typography
            variant='h6'
            sx={{ fontWeight: 700, color: '#1A1A2E', fontSize: '1.15rem' }}
          >
            {formatCurrency(totalPaid)}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant='body2'
            sx={{ color: '#5A5A7A', fontWeight: 500, mb: 0.5 }}
          >
            Total cost of loan
          </Typography>
          <Typography
            variant='h6'
            sx={{ fontWeight: 700, color: '#1A1A2E', fontSize: '1.15rem' }}
          >
            {formatCurrency(totalCost)}
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
        <Box sx={{ mb: 3 }}>
          <Typography
            variant='body2'
            sx={{ color: '#5A5A7A', fontWeight: 500, mb: 0.5 }}
          >
            Total interest paid
          </Typography>
          <Typography
            variant='h6'
            sx={{ fontWeight: 700, color: '#FA4616', fontSize: '1.15rem' }}
          >
            {formatCurrency(totalInterest)}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant='body2'
            sx={{ color: '#5A5A7A', fontWeight: 500, mb: 0.5 }}
          >
            Full Repayment Date
          </Typography>
          <Typography
            variant='h6'
            sx={{ fontWeight: 700, color: '#1A1A2E', fontSize: '1.15rem' }}
          >
            {endDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Typography>
        </Box>
      </Box>

      {/* Visual Bar Chart */}
      <Box sx={{ mt: 'auto' }}>
        <Box
          sx={{
            display: 'flex',
            borderRadius: 2,
            overflow: 'hidden',
            height: 14,
            mb: 1.5,
          }}
        >
          <Box
            sx={{
              width: `${String(principalPercent)}%`,
              backgroundColor: '#0021A5',
              transition: 'width 0.5s ease',
            }}
          />
          <Box
            sx={{
              width: `${String(interestPercent)}%`,
              backgroundColor: '#FA4616',
              transition: 'width 0.5s ease',
            }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#0021A5',
              }}
            />
            <Typography
              variant='caption'
              sx={{ color: '#5A5A7A', fontWeight: 500 }}
            >
              Principal ({principalPercent}%)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#FA4616',
              }}
            />
            <Typography
              variant='caption'
              sx={{ color: '#5A5A7A', fontWeight: 500 }}
            >
              Interest ({interestPercent}%)
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
