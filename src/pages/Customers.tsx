import { useEffect, useState } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import toast from 'react-hot-toast';

import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
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

export default function Customers() {
  const [rows, setRows] = useState<CustomerListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [ordering, setOrdering] = useState('name');
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await businessService.listCustomers({
          page,
          page_size: pageSize,
          search: debouncedSearch || undefined,
          ordering: ordering || undefined,
        });
        if (!active) return;
        setRows(data.results);
        setTotal(data.count);
      } catch {
        if (active) toast.error('Não foi possível carregar os clientes.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [page, pageSize, debouncedSearch, ordering]);

  const columns: DataTableColumn<CustomerListItem>[] = [
    {
      key: 'name',
      label: 'Cliente',
      render: (row) => (
        <Stack>
          <Typography variant="body2" fontWeight={600}>
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
      key: 'created_at',
      label: 'Cliente desde',
      render: (row) => formatDate(row.created_at),
      value: (row) => formatDate(row.created_at),
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
    </Box>
  );
}
