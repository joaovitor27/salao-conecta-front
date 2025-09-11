// src/components/MuiAccordion.tsx
import * as React from 'react';
import MuiAccordion, { type AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { type AccordionSummaryProps } from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

// Ícone de seta do MUI.
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// ✅ Simplificado: o styled já lida com o ref automaticamente.
const Accordion = styled(MuiAccordion)(({ theme }) => ({
  border: `1px solid ${theme.palette.custom.gray[200]}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}));

// Estilizando o AccordionSummary
const AccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
  flexDirection: 'row',
  '& .MuiAccordionSummary-content': {
    margin: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
  },
  '&:hover': {
    textDecoration: 'underline',
    backgroundColor: theme.palette.custom.gray[50], // Cor de fundo no hover
  },
  '&.Mui-expanded': {
    borderBottom: `1px solid ${theme.palette.custom.gray[200]}`,
    '& .MuiAccordionSummary-expandIconWrapper': {
      transform: 'rotate(180deg)',
    },
  },
  fontFamily: theme.typography.fontFamily,
  fontWeight: theme.typography.fontWeightMedium,
  color: theme.palette.text.primary,
}));

// Estilizando o AccordionDetails
const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: '16px 0',
  borderTop: 0,
  transition: 'all 0.3s ease-in-out',
  color: theme.palette.text.secondary,
}));

const AccordionItem = React.forwardRef<React.ComponentRef<typeof MuiAccordion>, AccordionProps>(({ className, children, ...props }, ref) => {
  const theme = useTheme();
  return (
    <Accordion
      ref={ref} // ✅ Agora o ref é passado corretamente
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&.Mui-expanded': {
          margin: '0',
        },
        '&:before': {
          display: 'none',
        },
      }}
      {...props}
    >
      {children}
    </Accordion>
  );
});

AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<React.ComponentRef<typeof AccordionSummary>, AccordionSummaryProps>(({ children, ...props }, ref) => {
  useTheme();
  return (
    <AccordionSummary
      ref={ref}
      expandIcon={<ExpandMoreIcon sx={{ transition: 'transform 0.2s' }} />}
      aria-controls="panel-content"
      id="panel-header"
      {...props}
    >
      <Typography variant="body1" fontWeight="medium">
        {children}
      </Typography>
    </AccordionSummary>
  );
});

AccordionTrigger.displayName = 'AccordionTrigger';

const AccordionContent = React.forwardRef<React.ComponentRef<typeof MuiAccordionDetails>, React.ComponentPropsWithoutRef<typeof MuiAccordionDetails>>(
  ({ children, className, ...props }, ref) => (
    <AccordionDetails ref={ref} {...props}>
      {children}
    </AccordionDetails>
  )
);

AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
