import { type ReactNode, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { createThemeFromPalette } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { BrandingProvider, useBranding } from './contexts/BrandingContext';
import { Toaster } from 'react-hot-toast';

import { PrivateRoute } from './routes/PrivateRoute';
// Páginas
import { Login } from './pages/Login';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard.tsx';
import Agenda from '@/pages/Agenda.tsx';
import SalonProfile from '@/pages/SalonProfile.tsx';
import Employees from '@/pages/Employees.tsx';
import Customers from '@/pages/Customers.tsx';
import { PublicRoute } from '@/routes/PublicRoute.tsx';
import { AppLayout } from '@/components/layout/AppLayout.tsx';

/** Monta o tema do MUI a partir da identidade visual do salão ativo. */
function BrandedTheme({ children }: { children: ReactNode }) {
  const { palette } = useBranding();
  const theme = useMemo(() => createThemeFromPalette(palette), [palette]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrandingProvider>
        <BrandedTheme>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <BrowserRouter basename={'/'}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                {/*<Route path="/register" element={<Register />} />*/}
              </Route>
              <Route element={<PrivateRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/app/dashboard" element={<Dashboard />} />
                  <Route path="/app/agenda" element={<Agenda />} />
                  <Route path="/app/funcionarios" element={<Employees />} />
                  <Route path="/app/clientes" element={<Customers />} />
                  <Route path="/app/meu-salao" element={<SalonProfile />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </BrandedTheme>
      </BrandingProvider>
    </AuthProvider>
  );
}
