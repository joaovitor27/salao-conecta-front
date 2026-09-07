import { Box, Typography, TextField, Stack } from '@mui/material';

interface ClientIdentificationProps {
  name: string;
  phone: string;
  onChange: (field: 'name' | 'phone', value: string) => void;
}

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export function ClientIdentification({ name, phone, onChange }: ClientIdentificationProps) {
  return (
    <Box sx={{ maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center" mb={3}>
        Para finalizar, seus dados
      </Typography>
      <Stack spacing={3}>
        <TextField
          label="Seu nome completo"
          value={name}
          onChange={(e) => onChange('name', e.target.value)}
          fullWidth
          autoFocus
          placeholder="Ex: Maria Silva"
        />
        <TextField
          label="Seu celular (WhatsApp)"
          value={phone}
          onChange={(e) => onChange('phone', formatPhone(e.target.value))}
          fullWidth
          placeholder="(11) 99999-9999"
        />
      </Stack>
    </Box>
  );
}
