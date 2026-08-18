import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Button } from '@/components/ui/Button';
import { appointmentService } from '@/services/appointment.service';
import { businessService, Customer, Employee, ServiceSalon } from '@/services/business.service';
import { useDebounce } from '@/hooks/useDebounce';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  appointmentId?: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewAppointmentModal: React.FC<Props> = ({ open, appointmentId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    professional_id: '',
    service_id: '',
    start_time: '',
    discount: '0.00',
    notes: '',
  });

  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', phone: '' });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<ServiceSalon[]>([]);
  
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
          service_id: '',
          start_time: '',
          discount: '0.00',
          notes: '',
        });
        setNewClientData({ name: '', phone: '' });
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
        service_id: String(appt.service.id),
        start_time: localStart,
        discount: appt.discount || '0.00',
        notes: appt.notes || '',
      });

      // Ensure the client is in the list
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
    setLoadingData(true);
    try {
      const [emp, serv] = await Promise.all([
        businessService.getEmployees(),
        businessService.getServices(),
      ]);
      setEmployees(emp);
      setServices(serv);
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

      const payload = {
        client_id: finalClientId,
        service_id: Number(formData.service_id),
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {appointmentId ? 'Editar Agendamento' : 'Novo Agendamento'}
      </DialogTitle>
      
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
                  <Typography variant="subtitle2" fontWeight="bold">Cliente</Typography>
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
                    getOptionLabel={(option) => `${option.name} (${option.phone})`}
                    value={customers.find(c => c.id === formData.client_id) || null}
                    onInputChange={(e, newInputValue) => setClientSearch(newInputValue)}
                    onChange={(e, newValue) => {
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
              
              {/* Seção Serviço e Profissional */}
              <Autocomplete
                options={services}
                getOptionLabel={(option) => `${option.service_name} - R$ ${option.price} (${option.duration_minutes} min)`}
                value={services.find(s => s.id === Number(formData.service_id)) || null}
                onChange={(e, newValue) => {
                  setFormData({ ...formData, service_id: newValue ? String(newValue.id) : '' });
                  if (errors.service_id) setErrors({ ...errors, service_id: [] });
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

              <Autocomplete
                options={employees}
                getOptionLabel={(option) => option.full_name}
                value={employees.find(e => e.id === formData.professional_id) || null}
                onChange={(e, newValue) => {
                  setFormData({ ...formData, professional_id: newValue ? newValue.id : '' });
                  if (errors.professional_id) setErrors({ ...errors, professional_id: [] });
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
                  label="Desconto (R$)"
                  name="discount"
                  type="number"
                  size="small"
                  value={formData.discount}
                  onChange={handleChange}
                  error={!!errors.discount}
                  helperText={errors.discount?.join(' ')}
                  fullWidth
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
          <DialogActions sx={{ p: 2, px: 3 }}>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Agendamento'}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
};
