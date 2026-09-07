import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, ThemeProvider, CssBaseline } from '@mui/material';
import { bookingService, type SalonData } from '@/services/booking.service';
import { buildBrandPalette } from '@/theme/brandPalette';
import { createThemeFromPalette } from '@/theme';

interface BookingContextData {
  salon: SalonData;
}

const BookingContext = createContext<BookingContextData | undefined>(undefined);

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within BookingLayout');
  return context;
}

export function BookingLayout({ children }: { children: ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const [salon, setSalon] = useState<SalonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    bookingService.getSalon(slug)
      .then(setSalon)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const theme = useMemo(() => {
    if (!salon) return null;
    const palette = buildBrandPalette({
      primary: salon.primary_color,
      secondary: salon.secondary_color,
      accent: salon.accent_color,
    });
    return createThemeFromPalette(palette);
  }, [salon]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !salon || !theme) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column' }}>
        <Typography variant="h4" gutterBottom>Salão não encontrado</Typography>
        <Typography color="text.secondary">Verifique o link e tente novamente.</Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BookingContext.Provider value={{ salon }}>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            {salon.logo_url && (
              <Box component="img" src={salon.logo_url} alt={salon.brand_name} sx={{ height: 40, mr: 2, borderRadius: 1 }} />
            )}
            <Typography variant="h6" fontWeight="bold" color="primary.main">{salon.brand_name}</Typography>
          </Box>
          <Box sx={{ flex: 1, maxWidth: '800px', width: '100%', mx: 'auto', p: { xs: 2, md: 4 } }}>
            {children}
          </Box>
        </Box>
      </BookingContext.Provider>
    </ThemeProvider>
  );
}
