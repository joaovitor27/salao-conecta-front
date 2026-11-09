import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { describe, it, expect, vi } from 'vitest';
import theme from '@/theme';
import { StatusChip } from '@/components/ui/StatusChip';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';

interface SampleServiceRow {
  id: number;
  name: string;
  price: number;
}

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('StatusChip Component', () => {
  it.each([
    ['confirmed', 'Confirmado'],
    ['pending', 'Pendente'],
    ['completed', 'Concluído'],
    ['cancelled', 'Cancelado'],
    ['unknown_status', 'Outro'],
  ])('renders status "%s" with label "%s"', (status, label) => {
    renderWithTheme(<StatusChip status={status} label={label} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe('DataTable Component', () => {
  const columns: DataTableColumn<SampleServiceRow>[] = [
    { key: 'name', label: 'Serviço', sortable: true },
    {
      key: 'price',
      label: 'Valor',
      sortable: true,
      value: (row) => row.price,
      render: (row) => `R$ ${row.price.toFixed(2)}`,
    },
  ];

  const rows: SampleServiceRow[] = [
    { id: 1, name: 'Corte Feminino', price: 80 },
    { id: 2, name: 'Escova Modelada', price: 60 },
    { id: 3, name: 'Hidratação Profunda', price: 120 },
  ];

  it('renders title, row count, and table rows', () => {
    renderWithTheme(
      <DataTable<SampleServiceRow>
        title="Catálogo de Serviços"
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
      />,
    );

    expect(screen.getByText('Catálogo de Serviços')).toBeInTheDocument();
    expect(screen.getByText('3 registros')).toBeInTheDocument();
    expect(screen.getByText('Corte Feminino')).toBeInTheDocument();
    expect(screen.getByText('R$ 80.00')).toBeInTheDocument();
    expect(screen.getByText('Escova Modelada')).toBeInTheDocument();
    expect(screen.getByText('Hidratação Profunda')).toBeInTheDocument();
  });

  it('filters rows locally based on search input and clears search when requested', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <DataTable<SampleServiceRow>
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        searchPlaceholder="Buscar serviço..."
      />,
    );

    const searchInput = screen.getByPlaceholderText('Buscar serviço...');
    await user.type(searchInput, 'Escova');

    expect(screen.getByText('Escova Modelada')).toBeInTheDocument();
    expect(screen.queryByText('Corte Feminino')).not.toBeInTheDocument();
    expect(screen.getByText('1 registro')).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: /limpar busca/i });
    await user.click(clearButton);

    expect(screen.getByText('Corte Feminino')).toBeInTheDocument();
    expect(screen.getByText('3 registros')).toBeInTheDocument();
  });

  it('shows emptyMessage when no rows match the search filter', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <DataTable<SampleServiceRow>
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        emptyMessage="Nenhum serviço encontrado."
      />,
    );

    await user.type(screen.getByPlaceholderText('Buscar...'), 'InexistenteXYZ');
    expect(screen.getByText('Nenhum serviço encontrado.')).toBeInTheDocument();
  });

  it('sorts rows ascending and descending when clicking a sortable column header', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <DataTable<SampleServiceRow>
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
      />,
    );

    const priceSortButton = screen.getByRole('button', { name: /valor/i });
    await user.click(priceSortButton);

    const bodyRowsAsc = screen.getAllByRole('row').slice(1);
    expect(bodyRowsAsc[0]).toHaveTextContent('Escova Modelada');
    expect(bodyRowsAsc[2]).toHaveTextContent('Hidratação Profunda');

    await user.click(priceSortButton);
    const bodyRowsDesc = screen.getAllByRole('row').slice(1);
    expect(bodyRowsDesc[0]).toHaveTextContent('Hidratação Profunda');
    expect(bodyRowsDesc[2]).toHaveTextContent('Escova Modelada');
  });

  it('invokes onRowClick when a row is clicked', async () => {
    const user = userEvent.setup();
    const handleRowClick = vi.fn<(row: SampleServiceRow) => void>();

    renderWithTheme(
      <DataTable<SampleServiceRow>
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        onRowClick={handleRowClick}
      />,
    );

    await user.click(screen.getByText('Corte Feminino'));
    expect(handleRowClick).toHaveBeenCalledWith(rows[0]);
  });
});
