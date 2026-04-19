import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { AuthProvider } from '../auth/AuthContext';
import LoginPage from './LoginPage';

function createFakeClient() {
  const auth = {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signUp: vi.fn().mockResolvedValue({ error: null }),
    signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  };
  return { client: { auth } as unknown as SupabaseClient, auth };
}

function Wrap({
  client,
  children,
}: Readonly<{
  client: SupabaseClient;
  children: ReactNode;
}>) {
  return <AuthProvider client={client}>{children}</AuthProvider>;
}

describe('LoginPage', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'location', {
      value: { origin: 'http://localhost', pathname: '/' },
      writable: true,
    });
  });

  it('renders the sign-in form by default', async () => {
    const { client } = createFakeClient();
    render(
      <Wrap client={client}>
        <LoginPage />
      </Wrap>,
    );

    expect(
      await screen.findByRole('heading', { name: /sign in/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it('blocks submission when fields are empty and shows a validation error', async () => {
    const user = userEvent.setup();
    const { client, auth } = createFakeClient();
    render(
      <Wrap client={client}>
        <LoginPage />
      </Wrap>,
    );

    await user.click(await screen.findByRole('button', { name: /^sign in$/i }));

    expect(
      await screen.findByText(/email and password are required/i),
    ).toBeInTheDocument();
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('calls signInWithPassword and dismisses on success', async () => {
    const user = userEvent.setup();
    const { client, auth } = createFakeClient();
    const onClose = vi.fn();

    render(
      <Wrap client={client}>
        <LoginPage onClose={onClose} />
      </Wrap>,
    );

    await user.type(await screen.findByLabelText(/email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/password/i), 'pw12345');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'pw12345',
      });
    });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('surfaces the auth error message when sign-in fails', async () => {
    const user = userEvent.setup();
    const { client, auth } = createFakeClient();
    auth.signInWithPassword.mockResolvedValueOnce({
      error: new Error('Invalid login credentials'),
    });

    render(
      <Wrap client={client}>
        <LoginPage />
      </Wrap>,
    );

    await user.type(await screen.findByLabelText(/email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(
      await screen.findByText(/invalid login credentials/i),
    ).toBeInTheDocument();
  });

  it('switches to sign-up mode and rejects short passwords client-side', async () => {
    const user = userEvent.setup();
    const { client, auth } = createFakeClient();
    render(
      <Wrap client={client}>
        <LoginPage />
      </Wrap>,
    );

    await user.click(
      await screen.findByRole('button', { name: /create one/i }),
    );

    expect(
      await screen.findByRole('heading', { name: /create your account/i }),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/password/i), '123');
    await user.click(
      screen.getByRole('button', { name: /create account/i }),
    );

    expect(
      await screen.findByText(/password must be at least 6 characters/i),
    ).toBeInTheDocument();
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it('signs the user up and shows the confirmation notice', async () => {
    const user = userEvent.setup();
    const { client, auth } = createFakeClient();
    render(
      <Wrap client={client}>
        <LoginPage />
      </Wrap>,
    );

    await user.click(
      await screen.findByRole('button', { name: /create one/i }),
    );
    await user.type(screen.getByLabelText(/email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/password/i), 'longenough');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'longenough',
      });
    });
    expect(
      await screen.findByText(/check your email for a confirmation link/i),
    ).toBeInTheDocument();
  });

  it('triggers Google OAuth when the Google button is clicked', async () => {
    const user = userEvent.setup();
    const { client, auth } = createFakeClient();
    render(
      <Wrap client={client}>
        <LoginPage />
      </Wrap>,
    );

    await user.click(
      await screen.findByRole('button', { name: /continue with google/i }),
    );

    await waitFor(() => {
      expect(auth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'google' }),
      );
    });
  });
});
