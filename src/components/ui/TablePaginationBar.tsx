import { Box, IconButton, MenuItem, Select, Stack, Typography, useTheme } from '@mui/material';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface TablePaginationBarProps {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/** Sequência de páginas com reticências: 1 … 4 5 [6] 7 8 … 20 */
const buildPages = (current: number, totalPages: number): (number | 'gap')[] => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = new Set<number>([1, totalPages, current]);
  [current - 1, current + 1].forEach((page) => {
    if (page > 1 && page < totalPages) pages.add(page);
  });
  if (current <= 3) [2, 3, 4].forEach((page) => pages.add(page));
  if (current >= totalPages - 2) [totalPages - 3, totalPages - 2, totalPages - 1].forEach((page) => pages.add(page));

  const ordered = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const result: (number | 'gap')[] = [];
  ordered.forEach((page, index) => {
    if (index > 0 && page - ordered[index - 1] > 1) result.push('gap');
    result.push(page);
  });
  return result;
};

export function TablePaginationBar({
  page,
  pageSize,
  total,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
}: TablePaginationBarProps) {
  const theme = useTheme();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const firstItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, total);
  const pages = buildPages(currentPage, totalPages);

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{ px: 2.5, py: 1.5, alignItems: 'center', justifyContent: 'space-between' }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Itens por página
        </Typography>
        <Select
          size="small"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          sx={{ '& .MuiSelect-select': { py: 0.5 }, borderRadius: 2 }}
        >
          {pageSizeOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          {total === 0 ? 'Nenhum item' : `${firstItem}–${lastItem} de ${total}`}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
        <IconButton
          size="small"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          aria-label="Primeira página"
        >
          <FirstPageIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>

        {pages.map((item, index) =>
          item === 'gap' ? (
            <Typography key={`gap-${index}`} variant="caption" color="text.secondary" sx={{ px: 0.5 }}>
              …
            </Typography>
          ) : (
            <Box
              key={item}
              component="button"
              type="button"
              onClick={() => onPageChange(item)}
              sx={{
                minWidth: 32,
                height: 32,
                px: 1,
                border: `1px solid ${item === currentPage ? theme.palette.primary.main : 'transparent'}`,
                borderRadius: 2,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: item === currentPage ? 700 : 500,
                bgcolor: item === currentPage ? `${theme.palette.primary.main}14` : 'transparent',
                color: item === currentPage ? theme.palette.primary.main : theme.palette.text.secondary,
                '&:hover': { bgcolor: theme.palette.action.hover },
              }}
            >
              {item}
            </Box>
          ),
        )}

        <IconButton
          size="small"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Próxima página"
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label="Última página"
        >
          <LastPageIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Stack>
  );
}
