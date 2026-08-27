import { useCallback, useEffect, useState } from 'react';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { EmployeeFormModal } from '@/components/EmployeeFormModal';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermissions } from '@/hooks/usePermissions';
import { employeeService, type Employee } from '@/services/employee.service';
import { businessService, type ServiceSalon } from '@/services/business.service';

const money = (value: string): string =>
  Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Employees() {
  const { isManagerOrOwner } = usePermissions();
  const [rows, setRows] = useState<Employee[]>([]);
  const [services, setServices] = useState<ServiceSalon[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [ordering, setOrdering] = useState('full_name');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const debouncedSearch = useDebounce(search, 400);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await employeeService.list({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
        ordering: ordering || undefined,
      });
      setRows(data.results);
      setTotal(data.count);
    } catch {
      toast.error('Não foi possível carregar os funcionários.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, ordering]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    businessService
      .getServices()
      .then(setServices)
      .catch(() => toast.error('Não foi possível carregar os serviços.'));
  }, []);

  const handleToggleActive = async (employee: Employee) => {
    try {
      if (employee.is_active) {
        await employeeService.deactivate(employee.id);
        toast.success('Funcionário desativado.');
      } else {
        await employeeService.reactivate(employee.id);
        toast.success('Funcionário reativado.');
      }
      void load();
    } catch {
      toast.error('Não foi possível alterar a situação do funcionário.');
    }
  };

  const columns: DataTableColumn<Employee>[] = [
    {
      key: 'full_name',
      label: 'Funcionário',
      render: (row) => (
        <Stack>
          <Typography variant="body2" fontWeight={600}>
            {row.full_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.email || row.cpf_cnpj}
          </Typography>
        </Stack>
      ),
      value: (row) => row.full_name,
    },
    { key: 'role', label: 'Função', render: (row) => row.role_display, value: (row) => row.role_display },
    {
      key: 'contract_type',
      label: 'Contrato',
      render: (row) => row.contract_type_display,
      value: (row) => row.contract_type_display,
    },
    {
      key: 'services',
      label: 'Serviços',
      sortable: false,
      render: (row) =>
        row.services.length === 0 ? (
          <Typography variant="caption" color="warning.main">
            Nenhum serviço vinculado
          </Typography>
        ) : (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {row.services.map((service) => (
              <Chip key={service.service_id} size="small" label={service.service_name} />
            ))}
          </Stack>
        ),
      value: (row) => row.services.map((service) => service.service_name).join(', '),
    },
    {
      key: 'default_commission_rate',
      label: 'Comissão',
      align: 'right',
      render: (row) => `${Number(row.default_commission_rate || 0).toFixed(2)}%`,
      value: (row) => Number(row.default_commission_rate || 0),
    },
    {
      key: 'fixed_salary',
      label: 'Salário',
      align: 'right',
      render: (row) => money(row.fixed_salary),
      value: (row) => Number(row.fixed_salary || 0),
    },
    {
      key: 'is_active',
      label: 'Situação',
      align: 'center',
      render: (row) => (
        <Chip
          size="small"
          label={row.is_active ? 'Ativo' : 'Inativo'}
          color={row.is_active ? 'success' : 'default'}
          variant={row.is_active ? 'filled' : 'outlined'}
        />
      ),
      value: (row) => (row.is_active ? 'Ativo' : 'Inativo'),
    },
    {
      key: 'actions',
      label: 'Ações',
      align: 'right',
      sortable: false,
      exportable: false,
      render: (row) =>
        isManagerOrOwner ? (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Tooltip title="Editar">
              <IconButton
                size="small"
                onClick={() => {
                  setEditing(row);
                  setModalOpen(true);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={row.is_active ? 'Desativar' : 'Reativar'}>
              <IconButton size="small" onClick={() => handleToggleActive(row)}>
                {row.is_active ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Stack>
        ) : null,
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Funcionários
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cadastre a equipe e defina quais serviços cada profissional realiza.
        </Typography>
      </Box>

      <DataTable<Employee>
        title="Funcionários"
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        loading={loading}
        searchPlaceholder="Buscar por nome ou CPF/CNPJ"
        emptyMessage="Nenhum funcionário cadastrado."
        exportFilename="funcionarios"
        toolbarActions={
          isManagerOrOwner ? (
            <Button
              startIcon={<AddIcon />}
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              Novo funcionário
            </Button>
          ) : undefined
        }
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

      <EmployeeFormModal
        open={modalOpen}
        employee={editing}
        services={services}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />
    </Box>
  );
}
