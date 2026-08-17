import { Box, Typography, Grid, Paper, Avatar, useTheme, Chip, IconButton } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

// Ícones
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// Mock Data para o Front-end
const mockAppointments = [
  {
    id: 1,
    client: 'Amanda Nunes',
    service: 'Corte + Escova',
    time: '14:00',
    duration: '60 min',
    status: 'confirmed',
    avatar: 'https://i.pravatar.cc/150?u=1',
  },
  {
    id: 2,
    client: 'Beatriz Silva',
    service: 'Coloração Completa',
    time: '15:30',
    duration: '120 min',
    status: 'pending',
    avatar: 'https://i.pravatar.cc/150?u=2',
  },
  {
    id: 3,
    client: 'Carolina Costa',
    service: 'Manicure e Pedicure',
    time: '17:30',
    duration: '45 min',
    status: 'completed',
    avatar: 'https://i.pravatar.cc/150?u=3',
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const theme = useTheme();

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Chip
            size="small"
            label="Confirmado"
            sx={{ bgcolor: `${theme.palette.primary.main}20`, color: theme.palette.primary.main, fontWeight: 600 }}
          />
        );
      case 'pending':
        return <Chip size="small" label="Pendente" sx={{ bgcolor: '#FFF3E0', color: '#E65100', fontWeight: 600 }} />;
      case 'completed':
        return <Chip size="small" label="Concluído" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600 }} />;
      default:
        return <Chip size="small" label={status} />;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 6 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
            Olá, {user?.first_name || 'Profissional'} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Aqui está o resumo da sua agenda para hoje, 17 de Agosto.
          </Typography>
        </Box>
        <Button variant="hero" size="lg">
          <AddIcon sx={{ mr: 1 }} />
          Novo Agendamento
        </Button>
      </Box>

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
              8
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
              R$ 850<span style={{ fontSize: '1.25rem', color: theme.palette.text.secondary }}>,00</span>
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
              3 <span style={{ fontSize: '1rem', fontWeight: 'normal', opacity: 0.8 }}>/ 8 clientes</span>
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ mb: 3 }}>
        Próximos Clientes
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {mockAppointments.map((appt) => (
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
                  {appt.time}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {appt.duration}
                </Typography>
              </Box>

              {/* Informações do Cliente */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={appt.avatar} sx={{ width: 48, height: 48 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                    {appt.client}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appt.service}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Status e Ações */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {getStatusChip(appt.status)}
              <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Paper>
        ))}

        {mockAppointments.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8, bgcolor: theme.palette.custom.gray[50], borderRadius: 3 }}>
            <CalendarMonthIcon sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Nenhum agendamento para hoje
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
