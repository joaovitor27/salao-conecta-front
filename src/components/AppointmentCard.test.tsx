import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import theme from '@/theme';
import { AppointmentCard } from '@/components/AppointmentCard';
import type { DashboardAppointment } from '@/services/dashboard.service';
import * as PermissionsModule from '@/hooks/usePermissions';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('AppointmentCard Component', () => {
  const mockUsePermissions = vi.spyOn(PermissionsModule, 'usePermissions');

  const sampleAppointment: DashboardAppointment = {
    id: 42,
    client_name: 'Carla Mendes',
    professional_name: 'Juliana Rocha',
    service_name: 'Corte + Escova',
    service_price: '120.00',
    start_time: '2026-08-20T14:00:00-03:00',
    end_time: '2026-08-20T15:00:00-03:00',
    status: 'pending',
    status_display: 'Pendente',
    discount: '20.00',
  };

  beforeEach(() => {
    mockUsePermissions.mockReturnValue({
      currentRole: 'owner',
      currentEmployeeId: 'emp-1',
      isManagerOrOwner: true,
      canSeeAllSchedules: true,
      canSeeFinancials: true,
      canManageSchedules: true,
      canManageCustomers: true,
    });
  });

  it('renders client info, professional, duration, discounted price, and status chip', () => {
    renderWithTheme(
      <AppointmentCard
        appointment={sampleAppointment}
        onEdit={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Carla Mendes')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText(/Com Juliana Rocha/i)).toBeInTheDocument();
    expect(screen.getByText('60 min')).toBeInTheDocument();
    expect(screen.getByText('R$ 120.00')).toBeInTheDocument();
    expect(screen.getByText('R$ 100.00')).toBeInTheDocument();
    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('opens menu and triggers onEdit and onStatusChange for pending appointment', async () => {
    const user = userEvent.setup();
    const handleEdit = vi.fn<(id: number) => void>();
    const handleStatusChange = vi.fn<(id: number, status: string) => void>();

    renderWithTheme(
      <AppointmentCard
        appointment={sampleAppointment}
        onEdit={handleEdit}
        onStatusChange={handleStatusChange}
      />,
    );

    const menuButton = screen.getByRole('button');
    await user.click(menuButton);

    const editMenuItem = screen.getByRole('menuitem', { name: /editar/i });
    expect(editMenuItem).toBeInTheDocument();
    await user.click(editMenuItem);
    expect(handleEdit).toHaveBeenCalledWith(42);

    await user.click(menuButton);
    const confirmMenuItem = screen.getByRole('menuitem', { name: /confirmar/i });
    await user.click(confirmMenuItem);
    expect(handleStatusChange).toHaveBeenCalledWith(42, 'confirmed');
  });

  it('disables actions when appointment status is terminal (completed)', async () => {
    const user = userEvent.setup();
    const completedAppointment: DashboardAppointment = {
      ...sampleAppointment,
      status: 'completed',
      status_display: 'Concluído',
      discount: '0.00',
    };

    renderWithTheme(
      <AppointmentCard
        appointment={completedAppointment}
        onEdit={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Nenhuma ação disponível')).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /editar/i })).not.toBeInTheDocument();
  });
});
