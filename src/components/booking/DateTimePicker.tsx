import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddCalendarIcon from '@mui/icons-material/EventRepeat';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { Button } from '@/components/ui/Button';
import { useOptionalBooking } from '@/components/booking/BookingLayout';
import {
  bookingService,
  buildSalonContactUrl,
  type AvailabilitySlot,
  type ProfessionalData,
  type ServiceData,
} from '@/services/booking.service';
import { useParams } from 'react-router-dom';

export interface BookingDateSession {
  id: string;
  dateTime: string; // YYYY-MM-DDTHH:mm
  endTime?: string; // HH:mm
  serviceIds: number[];
}

export interface DateTimePickerProps {
  value: string; // YYYY-MM-DDTHH:mm (primeira sessão, mantido para compatibilidade)
  onChange: (value: string) => void;
  professionalId: string | null;
  professionalsByService?: Record<number, string | null>;
  serviceIds: number[];
  duration: number;
  sessions?: BookingDateSession[];
  onSessionsChange?: (sessions: BookingDateSession[]) => void;
  salonPhone?: string;
}

const PERIODS: { key: AvailabilitySlot['period']; label: string }[] = [
  { key: 'morning', label: 'Manhã ☀️' },
  { key: 'afternoon', label: 'Tarde 🌤️' },
  { key: 'evening', label: 'Noite 🌙' },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

export function addMinutesToTimeLabel(timeLabel: string, minutesToAdd: number): string {
  const [hStr, mStr] = timeLabel.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return '';
  const total = h * 60 + m + minutesToAdd;
  const endH = Math.floor((total / 60) % 24);
  const endM = total % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

function timeLabelToMinutes(timeLabel: string): number {
  const [hStr, mStr] = timeLabel.split(':');
  return Number(hStr) * 60 + Number(mStr);
}

interface SessionCardProps {
  index: number;
  totalSessions: number;
  session: BookingDateSession;
  allSessions: BookingDateSession[];
  slug: string | undefined;
  allServiceIds: number[];
  servicesCatalog: ServiceData[];
  professionalsCatalog: ProfessionalData[];
  professionalsByService: Record<number, string | null>;
  fallbackProfessionalId: string | null;
  fallbackDuration: number;
  onUpdate: (updated: BookingDateSession) => void;
  onRemove?: () => void;
}

function SessionScheduleCard({
  index,
  totalSessions,
  session,
  allSessions,
  slug,
  allServiceIds,
  servicesCatalog,
  professionalsCatalog,
  professionalsByService,
  fallbackProfessionalId,
  fallbackDuration,
  onUpdate,
  onRemove,
}: SessionCardProps) {
  const theme = useTheme();
  const [date, setDate] = useState(() =>
    session.dateTime ? session.dateTime.slice(0, 10) : todayISO(),
  );
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [info, setInfo] = useState<{
    opens: string | null;
    closes: string | null;
    closed: boolean;
    duration: number;
  }>({ opens: null, closes: null, closed: false, duration: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session.dateTime && session.dateTime.slice(0, 10) !== date) {
      setDate(session.dateTime.slice(0, 10));
    }
  }, [session.dateTime, date]);

  const activeServiceIds = session.serviceIds.length > 0 ? session.serviceIds : allServiceIds;
  const servicesKey = activeServiceIds.join(',');

  const itemsQuery = useMemo(() => {
    if (activeServiceIds.length === 0) return '';
    return activeServiceIds
      .map((sid) => {
        const pid =
          sid in professionalsByService ? professionalsByService[sid] : fallbackProfessionalId;
        return `${sid}:${pid || ''}`;
      })
      .join(',');
  }, [activeServiceIds, professionalsByService, fallbackProfessionalId]);

  const distinctProfessionals = useMemo(() => {
    const ids = new Set<string>();
    activeServiceIds.forEach((sid) => {
      const pid =
        sid in professionalsByService ? professionalsByService[sid] : fallbackProfessionalId;
      if (pid) ids.add(pid);
    });
    return Array.from(ids).map((pid) => {
      const found = professionalsCatalog.find((p) => p.id === pid);
      return { id: pid, name: found?.first_name || 'Profissional' };
    });
  }, [activeServiceIds, professionalsByService, fallbackProfessionalId, professionalsCatalog]);

  useEffect(() => {
    if (!date || !slug) return;
    let active = true;
    setLoading(true);
    bookingService
      .getAvailability(slug, {
        date,
        service: servicesKey,
        items: itemsQuery || undefined,
        professional: fallbackProfessionalId || undefined,
        duration: fallbackDuration || undefined,
        slot_minutes: 30,
      })
      .then((data) => {
        if (!active) return;
        setSlots(data.slots);
        setInfo({
          opens: data.opens_at,
          closes: data.closes_at,
          closed: data.is_closed,
          duration: data.duration_minutes,
        });
      })
      .catch(() => {
        if (active) setSlots([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, date, itemsQuery, servicesKey, fallbackProfessionalId, fallbackDuration]);

  const selectedTime =
    session.dateTime && session.dateTime.slice(0, 10) === date
      ? session.dateTime.slice(11, 16)
      : '';

  const effectiveDuration = useMemo(() => {
    if (info.duration > 0) return info.duration;
    const fromCatalog = activeServiceIds.reduce((acc, sid) => {
      const srv = servicesCatalog.find((s) => s.id === sid);
      return acc + (srv?.duration_minutes ?? 0);
    }, 0);
    return fromCatalog || fallbackDuration || 30;
  }, [info.duration, activeServiceIds, servicesCatalog, fallbackDuration]);

  const selectedSlot = useMemo(
    () => slots.find((s) => s.label === selectedTime) ?? null,
    [slots, selectedTime],
  );

  const computedEndTime = useMemo(() => {
    if (!selectedTime) return '';
    return (
      selectedSlot?.end_label ||
      session.endTime ||
      addMinutesToTimeLabel(selectedTime, effectiveDuration)
    );
  }, [selectedTime, selectedSlot, session.endTime, effectiveDuration]);

  // Verifica se algum outro card de data escolheu o mesmo dia e tem horário sobreposto
  const isSlotConflictingWithOtherSession = (slotLabel: string, slotEndLabel: string): boolean => {
    const startMin = timeLabelToMinutes(slotLabel);
    const endMin = timeLabelToMinutes(
      slotEndLabel || addMinutesToTimeLabel(slotLabel, effectiveDuration),
    );
    return allSessions.some((other) => {
      if (other.id === session.id || !other.dateTime) return false;
      const otherDate = other.dateTime.slice(0, 10);
      if (otherDate !== date) return false;
      const otherStart = timeLabelToMinutes(other.dateTime.slice(11, 16));
      const otherEnd = other.endTime
        ? timeLabelToMinutes(other.endTime)
        : otherStart + effectiveDuration;
      return Math.max(startMin, otherStart) < Math.min(endMin, otherEnd);
    });
  };

  const grouped = useMemo(
    () =>
      PERIODS.map((period) => ({
        ...period,
        items: slots.filter((slot) => slot.period === period.key),
      })),
    [slots],
  );

  const toggleServiceInSession = (sid: number) => {
    if (activeServiceIds.includes(sid)) {
      if (activeServiceIds.length <= 1) return; // mantém ao menos 1 serviço na data
      const nextIds = activeServiceIds.filter((id) => id !== sid);
      onUpdate({ ...session, serviceIds: nextIds, dateTime: '', endTime: undefined });
    } else {
      const nextIds = [...activeServiceIds, sid];
      onUpdate({ ...session, serviceIds: nextIds, dateTime: '', endTime: undefined });
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      {totalSessions > 1 && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2, pb: 1.5, borderBottom: 1, borderColor: 'divider' }}
        >
          <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
            Data {index + 1} de {totalSessions}
          </Typography>
          {onRemove && (
            <IconButton
              size="small"
              color="error"
              aria-label={`Remover data ${index + 1}`}
              onClick={onRemove}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      )}

      {totalSessions > 1 && servicesCatalog.length > 1 && (
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
            Serviços realizados nesta data:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {allServiceIds.map((sid) => {
              const srv = servicesCatalog.find((s) => s.id === sid);
              const active = activeServiceIds.includes(sid);
              return (
                <Chip
                  key={sid}
                  label={srv ? `${srv.service_name} (${srv.duration_minutes} min)` : `Serviço #${sid}`}
                  color={active ? 'primary' : 'default'}
                  variant={active ? 'filled' : 'outlined'}
                  onClick={() => toggleServiceInSession(sid)}
                  size="small"
                />
              );
            })}
          </Stack>
        </Box>
      )}

      {distinctProfessionals.length > 1 && (
        <Alert
          icon={<PeopleOutlineIcon fontSize="inherit" />}
          severity="info"
          sx={{ mb: 2.5 }}
        >
          Conciliando agendas de{' '}
          <strong>{distinctProfessionals.map((p) => p.name).join(' e ')}</strong>: os horários
          abaixo já garantem disponibilidade em sequência para ambos os profissionais.
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
        <Box sx={{ flex: 1 }}>
          <TextField
            label={totalSessions > 1 ? `Data ${index + 1}` : 'Data'}
            type="date"
            value={date}
            onChange={(event) => {
              const nextDate = event.target.value;
              setDate(nextDate);
              if (selectedTime) {
                onUpdate({
                  ...session,
                  dateTime: `${nextDate}T${selectedTime}`,
                  endTime: computedEndTime || undefined,
                });
              }
            }}
            inputProps={{ min: todayISO() }}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ mb: 2 }}
          />

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {info.closed
                ? 'Salão fechado nesta data.'
                : `Aberto das ${info.opens ?? '--'} às ${info.closes ?? '--'}`}
            </Typography>
            {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
          </Stack>

          <Typography variant="caption" color="text.secondary" display="block">
            Intervalos de 30 em 30 minutos • Duração estimada: {effectiveDuration} min
          </Typography>
        </Box>

        <Box sx={{ flex: 2 }}>
          {info.closed && !loading && (
            <Alert severity="warning">
              Salão fechado neste dia. Por favor, escolha outra data.
            </Alert>
          )}

          {!loading && !info.closed && slots.length === 0 && (
            <Alert severity="info">Nenhum horário disponível para esta data.</Alert>
          )}

          {!info.closed && slots.length > 0 && (
            <Stack spacing={2.5}>
              {grouped
                .filter((period) => period.items.length > 0)
                .map((period) => (
                  <Box key={period.key}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color="text.secondary"
                      gutterBottom
                    >
                      {period.label}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {period.items.map((slot) => {
                        const isSelected = slot.label === selectedTime;
                        const slotEnd =
                          slot.end_label || addMinutesToTimeLabel(slot.label, effectiveDuration);
                        const hasSessionConflict = isSlotConflictingWithOtherSession(
                          slot.label,
                          slotEnd,
                        );
                        return (
                          <Chip
                            key={slot.start}
                            label={slot.label}
                            clickable={!hasSessionConflict}
                            disabled={hasSessionConflict}
                            onClick={() =>
                              onUpdate({
                                ...session,
                                dateTime: `${date}T${slot.label}`,
                                endTime: slotEnd,
                              })
                            }
                            sx={{
                              borderRadius: '20px',
                              fontWeight: isSelected ? 'bold' : 'normal',
                              bgcolor: isSelected
                                ? theme.palette.primary.main
                                : 'background.paper',
                              color: isSelected
                                ? theme.palette.primary.contrastText
                                : 'text.primary',
                              border: `1px solid ${
                                isSelected ? theme.palette.primary.main : theme.palette.divider
                              }`,
                              '&:hover': {
                                bgcolor: isSelected
                                  ? theme.palette.primary.dark
                                  : theme.palette.action.hover,
                              },
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                ))}
            </Stack>
          )}

          {selectedTime && computedEndTime && (
            <Alert
              icon={<CheckCircleOutlineIcon fontSize="inherit" />}
              severity="success"
              sx={{ mt: 2.5 }}
            >
              <Typography variant="body2" fontWeight="bold">
                Início às {selectedTime} • Término previsto às {computedEndTime}
              </Typography>
              {selectedSlot?.segments && selectedSlot.segments.length > 1 && (
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  {selectedSlot.segments.map((seg, idx) => (
                    <Typography key={idx} variant="caption" display="block">
                      • {seg.start_label} às {seg.end_label}: {seg.service_name}
                      {seg.professional_name ? ` (com ${seg.professional_name})` : ''}
                    </Typography>
                  ))}
                </Stack>
              )}
            </Alert>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

export function DateTimePicker({
  value,
  onChange,
  professionalId,
  professionalsByService = {},
  serviceIds,
  duration,
  sessions: externalSessions,
  onSessionsChange,
  salonPhone: salonPhoneProp,
}: DateTimePickerProps) {
  const { slug } = useParams<{ slug: string }>();
  const bookingCtx = useOptionalBooking();
  const salonPhone = salonPhoneProp ?? bookingCtx?.salon.phone_number ?? '';
  const salonName = bookingCtx?.salon.brand_name ?? 'o salão';

  const [servicesCatalog, setServicesCatalog] = useState<ServiceData[]>([]);
  const [professionalsCatalog, setProfessionalsCatalog] = useState<ProfessionalData[]>([]);

  const [internalSessions, setInternalSessions] = useState<BookingDateSession[]>(() => [
    {
      id: 'session-1',
      dateTime: value || '',
      serviceIds: [...serviceIds],
    },
  ]);

  const sessions = externalSessions ?? internalSessions;

  useEffect(() => {
    if (!slug) return;
    let active = true;
    if (typeof bookingService.getServices === 'function') {
      bookingService
        .getServices(slug)
        .then((res) => {
          if (active && Array.isArray(res)) setServicesCatalog(res);
        })
        .catch(() => {});
    }
    if (typeof bookingService.getProfessionals === 'function') {
      bookingService
        .getProfessionals(slug)
        .then((res) => {
          if (active && Array.isArray(res)) setProfessionalsCatalog(res);
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [slug]);

  const updateSessions = (nextSessions: BookingDateSession[]) => {
    setInternalSessions(nextSessions);
    onSessionsChange?.(nextSessions);
    if (nextSessions.length > 0) {
      onChange(nextSessions[0].dateTime);
    }
  };

  const handleUpdateSingleSession = (index: number, updated: BookingDateSession) => {
    const next = sessions.map((s, idx) => (idx === index ? updated : s));
    updateSessions(next);
  };

  const handleAddAnotherDate = () => {
    const baseDate = sessions[sessions.length - 1]?.dateTime?.slice(0, 10) || todayISO();
    const d = new Date(`${baseDate}T12:00:00`);
    d.setDate(d.getDate() + 1);
    const nextDayISO = d.toISOString().slice(0, 10);

    const newSession: BookingDateSession = {
      id: `session-${Date.now()}-${sessions.length + 1}`,
      dateTime: '',
      serviceIds: [...serviceIds],
    };
    // Pré-seleciona o dia seguinte no card recém-adicionado apenas ao clicar num horário,
    // mantendo dateTime vazio até que a cliente escolha o horário da nova data.
    void nextDayISO;
    updateSessions([...sessions, newSession]);
  };

  const handleRemoveSession = (index: number) => {
    if (sessions.length <= 1) return;
    const next = sessions.filter((_, idx) => idx !== index);
    updateSessions(next);
  };

  const handleContactSalon = () => {
    const serviceNames = servicesCatalog
      .filter((s) => serviceIds.includes(s.id))
      .map((s) => s.service_name);
    const servicesText =
      serviceNames.length > 0 ? ` para ${serviceNames.join(', ')}` : '';
    const url = buildSalonContactUrl(
      salonPhone,
      `Olá! Estou tentando agendar pelo site${servicesText} e gostaria de verificar outras opções de data/horário.`,
    );
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center" mb={1}>
        Escolha a data e o horário
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
        Selecione o melhor horário para você. Ao escolher, mostramos automaticamente a previsão de
        término do atendimento.
      </Typography>

      <Stack spacing={3}>
        {sessions.map((session, idx) => (
          <SessionScheduleCard
            key={session.id}
            index={idx}
            totalSessions={sessions.length}
            session={session}
            allSessions={sessions}
            slug={slug}
            allServiceIds={serviceIds}
            servicesCatalog={servicesCatalog}
            professionalsCatalog={professionalsCatalog}
            professionalsByService={professionalsByService}
            fallbackProfessionalId={professionalId}
            fallbackDuration={duration}
            onUpdate={(updated) => handleUpdateSingleSession(idx, updated)}
            onRemove={sessions.length > 1 ? () => handleRemoveSession(idx) : undefined}
          />
        ))}
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            Deseja agendar também para outra data?
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Ideal para repetir o serviço em outro dia (ex: duas maquiagens em datas diferentes).
          </Typography>
        </Box>
        <Button
          variant="outline"
          onClick={handleAddAnotherDate}
          startIcon={<AddCalendarIcon />}
        >
          Adicionar outra data
        </Button>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          mt: 3,
          p: 2.5,
          borderRadius: 2,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            Precisa de mais flexibilidade no horário?
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Não encontrou o horário ideal ou precisa conciliar um atendimento especial? Fale direto
            com {salonName}.
          </Typography>
        </Box>
        <Button
          variant="secondary"
          onClick={handleContactSalon}
          startIcon={<ChatOutlinedIcon />}
        >
          Conversar diretamente com o salão
        </Button>
      </Paper>
    </Box>
  );
}
