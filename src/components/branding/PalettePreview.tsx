import { Alert, Box, Paper, Stack, Tooltip, Typography } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import { contrastRatio } from '@/theme/color';
import { describePalette, type BrandPalette } from '@/theme/brandPalette';

interface PalettePreviewProps {
  palette: BrandPalette;
  salonName: string;
}

function Swatch({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Tooltip title={`${hint ? `${hint} — ` : ''}${value}`} arrow>
      <Box sx={{ textAlign: 'center', minWidth: 56 }}>
        <Box
          sx={{
            height: 48,
            borderRadius: 1.5,
            bgcolor: value,
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        />
        <Typography variant="caption" display="block" noWrap>
          {label}
        </Typography>
      </Box>
    </Tooltip>
  );
}

/** Mock reduzido da interface para o usuário ver as cores aplicadas de fato. */
function InterfaceMock({ palette, salonName }: PalettePreviewProps) {
  const menu = [
    { label: 'Dashboard', icon: <DashboardIcon fontSize="small" />, active: true },
    { label: 'Agenda', icon: <CalendarMonthIcon fontSize="small" />, active: false },
    { label: 'Clientes', icon: <PeopleIcon fontSize="small" />, active: false },
  ];

  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        overflow: 'hidden',
        borderRadius: 2,
        borderColor: palette.border,
        bgcolor: palette.background,
      }}
    >
      <Box sx={{ width: 150, bgcolor: palette.gray[100], p: 1.5, borderRight: `1px solid ${palette.border}` }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: 1,
              background: palette.gradients.primary,
              color: palette.primary.contrastText,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {salonName.trim().charAt(0).toUpperCase() || 'S'}
          </Box>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: palette.primary.readable }} noWrap>
            {salonName || 'Seu Salão'}
          </Typography>
        </Stack>

        <Stack spacing={0.5}>
          {menu.map((item) => (
            <Stack
              key={item.label}
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                px: 1,
                py: 0.75,
                borderRadius: 1,
                bgcolor: item.active ? palette.primary[50] : 'transparent',
                color: item.active ? palette.primary.readable : palette.muted.foreground,
              }}
            >
              {item.icon}
              <Typography sx={{ fontSize: 11, fontWeight: item.active ? 600 : 500 }}>{item.label}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      <Box sx={{ flex: 1, p: 2, minWidth: 0 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: palette.primary.readable, mb: 1.5 }}>
          Resumo do dia
        </Typography>

        <Stack direction="row" spacing={1} mb={2}>
          <Box
            sx={{
              flex: 1,
              p: 1.5,
              borderRadius: 1.5,
              background: palette.gradients.primary,
              color: palette.primary.contrastText,
            }}
          >
            <Typography sx={{ fontSize: 10, opacity: 0.85 }}>Atendimentos</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700 }}>12</Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: palette.secondary.light,
              color: palette.secondary.contrastText,
              border: `1px solid ${palette.secondary.main}`,
            }}
          >
            <Typography sx={{ fontSize: 10 }}>Faturamento</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700 }}>R$ 940</Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Box
            sx={{
              px: 2,
              py: 0.75,
              borderRadius: 1,
              bgcolor: palette.primary.main,
              color: palette.primary.contrastText,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Novo agendamento
          </Box>
          <Box
            sx={{
              px: 2,
              py: 0.75,
              borderRadius: 1,
              bgcolor: palette.accent.main,
              color: palette.accent.foreground,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Confirmar
          </Box>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 5,
              bgcolor: palette.beauty.gold,
              color: palette.foreground,
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            Premium
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}

/**
 * Mostra todas as variações harmônicas geradas a partir da cor escolhida,
 * junto de um mock da interface com essas cores aplicadas.
 */
export function PalettePreview({ palette, salonName }: PalettePreviewProps) {
  const groups = describePalette(palette);
  const lowContrast = contrastRatio(palette.primary.main, palette.background) < 4.5;

  return (
    <Stack spacing={3}>
      <InterfaceMock palette={palette} salonName={salonName} />

      {lowContrast && (
        <Alert severity="info">
          Essa cor é clara demais para textos sobre fundo branco. Os títulos usarão automaticamente
          um tom mais escuro dela ({palette.primary.readable}) para manter a leitura confortável.
        </Alert>
      )}

      {groups.map((group) => (
        <Box key={group.title}>
          <Typography variant="h6">{group.title}</Typography>
          <Typography variant="caption" display="block" mb={1}>
            {group.description}
          </Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">
            {group.swatches.map((swatch) => (
              <Swatch key={`${group.title}-${swatch.label}`} {...swatch} />
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
