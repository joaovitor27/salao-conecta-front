import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import theme from '@/theme';
import { TimeSlotPicker } from '@/components/appointment/TimeSlotPicker';
import { businessService, type Availability } from '@/services/business.service';

vi.mock('@/services/business.service', () => ({
  businessService: {
    getAvailability: vi.fn(),
  },
}));

const mockedGetAvailability = vi.mocked(businessService.getAvailability);

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('TimeSlotPicker Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches availability slots, groups them by period, and calls onChange on slot click', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn<(val: string) => void>();

    const mockAvailability: Availability = {
      date: '2026-08-25',
      professional_id: 'prof-1',
      duration_minutes: 45,
      opens_at: '09:00',
      closes_at: '18:00',
      is_closed: false,
      slots: [
        {
          start: '2026-08-25T09:00:00-03:00',
          end: '2026-08-25T09:45:00-03:00',
          label: '09:00',
          end_label: '09:45',
          period: 'morning',
        },
        {
          start: '2026-08-25T14:30:00-03:00',
          end: '2026-08-25T15:15:00-03:00',
          label: '14:30',
          end_label: '15:15',
          period: 'afternoon',
        },
      ],
    };

    mockedGetAvailability.mockResolvedValueOnce(mockAvailability);

    renderWithTheme(
      <TimeSlotPicker
        value="2026-08-25T09:00"
        onChange={handleChange}
        professionalId="prof-1"
        serviceIds={[1]}
        duration={45}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Manhã')).toBeInTheDocument();
    });
    expect(screen.getByText('Tarde')).toBeInTheDocument();
    expect(screen.getByText(/Expediente 09:00 às 18:00/i)).toBeInTheDocument();

    const afternoonSlot = screen.getByRole('button', { name: '14:30' });
    await user.click(afternoonSlot);

    expect(handleChange).toHaveBeenCalledWith('2026-08-25T14:30');
  });

  it('displays closed salon message when is_closed is true', async () => {
    mockedGetAvailability.mockResolvedValueOnce({
      date: '2026-08-23',
      professional_id: null,
      duration_minutes: 30,
      opens_at: null,
      closes_at: null,
      is_closed: true,
      slots: [],
    });

    renderWithTheme(
      <TimeSlotPicker
        value="2026-08-23T10:00"
        onChange={vi.fn()}
        serviceIds={[1]}
        duration={30}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(/Salão fechado nesta data\./i)).toBeInTheDocument();
    });
  });

  it('shows warning alert when salon is open but has no free slots and displays error prop if provided', async () => {
    mockedGetAvailability.mockResolvedValueOnce({
      date: '2026-08-25',
      professional_id: 'prof-1',
      duration_minutes: 60,
      opens_at: '09:00',
      closes_at: '18:00',
      is_closed: false,
      slots: [],
    });

    renderWithTheme(
      <TimeSlotPicker
        value="2026-08-25T10:00"
        onChange={vi.fn()}
        professionalId="prof-1"
        serviceIds={[1]}
        duration={60}
        error="Selecione um horário válido."
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Nenhum horário livre nesta data/i),
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Selecione um horário válido.')).toBeInTheDocument();
  });
});
