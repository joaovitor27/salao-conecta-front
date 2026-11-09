import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import theme from '@/theme';
import { ClientIdentification } from '@/components/booking/ClientIdentification';
import { BookingStepper } from '@/components/booking/BookingStepper';
import { ServiceSelection } from '@/components/booking/ServiceSelection';
import { ProfessionalSelection } from '@/components/booking/ProfessionalSelection';
import { BookingSuccess } from '@/components/booking/BookingSuccess';
import {
  bookingService,
  type BookingConfirmation,
  type ProfessionalData,
  type ServiceData,
} from '@/services/booking.service';

vi.mock('@/services/booking.service', () => ({
  bookingService: {
    getServices: vi.fn(),
    getProfessionals: vi.fn(),
  },
}));

const mockedGetServices = vi.mocked(bookingService.getServices);
const mockedGetProfessionals = vi.mocked(bookingService.getProfessionals);

const renderWithThemeAndRouter = (ui: React.ReactElement, initialEntry = '/agendar/salao-teste') => {
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
    const sampleProfessionals: ProfessionalData[] = [
      {
        id: 'prof-1',
        first_name: 'Beatriz',
        services: [{ service_id: 1, service_name: 'Corte Feminino' }],
      },
    ];

    it('renders professionals and "Sem preferência" option, invoking onChange when clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn<(id: string | null) => void>();
      mockedGetProfessionals.mockResolvedValueOnce(sampleProfessionals);

      renderWithThemeAndRouter(
        <ProfessionalSelection
          selectedServiceIds={[1]}
          selectedProfessionalId={null}
          onChange={handleChange}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('Beatriz')).toBeInTheDocument();
      });
      expect(screen.getByText('Sem preferência')).toBeInTheDocument();

      await user.click(screen.getByText('Beatriz'));
      expect(handleChange).toHaveBeenCalledWith('prof-1');

      await user.click(screen.getByText('Sem preferência'));
      expect(handleChange).toHaveBeenCalledWith(null);
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
