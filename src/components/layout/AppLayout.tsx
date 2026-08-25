import { useState } from 'react';
import { AppBar, Box, IconButton, Toolbar, Typography, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Sidebar variant="temporary" mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            display: { xs: 'flex', md: 'none' },
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Toolbar sx={{ gap: 1.5 }}>
            <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
              <MenuIcon />
            </IconButton>
            <ContentCutIcon color="primary" />
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              Salão Conecta
            </Typography>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', p: { xs: 2, sm: 3, md: 6 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
