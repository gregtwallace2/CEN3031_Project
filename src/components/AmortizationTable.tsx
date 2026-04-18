import { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import type { SyntheticEvent } from 'react';
import type { AmortizationScheduleRow } from '../utils/loanCalculations';

interface AmortizationTableProps {
  onStartMonthChange: (startMonth: string) => void;
  rows: AmortizationScheduleRow[];
  startMonth: string;
}

interface YearlyScheduleGroup {
  year: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
  rows: AmortizationScheduleRow[];
}

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
}

function groupRowsByYear(rows: AmortizationScheduleRow[]): YearlyScheduleGroup[] {
  const groups = new Map<number, YearlyScheduleGroup>();

  rows.forEach((row) => {
    const existingGroup = groups.get(row.paymentYear);

    if (existingGroup) {
      existingGroup.rows.push(row);
      existingGroup.principalPaid += row.principalPaid;
      existingGroup.interestPaid += row.interestPaid;
      existingGroup.remainingBalance = row.remainingBalance;
      return;
    }

    groups.set(row.paymentYear, {
      year: row.paymentYear,
      principalPaid: row.principalPaid,
      interestPaid: row.interestPaid,
      remainingBalance: row.remainingBalance,
      rows: [row],
    });
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    principalPaid: Math.round(group.principalPaid * 100) / 100,
    interestPaid: Math.round(group.interestPaid * 100) / 100,
  }));
}

export default function AmortizationTable({
  onStartMonthChange,
  rows,
  startMonth,
}: AmortizationTableProps) {
  const yearlyGroups = groupRowsByYear(rows);
  const [expandAll, setExpandAll] = useState(false);
  const [expandedYears, setExpandedYears] = useState<number[]>(() => {
    const firstYear = rows[0]?.paymentYear;
    return firstYear ? [firstYear] : [];
  });

  const lastPaymentLabel = rows.at(-1)?.paymentDate ?? 'Not available';

  const handleAccordionChange =
    (year: number) => (_event: SyntheticEvent, expanded: boolean) => {
      setExpandedYears((currentYears) => {
        if (expanded) {
          return currentYears.includes(year)
            ? currentYears
            : [...currentYears, year];
        }

        return currentYears.filter((currentYear) => currentYear !== year);
      });
    };

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          color: 'text.primary',
          fontSize: { xs: '2.1rem', sm: '2.6rem' },
          fontWeight: 800,
          letterSpacing: '-0.03em',
          mb: 1,
        }}
      >
        Amortization Schedule Breakdown
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: 'text.secondary', mb: 3.5, maxWidth: 900 }}
      >
        Review annual totals first, then expand any year to see the monthly
        principal and interest breakdown for the standard repayment schedule.
        Payments begin one month after the selected start month.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'auto auto 1fr auto' },
          alignItems: 'center',
          gap: 2.5,
          mb: 4,
        }}
      >
        <TextField
          label="Start month"
          type="month"
          value={startMonth}
          onChange={(event) => {
            onStartMonthChange(event.target.value);
          }}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          sx={{
            width: { xs: '100%', sm: 220 },
            '& .MuiOutlinedInput-root': {
              fontSize: '1.1rem',
            },
          }}
        />

        <Typography
          sx={{
            display: { xs: 'none', lg: 'block' },
            color: '#1A1A2E',
            fontSize: '2.4rem',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          →
        </Typography>

        <Box>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5 }}
          >
            Last payment
          </Typography>
          <Typography
            sx={{
              color: 'text.primary',
              fontSize: { xs: '2rem', sm: '2.6rem' },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            {lastPaymentLabel}
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={expandAll}
              onChange={(event) => {
                setExpandAll(event.target.checked);
              }}
            />
          }
          label="Expand all years"
          labelPlacement="start"
          sx={{
            m: 0,
            justifyContent: { xs: 'flex-start', lg: 'flex-end' },
            gap: 1.5,
            '& .MuiFormControlLabel-label': {
              color: 'text.primary',
              fontSize: '1.05rem',
              fontWeight: 700,
            },
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1.3fr 1fr 1fr 1.35fr' },
          gap: 2,
          px: { xs: 1.5, sm: 2.5 },
          py: 1.5,
          color: 'text.primary',
          fontWeight: 800,
          borderBottom: '1px solid #CBD5E1',
        }}
      >
        <Typography sx={{ fontWeight: 800 }}>Date</Typography>
        <Typography sx={{ fontWeight: 800, textAlign: 'right' }}>
          Principal
        </Typography>
        <Typography sx={{ fontWeight: 800, textAlign: 'right' }}>
          Interest
        </Typography>
        <Typography sx={{ fontWeight: 800, textAlign: 'right' }}>
          Remaining balance
        </Typography>
      </Box>

      <Box>
        {yearlyGroups.map((group) => {
          const isExpanded = expandAll || expandedYears.includes(group.year);

          return (
            <Accordion
              key={group.year}
              disableGutters
              elevation={0}
              expanded={isExpanded}
              onChange={handleAccordionChange(group.year)}
              square
              sx={{
                borderBottom: '1px solid #CBD5E1',
                '&:before': {
                  display: 'none',
                },
                '& .MuiAccordionSummary-root': {
                  px: { xs: 1.5, sm: 2.5 },
                  minHeight: 72,
                  backgroundColor: '#F8FAFC',
                },
                '& .MuiAccordionSummary-content': {
                  my: 0,
                },
              }}
            >
              <AccordionSummary
                expandIcon={
                  isExpanded ? (
                    <RemoveIcon sx={{ color: '#2563EB' }} />
                  ) : (
                    <AddIcon sx={{ color: '#2563EB' }} />
                  )
                }
                sx={{
                  flexDirection: 'row-reverse',
                  '& .MuiAccordionSummary-expandIconWrapper': {
                    color: '#2563EB',
                    ml: 0,
                    mr: 1.5,
                    transform: 'none !important',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1.3fr 1fr 1fr 1.35fr' },
                    gap: 2,
                    width: '100%',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    sx={{ color: '#2563EB', fontSize: '1rem', fontWeight: 700 }}
                  >
                    {group.year}
                  </Typography>
                  <Typography sx={{ textAlign: 'right', fontWeight: 500 }}>
                    {formatCurrency(group.principalPaid)}
                  </Typography>
                  <Typography sx={{ textAlign: 'right', fontWeight: 500 }}>
                    {formatCurrency(group.interestPaid)}
                  </Typography>
                  <Typography sx={{ textAlign: 'right', fontWeight: 500 }}>
                    {formatCurrency(group.remainingBalance)}
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ p: 0 }}>
                <TableContainer>
                  <Table
                    size="small"
                    aria-label={`payment breakdown for ${String(group.year)}`}
                  >
                    <TableHead sx={{ display: 'none' }}>
                      <TableRow>
                        <TableCell>Month</TableCell>
                        <TableCell align="right">Principal</TableCell>
                        <TableCell align="right">Interest</TableCell>
                        <TableCell align="right">Remaining balance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.rows.map((row, index) => (
                        <TableRow
                          key={row.paymentNumber}
                          sx={{
                            backgroundColor:
                              index % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                          }}
                        >
                          <TableCell sx={{ px: { xs: 1.5, sm: 2.5 } }}>
                            {row.paymentMonthLabel}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(row.principalPaid)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(row.interestPaid)}
                          </TableCell>
                          <TableCell align="right" sx={{ pr: { xs: 1.5, sm: 2.5 } }}>
                            {formatCurrency(row.remainingBalance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Box>
  );
}
