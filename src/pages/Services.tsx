import React, { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import toast from 'react-hot-toast';

import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { useDebounce } from '@/hooks/useDebounce';
import { businessService, type ServiceSalonFull } from '@/services/business.service';

interface ServiceEditModalProps {
  open: boolean;
  serviceData: ServiceSalonFull | null;
  onClose: () => void;
  onSuccess: () => void;
}

function ServiceEditModal({ open, serviceData, onClose, onSuccess }: ServiceEditModalProps) {
  const [formData, setFormData] = useState({
    service_name: '',
    price: '',
    duration_minutes: 30,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (serviceData) {
        setFormData({
          service_name: serviceData.service_name,
          price: serviceData.price,
          duration_minutes: serviceData.duration_minutes,
          is_active: serviceData.is_active,
        });
      } else {
        setFormData({
          service_name: '',
          price: '',
          duration_minutes: 30,
          is_active: true,
        });
      }
    }
  }, [open, serviceData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        duration_minutes: parseInt(String(formData.duration_minutes)) || 30,
      };

      if (serviceData) {
        await businessService.updateServiceSalon(serviceData.id, payload);
        toast.success('Serviço atualizado com sucesso!');
      } else {
        await businessService.createServiceSalon(payload);
        toast.success('Serviço criado com sucesso!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar serviço.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{serviceData ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Nome do Serviço"
            name="service_name"
            value={formData.service_name}
            onChange={handleChange}
            required
            fullWidth
            size="small"
          />
          <TextField
            label="Preço (R$)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
            fullWidth
            size="small"
            slotProps={{
              htmlInput: { step: '0.01' },
            }}
          />
          <TextField
            label="Duração (minutos)"
            name="duration_minutes"
            type="number"
            value={formData.duration_minutes}
            onChange={handleChange}
            required
            fullWidth
            size="small"
          />
          <FormControlLabel
            control={<Switch checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />}
            label={formData.is_active ? 'Ativo' : 'Inativo'}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="hero" disabled={loading}>
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function Services() {
  const [rows, setRows] = useState<ServiceSalonFull[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [ordering, setOrdering] = useState('service_name');
  const debouncedSearch = useDebounce(search, 400);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceSalonFull | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuService, setMenuService] = useState<ServiceSalonFull | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await businessService.listServicesManagement({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
      });
      setRows(data.results);
      setTotal(data.count);
    } catch {
      toast.error('Não foi possível carregar os serviços.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page, pageSize, debouncedSearch, ordering]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, service: ServiceSalonFull) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuService(service);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuService(null);
  };

  const handleEdit = () => {
    if (menuService) {
      setSelectedService(menuService);
      setEditModalOpen(true);
    }
    handleMenuClose();
  };

  const handleCreate = () => {
    setSelectedService(null);
    setEditModalOpen(true);
  };

  const handleToggleActive = async () => {
    if (menuService) {
      try {
        await businessService.updateServiceSalon(menuService.id, { is_active: !menuService.is_active });
        toast.success(`Serviço ${menuService.is_active ? 'desativado' : 'reativado'} com sucesso!`);
        void load();
      } catch {
        toast.error('Erro ao alterar status do serviço.');
      }
    }
    handleMenuClose();
  };

  const columns: DataTableColumn<ServiceSalonFull>[] = [
    {
      key: 'service_name',
      label: 'Nome do Serviço',
      render: (row) => (
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{ textDecoration: row.is_active ? 'none' : 'line-through', color: row.is_active ? 'text.primary' : 'text.disabled' }}
        >
          {row.service_name}
        </Typography>
      ),
      value: (row) => row.service_name,
    },
    { key: 'price', label: 'Preço', render: (row) => `R$ ${parseFloat(row.price).toFixed(2)}`, value: (row) => parseFloat(row.price) },
    { key: 'duration_minutes', label: 'Duração (min)', value: (row) => row.duration_minutes },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Typography variant="caption" sx={{ color: row.is_active ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
          {row.is_active ? 'Ativo' : 'Inativo'}
        </Typography>
      ),
      value: (row) => (row.is_active ? 'Ativo' : 'Inativo'),
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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Serviços
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os serviços oferecidos pelo salão.
          </Typography>
        </Box>
        <Button variant="hero" onClick={handleCreate}>
          Novo Serviço
        </Button>
      </Box>

      <DataTable<ServiceSalonFull>
        title="Serviços"
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        loading={loading}
        searchPlaceholder="Buscar por nome do serviço"
        emptyMessage="Nenhum serviço encontrado."
        exportFilename="servicos"
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
        <MenuItem onClick={handleToggleActive} sx={{ color: menuService?.is_active ? 'error.main' : 'success.main' }}>
          {menuService?.is_active ? 'Desativar' : 'Reativar'}
        </MenuItem>
      </Menu>

      <ServiceEditModal open={editModalOpen} serviceData={selectedService} onClose={() => setEditModalOpen(false)} onSuccess={load} />
    </Box>
  );
}
