// src/theme.ts
import { createTheme } from '@mui/material/styles';

const rawColors = {
  // Cores Core do Design System
  // Os valores HSL originais eram:
  // --background: 0 0% 100%; -> #ffffff
  // --foreground: 220 25% 15%; -> #1f2a3a (aproximado)
  background: '#ffffff',
  foreground: '#1f2a3a', // Ajustado para ser mais próximo de 220 25% 15%

  // Primary - Elegant Navy Blue (Ajustado para se aproximar do HSL original)
  // HSL original: --primary: 215 45% 25%; --primary-light: 215 35% 35%; --primary-glow: 215 55% 65%;
  primary: {
    50: '#eef4f9', // Mais claro
    100: '#dae3ed',
    200: '#b6c6d7',
    300: '#91aac1',
    400: '#6d8eab',
    500: '#487295', // HSL(215, 45%, 25%) -> #487295 (azul marinho mais profundo)
    600: '#3c607f',
    700: '#2f4e69',
    800: '#233d53',
    900: '#162b3d',
    light: '#6d8eab', // Ajustado para ser mais próximo de 215 35% 35%
    glow: 'rgba(109, 142, 171, 0.65)', // Usado para shadow-glow (HSL(215, 55%, 65%))
  },

  // Secondary - Rose Gold (Ajustado para ser mais próximo do HSL original)
  // HSL original: --secondary: 345 35% 75%; --secondary-deep: 345 45% 65%; --secondary-light: 345 25% 85%;
  secondary: {
    50: '#fcf4f5',
    100: '#f5e4e6',
    200: '#ebd1d5',
    300: '#e0bfc4',
    400: '#d5acb3',
    500: '#ca9a9f', // HSL(345, 35%, 75%) -> #CA9A9F (Rosa Gold mais suave)
    600: '#b1858a',
    700: '#987076',
    800: '#7e5b61',
    900: '#65464c',
    light: '#e0bfc4', // HSL(345, 25%, 85%)
    deep: '#b1858a', // HSL(345, 45%, 65%)
  },

  // Accent - Vibrant Coral CTA (Manter este, parece OK)
  // HSL original: --accent: 12 85% 60%;
  accent: {
    50: '#fff7f5',
    100: '#ffece6',
    200: '#ffd7c9',
    300: '#ffbca5',
    400: '#ff9c7b',
    500: '#ff774e', // HSL(12, 85%, 60%) -> #FF774E (Coral vibrante)
    600: '#e55f32',
    700: '#cc4b28',
    800: '#b33e21',
    900: '#99311a',
    foreground: '#ffffff', // Contraste com o accent principal
    hover: '#ff8a4c', // Exemplo de hover, ajustar conforme necessário
  },

  // Beauty Colors (Ajustado para se aproximar do HSL original)
  // HSL original: --beauty-purple: 280 25% 70%; --beauty-pink: 330 40% 80%; --beauty-gold: 45 65% 75%;
  beauty: {
    purple: '#c9aae6', // HSL(280, 25%, 70%)
    pink: '#f2b1d0', // HSL(330, 40%, 80%)
    gold: '#f0d080', // HSL(45, 65%, 75%)
  },

  // Neutral Palette (Ajustado para se aproximar do HSL original)
  gray: {
    50: '#fcfcfd', // Mais claro
    100: '#f5f7f8',
    200: '#e8ecef',
    300: '#dae0e6',
    400: '#c5cbd3',
    500: '#acb3bb',
    600: '#949ba3',
    700: '#7c838b',
    800: '#646b72',
    900: '#4b5259',
  },

  // Semantic Colors (ajustar conforme os rawColors acima)
  border: '#e8ecef', // Usando gray[200]
  muted: {
    DEFAULT: '#f5f7f8', // Usando gray[100]
    foreground: '#acb3bb', // Usando gray[500]
  },
};

const typography = {
  fontFamily: '"Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  h1: {
    fontFamily: '"Montserrat", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  h2: {
    fontFamily: '"Montserrat", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  h3: {
    fontFamily: '"Montserrat", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  h4: {
    fontFamily: '"Montserrat", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  h5: {
    fontFamily: '"Montserrat", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  h6: {
    fontFamily: '"Montserrat", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  caption: {
    color: rawColors.muted.foreground,
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.43,
  },
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: rawColors.primary[500],
      light: rawColors.primary.light, // Usando a nova propriedade light
      dark: rawColors.primary[700],
      contrastText: '#fff', // Para a maioria dos botões primary, white é bom
    },
    secondary: {
      main: rawColors.secondary[500],
      light: rawColors.secondary.light, // Usando a nova propriedade light
      dark: rawColors.secondary.deep, // Usando a nova propriedade deep
      contrastText: rawColors.foreground, // Cor de texto para secundário
    },
    background: {
      default: rawColors.background,
      paper: rawColors.muted.DEFAULT,
    },
    text: {
      primary: rawColors.foreground,
      secondary: rawColors.muted.foreground,
      disabled: rawColors.gray[400],
    },
    error: {
      // Adicionando uma cor de erro explícita
      main: '#dc2626', // Vermelho para destructive
      contrastText: '#fff',
    },
    custom: {
      beauty: {
        purple: rawColors.beauty.purple,
        pink: rawColors.beauty.pink,
        gold: rawColors.beauty.gold,
      },
      accent: {
        main: rawColors.accent[500],
        ...rawColors.accent, // Mantém os tons 50-900
      },
      gray: {
        ...rawColors.gray,
      },
      gradients: {
        primary: `linear-gradient(135deg, ${rawColors.primary[500]}, ${rawColors.primary.light})`,
        secondary: `linear-gradient(135deg, ${rawColors.secondary.deep}, ${rawColors.secondary[500]})`,
        beauty: `linear-gradient(135deg, ${rawColors.beauty.purple}, ${rawColors.beauty.pink})`,
        hero: `linear-gradient(135deg, ${rawColors.primary[500]}, ${rawColors.accent[500]})`,
        card: `linear-gradient(135deg, ${rawColors.background}, ${rawColors.muted.DEFAULT})`,
      },
      shadows: {
        elegant: `0 10px 40px -10px ${rawColors.primary[500]}15`, // Ajuste de opacidade manual
        card: `0 4px 20px -4px ${rawColors.foreground}1A`, // Ajuste de opacidade manual
        glow: `0 0 30px ${rawColors.primary.glow}`, // Usando a cor glow diretamente
        beauty: `0 8px 32px -8px ${rawColors.beauty.purple}33`, // Ajuste de opacidade manual
      },
      radius: {
        default: '0.75rem',
        xl: '1.5rem',
      },
      sidebar: {
        background: rawColors.gray[100],
        foreground: rawColors.gray[700],
        primary: rawColors.primary[500],
        primaryForeground: '#fff',
        accent: rawColors.gray[200],
        accentForeground: rawColors.foreground,
        border: rawColors.border,
        ring: rawColors.primary[500],
      },
    },
  },
  typography,
  transitions: {
    elegant: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'all 0.3s ease-out',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: rawColors.background,
          color: rawColors.foreground,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
