import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

import { PrivateRoute } from './routes/PrivateRoute';
// Páginas
import { Login } from './pages/Login';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard.tsx';
import { PublicRoute } from '@/routes/PublicRoute.tsx';
import { AppLayout } from '@/components/layout/AppLayout.tsx';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <AuthProvider>
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
                <Route path="/app/agenda" element={<div>Agenda do Cliente/Profissional</div>} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
