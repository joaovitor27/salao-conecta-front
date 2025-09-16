import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';

import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';

import StarIcon from '@mui/icons-material/Star';
import ArrowRightIcon from '@mui/icons-material/ArrowRightAlt';
import HeartIcon from '@mui/icons-material/Favorite';
import UsersIcon from '@mui/icons-material/People';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import SparklesIcon from '@mui/icons-material/AutoAwesome';
import AwardIcon from '@mui/icons-material/EmojiEvents';
import heroImage from '@/assets/hero-salon.jpg';

export default function Home() {
  const theme = useTheme();

  // const sponsors = [
  //   {
  //     name: "L'Oréal Professionnel",
  //     category: 'Coloração Premium',
  //     description: 'Produtos profissionais para coloração e tratamento capilar',
  //     image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=300&h=200&fit=crop',
  //     discount: '20% OFF',
  //   },
  //   {
  //     name: 'Wella',
  //     category: 'Styling & Finish',
  //     description: 'Linha completa para finalização e styling profissional',
  //     image: 'https://images.unsplash.com/photo-1595475038665-8ad0a11d772f?w=300&h=200&fit=crop',
  //     discount: '15% OFF',
  //   },
  //   {
  //     name: 'OPI',
  //     category: 'Esmaltes Premium',
  //     description: 'Esmaltes de longa duração com cores exclusivas',
  //     image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=200&fit=crop',
  //     discount: '25% OFF',
  //   },
  //   {
  //     name: 'Keune',
  //     category: 'Tratamentos',
  //     description: 'Tratamentos capilares intensivos e reparadores',
  //     image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&h=200&fit=crop',
  //     discount: '30% OFF',
  //   },
  // ];

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Cliente Frequente',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face',
      rating: 5,
      comment: 'Simplesmente perfeito! Consegui agendar meu horário rapidamente e o salão era exatamente como mostrado no app. Super recomendo!',
      salon: 'Espaço Elegance',
    },
    {
      name: 'Ana Costa',
      role: 'Proprietária de Salão',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
      rating: 5,
      comment: 'O Salão Conecta revolucionou meu negócio! Aumentei 40% nos agendamentos e a gestão ficou muito mais fácil.',
      salon: 'Studio Ana Costa',
    },
    {
      name: 'Julia Santos',
      role: 'Cliente Premium',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face',
      rating: 5,
      comment: 'Amo a facilidade de encontrar horários disponíveis e poder escolher meu profissional favorito. O app é intuitivo e lindo!',
      salon: 'Bella Vista Salon',
    },
    {
      name: 'Carla Mendes',
      role: 'Esteticista',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&h=60&fit=crop&crop=face',
      rating: 5,
      comment: 'Como profissional autônoma, o sistema me ajudou a organizar minha agenda e conquistar novos clientes. Excelente plataforma!',
      salon: 'Carla Estética',
    },
  ];

  const features = [
    {
      icon: CalendarIcon,
      title: 'Agendamento Inteligente',
      description: 'Sistema automatizado que otimiza horários e reduz conflitos',
    },
    {
      icon: UsersIcon,
      title: 'Gestão de Clientes',
      description: 'Histórico completo, preferências e fidelização automática',
    },
    {
      icon: SparklesIcon,
      title: 'Experiência Premium',
      description: 'Interface elegante que encanta clientes e profissionais',
    },
    {
      icon: AwardIcon,
      title: 'Resultados Comprovados',
      description: 'Aumento médio de 35% no faturamento dos parceiros',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.paper' }}>
      <Header />
      <Box component="section" sx={{ position: 'relative', py: 10, overflow: 'hidden' }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to bottom right, ${theme.palette.primary.main}10, rgba(255, 255, 255, 0), ${theme.palette.primary.main}10)`,
          }}
        />
        <Box sx={{ maxWidth: 1280, margin: '0 auto', px: 2, position: 'relative' }}>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box>
                <Chip variant="secondary" label="✨ Plataforma #1 em Beleza" />
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', lg: '3.75rem' },
                    fontWeight: 'bold',
                    color: theme.palette.primary.main,
                    lineHeight: '1.2',
                    mb: 3,
                  }}
                >
                  A beleza do seu negócio, na palma da sua mão
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '1.25rem',
                    color: theme.palette.custom.muted.foreground,
                    mb: 4,
                  }}
                >
                  Conecte-se com os melhores salões de beleza ou transforme seu negócio com nossa plataforma completa de gestão e agendamentos.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4 }}>
                  <Link to="/register" style={{ textDecoration: 'none' }}>
                    <Button size="lg" fullWidth={true}>
                      Começar Agora
                      <ArrowRightIcon sx={{ ml: 1, width: 16, height: 16 }} />
                    </Button>
                  </Link>
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <Button variant="outline" size="lg" fullWidth={true}>
                      Fazer Login
                    </Button>
                  </Link>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.875rem', color: theme.palette.custom.muted.foreground }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <UsersIcon sx={{ width: 16, height: 16 }} />
                    <span>+50.000 usuários</span>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HeartIcon sx={{ width: 16, height: 16 }} />
                    <span>+2.000 salões</span>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon sx={{ width: 16, height: 16 }} />
                    <span>4.9/5 avaliação</span>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: theme.palette.custom.gradients.beauty,
                    opacity: 0.2,
                    borderRadius: '1.5rem',
                    filter: 'blur(3rem)',
                  }}
                />
                <Box
                  component="img"
                  src={heroImage}
                  alt="Salão de beleza moderno"
                  sx={{
                    width: '100%',
                    height: 500,
                    objectFit: 'cover',
                    borderRadius: '1.5rem',
                    boxShadow: theme.palette.custom.shadows.elegant,
                    position: 'relative',
                    zIndex: 1,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Seção de Features */}
      <Box component="section" sx={{ py: 10, bgcolor: theme.palette.custom.muted.DEFAULT }}>
        <Box sx={{ maxWidth: 1280, margin: '0 auto', px: 2, textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', lg: '2.5rem' }, fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
            Por que escolher o Salão Conecta?
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.custom.muted.foreground, maxWidth: 800, mx: 'auto', mb: 8 }}>
            Descubra como nossa plataforma está transformando a experiência no mundo da beleza
          </Typography>

          <Grid container spacing={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, lg: 3, md: 6 }} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '1rem',
                        background: theme.palette.custom.gradients.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <feature.icon sx={{ width: 32, height: 32, color: 'white' }} />
                    </Box>
                    <CardTitle sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Typography sx={{ color: theme.palette.custom.muted.foreground }}>{feature.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/*/!* Seção de Patrocinadores *!/*/}
      {/*<Box component="section" sx={{ py: 10 }}>*/}
      {/*  <Box sx={{ maxWidth: 1280, margin: '0 auto', px: 2, textAlign: 'center' }}>*/}
      {/*    <Typography variant="h2" sx={{ fontSize: { xs: '2rem', lg: '2.5rem' }, fontWeight: 'bold', color: 'primary.main', mb: 2 }}>*/}
      {/*      Produtos Patrocinadores*/}
      {/*    </Typography>*/}
      {/*    <Typography variant="body1" sx={{ fontSize: '1.125rem', color: theme.palette.custom.muted.foreground, mb: 8 }}>*/}
      {/*      Parceiros exclusivos com ofertas especiais para nossa comunidade*/}
      {/*    </Typography>*/}

      {/*    <Grid container spacing={4} sx={{ display: 'flex', justifyContent: 'center' }}>*/}
      {/*      {sponsors.map((sponsor, index) => (*/}
      {/*        <Grid size={{ xs: 12, lg: 3, md: 6 }} key={index}>*/}
      {/*          <Card sx={{ overflow: 'hidden', transition: 'all 0.3s', '&:hover': { boxShadow: theme.palette.custom.shadows.elegant } }}>*/}
      {/*            <Box sx={{ position: 'relative' }}>*/}
      {/*              <Box*/}
      {/*                component="img"*/}
      {/*                src={sponsor.image}*/}
      {/*                alt={sponsor.name}*/}
      {/*                sx={{*/}
      {/*                  width: '100%',*/}
      {/*                  height: 192,*/}
      {/*                  objectFit: 'cover',*/}
      {/*                  transition: 'transform 0.3s',*/}
      {/*                  '&:hover': { transform: 'scale(1.05)' },*/}
      {/*                }}*/}
      {/*              />*/}
      {/*              <Chip variant="outline" sx={{ position: 'absolute', top: 12, right: 12 }} label={sponsor.discount} />*/}
      {/*            </Box>*/}
      {/*            <Box sx={{ p: 2 }}>*/}
      {/*              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>*/}
      {/*                <CardTitle sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{sponsor.name}</CardTitle>*/}
      {/*                <ShoppingBagIcon sx={{ color: theme.palette.custom.muted.foreground }} />*/}
      {/*              </Box>*/}
      {/*              <CardDescription sx={{ color: theme.palette.primary.main, fontWeight: 'bold', mb: 2 }}>{sponsor.category}</CardDescription>*/}
      {/*              <Typography variant="body2" sx={{ color: theme.palette.custom.muted.foreground, mb: 2 }}>*/}
      {/*                {sponsor.description}*/}
      {/*              </Typography>*/}
      {/*              <Button variant="outline" sx={{ width: '100%' }}>*/}
      {/*                Ver Oferta*/}
      {/*              </Button>*/}
      {/*            </Box>*/}
      {/*          </Card>*/}
      {/*        </Grid>*/}
      {/*      ))}*/}
      {/*    </Grid>*/}
      {/*  </Box>*/}
      {/*</Box>*/}

      {/* Seção de Depoimentos */}
      <Box
        component="section"
        sx={{
          py: 10,
          background: `linear-gradient(to bottom right, ${theme.palette.primary.main}1a, ${theme.palette.custom.beauty.pink}1a)`,
        }}
      >
        <Box sx={{ maxWidth: 1280, margin: '0 auto', px: 2, textAlign: 'center' }}>
          <Typography variant="h2">O que dizem nossos usuários</Typography>
          <Typography variant="body1" sx={{ mb: 8 }}>
            Histórias reais de transformação e sucesso
          </Typography>

          <Grid container spacing={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            {testimonials.map((testimonial, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 3 }} key={index}>
                <Card sx={{ transition: 'all 0.3s', '&:hover': { boxShadow: theme.palette.custom.shadows.beauty } }}>
                  <CardHeader>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        component="img"
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        sx={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <Box>
                        <CardTitle sx={{ fontSize: '1rem', fontWeight: 'bold' }}>{testimonial.name}</CardTitle>
                        <CardDescription sx={{ fontSize: '0.875rem' }}>{testimonial.role}</CardDescription>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} sx={{ color: '#FBC02D', width: 16, height: 16 }} />
                      ))}
                    </Box>
                  </CardHeader>
                  <CardContent>
                    <Typography variant="body2" sx={{ color: theme.palette.custom.muted.foreground, fontStyle: 'italic', mb: 1.5 }}>
                      "{testimonial.comment}"
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                      📍 {testimonial.salon}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* Seção CTA */}
      <Box component="section" sx={{ py: 10, background: theme.palette.custom.gradients.hero, color: 'white' }}>
        <Box sx={{ maxWidth: 1280, margin: '0 auto', px: 2, textAlign: 'center' }}>
          <Typography variant="h1" color={'white'}>
            Pronto para transformar sua experiência?
          </Typography>
          <Typography variant="body1" color={'white'} sx={{ mb: 4 }}>
            Junte-se a milhares de pessoas que já descobriram uma nova forma de cuidar da beleza
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Button size="lg" variant="secondary">
                Criar Conta Gratuita
                <ArrowRightIcon sx={{ ml: 1, width: 16, height: 16 }} />
              </Button>
            </Link>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button
                size="lg"
                variant="outline"
                sx={{
                  border: `1px solid white`,
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'white',
                    color: theme.palette.primary.main,
                  },
                }}
                fullWidth={true}
              >
                Já tenho conta
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: theme.palette.background.paper, borderTop: `1px solid ${theme.palette.divider}`, py: 6 }}>
        <Box sx={{ maxWidth: 1280, margin: '0 auto', px: 2 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Salão Conecta
                </Typography>
              </Box>
              <Typography variant="caption">A plataforma que conecta você ao mundo da beleza com elegância e tecnologia.</Typography>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Para Clientes
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, '& li': { mb: 1 } }}>
                <li>
                  <Link
                    to="#"
                    style={{
                      textDecoration: 'none',
                      color: theme.palette.custom.muted.foreground,
                    }}
                  >
                    Encontrar Salões
                  </Link>
                </li>
                <li>
                  <Link to="#" style={{ textDecoration: 'none', color: theme.palette.custom.muted.foreground }}>
                    Agendar Serviços
                  </Link>
                </li>
                <li>
                  <Link to="#" style={{ textDecoration: 'none', color: theme.palette.custom.muted.foreground }}>
                    Avaliações
                  </Link>
                </li>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Para Salões
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, '& li': { mb: 1 } }}>
                <li>
                  <Link to="#" style={{ textDecoration: 'none', color: theme.palette.custom.muted.foreground }}>
                    Cadastrar Salão
                  </Link>
                </li>
                <li>
                  <Link to="#" style={{ textDecoration: 'none', color: theme.palette.custom.muted.foreground }}>
                    Gerenciar Agenda
                  </Link>
                </li>
                <li>
                  <Link to="#" style={{ textDecoration: 'none', color: theme.palette.custom.muted.foreground }}>
                    Relatórios
                  </Link>
                </li>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Suporte
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, '& li': { mb: 1 } }}>
                <li>
                  <Link to="#" style={{ textDecoration: 'none', color: theme.palette.custom.muted.foreground }}>
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link to="#" style={{ textDecoration: 'none', color: theme.palette.custom.muted.foreground }}>
                    Contato
                  </Link>
                </li>
                <li>
                  <Link to="#" style={{ textDecoration: 'none', color: theme.palette.custom.muted.foreground }}>
                    Termos de Uso
                  </Link>
                </li>
              </Box>
            </Grid>
          </Grid>

          <Box
            sx={{
              borderTop: `1px solid ${theme.palette.divider}`,
              mt: 4,
              pt: 4,
              textAlign: 'center',
              fontSize: '0.875rem',
              color: theme.palette.custom.muted.foreground,
            }}
          >
            <Typography variant="body2">&copy; 2024 Salão Conecta. Todos os direitos reservados.</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
