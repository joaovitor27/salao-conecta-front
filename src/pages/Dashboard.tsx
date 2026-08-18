import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Avatar, useTheme, Chip, IconButton, CircularProgress, Menu, MenuItem, TextField, Autocomplete } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

// Ícones
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import { dashboardService, type DashboardSummary } from '@/services/dashboard.service';
import { appointmentService } from '@/services/appointment.service';
import { businessService, type Employee, type ServiceSalon } from '@/services/business.service';
import { NewAppointmentModal } from '@/components/NewAppointmentModal';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedApptId, setSelectedApptId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<ServiceSalon[]>([]);

  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    professional: [] as string[],
    service: [] as string[],
    status: [] as string[],
  });

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
        console.error("Erro ao carregar auxiliares do dashboard:", error);
      }
    };
    void fetchAuxData();
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getSummary(filters);
        setSummary(data);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    void fetchDashboard();
  }, [refresh, filters]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedApptId(id);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedApptId(null);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedApptId) return;
    try {
      await appointmentService.updateStatus(selectedApptId, newStatus);
      toast.success('Status atualizado com sucesso!');
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar status. Verifique se a transição é permitida.');
    } finally {
      handleCloseMenu();
    }
  };

  const getStatusChip = (status: string, statusDisplay: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Chip
            size="small"
            label={statusDisplay}
            sx={{ bgcolor: `${theme.palette.primary.main}20`, color: theme.palette.primary.main, fontWeight: 600 }}
          />
        );
      case 'pending':
        return <Chip size="small" label={statusDisplay} sx={{ bgcolor: '#FFF3E0', color: '#E65100', fontWeight: 600 }} />;
      case 'completed':
        return <Chip size="small" label={statusDisplay} sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600 }} />;
      default:
        return <Chip size="small" label={statusDisplay} />;
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '--:--';
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getDuration = (start: string | null, end: string | null) => {
    if (!start || !end) return '';
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    const diffMins = Math.round(diffMs / 60000);
    return `${diffMins} min`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const appointments = summary?.appointments || [];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 6 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
            Olá, {user?.first_name || 'Profissional'} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Aqui está o resumo da sua agenda para hoje, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}.
          </Typography>
        </Box>
        <Button variant="hero" size="lg" onClick={() => { setSelectedApptId(null); setIsModalOpen(true); }}>
          <AddIcon sx={{ mr: 1 }} />
          Novo Agendamento
        </Button>
      </Box>

      {/* Barra de Filtros */}
      <Paper sx={{ p: 2, mb: 4, borderRadius: 3, boxShadow: theme.palette.custom.shadows.card, border: `1px solid ${theme.palette.divider}` }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Data"
              type="date"
              size="small"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Autocomplete
              multiple
              size="small"
              options={employees}
              getOptionLabel={(option) => option.full_name}
              value={employees.filter(e => filters.professional.includes(e.id))}
              onChange={(e, newValue) => setFilters({ ...filters, professional: newValue.map(v => v.id) })}
              renderInput={(params) => <TextField {...params} label="Profissionais" />}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Autocomplete
              multiple
              size="small"
              options={services}
              getOptionLabel={(option) => option.service_name}
              value={services.filter(s => filters.service.includes(String(s.id)))}
              onChange={(e, newValue) => setFilters({ ...filters, service: newValue.map(v => String(v.id)) })}
              renderInput={(params) => <TextField {...params} label="Serviços" />}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Autocomplete
              multiple
              size="small"
              options={[
                { id: 'pending', label: 'Pendente' },
                { id: 'confirmed', label: 'Confirmado' },
                { id: 'completed', label: 'Concluído' },
                { id: 'cancelled', label: 'Cancelado' },
              ]}
              getOptionLabel={(option) => option.label}
              value={[
                { id: 'pending', label: 'Pendente' },
                { id: 'confirmed', label: 'Confirmado' },
                { id: 'completed', label: 'Concluído' },
                { id: 'cancelled', label: 'Cancelado' },
              ].filter(s => filters.status.includes(s.id))}
              onChange={(e, newValue) => setFilters({ ...filters, status: newValue.map(v => v.id) })}
              renderInput={(params) => <TextField {...params} label="Status" />}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Mini-Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: theme.palette.custom.shadows.card, border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${theme.palette.primary.main}15`, color: theme.palette.primary.main }}>
                <AccessTimeIcon />
              </Box>
              <Typography variant="h6" color="text.secondary">
                Agendamentos Hoje
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight="bold" color="primary.main">
              {summary?.total_appointments || 0}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: theme.palette.custom.shadows.card, border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${theme.palette.success.main}15`, color: theme.palette.success.main }}>
                <TrendingUpIcon />
              </Box>
              <Typography variant="h6" color="text.secondary">
                Faturamento Estimado
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight="bold" color="primary.main">
              R$ {summary?.estimated_revenue?.split('.')[0] || '0'}
              <span style={{ fontSize: '1.25rem', color: theme.palette.text.secondary }}>
                ,{summary?.estimated_revenue?.split('.')[1] || '00'}
              </span>
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: theme.palette.custom.shadows.card,
              border: `1px solid ${theme.palette.divider}`,
              background: theme.palette.custom.gradients.primary,
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <CheckCircleIcon />
              </Box>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Concluídos
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight="bold" color="white">
              {summary?.completed_appointments || 0} <span style={{ fontSize: '1rem', fontWeight: 'normal', opacity: 0.8 }}>/ {summary?.total_appointments || 0} clientes</span>
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ mb: 3 }}>
        Próximos Clientes
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {appointments.map((appt) => (
          <Paper
            key={appt.id}
            sx={{
              p: 2.5,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'none',
              border: `1px solid ${theme.palette.divider}`,
              transition: theme.transitions.smooth,
              '&:hover': {
                boxShadow: theme.palette.custom.shadows.card,
                borderColor: theme.palette.primary.light,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {/* Horário */}
              <Box sx={{ textAlign: 'center', minWidth: 80, pr: 3, borderRight: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  {formatTime(appt.start_time)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getDuration(appt.start_time, appt.end_time)}
                </Typography>
              </Box>

              {/* Informações do Cliente */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: theme.palette.primary.main }}>
                  {appt.client_name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                    {appt.client_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appt.service_name} • R$ {appt.service_price}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Com {appt.professional_name}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Status e Ações */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {getStatusChip(appt.status, appt.status_display)}
              <IconButton size="small" sx={{ color: theme.palette.text.secondary }} onClick={(e) => handleOpenMenu(e, appt.id)}>
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Paper>
        ))}

        {appointments.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8, bgcolor: theme.palette.custom.gray[50], borderRadius: 3 }}>
            <CalendarMonthIcon sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Nenhum agendamento para hoje
            </Typography>
          </Box>
        )}
      </Box>

      {/* Menu de Ações de Status */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => { setIsModalOpen(true); handleCloseMenu(); }}>Editar</MenuItem>
        <MenuItem onClick={() => handleStatusChange('confirmed')}>Confirmar</MenuItem>
        <MenuItem onClick={() => handleStatusChange('completed')}>Concluir</MenuItem>
        <MenuItem onClick={() => handleStatusChange('cancelled')} sx={{ color: 'error.main' }}>Cancelar</MenuItem>
      </Menu>

      <NewAppointmentModal 
        open={isModalOpen}
        appointmentId={selectedApptId}
        onClose={() => { setIsModalOpen(false); setSelectedApptId(null); }} 
        onSuccess={() => setRefresh(prev => prev + 1)} 
      />
    </Box>
  );
}
