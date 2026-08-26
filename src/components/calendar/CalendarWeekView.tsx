import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import {
  CalendarAppointment,
  getWeekDays,
  getHourSlots,
  getAppointmentsForDay,
  getEventPosition,
  getNowLinePosition,
  getStatusColors,
  formatTime,
  isSameDay,
  WEEK_DAYS_SHORT,
  calculateOverlaps
} from '@/utils/calendar.utils';

interface CalendarWeekViewProps {
  currentDate: Date;
  appointments: CalendarAppointment[];
  onEventClick: (event: React.MouseEvent<HTMLElement>, appointment: CalendarAppointment) => void;
  onSlotClick: (date: Date) => void;
}

export default function CalendarWeekView({
  currentDate,
  appointments,
  onEventClick,
  onSlotClick
}: CalendarWeekViewProps) {
  const theme = useTheme();
  const weekDays = getWeekDays(currentDate);
  const hourSlots = getHourSlots();
  
  const [nowPosition, setNowPosition] = useState<number | null>(getNowLinePosition());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setNowPosition(getNowLinePosition());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header Row */}
      <Box sx={{ display: 'flex', borderBottom: `1px solid ${theme.palette.divider}` }}>
        {/* Empty top-left cell */}
        <Box sx={{ width: 60, flexShrink: 0, borderRight: `1px solid ${theme.palette.divider}` }} />
        
        {/* Day Headers */}
        {weekDays.map((day, index) => {
          const isToday = isSameDay(day, today);
          return (
            <Box
              key={day.toISOString()}
              sx={{
                flex: 1,
                minWidth: 100,
                textAlign: 'center',
                py: 2,
                borderRight: index < weekDays.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                position: 'relative',
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                {WEEK_DAYS_SHORT[day.getDay()]}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mt: 0.5,
                  display: 'inline-block',
                  width: 32,
                  height: 32,
                  lineHeight: '32px',
                  borderRadius: '50%',
                  bgcolor: isToday ? theme.palette.primary.main : 'transparent',
                  color: isToday ? theme.palette.primary.contrastText : 'inherit',
                  fontWeight: isToday ? 'bold' : 'normal',
                }}
              >
                {day.getDate()}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Scrollable Grid Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
        <Box sx={{ display: 'flex', position: 'relative' }}>
          {/* Time Labels Column */}
          <Box sx={{ width: 60, flexShrink: 0, borderRight: `1px solid ${theme.palette.divider}` }}>
            {hourSlots.map((hour) => (
              <Box
                key={hour}
                sx={{
                  height: 64, // HOUR_HEIGHT
                  position: 'relative',
                  px: 1,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    position: 'absolute',
                    top: -10, // Adjust to center on the line
                    right: 8,
                    bgcolor: 'background.paper',
                    px: 0.5,
                  }}
                >
                  {`${hour.toString().padStart(2, '0')}:00`}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Days Grid Columns */}
          {weekDays.map((day, index) => {
            const isToday = isSameDay(day, today);
            const dayAppointments = calculateOverlaps(getAppointmentsForDay(appointments, day));

            return (
              <Box
                key={day.toISOString()}
                sx={{
                  flex: 1,
                  minWidth: 100,
                  borderRight: index < weekDays.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                  position: 'relative',
                }}
              >
                {/* Horizontal Grid Lines */}
                {hourSlots.map((hour) => {
                  const slotDate = new Date(day);
                  slotDate.setHours(hour, 0, 0, 0);

                  return (
                    <Box
                      key={hour}
                      onClick={() => onSlotClick(slotDate)}
                      sx={{
                        height: 64, // HOUR_HEIGHT
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    />
                  );
                })}

                {/* Now Line */}
                {isToday && nowPosition !== null && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: nowPosition,
                      left: 0,
                      right: 0,
                      height: 2,
                      bgcolor: 'error.main',
                      zIndex: 2,
                      pointerEvents: 'none',
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'error.main',
                        position: 'absolute',
                        left: -4,
                        top: -3,
                      }}
                    />
                  </Box>
                )}

                {/* Appointments */}
                {dayAppointments.map((appointment) => {
                  const { top, height } = getEventPosition(appointment.start, appointment.end);
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
                        top,
                        left: `calc(${leftPct * 100}%)`,
                        width: `calc(${widthPct * 100}% - 2px)`,
                        height,
                        bgcolor: colors.bg,
                        color: colors.text,
                        borderLeft: `3px solid ${colors.border}`,
                        borderRadius: '6px',
                        p: 0.5,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        zIndex: 1,
                        transition: (theme.transitions as any).smooth || 'all 0.3s ease',
                        '&:hover': {
                          filter: 'brightness(0.95)',
                          zIndex: 3,
                        },
                      }}
                    >
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, lineHeight: 1.2 }}>
                        {formatTime(appointment.start)} - {formatTime(appointment.end)}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.2, fontWeight: 500, mt: 0.5 }}>
                        {appointment.clientName}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.2, opacity: 0.8 }}>
                        {appointment.services?.length > 0 ? appointment.services.map(s => s.name).join(', ') : 'Serviço'}
                      </Typography>
                    </Paper>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
