import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, CircularProgress, Stack, TextField, Typography, useTheme } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { businessService, type AvailabilitySlot } from '@/services/business.service';

interface TimeSlotPickerProps {
  /** Valor no formato "YYYY-MM-DDTHH:mm". */
  value: string;
  onChange: (value: string) => void;
  professionalId?: string | null;
  serviceIds: number[];
  duration: number;
  appointmentId?: number | null;
  error?: string;
}

const PERIODS: { key: AvailabilitySlot['period']; label: string }[] = [
  { key: 'morning', label: 'Manhã' },
  { key: 'afternoon', label: 'Tarde' },
  { key: 'evening', label: 'Noite' },
];

const today = () => new Date().toISOString().slice(0, 10);

export function TimeSlotPicker({
  value,
  onChange,
  professionalId,
  serviceIds,
  duration,
  appointmentId,
  error,
}: TimeSlotPickerProps) {
  const theme = useTheme();
  const [date, setDate] = useState(() => (value ? value.slice(0, 10) : today()));
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [info, setInfo] = useState<{ opens: string | null; closes: string | null; closed: boolean; duration: number }>(
    { opens: null, closes: null, closed: false, duration: 0 },
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value && value.slice(0, 10) !== date) setDate(value.slice(0, 10));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const servicesKey = serviceIds.join(',');

  useEffect(() => {
    if (!date) return;
    let active = true;
    setLoading(true);
    businessService
      .getAvailability({
        date,
        professional: professionalId || undefined,
        services: serviceIds,
        duration: duration || undefined,
        appointment: appointmentId || undefined,
      })
      .then((data) => {
        if (!active) return;
        setSlots(data.slots);
        setInfo({
          opens: data.opens_at,
          closes: data.closes_at,
          closed: data.is_closed,
          duration: data.duration_minutes,
        });
      })
      .catch(() => {
        if (active) setSlots([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, professionalId, servicesKey, duration, appointmentId]);

  const selectedTime = value && value.slice(0, 10) === date ? value.slice(11, 16) : '';
  const grouped = useMemo(
    () => PERIODS.map((period) => ({ ...period, items: slots.filter((slot) => slot.period === period.key) })),
    [slots],
  );
  const hasCustomTime = Boolean(selectedTime) && !slots.some((slot) => slot.label === selectedTime);

  const handleDateChange = (nextDate: string) => {
    setDate(nextDate);
    if (selectedTime) onChange(`${nextDate}T${selectedTime}`);
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 1.5 }}>
        <TextField
          label="Data do atendimento *"
          type="date"
          size="small"
          value={date}
          onChange={(event) => handleDateChange(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          error={Boolean(error)}
          fullWidth
        />
        <TextField
          label="Outro horário"
          type="time"
          size="small"
          value={selectedTime}
          onChange={(event) => onChange(event.target.value ? `${date}T${event.target.value}` : '')}
          slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 300 } }}
          fullWidth
        />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
        <AccessTimeIcon fontSize="small" color="action" />
        <Typography variant="caption" color="text.secondary">
          {info.closed
            ? 'Salão fechado nesta data.'
            : `Expediente ${info.opens ?? '--'} às ${info.closes ?? '--'} · duração estimada de ${info.duration || duration || 30} min`}
          {professionalId ? '' : ' · selecione o profissional para ver a agenda dele'}
        </Typography>
        {loading && <CircularProgress size={14} />}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      {!loading && !info.closed && slots.length === 0 && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Nenhum horário livre nesta data. Escolha outro dia ou informe o horário manualmente.
        </Alert>
      )}

      {hasCustomTime && (
        <Chip
          label={`Horário escolhido: ${selectedTime}`}
          color="primary"
          size="small"
          sx={{ mb: 1 }}
          onDelete={() => onChange('')}
        />
      )}

      <Stack spacing={1.5}>
        {grouped
          .filter((period) => period.items.length > 0)
          .map((period) => (
            <Box key={period.key}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                {period.label}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
                {period.items.map((slot) => {
                  const isSelected = slot.label === selectedTime;
                  return (
                    <Chip
                      key={slot.start}
                      label={slot.label}
                      size="small"
                      clickable
                      onClick={() => onChange(`${date}T${slot.label}`)}
                      title={`${slot.label} até ${slot.end_label}`}
                      sx={{
                        fontWeight: isSelected ? 700 : 500,
                        bgcolor: isSelected ? theme.palette.primary.main : 'transparent',
                        color: isSelected ? theme.palette.primary.contrastText : theme.palette.text.primary,
                        border: `1px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                        '&:hover': {
                          bgcolor: isSelected ? theme.palette.primary.dark : theme.palette.action.hover,
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          ))}
      </Stack>
    </Box>
  );
}
