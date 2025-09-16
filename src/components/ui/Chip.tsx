import * as React from 'react';
import Chip, { type ChipProps } from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';

interface MuiChipProps extends Omit<ChipProps, 'variant'> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const MuiChip = React.forwardRef<HTMLDivElement, MuiChipProps>(({ className, variant = 'default', ...props }, ref) => {
  const theme = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: `${theme.palette.primary.main}e6`, // Ajustando opacidade para 80%
          },
        };
      case 'secondary':
        return {
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: `${theme.palette.secondary.main}e6`,
          },
        };
      case 'destructive':
        return {
          backgroundColor: theme.palette.error.main,
          color: theme.palette.error.contrastText,
          '&:hover': {
            backgroundColor: `${theme.palette.error.main}e6`,
          },
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          border: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
        };
      default:
        return {};
    }
  };

  return (
    <Chip
      ref={ref}
      size="small"
      sx={{
        // Estilos base que replicam o cva
        height: 'auto',
        padding: '2px 10px',
        borderRadius: 9999, // 'rounded-full'
        fontWeight: 600,
        fontSize: '0.75rem',
        transition: theme.transitions.create('background-color'),
        '&:focus-visible': {
          outline: 'none',
          boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
        // Aplica os estilos da variante
        ...getVariantStyles(),
      }}
      {...props}
    />
  );
});

MuiChip.displayName = 'MuiChip';

export { MuiChip as Chip };
