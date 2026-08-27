/**
 * Geração da paleta harmônica do salão.
 *
 * O usuário escolhe UMA cor (a cor principal) e todas as demais variações usadas
 * no sistema são derivadas dela mantendo as mesmas relações de matiz/saturação
 * do design original — garantindo harmonia para qualquer cor escolhida.
 *
 * Opcionalmente o salão pode sobrescrever a cor secundária e a de destaque.
 */
import { adjust, alpha, ensureContrast, hexToHsl, hslToHex, mix, normalizeHex, readableTextOn } from './color';

export const DEFAULT_PRIMARY_COLOR = '#233B5C';

/** Deslocamentos de matiz que definem a harmonia do design system. */
const HUE_OFFSET = {
  secondary: 130,
  accent: 157,
  beautyPurple: 65,
  beautyPink: 115,
  beautyGold: -170,
} as const;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export interface BrandColorsInput {
  primary?: string | null;
  secondary?: string | null;
  accent?: string | null;
}

export type ColorScale = Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;

export interface BrandPalette {
  background: string;
  foreground: string;
  border: string;
  primary: ColorScale & {
    main: string;
    light: string;
    dark: string;
    glow: string;
    contrastText: string;
    /** Versão com contraste garantido para textos/títulos sobre fundo claro. */
    readable: string;
  };
  secondary: ColorScale & { main: string; light: string; deep: string; contrastText: string };
  accent: ColorScale & { main: string; hover: string; foreground: string };
  beauty: { purple: string; pink: string; gold: string };
  gray: ColorScale;
  muted: { DEFAULT: string; foreground: string };
  gradients: { primary: string; secondary: string; beauty: string; hero: string; card: string };
  shadows: { elegant: string; card: string; glow: string; beauty: string };
  /** Cores efetivamente escolhidas/derivadas (o que é persistido no backend). */
  source: { primary: string; secondary: string; accent: string };
}

/** Gera os 10 tons (50 → 900) a partir da cor base, que fica no tom 500. */
export function buildScale(baseHex: string): ColorScale {
  const base = normalizeHex(baseHex, DEFAULT_PRIMARY_COLOR);
  const { h, s } = hexToHsl(base);
  const deepest = hslToHex({ h, s: clamp(s + 10, 12, 92), l: 8 });

  return {
    50: mix(base, '#FFFFFF', 0.92),
    100: mix(base, '#FFFFFF', 0.8),
    200: mix(base, '#FFFFFF', 0.62),
    300: mix(base, '#FFFFFF', 0.45),
    400: mix(base, '#FFFFFF', 0.28),
    500: base,
    600: mix(base, deepest, 0.12),
    700: mix(base, deepest, 0.26),
    800: mix(base, deepest, 0.4),
    900: mix(base, deepest, 0.55),
  };
}

/** Escala neutra levemente tingida com a matiz da marca, para manter coesão. */
function buildGrayScale(primaryHex: string): ColorScale {
  const { h } = hexToHsl(primaryHex);
  const tone = (l: number, s = 7) => hslToHex({ h, s, l });
  return {
    50: tone(98.5, 5),
    100: tone(96.5, 6),
    200: tone(92.5),
    300: tone(88),
    400: tone(79),
    500: tone(70),
    600: tone(60),
    700: tone(50),
    800: tone(40),
    900: tone(19, 10),
  };
}

/**
 * Deriva as cores companheiras da cor principal.
 * Exposto separadamente para que a tela de personalização mostre a sugestão
 * antes de salvar (e permita sobrescrever).
 */
export function deriveHarmony(primaryHex: string) {
  const primary = normalizeHex(primaryHex, DEFAULT_PRIMARY_COLOR);
  const { s } = hexToHsl(primary);

  return {
    secondary: adjust(primary, { h: HUE_OFFSET.secondary, s: clamp(s * 0.78, 25, 45), l: 75 }),
    accent: adjust(primary, { h: HUE_OFFSET.accent, s: clamp(s + 40, 65, 90), l: 60 }),
    beauty: {
      purple: adjust(primary, { h: HUE_OFFSET.beautyPurple, s: clamp(s - 20, 20, 35), l: 70 }),
      pink: adjust(primary, { h: HUE_OFFSET.beautyPink, s: clamp(s - 5, 30, 45), l: 80 }),
      gold: adjust(primary, { h: HUE_OFFSET.beautyGold, s: clamp(s + 20, 55, 70), l: 75 }),
    },
  };
}

/** Monta a paleta completa usada pelo tema do MUI e pelas CSS variables. */
export function buildBrandPalette(input: BrandColorsInput = {}): BrandPalette {
  const primaryBase = normalizeHex(input.primary || DEFAULT_PRIMARY_COLOR, DEFAULT_PRIMARY_COLOR);
  const harmony = deriveHarmony(primaryBase);

  const secondaryBase = input.secondary ? normalizeHex(input.secondary, harmony.secondary) : harmony.secondary;
  const accentBase = input.accent ? normalizeHex(input.accent, harmony.accent) : harmony.accent;

  const primaryScale = buildScale(primaryBase);
  const secondaryScale = buildScale(secondaryBase);
  const accentScale = buildScale(accentBase);
  const gray = buildGrayScale(primaryBase);

  const { h, s } = hexToHsl(primaryBase);
  const background = '#FFFFFF';
  const foreground = hslToHex({ h, s: clamp(s * 0.55, 8, 25), l: 15 });

  const primary = {
    ...primaryScale,
    main: primaryBase,
    light: adjust(primaryBase, { s: clamp(s * 0.78, 22, 48), l: 35 }),
    dark: primaryScale[800],
    glow: alpha(adjust(primaryBase, { s: clamp(s + 10, 35, 70), l: 65 }), 0.65),
    contrastText: readableTextOn(primaryBase),
    readable: ensureContrast(primaryBase, background, 4.5),
  };

  const secondary = {
    ...secondaryScale,
    main: secondaryBase,
    light: adjust(secondaryBase, { s: clamp(hexToHsl(secondaryBase).s * 0.7, 18, 40), l: 85 }),
    deep: adjust(secondaryBase, { s: clamp(hexToHsl(secondaryBase).s + 10, 25, 60), l: 65 }),
    contrastText: readableTextOn(secondaryBase, foreground),
  };

  const accent = {
    ...accentScale,
    main: accentBase,
    hover: adjust(accentBase, { s: clamp(hexToHsl(accentBase).s - 10, 40, 90), l: 50 }),
    foreground: readableTextOn(accentBase, foreground),
  };

  const muted = { DEFAULT: gray[100], foreground: gray[500] };

  return {
    background,
    foreground,
    border: gray[200],
    primary,
    secondary,
    accent,
    beauty: harmony.beauty,
    gray,
    muted,
    gradients: {
      primary: `linear-gradient(135deg, ${primary.main}, ${primary.light})`,
      secondary: `linear-gradient(135deg, ${secondary.deep}, ${secondary.main})`,
      beauty: `linear-gradient(135deg, ${harmony.beauty.purple}, ${harmony.beauty.pink})`,
      hero: `linear-gradient(135deg, ${primary.main}, ${accent.main})`,
      card: `linear-gradient(135deg, ${background}, ${muted.DEFAULT})`,
    },
    shadows: {
      elegant: `0 10px 40px -10px ${alpha(primary.main, 0.18)}`,
      card: `0 4px 20px -4px ${alpha(foreground, 0.1)}`,
      glow: `0 0 30px ${primary.glow}`,
      beauty: `0 8px 32px -8px ${alpha(harmony.beauty.purple, 0.2)}`,
    },
    source: { primary: primaryBase, secondary: secondaryBase, accent: accentBase },
  };
}

/** Sugestões de cor principal exibidas na tela de personalização. */
export const BRAND_COLOR_PRESETS: { label: string; value: string }[] = [
  { label: 'Azul Marinho', value: '#233B5C' },
  { label: 'Roxo Orquídea', value: '#6D3B8E' },
  { label: 'Vinho', value: '#7A2140' },
  { label: 'Verde Esmeralda', value: '#1F6B54' },
  { label: 'Terracota', value: '#A9502F' },
  { label: 'Rosé', value: '#C2647A' },
  { label: 'Dourado Queimado', value: '#8C6A1F' },
  { label: 'Grafite', value: '#33383F' },
  { label: 'Turquesa', value: '#12666E' },
  { label: 'Índigo', value: '#3B3B8F' },
];

export interface PaletteSwatch {
  label: string;
  value: string;
  hint?: string;
}

export interface PaletteGroup {
  title: string;
  description: string;
  swatches: PaletteSwatch[];
}

/**
 * Descreve as variações geradas para exibição no preview da personalização:
 * o usuário escolhe uma cor e visualiza exatamente o que o sistema vai usar.
 */
export function describePalette(palette: BrandPalette): PaletteGroup[] {
  return [
    {
      title: 'Cor principal',
      description: 'Menus, títulos, botões primários e ícones ativos.',
      swatches: [
        { label: '50', value: palette.primary[50], hint: 'Fundos suaves' },
        { label: '100', value: palette.primary[100] },
        { label: '200', value: palette.primary[200] },
        { label: '300', value: palette.primary[300] },
        { label: '400', value: palette.primary[400], hint: 'Estados hover' },
        { label: '500', value: palette.primary[500], hint: 'Cor escolhida' },
        { label: '600', value: palette.primary[600] },
        { label: '700', value: palette.primary[700] },
        { label: '800', value: palette.primary[800], hint: 'Textos fortes' },
        { label: '900', value: palette.primary[900] },
      ],
    },
    {
      title: 'Cor secundária',
      description: 'Detalhes, chips e destaques suaves — derivada em harmonia.',
      swatches: [
        { label: 'Clara', value: palette.secondary.light },
        { label: 'Base', value: palette.secondary.main },
        { label: 'Profunda', value: palette.secondary.deep },
      ],
    },
    {
      title: 'Cor de destaque',
      description: 'Ações principais (CTA), alertas positivos e badges.',
      swatches: [
        { label: 'Base', value: palette.accent.main },
        { label: 'Hover', value: palette.accent.hover },
        { label: 'Texto', value: palette.accent.foreground, hint: 'Sobre o destaque' },
      ],
    },
    {
      title: 'Tons de apoio',
      description: 'Categorias, gráficos e ilustrações do salão.',
      swatches: [
        { label: 'Lilás', value: palette.beauty.purple },
        { label: 'Rosa', value: palette.beauty.pink },
        { label: 'Dourado', value: palette.beauty.gold },
      ],
    },
    {
      title: 'Neutros',
      description: 'Fundos, bordas e textos secundários, tingidos com a marca.',
      swatches: [
        { label: '50', value: palette.gray[50] },
        { label: '100', value: palette.gray[100] },
        { label: '200', value: palette.gray[200] },
        { label: '400', value: palette.gray[400] },
        { label: '600', value: palette.gray[600] },
        { label: '900', value: palette.gray[900] },
      ],
    },
  ];
}

/** Expõe a paleta como CSS variables (`--sc-*`) para uso fora do MUI. */
export function paletteToCssVars(palette: BrandPalette): Record<string, string> {
  const vars: Record<string, string> = {
    '--sc-background': palette.background,
    '--sc-foreground': palette.foreground,
    '--sc-border': palette.border,
    '--sc-primary': palette.primary.main,
    '--sc-primary-light': palette.primary.light,
    '--sc-primary-dark': palette.primary.dark,
    '--sc-primary-readable': palette.primary.readable,
    '--sc-primary-contrast': palette.primary.contrastText,
    '--sc-primary-glow': palette.primary.glow,
    '--sc-secondary': palette.secondary.main,
    '--sc-secondary-light': palette.secondary.light,
    '--sc-secondary-deep': palette.secondary.deep,
    '--sc-accent': palette.accent.main,
    '--sc-accent-hover': palette.accent.hover,
    '--sc-accent-foreground': palette.accent.foreground,
    '--sc-beauty-purple': palette.beauty.purple,
    '--sc-beauty-pink': palette.beauty.pink,
    '--sc-beauty-gold': palette.beauty.gold,
    '--sc-muted': palette.muted.DEFAULT,
    '--sc-muted-foreground': palette.muted.foreground,
    '--sc-gradient-primary': palette.gradients.primary,
    '--sc-gradient-hero': palette.gradients.hero,
    '--sc-shadow-card': palette.shadows.card,
  };

  ([50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const).forEach((tone) => {
    vars[`--sc-primary-${tone}`] = palette.primary[tone];
    vars[`--sc-gray-${tone}`] = palette.gray[tone];
  });

  return vars;
}

/** Aplica as CSS variables no `<html>` — chamado quando o tema do salão muda. */
export function applyPaletteCssVars(palette: BrandPalette, target?: HTMLElement): void {
  const root = target ?? (typeof document !== 'undefined' ? document.documentElement : undefined);
  if (!root) return;
  Object.entries(paletteToCssVars(palette)).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
