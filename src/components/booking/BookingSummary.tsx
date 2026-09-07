import { Box, Typography, Divider, CircularProgress, Stack } from '@mui/material';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useBooking } from './BookingLayout';
import { useEffect, useState } from 'react';
import { bookingService, type ServiceData } from '@/services/booking.service';
import { useParams } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';

interface BookingSummaryProps {
  selectedServiceIds: number[];
  selectedProfessionalId: string | null;
  selectedDateTime: string;
  clientName: string;
  clientPhone: string;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function BookingSummary({
  selectedServiceIds,
  selectedProfessionalId,
  selectedDateTime,
  clientName,
  clientPhone,
  onSubmit,
  isSubmitting
}: BookingSummaryProps) {
  const { salon } = useBooking();
  const { slug } = useParams<{ slug: string }>();
  const [services, setServices] = useState<ServiceData[]>([]);
  const [professionalName, setProfessionalName] = useState<string>('Qualquer profissional');

  useEffect(() => {
    if (!slug) return;
    bookingService.getServices(slug).then(allServices => {
      setServices(allServices.filter(s => selectedServiceIds.includes(s.id)));
    });
    if (selectedProfessionalId) {
      bookingService.getProfessionals(slug).then(profs => {
        const prof = profs.find(p => p.id === selectedProfessionalId);
        if (prof) setProfessionalName(prof.first_name);
      });
    }
  }, [slug, selectedServiceIds, selectedProfessionalId]);

  const date = selectedDateTime.slice(0, 10).split('-').reverse().join('/');
  const time = selectedDateTime.slice(11, 16);
  const totalPrice = services.reduce((acc, s) => acc + parseFloat(s.price), 0);

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center" mb={3}>
        Confirme seu agendamento
      </Typography>
      
      <Card sx={{ mb: 4, textAlign: 'left' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" color="primary.main" gutterBottom>
            {salon.brand_name}
          </Typography>
          
          <Stack direction="row" spacing={2} sx={{ mb: 2, color: 'text.secondary' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarMonthIcon fontSize="small" />
              <Typography variant="body2">{date}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon fontSize="small" />
              <Typography variant="body2">{time}</Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" fontWeight="bold" mb={1}>Serviços</Typography>
          {services.map(s => (
            <Box key={s.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">{s.service_name}</Typography>
              <Typography variant="body2" fontWeight="bold">R$ {parseFloat(s.price).toFixed(2).replace('.', ',')}</Typography>
            </Box>
          ))}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, color: 'text.secondary' }}>
            <PersonIcon fontSize="small" />
            <Typography variant="body2">Profissional: {professionalName}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" fontWeight="bold" mb={1}>Seus Dados</Typography>
          <Typography variant="body2">{clientName}</Typography>
          <Typography variant="body2" color="text.secondary">{clientPhone}</Typography>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">Total</Typography>
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
