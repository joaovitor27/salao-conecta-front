import React, { useState } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import theme from '@/theme';
import { ClientIdentification } from '@/components/booking/ClientIdentification';
import { BookingStepper } from '@/components/booking/BookingStepper';
import { ServiceSelection } from '@/components/booking/ServiceSelection';
import { ProfessionalSelection } from '@/components/booking/ProfessionalSelection';
import {
  DateTimePicker,
  type BookingDateSession,
} from '@/components/booking/DateTimePicker';
import { BookingSuccess } from '@/components/booking/BookingSuccess';
import {
  bookingService,
  type AvailabilityResponse,
  type BookingConfirmation,
  type ProfessionalData,
  type ServiceData,
} from '@/services/booking.service';

vi.mock('@/services/booking.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/booking.service')>();
  return {
    ...actual,
    bookingService: {
      getSalon: vi.fn(),
      getServices: vi.fn(),
      getProfessionals: vi.fn(),
      getAvailability: vi.fn(),
      createBooking: vi.fn(),
    },
  };
});

const mockedGetServices = vi.mocked(bookingService.getServices);
const mockedGetProfessionals = vi.mocked(bookingService.getProfessionals);
const mockedGetAvailability = vi.mocked(bookingService.getAvailability);

const renderWithThemeAndRouter = (
  ui: React.ReactElement,
  initialEntry = '/agendar/salao-teste',
) => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/agendar/:slug" element={ui} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
};

function ControlledClientIdentification({
  onChangeSpy,
}: {
  onChangeSpy: (field: 'name' | 'phone', value: string) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <ThemeProvider theme={theme}>
      <ClientIdentification
        name={name}
        phone={phone}
        onChange={(field, value) => {
          if (field === 'name') setName(value);
          if (field === 'phone') setPhone(value);
          onChangeSpy(field, value);
        }}
      />
    </ThemeProvider>
  );
}

describe('Booking Flow Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ClientIdentification', () => {
    it('renders name and phone fields and formats phone mask automatically', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn<(field: 'name' | 'phone', value: string) => void>();

      render(<ControlledClientIdentification onChangeSpy={handleChange} />);

      const nameInput = screen.getByPlaceholderText('Ex: Maria Silva');
      const phoneInput = screen.getByPlaceholderText('(11) 99999-9999');

      await user.type(nameInput, 'Ana Paula');
      expect(handleChange).toHaveBeenCalledWith('name', 'Ana Paula');

      await user.type(phoneInput, '11988887777');
      expect(handleChange).toHaveBeenLastCalledWith('phone', '(11) 98888-7777');
      expect(phoneInput).toHaveValue('(11) 98888-7777');
    });
  });

  describe('BookingStepper', () => {
    it('renders all 5 booking steps on desktop viewport', () => {
      render(
        <ThemeProvider theme={theme}>
          <BookingStepper activeStep={2} />
        </ThemeProvider>,
      );

      expect(screen.getByText('Serviços')).toBeInTheDocument();
      expect(screen.getByText('Profissional')).toBeInTheDocument();
      expect(screen.getByText('Horário')).toBeInTheDocument();
      expect(screen.getByText('Seus Dados')).toBeInTheDocument();
      expect(screen.getByText('Confirmação')).toBeInTheDocument();
    });
  });

  describe('ServiceSelection', () => {
    const sampleServices: ServiceData[] = [
      {
        id: 1,
        service_name: 'Corte Feminino',
        description: 'Corte moderno e finalização',
        price: '90.00',
        duration_minutes: 45,
        image_url: '',
      },
      {
        id: 2,
        service_name: 'Hidratação',
        description: 'Tratamento capilar',
        price: '70.00',
        duration_minutes: 30,
        image_url: '',
      },
    ];

    it('loads services, toggles selection on click, and calculates total duration and price', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn<(ids: number[]) => void>();
      mockedGetServices.mockResolvedValueOnce(sampleServices);

      renderWithThemeAndRouter(
        <ServiceSelection selectedServiceIds={[1]} onChange={handleChange} />,
      );

      await waitFor(() => {
        expect(screen.getByText('Corte Feminino')).toBeInTheDocument();
      });
      expect(screen.getByText('Hidratação')).toBeInTheDocument();
      expect(screen.getByText('1 serviço selecionado (45 min)')).toBeInTheDocument();
      expect(screen.getByText('Total: R$ 90,00')).toBeInTheDocument();

      await user.click(screen.getByText('Hidratação'));
      expect(handleChange).toHaveBeenCalledWith([1, 2]);

      await user.click(screen.getByText('Corte Feminino'));
      expect(handleChange).toHaveBeenCalledWith([]);
    });
  });

  describe('ProfessionalSelection', () => {
    const catalogServices: ServiceData[] = [
      {
        id: 1,
        service_name: 'Corte Feminino',
        description: '',
        price: '90.00',
        duration_minutes: 60,
        image_url: '',
      },
      {
        id: 2,
        service_name: 'Maquiagem',
        description: '',
        price: '150.00',
        duration_minutes: 60,
        image_url: '',
      },
    ];

    const catalogProfessionals: ProfessionalData[] = [
      {
        id: 'prof-1',
        first_name: 'Beatriz',
        services: [
          { service_id: 1, service_name: 'Corte Feminino' },
          { service_id: 2, service_name: 'Maquiagem' },
        ],
      },
      {
        id: 'prof-2',
        first_name: 'Camila',
        services: [{ service_id: 1, service_name: 'Corte Feminino' }],
      },
    ];

    it('predefines and disables the select when only one professional performs the service', async () => {
      const handleMapChange = vi.fn<(map: Record<number, string | null>) => void>();
      mockedGetServices.mockResolvedValueOnce(catalogServices);
      mockedGetProfessionals.mockResolvedValueOnce(catalogProfessionals);

      renderWithThemeAndRouter(
        <ProfessionalSelection
          selectedServiceIds={[2]}
          onChangeByService={handleMapChange}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('Maquiagem')).toBeInTheDocument();
      });

      expect(
        screen.getByText(/Único profissional disponível para este serviço \(Beatriz\)/i),
      ).toBeInTheDocument();

      const combobox = screen.getByRole('combobox', { name: /Profissional — Maquiagem/i });
      expect(combobox).toHaveAttribute('aria-disabled', 'true');
      expect(handleMapChange).toHaveBeenCalledWith({ 2: 'prof-1' });
    });

    it('allows choosing a professional or "Indiferente" when multiple professionals exist and choice is not mandatory', async () => {
      const user = userEvent.setup();
      const handleMapChange = vi.fn<(map: Record<number, string | null>) => void>();
      mockedGetServices.mockResolvedValueOnce(catalogServices);
      mockedGetProfessionals.mockResolvedValueOnce(catalogProfessionals);

      renderWithThemeAndRouter(
        <ProfessionalSelection
          selectedServiceIds={[1]}
          requireProfessionalChoice={false}
          onChangeByService={handleMapChange}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('Corte Feminino')).toBeInTheDocument();
      });

      const combobox = screen.getByRole('combobox', {
        name: /Profissional — Corte Feminino/i,
      });
      expect(combobox).not.toHaveAttribute('aria-disabled', 'true');

      await user.click(combobox);
      const listbox = screen.getByRole('listbox');
      expect(
        within(listbox).getByText(/Indiferente \(definido pelo salão\)/i),
      ).toBeInTheDocument();
      expect(within(listbox).getByText('Beatriz')).toBeInTheDocument();
      expect(within(listbox).getByText('Camila')).toBeInTheDocument();

      await user.click(within(listbox).getByText('Camila'));
      expect(handleMapChange).toHaveBeenLastCalledWith({ 1: 'prof-2' });
    });

    it('enforces mandatory professional selection when requireProfessionalChoice is true', async () => {
      const user = userEvent.setup();
      const handleValidity = vi.fn<(valid: boolean) => void>();
      mockedGetServices.mockResolvedValueOnce(catalogServices);
      mockedGetProfessionals.mockResolvedValueOnce(catalogProfessionals);

      renderWithThemeAndRouter(
        <ProfessionalSelection
          selectedServiceIds={[1]}
          requireProfessionalChoice={true}
          onValidityChange={handleValidity}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('Corte Feminino')).toBeInTheDocument();
      });

      expect(handleValidity).toHaveBeenLastCalledWith(false);
      expect(
        screen.getByText(/Selecione quem realizará este serviço para continuar/i),
      ).toBeInTheDocument();

      const combobox = screen.getByRole('combobox', {
        name: /Profissional — Corte Feminino/i,
      });
      await user.click(combobox);
      const listbox = screen.getByRole('listbox');
      expect(
        within(listbox).queryByText(/Indiferente \(definido pelo salão\)/i),
      ).not.toBeInTheDocument();

      await user.click(within(listbox).getByText('Beatriz'));
      await waitFor(() => {
        expect(handleValidity).toHaveBeenLastCalledWith(true);
      });
    });
  });

  describe('DateTimePicker', () => {
    const sampleAvailability: AvailabilityResponse = {
      date: '2026-11-20',
      professional_id: null,
      duration_minutes: 150,
      slot_minutes: 30,
      opens_at: '08:00',
      closes_at: '20:00',
      is_closed: false,
      slots: [
        {
          start: '2026-11-20T10:00:00-03:00',
          end: '2026-11-20T12:30:00-03:00',
          label: '10:00',
          end_label: '12:30',
          period: 'morning',
          segments: [
            {
              service_id: 1,
              service_name: 'Corte Feminino',
              duration_minutes: 60,
              professional_id: 'prof-2',
              professional_name: 'Camila',
              start_label: '10:00',
              end_label: '11:00',
            },
            {
              service_id: 2,
              service_name: 'Maquiagem',
              duration_minutes: 90,
              professional_id: 'prof-1',
              professional_name: 'Beatriz',
              start_label: '11:00',
              end_label: '12:30',
            },
          ],
        },
        {
          start: '2026-11-20T10:30:00-03:00',
          end: '2026-11-20T13:00:00-03:00',
          label: '10:30',
          end_label: '13:00',
          period: 'morning',
        },
      ],
    };

    it('requests 30-min slots, reconciles two professionals, displays automatic end time, supports adding a second date, and opens direct salon chat', async () => {
      const user = userEvent.setup();
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      const handleSessionsChange = vi.fn<(sessions: BookingDateSession[]) => void>();

      mockedGetServices.mockResolvedValue([
        {
          id: 1,
          service_name: 'Corte Feminino',
          description: '',
          price: '90.00',
          duration_minutes: 60,
          image_url: '',
        },
        {
          id: 2,
          service_name: 'Maquiagem',
          description: '',
          price: '150.00',
          duration_minutes: 90,
          image_url: '',
        },
      ]);
      mockedGetProfessionals.mockResolvedValue([
        {
          id: 'prof-1',
          first_name: 'Beatriz',
          services: [{ service_id: 2, service_name: 'Maquiagem' }],
        },
        {
          id: 'prof-2',
          first_name: 'Camila',
          services: [{ service_id: 1, service_name: 'Corte Feminino' }],
        },
      ]);
      mockedGetAvailability.mockResolvedValue(sampleAvailability);

      renderWithThemeAndRouter(
        <DateTimePicker
          value=""
          onChange={vi.fn()}
          professionalId={null}
          professionalsByService={{ 1: 'prof-2', 2: 'prof-1' }}
          serviceIds={[1, 2]}
          duration={150}
          onSessionsChange={handleSessionsChange}
          salonPhone="(11) 98888-7777"
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('10:00')).toBeInTheDocument();
      });

      expect(mockedGetAvailability).toHaveBeenCalledWith(
        'salao-teste',
        expect.objectContaining({
          slot_minutes: 30,
          items: '1:prof-2,2:prof-1',
        }),
      );

      // Mostra aviso de conciliação dos dois profissionais diferentes
      expect(screen.getByText(/Camila e Beatriz/i)).toBeInTheDocument();

      // Seleciona o horário 10:00 -> exibe automaticamente o horário de término (12:30) e os segmentos
      await user.click(screen.getByText('10:00'));
      expect(
        screen.getByText(/Início às 10:00 • Término previsto às 12:30/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/10:00 às 11:00: Corte Feminino \(com Camila\)/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/11:00 às 12:30: Maquiagem \(com Beatriz\)/i),
      ).toBeInTheDocument();

      // Adiciona uma segunda data (ex: duas maquiagens em datas diferentes)
      await user.click(screen.getByRole('button', { name: /adicionar outra data/i }));
      await waitFor(() => {
        expect(screen.getByText('Data 1 de 2')).toBeInTheDocument();
        expect(screen.getByText('Data 2 de 2')).toBeInTheDocument();
      });

      // Botão para conversar diretamente com o salão
      await user.click(
        screen.getByRole('button', { name: /conversar diretamente com o salão/i }),
      );
      expect(openSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^https:\/\/wa\.me\/5511988887777\?text=/),
        '_blank',
      );

      openSpy.mockRestore();
    });
  });

  describe('BookingSuccess', () => {
    const confirmation: BookingConfirmation = {
      appointment_id: 105,
      salon_name: 'Studio Glamour',
      salon_phone: '11999990000',
      client_name: 'Fernanda Costa',
      date: '2026-08-25',
      start_time: '15:30:00',
      end_time: '16:30:00',
      services: [
        {
          service_name: 'Corte + Escova',
          professional_name: 'Beatriz',
          price: '130.00',
          duration_minutes: 60,
        },
      ],
      total_price: '130.00',
      whatsapp_url: 'https://wa.me/5511999990000?text=Agendamento',
    };

    it('renders confirmation summary, opens WhatsApp link, and triggers onReset', async () => {
      const user = userEvent.setup();
      const handleReset = vi.fn<() => void>();
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      render(
        <ThemeProvider theme={theme}>
          <BookingSuccess confirmation={confirmation} onReset={handleReset} />
        </ThemeProvider>,
      );

      expect(screen.getByText('Agendamento Realizado!')).toBeInTheDocument();
      expect(
        screen.getByText('Tudo certo, Fernanda! Te esperamos no Studio Glamour.'),
      ).toBeInTheDocument();
      expect(screen.getByText('25/08/2026')).toBeInTheDocument();
      expect(screen.getByText('15:30')).toBeInTheDocument();
      expect(screen.getByText(/com Beatriz/i)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /acompanhar pelo whatsapp/i }));
      expect(openSpy).toHaveBeenCalledWith(confirmation.whatsapp_url, '_blank');

      await user.click(screen.getByRole('button', { name: /fazer novo agendamento/i }));
      expect(handleReset).toHaveBeenCalledTimes(1);

      openSpy.mockRestore();
    });
  });
});
