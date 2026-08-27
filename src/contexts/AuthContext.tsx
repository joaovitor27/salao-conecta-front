// src/contexts/AuthContext.tsx
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

// Tipagem dos dados do Usuário (Deve espelhar o retorno do seu Django)
interface SalonOption {
  slug: string;
  name: string;
  role: 'owner' | 'manager' | 'financial' | 'receptionist';
  employee_id: string | null;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  salons: SalonOption[];
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isLoading: boolean;
  currentTenant: string | null;
  changeTenant: (slug: string) => void;
  currentRole: SalonOption['role'] | null;
  currentEmployeeId: string | null;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTenant, setCurrentTenant] = useState<string | null>(localStorage.getItem('@SalaoConecta:tenant'));

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('@SalaoConecta:token');

      if (token) {
        try {
          const response = await api.get('/v1/auth/me');
          const userData = response.data;
          setUser(userData);
          
          if (!localStorage.getItem('@SalaoConecta:tenant') && userData.salons?.length > 0) {
            const defaultTenant = userData.salons[0].slug;
            localStorage.setItem('@SalaoConecta:tenant', defaultTenant);
            setCurrentTenant(defaultTenant);
          }
        } catch (error) {
          localStorage.removeItem('@SalaoConecta:token');
          localStorage.removeItem('@SalaoConecta:refreshToken');
          localStorage.removeItem('@SalaoConecta:tenant');
        }
      }
      setIsLoading(false);
    }

    void loadUser();
  }, []);

  async function signIn(email: string, password: string) {
    try {
      const response = await api.post('/v1/auth/login', { email, password });
      const { access, refresh } = response.data;
      localStorage.setItem('@SalaoConecta:token', access);
      localStorage.setItem('@SalaoConecta:refreshToken', refresh);

      const userResponse = await api.get('/v1/auth/me');
      const userData = userResponse.data;
      setUser(userData);
      
      if (userData.salons?.length > 0) {
        const defaultTenant = userData.salons[0].slug;
        localStorage.setItem('@SalaoConecta:tenant', defaultTenant);
        setCurrentTenant(defaultTenant);
      }
      
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      toast.error('Credenciais inválidas. Tente novamente.');
      throw error;
    }
  }

  function changeTenant(slug: string) {
    localStorage.setItem('@SalaoConecta:tenant', slug);
    setCurrentTenant(slug);
    // Recarrega a página para resetar os estados e queries com o novo tenant
    window.location.reload();
  }

  function signOut() {
    api.post('/v1/auth/logout', { refresh_token: localStorage.getItem('@SalaoConecta:refreshToken') }).finally(() => {
      localStorage.clear();
      setUser(null);
      setCurrentTenant(null);
      window.location.href = '/login';
    });
  }
  const currentSalonInfo = user?.salons?.find(s => s.slug === currentTenant);
  const currentRole = currentSalonInfo?.role || null;
  const currentEmployeeId = currentSalonInfo?.employee_id || null;

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      signIn, 
      signOut, 
      isLoading, 
      currentTenant, 
      changeTenant,
      currentRole,
      currentEmployeeId
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
