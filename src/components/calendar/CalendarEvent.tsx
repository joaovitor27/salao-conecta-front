import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type CalendarAppointment, getStatusColors, formatTime } from '@/utils/calendar.utils';

interface CalendarEventProps {
  appointment: CalendarAppointment;
  onClick: (event: React.MouseEvent<HTMLElement>, appointment: CalendarAppointment) => void;
  /** Modo compacto para a view mensal (só mostra horário + nome) */
  compact?: boolean;
}

export default function CalendarEvent({ appointment, onClick, compact = false }: CalendarEventProps) {
  const theme = useTheme();
  const colors = getStatusColors(appointment.status);
  const isCancelled = appointment.status === 'cancelled';

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    onClick(e, appointment);
  };

  if (compact) {
    return (
      <Box
        onClick={handleClick}
        sx={{
          px: 0.75,
          py: 0.25,
          mb: 0.25,
          borderRadius: '4px',
          bgcolor: colors.bg,
          cursor: 'pointer',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          transition: 'all 0.15s ease',
          borderLeft: `3px solid ${colors.border}`,
          '&:hover': {
            filter: 'brightness(0.95)',
            transform: 'scale(1.01)',
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.7rem',
            lineHeight: 1.4,
            color: colors.text,
            fontWeight: 600,
            textDecoration: isCancelled ? 'line-through' : 'none',
          }}
        >
          {formatTime(appointment.start)} {appointment.clientName}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      onClick={handleClick}
      sx={{
        px: 1,
        py: 0.5,
        borderRadius: '6px',
        bgcolor: colors.bg,
        borderLeft: `3px solid ${colors.border}`,
        cursor: 'pointer',
        overflow: 'hidden',
        height: '100%',
        transition: 'all 0.15s ease',
        '&:hover': {
          boxShadow: theme.palette.custom.shadows.card,
          filter: 'brightness(0.97)',
        },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.7rem',
          fontWeight: 700,
          color: colors.text,
          lineHeight: 1.3,
          display: 'block',
          textDecoration: isCancelled ? 'line-through' : 'none',
        }}
      >
        {formatTime(appointment.start)} – {formatTime(appointment.end)}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.7rem',
          fontWeight: 600,
          color: colors.text,
          lineHeight: 1.3,
          display: 'block',
          textDecoration: isCancelled ? 'line-through' : 'none',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {appointment.clientName}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.65rem',
          color: colors.text,
          lineHeight: 1.3,
          opacity: 0.8,
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {appointment.services?.length > 0
          ? appointment.services.length === 1
            ? appointment.services[0].name
            : `${appointment.services[0].name} +${appointment.services.length - 1}`
          : 'Nenhum serviço'}
      </Typography>
    </Box>
  );
}
