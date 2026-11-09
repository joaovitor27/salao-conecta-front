import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import theme from '@/theme';
import { NewAppointmentModal } from '@/components/NewAppointmentModal';
import { appointmentService, type Appointment } from '@/services/appointment.service';
import {
  businessService,
  type Availability,
  type Customer,
  type Employee,
  type ServiceSalon,
} from '@/services/business.service';
import toast from 'react-hot-toast';

vi.mock('@/services/appointment.service', () => ({
  appointmentService: {
    get: vi.fn(),
    createAppointment: vi.fn(),
    updateAppointment: vi.fn(),
  },
}));

vi.mock('@/services/business.service', () => ({
  businessService: {
    getEmployees: vi.fn(),
    getServices: vi.fn(),
    getCustomers: vi.fn(),
    createCustomer: vi.fn(),
    getAvailability: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockedGetEmployees = vi.mocked(businessService.getEmployees);
const mockedGetServices = vi.mocked(businessService.getServices);
const mockedGetCustomers = vi.mocked(businessService.getCustomers);
const mockedCreateCustomer = vi.mocked(businessService.createCustomer);
const mockedGetAvailability = vi.mocked(businessService.getAvailability);
const mockedCreateAppointment = vi.mocked(appointmentService.createAppointment);

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('NewAppointmentModal Component', () => {
  const sampleEmployees: Employee[] = [
    {
      id: 'emp-1',
      full_name: 'Juliana Rocha',
      role: 'professional',
      services: [{ service_id: 1, service_name: 'Corte Feminino', commission_rate: '40.00' }],
    },
  ];

  const sampleServices: ServiceSalon[] = [
    {
      id: 1,
      service_name: 'Corte Feminino',
      price: '80.00',
      duration_minutes: 45,
    },
  ];

  const sampleCustomers: Customer[] = [
    {
      id: 'cust-1',
      name: 'Patrícia Lima',
      phone: '11999998888',
    },
  ];

  const sampleAvailability: Availability = {
    date: '2026-08-25',
    professional_id: null,
    duration_minutes: 45,
    opens_at: '09:00',
    closes_at: '18:00',
    is_closed: false,
    slots: [
      {
        start: '2026-08-25T10:00:00-03:00',
        end: '2026-08-25T10:45:00-03:00',
        label: '10:00',
        end_label: '10:45',
        period: 'morning',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetEmployees.mockResolvedValue(sampleEmployees);
    mockedGetServices.mockResolvedValue(sampleServices);
    mockedGetCustomers.mockResolvedValue(sampleCustomers);
    mockedGetAvailability.mockResolvedValue(sampleAvailability);
  });

  it('validates that at least one service must be selected before submitting', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <NewAppointmentModal
        open={true}
        initialDate="2026-08-25T10:00"
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Novo Agendamento')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(screen.getByText('Adicione pelo menos um serviço.')).toBeInTheDocument();
    });
    expect(mockedCreateAppointment).not.toHaveBeenCalled();
  });

  it('validates new client required fields when "Cadastrar Novo Cliente" is partially filled', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <NewAppointmentModal
        open={true}
        initialDate="2026-08-25T10:00"
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /cadastrar novo cliente/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /cadastrar novo cliente/i }));

    await user.type(screen.getByLabelText('Nome do Cliente'), 'Cliente Sem Telefone');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(
        screen.getByText('Nome e telefone são obrigatórios para novo cliente.'),
      ).toBeInTheDocument();
    });
    expect(mockedCreateCustomer).not.toHaveBeenCalled();
  });

  it('adds a service, calculates total with surcharge/discount, and submits new appointment', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn<() => void>();
    const handleSuccess = vi.fn<() => void>();

    const createdAppt: Appointment = {
      id: 99,
      client: sampleCustomers[0],
      items: [],
      start_time: '2026-08-25T10:00:00-03:00',
      end_time: '2026-08-25T10:45:00-03:00',
      status: 'pending',
      status_display: 'Pendente',
      total_price: '70.00',
      discount: '10.00',
      surcharge: '0.00',
      notes: 'Cliente prefere água morna',
      created_at: '2026-08-25T09:00:00Z',
      updated_at: '2026-08-25T09:00:00Z',
    };
    mockedCreateAppointment.mockResolvedValueOnce(createdAppt);

    renderWithTheme(
      <NewAppointmentModal
        open={true}
        initialDate="2026-08-25T10:00"
        onClose={handleClose}
        onSuccess={handleSuccess}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Adicionar Serviço')).toBeInTheDocument();
    });

    const addServiceInput = screen.getByLabelText('Adicionar Serviço');
    await user.click(addServiceInput);
    const serviceOption = await screen.findByText(/Corte Feminino - R\$ 80\.00/i);
    await user.click(serviceOption);

    expect(screen.getByText('Duração total: 45 min')).toBeInTheDocument();
    expect(screen.getByText('Subtotal: R$ 80.00')).toBeInTheDocument();

    const discountInput = screen.getByLabelText('Desconto (R$)');
    await user.clear(discountInput);
    await user.type(discountInput, '10');

    expect(screen.getByText('Total: R$ 70.00')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(mockedCreateAppointment).toHaveBeenCalledWith(
        expect.objectContaining({
          discount: '10',
          services: [
            expect.objectContaining({
              service_id: 1,
              price: '80.00',
              duration_minutes: 45,
            }),
          ],
        }),
      );
    });

    expect(toast.success).toHaveBeenCalledWith('Agendamento criado com sucesso!');
    expect(handleSuccess).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
