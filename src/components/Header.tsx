// src/components/MuiHeader.tsx
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { useTheme } from '@mui/material/styles';

import BellIcon from '@mui/icons-material/Notifications';
import UserIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  variant?: 'b2b' | 'b2c' | 'auth' | 'home';
  showNotifications?: boolean;
  userName?: string;
}

export const Header = ({ variant = 'b2c', showNotifications = false, userName }: HeaderProps) => {
  const theme = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const isB2B = variant === 'b2b';
  const isB2C = variant === 'b2c';
  const isHome = variant === 'home';

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${theme.palette.custom.gray[200]}`,
        boxShadow: theme.palette.custom.shadows.card,
        zIndex: theme.zIndex.appBar,
      }}
    >
      <Toolbar sx={{ height: 'auto', margin: 'auto', px: 2, maxWidth: 1280, width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Link href="/" underline="none" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/*<Box component="img" src={'logo'} alt="Salão Conecta" sx={{ height: 32, width: 32 }} />*/}
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: theme.palette.primary.main,
                  fontFamily: theme.typography.h1.fontFamily,
                }}
              >
                Salão Conecta
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.75rem',
                  color: theme.palette.custom.muted.foreground,
                  fontFamily: theme.typography.fontFamily,
                }}
              >
                A beleza na palma da sua mão
              </Typography>
            </Box>
          </Link>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
          {isB2B && (
            <React.Fragment>
              <Box
                component="nav"
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Link href="#" underline="hover" sx={{ color: theme.palette.text.primary }}>
                  Dashboard
                </Link>
                <Link href="#" underline="hover" sx={{ color: theme.palette.text.primary }}>
                  Agendamentos
                </Link>
                <Link href="#" underline="hover" sx={{ color: theme.palette.text.primary }}>
                  Clientes
                </Link>
                <Link href="#" underline="hover" sx={{ color: theme.palette.text.primary }}>
                  Relatórios
                </Link>
                <Button variant="outline" onClick={() => signOut()}>
                  Sair
                </Button>
              </Box>
              {showNotifications && (
                <Button variant="ghost" size="icon">
                  <BellIcon sx={{ fontSize: 16 }} />
                </Button>
              )}
              {userName && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {userName}
                  </Typography>
                  <Button variant="ghost" size="icon">
                    <UserIcon sx={{ fontSize: 16 }} />
                  </Button>
                </Box>
              )}
            </React.Fragment>
          )}

          {isB2C && (
            <React.Fragment>
              <Box
                component="nav"
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Link href="#" underline="hover" sx={{ color: theme.palette.text.primary }}>
                  Encontrar Salões
                </Link>
                <Link href="#" underline="hover" sx={{ color: theme.palette.text.primary }}>
                  Meus Agendamentos
                </Link>
              </Box>
              <Button variant="outline">Entrar</Button>
              <Button variant="hero" size="sm">
                Cadastrar
              </Button>
            </React.Fragment>
          )}

          {isHome && (
            <React.Fragment>
              <Button variant="hero" size="sm" onClick={() => navigate('/login')}>
                Entrar
              </Button>
            </React.Fragment>
          )}

          <Button variant="ghost" size="icon" sx={{ display: { xs: 'flex', md: 'none' } }}>
            <MenuIcon sx={{ fontSize: 16 }} />
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
