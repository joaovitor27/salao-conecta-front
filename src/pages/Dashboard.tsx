import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, useTheme, CircularProgress, TextField, Autocomplete } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

// Ícones
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import { dashboardService, type DashboardSummary } from '@/services/dashboard.service';
import { appointmentService } from '@/services/appointment.service';
import { businessService, type Employee, type ServiceSalon } from '@/services/business.service';
import { AppointmentFormModal } from '@/components/NewAppointmentModal';
import { AppointmentCard } from '@/components/AppointmentCard';
import { usePermissions } from '@/hooks/usePermissions';
import toast from 'react-hot-toast';

// ── Status filter options (static) ──
const STATUS_OPTIONS = [
  { id: 'pending', label: 'Pendente' },
  { id: 'confirmed', label: 'Confirmado' },
  { id: 'completed', label: 'Concluído' },
  { id: 'cancelled', label: 'Cancelado' },
] as const;

export default function Dashboard() {
  const { user } = useAuth();
  const theme = useTheme();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  // Modal state
  const [editingApptId, setEditingApptId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter auxiliary data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<ServiceSalon[]>([]);

  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    professional: [] as string[],
    service: [] as string[],
    status: [] as string[],
  });

  const { canSeeFinancials, isProfessionalOnly, isManagerOrOwner, currentRole } = usePermissions();

  // ── Load auxiliar data once ──
  useEffect(() => {
    const fetchAux = async () => {
      try {
        const [emp, serv] = await Promise.all([
          !isProfessionalOnly ? businessService.getEmployees() : Promise.resolve([]),
          businessService.getServices(),
        ]);
        if (emp.length) setEmployees(emp);
        setServices(serv);
      } catch (error) {
        console.error('Erro ao carregar auxiliares do dashboard:', error);
      }
    };
    void fetchAux();
  }, [isProfessionalOnly]);

  // ── Dashboard data (reloads on filter or refresh change) ──
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getSummary(filters);
        setSummary(data);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    void fetchDashboard();
  }, [refresh, filters]);

  // ── Actions ──
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await appointmentService.updateStatus(id, newStatus);
      toast.success('Status atualizado com sucesso!');
      setRefresh((prev) => prev + 1);
    } catch (error: any) {
      const msg = error.response?.data?.status?.[0] || error.response?.data?.detail || 'Erro ao atualizar status.';
      toast.error(msg);
    }
  };

  const handleEdit = (id: number) => {
    setEditingApptId(id);
    setIsModalOpen(true);
  };

  const handleNewAppointment = () => {
    setEditingApptId(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingApptId(null);
  };

  // ── Render ──
  if (loading && !summary) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const appointments = summary?.appointments || [];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 6 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
            Olá, {user?.first_name || 'Profissional'} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Aqui está o resumo da sua agenda para hoje, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}.
          </Typography>
        </Box>
        {!isProfessionalOnly && (
          <Button variant="hero" size="lg" onClick={handleNewAppointment}>
            <AddIcon sx={{ mr: 1 }} />
            Novo Agendamento
          </Button>
        )}
      </Box>

      {/* ── Filtros ── */}
      <Paper sx={{ p: 2, mb: 4, borderRadius: 3, boxShadow: theme.palette.custom.shadows.card, border: `1px solid ${theme.palette.divider}` }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: isProfessionalOnly ? 4 : 3 }}>
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
          {!isProfessionalOnly && (
            <Grid size={{ xs: 12, md: 3 }}>
              <Autocomplete
                multiple
                size="small"
                options={employees}
                getOptionLabel={(opt) => opt.full_name}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                value={employees.filter((e) => filters.professional.includes(e.id))}
                onChange={(_e, val) => setFilters({ ...filters, professional: val.map((v) => v.id) })}
                renderInput={(params) => <TextField {...params} label="Profissionais" />}
              />
            </Grid>
          )}
          <Grid size={{ xs: 12, md: isProfessionalOnly ? 4 : 3 }}>
            <Autocomplete
              multiple
              size="small"
              options={services}
              getOptionLabel={(opt) => opt.service_name}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              value={services.filter((s) => filters.service.includes(String(s.id)))}
              onChange={(_e, val) => setFilters({ ...filters, service: val.map((v) => String(v.id)) })}
              renderInput={(params) => <TextField {...params} label="Serviços" />}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Autocomplete
              multiple
              size="small"
              options={[...STATUS_OPTIONS]}
              getOptionLabel={(opt) => opt.label}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              value={STATUS_OPTIONS.filter((s) => filters.status.includes(s.id))}
              onChange={(_e, val) => setFilters({ ...filters, status: val.map((v) => v.id) })}
              renderInput={(params) => <TextField {...params} label="Status" />}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* ── Mini-Cards de Estatísticas ── */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: canSeeFinancials ? 4 : 6 }}>
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

        {canSeeFinancials && (
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
        )}

        <Grid size={{ xs: 12, md: canSeeFinancials ? 4 : 6 }}>
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
              {summary?.completed_appointments || 0}{' '}
              <span style={{ fontSize: '1rem', fontWeight: 'normal', opacity: 0.8 }}>/ {summary?.total_appointments || 0} clientes</span>
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Lista de Atendimentos ── */}
      <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ mb: 3 }}>
        Próximos Clientes
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {appointments.map((appt) => (
          <AppointmentCard key={appt.id} appointment={appt} onEdit={handleEdit} onStatusChange={handleStatusChange} />
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

      {/* ── Modal ── */}
      <AppointmentFormModal
        open={isModalOpen}
        appointmentId={editingApptId}
        onClose={handleModalClose}
        onSuccess={() => setRefresh((prev) => prev + 1)}
      />
    </Box>
  );
}
