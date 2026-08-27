import { useState } from 'react';
import { Box, Paper, Avatar, Typography, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider, useTheme } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import { StatusChip } from '@/components/ui/StatusChip';
import {
  type AppointmentStatus,
  getAllowedTransitions,
  STATUS_ACTION_LABELS,
  canEdit,
} from '@/utils/statusRules';
import { usePermissions } from '@/hooks/usePermissions';
import type { DashboardAppointment } from '@/services/dashboard.service';

interface AppointmentCardProps {
  appointment: DashboardAppointment;
  onEdit: (id: number) => void;
  onStatusChange: (id: number, newStatus: string) => void;
}

export function AppointmentCard({ appointment, onEdit, onStatusChange }: AppointmentCardProps) {
  const theme = useTheme();
  const { canManageSchedules } = usePermissions();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const status = appointment.status as AppointmentStatus;
  const transitions = getAllowedTransitions(status);
  const statusEditable = canEdit(status);
  const editable = statusEditable && canManageSchedules;
  const isTerminal = !statusEditable;

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '--:--';
    const d = new Date(timeString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDuration = (start: string | null, end: string | null) => {
    if (!start || !end) return '';
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    const diffMins = Math.round(diffMs / 60000);
    return `${diffMins} min`;
  };

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const discount = parseFloat(appointment.discount || '0');
  const price = parseFloat(appointment.service_price || '0');
  const finalPrice = price - discount;

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        opacity: isTerminal ? 0.65 : 1,
        transition: theme.transitions.smooth,
        '&:hover': {
          boxShadow: theme.palette.custom.shadows.card,
          borderColor: isTerminal ? theme.palette.divider : theme.palette.primary.light,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {/* Horário */}
        <Box sx={{ textAlign: 'center', minWidth: 80, pr: 3, borderRight: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight="bold" color="primary.main">
            {formatTime(appointment.start_time)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {getDuration(appointment.start_time, appointment.end_time)}
          </Typography>
        </Box>

        {/* Info do Cliente */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: theme.palette.primary.main }}>
            {appointment.client_name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
              {appointment.client_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {appointment.service_name} •{' '}
              {discount > 0 ? (
                <>
                  <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>R$ {price.toFixed(2)}</span>{' '}
                  <span style={{ color: theme.palette.success.main, fontWeight: 600 }}>R$ {finalPrice.toFixed(2)}</span>
                </>
              ) : (
                `R$ ${price.toFixed(2)}`
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Com {appointment.professional_name}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Status e Ações */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <StatusChip status={appointment.status} label={appointment.status_display} />
        <IconButton size="small" sx={{ color: theme.palette.text.secondary }} onClick={handleOpen}>
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* Menu contextual */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {editable && (
          <MenuItem onClick={() => { onEdit(appointment.id); handleClose(); }}>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Editar</ListItemText>
          </MenuItem>
        )}
        {editable && transitions.length > 0 && <Divider />}
        {transitions.map((target) => (
          <MenuItem
            key={target}
            onClick={() => { onStatusChange(appointment.id, target); handleClose(); }}
            sx={target === 'cancelled' ? { color: 'error.main' } : undefined}
          >
            {target === 'cancelled' && (
              <ListItemIcon><BlockIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
            )}
            <ListItemText>{STATUS_ACTION_LABELS[target]}</ListItemText>
          </MenuItem>
        ))}
        {!editable && transitions.length === 0 && (
          <MenuItem disabled>
            <ListItemText>Nenhuma ação disponível</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
}
