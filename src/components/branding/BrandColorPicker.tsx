import { useEffect, useState } from 'react';
import { Box, Collapse, FormControlLabel, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Button } from '@/components/ui/Button';
import { isValidHex, normalizeHex } from '@/theme/color';
import { BRAND_COLOR_PRESETS, deriveHarmony, type BrandColorsInput } from '@/theme/brandPalette';

interface BrandColorPickerProps {
  value: BrandColorsInput;
  onChange: (value: BrandColorsInput) => void;
}

interface ColorFieldProps {
  label: string;
  helper?: string;
  value: string;
  onChange: (hex: string) => void;
  onReset?: () => void;
}

function ColorField({ label, helper, value, onChange, onReset }: ColorFieldProps) {
  const [text, setText] = useState(value);

  useEffect(() => setText(value), [value]);

  const commit = (raw: string) => {
    setText(raw);
    if (isValidHex(raw)) onChange(normalizeHex(raw));
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        component="input"
        type="color"
        aria-label={label}
        value={value}
        onChange={(e) => commit(e.target.value)}
        sx={{
          width: 56,
          height: 56,
          p: 0,
          border: 'none',
          borderRadius: 2,
          cursor: 'pointer',
          background: 'none',
          '&::-webkit-color-swatch-wrapper': { p: 0.5 },
          '&::-webkit-color-swatch': { border: '1px solid rgba(0,0,0,0.12)', borderRadius: '8px' },
        }}
      />
      <TextField
        label={label}
        helperText={helper}
        value={text}
        size="small"
        onChange={(e) => commit(e.target.value)}
        onBlur={() => setText(value)}
        error={text.length > 0 && !isValidHex(text)}
        sx={{ maxWidth: 220 }}
      />
      {onReset && (
        <Tooltip title="Voltar para a cor sugerida">
          <span>
            <Button variant="ghost" size="icon" onClick={onReset} aria-label="Restaurar cor sugerida">
              <RestartAltIcon />
            </Button>
          </span>
        </Tooltip>
      )}
    </Stack>
  );
}

/**
 * Seleção da cor principal do salão (com atalhos de cores prontas) e,
 * opcionalmente, ajuste manual das cores companheiras.
 */
export function BrandColorPicker({ value, onChange }: BrandColorPickerProps) {
  const primary = normalizeHex(value.primary || '');
  const harmony = deriveHarmony(primary);
  const [advanced, setAdvanced] = useState(Boolean(value.secondary || value.accent));

  const update = (patch: Partial<BrandColorsInput>) => onChange({ ...value, ...patch });

  const toggleAdvanced = (checked: boolean) => {
    setAdvanced(checked);
    if (!checked) update({ secondary: null, accent: null });
  };

  return (
    <Stack spacing={3}>
      <ColorField
        label="Cor principal"
        helper="Base de toda a identidade visual"
        value={primary}
        onChange={(hex) => update({ primary: hex })}
      />

      <Box>
        <Typography variant="caption" display="block" mb={1}>
          Sugestões
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {BRAND_COLOR_PRESETS.map((preset) => {
            const selected = preset.value.toUpperCase() === primary;
            return (
              <Tooltip key={preset.value} title={preset.label}>
                <Box
                  component="button"
                  type="button"
                  aria-label={preset.label}
                  aria-pressed={selected}
                  onClick={() => update({ primary: preset.value })}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    bgcolor: preset.value,
                    border: (theme) =>
                      selected ? `3px solid ${theme.palette.text.primary}` : `1px solid ${theme.palette.divider}`,
                    p: 0,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.1)' },
                  }}
                />
              </Tooltip>
            );
          })}
        </Stack>
      </Box>

      <Box>
        <FormControlLabel
          control={<Switch checked={advanced} onChange={(e) => toggleAdvanced(e.target.checked)} />}
          label="Ajustar cores companheiras manualmente"
        />
        <Typography variant="caption" display="block">
          Desligado, elas são geradas automaticamente em harmonia com a cor principal.
        </Typography>

        <Collapse in={advanced}>
          <Stack spacing={2} mt={2}>
            <ColorField
              label="Cor secundária"
              helper="Detalhes e destaques suaves"
              value={normalizeHex(value.secondary || harmony.secondary)}
              onChange={(hex) => update({ secondary: hex })}
              onReset={() => update({ secondary: null })}
            />
            <ColorField
              label="Cor de destaque"
              helper="Botões de ação e badges"
              value={normalizeHex(value.accent || harmony.accent)}
              onChange={(hex) => update({ accent: hex })}
              onReset={() => update({ accent: null })}
            />
          </Stack>
        </Collapse>
      </Box>
    </Stack>
  );
}
