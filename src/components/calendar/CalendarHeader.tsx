import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Autocomplete,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Button } from '@/components/ui/Button';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import AddIcon from '@mui/icons-material/Add';

import { type CalendarViewMode, addDays, addMonths, getHeaderTitle } from '@/utils/calendar.utils';
import { type Employee, type ServiceSalon } from '@/services/business.service';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onNewAppointment: () => void;
  employees: Employee[];
  services: ServiceSalon[];
  selectedProfessionals: string[];
  selectedServices: string[];
  onProfessionalFilterChange: (ids: string[]) => void;
  onServiceFilterChange: (ids: string[]) => void;
}

export default function CalendarHeader({
  currentDate,
  viewMode,
  onDateChange,
  onViewModeChange,
  onNewAppointment,
  employees,
  services,
  selectedProfessionals,
  selectedServices,
  onProfessionalFilterChange,
  onServiceFilterChange,
}: CalendarHeaderProps) {
  const theme = useTheme();

  const handlePrev = () => {
    if (viewMode === 'day') onDateChange(addDays(currentDate, -1));
    else if (viewMode === 'week') onDateChange(addDays(currentDate, -7));
    else onDateChange(addMonths(currentDate, -1));
  };

  const handleNext = () => {
    if (viewMode === 'day') onDateChange(addDays(currentDate, 1));
    else if (viewMode === 'week') onDateChange(addDays(currentDate, 7));
    else onDateChange(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newMode: CalendarViewMode | null) => {
    if (newMode) onViewModeChange(newMode);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
      {/* Linha principal: navegação + título + view toggle + botão novo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {/* Lado esquerdo: navegação */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button variant="outline" size="sm" onClick={handleToday}>
            <TodayIcon sx={{ mr: 0.5 }} />
            Hoje
          </Button>
          <IconButton size="small" onClick={handlePrev} sx={{ color: 'text.secondary' }}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton size="small" onClick={handleNext} sx={{ color: 'text.secondary' }}>
            <ChevronRightIcon />
          </IconButton>
          <Typography
            variant="h5"
            fontWeight="bold"
            color="primary.main"
            sx={{ ml: 1, whiteSpace: 'nowrap' }}
          >
            {getHeaderTitle(currentDate, viewMode)}
          </Typography>
        </Box>

        {/* Lado direito: toggle de view + novo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                px: 2,
                py: 0.5,
                borderColor: theme.palette.divider,
                color: theme.palette.text.secondary,
                '&.Mui-selected': {
                  bgcolor: `${theme.palette.primary.main}15`,
                  color: theme.palette.primary.main,
                  borderColor: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: `${theme.palette.primary.main}25`,
                  },
                },
              },
            }}
          >
            <ToggleButton value="day">Dia</ToggleButton>
            <ToggleButton value="week">Semana</ToggleButton>
            <ToggleButton value="month">Mês</ToggleButton>
          </ToggleButtonGroup>

          <Button variant="hero" size="lg" onClick={onNewAppointment}>
            <AddIcon sx={{ mr: 0.5 }} />
            Novo Agendamento
          </Button>
        </Box>
      </Box>

      {/* Linha de filtros */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Autocomplete
          multiple
          size="small"
          options={employees}
          getOptionLabel={(option) => option.full_name}
          value={employees.filter((e) => selectedProfessionals.includes(e.id))}
          onChange={(_e, newValue) => onProfessionalFilterChange(newValue.map((v) => v.id))}
          renderInput={(params) => (
            <TextField {...params} label="Profissionais" placeholder="Todos" />
          )}
          sx={{ minWidth: 220, flex: 1, maxWidth: 350 }}
        />
        <Autocomplete
          multiple
          size="small"
          options={services}
          getOptionLabel={(option) => option.service_name}
          value={services.filter((s) => selectedServices.includes(String(s.id)))}
          onChange={(_e, newValue) => onServiceFilterChange(newValue.map((v) => String(v.id)))}
          renderInput={(params) => (
            <TextField {...params} label="Serviços" placeholder="Todos" />
          )}
          sx={{ minWidth: 220, flex: 1, maxWidth: 350 }}
        />
      </Box>
    </Box>
  );
}
