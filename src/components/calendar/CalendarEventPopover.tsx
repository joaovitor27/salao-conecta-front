import React from 'react';
import {
  Popover,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Button } from '@/components/ui/Button';

import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import { type CalendarAppointment, getStatusColors, formatTime } from '@/utils/calendar.utils';

interface CalendarEventPopoverProps {
  anchorEl: HTMLElement | null;
  appointment: CalendarAppointment | null;
  onClose: () => void;
  onEdit: (id: number | string) => void;
  onStatusChange: (id: number | string, status: string) => void;
}

import { usePermissions } from '@/hooks/usePermissions';

export default function CalendarEventPopover({
  anchorEl,
  appointment,
  onClose,
  onEdit,
  onStatusChange,
}: CalendarEventPopoverProps) {
  const theme = useTheme();
  const { canManageSchedules } = usePermissions();
  const open = Boolean(anchorEl) && Boolean(appointment);

  if (!appointment) return null;

  const colors = getStatusColors(appointment.status);
  const isCancelled = appointment.status === 'cancelled';
  const isCompleted = appointment.status === 'completed';
  const isTerminal = isCancelled || isCompleted;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            boxShadow: theme.palette.custom.shadows.card,
            border: `1px solid ${theme.palette.divider}`,
            width: 340,
            overflow: 'visible',
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          pb: 1.5,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          borderBottom: `3px solid ${colors.border}`,
        }}
      >
        <Box sx={{ flex: 1, mr: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
            {appointment.clientName}
          </Typography>
          <Chip
            size="small"
            label={appointment.statusDisplay}
            sx={{
              mt: 0.5,
              bgcolor: colors.bg,
              color: colors.text,
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Detalhes */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.primary">
            {formatTime(appointment.start)} – {formatTime(appointment.end)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <ContentCutIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.3 }} />
          <Box>
            {appointment.services && appointment.services.length > 0 ? (
              appointment.services.map((svc, idx) => (
                <Typography key={idx} variant="body2" color="text.primary" sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <span>{svc.name}</span>
                  <span style={{ opacity: 0.7 }}>R$ {svc.price}</span>
                </Typography>
              ))
            ) : (
              <Typography variant="body2" color="text.primary">Sem serviços</Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.primary">
            {appointment.professionalName || 'Sem profissional'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AttachMoneyIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.primary" fontWeight="bold">
            Total: R$ {appointment.totalPrice}
            {Number(appointment.discount) > 0 && (
              <Typography component="span" variant="caption" color="success.main" sx={{ ml: 1 }}>
                (-R$ {appointment.discount})
              </Typography>
            )}
          </Typography>
        </Box>

        {appointment.notes && (
          <>
            <Divider />
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {appointment.notes}
            </Typography>
          </>
        )}
      </Box>

      {/* Ações */}
      {canManageSchedules && (
        <>
          <Divider />
          <Box sx={{ p: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {!isTerminal && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { onEdit(appointment.id); onClose(); }}
                sx={{ flex: 1 }}
              >
                <EditIcon sx={{ mr: 0.5 }} />
                Editar
              </Button>
            )}

            {appointment.status === 'pending' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => { onStatusChange(appointment.id, 'confirmed'); onClose(); }}
                sx={{ flex: 1 }}
              >
                Confirmar
              </Button>
            )}

            {appointment.status === 'confirmed' && (
              <Button
                variant="hero"
                size="sm"
                onClick={() => { onStatusChange(appointment.id, 'completed'); onClose(); }}
                sx={{ flex: 1 }}
              >
                Concluir
              </Button>
            )}

            {!isTerminal && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => { onStatusChange(appointment.id, 'cancelled'); onClose(); }}
                sx={{ flex: 1 }}
              >
                Cancelar
              </Button>
            )}
          </Box>
        </>
      )}
    </Popover>
  );
}
