import React, { useState, useEffect, useMemo } from 'react';
import {
  Alert,
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
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from '@/components/ui/Button';
import { appointmentService } from '@/services/appointment.service';
import { businessService, type Customer, type Employee, type ServiceSalon } from '@/services/business.service';
import { useDebounce } from '@/hooks/useDebounce';
import { TimeSlotPicker } from '@/components/appointment/TimeSlotPicker';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  appointmentId?: number | null;
  /** Data/hora inicial pré-preenchida no formato datetime-local (ex: "2026-08-23T09:00") */
  initialDate?: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface SelectedService {
  service: ServiceSalon;
  price: string;
  duration_minutes: number;
}

export const NewAppointmentModal: React.FC<Props> = ({ open, appointmentId, initialDate, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    professional_id: '',
    start_time: '',
    discount: '0.00',
    notes: '',
  });

  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', phone: '', cpf: '' });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [availableServices, setAvailableServices] = useState<ServiceSalon[]>([]);
  
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  
  // Para o Autocomplete de Cliente
  const [clientSearch, setClientSearch] = useState('');
  const debouncedClientSearch = useDebounce(clientSearch, 500);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    if (open) {
      loadStaticData();
      if (appointmentId) {
        loadAppointmentDetails(appointmentId);
      } else {
        setFormData({
          client_id: '',
          professional_id: '',
          start_time: initialDate || '',
          discount: '0.00',
          notes: '',
        });
        setSelectedServices([]);
        setNewClientData({ name: '', phone: '', cpf: '' });
        setIsNewClient(false);
      }
      setErrors({});
      setClientSearch('');
    }
  }, [open, appointmentId]);

  const loadAppointmentDetails = async (id: number) => {
    setLoadingData(true);
    try {
      const appt = await appointmentService.get(id);
      
      const pad = (n: number) => String(n).padStart(2, '0');
      let localStart = '';
      if (appt.start_time) {
        const d = new Date(appt.start_time);
        localStart = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }

      setFormData({
        client_id: appt.client.id,
        professional_id: appt.professional?.id || '',
        start_time: localStart,
        discount: appt.discount || '0.00',
        notes: appt.notes || '',
      });

      const servs = await businessService.getServices();
      setAvailableServices(servs);
      
      const selected = appt.items.map((item: any) => {
        const s = servs.find(x => x.id === item.service);
        return {
          service: s || { id: item.service, service_name: item.service_name, price: item.price, duration_minutes: item.duration_minutes } as any,
          price: item.price,
          duration_minutes: item.duration_minutes
        };
      });
      setSelectedServices(selected);

      const clientExists = customers.find(c => c.id === appt.client.id);
      if (!clientExists) {
        setCustomers(prev => [...prev, appt.client]);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados do agendamento.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (open && !isNewClient) {
      loadCustomers(debouncedClientSearch);
    }
  }, [debouncedClientSearch, open, isNewClient]);

  const loadStaticData = async () => {
    if (loadingData || availableServices.length > 0) return;
    setLoadingData(true);
    try {
      const [emp, serv] = await Promise.all([
        businessService.getEmployees(),
        businessService.getServices(),
      ]);
      setEmployees(emp);
      setAvailableServices(serv);
    } catch (error) {
      toast.error('Erro ao carregar dados do salão.');
    } finally {
      setLoadingData(false);
    }
  };

  const loadCustomers = async (search: string) => {
    setLoadingClients(true);
    try {
      const data = await businessService.getCustomers(search);
      setCustomers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: [] });
    }
  };

  const handleNewClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewClientData({ ...newClientData, [e.target.name]: e.target.value });
  };

  const handleServiceAdd = (service: ServiceSalon | null) => {
    if (service) {
      setSelectedServices([...selectedServices, { service, price: service.price, duration_minutes: service.duration_minutes }]);
      if (errors.services) setErrors({ ...errors, services: [] });
    }
  };

  const handleServiceRemove = (index: number) => {
    const newServices = [...selectedServices];
    newServices.splice(index, 1);
    setSelectedServices(newServices);
  };

  const handleServiceFieldChange = (index: number, field: 'price' | 'duration_minutes', value: string | number) => {
    const newServices = [...selectedServices];
    newServices[index] = { ...newServices[index], [field]: value };
    setSelectedServices(newServices);
  };

  const getIsoWithOffset = (localStr: string) => {
    if (!localStr) return '';
    const offset = new Date().getTimezoneOffset(); // em minutos
    const sign = offset > 0 ? '-' : '+';
    const absOffset = Math.abs(offset);
    const hours = String(Math.floor(absOffset / 60)).padStart(2, '0');
    const mins = String(absOffset % 60).padStart(2, '0');
    return `${localStr}:00${sign}${hours}:${mins}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      let finalClientId = formData.client_id;

      if (isNewClient) {
        const createdCustomer = await businessService.createCustomer(newClientData);
        finalClientId = createdCustomer.id;
        setCustomers([...customers, createdCustomer]);
      }

      if (!finalClientId) {
        setErrors({ client_id: ['Selecione um cliente.'] });
        setLoading(false);
        return;
      }

      if (selectedServices.length === 0) {
        setErrors({ services: ['Adicione pelo menos um serviço.'] });
        setLoading(false);
        return;
      }

      const payload = {
        client_id: finalClientId,
        services: selectedServices.map(s => ({
          service_id: s.service.id,
          price: s.price,
          duration_minutes: s.duration_minutes
        })),
        start_time: getIsoWithOffset(formData.start_time),
        professional_id: formData.professional_id || null,
        discount: formData.discount,
        notes: formData.notes,
      };

      if (appointmentId) {
        await appointmentService.updateAppointment(appointmentId, payload);
        toast.success('Agendamento atualizado com sucesso!');
      } else {
        await appointmentService.createAppointment(payload);
        toast.success('Agendamento criado com sucesso!');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response && error.response.data) {
        const responseData = error.response.data;
        const newErrors: Record<string, string[]> = {};
        let hasFieldErrors = false;
        
        Object.keys(responseData).forEach(key => {
          if (Array.isArray(responseData[key])) {
            newErrors[key] = responseData[key];
            hasFieldErrors = true;
          } else if (typeof responseData[key] === 'string') {
            newErrors[key] = [responseData[key]];
            hasFieldErrors = true;
          }
        });
        
        setErrors(newErrors);
        
        if (responseData.detail) {
          toast.error(responseData.detail);
        } else if (responseData.non_field_errors) {
          toast.error(responseData.non_field_errors[0]);
        } else if (hasFieldErrors) {
          toast.error('Verifique os campos com erro.');
        } else {
          toast.error('Erro ao salvar agendamento.');
        }
      } else {
        toast.error('Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Profissionais que realizam TODOS os serviços escolhidos.
  // Quem ainda não tem serviços vinculados continua disponível (sem restrição cadastrada).
  const filteredEmployees = useMemo(() => {
    const ids = selectedServices.map((item) => item.service.id);
    if (ids.length === 0) return employees;
    return employees.filter((employee) => {
      const links = employee.services ?? [];
      if (links.length === 0) return true;
      return ids.every((id) => links.some((link) => link.service_id === id));
    });
  }, [employees, selectedServices]);

  // Limpa o profissional que não atende mais a combinação de serviços
  useEffect(() => {
    if (formData.professional_id && !filteredEmployees.some((e) => e.id === formData.professional_id)) {
      setFormData((current) => ({ ...current, professional_id: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredEmployees]);

  const totalDuration = selectedServices.reduce((sum, item) => sum + (item.duration_minutes || 0), 0);
  const totalPrice = selectedServices.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  const finalPrice = Math.max(0, totalPrice - (parseFloat(formData.discount) || 0));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>{appointmentId ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>

      {loadingData ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Seção Cliente */}
              <Box sx={{ bgcolor: 'custom.gray.50', p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Cliente
                  </Typography>
                  <Button variant="link" size="sm" onClick={() => setIsNewClient(!isNewClient)}>
                    {isNewClient ? 'Selecionar Existente' : 'Cadastrar Novo Cliente'}
                  </Button>
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
                    />
                    <TextField
                      label="Telefone"
                      name="phone"
                      value={newClientData.phone}
                      onChange={handleNewClientChange}
                      size="small"
                      required
                      fullWidth
                      error={!!errors.phone}
                      helperText={errors.phone?.join(' ')}
                    />
                    <TextField
                      label="CPF"
                      name="cpf"
                      value={newClientData.cpf}
                      onChange={handleNewClientChange}
                      size="small"
                      required
                      fullWidth
                      error={!!errors.cpf}
                      helperText={errors.cpf?.join(' ')}
                    />
                  </Box>
                ) : (
                  <Autocomplete
                    options={customers}
                    getOptionLabel={(option) => `${option.name} (${option.phone})`}
                    value={customers.find((c) => c.id === formData.client_id) || null}
                    onInputChange={(_e, newInputValue) => setClientSearch(newInputValue)}
                    onChange={(_e, newValue) => {
                      setFormData({ ...formData, client_id: newValue ? newValue.id : '' });
                      if (errors.client_id) setErrors({ ...errors, client_id: [] });
                    }}
                    loading={loadingClients}
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

              {/* Seção Serviços */}
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Serviços</Typography>
                
                <Autocomplete
                  options={availableServices}
                  getOptionLabel={(option) => `${option.service_name} - R$ ${option.price} (${option.duration_minutes} min)`}
                  onChange={(_e, newValue) => handleServiceAdd(newValue)}
                  value={null}
                  renderInput={(params) => (
                    <TextField {...params} label="Adicionar Serviço" size="small" error={!!errors.services} helperText={errors.services?.join(' ')} />
                  )}
                  sx={{ mb: 2 }}
                />

                {selectedServices.length > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {selectedServices.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="bold">{item.service.service_name}</Typography>
                        </Box>
                        <TextField
                          size="small"
                          label="Minutos"
                          type="number"
                          value={item.duration_minutes}
                          onChange={(e) => handleServiceFieldChange(index, 'duration_minutes', parseInt(e.target.value) || 0)}
                          sx={{ width: 80 }}
                        />
                        <TextField
                          size="small"
                          label="Preço"
                          type="number"
                          value={item.price}
                          onChange={(e) => handleServiceFieldChange(index, 'price', e.target.value)}
                          sx={{ width: 100 }}
                          slotProps={{ htmlInput: { step: '0.01' } }}
                        />
                        <IconButton size="small" color="error" onClick={() => handleServiceRemove(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, p: 1, bgcolor: 'custom.gray.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Duração total: {totalDuration} min</Typography>
                      <Typography variant="body2" fontWeight="bold">Subtotal: R$ {totalPrice.toFixed(2)}</Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              <Divider />

              <Autocomplete
                options={filteredEmployees}
                getOptionLabel={(option) => option.full_name}
                value={filteredEmployees.find((e) => e.id === formData.professional_id) || null}
                onChange={(_e, newValue) => {
                  setFormData({ ...formData, professional_id: newValue ? newValue.id : '' });
                  if (errors.professional_id) setErrors({ ...errors, professional_id: [] });
                }}
                noOptionsText="Nenhum profissional realiza os serviços escolhidos"
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Box>
                      <Typography variant="body2">{option.full_name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.services?.length
                          ? option.services.map((s) => s.service_name).join(', ')
                          : 'Sem serviços vinculados'}
                      </Typography>
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Profissional (Opcional)"
                    size="small"
                    error={!!errors.professional_id}
                    helperText={
                      errors.professional_id?.join(' ') ||
                      (selectedServices.length > 0
                        ? `${filteredEmployees.length} profissional(is) realiza(m) os serviços escolhidos`
                        : 'Escolha os serviços para filtrar quem os realiza')
                    }
                  />
                )}
              />

              {selectedServices.length > 0 && filteredEmployees.length === 0 && (
                <Alert severity="warning">
                  Nenhum profissional cadastrado realiza todos os serviços escolhidos. Vincule os serviços em
                  Funcionários ou agende sem profissional definido.
                </Alert>
              )}

              <Divider />

              <TimeSlotPicker
                value={formData.start_time}
                onChange={(next) => {
                  setFormData((current) => ({ ...current, start_time: next }));
                  if (errors.start_time) setErrors({ ...errors, start_time: [] });
                }}
                professionalId={formData.professional_id || null}
                serviceIds={selectedServices.map((item) => item.service.id)}
                duration={totalDuration}
                appointmentId={appointmentId}
                error={errors.start_time?.join(' ')}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Desconto (R$)"
                  name="discount"
                  type="number"
                  size="small"
                  value={formData.discount}
                  onChange={handleChange}
                  error={!!errors.discount}
                  helperText={errors.discount?.join(' ')}
                  fullWidth
                  slotProps={{ htmlInput: { step: '0.01' } }}
                />
              </Box>

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
          <DialogActions sx={{ p: 2, px: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Total: R$ {finalPrice.toFixed(2)}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" variant="hero" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </Box>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
};
