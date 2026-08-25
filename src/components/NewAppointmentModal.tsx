import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Divider,
  Autocomplete,
  InputAdornment,
} from '@mui/material';
import { Button } from '@/components/ui/Button';
import { appointmentService } from '@/services/appointment.service';
import { businessService, type Customer, type Employee, type ServiceSalon } from '@/services/business.service';
import { DaySchedulePreview } from '@/components/DaySchedulePreview';
import { useDebounce } from '@/hooks/useDebounce';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  appointmentId?: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY_FORM = {
  client_id: '',
  professional_id: '',
  service_id: '',
  start_time: '',
  discount: '0.00',
  notes: '',
};

export function AppointmentFormModal({ open, appointmentId, onClose, onSuccess }: Props) {
  const isEditing = !!appointmentId;

  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', phone: '' });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<ServiceSalon[]>([]);

  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const [clientSearch, setClientSearch] = useState('');
  const debouncedClientSearch = useDebounce(clientSearch, 400);
  const [loadingClients, setLoadingClients] = useState(false);

  const selectedDate = useMemo(() => {
    if (!formData.start_time) return '';
    return formData.start_time.split('T')[0];
  }, [formData.start_time]);

  useEffect(() => {
    if (!open) return;

    void loadStaticData();

    if (appointmentId) {
      void loadAppointmentForEdit(appointmentId);
    } else {
      resetForm();
    }
  }, [open, appointmentId]);

  useEffect(() => {
    if (open && !isNewClient) {
      void searchCustomers(debouncedClientSearch);
    }
  }, [debouncedClientSearch, open, isNewClient]);

  const loadStaticData = async () => {
    try {
      const [emp, serv] = await Promise.all([
        businessService.getEmployees(),
        businessService.getServices(),
      ]);
      setEmployees(emp);
      setServices(serv);
    } catch {
      toast.error('Erro ao carregar dados do salão.');
    }
  };

  const searchCustomers = async (search: string) => {
    setLoadingClients(true);
    try {
      const data = await businessService.getCustomers(search);
      setCustomers(data);
    } catch {
      // silent
    } finally {
      setLoadingClients(false);
    }
  };

  const loadAppointmentForEdit = async (id: number) => {
    setLoadingData(true);
    try {
      const appt = await appointmentService.get(id);

      const pad = (n: number) => String(n).padStart(2, '0');
      let localStart = '';
      if (appt.start_time) {
        const d = new Date(appt.start_time);
        localStart = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }

      setFormData({
        client_id: appt.client.id,
        professional_id: appt.professional?.id || '',
        service_id: String(appt.service.id),
        start_time: localStart,
        discount: appt.discount || '0.00',
        notes: appt.notes || '',
      });

      // Make sure the client appears in the autocomplete list
      setCustomers((prev) => {
        if (prev.some((c) => c.id === appt.client.id)) return prev;
        return [...prev, appt.client];
      });

      setIsNewClient(false);
      setErrors({});
      setClientSearch('');
    } catch {
      toast.error('Erro ao carregar dados do agendamento.');
    } finally {
      setLoadingData(false);
    }
  };

  const resetForm = () => {
    setFormData({ ...EMPTY_FORM });
    setNewClientData({ name: '', phone: '' });
    setIsNewClient(false);
    setErrors({});
    setClientSearch('');
    setCustomers([]);
  };

  // ── Handlers ──
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: [] }));
  };

  const handleNewClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewClientData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getIsoWithOffset = (localStr: string) => {
    if (!localStr) return '';
    const offset = new Date().getTimezoneOffset();
    const sign = offset > 0 ? '-' : '+';
    const absOffset = Math.abs(offset);
    const hours = String(Math.floor(absOffset / 60)).padStart(2, '0');
    const mins = String(absOffset % 60).padStart(2, '0');
    return `${localStr}:00${sign}${hours}:${mins}`;
  };

  // ── Error mapper ──
  const handleApiError = (error: any) => {
    if (error.response?.data) {
      const data = error.response.data;
      const mapped: Record<string, string[]> = {};
      let hasField = false;

      Object.entries(data).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          mapped[key] = val;
          hasField = true;
        } else if (typeof val === 'string') {
          mapped[key] = [val];
          hasField = true;
        }
      });
      setErrors(mapped);

      if (data.detail) toast.error(data.detail);
      else if (data.non_field_errors) toast.error(data.non_field_errors[0]);
      else if (hasField) toast.error('Verifique os campos com erro.');
      else toast.error('Erro ao salvar agendamento.');
    } else {
      toast.error('Ocorreu um erro inesperado.');
    }
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      let finalClientId = formData.client_id;

      if (isNewClient) {
        try {
          const created = await businessService.createCustomer(newClientData);
          finalClientId = created.id;
          setCustomers((prev) => [...prev, created]);
        } catch (err: any) {
          handleApiError(err);
          setLoading(false);
          return;
        }
      }

      if (!finalClientId) {
        setErrors({ client_id: ['Selecione um cliente.'] });
        setLoading(false);
        return;
      }

      const payload = {
        client_id: finalClientId,
        service_id: Number(formData.service_id),
        start_time: getIsoWithOffset(formData.start_time),
        professional_id: formData.professional_id || null,
        discount: formData.discount,
        notes: formData.notes,
      };

      if (isEditing) {
        await appointmentService.updateAppointment(appointmentId!, payload);
        toast.success('Agendamento atualizado com sucesso!');
      } else {
        await appointmentService.createAppointment(payload);
        toast.success('Agendamento criado com sucesso!');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Selected values for Autocomplete ──
  const selectedClient = useMemo(
    () => customers.find((c) => c.id === formData.client_id) ?? null,
    [customers, formData.client_id],
  );
  const selectedService = useMemo(
    () => services.find((s) => s.id === Number(formData.service_id)) ?? null,
    [services, formData.service_id],
  );
  const selectedProfessional = useMemo(
    () => employees.find((e) => e.id === formData.professional_id) ?? null,
    [employees, formData.professional_id],
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}
      </DialogTitle>

      {loadingData ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* ── Seção Cliente ── */}
              <Box sx={{ bgcolor: 'custom.gray.50', p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Cliente
                  </Typography>
                  {!isEditing && (
                    <Button variant="link" size="sm" onClick={() => setIsNewClient(!isNewClient)}>
                      {isNewClient ? 'Selecionar Existente' : 'Cadastrar Novo Cliente'}
                    </Button>
                  )}
                </Box>

                {isNewClient ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Nome do Cliente"
                      name="name"
                      value={newClientData.name}
                      onChange={handleNewClientChange}
                      size="small"
                      required
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.join(' ')}
                    />
                    <TextField
                      label="Telefone ou CPF"
                      name="phone"
                      value={newClientData.phone}
                      onChange={handleNewClientChange}
                      size="small"
                      required
                      fullWidth
                      error={!!errors.phone}
                      helperText={errors.phone?.join(' ')}
                    />
                  </Box>
                ) : (
                  <Autocomplete
                    options={customers}
                    getOptionLabel={(opt) => `${opt.name} (${opt.phone})`}
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                    value={selectedClient}
                    inputValue={clientSearch}
                    onInputChange={(_e, val, reason) => {
                      if (reason !== 'reset') setClientSearch(val);
                    }}
                    onChange={(_e, val) => {
                      setFormData((prev) => ({ ...prev, client_id: val?.id ?? '' }));
                      if (errors.client_id) setErrors((prev) => ({ ...prev, client_id: [] }));
                    }}
                    loading={loadingClients}
                    noOptionsText="Nenhum cliente encontrado"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Buscar Cliente *"
                        size="small"
                        error={!!errors.client_id}
                        helperText={errors.client_id?.join(' ')}
                        slotProps={{
                          input: {
                            ...params.InputProps,
                            endAdornment: (
                              <React.Fragment>
                                {loadingClients ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </React.Fragment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                )}
              </Box>

              <Divider />

              {/* ── Serviço ── */}
              <Autocomplete
                options={services}
                getOptionLabel={(opt) => `${opt.service_name} — R$ ${opt.price} (${opt.duration_minutes} min)`}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                value={selectedService}
                onChange={(_e, val) => {
                  setFormData((prev) => ({ ...prev, service_id: val ? String(val.id) : '' }));
                  if (errors.service_id) setErrors((prev) => ({ ...prev, service_id: [] }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Serviço *"
                    size="small"
                    error={!!errors.service_id}
                    helperText={errors.service_id?.join(' ')}
                  />
                )}
              />

              {/* ── Profissional ── */}
              <Autocomplete
                options={employees}
                getOptionLabel={(opt) => opt.full_name}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                value={selectedProfessional}
                onChange={(_e, val) => {
                  setFormData((prev) => ({ ...prev, professional_id: val?.id ?? '' }));
                  if (errors.professional_id) setErrors((prev) => ({ ...prev, professional_id: [] }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Profissional (Opcional)"
                    size="small"
                    error={!!errors.professional_id}
                    helperText={errors.professional_id?.join(' ')}
                  />
                )}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Data e Hora de Início *"
                  name="start_time"
                  type="datetime-local"
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={formData.start_time}
                  onChange={handleChange}
                  error={!!errors.start_time}
                  helperText={errors.start_time?.join(' ')}
                  fullWidth
                  required
                />
                <TextField
                  label="Desconto"
                  name="discount"
                  type="number"
                  size="small"
                  value={formData.discount}
                  onChange={handleChange}
                  error={!!errors.discount}
                  helperText={errors.discount?.join(' ')}
                  sx={{ maxWidth: 160 }}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    },
                  }}
                />
              </Box>

              {/* ── Agenda do Dia (calendar-like preview) ── */}
              {selectedDate && (
                <DaySchedulePreview
                  date={selectedDate}
                  professionalId={formData.professional_id || undefined}
                  currentAppointmentId={appointmentId}
                />
              )}

              {/* ── Observações ── */}
              <TextField
                label="Observações"
                name="notes"
                multiline
                rows={2}
                size="small"
                value={formData.notes}
                onChange={handleChange}
                error={!!errors.notes}
                helperText={errors.notes?.join(' ')}
                fullWidth
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2, px: 3 }}>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar Agendamento'}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
}
