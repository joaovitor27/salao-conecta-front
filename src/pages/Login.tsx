import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import ScissorsIcon from '@mui/icons-material/ContentCut';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import ShieldIcon from '@mui/icons-material/Security';
import { Button } from '@/components/ui/Button.tsx';
import { Header } from '@/components/Header.tsx';

import UsersIcon from '@mui/icons-material/People';
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const StyledCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 400,
  boxShadow: theme.palette.custom.shadows.elegant,
  border: 0,
  background: theme.palette.custom.gradients.card,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
}));

export const Login = () => {
  const [userType, setUserType] = useState<'client' | 'salon'>('client');
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  const theme = useTheme();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setUserType(newValue as 'client' | 'salon');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(to bottom right, ${theme.palette.background.default}, ${theme.palette.background.default}, ${theme.palette.secondary.light})`,
      }}
    >
      <Header variant="auth" />
      <Box
        sx={{
          maxWidth: 1280,
          margin: '0 auto',
          px: 2,
          py: 12,
        }}
      >
        <Grid container alignItems="center">
          <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, px: { xs: 4, sm: 6, lg: 12 }, mb: { xs: 8, lg: 0 } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontFamily: theme.typography.h1.fontFamily,
                    color: theme.palette.primary.main,
                  }}
                >
                  Conecte-se com a beleza
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.custom.muted.foreground,
                    fontFamily: theme.typography.fontFamily,
                  }}
                >
                  A plataforma completa que une salões e clientes em uma experiência única
                </Typography>
              </Box>

              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: theme.palette.custom.gradients.beauty,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ScissorsIcon sx={{ color: 'white' }} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold">
                      Para Salões
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.custom.muted.foreground }}>
                      Gerencie agendamentos e clientes
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: theme.palette.custom.gradients.hero,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SmartphoneIcon sx={{ color: 'white' }} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold">
                      Para Clientes
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.custom.muted.foreground }}>
                      Agende serviços com facilidade
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: theme.palette.custom.gradients.secondary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ShieldIcon sx={{ color: 'white' }} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold">
                      Seguro
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.custom.muted.foreground }}>
                      Dados protegidos e seguros
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: theme.palette.custom.accent[200],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <UsersIcon sx={{ color: theme.palette.custom.accent.main }} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold">
                      Conectado
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.custom.muted.foreground }}>
                      Una profissionais e clientes
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
            <StyledCard>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  Bem-vindo de volta
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Entre na sua conta para continuar
                </Typography>
              </Box>

              <Tabs
                value={userType}
                onChange={handleTabChange}
                aria-label="login tabs"
                sx={{
                  mb: 4,
                  '& .MuiTabs-flexContainer': { gap: 1 },
                  '& .MuiTabs-indicator': { display: 'none' },
                  backgroundColor: theme.palette.custom.gray[100],
                  borderRadius: 8,
                }}
              >
                <Tab
                  label="Cliente"
                  value="client"
                  sx={{
                    width: '50%',
                    bgcolor: userType === 'client' ? theme.palette.custom.gray[200] : 'transparent',
                    borderRadius: 8,
                    '&.Mui-selected': { color: theme.palette.primary.main, fontWeight: 'bold' },
                  }}
                />
                <Tab
                  label="Salão"
                  value="salon"
                  sx={{
                    width: '50%',
                    bgcolor: userType === 'salon' ? theme.palette.custom.gray[200] : 'transparent',
                    borderRadius: 8,
                    '&.Mui-selected': { color: theme.palette.primary.main, fontWeight: 'bold' },
                  }}
                />
              </Tabs>
              {userType === 'salon' ? (
                <Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField id="salon-email" label="E-mail do Salão" type="email" placeholder="salao@email.com" fullWidth />
                    <FormControl variant="outlined">
                      <InputLabel htmlFor="outlined-adornment-password">Senha</InputLabel>
                      <OutlinedInput
                        id="outlined-adornment-password"
                        type={showPassword ? 'text' : 'password'}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              onMouseUp={handleMouseUpPassword}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Password"
                      />
                    </FormControl>
                    <Button variant="hero" size="lg">
                      Entrar como Salão
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField id="client-email" label="E-mail" type="email" placeholder="seu@email.com" fullWidth />
                    <FormControl variant="outlined">
                      <InputLabel htmlFor="outlined-adornment-password">Senha</InputLabel>
                      <OutlinedInput
                        id="outlined-adornment-password"
                        type={showPassword ? 'text' : 'password'}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              onMouseUp={handleMouseUpPassword}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Password"
                      />
                    </FormControl>
                    <Button variant="hero" size="lg">
                      Entrar como Cliente
                    </Button>
                  </Box>
                </Box>
              )}

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button variant="link" size="sm" fullWidth onClick={() => {}}>
                  Esqueceu sua senha?
                </Button>
              </Box>

              <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Typography variant="body1" sx={{ color: theme.palette.custom.muted.foreground }}>
                  Ainda não tem uma conta?
                </Typography>
                <Button variant="outline" fullWidth size="lg" onClick={() => {}}>
                  Criar conta gratuita
                </Button>
              </Box>
            </StyledCard>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
