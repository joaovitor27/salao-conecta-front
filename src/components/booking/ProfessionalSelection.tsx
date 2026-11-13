import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { Card, CardContent } from '@/components/ui/Card';
import {
  bookingService,
  type ProfessionalData,
  type ServiceData,
} from '@/services/booking.service';
import { useOptionalBooking } from '@/components/booking/BookingLayout';
import { useParams } from 'react-router-dom';

export const INDIFFERENT_PROFESSIONAL_VALUE = '__indifferent__';

export interface ProfessionalSelectionProps {
  selectedServiceIds: number[];
  /** Mapa service_id -> professional_id (ou null quando Indiferente). */
  selectedProfessionalsByService?: Record<number, string | null>;
  onChangeByService?: (mapping: Record<number, string | null>) => void;
  /** Props legadas mantidas para compatibilidade. */
  selectedProfessionalId?: string | null;
  onChange?: (id: string | null) => void;
  /** Sobrepõe a configuração do salão (útil em testes isolados). */
  requireProfessionalChoice?: boolean;
  /** Notifica se todos os serviços obrigatórios possuem profissional definido. */
  onValidityChange?: (isValid: boolean) => void;
}

interface ResolvedServiceItem {
  id: number;
  name: string;
  durationMinutes?: number;
  capableProfessionals: ProfessionalData[];
}

export function ProfessionalSelection({
  selectedServiceIds,
  selectedProfessionalsByService,
  onChangeByService,
  selectedProfessionalId = null,
  onChange,
  requireProfessionalChoice: requireProp,
  onValidityChange,
}: ProfessionalSelectionProps) {
  const { slug } = useParams<{ slug: string }>();
  const bookingCtx = useOptionalBooking();
  const requireProfessionalChoice =
    requireProp ?? Boolean(bookingCtx?.salon.require_professional_choice);

  const [professionals, setProfessionals] = useState<ProfessionalData[]>([]);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [internalMap, setInternalMap] = useState<Record<number, string | null>>({});
  const [loading, setLoading] = useState(true);

  const currentMap = useMemo<Record<number, string | null>>(() => {
    if (selectedProfessionalsByService) return selectedProfessionalsByService;
    if (Object.keys(internalMap).length > 0) return internalMap;
    const fallback: Record<number, string | null> = {};
    selectedServiceIds.forEach((sid) => {
      fallback[sid] = selectedProfessionalId ?? null;
    });
    return fallback;
  }, [selectedProfessionalsByService, internalMap, selectedServiceIds, selectedProfessionalId]);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);

    const servicesPromise =
      typeof bookingService.getServices === 'function'
        ? bookingService.getServices(slug).catch(() => [] as ServiceData[])
        : Promise.resolve([] as ServiceData[]);

    const professionalsPromise = bookingService
      .getProfessionals(slug)
      .catch(() => [] as ProfessionalData[]);

    Promise.all([servicesPromise, professionalsPromise])
      .then(([loadedServices, loadedProfessionals]) => {
        if (!active) return;
        setServices(Array.isArray(loadedServices) ? loadedServices : []);
        setProfessionals(Array.isArray(loadedProfessionals) ? loadedProfessionals : []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const resolvedServices = useMemo<ResolvedServiceItem[]>(() => {
    return selectedServiceIds.map((serviceId) => {
      const fromCatalog = services.find((s) => s.id === serviceId);
      const capable = professionals.filter((p) =>
        p.services?.some((s) => s.service_id === serviceId),
      );
      const fallbackName =
        fromCatalog?.service_name ||
        capable
          .flatMap((p) => p.services)
          .find((s) => s.service_id === serviceId)?.service_name ||
        `Serviço #${serviceId}`;

      return {
        id: serviceId,
        name: fallbackName,
        durationMinutes: fromCatalog?.duration_minutes,
        capableProfessionals: capable,
      };
    });
  }, [selectedServiceIds, services, professionals]);

  // Predefine automaticamente quando só existe 1 profissional para o serviço
  useEffect(() => {
    if (loading || resolvedServices.length === 0) return;

    const nextMap: Record<number, string | null> = { ...currentMap };
    let changed = false;

    for (const item of resolvedServices) {
      if (item.capableProfessionals.length === 1) {
        const onlyProfId = item.capableProfessionals[0].id;
        if (nextMap[item.id] !== onlyProfId) {
          nextMap[item.id] = onlyProfId;
          changed = true;
        }
      } else if (!(item.id in nextMap)) {
        nextMap[item.id] = null;
        changed = true;
      }
    }

    if (changed) {
      setInternalMap(nextMap);
      onChangeByService?.(nextMap);
      if (resolvedServices.length === 1) {
        onChange?.(nextMap[resolvedServices[0].id] ?? null);
      }
    }
  }, [loading, resolvedServices, currentMap, onChangeByService, onChange]);

  // Valida se todos os serviços que exigem escolha já têm profissional selecionado
  useEffect(() => {
    if (loading) return;
    const isValid = resolvedServices.every((item) => {
      if (item.capableProfessionals.length <= 1) return true;
      if (!requireProfessionalChoice) return true;
      return Boolean(currentMap[item.id]);
    });
    onValidityChange?.(isValid);
  }, [loading, resolvedServices, requireProfessionalChoice, currentMap, onValidityChange]);

  const handleServiceProfessionalChange = (serviceId: number, profId: string | null) => {
    const nextMap: Record<number, string | null> = {
      ...currentMap,
      [serviceId]: profId,
    };
    setInternalMap(nextMap);
    onChangeByService?.(nextMap);
    onChange?.(profId);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center" mb={1}>
        Escolha o profissional por serviço
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
        {requireProfessionalChoice
          ? 'Neste salão a escolha do profissional é obrigatória para serviços com mais de um especialista.'
          : 'Quando houver mais de um profissional, você pode escolher o de sua preferência ou deixar como Indiferente.'}
      </Typography>

      <Stack spacing={2.5}>
        {resolvedServices.map((item) => {
          const count = item.capableProfessionals.length;
          const isSingleProfessional = count === 1;
          const hasNoProfessionals = count === 0;
          const singleProfessional = isSingleProfessional ? item.capableProfessionals[0] : null;
          const selectedProfId = isSingleProfessional
            ? singleProfessional!.id
            : (currentMap[item.id] ?? null);

          const selectValue = isSingleProfessional
            ? singleProfessional!.id
            : selectedProfId
              ? selectedProfId
              : requireProfessionalChoice
                ? ''
                : INDIFFERENT_PROFESSIONAL_VALUE;

          const labelId = `prof-select-label-${item.id}`;
          const selectId = `prof-select-${item.id}`;

          return (
            <Card key={item.id} sx={{ textAlign: 'left' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  justifyContent="space-between"
                >
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {item.name}
                      </Typography>
                      {item.durationMinutes ? (
                        <Chip label={`${item.durationMinutes} min`} size="small" />
                      ) : null}
                    </Stack>

                    {isSingleProfessional && singleProfessional && (
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <LockOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          Único profissional disponível para este serviço ({singleProfessional.first_name}) — predefinido automaticamente.
                        </Typography>
                      </Stack>
                    )}

                    {count > 1 && !requireProfessionalChoice && (
                      <Typography variant="caption" color="text.secondary">
                        Se escolher &ldquo;Indiferente&rdquo;, o salão definirá o profissional depois.
                      </Typography>
                    )}

                    {count > 1 && requireProfessionalChoice && (
                      <Typography variant="caption" color="warning.main" fontWeight="medium">
                        Escolha obrigatória de profissional para este serviço.
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ minWidth: { xs: '100%', sm: 280 } }}>
                    <FormControl
                      fullWidth
                      size="small"
                      disabled={isSingleProfessional || hasNoProfessionals}
                      required={count > 1 && requireProfessionalChoice}
                      error={count > 1 && requireProfessionalChoice && !selectedProfId}
                    >
                      <InputLabel id={labelId}>
                        Profissional — {item.name}
                      </InputLabel>
                      <Select
                        labelId={labelId}
                        id={selectId}
                        label={`Profissional — ${item.name}`}
                        value={selectValue}
                        displayEmpty={count > 1 && requireProfessionalChoice}
                        onChange={(event: SelectChangeEvent<string>) => {
                          const raw = event.target.value;
                          const nextVal =
                            raw === '' || raw === INDIFFERENT_PROFESSIONAL_VALUE ? null : raw;
                          handleServiceProfessionalChange(item.id, nextVal);
                        }}
                      >
                        {isSingleProfessional && singleProfessional && (
                          <MenuItem value={singleProfessional.id}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                                {singleProfessional.first_name.charAt(0).toUpperCase()}
                              </Avatar>
                              <span>{singleProfessional.first_name}</span>
                            </Stack>
                          </MenuItem>
                        )}

                        {hasNoProfessionals && (
                          <MenuItem value={INDIFFERENT_PROFESSIONAL_VALUE}>
                            Indiferente (definido pelo salão)
                          </MenuItem>
                        )}

                        {count > 1 && !requireProfessionalChoice && (
                          <MenuItem value={INDIFFERENT_PROFESSIONAL_VALUE}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <PersonOutlineIcon fontSize="small" />
                              <span>Indiferente (definido pelo salão)</span>
                            </Stack>
                          </MenuItem>
                        )}

                        {count > 1 && requireProfessionalChoice && (
                          <MenuItem value="" disabled>
                            Selecione um profissional
                          </MenuItem>
                        )}

                        {count > 1 &&
                          item.capableProfessionals.map((prof) => (
                            <MenuItem key={prof.id} value={prof.id}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                                  {prof.first_name.charAt(0).toUpperCase()}
                                </Avatar>
                                <span>{prof.first_name}</span>
                              </Stack>
                            </MenuItem>
                          ))}
                      </Select>
                      {count > 1 && requireProfessionalChoice && !selectedProfId && (
                        <FormHelperText>
                          Selecione quem realizará este serviço para continuar.
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {resolvedServices.some((s) => s.capableProfessionals.length === 1) &&
        resolvedServices.every((s) => s.capableProfessionals.length <= 1) && (
          <Alert severity="info" sx={{ mt: 3 }}>
            Os profissionais dos serviços selecionados já foram predefinidos automaticamente. Você já pode avançar para o horário!
          </Alert>
        )}
    </Box>
  );
}
