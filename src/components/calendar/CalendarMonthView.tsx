import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  getMonthGrid,
  getAppointmentsForDay,
  getStatusColors,
  formatTime,
  isSameDay,
  WEEK_DAYS_SHORT,
  type CalendarAppointment,
} from '@/utils/calendar.utils';

interface CalendarMonthViewProps {
  currentDate: Date;
  appointments: CalendarAppointment[];
  onEventClick: (event: React.MouseEvent<HTMLElement>, appointment: CalendarAppointment) => void;
  onSlotClick: (date: Date) => void;
}

export default function CalendarMonthView({
  currentDate,
  appointments,
  onEventClick,
  onSlotClick,
}: CalendarMonthViewProps) {
  const theme = useTheme();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const weeks = getMonthGrid(year, month);
  const today = new Date();

  const handleCellClick = (date: Date) => {
    const slotDate = new Date(date);
    slotDate.setHours(9, 0, 0, 0);
    onSlotClick(slotDate);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header row - dia da semana */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {WEEK_DAYS_SHORT.map((day) => (
          <Box key={day} sx={{ py: 1, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
              {day}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Grid de semanas */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {weeks.map((week, weekIndex) => (
          <Box
            key={weekIndex}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              flex: 1,
              minHeight: 120,
            }}
          >
            {week.map((dayObj, dayIndex) => {
              const dayAppointments = getAppointmentsForDay(appointments, dayObj.date);
              const isToday = isSameDay(dayObj.date, today);
              const displayed = dayAppointments.slice(0, 3);
              const hiddenCount = dayAppointments.length - 3;

              return (
                <Box
                  key={dayIndex}
                  onClick={() => handleCellClick(dayObj.date)}
                  sx={{
                    borderRight: dayIndex < 6 ? `1px solid ${theme.palette.divider}` : 'none',
                    borderBottom: weekIndex < weeks.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                    p: 0.5,
                    opacity: dayObj.isCurrentMonth ? 1 : 0.4,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    '&:hover': { bgcolor: 'action.hover' },
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  {/* Número do dia */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        width: 26,
                        height: 26,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        fontSize: '0.8rem',
                        fontWeight: isToday ? 'bold' : 'normal',
                        ...(isToday && {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                        }),
                        ...(!isToday && { color: 'text.primary' }),
                      }}
                    >
                      {dayObj.date.getDate()}
                    </Typography>
                  </Box>

                  {/* Eventos */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', flexGrow: 1 }}>
                    {displayed.map((apt) => {
                      const colors = getStatusColors(apt.status);
                      return (
                        <Box
                          key={apt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(e, apt);
                          }}
                          sx={{
                            bgcolor: colors.bg,
                            color: colors.text,
                            borderRadius: 1,
                            px: 0.75,
                            py: 0.25,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            borderLeft: `3px solid ${colors.border}`,
                            cursor: 'pointer',
                            '&:hover': { filter: 'brightness(0.93)' },
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                            {formatTime(apt.start)}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {apt.clientName}
                          </Typography>
                        </Box>
                      );
                    })}

                    {hiddenCount > 0 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ px: 0.75, fontWeight: 600, fontSize: '0.65rem', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                      >
                        +{hiddenCount} mais
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
