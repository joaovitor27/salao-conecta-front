import { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, useTheme } from '@mui/material';
import { appointmentService, type Appointment } from '@/services/appointment.service';

interface DaySchedulePreviewProps {
  /** YYYY-MM-DD */
  date: string;
  /** UUID of the professional to filter by */
  professionalId?: string;
  /** ID of the current appointment being edited (to highlight it) */
  currentAppointmentId?: number | null;
}

/**
 * Shows a vertical timeline of the day's appointments so the user can visualize
 * which time slots are already taken before booking a new one.
 */
export function DaySchedulePreview({ date, professionalId, currentAppointmentId }: DaySchedulePreviewProps) {
  const theme = useTheme();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) {
      setAppointments([]);
      return;
    }

    const fetchDay = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = {
          date_from: date,
          date_to: date,
          page_size: 100,
        };
        if (professionalId) {
          params.professional = professionalId;
        }
        const response = await appointmentService.list(params);
        // filter out cancelled
        const active = response.results.filter((a) => a.status !== 'cancelled');
        active.sort((a, b) => {
          if (!a.start_time || !b.start_time) return 0;
          return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
        });
        setAppointments(active);
      } catch (error) {
        console.error('Erro ao carregar agenda do dia:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchDay();
  }, [date, professionalId]);

  if (!date) return null;

  const formatTime = (iso: string | null) => {
    if (!iso) return '--:--';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const statusColors: Record<string, string> = {
    pending: '#FFF3E0',
    confirmed: '#E3F2FD',
    completed: '#E8F5E9',
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        maxHeight: 220,
        overflowY: 'auto',
        bgcolor: theme.palette.custom.gray[50],
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
        Agenda do dia{professionalId ? ' (profissional)' : ''}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={20} />
        </Box>
      ) : appointments.length === 0 ? (
        <Typography variant="caption" color="text.secondary">
          Nenhum atendimento agendado nesta data.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {appointments.map((appt) => {
            const isCurrent = currentAppointmentId != null && appt.id === currentAppointmentId;
            return (
              <Box
                key={appt.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1.5,
                  bgcolor: isCurrent ? `${theme.palette.primary.main}20` : statusColors[appt.status] || theme.palette.background.paper,
                  border: isCurrent ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
                  fontSize: '0.8rem',
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  sx={{ minWidth: 90, color: theme.palette.primary.main }}
                >
                  {formatTime(appt.start_time)} – {formatTime(appt.end_time)}
                </Typography>
                <Typography variant="caption" color="text.primary" sx={{ flexGrow: 1 }}>
                  {appt.client.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {appt.items?.map(i => i.service_name).join(', ') || 'Serviços'}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Paper>
  );
}
