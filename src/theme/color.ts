/**
 * Utilitários de cor puros (sem dependência de React/MUI).
 * Base para a geração das variações harmônicas da identidade visual do salão.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export const isValidHex = (value: string): boolean => /^#?(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());

/** Aceita `abc`, `#abc`, `aabbcc`, `#AABBCC` e devolve sempre `#AABBCC`. */
export function normalizeHex(value: string, fallback = '#000000'): string {
  const raw = (value || '').trim().replace(/^#/, '');
  if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return fallback.toUpperCase();
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  return `#${full.toUpperCase()}`;
}

export function hexToRgb(hex: string): RGB {
  const normalized = normalizeHex(hex).slice(1);
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (v: number) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta === 0) return { h: 0, s: 0, l: l * 100 };

  const s = delta / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / delta) % 6;
  else if (max === gn) h = (bn - rn) / delta + 2;
  else h = (rn - gn) / delta + 4;

  h *= 60;
  if (h < 0) h += 360;

  return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const hn = ((h % 360) + 360) % 360;
  const sn = clamp(s) / 100;
  const ln = clamp(l) / 100;

  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1));
  const m = ln - c / 2;

  const [r, g, b] =
    hn < 60 ? [c, x, 0]
    : hn < 120 ? [x, c, 0]
    : hn < 180 ? [0, c, x]
    : hn < 240 ? [0, x, c]
    : hn < 300 ? [x, 0, c]
    : [c, 0, x];

  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

export const hexToHsl = (hex: string): HSL => rgbToHsl(hexToRgb(hex));

export const hslToHex = (hsl: HSL): string => rgbToHex(hslToRgb(hsl));

/** Cria uma cor a partir da cor base, ajustando matiz, saturação e luminosidade. */
export function adjust(hex: string, { h = 0, s, l }: { h?: number; s?: number; l?: number }): string {
  const base = hexToHsl(hex);
  return hslToHex({
    h: base.h + h,
    s: s ?? base.s,
    l: l ?? base.l,
  });
}

export const lighten = (hex: string, amount: number): string => {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex({ h, s, l: clamp(l + amount) });
};

export const darken = (hex: string, amount: number): string => lighten(hex, -amount);

export const saturate = (hex: string, amount: number): string => {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex({ h, s: clamp(s + amount), l });
};

/** Interpola duas cores. `weight` 0 = cor A, 1 = cor B. */
export function mix(hexA: string, hexB: string, weight: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const w = clamp(weight, 0, 1);
  return rgbToHex({
    r: a.r + (b.r - a.r) * w,
    g: a.g + (b.g - a.g) * w,
    b: a.b + (b.b - a.b) * w,
  });
}

/** Converte hex + opacidade em `rgba()`. */
export function alpha(hex: string, opacity: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${clamp(opacity, 0, 1)})`;
}

/** Luminância relativa (WCAG 2.1). */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const channel = (value: number) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Razão de contraste WCAG entre duas cores (1 a 21). */
export function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  const [light, dark] = a > b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}

/** Escolhe entre texto claro e escuro para garantir leitura sobre `background`. */
export function readableTextOn(background: string, dark = '#1F2A3A', light = '#FFFFFF'): string {
  return contrastRatio(background, light) >= contrastRatio(background, dark) ? light : dark;
}

/**
 * Ajusta a luminosidade de `hex` até atingir o contraste mínimo desejado
 * contra `background`. Usado para manter títulos legíveis com qualquer cor escolhida.
 */
export function ensureContrast(hex: string, background: string, minRatio = 4.5): string {
  if (contrastRatio(hex, background) >= minRatio) return hex;

  const goDarker = relativeLuminance(background) > 0.4;
  let candidate = hex;
  for (let step = 0; step < 20; step += 1) {
    candidate = goDarker ? darken(candidate, 4) : lighten(candidate, 4);
    if (contrastRatio(candidate, background) >= minRatio) return candidate;
  }
  return goDarker ? '#101827' : '#FFFFFF';
}
