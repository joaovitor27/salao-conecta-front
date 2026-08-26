import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  getMonthGrid,
  isSameDay,
  addMonths,
  getAppointmentsForDay,
  WEEK_DAYS_SHORT,
  MONTH_NAMES,
  type CalendarAppointment,
} from '@/utils/calendar.utils';

interface MiniCalendarProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  appointments: CalendarAppointment[];
}

export default function MiniCalendar({ currentDate, onDateSelect, appointments }: MiniCalendarProps) {
  const theme = useTheme();
  const [viewMonth, setViewMonth] = React.useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  const today = new Date();

  // Atualizar viewMonth quando currentDate muda de mês
  React.useEffect(() => {
    setViewMonth(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  }, [currentDate.getFullYear(), currentDate.getMonth()]);

  const weeks = getMonthGrid(viewMonth.getFullYear(), viewMonth.getMonth());

  const handlePrevMonth = () => setViewMonth(addMonths(viewMonth, -1));
  const handleNextMonth = () => setViewMonth(addMonths(viewMonth, 1));

  return (
    <Box
      sx={{
        width: 240,
        p: 1.5,
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Header do mês */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <IconButton size="small" onClick={handlePrevMonth} sx={{ color: 'text.secondary' }}>
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <Typography variant="subtitle2" fontWeight={700} color="primary.main">
          {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </Typography>
        <IconButton size="small" onClick={handleNextMonth} sx={{ color: 'text.secondary' }}>
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Dias da semana */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
        {WEEK_DAYS_SHORT.map((day) => (
          <Box key={day} sx={{ textAlign: 'center', py: 0.25 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', fontWeight: 600 }}>
              {day.charAt(0)}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Grid de dias */}
      {weeks.map((week, weekIndex) => (
        <Box key={weekIndex} sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
          {week.map((dayObj, dayIndex) => {
            const isSelected = isSameDay(dayObj.date, currentDate);
            const isDayToday = isSameDay(dayObj.date, today);
            const hasEvents = getAppointmentsForDay(appointments, dayObj.date).length > 0;

            return (
              <Box
                key={dayIndex}
                onClick={() => onDateSelect(dayObj.date)}
                sx={{
                  textAlign: 'center',
                  py: 0.25,
                  cursor: 'pointer',
                  position: 'relative',
                  '&:hover': { bgcolor: `${theme.palette.primary.main}10`, borderRadius: '50%' },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    fontSize: '0.7rem',
                    fontWeight: isSelected || isDayToday ? 700 : 400,
                    opacity: dayObj.isCurrentMonth ? 1 : 0.35,
                    ...(isSelected && {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                    }),
                    ...(isDayToday && !isSelected && {
                      color: 'primary.main',
                      border: `1px solid ${theme.palette.primary.main}`,
                    }),
                  }}
                >
                  {dayObj.date.getDate()}
                </Typography>
                {/* Indicador de eventos */}
                {hasEvents && dayObj.isCurrentMonth && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      bgcolor: isSelected ? 'primary.contrastText' : 'primary.main',
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}
