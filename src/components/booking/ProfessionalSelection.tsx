import { useEffect, useState } from 'react';
import { Box, Typography, Grid, CircularProgress, Avatar } from '@mui/material';
import { Card, CardContent } from '@/components/ui/Card';
import { bookingService, type ProfessionalData } from '@/services/booking.service';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

interface ProfessionalSelectionProps {
  selectedServiceIds: number[];
  selectedProfessionalId: string | null;
  onChange: (id: string | null) => void;
}

export function ProfessionalSelection({ selectedServiceIds, selectedProfessionalId, onChange }: ProfessionalSelectionProps) {
  const { slug } = useParams<{ slug: string }>();
  const [professionals, setProfessionals] = useState<ProfessionalData[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    bookingService.getProfessionals(slug, selectedServiceIds)
      .then(setProfessionals)
      .finally(() => setLoading(false));
  }, [slug, selectedServiceIds]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center" mb={3}>
        Você tem preferência por algum profissional?
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        {/* Opção "Sem preferência" */}
        <Grid item xs={12} sm={6} md={4}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card
              onClick={() => onChange(null)}
              sx={{
                borderColor: selectedProfessionalId === null ? theme.palette.custom.accent.main : 'divider',
                bgcolor: selectedProfessionalId === null ? theme.palette.custom.accent[50] : 'background.paper',
                borderWidth: selectedProfessionalId === null ? 2 : 1,
              }}
            >
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar sx={{ width: 64, height: 64, mb: 2, bgcolor: theme.palette.grey[300] }}>
                  ?
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold">
                  Sem preferência
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Qualquer profissional disponível
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Profissionais */}
        {professionals.map((prof) => {
          const isSelected = selectedProfessionalId === prof.id;
          return (
            <Grid item xs={12} sm={6} md={4} key={prof.id}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  onClick={() => onChange(prof.id)}
                  sx={{
                    borderColor: isSelected ? theme.palette.custom.accent.main : 'divider',
                    bgcolor: isSelected ? theme.palette.custom.accent[50] : 'background.paper',
                    borderWidth: isSelected ? 2 : 1,
                  }}
                >
                  <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar sx={{ width: 64, height: 64, mb: 2, bgcolor: theme.palette.primary.main }}>
                      {prof.first_name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {prof.first_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Profissional
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
