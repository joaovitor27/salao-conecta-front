import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockedApiGet = vi.mocked(api.get);
const mockedApiPost = vi.mocked(api.post);

function AuthConsumerTestComponent() {
  const { user, isAuthenticated, isLoading, currentTenant, currentRole, signIn, signOut } = useAuth();

  if (isLoading) {
    return <div>Carregando autenticação...</div>;
  }

  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'Autenticado' : 'Visitante'}</span>
      <span data-testid="user-email">{user?.email ?? 'sem-email'}</span>
      <span data-testid="tenant">{currentTenant ?? 'sem-tenant'}</span>
      <span data-testid="role">{currentRole ?? 'sem-role'}</span>
      <button
        type="button"
        onClick={() => {
          void signIn('maria@salao.com', 'Senha@123').catch(() => undefined);
        }}
      >
        Entrar
      </button>
      <button type="button" onClick={signOut}>
        Sair
      </button>
    </div>
  );
}

describe('AuthContext & useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts unauthenticated when no token is stored in localStorage', async () => {
    render(
      <AuthProvider>
        <AuthConsumerTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Visitante');
    });
    expect(screen.getByTestId('user-email')).toHaveTextContent('sem-email');
    expect(mockedApiGet).not.toHaveBeenCalled();
  });

  it('loads user profile and default tenant on mount when token exists', async () => {
    localStorage.setItem('@SalaoConecta:token', 'jwt-access-token');
    mockedApiGet.mockResolvedValueOnce({
      data: {
        id: 'user-1',
        first_name: 'Maria',
        last_name: 'Silva',
        email: 'maria@salao.com',
        salons: [
          {
            slug: 'studio-maria',
            name: 'Studio Maria',
            role: 'owner',
            employee_id: 'emp-1',
          },
        ],
      },
    });

    render(
      <AuthProvider>
        <AuthConsumerTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Autenticado');
    });
    expect(screen.getByTestId('user-email')).toHaveTextContent('maria@salao.com');
    expect(screen.getByTestId('tenant')).toHaveTextContent('studio-maria');
    expect(screen.getByTestId('role')).toHaveTextContent('owner');
  });

  it('clears storage if loading user on mount fails with invalid token', async () => {
    localStorage.setItem('@SalaoConecta:token', 'expired-token');
    localStorage.setItem('@SalaoConecta:tenant', 'studio-maria');
    mockedApiGet.mockRejectedValueOnce(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <AuthConsumerTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Visitante');
    });
    expect(localStorage.getItem('@SalaoConecta:token')).toBeNull();
    expect(localStorage.getItem('@SalaoConecta:tenant')).toBeNull();
  });

  it('authenticates user via signIn, stores tokens, and shows success toast', async () => {
    const user = userEvent.setup();
    mockedApiPost.mockResolvedValueOnce({
      data: { access: 'new-access', refresh: 'new-refresh' },
    });
    mockedApiGet.mockResolvedValueOnce({
      data: {
        id: 'user-1',
        first_name: 'Maria',
        last_name: 'Silva',
        email: 'maria@salao.com',
        salons: [
          {
            slug: 'studio-maria',
            name: 'Studio Maria',
            role: 'manager',
            employee_id: 'emp-2',
          },
        ],
      },
    });

    render(
      <AuthProvider>
        <AuthConsumerTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Visitante');
    });

    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Autenticado');
    });
    expect(localStorage.getItem('@SalaoConecta:token')).toBe('new-access');
    expect(localStorage.getItem('@SalaoConecta:refreshToken')).toBe('new-refresh');
    expect(localStorage.getItem('@SalaoConecta:tenant')).toBe('studio-maria');
    expect(toast.success).toHaveBeenCalledWith('Login realizado com sucesso!');
  });

  it('shows error toast when signIn fails with invalid credentials', async () => {
    const user = userEvent.setup();
    mockedApiPost.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(
      <AuthProvider>
        <AuthConsumerTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Visitante');
    });

    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Credenciais inválidas. Tente novamente.');
    });
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Visitante');
  });
});
