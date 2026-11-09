import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import theme from '@/theme';
import { EmployeeFormModal } from '@/components/EmployeeFormModal';
import { employeeService, type Employee } from '@/services/employee.service';
import type { ServiceSalon } from '@/services/business.service';
import toast from 'react-hot-toast';

vi.mock('@/services/employee.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/employee.service')>();
  return {
    ...actual,
    employeeService: {
      create: vi.fn(),
      update: vi.fn(),
    },
  };
});

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockedCreateEmployee = vi.mocked(employeeService.create);
const mockedUpdateEmployee = vi.mocked(employeeService.update);

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('EmployeeFormModal Component', () => {
  const sampleServices: ServiceSalon[] = [
    { id: 1, service_name: 'Corte Feminino', price: '80.00', duration_minutes: 45 },
    { id: 2, service_name: 'Coloração', price: '150.00', duration_minutes: 90 },
  ];

  const sampleEmployee: Employee = {
    id: 'emp-10',
    full_name: 'Camila Andrade',
    cpf_cnpj: '12345678909',
    role: 'receptionist',
    role_display: 'Recepcionista',
    contract_type: 'fixed',
    contract_type_display: 'Fixo (CLT/Mensalista)',
    is_schedulable: false,
    is_active: true,
    fixed_salary: '2500.00',
    default_commission_rate: '5.00',
    email: 'camila@salao.com',
    has_login: true,
    services: [{ service_id: 1, service_name: 'Corte Feminino', commission_rate: null }],
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-01T10:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create mode without login fields for default "professional" role and submits valid payload', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn<() => void>();
    const handleSaved = vi.fn<() => void>();

    mockedCreateEmployee.mockResolvedValueOnce(sampleEmployee);

    renderWithTheme(
      <EmployeeFormModal
        open={true}
        employee={null}
        services={sampleServices}
        onClose={handleClose}
        onSaved={handleSaved}
      />,
    );

    expect(screen.getByText('Novo funcionário')).toBeInTheDocument();
    expect(
      screen.getByText(/Profissional da Beleza e Apoio não fazem login no sistema\./i),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('E-mail de acesso')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Nome completo'), 'Marcos Oliveira');
    await user.type(screen.getByLabelText('CPF ou CNPJ'), '52998224725');
    await user.type(screen.getByLabelText('Comissão padrão (%)'), '40');

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(mockedCreateEmployee).toHaveBeenCalledWith({
        full_name: 'Marcos Oliveira',
        cpf_cnpj: '52998224725',
        role: 'professional',
        contract_type: 'commission',
        is_schedulable: true,
        is_active: true,
        fixed_salary: '0',
        default_commission_rate: '40',
        services: [],
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Funcionário cadastrado!');
    expect(handleSaved).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders edit mode with login fields when employee has a login-enabled role', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn<() => void>();
    const handleSaved = vi.fn<() => void>();

    mockedUpdateEmployee.mockResolvedValueOnce(sampleEmployee);

    renderWithTheme(
      <EmployeeFormModal
        open={true}
        employee={sampleEmployee}
        services={sampleServices}
        onClose={handleClose}
        onSaved={handleSaved}
      />,
    );

    expect(screen.getByText('Editar funcionário')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome completo')).toHaveValue('Camila Andrade');
    expect(screen.getByLabelText('E-mail de acesso')).toHaveValue('camila@salao.com');
    expect(screen.getByLabelText('Nova senha (opcional)')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(mockedUpdateEmployee).toHaveBeenCalledWith(
        'emp-10',
        expect.objectContaining({
          full_name: 'Camila Andrade',
          role: 'receptionist',
          email: 'camila@salao.com',
        }),
      );
    });
    expect(toast.success).toHaveBeenCalledWith('Funcionário atualizado!');
  });

  it('displays backend validation errors when API returns field errors', async () => {
    const user = userEvent.setup();

    mockedCreateEmployee.mockRejectedValueOnce({
      response: {
        data: {
          cpf_cnpj: ['CPF ou CNPJ inválido.'],
        },
      },
    });

    renderWithTheme(
      <EmployeeFormModal
        open={true}
        employee={null}
        services={sampleServices}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText('Nome completo'), 'Teste Erro');
    await user.type(screen.getByLabelText('CPF ou CNPJ'), '11111111111');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(screen.getByText('CPF ou CNPJ inválido.')).toBeInTheDocument();
    });
    expect(toast.error).toHaveBeenCalledWith('Verifique os campos destacados.');
  });
});
