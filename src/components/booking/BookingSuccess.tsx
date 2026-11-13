import { Box, Typography, Stack } from '@mui/material';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { type BookingConfirmation } from '@/services/booking.service';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Phone as PhoneIcon } from 'lucide-react';

interface BookingSuccessProps {
  confirmation: BookingConfirmation;
  onReset: () => void;
}

function formatDateDisplay(raw: string): string {
  if (raw.includes('/')) return raw;
  return raw.split('-').reverse().join('/');
}

export function BookingSuccess({ confirmation, onReset }: BookingSuccessProps) {
  const date = formatDateDisplay(confirmation.date);
  const time = confirmation.start_time.slice(0, 5);
  const endTime = confirmation.end_time ? confirmation.end_time.slice(0, 5) : '';
  const hasMultipleSessions = Boolean(
    confirmation.sessions && confirmation.sessions.length > 1,
  );

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <CheckCircleIcon sx={{ fontSize: 80, color: '#25D366', mb: 2 }} />
      </motion.div>

      <Typography variant="h4" gutterBottom fontWeight="bold">
        Agendamento Realizado!
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Tudo certo, {confirmation.client_name.split(' ')[0]}! Te esperamos no {confirmation.salon_name}.
      </Typography>

      <Card sx={{ mb: 4, textAlign: 'left' }}>
        <CardContent sx={{ p: 3 }}>
          {!hasMultipleSessions && (
            <Stack direction="row" spacing={3} justifyContent="center" mb={3}>
              <Box sx={{ textAlign: 'center' }}>
                <CalendarMonthIcon color="primary" sx={{ mb: 1 }} />
                <Typography variant="body2" fontWeight="bold">{date}</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <AccessTimeIcon color="primary" sx={{ mb: 1 }} />
                <Typography variant="body2" fontWeight="bold">{time}</Typography>
                {endTime && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    até {endTime}
                  </Typography>
                )}
              </Box>
            </Stack>
          )}

          {hasMultipleSessions && confirmation.sessions && (
            <Stack spacing={1.5} mb={2.5}>
              {confirmation.sessions.map((sess, idx) => (
                <Stack
                  key={sess.appointment_id || idx}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1.5 }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarMonthIcon color="primary" fontSize="small" />
                    <Typography variant="body2" fontWeight="bold">
                      {formatDateDisplay(sess.date)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTimeIcon color="primary" fontSize="small" />
                    <Typography variant="body2">
                      {sess.start_time.slice(0, 5)} às {sess.end_time.slice(0, 5)}
                    </Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}

          <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2 }}>
            {confirmation.services.map((s, idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  {s.service_name} <br />
                  <Typography component="span" variant="caption" color="text.secondary">
                    com {s.professional_name || 'Qualquer profissional'}
                  </Typography>
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  R$ {parseFloat(s.price).toFixed(2).replace('.', ',')}
                </Typography>
              </Box>
            ))}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mt: 2,
                pt: 2,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold">Total</Typography>
              <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                R$ {parseFloat(confirmation.total_price).toFixed(2).replace('.', ',')}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        <Button
          fullWidth
          size="xl"
          sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#20BA56' }, color: 'white' }}
          onClick={() => window.open(confirmation.whatsapp_url, '_blank')}
        >
          <PhoneIcon size={20} style={{ marginRight: 8 }} />
          Acompanhar pelo WhatsApp
        </Button>
        <Button
          variant="outline"
          fullWidth
          size="lg"
          onClick={onReset}
        >
          Fazer novo agendamento
        </Button>
      </Stack>
    </Box>
  );
}
