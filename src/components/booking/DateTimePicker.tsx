import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, CircularProgress, Stack, TextField, Typography, useTheme } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { bookingService, type AvailabilitySlot } from '@/services/booking.service';
import { useParams } from 'react-router-dom';

interface DateTimePickerProps {
  value: string; // YYYY-MM-DDTHH:mm
  onChange: (value: string) => void;
  professionalId: string | null;
  serviceIds: number[];
  duration: number; // total duration
}

const PERIODS: { key: AvailabilitySlot['period']; label: string }[] = [
  { key: 'morning', label: 'Manhã ☀️' },
  { key: 'afternoon', label: 'Tarde 🌤️' },
  { key: 'evening', label: 'Noite 🌙' },
];

const today = () => new Date().toISOString().slice(0, 10);

export function DateTimePicker({ value, onChange, professionalId, serviceIds, duration }: DateTimePickerProps) {
  const { slug } = useParams<{ slug: string }>();
  const theme = useTheme();
  const [date, setDate] = useState(() => (value ? value.slice(0, 10) : today()));
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [info, setInfo] = useState<{ opens: string | null; closes: string | null; closed: boolean; duration: number }>({ opens: null, closes: null, closed: false, duration: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value && value.slice(0, 10) !== date) setDate(value.slice(0, 10));
  }, [value, date]);

  const servicesKey = serviceIds.join(',');

  useEffect(() => {
    if (!date || !slug) return;
    let active = true;
    setLoading(true);
    bookingService.getAvailability(slug, {
      date,
      service: servicesKey,
      professional: professionalId || undefined,
      duration: duration || undefined,
    }).then((data) => {
      if (!active) return;
      setSlots(data.slots);
      setInfo({ opens: data.opens_at, closes: data.closes_at, closed: data.is_closed, duration: data.duration_minutes });
    }).catch(() => {
      if (active) setSlots([]);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [slug, date, professionalId, servicesKey, duration]);

  const selectedTime = value && value.slice(0, 10) === date ? value.slice(11, 16) : '';
  const grouped = useMemo(() => PERIODS.map((period) => ({ ...period, items: slots.filter((slot) => slot.period === period.key) })), [slots]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center" mb={3}>
        Escolha a data e o horário
      </Typography>
      
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
        <Box sx={{ flex: 1 }}>
          <TextField
            label="Data"
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              if (selectedTime) onChange(`${event.target.value}T${selectedTime}`);
            }}
            inputProps={{ min: today() }}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ mb: 2 }}
          />
          
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {info.closed
                ? 'Salão fechado nesta data.'
                : `Aberto das ${info.opens ?? '--'} às ${info.closes ?? '--'}`}
            </Typography>
            {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
          </Stack>
        </Box>

        <Box sx={{ flex: 2 }}>
          {info.closed && !loading && (
            <Alert severity="warning">Salão fechado neste dia. Por favor, escolha outra data.</Alert>
          )}

          {!loading && !info.closed && slots.length === 0 && (
            <Alert severity="info">Nenhum horário disponível para esta data.</Alert>
          )}

          {!info.closed && slots.length > 0 && (
            <Stack spacing={3}>
              {grouped.filter((period) => period.items.length > 0).map((period) => (
                <Box key={period.key}>
                  <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>
                    {period.label}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {period.items.map((slot) => {
                      const isSelected = slot.label === selectedTime;
                      return (
                        <Chip
                          key={slot.start}
                          label={slot.label}
                          clickable
                          onClick={() => onChange(`${date}T${slot.label}`)}
                          sx={{
                            borderRadius: '20px',
                            fontWeight: isSelected ? 'bold' : 'normal',
                            bgcolor: isSelected ? theme.palette.primary.main : 'background.paper',
                            color: isSelected ? theme.palette.primary.contrastText : 'text.primary',
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
          )}
        </Box>
      </Stack>
    </Box>
  );
}
