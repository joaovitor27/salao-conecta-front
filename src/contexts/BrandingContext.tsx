// src/contexts/BrandingContext.tsx
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { salonService, type SalonBranding } from '@/services/salon.service';
import {
  applyPaletteCssVars,
  buildBrandPalette,
  DEFAULT_PRIMARY_COLOR,
  type BrandColorsInput,
  type BrandPalette,
} from '@/theme/brandPalette';
import { useAuth } from './AuthContext';

const CACHE_PREFIX = '@SalaoConecta:branding:';

const cacheKey = (slug: string) => `${CACHE_PREFIX}${slug}`;

/** Lê o branding em cache para pintar a tela sem esperar a API (evita "flash"). */
function readCache(slug: string | null): SalonBranding | null {
  if (!slug) return null;
  try {
    const raw = localStorage.getItem(cacheKey(slug));
    return raw ? (JSON.parse(raw) as SalonBranding) : null;
  } catch {
    return null;
  }
}

function writeCache(slug: string, branding: SalonBranding): void {
  try {
    localStorage.setItem(cacheKey(slug), JSON.stringify(branding));
  } catch {
    /* cache é opcional */
  }
}

const brandingToColors = (branding: SalonBranding | null): BrandColorsInput => ({
  primary: branding?.primary_color || DEFAULT_PRIMARY_COLOR,
  secondary: branding?.secondary_color ?? null,
  accent: branding?.accent_color ?? null,
});

interface BrandingContextData {
  branding: SalonBranding | null;
  /** Paleta em uso (considera o preview, quando ativo). */
  palette: BrandPalette;
  /** Paleta persistida do salão, ignorando o preview. */
  savedPalette: BrandPalette;
  isLoading: boolean;
  brandName: string;
  tagline: string;
  logoUrl: string | null;
  refresh: () => Promise<void>;
  /** Atualiza o branding após salvar o perfil, sem recarregar a página. */
  applyBranding: (branding: SalonBranding) => void;
  /** Cores em pré-visualização — aplicam o tema em tempo real sem salvar. */
  previewColors: BrandColorsInput | null;
  setPreviewColors: (colors: BrandColorsInput | null) => void;
}

const BrandingContext = createContext<BrandingContextData>({} as BrandingContextData);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { currentTenant, isAuthenticated } = useAuth();
  const [branding, setBranding] = useState<SalonBranding | null>(() => readCache(currentTenant));
  const [isLoading, setIsLoading] = useState(false);
  const [previewColors, setPreviewColors] = useState<BrandColorsInput | null>(null);

  const loadBranding = useCallback(async () => {
    if (!isAuthenticated || !currentTenant) return;
    setIsLoading(true);
    try {
      const data = await salonService.getBranding();
      setBranding(data);
      writeCache(currentTenant, data);
    } catch {
      // mantém o cache/tema padrão — personalização não deve travar o app
    } finally {
      setIsLoading(false);
    }
  }, [currentTenant, isAuthenticated]);

  useEffect(() => {
    setBranding(readCache(currentTenant));
    void loadBranding();
  }, [currentTenant, loadBranding]);

  const applyBranding = useCallback(
    (updated: SalonBranding) => {
      setBranding(updated);
      setPreviewColors(null);
      if (currentTenant) writeCache(currentTenant, updated);
    },
    [currentTenant]
  );

  const savedPalette = useMemo(() => buildBrandPalette(brandingToColors(branding)), [branding]);

  const palette = useMemo(
    () => (previewColors ? buildBrandPalette(previewColors) : savedPalette),
    [previewColors, savedPalette]
  );

  useEffect(() => {
    applyPaletteCssVars(palette);
  }, [palette]);

  const brandName = branding?.brand_name || branding?.name || 'Salão Conecta';

  useEffect(() => {
    document.title = brandName;
  }, [brandName]);

  const value = useMemo<BrandingContextData>(
    () => ({
      branding,
      palette,
      savedPalette,
      isLoading,
      brandName,
      tagline: branding?.tagline || '',
      logoUrl: branding?.logo_url ?? null,
      refresh: loadBranding,
      applyBranding,
      previewColors,
      setPreviewColors,
    }),
    [branding, palette, savedPalette, isLoading, brandName, loadBranding, applyBranding, previewColors]
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}
