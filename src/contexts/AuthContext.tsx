// src/contexts/AuthContext.tsx
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

// Tipagem dos dados do Usuário (Deve espelhar o retorno do seu Django)
interface User {
  id: string;
  first_name: string;
  email: string;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('@SalaoConecta:token');

      if (token) {
        try {
          const response = await api.get('/auth/me/');
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('@SalaoConecta:token');
          localStorage.removeItem('@SalaoConecta:refreshToken');
        }
      }
      setIsLoading(false);
    }

    void loadUser();
  }, []);

  async function signIn(email: string, password: string) {
    try {
      const response = await api.post('/auth/login/', { email, password });
      const { access, refresh } = response.data;
      localStorage.setItem('@SalaoConecta:token', access);
      localStorage.setItem('@SalaoConecta:refreshToken', refresh);

      const userResponse = await api.get('/auth/me/');
      setUser(userResponse.data);
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      toast.error('Credenciais inválidas. Tente novamente.');
      throw error;
    }
  }

  function signOut() {
    api.post('/auth/logout/', { refresh_token: localStorage.getItem('@SalaoConecta:refreshToken') }).finally(() => {
      localStorage.clear();
      setUser(null);
      window.location.href = '/login';
    });
  }
  return <AuthContext.Provider value={{ user, isAuthenticated: !!user, signIn, signOut, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
