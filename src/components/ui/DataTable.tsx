import { type ReactNode, useMemo, useState } from 'react';
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import GridOnIcon from '@mui/icons-material/GridOn';
import DescriptionIcon from '@mui/icons-material/Description';

import { Button } from '@/components/ui/Button';
import { TablePaginationBar } from '@/components/ui/TablePaginationBar';
import { exportToCsv, exportToXlsx, type ExportColumn } from '@/utils/exportTable';

export interface DataTableColumn<T> {
  /** Identificador da coluna. Em modo servidor é enviado no parâmetro `ordering`. */
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  width?: number | string;
  /** Conteúdo exibido na célula. */
  render?: (row: T) => ReactNode;
  /** Valor usado na ordenação local, busca local e exportação. */
  value?: (row: T) => string | number | null | undefined;
  /** Remove a coluna do arquivo exportado (ex.: coluna de ações). */
  exportable?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string | number;
  loading?: boolean;
  title?: string;
  /** Texto do campo de busca. */
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** Nome base do arquivo exportado. Omita para esconder a exportação. */
  exportFilename?: string;
  /** Ações à direita da barra de ferramentas (ex.: botão de novo registro). */
  toolbarActions?: ReactNode;
  onRowClick?: (row: T) => void;
  /**
   * Modo servidor: busca, ordenação e paginação controlados por quem usa a tabela.
   * Sem estas props a tabela cuida de tudo localmente.
   */
  serverMode?: {
    search: string;
    onSearchChange: (value: string) => void;
    page: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
    total: number;
    ordering: string;
    onOrderingChange: (ordering: string) => void;
  };
  /** Linhas por página no modo local. */
  defaultPageSize?: number;
  pageSizeOptions?: number[];
}

const defaultValue = <T,>(column: DataTableColumn<T>, row: T): string | number | null | undefined => {
  if (column.value) return column.value(row);
  const raw = (row as Record<string, unknown>)[column.key];
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'number' || typeof raw === 'string') return raw;
  return String(raw);
};

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  loading = false,
  title,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhum registro encontrado.',
  exportFilename,
  toolbarActions,
  onRowClick,
  serverMode,
  defaultPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
}: DataTableProps<T>) {
  const theme = useTheme();
  const [localSearch, setLocalSearch] = useState('');
  const [localPage, setLocalPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(defaultPageSize);
  const [localOrdering, setLocalOrdering] = useState('');
  const [exportMenu, setExportMenu] = useState<HTMLElement | null>(null);

  const search = serverMode ? serverMode.search : localSearch;
  const ordering = serverMode ? serverMode.ordering : localOrdering;
  const page = serverMode ? serverMode.page : localPage;
  const pageSize = serverMode ? serverMode.pageSize : localPageSize;

  const setSearch = (value: string) => {
    if (serverMode) {
      serverMode.onSearchChange(value);
      serverMode.onPageChange(1);
    } else {
      setLocalSearch(value);
      setLocalPage(1);
    }
  };

  const setPage = (value: number) => (serverMode ? serverMode.onPageChange(value) : setLocalPage(value));

  const setPageSize = (value: number) => {
    if (serverMode) {
      serverMode.onPageSizeChange(value);
      serverMode.onPageChange(1);
    } else {
      setLocalPageSize(value);
      setLocalPage(1);
    }
  };

  const handleSort = (column: DataTableColumn<T>) => {
    if (column.sortable === false) return;
    const next = ordering === column.key ? `-${column.key}` : column.key;
    if (serverMode) {
      serverMode.onOrderingChange(next);
      serverMode.onPageChange(1);
    } else {
      setLocalOrdering(next);
      setLocalPage(1);
    }
  };

  const filteredRows = useMemo(() => {
    if (serverMode) return rows;
    const term = localSearch.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      columns.some((column) => String(defaultValue(column, row) ?? '').toLowerCase().includes(term)),
    );
  }, [rows, columns, localSearch, serverMode]);

  const sortedRows = useMemo(() => {
    if (serverMode || !localOrdering) return filteredRows;
    const descending = localOrdering.startsWith('-');
    const key = descending ? localOrdering.slice(1) : localOrdering;
    const column = columns.find((item) => item.key === key);
    if (!column) return filteredRows;

    const collator = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' });
    return [...filteredRows].sort((left, right) => {
      const a = defaultValue(column, left);
      const b = defaultValue(column, right);
      if (typeof a === 'number' && typeof b === 'number') {
        return descending ? b - a : a - b;
      }
      const result = collator.compare(String(a ?? ''), String(b ?? ''));
      return descending ? -result : result;
    });
  }, [filteredRows, localOrdering, columns, serverMode]);

  const total = serverMode ? serverMode.total : sortedRows.length;
  const visibleRows = useMemo(() => {
    if (serverMode) return sortedRows;
    const start = (localPage - 1) * localPageSize;
    return sortedRows.slice(start, start + localPageSize);
  }, [sortedRows, localPage, localPageSize, serverMode]);

  const handleExport = (format: 'csv' | 'xlsx') => {
    setExportMenu(null);
    if (!exportFilename) return;
    const exportColumns: ExportColumn[] = columns
      .filter((column) => column.exportable !== false)
      .map((column) => ({
        label: column.label,
        values: (serverMode ? rows : sortedRows).map((row) => defaultValue(column, row)),
      }));
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `${exportFilename}-${stamp}`;
    if (format === 'csv') exportToCsv(filename, exportColumns);
    else exportToXlsx(filename, exportColumns, title || 'Dados');
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: theme.palette.custom.shadows.card,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ p: 2.5, alignItems: { xs: 'stretch', md: 'center' } }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {title && (
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
              {title}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {loading ? 'Carregando...' : `${total} ${total === 1 ? 'registro' : 'registros'}`}
          </Typography>
        </Box>

        <TextField
          size="small"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={searchPlaceholder}
          sx={{ minWidth: { xs: '100%', md: 280 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')} aria-label="Limpar busca">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />

        {exportFilename && (
          <>
            <Button
              variant="outline"
              size="sm"
              startIcon={<DownloadIcon />}
              onClick={(event) => setExportMenu(event.currentTarget)}
              disabled={total === 0}
            >
              Exportar
            </Button>
            <Menu anchorEl={exportMenu} open={Boolean(exportMenu)} onClose={() => setExportMenu(null)}>
              <MenuItem onClick={() => handleExport('xlsx')}>
                <GridOnIcon fontSize="small" style={{ marginRight: 8 }} />
                Excel (.xlsx)
              </MenuItem>
              <MenuItem onClick={() => handleExport('csv')}>
                <DescriptionIcon fontSize="small" style={{ marginRight: 8 }} />
                CSV (.csv)
              </MenuItem>
            </Menu>
          </>
        )}

        {toolbarActions}
      </Stack>

      <Divider />

      <TableContainer sx={{ position: 'relative' }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: `${theme.palette.background.paper}c0`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <CircularProgress size={28} />
          </Box>
        )}
        <Table size="medium">
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.custom.gray[50] }}>
              {columns.map((column) => {
                const isSorted = ordering === column.key || ordering === `-${column.key}`;
                return (
                  <TableCell
                    key={column.key}
                    align={column.align || 'left'}
                    sx={{ fontWeight: 700, whiteSpace: 'nowrap', width: column.width }}
                    sortDirection={isSorted ? (ordering.startsWith('-') ? 'desc' : 'asc') : false}
                  >
                    {column.sortable === false ? (
                      column.label
                    ) : (
                      <TableSortLabel
                        active={isSorted}
                        direction={isSorted && ordering.startsWith('-') ? 'desc' : 'asc'}
                        onClick={() => handleSort(column)}
                      >
                        {column.label}
                      </TableSortLabel>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ py: 6, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {visibleRows.map((row) => (
              <TableRow
                key={getRowId(row)}
                hover
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align || 'left'}>
                    {column.render ? column.render(row) : defaultValue(column, row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider />

      <TablePaginationBar
        page={page}
        pageSize={pageSize}
        total={total}
        pageSizeOptions={pageSizeOptions}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </Paper>
  );
}
