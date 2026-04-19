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
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import gatorsLogo from '../assets/gators_logo.png';
import { useAuth } from '../auth/AuthContext';
import type { Scenario } from '../lib/scenarios';

interface HeaderProps {
  onSignInClick?: () => void;
  onAccountClick?: () => void;
  savedScenarios?: Scenario[];
  onLoadScenario?: (scenario: Scenario) => void;
}

function getInitials(email: string | undefined | null): string {
  if (!email) return '?';
  const local = email.split('@')[0] ?? '';
  return local.slice(0, 2).toUpperCase() || '?';
}

export default function Header({
  onSignInClick,
  onAccountClick,
  savedScenarios = [],
  onLoadScenario,
}: Readonly<HeaderProps>) {
  const { user, loading, signOut } = useAuth();

  // Avatar / account dropdown
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
  const handleAccountOpen = (e: MouseEvent<HTMLElement>) => {
    setAccountAnchor(e.currentTarget);
  };
  const handleAccountClose = () => {
    setAccountAnchor(null);
  };

  // Scenarios dropdown
  const [scenarioAnchor, setScenarioAnchor] = useState<HTMLElement | null>(null);
  const handleScenariosOpen = (e: MouseEvent<HTMLElement>) => {
    setScenarioAnchor(e.currentTarget);
  };
  const handleScenariosClose = () => {
    setScenarioAnchor(null);
  };

  const handleSignOut = async () => {
    handleAccountClose();
    await signOut();
  };

  const handleLoadScenario = (scenario: Scenario) => {
    handleScenariosClose();
    onLoadScenario?.(scenario);
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
          {/* Logo + title */}
          <Box
            component="img"
            src={gatorsLogo}
            alt="Gator Financiers logo"
            sx={{ height: 52, width: 'auto', mr: 1.5 }}
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

          {/* Unauthenticated */}
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

          {/* Authenticated */}
          {!loading && user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Scenarios dropdown */}
              <Tooltip title="My saved scenarios">
                <Button
                  size="small"
                  onClick={handleScenariosOpen}
                  endIcon={<KeyboardArrowDownIcon />}
                  startIcon={<FolderOpenIcon />}
                  aria-controls={scenarioAnchor ? 'scenarios-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={scenarioAnchor ? 'true' : undefined}
                  sx={{
                    color: '#5A5A7A',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textTransform: 'none',
                    px: 1.5,
                    display: { xs: 'none', sm: 'flex' },
                  }}
                >
                  Scenarios
                  {savedScenarios.length > 0 && (
                    <Box
                      component="span"
                      sx={{
                        ml: 0.75,
                        backgroundColor: '#EEF2FF',
                        color: '#0021A5',
                        borderRadius: '10px',
                        px: 0.75,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        lineHeight: '18px',
                      }}
                    >
                      {savedScenarios.length}
                    </Box>
                  )}
                </Button>
              </Tooltip>

              <Menu
                id="scenarios-menu"
                anchorEl={scenarioAnchor}
                open={Boolean(scenarioAnchor)}
                onClose={handleScenariosClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { minWidth: 240, mt: 1, maxHeight: 320 } } }}
              >
                {savedScenarios.length === 0 ? (
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="body2" sx={{ color: '#9AA5B4', fontStyle: 'italic' }}>
                      No saved scenarios yet
                    </Typography>
                  </Box>
                ) : (
                  savedScenarios.map((s) => (
                    <MenuItem
                      key={s.id}
                      onClick={() => {
                        handleLoadScenario(s);
                      }}
                    >
                      <ListItemIcon>
                        <FolderOpenIcon fontSize="small" sx={{ color: '#0021A5' }} />
                      </ListItemIcon>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                        {s.name}
                      </Typography>
                    </MenuItem>
                  ))
                )}
                <Divider />
                <MenuItem
                  onClick={() => {
                    handleScenariosClose();
                    if (onAccountClick) onAccountClick();
                  }}
                >
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" sx={{ color: '#5A5A7A' }} />
                  </ListItemIcon>
                  <Typography variant="body2">Manage scenarios</Typography>
                </MenuItem>
              </Menu>

              {/* Account icon */}
              <Tooltip title="My account">
                <IconButton
                  onClick={handleAccountOpen}
                  size="small"
                  aria-label="Account menu"
                  aria-controls={accountAnchor ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={accountAnchor ? 'true' : undefined}
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
              </Tooltip>

              <Menu
                id="account-menu"
                anchorEl={accountAnchor}
                open={Boolean(accountAnchor)}
                onClose={handleAccountClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { minWidth: 220, mt: 1 } } }}
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
                <MenuItem
                  onClick={() => {
                    handleAccountClose();
                    if (onAccountClick) onAccountClick();
                  }}
                >
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" sx={{ color: '#5A5A7A' }} />
                  </ListItemIcon>
                  My Scenarios
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => void handleSignOut()} sx={{ color: '#FA4616' }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" sx={{ color: '#FA4616' }} />
                  </ListItemIcon>
                  Sign out
                </MenuItem>
              </Menu>

              {/* Visible sign-out button for quick access */}
              <Tooltip title="Sign out">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => void handleSignOut()}
                  startIcon={<LogoutIcon />}
                  sx={{
                    color: '#5A5A7A',
                    borderColor: '#D0D5DD',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    display: { xs: 'none', md: 'flex' },
                    '&:hover': {
                      borderColor: '#FA4616',
                      color: '#FA4616',
                      backgroundColor: '#FFF5F3',
                    },
                  }}
                >
                  Sign out
                </Button>
              </Tooltip>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
