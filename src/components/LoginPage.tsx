import { useState, type FormEvent } from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../auth/AuthContext';

interface LoginPageProps {
  onClose?: () => void;
}

type Mode = 'signin' | 'signup';

export default function LoginPage({ onClose }: LoginPageProps) {
  const { signInWithPassword, signUpWithPassword, signInWithGoogle } =
    useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    const action =
      mode === 'signin' ? signInWithPassword : signUpWithPassword;
    const { error: authError } = await action(email, password);
    setSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (mode === 'signup') {
      setInfo(
        'Account created. Check your email for a confirmation link before signing in.',
      );
    } else if (onClose) {
      onClose();
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setInfo(null);
    setGoogleSubmitting(true);
    const { error: authError } = await signInWithGoogle();
    if (authError) {
      setError(authError.message);
      setGoogleSubmitting(false);
    }
    // On success the browser is redirected by Supabase, so no further state
    // update is needed.
  };

  const isSignIn = mode === 'signin';

  return (
    <Box sx={{ minHeight: 'calc(100vh - 80px)', backgroundColor: '#F5F7FA' }}>
      <Container maxWidth='sm' sx={{ py: { xs: 4, sm: 8 } }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid #E2E8F0',
            borderTop: '4px solid #0021A5',
            p: { xs: 3, sm: 5 },
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography variant='h4' sx={{ color: '#0021A5', mb: 0.5 }}>
                {isSignIn ? 'Sign in' : 'Create your account'}
              </Typography>
              <Typography variant='body2' sx={{ color: '#5A5A7A' }}>
                {isSignIn
                  ? 'Welcome back to Gator Financiers.'
                  : 'Save your loan scenarios across devices.'}
              </Typography>
            </Box>

            {error && <Alert severity='error'>{error}</Alert>}
            {info && <Alert severity='success'>{info}</Alert>}

            <Button
              variant='outlined'
              size='large'
              startIcon={
                googleSubmitting ? (
                  <CircularProgress size={18} />
                ) : (
                  <GoogleIcon />
                )
              }
              onClick={handleGoogle}
              disabled={googleSubmitting || submitting}
              aria-label='Continue with Google'
            >
              Continue with Google
            </Button>

            <Divider>or</Divider>

            <Box component='form' onSubmit={handleSubmit} noValidate>
              <Stack spacing={2}>
                <TextField
                  label='Email'
                  type='email'
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  autoComplete='email'
                  required
                  fullWidth
                  inputProps={{ 'aria-label': 'Email' }}
                />
                <TextField
                  label='Password'
                  type='password'
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  autoComplete={isSignIn ? 'current-password' : 'new-password'}
                  required
                  fullWidth
                  inputProps={{ 'aria-label': 'Password' }}
                />
                <Button
                  type='submit'
                  variant='contained'
                  size='large'
                  disabled={submitting || googleSubmitting}
                  startIcon={
                    submitting ? <CircularProgress size={18} /> : undefined
                  }
                >
                  {isSignIn ? 'Sign in' : 'Create account'}
                </Button>
              </Stack>
            </Box>

            <Typography variant='body2' sx={{ color: '#5A5A7A' }}>
              {isSignIn ? "Don't have an account? " : 'Already registered? '}
              <Link
                component='button'
                type='button'
                onClick={() => {
                  setMode(isSignIn ? 'signup' : 'signin');
                  setError(null);
                  setInfo(null);
                }}
                sx={{ fontWeight: 600 }}
              >
                {isSignIn ? 'Create one' : 'Sign in'}
              </Link>
            </Typography>

            {onClose && (
              <Link
                component='button'
                type='button'
                onClick={onClose}
                sx={{ alignSelf: 'flex-start', color: '#5A5A7A' }}
              >
                Back to calculator
              </Link>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
