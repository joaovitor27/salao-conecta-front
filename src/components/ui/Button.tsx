// src/components/MuiButton.tsx
import * as React from 'react';
import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button';
import { type Theme, useTheme } from '@mui/material/styles';
import { rawColors } from '@/theme.tsx';

interface CustomButtonProps extends MuiButtonProps {
  variant?: 'default' | 'hero' | 'accent' | 'secondary' | 'beauty' | 'outline' | 'outline-beauty' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon';
}

const variantStyles = (theme: Theme) => ({
  default: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    boxShadow: theme.palette.custom.shadows.card,
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      boxShadow: theme.palette.custom.shadows.elegant,
      '@media (hover: none)': {
        backgroundColor: theme.palette.primary.main,
      },
    },
  },
  hero: {
    background: theme.palette.custom.gradients.hero,
    color: theme.palette.primary.contrastText,
    boxShadow: 'none',
    transform: 'scale(1)',
    transition: theme.transitions.smooth,
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: theme.palette.custom.shadows.glow,
      background: theme.palette.custom.gradients.hero,
      '@media (hover: none)': {
        transform: 'scale(1)',
        boxShadow: 'none',
      },
    },
  },
  accent: {
    backgroundColor: theme.palette.custom.accent.main,
    color: theme.palette.custom.accent.foreground,
    boxShadow: theme.palette.custom.shadows.card,
    '&:hover': {
      backgroundColor: theme.palette.custom.accent[600],
      boxShadow: theme.palette.custom.shadows.elegant,
      '@media (hover: none)': {
        backgroundColor: theme.palette.custom.accent.main,
      },
    },
  },
  secondary: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    boxShadow: theme.palette.custom.shadows.card,
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
      boxShadow: theme.palette.custom.shadows.elegant,
      '@media (hover: none)': {
        backgroundColor: theme.palette.secondary.main,
      },
    },
  },
  beauty: {
    background: theme.palette.custom.gradients.beauty,
    color: '#fff',
    boxShadow: 'none',
    transform: 'scale(1)',
    transition: theme.transitions.smooth,
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: theme.palette.custom.shadows.beauty,
      background: theme.palette.custom.gradients.beauty,
      '@media (hover: none)': {
        transform: 'scale(1)',
        boxShadow: 'none',
      },
    },
  },
  outline: {
    border: `1px solid ${theme.palette.custom.gray[200]}`,
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.custom.accent[500],
      color: theme.palette.custom.accent.foreground,
      border: `1px solid ${theme.palette.custom.accent[500]}`,
    },
  },
  'outline-beauty': {
    border: `1px solid ${theme.palette.custom.beauty.purple}`,
    backgroundColor: theme.palette.background.default,
    color: theme.palette.custom.beauty.purple,
    '&:hover': {
      backgroundColor: theme.palette.custom.beauty.purple,
      color: '#fff',
    },
  },
  destructive: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
  ghost: {
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.custom.accent[500],
      color: theme.palette.custom.accent.foreground,
    },
  },
  link: {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
    textDecoration: 'none',
    textUnderlineOffset: 4,
    '&:hover': {
      color: theme.palette.primary.dark,
      backgroundColor: rawColors.primary['50'],
    },
  },
});

const sizeStyles = {
  default: {
    height: 40,
    padding: '8px 16px',
    borderRadius: '0.5rem',
  },
  sm: {
    height: 36,
    padding: '6px 12px',
    fontSize: '0.75rem',
    borderRadius: '0.75rem',
  },
  lg: {
    height: 48,
    padding: '12px 32px',
    fontSize: '1rem',
    fontWeight: 'medium',
    borderRadius: '0.75rem',
  },
  xl: {
    height: 56,
    padding: '16px 40px',
    fontSize: '1.125rem',
    fontWeight: 'medium',
    borderRadius: '1rem',
  },
  icon: {
    height: 40,
    width: 40,
    padding: 0,
    minWidth: 40,
  },
};

const Button = React.forwardRef<HTMLButtonElement, CustomButtonProps>(({ children, variant = 'default', size = 'default', ...props }, ref) => {
  const theme = useTheme();

  const getVariantStyles = () => variantStyles(theme)[variant];
  const getSizeStyles = () => sizeStyles[size];

  return (
    <MuiButton
      ref={ref}
      disableElevation
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing(1),
        whiteSpace: 'nowrap',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: props.disabled ? 'none' : 'auto',
        opacity: props.disabled ? 0.5 : 1,
        fontFamily: theme.typography.fontFamily,
        '&:focus-visible': {
          outline: 'none',
          boxShadow: `0 0 0 2px ${theme.palette.text.primary}`,
          outlineOffset: 2,
        },
        '& svg': {
          pointerEvents: 'none',
          width: 16,
          height: 16,
          flexShrink: 0,
        },
        ...getVariantStyles(),
        ...getSizeStyles(),
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
});
Button.displayName = 'Button';

export { Button };
