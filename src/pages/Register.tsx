import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { styled, useTheme } from '@mui/material/styles';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Header } from '@/components/Header.tsx';

import UserIcon from '@mui/icons-material/Person';
import BuildingIcon from '@mui/icons-material/Business';
import ScissorsIcon from '@mui/icons-material/ContentCut';
import MapPinIcon from '@mui/icons-material/Place';
import PhoneIcon from '@mui/icons-material/Phone';
import MailIcon from '@mui/icons-material/Email';
import { PasswordField } from '@/components/PasswordField.tsx';

const RegisterContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(to bottom right, ${theme.palette.background.default}, ${theme.palette.custom.muted.DEFAULT}4D, ${theme.palette.secondary.light}33)`,
}));

const Register = () => {
  const [userType, setUserType] = useState<'client' | 'salon'>('client');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const theme = useTheme();

  useEffect(() => {
    setPassword('');
    setConfirmPassword('');
  }, [userType]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setUserType(newValue as 'client' | 'salon');
  };

  return (
    <RegisterContainer>
      <Header variant="auth" />

      <Box sx={{ maxWidth: 1280, mx: 'auto', px: 2, py: 6 }}>
        <Box sx={{ maxWidth: 700, mx: 'auto' }}>
          {/* Seção Hero */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'primary.main', mb: 1 }}>
              Crie sua Conta
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.custom.muted.foreground }}>
              Junte-se à nossa comunidade e transforme sua experiência com beleza
            </Typography>
          </Box>

          {/* Formulário de Registro */}
          <Card sx={{ boxShadow: theme.palette.custom.shadows.elegant }}>
            <CardHeader>
              <CardTitle sx={{ textAlign: 'center' }}>Cadastro</CardTitle>
              <CardDescription sx={{ textAlign: 'center' }}>Selecione o tipo de conta que deseja criar</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={userType}
                onChange={handleTabChange}
                centered
                sx={{
                  mb: 4,
                  '& .MuiTabs-flexContainer': { gap: 1 },
                  '& .MuiTabs-indicator': { display: 'none' },
                  backgroundColor: theme.palette.custom.gray[100],
                  borderRadius: 8,
                }}
              >
                <Tab
                  value="client"
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <UserIcon />
                      Cliente
                    </Box>
                  }
                  sx={{
                    width: '50%',
                    bgcolor: userType === 'client' ? theme.palette.custom.gray[200] : 'transparent',
                    borderRadius: 8,
                    '&.Mui-selected': { color: theme.palette.primary.main, fontWeight: 'bold' },
                  }}
                />
                <Tab
                  value="salon"
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BuildingIcon />
                      Salão/Profissional
                    </Box>
                  }
                  sx={{
                    width: '50%',
                    bgcolor: userType !== 'client' ? theme.palette.custom.gray[200] : 'transparent',
                    borderRadius: 8,
                    '&.Mui-selected': { color: theme.palette.primary.main, fontWeight: 'bold' },
                  }}
                />
              </Tabs>

              {/* Formulário Cliente */}
              {userType === 'client' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Nome"
                        id="firstName"
                        placeholder="Seu nome"
                        fullWidth
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <UserIcon sx={{ color: theme.palette.custom.muted.foreground }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Sobrenome"
                        id="lastName"
                        placeholder="Seu sobrenome"
                        fullWidth
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <UserIcon sx={{ color: theme.palette.custom.muted.foreground }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    label="E-mail"
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <MailIcon sx={{ color: theme.palette.custom.muted.foreground }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <TextField
                    label="Telefone"
                    id="phone"
                    placeholder="(11) 99999-9999"
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: theme.palette.custom.muted.foreground }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <PasswordField password={password} setPassword={setPassword} label={'Senha'} placeholder={'Sua senha'} />
                  <PasswordField
                    password={confirmPassword}
                    setPassword={setConfirmPassword}
                    label={'Confirmar Senha'}
                    placeholder={'Confirme sua senha'}
                  />

                  <FormControlLabel
                    control={<Checkbox />}
                    label={
                      <Typography variant="body2">
                        Aceito os{' '}
                        <Link href="#" underline="hover" sx={{ color: 'primary.main', cursor: 'pointer' }}>
                          termos de uso
                        </Link>{' '}
                        e{' '}
                        <Link href="#" underline="hover" sx={{ color: 'primary.main', cursor: 'pointer' }}>
                          política de privacidade
                        </Link>
                      </Typography>
                    }
                  />

                  <Button variant="beauty" size="lg" sx={{ width: '100%' }}>
                    Criar Conta de Cliente
                  </Button>
                </Box>
              )}

              {/* Formulário Salão/Profissional */}
              {userType === 'salon' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Nome do Salão/Negócio"
                    id="businessName"
                    placeholder="Nome do seu salão"
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <BuildingIcon sx={{ color: theme.palette.custom.muted.foreground }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Nome do Responsável"
                        id="ownerName"
                        placeholder="Seu nome completo"
                        fullWidth
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <UserIcon sx={{ color: theme.palette.custom.muted.foreground }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel id="business-type-label">Tipo de Negócio</InputLabel>
                        <Select labelId="business-type-label" id="businessType" defaultValue="" label="Tipo de Negócio">
                          <MenuItem value="salon">Salão de Beleza</MenuItem>
                          <MenuItem value="barbershop">Barbearia</MenuItem>
                          <MenuItem value="spa">Spa</MenuItem>
                          <MenuItem value="clinic">Clínica Estética</MenuItem>
                          <MenuItem value="freelancer">Profissional Autônomo</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <TextField
                    label="E-mail Comercial"
                    id="businessEmail"
                    type="email"
                    placeholder="contato@salao.com"
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <MailIcon sx={{ color: theme.palette.custom.muted.foreground }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Telefone Comercial"
                        id="businessPhone"
                        placeholder="(11) 3333-3333"
                        fullWidth
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon sx={{ color: theme.palette.custom.muted.foreground }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="WhatsApp"
                        id="whatsapp"
                        placeholder="(11) 99999-9999"
                        fullWidth
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon sx={{ color: theme.palette.custom.muted.foreground }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    label="Endereço Completo"
                    id="address"
                    placeholder="Rua, número, bairro, cidade"
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <MapPinIcon sx={{ color: theme.palette.custom.muted.foreground }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <TextField
                    label="Principais Serviços"
                    id="services"
                    placeholder="Ex: Corte, coloração, manicure..."
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <ScissorsIcon sx={{ color: theme.palette.custom.muted.foreground }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <PasswordField password={password} setPassword={setPassword} label={'Senha'} placeholder={'Sua senha'} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <PasswordField
                        password={confirmPassword}
                        setPassword={setConfirmPassword}
                        label={'Confirmar Senha'}
                        placeholder={'Confirme sua senha'}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={<Checkbox id="businessTerms" />}
                      label={
                        <Typography variant="body2">
                          Aceito os{' '}
                          <Link href="#" underline="hover" sx={{ color: 'primary.main', cursor: 'pointer' }}>
                            termos comerciais
                          </Link>{' '}
                          e{' '}
                          <Link href="#" underline="hover" sx={{ color: 'primary.main', cursor: 'pointer' }}>
                            política de privacidade
                          </Link>
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      control={<Checkbox id="marketing" />}
                      label={<Typography variant="body2">Aceito receber comunicações de marketing e promoções</Typography>}
                    />
                  </Box>

                  <Button variant="beauty" size="lg" sx={{ width: '100%' }}>
                    Criar Conta Profissional
                  </Button>
                </Box>
              )}
            </CardContent>

            <Box sx={{ mt: 3, textAlign: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ color: theme.palette.custom.muted.foreground }}>
                Já tem uma conta?
                <Link href="/login" underline="hover" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                  Faça login
                </Link>
              </Typography>
            </Box>
          </Card>
        </Box>
      </Box>
    </RegisterContainer>
  );
};

export default Register;
