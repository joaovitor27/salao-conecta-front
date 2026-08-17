import { type FormEvent, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import ScissorsIcon from '@mui/icons-material/ContentCut';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import ShieldIcon from '@mui/icons-material/Security';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/Header';

import UsersIcon from '@mui/icons-material/People';
import { PasswordField } from '@/components/PasswordField';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.tsx';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/app/dashboard');
    } finally {
      setLoading(false);
    }
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
                  Seja Bem-vindo
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Entre na sua conta para continuar
                </Typography>
              </Box>
              <Box>
                <form onSubmit={handleLogin}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      id="salon-email"
                      label="E-mail"
                      type="email"
                      placeholder="salao@email.com"
                      fullWidth
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <PasswordField password={password} setPassword={setPassword} />
                    <Button type="submit" variant="hero" size="lg" disabled={loading}>
                      {loading ? 'Entrando...' : 'Entrar como Salão'}
                    </Button>
                  </Box>
                </form>
              </Box>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button variant="link" size="sm" fullWidth onClick={() => {}}>
                  Esqueceu sua senha?
                </Button>
              </Box>

              {/*<Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>*/}
              {/*  <Typography variant="caption">Ainda não tem uma conta?</Typography>*/}
              {/*  <Button variant="outline" fullWidth size="lg" onClick={() => {}}>*/}
              {/*    Criar conta gratuita*/}
              {/*  </Button>*/}
              {/*</Box>*/}
            </StyledCard>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
