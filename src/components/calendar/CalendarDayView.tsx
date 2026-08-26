import { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  type CalendarAppointment,
  getHourSlots,
  getAppointmentsForDay,
  getEventPosition,
  getNowLinePosition,
  getStatusColors,
  formatTime,
  isSameDay,
  calculateOverlaps
} from '@/utils/calendar.utils';

interface CalendarDayViewProps {
  currentDate: Date;
  appointments: CalendarAppointment[];
  onEventClick: (event: React.MouseEvent<HTMLElement>, appointment: CalendarAppointment) => void;
  onSlotClick: (date: Date) => void;
}

const HOUR_HEIGHT = 64;

export default function CalendarDayView({
  currentDate,
  appointments,
  onEventClick,
  onSlotClick,
}: CalendarDayViewProps) {
  const theme = useTheme();
  const hours = getHourSlots();
  const dayAppointments = calculateOverlaps(getAppointmentsForDay(appointments, currentDate));
  const isToday = isSameDay(currentDate, new Date());
  const [nowPosition, setNowPosition] = useState<number>(getNowLinePosition());

  useEffect(() => {
    if (!isToday) return;
    const intervalId = setInterval(() => {
      setNowPosition(getNowLinePosition());
    }, 60000);
    return () => clearInterval(intervalId);
  }, [isToday]);

  const handleSlotClick = (hour: number) => {
    const slotDate = new Date(currentDate);
    slotDate.setHours(hour, 0, 0, 0);
    onSlotClick(slotDate);
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', overflowY: 'auto' }}>
      {/* Coluna de horários */}
      <Box sx={{ width: 60, flexShrink: 0, borderRight: `1px solid ${theme.palette.divider}` }}>
        {hours.map((hour) => (
          <Box
            key={hour}
            sx={{
              height: HOUR_HEIGHT,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              pr: 1,
              pt: 0,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '0.7rem', lineHeight: 1, mt: '-5px' }}
            >
              {hour.toString().padStart(2, '0')}:00
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Coluna do dia */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        {/* Linhas de grade */}
        {hours.map((hour) => (
          <Box
            key={hour}
            onClick={() => handleSlotClick(hour)}
            sx={{
              height: HOUR_HEIGHT,
              borderBottom: `1px solid ${theme.palette.divider}`,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          />
        ))}

        {/* Eventos */}
        {dayAppointments.map((appointment) => {
          const pos = getEventPosition(appointment.start, appointment.end);
          const colors = getStatusColors(appointment.status);
          
          const leftPct = appointment.left || 0;
          const widthPct = appointment.width || 1;

          return (
            <Paper
              key={appointment.id}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(e, appointment);
              }}
              elevation={0}
              sx={{
                position: 'absolute',
                top: pos.top,
                height: pos.height,
                left: `calc(${leftPct * 100}% + 8px)`,
                width: `calc(${widthPct * 100}% - 16px)`,
                bgcolor: colors.bg,
                color: colors.text,
                borderLeft: `4px solid ${colors.border}`,
                borderRadius: 2,
                p: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                cursor: 'pointer',
                zIndex: 2,
                transition: 'box-shadow 0.2s ease',
                '&:hover': {
                  boxShadow: theme.palette.custom.shadows.card,
                },
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                {formatTime(appointment.start)} – {formatTime(appointment.end)}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }} noWrap>
                {appointment.clientName}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }} noWrap>
                {appointment.services?.length > 0 ? appointment.services.map(s => s.name).join(', ') : 'Serviço'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }} noWrap>
                {appointment.professionalName}
              </Typography>
            </Paper>
          );
        })}

        {/* Linha "agora" */}
        {isToday && (
          <Box
            sx={{
              position: 'absolute',
              top: nowPosition,
              left: 0,
              right: 0,
              height: 2,
              bgcolor: 'error.main',
              zIndex: 3,
              pointerEvents: 'none',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: -4,
                top: -4,
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: 'error.main',
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
}
