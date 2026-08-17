import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', p: { xs: 2, sm: 4, md: 6 } }}>
        <Outlet />
      </Box>
    </Box>
  );
}
