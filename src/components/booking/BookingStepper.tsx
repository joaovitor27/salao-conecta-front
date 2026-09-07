import { Stepper, Step, StepLabel, useTheme, useMediaQuery } from '@mui/material';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface BookingStepperProps {
  activeStep: number;
}

export function BookingStepper({ activeStep }: BookingStepperProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const steps = [
    { label: 'Serviços', icon: <ContentCutIcon /> },
    { label: 'Profissional', icon: <PersonIcon /> },
    { label: 'Horário', icon: <CalendarMonthIcon /> },
    { label: 'Seus Dados', icon: <PhoneIcon /> },
    { label: 'Confirmação', icon: <CheckCircleIcon /> },
  ];

  return (
    <Stepper activeStep={activeStep} alternativeLabel={!isMobile} sx={{ mb: 4, pt: 2 }}>
      {steps.map((step, index) => (
        <Step key={step.label}>
          <StepLabel
            icon={step.icon}
            sx={{
              '& .MuiStepLabel-iconContainer': {
                color: index <= activeStep ? theme.palette.primary.main : theme.palette.grey[400],
              },
            }}
          >
            {!isMobile && step.label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
