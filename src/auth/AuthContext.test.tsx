import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { AuthProvider, useAuth } from './AuthContext';

interface FakeAuth {
  getSession: ReturnType<typeof vi.fn>;
  onAuthStateChange: ReturnType<typeof vi.fn>;
  signInWithPassword: ReturnType<typeof vi.fn>;
  signUp: ReturnType<typeof vi.fn>;
  signInWithOAuth: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
  /** Captured auth-state listener so tests can drive sign-in events. */
  emit: (session: Session | null) => void;
}

function createFakeClient(initialSession: Session | null = null): {
  client: SupabaseClient;
  auth: FakeAuth;
} {
  let listener: ((event: string, session: Session | null) => void) | null =
    null;

  const auth: FakeAuth = {
    getSession: vi.fn().mockResolvedValue({ data: { session: initialSession } }),
    onAuthStateChange: vi.fn((cb: (event: string, session: Session | null) => void) => {
      listener = cb;
      return {
        data: {
          subscription: { unsubscribe: vi.fn() },
        },
      };
    }),
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signUp: vi.fn().mockResolvedValue({ error: null }),
    signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    emit: (session: Session | null) => {
      listener?.(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
    },
  };

  return {
    client: { auth } as unknown as SupabaseClient,
    auth,
  };
}

function makeSession(email: string): Session {
  return {
    access_token: 'token',
    refresh_token: 'refresh',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: {
      id: 'user-id',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email,
    },
  } as Session;
}

function wrapper(client: SupabaseClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AuthProvider client={client}>{children}</AuthProvider>;
  };
}

describe('AuthProvider', () => {
  beforeEach(() => {
    // window.location is needed by the OAuth call.
    Object.defineProperty(globalThis, 'location', {
      value: { origin: 'http://localhost', pathname: '/' },
      writable: true,
    });
  });

  it('throws when useAuth is called outside the provider', () => {
    // Suppress React's error log for this expected throw.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      /useAuth must be used within an AuthProvider/,
    );
    spy.mockRestore();
  });

  it('exposes null user and session when there is no active session', async () => {
    const { client } = createFakeClient(null);
    const { result } = renderHook(() => useAuth(), {
      wrapper: wrapper(client),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('exposes the user when getSession returns a session', async () => {
    const session = makeSession('alice@example.com');
    const { client } = createFakeClient(session);
    const { result } = renderHook(() => useAuth(), {
      wrapper: wrapper(client),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user?.email).toBe('alice@example.com');
  });

  it('updates the user when an auth-state event fires', async () => {
    const { client, auth } = createFakeClient(null);
    const { result } = renderHook(() => useAuth(), {
      wrapper: wrapper(client),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.user).toBeNull();

    act(() => {
      auth.emit(makeSession('bob@example.com'));
    });

    await waitFor(() => {
      expect(result.current.user?.email).toBe('bob@example.com');
    });
  });

  it('forwards signInWithPassword and returns the auth error', async () => {
    const { client, auth } = createFakeClient(null);
    auth.signInWithPassword.mockResolvedValueOnce({
      error: new Error('Invalid login credentials'),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: wrapper(client),
    });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let outcome: { error: Error | null } | undefined;
    await act(async () => {
      outcome = await result.current.signInWithPassword(
        'a@b.com',
        'wrong',
      );
    });

    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'wrong',
    });
    expect(outcome?.error?.message).toBe('Invalid login credentials');
  });

  it('forwards signUp with the supplied credentials', async () => {
    const { client, auth } = createFakeClient(null);
    const { result } = renderHook(() => useAuth(), {
      wrapper: wrapper(client),
    });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.signUpWithPassword('new@example.com', 'secret123');
    });

    expect(auth.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'secret123',
    });
  });

  it('calls signInWithOAuth with the google provider and a redirectTo URL', async () => {
    const { client, auth } = createFakeClient(null);
    const { result } = renderHook(() => useAuth(), {
      wrapper: wrapper(client),
    });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost/',
      },
    });
  });

  it('calls signOut on the underlying client', async () => {
    const { client, auth } = createFakeClient(makeSession('a@b.com'));
    const { result } = renderHook(() => useAuth(), {
      wrapper: wrapper(client),
    });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(auth.signOut).toHaveBeenCalled();
  });

  it('unsubscribes from auth-state changes on unmount', async () => {
    const { client, auth } = createFakeClient(null);
    const { unmount } = render(
      <AuthProvider client={client}>
        <div />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(auth.onAuthStateChange).toHaveBeenCalled();
    });

    interface SubscriptionResult { data: { subscription: { unsubscribe: ReturnType<typeof vi.fn> } } }
    const mockResult = auth.onAuthStateChange.mock.results[0]?.value as SubscriptionResult;
    const subscription = mockResult.data.subscription;

    unmount();
    expect(subscription.unsubscribe).toHaveBeenCalled();
  });
});
