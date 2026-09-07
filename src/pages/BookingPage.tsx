import { useState } from 'react';
import { Box, Stack, useTheme } from '@mui/material';
import { Button } from '@/components/ui/Button';
import { BookingLayout } from '@/components/booking/BookingLayout';
import { BookingStepper } from '@/components/booking/BookingStepper';
import { ServiceSelection } from '@/components/booking/ServiceSelection';
import { ProfessionalSelection } from '@/components/booking/ProfessionalSelection';
import { DateTimePicker } from '@/components/booking/DateTimePicker';
import { ClientIdentification } from '@/components/booking/ClientIdentification';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { BookingSuccess } from '@/components/booking/BookingSuccess';
import { AnimatePresence, motion } from 'framer-motion';
import { bookingService, type BookingConfirmation } from '@/services/booking.service';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

function BookingFlow() {
  const { slug } = useParams<{ slug: string }>();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<string>(''); // YYYY-MM-DDTHH:mm
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  const theme = useTheme();

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const canGoNext = () => {
    switch (activeStep) {
      case 0: return selectedServiceIds.length > 0;
      case 1: return true; // optional
      case 2: return selectedDateTime.length > 0;
      case 3: return clientName.length >= 2 && clientPhone.replace(/\D/g, '').length === 11;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!slug) return;
    setIsSubmitting(true);
    try {
      const data = await bookingService.createBooking(slug, {
        client_name: clientName,
        client_phone: clientPhone,
        start_time: selectedDateTime,
        services: selectedServiceIds.map(id => ({ service_id: id, professional_id: selectedProfessionalId || undefined })),
      });
      setConfirmation(data);
      setActiveStep(5);
    } catch (error) {
      toast.error('Erro ao realizar agendamento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedServiceIds([]);
    setSelectedProfessionalId(null);
    setSelectedDateTime('');
    setClientName('');
    setClientPhone('');
    setConfirmation(null);
  };

  if (activeStep === 5 && confirmation) {
    return <BookingSuccess confirmation={confirmation} onReset={handleReset} />;
  }

  return (
    <Box>
      <BookingStepper activeStep={activeStep} />
      
      <Box sx={{ mt: 4, mb: 4, minHeight: 300 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeStep === 0 && (
              <ServiceSelection selectedServiceIds={selectedServiceIds} onChange={setSelectedServiceIds} />
            )}
            {activeStep === 1 && (
              <ProfessionalSelection
                selectedServiceIds={selectedServiceIds}
                selectedProfessionalId={selectedProfessionalId}
                onChange={setSelectedProfessionalId}
              />
            )}
            {activeStep === 2 && (
              <DateTimePicker
                value={selectedDateTime}
                onChange={setSelectedDateTime}
                professionalId={selectedProfessionalId}
                serviceIds={selectedServiceIds}
                duration={0}
              />
            )}
            {activeStep === 3 && (
              <ClientIdentification
                name={clientName}
                phone={clientPhone}
                onChange={(field, val) => field === 'name' ? setClientName(val) : setClientPhone(val)}
              />
            )}
            {activeStep === 4 && (
              <BookingSummary
                selectedServiceIds={selectedServiceIds}
                selectedProfessionalId={selectedProfessionalId}
                selectedDateTime={selectedDateTime}
                clientName={clientName}
                clientPhone={clientPhone}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </Box>

      {activeStep < 4 && (
        <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Voltar
          </Button>
          <Button
            variant="default"
            onClick={handleNext}
            disabled={!canGoNext()}
          >
            Continuar
          </Button>
        </Stack>
      )}
    </Box>
  );
}

export function BookingPage() {
  return (
    <BookingLayout>
      <BookingFlow />
    </BookingLayout>
  );
}
