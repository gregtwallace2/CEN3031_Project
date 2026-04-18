import { useState, type MouseEvent } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import gatorsLogo from '../assets/gators_logo.png';
import { useAuth } from '../auth/AuthContext';

interface HeaderProps {
  onSignInClick?: () => void;
}

function getInitials(email: string | undefined | null): string {
  if (!email) return '?';
  const local = email.split('@')[0] ?? '';
  return local.slice(0, 2).toUpperCase() || '?';
}

export default function Header({ onSignInClick }: HeaderProps) {
  const { user, loading, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleClose();
    await signOut();
  };

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
          <Box sx={{ flexGrow: 1 }}>
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

          {!loading && !user && (
            <Button
              variant="contained"
              size="medium"
              startIcon={<LoginIcon />}
              onClick={onSignInClick}
              sx={{ py: 1, px: 2 }}
              aria-label="Sign in"
            >
              Sign in
            </Button>
          )}

          {!loading && user && (
            <>
              <IconButton
                onClick={handleOpen}
                size="small"
                aria-label="Account menu"
                aria-controls={anchorEl ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={anchorEl ? 'true' : undefined}
                sx={{ ml: 1 }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: '#0021A5',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  {getInitials(user.email)}
                </Avatar>
              </IconButton>
              <Menu
                id="account-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    sx: { minWidth: 220, mt: 1 },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="caption" sx={{ color: '#5A5A7A' }}>
                    Signed in as
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: '#1A1A2E' }}
                    noWrap
                  >
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleSignOut}>
                  <LogoutIcon
                    fontSize="small"
                    sx={{ mr: 1, color: '#5A5A7A' }}
                  />
                  Sign out
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
