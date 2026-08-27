import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, useTheme, Select, MenuItem, FormControl, Drawer, IconButton } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SalonLogo } from '@/components/branding/SalonLogo';

// Ícones
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from '@mui/icons-material/Badge';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import CloseIcon from '@mui/icons-material/Close';

export const SIDEBAR_WIDTH = 280;

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
  variant?: 'permanent' | 'temporary';
}

export function Sidebar({ mobileOpen = false, onClose, variant = 'permanent' }: SidebarProps) {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, currentTenant, changeTenant } = useAuth();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/app/dashboard' },
    { text: 'Agenda', icon: <CalendarMonthIcon />, path: '/app/agenda' },
    { text: 'Clientes', icon: <PeopleIcon />, path: '/app/clientes' },
    { text: 'Funcionários', icon: <BadgeIcon />, path: '/app/funcionarios' },
    { text: 'Serviços', icon: <ContentCutIcon />, path: '/app/servicos' },
    { text: 'Meu Salão', icon: <StorefrontIcon />, path: '/app/meu-salao' },
    { text: 'Configurações', icon: <SettingsIcon />, path: '/app/configuracoes' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    if (variant === 'temporary') onClose?.();
  };

  const content = (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        height: '100%',
        bgcolor: theme.palette.background.paper,
        borderRight: { xs: 'none', md: `1px solid ${theme.palette.divider}` },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Identidade visual do salão */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <SalonLogo size={40} showName />
        </Box>
        {variant === 'temporary' && (
          <IconButton onClick={onClose} size="small" aria-label="Fechar menu">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {user?.salons && user.salons.length > 1 && (
        <Box sx={{ px: 2, pb: 2 }}>
          <FormControl fullWidth size="small">
            <Select
              value={currentTenant || ''}
              onChange={(e) => changeTenant(e.target.value as string)}
              sx={{ 
                borderRadius: 2, 
                bgcolor: theme.palette.custom.gray[50],
                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider }
              }}
            >
              {user.salons.map((salon) => (
                <MenuItem key={salon.slug} value={salon.slug}>
                  {salon.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      <Divider sx={{ mx: 2, mb: 2 }} />

      {/* Menu Links */}
      <List sx={{ px: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
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

  if (variant === 'temporary') {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'block' },
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {content}
    </Box>
  );
}
