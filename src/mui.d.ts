// src/mui.d.ts
import '@mui/material/styles';
import '@mui/material/Button';

declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      beauty: {
        purple: string;
        pink: string;
        gold: string;
      };
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
    };
  }

  interface PaletteOptions {
    custom?: {
      beauty?: {
        purple?: string;
        pink?: string;
        gold?: string;
      };
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
    };
  }

  // ✅ Adicione esta interface
  interface Transitions {
    elegant: string;
    smooth: string;
  }

  // ✅ Adicione esta interface
  interface TransitionsOptions {
    elegant?: string;
    smooth?: string;
  }
}

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

import '@mui/material/Accordion';

declare module '@mui/material/Accordion' {
  interface AccordionProps {
    value?: string;
    className?: string;
    children: ReactNode;
    expanded?: boolean;
    onChange?: (event: SyntheticEvent, isExpanded: boolean) => void;
  }
}
