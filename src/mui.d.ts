// src/mui.d.ts

// 1. Extensões para componentes específicos (Button, Accordion, etc.)
import '@mui/material/Button';
import '@mui/material/Typography';
import '@mui/material/Accordion';
import React, { ReactNode, SyntheticEvent } from 'react';

declare module '@mui/material/Button' {
  interface ButtonPropsSizeOverrides {
    default: true;
    sm: true;
    lg: true;
    xl: true;
    icon: true;
  }
  interface ButtonPropsVariantOverrides {
    default: true;
    hero: true;
    accent: true;
    secondary: true;
    beauty: true;
    outline: true;
    'outline-beauty': true;
    destructive: true;
    ghost: true;
    link: true;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    h1: true;
    h2: true;
    h3: true;
    h4: true;
    h5: true;
    h6: true;
    body1: true;
    body2: true;
    caption: true;
  }
}

declare module '@mui/material/Accordion' {
  interface AccordionProps {
    value?: string;
    className?: string;
    children?: ReactNode; // 'children' é opcional no tipo AccordionProps do MUI.
    expanded?: boolean;
    onChange?: (event: SyntheticEvent, isExpanded: boolean) => void;
  }
}

// 2. Extensões para o tema principal (Theme, Palette, Transitions, Breakpoints)
import '@mui/material/styles';

declare module '@mui/material/styles' {
  // Aumente os breakpoints padrão para incluir o seu 'xxl'
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    xxl: true;
  }

  // Aumente a tipagem das variantes de tipografia para permitir objetos
  interface TypographyVariants {
    h1: React.CSSProperties;
    h2: React.CSSProperties;
    h3: React.CSSProperties;
    h4: React.CSSProperties;
    h5: React.CSSProperties;
    h6: React.CSSProperties;
    body1: React.CSSProperties;
    body2: React.CSSProperties;
    caption: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    h1?: React.CSSProperties;
    h2?: React.CSSProperties;
    h3?: React.CSSProperties;
    h4?: React.CSSProperties;
    h5?: React.CSSProperties;
    h6?: React.CSSProperties;
    body1?: React.CSSProperties;
    body2?: React.CSSProperties;
    caption?: React.CSSProperties;
  }

  // Aumente a paleta de cores para incluir suas cores personalizadas
  interface Palette {
    custom: {
      beauty: { purple: string; pink: string; gold: string };
      accent: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
        main: string;
        foreground: string;
      };
      gray: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
      };
      gradients: {
        primary: string;
        secondary: string;
        beauty: string;
        hero: string;
        card: string;
      };
      shadows: {
        elegant: string;
        card: string;
        glow: string;
        beauty: string;
      };
      radius: {
        default: string;
        xl: string;
      };
      sidebar: {
        background: string;
        foreground: string;
        primary: string;
        primaryForeground: string;
        accent: string;
        accentForeground: string;
        border: string;
        ring: string;
      };
      muted: { DEFAULT: string; foreground: string };
    };
  }

  interface PaletteOptions {
    custom?: {
      beauty?: { purple?: string; pink?: string; gold?: string };
      accent?: {
        50?: string;
        100?: string;
        200?: string;
        300?: string;
        400?: string;
        500?: string;
        600?: string;
        700?: string;
        800?: string;
        900?: string;
        main?: string;
        foreground?: string;
      };
      gray?: {
        50?: string;
        100?: string;
        200?: string;
        300?: string;
        400?: string;
        500?: string;
        600?: string;
        700?: string;
        800?: string;
        900?: string;
      };
      gradients?: {
        primary?: string;
        secondary?: string;
        beauty?: string;
        hero?: string;
        card?: string;
      };
      shadows?: {
        elegant?: string;
        card?: string;
        glow?: string;
        beauty?: string;
      };
      radius?: {
        default?: string;
        xl?: string;
      };
      sidebar?: {
        background?: string;
        foreground?: string;
        primary?: string;
        primaryForeground?: string;
        accent?: string;
        accentForeground?: string;
        border?: string;
        ring?: string;
      };
      muted?: { DEFAULT?: string; foreground?: string };
    };
  }

  // Aumente as transições personalizadas
  interface Transitions {
    elegant: string;
    smooth: string;
  }

  interface TransitionsOptions {
    elegant?: string;
    smooth?: string;
  }
}
