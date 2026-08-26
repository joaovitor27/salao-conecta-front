import { useState, useEffect, useCallback } from 'react';
import { Box, CircularProgress, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import toast from 'react-hot-toast';

import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarMonthView from '@/components/calendar/CalendarMonthView';
import CalendarWeekView from '@/components/calendar/CalendarWeekView';
import CalendarDayView from '@/components/calendar/CalendarDayView';
import CalendarEventPopover from '@/components/calendar/CalendarEventPopover';
import MiniCalendar from '@/components/calendar/MiniCalendar';
import { NewAppointmentModal } from '@/components/NewAppointmentModal';

import {
  type CalendarViewMode,
  type CalendarAppointment,
  getVisibleRange,
  formatDateTimeLocal,
} from '@/utils/calendar.utils';
import { appointmentService, type Appointment } from '@/services/appointment.service';
import { businessService, type Employee, type ServiceSalon } from '@/services/business.service';

// ──────────────────────────────────────────────────────────
//  Transformar Appointment da API em CalendarAppointment
// ──────────────────────────────────────────────────────────

function toCalendarAppointment(appt: Appointment): CalendarAppointment {
  return {
    id: appt.id,
    start: appt.start_time ? new Date(appt.start_time) : new Date(),
    end: appt.end_time ? new Date(appt.end_time) : new Date(),
    status: appt.status,
    statusDisplay: appt.status_display,
    clientName: appt.client?.name || 'Cliente',
    professionalName: appt.professional?.full_name || 'Sem profissional',
    services: appt.items?.map(i => ({ name: i.service_name, price: i.price })) || [],
    totalPrice: appt.total_price || '0.00',
    discount: appt.discount || '0.00',
    notes: appt.notes,
  };
}

// ──────────────────────────────────────────────────────────
//  Página Agenda
// ──────────────────────────────────────────────────────────

export default function Agenda() {
  const theme = useTheme();

  // State principal
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Dados auxiliares (dropdowns)
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<ServiceSalon[]>([]);

  // Filtros
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Modal de agendamento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | string | null>(null);
  const [modalInitialDate, setModalInitialDate] = useState<string>('');

  // Popover de evento
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [popoverAppointment, setPopoverAppointment] = useState<CalendarAppointment | null>(null);

  // ── Carregar dados auxiliares ────────────────────────────
  useEffect(() => {
    const fetchAuxData = async () => {
      try {
        const [emp, serv] = await Promise.all([
          businessService.getEmployees(),
          businessService.getServices(),
        ]);
        setEmployees(emp);
        setServices(serv);
      } catch (error) {
        console.error('Erro ao carregar dados auxiliares:', error);
      }
    };
    void fetchAuxData();
  }, []);

  // ── Carregar agendamentos do período visível ────────────
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const { dateFrom, dateTo } = getVisibleRange(currentDate, viewMode);
        const data = await appointmentService.listByDateRange(dateFrom, dateTo, {
          professional: selectedProfessionals,
          service: selectedServices,
        });
        setAppointments(data.map(toCalendarAppointment));
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        toast.error('Erro ao carregar agendamentos.');
      } finally {
        setLoading(false);
      }
    };
    void fetchAppointments();
  }, [currentDate, viewMode, refreshKey, selectedProfessionals, selectedServices]);

  // ── Handlers ────────────────────────────────────────────

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleEventClick = useCallback(
    (event: React.MouseEvent<HTMLElement>, appointment: CalendarAppointment) => {
      setPopoverAnchor(event.currentTarget);
      setPopoverAppointment(appointment);
    },
    [],
  );

  const handleSlotClick = useCallback((date: Date) => {
    setEditingAppointmentId(null);
    setModalInitialDate(formatDateTimeLocal(date));
    setIsModalOpen(true);
  }, []);

  const handleNewAppointment = useCallback(() => {
    setEditingAppointmentId(null);
    setModalInitialDate('');
    setIsModalOpen(true);
  }, []);

  const handleEditAppointment = useCallback((id: number | string) => {
    setEditingAppointmentId(id);
    setModalInitialDate('');
    setIsModalOpen(true);
  }, []);

  const handleStatusChange = useCallback(
    async (id: number | string, status: string) => {
      try {
        await appointmentService.updateStatus(id, status);
        toast.success('Status atualizado!');
        handleRefresh();
      } catch (error) {
        console.error(error);
        toast.error('Erro ao atualizar status.');
      }
    },
    [handleRefresh],
  );

  const handleClosePopover = useCallback(() => {
    setPopoverAnchor(null);
    setPopoverAppointment(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingAppointmentId(null);
    setModalInitialDate('');
  }, []);

  const handleDateSelect = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // ── Render da view ativa ────────────────────────────────

  const renderCalendarView = () => {
    const viewProps = {
      currentDate,
      appointments,
      onEventClick: handleEventClick,
      onSlotClick: handleSlotClick,
    };

    switch (viewMode) {
      case 'day':
        return <CalendarDayView {...viewProps} />;
      case 'week':
        return <CalendarWeekView {...viewProps} />;
      case 'month':
        return <CalendarMonthView {...viewProps} />;
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header com navegação, filtros e toggle de view */}
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onDateChange={setCurrentDate}
        onViewModeChange={setViewMode}
        onNewAppointment={handleNewAppointment}
        employees={employees}
        services={services}
        selectedProfessionals={selectedProfessionals}
        selectedServices={selectedServices}
        onProfessionalFilterChange={setSelectedProfessionals}
        onServiceFilterChange={setSelectedServices}
      />

      {/* Corpo: Mini calendário + Calendário principal */}
      <Box sx={{ display: 'flex', gap: 2, flex: 1, overflow: 'hidden' }}>
        {/* Mini calendário lateral (oculto em mobile) */}
        <Box sx={{ display: { xs: 'none', lg: 'block' }, flexShrink: 0 }}>
          <MiniCalendar
            currentDate={currentDate}
            onDateSelect={handleDateSelect}
            appointments={appointments}
          />
        </Box>

        {/* Calendário principal */}
        <Paper
          sx={{
            flex: 1,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderCalendarView()
          )}
        </Paper>
      </Box>

      {/* Popover de detalhes do evento */}
      <CalendarEventPopover
        anchorEl={popoverAnchor}
        appointment={popoverAppointment}
        onClose={handleClosePopover}
        onEdit={handleEditAppointment}
        onStatusChange={handleStatusChange}
      />

      {/* Modal de criar/editar agendamento */}
      <NewAppointmentModal
        open={isModalOpen}
        appointmentId={editingAppointmentId as number | null}
        initialDate={modalInitialDate}
        onClose={handleCloseModal}
        onSuccess={handleRefresh}
      />
    </Box>
  );
}
