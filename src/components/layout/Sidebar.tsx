import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, useTheme } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Ícones
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ContentCutIcon from '@mui/icons-material/ContentCut';

export function Sidebar() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/app/dashboard' },
    { text: 'Agenda', icon: <CalendarMonthIcon />, path: '/app/agenda' },
    { text: 'Clientes', icon: <PeopleIcon />, path: '/app/clientes' },
    { text: 'Serviços', icon: <ContentCutIcon />, path: '/app/servicos' },
    { text: 'Meu Salão', icon: <StorefrontIcon />, path: '/app/meu-salao' },
    { text: 'Configurações', icon: <SettingsIcon />, path: '/app/configuracoes' },
  ];

  return (
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        height: '100vh',
        bgcolor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Logo Area */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: theme.palette.custom.gradients.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <ContentCutIcon />
        </Box>
        <Typography variant="h6" fontWeight="bold" color="primary.main">
          Salão Conecta
        </Typography>
      </Box>

      <Divider sx={{ mx: 2, mb: 2 }} />

      {/* Menu Links */}
      <List sx={{ px: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? `${theme.palette.primary.main}15` : 'transparent',
                  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  '&:hover': {
                    bgcolor: isActive ? `${theme.palette.primary.main}20` : theme.palette.action.hover,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} slotProps={{ primary: { fontWeight: isActive ? 600 : 500 } }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User Profile & Logout */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, px: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: theme.palette.custom.gray[200],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: theme.palette.primary.main,
            }}
          >
            {user?.first_name?.charAt(0).toUpperCase() || 'U'}
          </Box>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight="bold" noWrap>
              {user?.first_name || 'Usuário'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <ListItemButton
          onClick={signOut}
          sx={{ borderRadius: 2, color: theme.palette.error.main, '&:hover': { bgcolor: `${theme.palette.error.main}10` } }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Sair da Conta" slotProps={{ primary: { fontWeight: 500 } }} />
        </ListItemButton>
      </Box>
    </Box>
  );
}
