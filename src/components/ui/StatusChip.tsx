import { Chip, useTheme } from '@mui/material';

const STATUS_CONFIG: Record<string, { bgcolor: string; color: string }> = {
  confirmed: { bgcolor: '#E3F2FD', color: '#1565C0' },
  pending: { bgcolor: '#FFF3E0', color: '#E65100' },
  completed: { bgcolor: '#E8F5E9', color: '#2E7D32' },
  cancelled: { bgcolor: '#FFEBEE', color: '#C62828' },
};

interface StatusChipProps {
  status: string;
  label: string;
}

export function StatusChip({ status, label }: StatusChipProps) {
  const theme = useTheme();
  const config = STATUS_CONFIG[status] ?? {
    bgcolor: theme.palette.custom.gray[100],
    color: theme.palette.text.secondary,
  };

  return (
    <Chip
      size="small"
      label={label}
      sx={{
        bgcolor: config.bgcolor,
        color: config.color,
        fontWeight: 600,
        fontSize: '0.75rem',
      }}
    />
  );
}
