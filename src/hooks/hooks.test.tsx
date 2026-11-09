import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermissions } from '@/hooks/usePermissions';
import * as AuthContextModule from '@/contexts/AuthContext';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce<string>('corte', 500));
    expect(result.current).toBe('corte');
  });

  it('updates the debounced value only after the specified delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebounce<string>(value, delay),
      { initialProps: { value: 'corte', delay: 500 } },
    );

    rerender({ value: 'escova', delay: 500 });
    expect(result.current).toBe('corte');

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe('corte');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('escova');
  });

  it('resets the timer if value changes rapidly before the delay expires', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce<string>(value, 300),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'ab' });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('a');

    rerender({ value: 'abc' });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('abc');
  });
});

describe('usePermissions Hook', () => {
  const mockUseAuth = vi.spyOn(AuthContextModule, 'useAuth');

  const createAuthMock = (
    role: 'owner' | 'manager' | 'financial' | 'receptionist' | null,
    employeeId: string | null = 'emp-1',
  ): ReturnType<typeof AuthContextModule.useAuth> => ({
    user: null,
    isAuthenticated: Boolean(role),
    signIn: vi.fn(),
    signOut: vi.fn(),
    isLoading: false,
    currentTenant: 'salao-teste',
    changeTenant: vi.fn(),
    currentRole: role,
    currentEmployeeId: employeeId,
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('grants full permissions to owner and manager roles', () => {
    mockUseAuth.mockReturnValue(createAuthMock('owner', 'emp-owner'));
    const { result: ownerResult } = renderHook(() => usePermissions());

    expect(ownerResult.current.isManagerOrOwner).toBe(true);
    expect(ownerResult.current.canSeeAllSchedules).toBe(true);
    expect(ownerResult.current.canSeeFinancials).toBe(true);
    expect(ownerResult.current.canManageSchedules).toBe(true);
    expect(ownerResult.current.canManageCustomers).toBe(true);

    mockUseAuth.mockReturnValue(createAuthMock('manager', 'emp-manager'));
    const { result: managerResult } = renderHook(() => usePermissions());

    expect(managerResult.current.isManagerOrOwner).toBe(true);
    expect(managerResult.current.canSeeFinancials).toBe(true);
    expect(managerResult.current.canManageSchedules).toBe(true);
    expect(managerResult.current.canManageCustomers).toBe(true);
  });

  it('grants schedule and customer management to receptionist but restricts financials', () => {
    mockUseAuth.mockReturnValue(createAuthMock('receptionist', 'emp-recep'));
    const { result } = renderHook(() => usePermissions());

    expect(result.current.isManagerOrOwner).toBe(false);
    expect(result.current.canSeeAllSchedules).toBe(true);
    expect(result.current.canSeeFinancials).toBe(false);
    expect(result.current.canManageSchedules).toBe(true);
    expect(result.current.canManageCustomers).toBe(true);
  });

  it('grants financial access to financial role but restricts schedule and customer management', () => {
    mockUseAuth.mockReturnValue(createAuthMock('financial', 'emp-fin'));
    const { result } = renderHook(() => usePermissions());

    expect(result.current.isManagerOrOwner).toBe(false);
    expect(result.current.canSeeAllSchedules).toBe(true);
    expect(result.current.canSeeFinancials).toBe(true);
    expect(result.current.canManageSchedules).toBe(false);
    expect(result.current.canManageCustomers).toBe(false);
  });

  it('denies management and financial permissions when currentRole is null', () => {
    mockUseAuth.mockReturnValue(createAuthMock(null, null));
    const { result } = renderHook(() => usePermissions());

    expect(result.current.isManagerOrOwner).toBe(false);
    expect(result.current.canSeeFinancials).toBe(false);
    expect(result.current.canManageSchedules).toBe(false);
    expect(result.current.canManageCustomers).toBe(false);
  });
});
