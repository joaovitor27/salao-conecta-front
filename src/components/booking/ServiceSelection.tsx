import { useEffect, useState } from 'react';
import { Box, Typography, Grid, CircularProgress, Chip } from '@mui/material';
import { Card, CardContent } from '@/components/ui/Card';
import { bookingService, type ServiceData } from '@/services/booking.service';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTheme } from '@mui/material/styles';

interface ServiceSelectionProps {
  selectedServiceIds: number[];
  onChange: (ids: number[]) => void;
}

export function ServiceSelection({ selectedServiceIds, onChange }: ServiceSelectionProps) {
  const { slug } = useParams<{ slug: string }>();
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    if (!slug) return;
    bookingService.getServices(slug)
      .then(setServices)
      .finally(() => setLoading(false));
  }, [slug]);

  const toggleService = (id: number) => {
    if (selectedServiceIds.includes(id)) {
      onChange(selectedServiceIds.filter((s) => s !== id));
    } else {
      onChange([...selectedServiceIds, id]);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  const selectedServices = services.filter(s => selectedServiceIds.includes(s.id));
  const totalDuration = selectedServices.reduce((acc, s) => acc + s.duration_minutes, 0);
  const totalPrice = selectedServices.reduce((acc, s) => acc + parseFloat(s.price), 0);

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center" mb={3}>
        Quais serviços você deseja agendar?
      </Typography>
      <Grid container spacing={2}>
        {services.map((service) => {
          const isSelected = selectedServiceIds.includes(service.id);
          return (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  onClick={() => toggleService(service.id)}
                  sx={{
                    position: 'relative',
                    borderColor: isSelected ? theme.palette.custom.accent.main : 'divider',
                    bgcolor: isSelected ? theme.palette.custom.accent[50] : 'background.paper',
                    borderWidth: isSelected ? 2 : 1,
                  }}
                >
                  {isSelected && (
                    <CheckCircleIcon 
                      sx={{ 
                        position: 'absolute', top: 8, right: 8, 
                        color: theme.palette.custom.accent.main 
                      }} 
                    />
                  )}
                  {service.image_url && (
                    <Box 
                      component="img" 
                      src={service.image_url} 
                      alt={service.service_name} 
                      sx={{ width: '100%', height: 120, objectFit: 'cover', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }} 
                    />
                  )}
                  <CardContent sx={{ p: 2, textAlign: 'left', pt: service.image_url ? 2 : 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {service.service_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: 40 }}>
                      {service.description || 'Sem descrição'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography fontWeight="bold" color="primary.main">
                        R$ {parseFloat(service.price).toFixed(2).replace('.', ',')}
                      </Typography>
                      <Chip label={`${service.duration_minutes} min`} size="small" />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
      
      {selectedServiceIds.length > 0 && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography>
            {selectedServiceIds.length} {selectedServiceIds.length === 1 ? 'serviço selecionado' : 'serviços selecionados'} ({totalDuration} min)
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            Total: R$ {totalPrice.toFixed(2).replace('.', ',')}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
