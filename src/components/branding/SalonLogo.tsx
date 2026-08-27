import { Box, Typography, useTheme } from '@mui/material';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import { useBranding } from '@/contexts/BrandingContext';

interface SalonLogoProps {
  size?: number;
  /** Exibe o nome (e o slogan) ao lado da marca. */
  showName?: boolean;
  /** Sobrescreve a imagem exibida — usado no preview de upload. */
  logoOverride?: string | null;
  nameOverride?: string;
  taglineOverride?: string;
}

/**
 * Marca do salão: usa o logo enviado ou, na ausência dele, a inicial do nome
 * sobre o gradiente da cor principal.
 */
export function SalonLogo({
  size = 40,
  showName = false,
  logoOverride,
  nameOverride,
  taglineOverride,
}: SalonLogoProps) {
  const theme = useTheme();
  const { brandName, logoUrl, tagline } = useBranding();

  const name = nameOverride ?? brandName;
  const logo = logoOverride !== undefined ? logoOverride : logoUrl;
  const subtitle = taglineOverride !== undefined ? taglineOverride : tagline;
  const initial = name?.trim().charAt(0).toUpperCase();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: 2,
          flexShrink: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: logo ? theme.palette.background.default : theme.palette.custom.gradients.primary,
          border: logo ? `1px solid ${theme.palette.divider}` : 'none',
          color: theme.palette.primary.contrastText,
          fontWeight: 700,
          fontSize: size * 0.45,
        }}
      >
        {logo ? (
          <Box
            component="img"
            src={logo}
            alt={name}
            sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          initial || <ContentCutIcon />
        )}
      </Box>

      {showName && (
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight="bold" color="primary.main" noWrap>
            {name}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
