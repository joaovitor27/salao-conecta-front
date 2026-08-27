import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import {
  CONTRACT_TYPES,
  EMPLOYEE_ROLES,
  employeeService,
  roleHasLogin,
  type Employee,
  type EmployeePayload,
} from '@/services/employee.service';
import type { ServiceSalon } from '@/services/business.service';

interface EmployeeFormModalProps {
  open: boolean;
  employee: Employee | null;
  services: ServiceSalon[];
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  full_name: string;
  cpf_cnpj: string;
  role: string;
  contract_type: string;
  is_schedulable: boolean;
  is_active: boolean;
  fixed_salary: string;
  default_commission_rate: string;
  email: string;
  password: string;
  serviceIds: number[];
}

const emptyForm: FormState = {
  full_name: '',
  cpf_cnpj: '',
  role: 'professional',
  contract_type: 'commission',
  is_schedulable: true,
  is_active: true,
  fixed_salary: '',
  default_commission_rate: '',
  email: '',
  password: '',
  serviceIds: [],
};

const toForm = (employee: Employee): FormState => ({
  full_name: employee.full_name,
  cpf_cnpj: employee.cpf_cnpj,
  role: employee.role,
  contract_type: employee.contract_type,
  is_schedulable: employee.is_schedulable,
  is_active: employee.is_active,
  fixed_salary: employee.fixed_salary ?? '',
  default_commission_rate: employee.default_commission_rate ?? '',
  email: employee.email ?? '',
  password: '',
  serviceIds: employee.services.map((item) => item.service_id),
});

export function EmployeeFormModal({ open, employee, services, onClose, onSaved }: EmployeeFormModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(employee ? toForm(employee) : emptyForm);
    setErrors({});
  }, [open, employee]);

  const hasLogin = roleHasLogin(form.role);
  const selectedServices = useMemo(
    () => services.filter((service) => form.serviceIds.includes(service.id)),
    [services, form.serviceIds],
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async () => {
    const payload: EmployeePayload = {
      full_name: form.full_name,
      cpf_cnpj: form.cpf_cnpj,
      role: form.role,
      contract_type: form.contract_type,
      is_schedulable: form.is_schedulable,
      is_active: form.is_active,
      fixed_salary: form.fixed_salary || '0',
      default_commission_rate: form.default_commission_rate || '0',
      services: form.serviceIds.map((id) => ({ service_id: id })),
    };
    if (hasLogin) {
      if (form.email) payload.email = form.email;
      if (form.password) payload.password = form.password;
    }

    setSaving(true);
    setErrors({});
    try {
      if (employee) await employeeService.update(employee.id, payload);
      else await employeeService.create(payload);
      toast.success(employee ? 'Funcionário atualizado!' : 'Funcionário cadastrado!');
      onSaved();
      onClose();
    } catch (error: any) {
      const data = error?.response?.data;
      if (data && typeof data === 'object') {
        const parsed: Record<string, string> = {};
        Object.entries(data).forEach(([field, message]) => {
          parsed[field] = Array.isArray(message) ? String(message[0]) : String(message);
        });
        setErrors(parsed);
        toast.error(parsed.detail || 'Verifique os campos destacados.');
      } else {
        toast.error('Não foi possível salvar o funcionário.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {employee ? 'Editar funcionário' : 'Novo funcionário'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 7 }}>
            <TextField
              label="Nome completo"
              value={form.full_name}
              onChange={(event) => update('full_name', event.target.value)}
              error={Boolean(errors.full_name)}
              helperText={errors.full_name}
              fullWidth
              autoFocus
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField
              label="CPF ou CNPJ"
              value={form.cpf_cnpj}
              onChange={(event) => update('cpf_cnpj', event.target.value)}
              error={Boolean(errors.cpf_cnpj)}
              helperText={errors.cpf_cnpj || 'Somente números ou formatado'}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Função"
              value={form.role}
              onChange={(event) => update('role', event.target.value)}
              error={Boolean(errors.role)}
              helperText={errors.role}
              fullWidth
            >
              {EMPLOYEE_ROLES.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Tipo de contrato"
              value={form.contract_type}
              onChange={(event) => update('contract_type', event.target.value)}
              fullWidth
            >
              {CONTRACT_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Salário fixo (R$)"
              value={form.fixed_salary}
              onChange={(event) => update('fixed_salary', event.target.value)}
              error={Boolean(errors.fixed_salary)}
              helperText={errors.fixed_salary}
              disabled={form.contract_type !== 'fixed'}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Comissão padrão (%)"
              value={form.default_commission_rate}
              onChange={(event) => update('default_commission_rate', event.target.value)}
              error={Boolean(errors.default_commission_rate)}
              helperText={errors.default_commission_rate}
              fullWidth
            />
          </Grid>

          <Grid size={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_schedulable}
                  onChange={(event) => update('is_schedulable', event.target.checked)}
                />
              }
              label="Atende clientes na agenda"
            />
            {employee && (
              <FormControlLabel
                control={
                  <Switch checked={form.is_active} onChange={(event) => update('is_active', event.target.checked)} />
                }
                label="Ativo"
              />
            )}
          </Grid>

          <Grid size={12}>
            <Autocomplete
              multiple
              options={services}
              value={selectedServices}
              onChange={(_, value) => update('serviceIds', value.map((service) => service.id))}
              getOptionLabel={(option) => option.service_name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Serviços que este funcionário realiza"
                  error={Boolean(errors.services)}
                  helperText={
                    errors.services ||
                    'Usado na agenda para mostrar apenas os profissionais que fazem o serviço escolhido.'
                  }
                />
              )}
            />
          </Grid>

          {hasLogin && (
            <Grid size={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Esta função tem acesso ao sistema. Informe e-mail e senha para criar o login.
              </Alert>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="E-mail de acesso"
                  value={form.email}
                  onChange={(event) => update('email', event.target.value)}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  fullWidth
                />
                <TextField
                  label={employee?.has_login ? 'Nova senha (opcional)' : 'Senha'}
                  type="password"
                  value={form.password}
                  onChange={(event) => update('password', event.target.value)}
                  error={Boolean(errors.password)}
                  helperText={errors.password || 'Mínimo de 6 caracteres'}
                  fullWidth
                />
              </Stack>
            </Grid>
          )}

          {!hasLogin && (
            <Grid size={12}>
              <Typography variant="caption" color="text.secondary">
                Profissional da Beleza e Apoio não fazem login no sistema.
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
