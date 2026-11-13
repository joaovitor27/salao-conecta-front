import { useState } from 'react';
import { Box, Stack } from '@mui/material';
import { Button } from '@/components/ui/Button';
import { BookingLayout } from '@/components/booking/BookingLayout';
import { BookingStepper } from '@/components/booking/BookingStepper';
import { ServiceSelection } from '@/components/booking/ServiceSelection';
import { ProfessionalSelection } from '@/components/booking/ProfessionalSelection';
import {
  DateTimePicker,
  type BookingDateSession,
} from '@/components/booking/DateTimePicker';
import { ClientIdentification } from '@/components/booking/ClientIdentification';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { BookingSuccess } from '@/components/booking/BookingSuccess';
import { AnimatePresence, motion } from 'framer-motion';
import { bookingService, type BookingConfirmation } from '@/services/booking.service';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

export function BookingFlow() {
  const { slug } = useParams<{ slug: string }>();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const [professionalsByService, setProfessionalsByService] = useState<
    Record<number, string | null>
  >({});
  const [isProfessionalStepValid, setIsProfessionalStepValid] = useState(true);
  const [selectedDateTime, setSelectedDateTime] = useState<string>(''); // YYYY-MM-DDTHH:mm
  const [sessions, setSessions] = useState<BookingDateSession[]>([
    { id: 'session-1', dateTime: '', serviceIds: [] },
  ]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  const handleServicesChange = (ids: number[]) => {
    setSelectedServiceIds(ids);
    setProfessionalsByService((prev) => {
      const next: Record<number, string | null> = {};
      ids.forEach((id) => {
        if (id in prev) next[id] = prev[id];
      });
      return next;
    });
    setSessions((prev) =>
      prev.map((sess) => ({
        ...sess,
        serviceIds: ids,
      })),
    );
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const canGoNext = () => {
    switch (activeStep) {
      case 0:
        return selectedServiceIds.length > 0;
      case 1:
        return isProfessionalStepValid;
      case 2:
        return (
          sessions.length > 0 &&
          sessions.every((s) => s.dateTime.length > 0 && s.serviceIds.length > 0)
        );
      case 3:
        return clientName.trim().length >= 2 && clientPhone.replace(/\D/g, '').length === 11;
      default:
        return false;
    }
  };

  const buildServiceItems = (serviceIdsForSession: number[]) =>
    serviceIdsForSession.map((id) => {
      const profId =
        id in professionalsByService ? professionalsByService[id] : selectedProfessionalId;
      return {
        service_id: id,
        professional_id: profId || undefined,
      };
    });

  const handleSubmit = async () => {
    if (!slug) return;
    setIsSubmitting(true);
    try {
      const validSessions = sessions.filter((s) => s.dateTime.length > 0);
      const firstSession = validSessions[0];
      const payload =
        validSessions.length > 1
          ? {
              client_name: clientName,
              client_phone: clientPhone,
              sessions: validSessions.map((s) => ({
                start_time: s.dateTime,
                services: buildServiceItems(
                  s.serviceIds.length > 0 ? s.serviceIds : selectedServiceIds,
                ),
              })),
            }
          : {
              client_name: clientName,
              client_phone: clientPhone,
              start_time: firstSession ? firstSession.dateTime : selectedDateTime,
              services: buildServiceItems(
                firstSession && firstSession.serviceIds.length > 0
                  ? firstSession.serviceIds
                  : selectedServiceIds,
              ),
            };

      const data = await bookingService.createBooking(slug, payload);
      setConfirmation(data);
      setActiveStep(5);
    } catch {
      toast.error('Erro ao realizar agendamento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedServiceIds([]);
    setSelectedProfessionalId(null);
    setProfessionalsByService({});
    setIsProfessionalStepValid(true);
    setSelectedDateTime('');
    setSessions([{ id: 'session-1', dateTime: '', serviceIds: [] }]);
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
              <ServiceSelection
                selectedServiceIds={selectedServiceIds}
                onChange={handleServicesChange}
              />
            )}
            {activeStep === 1 && (
              <ProfessionalSelection
                selectedServiceIds={selectedServiceIds}
                selectedProfessionalsByService={professionalsByService}
                onChangeByService={setProfessionalsByService}
                selectedProfessionalId={selectedProfessionalId}
                onChange={setSelectedProfessionalId}
                onValidityChange={setIsProfessionalStepValid}
              />
            )}
            {activeStep === 2 && (
              <DateTimePicker
                value={selectedDateTime}
                onChange={setSelectedDateTime}
                professionalId={selectedProfessionalId}
                professionalsByService={professionalsByService}
                serviceIds={selectedServiceIds}
                duration={0}
                sessions={sessions}
                onSessionsChange={setSessions}
              />
            )}
            {activeStep === 3 && (
              <ClientIdentification
                name={clientName}
                phone={clientPhone}
                onChange={(field, val) =>
                  field === 'name' ? setClientName(val) : setClientPhone(val)
                }
              />
            )}
            {activeStep === 4 && (
              <BookingSummary
                selectedServiceIds={selectedServiceIds}
                selectedProfessionalId={selectedProfessionalId}
                professionalsByService={professionalsByService}
                selectedDateTime={selectedDateTime}
                sessions={sessions}
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
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}
        >
          <Button variant="outline" onClick={handleBack} disabled={activeStep === 0}>
            Voltar
          </Button>
          <Button variant="default" onClick={handleNext} disabled={!canGoNext()}>
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
