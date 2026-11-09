import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { PrivateRoute } from '@/routes/PrivateRoute';
import { PublicRoute } from '@/routes/PublicRoute';
import * as AuthContextModule from '@/contexts/AuthContext';

describe('Route Guards (PrivateRoute & PublicRoute)', () => {
  const mockUseAuth = vi.spyOn(AuthContextModule, 'useAuth');

  const buildAuthState = (
    isAuthenticated: boolean,
    isLoading = false,
  ): ReturnType<typeof AuthContextModule.useAuth> => ({
    user: null,
    isAuthenticated,
    isLoading,
    signIn: vi.fn(),
    signOut: vi.fn(),
    currentTenant: null,
    changeTenant: vi.fn(),
    currentRole: null,
    currentEmployeeId: null,
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('PrivateRoute redirects unauthenticated users to /login', () => {
    mockUseAuth.mockReturnValue(buildAuthState(false, false));

    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/app/dashboard" element={<div>Área Restrita</div>} />
          </Route>
          <Route path="/login" element={<div>Página de Login</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Página de Login')).toBeInTheDocument();
    expect(screen.queryByText('Área Restrita')).not.toBeInTheDocument();
  });

  it('PrivateRoute renders child route when user is authenticated', () => {
    mockUseAuth.mockReturnValue(buildAuthState(true, false));

    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/app/dashboard" element={<div>Área Restrita</div>} />
          </Route>
          <Route path="/login" element={<div>Página de Login</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Área Restrita')).toBeInTheDocument();
  });

  it('PublicRoute redirects authenticated users to /app/dashboard', () => {
    mockUseAuth.mockReturnValue(buildAuthState(true, false));

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<div>Página de Login</div>} />
          </Route>
          <Route path="/app/dashboard" element={<div>Painel Principal</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Painel Principal')).toBeInTheDocument();
    expect(screen.queryByText('Página de Login')).not.toBeInTheDocument();
  });
});
