import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import gatorsLogo from '../assets/gators_logo.png';

export default function Header() {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: '#FFFFFF',
        borderBottom: '3px solid',
        borderImage: 'linear-gradient(90deg, #0021A5 0%, #FA4616 100%) 1',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 1 }}>
          <Box
            component="img"
            src={gatorsLogo}
            alt="Gator Financiers logo"
            sx={{
              height: 52,
              width: 'auto',
              mr: 1.5,
            }}
          />
          <Box>
            <Typography
              variant="h5"
              sx={{
                color: '#0021A5',
                fontWeight: 800,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              Gator Financiers
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#5A5A7A',
                fontSize: '0.75rem',
                fontWeight: 500,
                letterSpacing: '0.04em',
              }}
            >
              Student Loan Repayment Calculator
            </Typography>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
