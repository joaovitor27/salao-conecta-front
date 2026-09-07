import { useEffect, useState } from 'react';
import { Box, Chip, Stack, Typography, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import toast from 'react-hot-toast';

import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { useDebounce } from '@/hooks/useDebounce';
import { businessService, type CustomerListItem } from '@/services/business.service';

const formatDate = (value: string | null): string =>
  value ? new Date(value).toLocaleDateString('pt-BR') : '—';

const formatPhone = (value: string): string => {
  const digits = (value || '').replace(/\D/g, '');
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return value || '—';
};

interface CustomerEditModalProps {
  open: boolean;
  customerId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

function CustomerEditModal({ open, customerId, onClose, onSuccess }: CustomerEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cpf: '',
    email: '',
    birth_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (open && customerId) {
      loadCustomer(customerId);
    } else {
      setFormData({ name: '', phone: '', cpf: '', email: '', birth_date: '' });
    }
  }, [open, customerId]);

  const loadCustomer = async (id: string) => {
    setLoadingData(true);
    try {
      const data = await businessService.getCustomer(id);
      setFormData({
        name: data.name,
        phone: data.phone,
        cpf: data.cpf || '',
        email: data.email || '',
        birth_date: data.birth_date || '',
      });
    } catch (error) {
      toast.error('Erro ao carregar dados do cliente.');
      onClose();
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;
    setLoading(true);
    try {
      await businessService.updateCustomer(customerId, {
        ...formData,
        birth_date: formData.birth_date || null,
      });
      toast.success('Cliente atualizado com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Erro ao atualizar cliente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Cliente</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loadingData ? (
             <Typography>Carregando...</Typography>
          ) : (
            <>
              <TextField label="Nome" name="name" value={formData.name} onChange={handleChange} required fullWidth size="small" />
              <TextField label="Telefone" name="phone" value={formData.phone} onChange={handleChange} required fullWidth size="small" />
              <TextField label="CPF" name="cpf" value={formData.cpf} onChange={handleChange} fullWidth size="small" />
              <TextField label="Email" name="email" value={formData.email} onChange={handleChange} fullWidth size="small" type="email" />
              <TextField label="Data de Nascimento" name="birth_date" value={formData.birth_date} onChange={handleChange} fullWidth size="small" type="date" InputLabelProps={{ shrink: true }} />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="hero" disabled={loading || loadingData}>Salvar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function Customers() {
  const [rows, setRows] = useState<CustomerListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [ordering, setOrdering] = useState('name');
  const debouncedSearch = useDebounce(search, 400);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuCustomer, setMenuCustomer] = useState<CustomerListItem | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await businessService.listCustomers({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
        ordering: ordering || undefined,
      });
      setRows(data.results);
      setTotal(data.count);
    } catch {
      toast.error('Não foi possível carregar os clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, pageSize, debouncedSearch, ordering]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, customer: CustomerListItem) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuCustomer(customer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCustomer(null);
  };

  const handleEdit = () => {
    if (menuCustomer) {
      setSelectedCustomerId(menuCustomer.id);
      setEditModalOpen(true);
    }
    handleMenuClose();
  };

  const handleToggleActive = async () => {
    if (menuCustomer) {
      try {
        await businessService.updateCustomer(menuCustomer.id, { is_active: !menuCustomer.is_active });
        toast.success(`Cliente ${menuCustomer.is_active ? 'desativado' : 'reativado'} com sucesso!`);
        load();
      } catch {
        toast.error('Erro ao alterar status do cliente.');
      }
    }
    handleMenuClose();
  };

  const columns: DataTableColumn<CustomerListItem>[] = [
    {
      key: 'name',
      label: 'Cliente',
      render: (row) => (
        <Stack>
          <Typography variant="body2" fontWeight={600} sx={{ textDecoration: row.is_active ? 'none' : 'line-through', color: row.is_active ? 'text.primary' : 'text.disabled' }}>
            {row.name}
          </Typography>
          {row.email && (
            <Typography variant="caption" color="text.secondary">
              {row.email}
            </Typography>
          )}
        </Stack>
      ),
      value: (row) => row.name,
    },
    { key: 'phone', label: 'Telefone', render: (row) => formatPhone(row.phone), value: (row) => row.phone },
    { key: 'cpf', label: 'CPF', sortable: false, value: (row) => row.cpf || '' },
    {
      key: 'birth_date',
      label: 'Nascimento',
      render: (row) => formatDate(row.birth_date),
      value: (row) => formatDate(row.birth_date),
    },
    {
      key: 'appointments_count',
      label: 'Atendimentos',
      align: 'center',
      render: (row) => <Chip size="small" label={row.appointments_count} />,
      value: (row) => row.appointments_count,
    },
    {
      key: 'last_visit',
      label: 'Última visita',
      render: (row) => formatDate(row.last_visit),
      value: (row) => formatDate(row.last_visit),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      sortable: false,
      render: (row) => (
        <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
      value: () => '',
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Clientes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Base de clientes do salão com histórico de atendimentos.
        </Typography>
      </Box>

      <DataTable<CustomerListItem>
        title="Clientes"
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        loading={loading}
        searchPlaceholder="Buscar por nome, telefone, CPF ou e-mail"
        emptyMessage="Nenhum cliente encontrado."
        exportFilename="clientes"
        serverMode={{
          search,
          onSearchChange: setSearch,
          page,
          onPageChange: setPage,
          pageSize,
          onPageSizeChange: setPageSize,
          total,
          ordering,
          onOrderingChange: setOrdering,
        }}
      />
      
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>Editar</MenuItem>
        <MenuItem onClick={handleToggleActive} sx={{ color: menuCustomer?.is_active ? 'error.main' : 'success.main' }}>
          {menuCustomer?.is_active ? 'Desativar' : 'Reativar'}
        </MenuItem>
      </Menu>

      <CustomerEditModal
        open={editModalOpen}
        customerId={selectedCustomerId}
        onClose={() => setEditModalOpen(false)}
        onSuccess={load}
      />
    </Box>
  );
}
