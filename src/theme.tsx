import { createTheme, type Theme } from '@mui/material/styles';
import {
  buildBrandPalette,
  DEFAULT_PRIMARY_COLOR,
  type BrandColorsInput,
  type BrandPalette,
} from './theme/brandPalette';

/**
 * Paleta padrão do produto. Cada salão sobrescreve estas cores pelo
 * perfil do salão (BrandingContext) — nada aqui é hardcoded nos componentes.
 */
export const defaultPalette: BrandPalette = buildBrandPalette({ primary: DEFAULT_PRIMARY_COLOR });

/** Mantido por compatibilidade: cores cruas da paleta padrão. */
export const rawColors = defaultPalette;

const buildTypography = (colors: BrandPalette) => {
  const heading = {
    fontFamily: '"Montserrat", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    fontWeight: 700,
    lineHeight: 1.2,
  };

  return {
    fontFamily: '"Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    h1: { ...heading, color: colors.primary.readable, fontSize: '2.65rem' },
    h2: { ...heading, color: colors.primary.readable, fontSize: '2rem' },
    h3: { ...heading, color: colors.primary.readable, fontSize: '1.5rem' },
    h4: { ...heading, fontSize: '1.25rem' },
    h5: { ...heading, fontSize: '1rem' },
    h6: { ...heading, fontSize: '0.875rem' },
    caption: {
      color: colors.muted.foreground,
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body1: {
      color: colors.gray[900],
      fontSize: '1.02rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.43,
    },
  };
};

/** Cria o tema do MUI a partir de uma paleta de marca já resolvida. */
export function createThemeFromPalette(colors: BrandPalette): Theme {
  return createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: colors.primary.main,
        light: colors.primary.light,
        dark: colors.primary.dark,
        contrastText: colors.primary.contrastText,
      },
      secondary: {
        main: colors.secondary.main,
        light: colors.secondary.light,
        dark: colors.secondary.deep,
        contrastText: colors.secondary.contrastText,
      },
      background: {
        default: colors.background,
        paper: colors.muted.DEFAULT,
      },
      text: {
        primary: colors.foreground,
        secondary: colors.muted.foreground,
        disabled: colors.gray[400],
      },
      error: {
        main: '#dc2626',
        contrastText: '#fff',
      },
      divider: colors.border,
      custom: {
        muted: { ...colors.muted },
        beauty: { ...colors.beauty },
        accent: {
          main: colors.accent.main,
          foreground: colors.accent.foreground,
          50: colors.accent[50],
          100: colors.accent[100],
          200: colors.accent[200],
          300: colors.accent[300],
          400: colors.accent[400],
          500: colors.accent[500],
          600: colors.accent[600],
          700: colors.accent[700],
          800: colors.accent[800],
          900: colors.accent[900],
        },
        gray: { ...colors.gray },
        gradients: { ...colors.gradients },
        shadows: { ...colors.shadows },
        radius: {
          default: '0.75rem',
          xl: '1.5rem',
        },
        sidebar: {
          background: colors.gray[100],
          foreground: colors.gray[700],
          primary: colors.primary.main,
          primaryForeground: colors.primary.contrastText,
          accent: colors.gray[200],
          accentForeground: colors.foreground,
          border: colors.border,
          ring: colors.primary.main,
        },
      },
    },
    typography: buildTypography(colors),
    transitions: {
      elegant: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      smooth: 'all 0.3s ease-out',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: colors.background,
            color: colors.foreground,
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
}

/** Atalho: cria o tema direto das cores escolhidas pelo salão. */
export const createAppTheme = (colors: BrandColorsInput = {}): Theme =>
  createThemeFromPalette(buildBrandPalette(colors));

const theme = createThemeFromPalette(defaultPalette);

export default theme;
