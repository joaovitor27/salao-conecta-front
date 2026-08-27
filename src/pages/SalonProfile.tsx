import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { SalonLogo } from '@/components/branding/SalonLogo';
import { BrandColorPicker } from '@/components/branding/BrandColorPicker';
import { PalettePreview } from '@/components/branding/PalettePreview';
import { useBranding } from '@/contexts/BrandingContext';
import { usePermissions } from '@/hooks/usePermissions';
import { salonService, type SalonProfile as SalonProfileData } from '@/services/salon.service';
import { buildBrandPalette, DEFAULT_PRIMARY_COLOR, type BrandColorsInput } from '@/theme/brandPalette';

const MAX_LOGO_SIZE = 2 * 1024 * 1024;

interface FormState {
  name: string;
  display_name: string;
  tagline: string;
  description: string;
  email: string;
  phone_number: string;
  website: string;
  colors: BrandColorsInput;
}

const toFormState = (profile: SalonProfileData): FormState => ({
  name: profile.name ?? '',
  display_name: profile.display_name ?? '',
  tagline: profile.tagline ?? '',
  description: profile.description ?? '',
  email: profile.email ?? '',
  phone_number: profile.phone_number ?? '',
  website: profile.website ?? '',
  colors: {
    primary: profile.primary_color || DEFAULT_PRIMARY_COLOR,
    secondary: profile.secondary_color,
    accent: profile.accent_color,
  },
});

export default function SalonProfile() {
  const { applyBranding, setPreviewColors } = useBranding();
  const { isManagerOrOwner } = usePermissions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<SalonProfileData | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await salonService.getProfile();
        setProfile(data);
        setForm(toFormState(data));
      } catch {
        toast.error('Não foi possível carregar o perfil do salão.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  // Pré-visualização global: o app inteiro adota as cores enquanto o usuário escolhe.
  useEffect(() => {
    if (!form) return;
    setPreviewColors(form.colors);
  }, [form?.colors, form, setPreviewColors]);

  useEffect(() => () => setPreviewColors(null), [setPreviewColors]);

  const palette = useMemo(() => buildBrandPalette(form?.colors ?? {}), [form?.colors]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleLogoSelect = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem (PNG, JPG ou SVG).');
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      toast.error('O logo deve ter no máximo 2 MB.');
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = async () => {
    if (logoFile) {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }
    if (!profile?.logo_url) return;
    try {
      const updated = await salonService.removeLogo();
      setProfile(updated);
      applyBranding(updated);
      toast.success('Logo removido.');
    } catch {
      toast.error('Não foi possível remover o logo.');
    }
  };

  const handleSave = async () => {
    if (!form) return;
    if (form.name.trim().length < 2) {
      toast.error('Informe o nome do salão.');
      return;
    }

    setSaving(true);
    try {
      const updated = await salonService.updateProfile({
        name: form.name.trim(),
        display_name: form.display_name.trim(),
        tagline: form.tagline.trim(),
        description: form.description,
        email: form.email || null,
        phone_number: form.phone_number || null,
        website: form.website || null,
        primary_color: form.colors.primary || DEFAULT_PRIMARY_COLOR,
        secondary_color: form.colors.secondary ?? null,
        accent_color: form.colors.accent ?? null,
        ...(logoFile ? { logo: logoFile } : {}),
      });

      setProfile(updated);
      setForm(toFormState(updated));
      setLogoFile(null);
      setLogoPreview(null);
      applyBranding(updated);
      toast.success('Personalização do salão salva!');
    } catch (error: any) {
      const detail = error?.response?.data;
      const firstError = detail && typeof detail === 'object' ? Object.values(detail)[0] : null;
      toast.error(Array.isArray(firstError) ? String(firstError[0]) : 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (!profile) return;
    setForm(toFormState(profile));
    setLogoFile(null);
    setLogoPreview(null);
    setPreviewColors(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!form || !profile) {
    return <Alert severity="error">Perfil do salão indisponível.</Alert>;
  }

  const displayedLogo = logoPreview ?? profile.logo_url;
  const brandName = form.display_name.trim() || form.name.trim();

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h3">Perfil do Salão</Typography>
          <Typography variant="caption">
            Configure o nome, o logo e as cores que o sistema usa para o seu salão.
          </Typography>
        </Box>
        {isManagerOrOwner && (
          <Stack direction="row" spacing={1}>
            <Button variant="outline" onClick={handleDiscard} disabled={saving}>
              Descartar
            </Button>
            <Button variant="default" onClick={handleSave} disabled={saving} startIcon={<SaveIcon />}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </Stack>
        )}
      </Stack>

      {!isManagerOrOwner && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Somente o proprietário ou o gerente do salão pode alterar a personalização.
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, next) => setTab(next)} sx={{ mb: 3 }}>
        <Tab label="Identidade" />
        <Tab label="Cores do sistema" />
        <Tab label="Contato" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Stack spacing={2.5}>
                <TextField
                  label="Nome do salão"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  disabled={!isManagerOrOwner}
                  fullWidth
                  required
                />
                <TextField
                  label="Nome de exibição"
                  helperText="Nome curto usado no menu e no cabeçalho. Se vazio, usamos o nome do salão."
                  value={form.display_name}
                  onChange={(e) => setField('display_name', e.target.value)}
                  disabled={!isManagerOrOwner}
                  fullWidth
                />
                <TextField
                  label="Slogan"
                  helperText="Frase curta exibida abaixo do nome."
                  value={form.tagline}
                  onChange={(e) => setField('tagline', e.target.value)}
                  disabled={!isManagerOrOwner}
                  fullWidth
                />
                <TextField
                  label="Descrição"
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  disabled={!isManagerOrOwner}
                  multiline
                  minRows={3}
                  fullWidth
                />
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" mb={2}>
                Logo
              </Typography>

              <Stack spacing={2} alignItems="flex-start">
                <SalonLogo
                  size={96}
                  showName
                  logoOverride={displayedLogo}
                  nameOverride={brandName}
                  taglineOverride={form.tagline}
                />

                <Typography variant="caption">
                  PNG, JPG ou SVG de até 2 MB. Recomendado: fundo transparente e formato quadrado.
                </Typography>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outline"
                    size="sm"
                    startIcon={<UploadIcon />}
                    disabled={!isManagerOrOwner}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Enviar logo
                  </Button>
                  {(displayedLogo || logoFile) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      startIcon={<DeleteOutlineIcon />}
                      disabled={!isManagerOrOwner}
                      onClick={handleRemoveLogo}
                    >
                      Remover
                    </Button>
                  )}
                </Stack>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  hidden
                  onChange={(e) => handleLogoSelect(e.target.files?.[0])}
                />

                {logoFile && (
                  <Alert severity="info" sx={{ width: '100%' }}>
                    Novo logo selecionado. Clique em “Salvar alterações” para aplicar.
                  </Alert>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6">Escolha a cor do seu salão</Typography>
              <Typography variant="caption" display="block" mb={2}>
                A partir dela geramos toda a paleta do sistema em harmonia. A pré-visualização é
                aplicada na hora e só fica permanente ao salvar.
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ pointerEvents: isManagerOrOwner ? 'auto' : 'none', opacity: isManagerOrOwner ? 1 : 0.6 }}>
                <BrandColorPicker value={form.colors} onChange={(colors) => setField('colors', colors)} />
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" mb={2}>
                Como vai ficar
              </Typography>
              <PalettePreview palette={palette} salonName={brandName} />
            </Paper>
          </Grid>
        </Grid>
      )}

      {tab === 2 && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, maxWidth: 640 }}>
          <Stack spacing={2.5}>
            <TextField
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              disabled={!isManagerOrOwner}
              fullWidth
            />
            <TextField
              label="Telefone"
              value={form.phone_number}
              onChange={(e) => setField('phone_number', e.target.value)}
              disabled={!isManagerOrOwner}
              fullWidth
            />
            <TextField
              label="Site"
              value={form.website}
              onChange={(e) => setField('website', e.target.value)}
              disabled={!isManagerOrOwner}
              fullWidth
            />
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
