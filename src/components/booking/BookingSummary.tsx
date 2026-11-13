import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Divider, CircularProgress, Stack } from '@mui/material';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useOptionalBooking } from './BookingLayout';
import {
  bookingService,
  type ProfessionalData,
  type ServiceData,
} from '@/services/booking.service';
import {
  addMinutesToTimeLabel,
  type BookingDateSession,
} from '@/components/booking/DateTimePicker';
import { useParams } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';

interface BookingSummaryProps {
  selectedServiceIds: number[];
  selectedProfessionalId: string | null;
  professionalsByService?: Record<number, string | null>;
  selectedDateTime: string;
  sessions?: BookingDateSession[];
  clientName: string;
  clientPhone: string;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function BookingSummary({
  selectedServiceIds,
  selectedProfessionalId,
  professionalsByService = {},
  selectedDateTime,
  sessions,
  clientName,
  clientPhone,
  onSubmit,
  isSubmitting,
}: BookingSummaryProps) {
  const bookingCtx = useOptionalBooking();
  const salonName = bookingCtx?.salon.brand_name ?? 'Salão';
  const { slug } = useParams<{ slug: string }>();
  const [services, setServices] = useState<ServiceData[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalData[]>([]);

  useEffect(() => {
    if (!slug) return;
    bookingService.getServices(slug).then((allServices) => {
      setServices(allServices.filter((s) => selectedServiceIds.includes(s.id)));
    });
    bookingService.getProfessionals(slug).then(setProfessionals);
  }, [slug, selectedServiceIds]);

  const effectiveSessions = useMemo<BookingDateSession[]>(() => {
    if (sessions && sessions.length > 0) return sessions;
    return [
      {
        id: 'default',
        dateTime: selectedDateTime,
        serviceIds: selectedServiceIds,
      },
    ];
  }, [sessions, selectedDateTime, selectedServiceIds]);

  const resolveProfessionalName = (serviceId: number): string => {
    const profId =
      serviceId in professionalsByService
        ? professionalsByService[serviceId]
        : selectedProfessionalId;
    if (!profId) return 'Indiferente (definido pelo salão)';
    const found = professionals.find((p) => p.id === profId);
    return found ? found.first_name : 'Indiferente (definido pelo salão)';
  };

  const totalPrice = useMemo(() => {
    return effectiveSessions.reduce((sessionSum, sess) => {
      const sids = sess.serviceIds.length > 0 ? sess.serviceIds : selectedServiceIds;
      const subtotal = sids.reduce((acc, sid) => {
        const srv = services.find((s) => s.id === sid);
        return acc + (srv ? parseFloat(srv.price) : 0);
      }, 0);
      return sessionSum + subtotal;
    }, 0);
  }, [effectiveSessions, selectedServiceIds, services]);

  return (
    <Box sx={{ maxWidth: 540, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center" mb={3}>
        Confirme seu agendamento
      </Typography>

      <Card sx={{ mb: 4, textAlign: 'left' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" color="primary.main" gutterBottom>
            {salonName}
          </Typography>

          <Stack spacing={2.5}>
            {effectiveSessions.map((sess, idx) => {
              const formattedDate = sess.dateTime
                .slice(0, 10)
                .split('-')
                .reverse()
                .join('/');
              const startTime = sess.dateTime.slice(11, 16);
              const sids = sess.serviceIds.length > 0 ? sess.serviceIds : selectedServiceIds;
              const sessionServices = services.filter((s) => sids.includes(s.id));
              const durationSum = sessionServices.reduce(
                (acc, s) => acc + s.duration_minutes,
                0,
              );
              const endTime =
                sess.endTime ||
                (startTime && durationSum > 0
                  ? addMinutesToTimeLabel(startTime, durationSum)
                  : '');

              return (
                <Box
                  key={sess.id || idx}
                  sx={{
                    p: effectiveSessions.length > 1 ? 2 : 0,
                    bgcolor:
                      effectiveSessions.length > 1 ? 'background.default' : 'transparent',
                    borderRadius: 2,
                  }}
                >
                  {effectiveSessions.length > 1 && (
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      color="primary.main"
                      display="block"
                      mb={1}
                    >
                      Atendimento {idx + 1}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={2} sx={{ mb: 1.5, color: 'text.secondary' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarMonthIcon fontSize="small" />
                      <Typography variant="body2">{formattedDate}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon fontSize="small" />
                      <Typography variant="body2">
                        {endTime ? `${startTime} às ${endTime}` : startTime}
                      </Typography>
                    </Box>
                  </Stack>

                  {sessionServices.map((s) => (
                    <Box
                      key={`${sess.id}-${s.id}`}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {s.service_name}
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {resolveProfessionalName(s.id)}
                          </Typography>
                        </Stack>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        R$ {parseFloat(s.price).toFixed(2).replace('.', ',')}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              );
            })}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
            Seus Dados
          </Typography>
          <Typography variant="body2">{clientName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {clientPhone}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Total
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              R$ {totalPrice.toFixed(2).replace('.', ',')}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Button
        variant="default"
        size="xl"
        fullWidth
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Confirmar Agendamento'}
      </Button>
    </Box>
  );
}
